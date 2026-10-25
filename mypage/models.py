from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.db import models
from django.urls import reverse


class Subject(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="강의 이름")
    code = models.CharField(max_length=20, blank=True, default="", verbose_name="과목 코드")
    # AI 자료 분류 (course/topics.py): 주제 설명은 다음 자료를 분류할 때 참고한다
    description = models.TextField(blank=True, verbose_name="주제 설명")
    # "강의를 만들 만큼 자료가 충분한가" AI 판단 — 같은 자료 묶음(해시)으로는 다시 묻지 않는다
    readiness_hash = models.CharField(max_length=64, blank=True, verbose_name="마지막 판단 자료 묶음 해시")
    is_ready = models.BooleanField(default=False, verbose_name="강의 개설 가능 (AI 판단)")
    readiness_reason = models.TextField(blank=True, verbose_name="판단 이유")
    judged_at = models.DateTimeField(null=True, blank=True, verbose_name="판단 시각")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class PersonalFolder(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="personal_folders")
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class ProcessingStatus(models.TextChoices):
    PENDING = "pending", "대기"
    PROCESSING = "processing", "처리중"
    DONE = "done", "완료"
    FAILED = "failed", "실패"


class PersonalDocument(models.Model):
    class DocumentType(models.TextChoices):
        LECTURE = "lecture", "수업 자료"     # 강의를 만드는 데 쓴다
        EXAM = "exam", "족보"                # 기출·모의고사: 교수님 출제 스타일을 배워 문제 만들 때 쓴다

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="personal_documents")
    folder = models.ForeignKey(PersonalFolder, null=True, blank=True, on_delete=models.SET_NULL, related_name="documents")
    title = models.CharField(max_length=200, verbose_name="자료명")
    file = models.FileField(
        upload_to="personal_docs/%Y/%m/%d/",
        help_text="허용 확장자: pdf, doc, docx, ppt, pptx, txt, md, rtf, hwp, hwpx, jpg, jpeg, png (최대 20MB)",
        validators=[FileExtensionValidator(
            ["pdf", "doc", "docx", "ppt", "pptx", "txt", "md", "rtf", "hwp", "hwpx", "jpg", "jpeg", "png"]
        )],
    )
    extracted_text = models.TextField(blank=True, verbose_name="추출된 본문 (미리보기·문제생성에 사용)")
    summary = models.TextField(blank=True, verbose_name="AI 자동 요약")
    # 파일 내용의 SHA-256 — 같은 파일이 이미 요약돼 있으면 AI를 다시 부르지 않고 그 결과를 재사용한다
    content_hash = models.CharField(max_length=64, blank=True, db_index=True, verbose_name="파일 해시")
    summary_status = models.CharField(
        max_length=10, choices=ProcessingStatus.choices, default=ProcessingStatus.DONE,
        verbose_name="요약 생성 상태 (백그라운드 처리 추적용)",
    )
    subject_code = models.CharField(
        max_length=50, blank=True, verbose_name="과목 코드",
        help_text="같은 과목 코드로 자료가 쌓이면 강의가 자동 생성됩니다.",
    )
    document_type = models.CharField(
        max_length=10, choices=DocumentType.choices, default=DocumentType.LECTURE,
        verbose_name="자료 구분",
        help_text="수업 자료는 강의 생성에, 족보는 교수님 출제 스타일 학습과 모의 출제에 쓰입니다.",
    )
    # 사용자가 적으면 그대로 쓰고(강의 이름도 이 이름을 우선), 비어 있으면 AI가 자료에서 찾거나 빈 채로 둔다
    course_name = models.CharField(max_length=50, blank=True, default="", verbose_name="과목 이름")
    professor = models.CharField(max_length=50, blank=True, default="", verbose_name="교수 이름")
    # 한 자료가 여러 강의(주제)에 쓰일 수 있다. subject_code는 그중 첫 번째(대표) 주제 이름 — 목록 표시용
    topics = models.ManyToManyField(Subject, blank=True, related_name="documents", verbose_name="소속 주제")
    # 강의 생성에 쓸 만한 학습 자료인지 (업로드 후 AI가 주제와 함께 판단). 예전 '자료 구분'을 대신한다
    is_course_material = models.BooleanField(default=True, verbose_name="강의 자료로 사용 (AI 판단)")
    is_deleted = models.BooleanField(default=False, verbose_name="삭제됨 (사용자 화면에서만 숨김, 강의 생성용으로 보존)")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("mypage:document_preview", kwargs={"pk": self.pk})


class GeneratedQuestion(models.Model):
    class QuestionType(models.TextChoices):
        OX = "ox", "OX"
        SHORT = "short", "단답형"
        ESSAY = "essay", "서술형"

    document = models.ForeignKey(PersonalDocument, on_delete=models.CASCADE, related_name="questions")
    question_type = models.CharField(max_length=10, choices=QuestionType.choices)
    question_text = models.TextField(blank=True)
    answer = models.TextField(blank=True, verbose_name="정답/모범답안")
    status = models.CharField(
        max_length=10, choices=ProcessingStatus.choices, default=ProcessingStatus.DONE,
        verbose_name="문제 생성 상태 (백그라운드 처리 추적용)",
    )
    user_answer = models.TextField(blank=True, verbose_name="사용자가 제출한 답")
    is_correct = models.BooleanField(null=True, blank=True, default=None, verbose_name="채점 결과 (미응답 시 None)")
    feedback = models.TextField(blank=True, verbose_name="LLM 채점 피드백 (단답/서술형만)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.get_question_type_display()}] {self.question_text[:30]}"


class ExamStyle(models.Model):
    """족보들에서 뽑은 출제 스타일. 교수 이름(같은 교수면 과목이 달라도 공유)이나 과목 단위로 하나씩 둔다.
    guidelines는 문제를 만드는 프롬프트에 그대로 들어가는 지시문이다 (mypage/exam.py)."""
    key = models.CharField(max_length=120, unique=True, verbose_name="묶음 키 (p:교수 / s:과목)")
    label = models.CharField(max_length=100, verbose_name="표시 이름")
    guidelines = models.TextField(blank=True, verbose_name="출제 지시문 (프롬프트에 삽입)")
    profile = models.JSONField(default=dict, blank=True, verbose_name="스타일 요약 (유형 비율 등)")
    source_hash = models.CharField(max_length=64, blank=True, verbose_name="근거 족보 해시")
    doc_count = models.PositiveIntegerField(default=0, verbose_name="근거 족보 수")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "출제 스타일"
        verbose_name_plural = "출제 스타일"

    def __str__(self):
        return self.label


class MockExam(models.Model):
    """모의 출제. 수업 자료 요약 + 교수 출제 스타일로 만든 문제 묶음 (ox/mc/short, 서버가 채점)."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mock_exams")
    course_code = models.CharField(max_length=50, verbose_name="강의 코드(주제 이름)")
    title = models.CharField(max_length=200, blank=True)
    style_label = models.CharField(max_length=100, blank=True, verbose_name="적용한 출제 스타일")
    questions = models.JSONField(default=list)
    answers = models.JSONField(default=list, blank=True, verbose_name="제출한 답")
    results = models.JSONField(default=list, blank=True, verbose_name="문항별 정오")
    feedback = models.JSONField(default=list, blank=True, verbose_name="문항별 채점 피드백 (서술형)")
    created_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "모의 출제"
        verbose_name_plural = "모의 출제"

    def __str__(self):
        return f"{self.user} {self.course_code} {self.created_at:%Y-%m-%d}"

    def get_absolute_url(self):
        return reverse("mypage:mock_exam", kwargs={"pk": self.pk})
