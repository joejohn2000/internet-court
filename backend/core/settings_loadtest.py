from .settings import *  # noqa: F403,F401


# Local-only settings for controlled benchmarking.
REST_FRAMEWORK = {  # noqa: F405
    **REST_FRAMEWORK,  # noqa: F405
    'DEFAULT_THROTTLE_CLASSES': [],
    'DEFAULT_THROTTLE_RATES': {},
}

SECURE_SSL_REDIRECT = False  # noqa: F405
