import os
from decouple import config, Csv

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("DEBUG", default=True, cast=bool)

# 어드민 페이지 경로 설정 (개발 환경: 'admin/', 배포 환경: .env의 ADMIN_PATH 또는 자동 생성)
if DEBUG:
    ADMIN_PATH = config("ADMIN_PATH", default="admin")
else:
    import secrets
    ADMIN_PATH = config("ADMIN_PATH", default=None)
    if not ADMIN_PATH:
        # 무작위 문자열 생성
        random_path = secrets.token_urlsafe(16)
        env_file_path = os.path.join(BASE_DIR, ".env")
        if os.path.exists(env_file_path):
            try:
                with open(env_file_path, "a") as f:
                    f.write(f"\n# Auto-generated Admin Path for Production\nADMIN_PATH={random_path}\n")
                ADMIN_PATH = random_path
            except Exception:
                ADMIN_PATH = random_path
        else:
            ADMIN_PATH = random_path

ADMIN_PATH = ADMIN_PATH.strip("/") + "/"

# .env에서 ALLOWED_HOSTS를 콤마(,) 단위로 읽어오도록 개선 (보안 및 유연성 향상)
ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS", 
    default=".cbnu-ipse.co.kr, cbnu-ipse.co.kr, 10.255.81.163, 127.0.0.1, .localhost, localhost, 192.168.0.8, 192.168.206.128", 
    cast=Csv()
)

# 서브도메인(예: judge) 허용을 위해 ALLOWED_HOSTS 자동 확장
_raw_hosts = list(ALLOWED_HOSTS)
for host in _raw_hosts:
    host_stripped = host.strip()
    # IP 주소가 아니고 점(.)으로 시작하지 않는 도메인에 대해 와일드카드 서브도메인(.domain.com) 추가
    if host_stripped and not host_stripped.startswith('.'):
        # IP 주소인지 판별 (간단히 모든 글자가 숫자나 온점으로만 구성되지 않았는지 확인)
        is_ip = all(c.isdigit() or c == '.' for c in host_stripped)
        if not is_ip:
            dot_host = f".{host_stripped}"
            if dot_host not in ALLOWED_HOSTS:
                ALLOWED_HOSTS.append(dot_host)

CSRF_TRUSTED_ORIGINS = [
    "https://cbnu-ipse.co.kr",
    "https://judge.cbnu-ipse.co.kr",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://*.lvh.me:8000",
]


# change the default user models to our custom model
AUTH_USER_MODEL = "accounts.User"

# Application definition
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "django_hosts",
    "rest_framework",
    "django_filters",
]

# Custom apps (IPSE LMS 핵심 모듈들)
PROJECT_APPS = [
    "core.apps.CoreConfig",
    "accounts.apps.AccountsConfig",
    "course.apps.CourseConfig",
    "quiz.apps.QuizConfig",
    "contest.apps.ContestConfig",
    "problems.apps.ProblemsConfig",
    "community.apps.CommunityConfig",
    "ranking.apps.RankingConfig",
    "compiler.apps.CompilerConfig",
]

# Combine all apps
INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + PROJECT_APPS

MIDDLEWARE = [
    "django_hosts.middleware.HostsRequestMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django_hosts.middleware.HostsResponseMiddleware",
]

ROOT_URLCONF = "config.urls"
ROOT_HOSTCONF = "config.hosts"
DEFAULT_HOST = "community"
PARENT_HOST = config("PARENT_HOST", default="lvh.me:8000" if DEBUG else "cbnu-ipse.co.kr")
SESSION_COOKIE_DOMAIN = config("SESSION_COOKIE_DOMAIN", default=".lvh.me" if DEBUG else ".cbnu-ipse.co.kr")
CSRF_COOKIE_DOMAIN = config("CSRF_COOKIE_DOMAIN", default=".lvh.me" if DEBUG else ".cbnu-ipse.co.kr")

# Nginx / Cloudflare 뒤에서 HTTPS 식별을 위한 설정
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

LOGIN_URL = "/accounts/login/"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "core.context_processors.active_recruitments",
                "core.context_processors.vapid_settings",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Database
