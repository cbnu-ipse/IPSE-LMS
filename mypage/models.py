from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.db import models
from django.urls import reverse


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
    summary_status = models.CharField(
        max_length=10, choices=ProcessingStatus.choices, default=ProcessingStatus.DONE,
        verbose_name="요약 생성 상태 (백그라운드 처리 추적용)",
    )
    subject_code = models.CharField(
        max_length=50, blank=True, verbose_name="과목 코드",
        help_text="같은 과목 코드로 자료가 쌓이면 강의가 자동 생성됩니다.",
    )
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
