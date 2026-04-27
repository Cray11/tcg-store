from .base import *

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Show emails in console during development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Disable Cloudinary in dev — use local storage
DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"