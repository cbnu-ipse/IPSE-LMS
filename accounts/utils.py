import json
import logging
import threading
from django.conf import settings

logger = logging.getLogger(__name__)


def _send_push_async(subscription_ids, payload_data):
    """비동기 스레드 내에서 웹 푸시 발송 및 오류 토큰 자동 정화"""
    from .models import PushSubscription
    try:
        from pywebpush import webpush, WebPushException
    except ImportError:
        # pywebpush 패키지가 없으면 작동 생략
        return

    subscriptions = PushSubscription.objects.filter(id__in=subscription_ids)
    
    vapid_private = getattr(settings, 'VAPID_PRIVATE_KEY', '')
    vapid_public = getattr(settings, 'VAPID_PUBLIC_KEY', '')
    vapid_claim = getattr(settings, 'VAPID_CLAIM_EMAIL', 'mailto:admin@cbnu-ipse.co.kr')
    
    if not vapid_private or not vapid_public:
        return
        
    vapid_claims = {
        "sub": vapid_claim
    }
    
    for sub in subscriptions:
        try:
            subscription_info = {
                "endpoint": sub.endpoint,
                "keys": {
                    "p256dh": sub.p256dh,
                    "auth": sub.auth
                }
            }
            webpush(
                subscription_info=subscription_info,
                data=json.dumps(payload_data),
                vapid_private_key=vapid_private,
                vapid_claims=vapid_claims
            )
        except WebPushException as ex:
            # 404 Not Found 또는 410 Gone은 기기/브라우저가 만료되었거나 푸시 서비스가 제거된 상태이므로 DB에서 정화
            if ex.response is not None and ex.response.status_code in [404, 410]:
                logger.warning(f"Push subscription {sub.id} is expired or gone (status {ex.response.status_code}). Deleting. Error: {str(ex)}")
                try:
                    sub.delete()
                except Exception as del_ex:
                    logger.error(f"Failed to delete expired subscription {sub.id}: {str(del_ex)}")
            else:
                logger.error(f"WebPushException sending push to subscription {sub.id}: {str(ex)}")
        except Exception as ex:
            logger.error(f"Unexpected error sending push to subscription {sub.id}: {str(ex)}")


def send_web_push(notification_obj):
    """지정된 알림 객체를 기반으로 비동기 백그라운드 웹 푸시 전송"""
    try:
        student = notification_obj.recipient.student
    except Exception:
        # 학생 프로필이 없는 유저는 웹 푸시 전송 대상 아님
        return
        
    subscriptions = student.push_subscriptions.all()
    if not subscriptions.exists():
        return
        
    payload = {
        "title": "IPSE",
        "body": notification_obj.message,
        "url": f"/accounts/notifications/{notification_obj.id}/read/",
        "icon": "/static/img/IPSE-LOGO.png",
        "badge": "/static/img/favicon-ipse.svg"
    }
    
    subscription_ids = list(subscriptions.values_list('id', flat=True))
    
    # 별도 스레드로 웹 푸시 전송하여 웹 응답 대기시간(Response Time) 지연 최소화
    thread = threading.Thread(target=_send_push_async, args=(subscription_ids, payload))
    thread.daemon = True
    thread.start()
