import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Django ASGI 애플리케이션을 먼저 초기화해야 앱 레지스트리가 준비됩니다.
django_asgi_app = get_asgi_application()

# game 앱의 WebSocket 라우팅 (초기화 이후 임포트)
from game.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        # 기존 HTTP 트래픽 — 변경 없이 Django가 그대로 처리
        "http": django_asgi_app,
        # WebSocket 트래픽 — 로그인 세션을 AuthMiddlewareStack으로 유지
        "websocket": AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        ),
    }
)
