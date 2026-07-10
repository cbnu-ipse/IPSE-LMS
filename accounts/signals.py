# accounts/signals.py
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.conf import settings
from django.contrib.auth.signals import user_logged_in
from .models import Student

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_student_profile(sender, instance, created, **kwargs):
    """유저(User) 레코드가 새로 생성(created=True)될 때, 빈 Student 프로필을 함께 생성합니다."""
    if created:
        Student.objects.create(student=instance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_student_profile(sender, instance, **kwargs):
    """유저 정보가 업데이트될 때, 연결된 Student 정보도 안전하게 저장 상태를 동기화합니다."""
    if hasattr(instance, 'student'):
        instance.student.save()


@receiver(user_logged_in)
def on_user_logged_in(sender, request, user, **kwargs):
    """유저가 로그인하면 세션에 'just_logged_in' 플래그를 세팅합니다."""
    request.session['just_logged_in'] = True


@receiver(pre_delete, sender=settings.AUTH_USER_MODEL)
def cascade_delete_judge_data(sender, instance, **kwargs):
    """judge(contest/problems) 앱은 beta_judge DB로 분리되어 있어 Django의 자동
    CASCADE가 DB 경계를 넘지 못한다. User 삭제 시 관련 judge 데이터를 수동으로 정리한다."""
    from contest.models import ContestParticipant, ContestSubmission
    from problems.models import Problem, SolveRecord, ProblemComment

    ContestParticipant.objects.filter(user=instance).delete()
    ContestSubmission.objects.filter(user=instance).delete()
    ProblemComment.objects.filter(author=instance).delete()
    SolveRecord.objects.filter(user=instance).delete()
    Problem.objects.filter(author=instance).delete()