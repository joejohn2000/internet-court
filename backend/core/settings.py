import os
import sys
import importlib.util
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


def env_list(name, default):
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    return [item.strip() for item in raw_value.split(',') if item.strip()]

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

SECRET_KEY = os.getenv(
    'SECRET_KEY',
    'dev-only-0f4a6f1d2f6a4b1ca8fcf3b51e8a923818a6e6b5993cb6f2be3e7af1',
)
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = env_list('ALLOWED_HOSTS', ['localhost', '127.0.0.1'])
TRUST_X_FORWARDED_FOR = os.getenv('TRUST_X_FORWARDED_FOR', 'False') == 'True'

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'corsheaders',

    # Local apps
    'apps.users',
    'apps.cases',
    'apps.votes',
    'apps.feedback',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

import dj_database_url

# Database Configuration
# ------------------------------------------------------------------------------
is_test_command = 'test' in sys.argv
database_url = os.getenv('DATABASE_URL')
use_postgres = (
    os.getenv('USE_POSTGRES', 'False') == 'True'
    or os.getenv('RENDER', 'False') == 'True'
    or bool(database_url)
)

if use_postgres:
    DATABASES = {
        'default': dj_database_url.config(
            default=database_url,
            conn_max_age=600
        )
    }
    print("✅ DATABASE: Using PostgreSQL")
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
    print("🏠 DATABASE: Using SQLite (Local Development)")

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '120/minute',
        'user': '300/minute',
        'login': '5/minute',
        'google_login': '8/minute',
        'register': '5/hour',
        'admin_login': '5/minute',
        'create_admin': '10/hour',
        'case_submit': '10/hour',
        'comment_create': '20/hour',
        'feedback_create': '10/hour',
        'vote_create': '20/hour',
        'ai_generate': '6/hour',
    },
}

try:
    has_simplejwt = importlib.util.find_spec('rest_framework_simplejwt.authentication') is not None
except ModuleNotFoundError:
    has_simplejwt = False

if has_simplejwt:
    REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'].append(
        'rest_framework_simplejwt.authentication.JWTAuthentication'
    )
else:
    REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'].append(
        'rest_framework.authentication.SessionAuthentication'
    )

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env_list(
    'CORS_ALLOWED_ORIGINS',
    [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://internet-court.netlify.app',
    ],
)
CORS_ALLOW_CREDENTIALS = False

from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers)

SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = not DEBUG
CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS', CORS_ALLOWED_ORIGINS)

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'same-origin'
X_FRAME_OPTIONS = 'DENY'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = not DEBUG and not is_test_command
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG

CASE_VERDICT_DELAY_MINUTES = int(os.getenv('CASE_VERDICT_DELAY_MINUTES', '1'))
CACHE_CATEGORIES_SECONDS = int(os.getenv('CACHE_CATEGORIES_SECONDS', '1800'))
CACHE_PUBLIC_CASE_TOTAL_SECONDS = int(os.getenv('CACHE_PUBLIC_CASE_TOTAL_SECONDS', '60'))
CACHE_PUBLIC_CASE_FEED_SECONDS = int(os.getenv('CACHE_PUBLIC_CASE_FEED_SECONDS', '45'))
CACHE_GEMINI_MODEL_SECONDS = int(os.getenv('CACHE_GEMINI_MODEL_SECONDS', '3600'))

redis_url = os.getenv('REDIS_URL')
if redis_url:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': redis_url,
            'KEY_PREFIX': 'internet_court',
            'TIMEOUT': 300,
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'internet-court-local-cache',
            'TIMEOUT': 300,
        }
    }

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s %(levelname)s %(name)s %(message)s',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': os.getenv('LOG_LEVEL', 'INFO'),
    },
}
