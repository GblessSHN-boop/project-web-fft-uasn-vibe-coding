import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/web_fft_uasn"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    UPLOAD_ROOT = os.getenv(
        "UPLOAD_ROOT",
        str(BASE_DIR / "static" / "uploads")
    )

    MAX_CONTENT_LENGTH = 20 * 1024 * 1024

    ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
    ALLOWED_DOCUMENT_EXTENSIONS = {"pdf", "doc", "docx"}
    ALLOWED_VIDEO_EXTENSIONS = {"mp4", "webm"}

    ADMIN_SESSION_KEY = "fft_admin_logged_in"


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


def get_config():
    environment = os.getenv("FLASK_ENV", "development").lower()

    if environment == "production":
        return ProductionConfig

    return DevelopmentConfig