# DATABASE_URL 환경변수가 있으면 PostgreSQL, 없으면 로컬 SQLite 사용
_database_url = config("DATABASE_URL", default="")
if _database_url:
    import urllib.parse
    _u = urllib.parse.urlparse(_database_url)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": _u.path.lstrip("/"),
            "USER": _u.username,
            "PASSWORD": _u.password,
            "HOST": _u.hostname,
            "PORT": _u.port or 5432,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": os.path.join(BASE_DIR, "db.sqlite3"),
        }
    }

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "ko-kr"
TIME_ZONE = "Asia/Seoul"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

EMAIL_BACKEND = config("EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_USE_SSL = config("EMAIL_USE_SSL", default=False, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
EMAIL_FROM_ADDRESS = config("EMAIL_FROM_ADDRESS", default="noreply@ipse.ac.kr")
EMAIL_TIMEOUT = config("EMAIL_TIMEOUT", default=30, cast=int)
DEFAULT_FROM_EMAIL = EMAIL_FROM_ADDRESS
SERVER_EMAIL = EMAIL_FROM_ADDRESS

PASSWORD_RESET_TIMEOUT = config("PASSWORD_RESET_TIMEOUT", default=86400, cast=int)

LOGIN_REDIRECT_URL = "/introduce/"
LOGOUT_REDIRECT_URL = "/"

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {"format": "%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s"}
    },
    "handlers": {
        "console": {"level": "INFO", "class": "logging.StreamHandler", "formatter": "verbose"}
    },
    "root": {"level": "INFO", "handlers": ["console"]},
}

STUDENT_ID_PREFIX = config("STUDENT_ID_PREFIX", default="ugr")
LECTURER_ID_PREFIX = config("LECTURER_ID_PREFIX", default="lec")

# 🔔 VAPID (Web Push) 설정 및 자동 생성 로직
VAPID_PUBLIC_KEY = config("VAPID_PUBLIC_KEY", default="")
VAPID_PRIVATE_KEY = config("VAPID_PRIVATE_KEY", default="")
VAPID_CLAIM_EMAIL = config("EMAIL_FROM_ADDRESS", default="mailto:admin@cbnu-ipse.co.kr")
if VAPID_CLAIM_EMAIL and not VAPID_CLAIM_EMAIL.startswith("mailto:"):
    VAPID_CLAIM_EMAIL = f"mailto:{VAPID_CLAIM_EMAIL}"

if not VAPID_PUBLIC_KEY or not VAPID_PRIVATE_KEY:
    try:
        from cryptography.hazmat.primitives.asymmetric import ec
        import base64
        
        # ECDSA secp256r1 (prime256v1) 키 생성
        private_key = ec.generate_private_key(ec.SECP256R1())
        
        # Private key 바이트 변환
        private_num = private_key.private_numbers().private_value
        private_bytes = private_num.to_bytes(32, byteorder='big')
        
        # Public key 바이트 변환 (uncompressed format: \x04 접두사 + X좌표 + Y좌표)
        public_numbers = private_key.public_key().public_numbers()
        x_bytes = public_numbers.x.to_bytes(32, byteorder='big')
        y_bytes = public_numbers.y.to_bytes(32, byteorder='big')
        public_bytes = b'\x04' + x_bytes + y_bytes
        
        # URL-safe Base64 인코딩 (패딩 문자 '=' 제거)
        vapid_private = base64.urlsafe_b64encode(private_bytes).decode('utf-8').rstrip('=')
        vapid_public = base64.urlsafe_b64encode(public_bytes).decode('utf-8').rstrip('=')
        
        # .env 파일에 저장하여 다음 구동 시 재사용하도록 처리
        env_file_path = os.path.join(BASE_DIR, ".env")
        if os.path.exists(env_file_path):
            try:
                with open(env_file_path, "a") as f:
                    f.write(f"\n# Auto-generated VAPID Keys for Web Push\nVAPID_PUBLIC_KEY={vapid_public}\nVAPID_PRIVATE_KEY={vapid_private}\n")
            except Exception:
                pass
                
        VAPID_PUBLIC_KEY = vapid_public
        VAPID_PRIVATE_KEY = vapid_private
    except Exception:
        pass

# Trigger reload to pick up ALLOWED_HOSTS update (with .lvh.me) in .env