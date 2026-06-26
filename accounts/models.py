import hashlib
from django.db import models, transaction
from django.urls import reverse
from django.contrib.auth.models import AbstractUser, UserManager
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, F
from PIL import Image
from .validators import ASCIIUsernameValidator

class CustomUserManager(UserManager):
    """IPSE 동아리원 검색 및 통계를 위한 매니저"""
    def search(self, query=None):
        queryset = self.get_queryset()
        if query is not None:
            or_lookup = (
                Q(username__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(email__icontains=query)
            )
            queryset = queryset.filter(or_lookup).distinct()
        return queryset

    def get_student_count(self):
        return self.model.objects.filter(is_student=True).count()

    def get_lecturer_count(self):
        return self.model.objects.filter(is_lecturer=True).count()

GENDERS = ((_("M"), _("Male")), (_("F"), _("Female")))

class User(AbstractUser):
    
    is_student = models.BooleanField(default=False)
    is_lecturer = models.BooleanField(default=False)
    first_name = models.CharField(_("first name"), max_length=150, blank=True, null=True)
    last_name = models.CharField(_("last name"), max_length=150, blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDERS, blank=True, null=True)
    phone = models.CharField(max_length=60, blank=True, null=True)
    address = models.CharField(max_length=60, blank=True, null=True)
    picture = models.ImageField(upload_to="profile_pictures/%y/%m/%d/", default="default.png", null=True)
    email = models.EmailField(blank=True, null=True)
    username_validator = ASCIIUsernameValidator()
    objects = CustomUserManager()
    total_points = models.IntegerField(default=0, verbose_name="누적 포인트")
    is_president = models.BooleanField(default=False, verbose_name="회장")
    is_vice_president = models.BooleanField(default=False, verbose_name="부회장")
    is_executive = models.BooleanField(default=False, verbose_name="임원진")
    leaves = models.PositiveIntegerField(default=0, verbose_name="낙엽")
    class Meta:
        ordering = ("-date_joined",)

    @property
    def get_full_name(self):
        """이름이 없을 경우 학번(ID)을 반환하여 시스템 에러를 방지합니다."""
        if self.first_name and self.last_name:
            return f"{self.last_name} {self.first_name}"
        return self.username

    def __str__(self):
        return f"{self.username} ({self.get_full_name})"

    def get_picture(self):
        try:
            return self.picture.url
        except:
            return settings.MEDIA_URL + "default.png"

    @property
    def display_name(self):
        """사이트 노출용 이름: 학생 닉네임 우선, 없으면 학번(username)."""
        try:
            if hasattr(self, "student") and self.student.nickname:
                return self.student.nickname
        except Student.DoesNotExist:
            pass
        return self.username

    @property
    def display_chat_name(self):
        """채팅용 표시 이름: 닉네임 → 실명 → 학번 순 폴백."""
        try:
            if hasattr(self, "student") and self.student.nickname:
                return self.student.nickname
        except Student.DoesNotExist:
            pass
        name = f"{self.last_name or ''}{self.first_name or ''}".strip()
        return name if name else self.username

    @property
    def display_author(self):
        """댓글, 공지, 투표, 설문 등 작성자 표시용 포맷:
        설정한 닉네임이 있으면 닉네임, 없으면 기존 포맷:
        이름(성+이름)이 있으면 '[학번 앞2자리] 이름', 없으면 '학번(username)'
        """
        try:
            if hasattr(self, "student") and self.student.nickname:
                return self.student.nickname
        except Student.DoesNotExist:
            pass

        last = self.last_name or ""
        first = self.first_name or ""
        name = f"{last}{first}".strip()
        
        if name:
            un = self.username or ""
            prefix = ""
            if un.isdigit():
                if len(un) >= 9 and (un.startswith('20') or un.startswith('19')):
                    prefix = un[2:4]
                else:
                    prefix = un[:2]
            
            if prefix:
                return f"[{prefix}] {name}"
            return name
        return self.username

    @property
    def get_user_role(self):
        """사이트에서 표시할 역할 문자열을 반환합니다."""
        if self.is_superuser:
            return "관리자"
        elif self.is_president:
            return "회장"
        elif self.is_vice_president:
            return "부회장"
        elif self.is_executive or self.is_lecturer:
            return "임원진"
        elif self.is_student:
            return "동아리원"
        return "일반 사용자"

    @property
    def role_badge_label(self):
        """커뮤니티/랭킹 등에 노출할 역할 뱃지 텍스트를 반환합니다."""
        if self.is_president:
            return "회장"
        elif self.is_vice_president:
            return "부회장"
        elif self.is_executive or self.is_lecturer:
            return "임원진"
        return ""

    @property
    def role_badge_class(self):
        """역할 뱃지에 적용할 Tailwind CSS 클래스를 반환합니다."""
        if self.is_president:
            return "bg-yellow-100 text-yellow-800 border border-yellow-200"
        elif self.is_vice_president:
            return "bg-amber-100 text-amber-700 border border-amber-200"
        elif self.is_executive or self.is_lecturer:
            return "bg-violet-100 text-violet-700 border border-violet-200"
        return ""

    @property
    def get_rank_medal_class(self):
        """문제 풀이 랭킹 1, 2, 3위에 따라 gold, silver, bronze를 반환합니다. 캐시를 적용합니다."""
        if not self.is_student or self.total_points <= 0:
            return ""
        from django.core.cache import cache
        top_3_ids = cache.get('top_3_solved_user_ids')
        if top_3_ids is None:
            top_3_ids = list(
                User.objects.filter(is_student=True, total_points__gt=0)
                .order_by('-total_points', 'username')
                .values_list('id', flat=True)[:3]
            )
            cache.set('top_3_solved_user_ids', top_3_ids, 60)
            
        if self.id in top_3_ids:
            idx = top_3_ids.index(self.id)
            if idx == 0:
                return 'gold'
            elif idx == 1:
                return 'silver'
            elif idx == 2:
                return 'bronze'
        return ""

    @property
    def badge_html(self):
        """회원 직책 및 랭킹 메달을 아이콘 형태로 반환합니다."""
        from django.utils.safestring import mark_safe
        badges = []
        if self.is_president:
            badges.append('<i class="fa-solid fa-crown text-yellow-500" title="회장" style="margin-left: 2px; margin-right: 2px;"></i>')
        elif self.is_vice_president:
            badges.append('<i class="fa-solid fa-crown text-slate-400" title="부회장" style="margin-left: 2px; margin-right: 2px;"></i>')
        elif self.is_executive or self.is_lecturer:
            badges.append('<i class="fa-solid fa-id-badge text-violet-500" title="임원진" style="margin-left: 2px; margin-right: 2px;"></i>')
            
        medal = self.get_rank_medal_class
        if medal == 'gold':
            badges.append('<i class="fa-solid fa-medal text-yellow-500" title="우수부원 1등" style="margin-left: 2px; margin-right: 2px;"></i>')
        elif medal == 'silver':
            badges.append('<i class="fa-solid fa-medal text-slate-400" title="우수부원 2등" style="margin-left: 2px; margin-right: 2px;"></i>')
        elif medal == 'bronze':
            badges.append('<i class="fa-solid fa-medal text-amber-600" title="우수부원 3등" style="margin-left: 2px; margin-right: 2px;"></i>')
            
        return mark_safe("".join(badges))

    def save(self, *args, **kwargs):
        """프로필 이미지 최적화 로직 유지"""
        super().save(*args, **kwargs)
        try:
            img = Image.open(self.picture.path)
            if img.height > 300 or img.width > 300:
                img.thumbnail((300, 300))
                img.save(self.picture.path)
        except:
            pass

    def adjust_leaves(self, amount, transaction_type, description=""):
        """안전하게 사용자의 낙엽을 조정하는 헬퍼 메서드 (동시성 제어 및 잔액 검증 포함)"""
        with transaction.atomic():
            user = User.objects.select_for_update().get(id=self.id)
            if amount < 0 and user.leaves + amount < 0:
                raise ValueError("낙엽이 부족합니다.")
                
            LeafTransaction.objects.create(
                user=user,
                amount=amount,
                transaction_type=transaction_type,
                description=description
            )


class Student(models.Model):
    """IPSE 동아리원(학생) 상세 정보 모델"""
    student = models.OneToOneField(User, on_delete=models.CASCADE)
    student_number = models.IntegerField(null=True, blank=True, unique=True, verbose_name="학번")

    # 💡 프로필 커스텀을 위해 새로 추가할 필드들
    nickname = models.CharField(max_length=30, blank=True, default="", verbose_name="닉네임")
    bio = models.CharField(max_length=100, blank=True, verbose_name="한 줄 소개")
    github_url = models.URLField(blank=True, verbose_name="GitHub 주소")
    blog_url = models.URLField(blank=True, verbose_name="블로그 주소")
    level = models.IntegerField(default=1, verbose_name="현재 레벨")

    # 동아리원 인증 필드
    is_verified = models.BooleanField(default=False, verbose_name="동아리원 인증 여부")
    verification_document = models.FileField(
        upload_to="verification_docs/%y/%m/%d/",
        null=True,
        blank=True,
        verbose_name="인증 서류",
        help_text="재학증명서 또는 학생증 사진 (JPG, PNG, PDF)",
    )

    # 알림 설정 필드
    notify_gathering_all = models.BooleanField(default=True, verbose_name="전체 번개 모임 알림 받기")
    notify_gathering_joined = models.BooleanField(default=True, verbose_name="참여 중인 번개 모임 알림 받기")
    notify_post_comment = models.BooleanField(default=True, verbose_name="내 게시글 댓글 및 답글 알림 받기")

    class Meta:
        ordering = ("-student__date_joined",)

    def __str__(self):
        return self.student.get_full_name


class LMSToken(models.Model):
    """충북대 LMS(Moodle) 연동 토큰 저장 모델"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lms_token",
        verbose_name="사용자",
    )
    token = models.CharField(max_length=200, verbose_name="LMS 토큰")
    lms_username = models.CharField(max_length=100, blank=True, verbose_name="LMS 아이디")
    moodle_user_id = models.IntegerField(null=True, blank=True, verbose_name="Moodle 사용자 ID")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="연동 일시")
    last_used_at = models.DateTimeField(auto_now=True, verbose_name="마지막 사용")

    class Meta:
        verbose_name = "LMS 토큰"
        verbose_name_plural = "LMS 토큰"

    def __str__(self):
        return f"{self.user.username} - LMS 연동"


class LeafTransaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="leaf_transactions")
    amount = models.IntegerField(verbose_name="변동 수량")  # 양수: 획득, 음수: 소비
    transaction_type = models.CharField(max_length=50, verbose_name="거래 유형")
    description = models.CharField(max_length=255, blank=True, verbose_name="상세 내용")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="거래 일시")
    previous_hash = models.CharField(max_length=64, blank=True, verbose_name="이전 트랜잭션 해시")
    hash = models.CharField(max_length=64, blank=True, verbose_name="현재 트랜잭션 해시")

    class Meta:
        ordering = ("created_at",)

    def calculate_hash(self):
        sha = hashlib.sha256()
        created_str = self.created_at.isoformat() if self.created_at else "pending"
        sha.update(f"{self.previous_hash}{self.user_id}{self.amount}{self.transaction_type}{created_str}".encode('utf-8'))
        return sha.hexdigest()

    def save(self, *args, **kwargs):
        if not self.id:
            with transaction.atomic():
                last_tx = LeafTransaction.objects.filter(user=self.user).select_for_update().last()
                if last_tx:
                    self.previous_hash = last_tx.hash
                else:
                    self.previous_hash = "genesis"
                
                super().save(*args, **kwargs)
                self.hash = self.calculate_hash()
                LeafTransaction.objects.filter(id=self.id).update(hash=self.hash)
                
                # F() 객체를 활용하여 동시성 레이스 컨디션 방지
                User.objects.filter(id=self.user_id).update(leaves=F('leaves') + self.amount)
        else:
            raise PermissionError("이미 기록된 거래 이력은 수정할 수 없습니다.")


class LeafCode(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name="보상 코드")
    amount = models.PositiveIntegerField(verbose_name="지급 낙엽 수량")
    is_active = models.BooleanField(default=True, verbose_name="활성화 여부")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성 일시")

    class Meta:
        verbose_name = "보상 코드"
        verbose_name_plural = "보상 코드 목록"

    def __str__(self):
        return f"{self.code} ({self.amount}개)"


class LeafCodeUsage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="used_codes")
    leaf_code = models.ForeignKey(LeafCode, on_delete=models.CASCADE, related_name="usages")
    used_at = models.DateTimeField(auto_now_add=True, verbose_name="사용 일시")

    class Meta:
        unique_together = ('user', 'leaf_code')
        verbose_name = "보상 코드 사용 이력"
        verbose_name_plural = "보상 코드 사용 이력 목록"

    def __str__(self):
        return f"{self.user.username} - {self.leaf_code.code} 사용"


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('gathering_created', '새 번개 모임 개설'),
        ('gathering_join', '모임 참여 신청'),
        ('gathering_leave', '모임 참여 취소'),
        ('gathering_comment', '모임 댓글 등록'),
        ('gathering_update', '모임 정보 변경'),
        ('gathering_cancel', '모임 취소'),
        ('post_comment', '게시글 댓글 등록'),
        ('comment_reply', '댓글 답글 등록'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name="수신자"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications_sent',
        null=True,
        blank=True,
        verbose_name="송신자"
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        verbose_name="알림 유형"
    )
    gathering = models.ForeignKey(
        'community.GatheringEvent',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="관련 번개 모임"
    )
    post = models.ForeignKey(
        'community.CommunityPost',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="관련 게시글"
    )
    message = models.CharField(max_length=255, verbose_name="알림 메시지")
    is_read = models.BooleanField(default=False, verbose_name="읽음 여부")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "알림"
        verbose_name_plural = "알림 목록"

    def __str__(self):
        return f"[{self.get_notification_type_display()}] {self.recipient.username} - {self.message[:20]}"


class PushSubscription(models.Model):
    """PWA 백그라운드 푸시 알림을 수신하는 개별 기기 구독 정보"""
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='push_subscriptions',
        verbose_name="학생 프로필"
    )
    endpoint = models.TextField(unique=True, verbose_name="푸시 엔드포인트 URL")
    p256dh = models.TextField(verbose_name="클라이언트 공개키(p256dh)")
    auth = models.TextField(verbose_name="클라이언트 인증 토큰(auth)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="등록일시")

    class Meta:
        verbose_name = "웹 푸시 구독"
        verbose_name_plural = "웹 푸시 구독 목록"

    def __str__(self):
        return f"{self.student.student.username} - {self.endpoint[:30]}..."


class Attendance(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(verbose_name="출석 일자")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'date')
        verbose_name = "출석 체크"
        verbose_name_plural = "출석 체크 목록"

    def __str__(self):
        return f"{self.user.username} - {self.date}"

