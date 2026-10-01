from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"^ws/lobby/chat/$", consumers.LobbyChatConsumer.as_asgi()),
    re_path(r"^ws/poker/$", consumers.PokerConsumer.as_asgi()),
    re_path(r"^ws/gostop/$", consumers.GostopConsumer.as_asgi()),
    re_path(r"^ws/yacht/$", consumers.YachtConsumer.as_asgi()),
]
