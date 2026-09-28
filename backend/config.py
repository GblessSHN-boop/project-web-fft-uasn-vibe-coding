import os
from datetime import timedelta
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

# Config harus dapat membaca backend/.env secara mandiri.
load_dotenv(BASE_DIR / ".env")


def env_value(name, default=None):
    value = os.getenv(name)
    return value if value not in (None, "") else default


class Config:
    # ---------------------------------------------------------
    # Flask / session
    # ---------------------------------------------------------
    SECRET_KEY = env_value(
        "SECRET_KEY",
        "ganti-secret-key-anda",
    )

    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = (
        env_value(
            "FLASK_ENV",
            "development",
        ).lower()
        == "production"
    )

    PERMANENT_SESSION_LIFETIME = timedelta(hours=8)

    # Session key resmi mengikuti aplikasi aktif.
    ADMIN_SESSION_KEY = "is_logged_in"

    # ---------------------------------------------------------
    # Database
    # ---------------------------------------------------------
    DB_USER = env_value(
        "DB_USER",
        "postgres",
    )

    DB_PASSWORD = env_value(
        "DB_PASSWORD",
        "",
    )

    DB_HOST = env_value(
        "DB_HOST",
        "localhost",
    )

    DB_PORT = env_value(
        "DB_PORT",
        "5432",
    )

    DB_NAME = env_value(
        "DB_NAME",
        "fftuasn_admin",
    )

    _DATABASE_URL = env_value(
        "DATABASE_URL"
    )

    SQLALCHEMY_DATABASE_URI = (
        _DATABASE_URL
        if _DATABASE_URL
        else (
            "postgresql+psycopg2://"
            f"{DB_USER}:"
            f"{quote_plus(DB_PASSWORD)}@"
            f"{DB_HOST}:"
            f"{DB_PORT}/"
            f"{DB_NAME}"
        )
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ---------------------------------------------------------
    # Upload / published data
    # ---------------------------------------------------------
    UPLOAD_ROOT = str(
        BASE_DIR
        / "static"
        / "uploads"
    )

    UPLOAD_FOLDER = str(
        BASE_DIR
        / "static"
        / "uploads"
        / "dosen"
    )

    DEKAN_UPLOAD_FOLDER = str(
        BASE_DIR
        / "static"
        / "uploads"
        / "dekan"
    )

    BERITA_UPLOAD_FOLDER = str(
        BASE_DIR
        / "static"
        / "uploads"
        / "berita"
    )

    BANNER_UPLOAD_FOLDER = str(
        BASE_DIR
        / "static"
        / "uploads"
        / "banner_informasi"
    )

    PUBLISHED_FOLDER = str(
        BASE_DIR
        / "static"
        / "published"
    )

    # Banner aktif mendukung file sampai 400 MB.
    # Tambahan 10 MB mengikuti runtime app.py saat ini.
    BANNER_MAX_FILE_SIZE_MB = 400

    MAX_CONTENT_LENGTH = (
        BANNER_MAX_FILE_SIZE_MB + 10
    ) * 1024 * 1024

    # ---------------------------------------------------------
    # File types
    # ---------------------------------------------------------
    ALLOWED_IMAGE_EXTENSIONS = {
        "png",
        "jpg",
        "jpeg",
        "webp",
    }

    ALLOWED_DOCUMENT_EXTENSIONS = {
        "pdf",
        "doc",
        "docx",
    }

    ALLOWED_VIDEO_EXTENSIONS = {
        "mp4",
        "webm",
        "mov",
    }

    # ---------------------------------------------------------
    # CORS
    # ---------------------------------------------------------
    ALLOWED_ORIGINS = [
        item.strip()
        for item in env_value(
            "ALLOWED_ORIGINS",
            (
                "http://127.0.0.1:5000,"
                "http://localhost:5000,"
                "http://127.0.0.1:5522,"
                "http://localhost:5522,"
                "https://domain-anda.com"
            ),
        ).split(",")
        if item.strip()
    ]

    # ---------------------------------------------------------
    # Admin auth
    # ---------------------------------------------------------
    ADMIN_EMAIL = env_value(
        "ADMIN_EMAIL",
        "admin@fft.dev",
    ).strip().lower()

    ADMIN_PASSWORD = env_value(
        "ADMIN_PASSWORD",
        "",
    )

    ADMIN_PASSWORD_HASH = env_value(
        "ADMIN_PASSWORD_HASH",
        "",
    )

    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_SECONDS = 15 * 60


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


def get_config():
    environment = env_value(
        "FLASK_ENV",
        "development",
    ).lower()

    if environment == "production":
        return ProductionConfig

    return DevelopmentConfig
