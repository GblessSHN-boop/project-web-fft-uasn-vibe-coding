import os
from dotenv import load_dotenv

load_dotenv()

from pathlib import Path
from urllib.parse import quote_plus, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from datetime import datetime, timedelta
from time import time
import hmac
import base64
import binascii
import io
import json
import shutil
import uuid
import re
import traceback
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session,
    flash,
    send_file,
    jsonify,
    send_from_directory,
)
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import cast, Integer, inspect, text, or_
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


def env_value(name, default=None):
    value = os.getenv(name)
    return value if value not in (None, "") else default


ALLOWED_ORIGINS = [
    item.strip()
    for item in env_value(
        "ALLOWED_ORIGINS",
        "http://127.0.0.1:5000,http://localhost:5000,https://domain-anda.com",
    ).split(",")
    if item.strip()
]

CORS(
    app,
    resources={r"/api/*": {"origins": ALLOWED_ORIGINS}},
    supports_credentials=True,
)

app.secret_key = env_value("SECRET_KEY", "ganti-secret-key-anda")
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = (
    env_value("FLASK_ENV", "development").lower() == "production"
)
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=8)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads", "dosen")
DEKAN_UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads", "dekan")
PUBLISHED_FOLDER = os.path.join(BASE_DIR, "static", "published")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
ALLOWED_VIDEO_EXTENSIONS = {"mp4", "webm", "mov"}

BANNER_MAX_FILE_SIZE_MB = 400
BANNER_MAX_FILE_SIZE = BANNER_MAX_FILE_SIZE_MB * 1024 * 1024

# Sesuaikan sekali di sini bila ukuran card frontend berubah
BANNER_CROP_WIDTH = 3150
BANNER_CROP_HEIGHT = 900
BANNER_ALLOWED_VIDEO_RATIO = BANNER_CROP_WIDTH / BANNER_CROP_HEIGHT

BERITA_THUMB_CROP_WIDTH = 1450
BERITA_THUMB_CROP_HEIGHT = 1000

BERITA_DETAIL_CROP_WIDTH = 1600
BERITA_DETAIL_CROP_HEIGHT = 900

STATUS_MAP = {
    "AKTIF": "Aktif",
    "NONAKTIF": "Nonaktif",
}

BERITA_UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads", "berita")
BANNER_UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads", "banner_informasi")


app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Dinaikkan agar banner sampai 400 MB tidak ditolak Flask lebih dulu
app.config["MAX_CONTENT_LENGTH"] = (BANNER_MAX_FILE_SIZE_MB + 10) * 1024 * 1024

DB_USER = env_value("DB_USER", "postgres")
DB_PASSWORD = env_value("DB_PASSWORD", "")
DB_HOST = env_value("DB_HOST", "localhost")
DB_PORT = env_value("DB_PORT", "5432")
DB_NAME = env_value("DB_NAME", "fftuasn_admin")

ADMIN_EMAIL = env_value("ADMIN_EMAIL", "admin@fft.dev").strip().lower()
ADMIN_PASSWORD = env_value("ADMIN_PASSWORD", "")
ADMIN_PASSWORD_HASH = env_value("ADMIN_PASSWORD_HASH", "")

MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_SECONDS = 15 * 60
LOGIN_ATTEMPTS = {}

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"postgresql+psycopg2://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Database configuration from environment.
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    app.config.get("SQLALCHEMY_DATABASE_URI", "sqlite:///fftuasn_local.db"),
)

db = SQLAlchemy(app)


class Dekan(db.Model):
    __tablename__ = "dekan"

    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.String(150), nullable=False)
    jabatan = db.Column(
        db.String(150),
        nullable=False,
        default="Dekan Fakultas Filsafat Teologi",
    )
    status = db.Column(db.String(150), nullable=False)
    tempat_lahir = db.Column(db.String(150), nullable=False)
    tanggal_lahir = db.Column(db.String(150), nullable=False)

    # foto formal 3x4 untuk biodata/export
    foto = db.Column(db.String(255), nullable=True)

    # foto khusus card/frontend publik
    foto_frontend = db.Column(db.String(255), nullable=True)

    biodata_card = db.Column(db.String(255), nullable=True)

    # status publish frontend
    is_published = db.Column(db.Boolean, nullable=False, default=False)
    needs_publish = db.Column(db.Boolean, nullable=False, default=True)
    published_at = db.Column(db.DateTime, nullable=True)

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class Dosen(db.Model):
    __tablename__ = "dosen"

    id = db.Column(db.Integer, primary_key=True)
    kode_dosen = db.Column(db.String(5), unique=True, nullable=False)
    nuptk = db.Column(db.String(50), nullable=True)
    nama = db.Column(db.String(150), nullable=False)
    jabatan = db.Column(db.String(150), nullable=False)
    bidang_dosen = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(150), nullable=False)
    tempat_lahir = db.Column(db.String(150), nullable=False)
    tanggal_lahir = db.Column(db.String(150), nullable=False)

    # foto formal biodata
    foto = db.Column(db.String(255), nullable=True)

    # thumbnail frontend
    thumb = db.Column(db.String(255), nullable=True)

    biodata_card = db.Column(db.String(255), nullable=True)

    # status publish frontend
    is_published = db.Column(db.Boolean, nullable=False, default=False)
    needs_publish = db.Column(db.Boolean, nullable=False, default=True)
    published_at = db.Column(db.DateTime, nullable=True)

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class SiteSetting(db.Model):
    __tablename__ = "site_setting"

    id = db.Column(db.Integer, primary_key=True)
    needs_publish = db.Column(db.Boolean, nullable=False, default=False)
    last_updated_at = db.Column(db.DateTime, nullable=True)
    last_published_at = db.Column(db.DateTime, nullable=True)


class Berita(db.Model):
    __tablename__ = "berita"

    id = db.Column(db.Integer, primary_key=True)

    kode_berita = db.Column(db.String(5), unique=True, nullable=True)

    judul = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    subjudul = db.Column(db.String(255), nullable=True)
    isi = db.Column(db.Text, nullable=False)

    thumbnail = db.Column(db.String(255), nullable=True)
    gambar_detail = db.Column(db.String(255), nullable=True)

    # status editorial
    is_published = db.Column(db.Boolean, nullable=False, default=False)
    needs_publish = db.Column(db.Boolean, nullable=False, default=True)

    # tanggal dibuat
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # tanggal pertama benar-benar rilis ke frontend
    published_at = db.Column(db.DateTime, nullable=True)

    # jadwal tayang
    tayang_pada = db.Column(db.DateTime, nullable=True)

    # Publishing management status.
    # draft      = tersimpan di admin, belum tampil frontend
    # scheduled  = dijadwalkan, belum tampil frontend
    # published  = sudah tampil frontend
    # archived   = disembunyikan dari frontend
    # failed     = gagal publish otomatis
    publish_status = db.Column(db.String(30), nullable=False, default="draft")
    scheduled_at = db.Column(db.DateTime, nullable=True)
    last_previewed_at = db.Column(db.DateTime, nullable=True)

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # legacy aman, tapi tidak dipakai lagi untuk trending manual
    group_type = db.Column(db.String(20), nullable=False, default="umum")

    # badge NEW
    is_new = db.Column(db.Boolean, nullable=False, default=False)
    new_until = db.Column(db.DateTime, nullable=True)

    # analytics / trending otomatis
    click_count = db.Column(db.Integer, nullable=False, default=0)


class BannerInformasi(db.Model):
    __tablename__ = "banner_informasi"

    id = db.Column(db.Integer, primary_key=True)

    # legacy internal, tetap disimpan agar migrasi aman
    judul_internal = db.Column(db.String(255), nullable=False, default="Banner Utama")

    # image / video
    media_type = db.Column(db.String(20), nullable=False, default="image")

    # path file media utama (single upload)
    media_file = db.Column(db.String(255), nullable=True)

    # legacy, tidak dipakai lagi di form
    poster_file = db.Column(db.String(255), nullable=True)

    # link tujuan saat banner diklik
    target_url = db.Column(db.String(500), nullable=True)

    # legacy, tidak dipakai dulu
    link_test_status = db.Column(db.String(50), nullable=True)
    link_test_message = db.Column(db.String(255), nullable=True)
    link_tested_at = db.Column(db.DateTime, nullable=True)

    # legacy, tetap ada agar aman
    is_active = db.Column(db.Boolean, nullable=False, default=False)

    # legacy single-entry, tetap ada agar aman
    sort_order = db.Column(db.Integer, nullable=False, default=1)

    # status publish frontend
    is_published = db.Column(db.Boolean, nullable=False, default=False)
    needs_publish = db.Column(db.Boolean, nullable=False, default=True)
    published_at = db.Column(db.DateTime, nullable=True)

    # Publishing management.
    # draft      = tersimpan sebagai draft, belum tampil di website
    # scheduled  = dijadwalkan, belum tampil di website
    # published  = sudah tampil di website
    # archived   = disembunyikan dari website
    # failed     = gagal publish otomatis
    publish_status = db.Column(db.String(30), nullable=False, default="draft")
    scheduled_at = db.Column(db.DateTime, nullable=True)
    last_previewed_at = db.Column(db.DateTime, nullable=True)

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


def is_logged_in():
    return session.get("is_logged_in", False)



class BannerStock(db.Model):
    __tablename__ = "banner_stock"

    id = db.Column(db.Integer, primary_key=True)
    media_type = db.Column(db.String(20), nullable=False, default="image")
    media_file = db.Column(db.String(255), nullable=False)
    target_url = db.Column(db.String(500), nullable=True)
    note = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(30), nullable=False, default="stock")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
    last_previewed_at = db.Column(db.DateTime, nullable=True)
    activated_at = db.Column(db.DateTime, nullable=True)


def get_client_ip():
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.remote_addr or "unknown"


def clear_old_login_attempts():
    now = time()
    expired = [
        ip
        for ip, data in LOGIN_ATTEMPTS.items()
        if now - data.get("last_attempt", 0) > LOCKOUT_SECONDS
    ]
    for ip in expired:
        LOGIN_ATTEMPTS.pop(ip, None)


def is_ip_locked(ip):
    clear_old_login_attempts()
    info = LOGIN_ATTEMPTS.get(ip)

    if not info:
        return False, 0

    if info.get("count", 0) < MAX_LOGIN_ATTEMPTS:
        return False, 0

    remaining = int(LOCKOUT_SECONDS - (time() - info.get("last_attempt", 0)))
    if remaining <= 0:
        LOGIN_ATTEMPTS.pop(ip, None)
        return False, 0

    return True, remaining


def register_failed_login(ip):
    data = LOGIN_ATTEMPTS.get(ip, {"count": 0, "last_attempt": 0})
    data["count"] += 1
    data["last_attempt"] = time()
    LOGIN_ATTEMPTS[ip] = data


def clear_failed_login(ip):
    LOGIN_ATTEMPTS.pop(ip, None)


def verify_admin_password(plain_password):
    if ADMIN_PASSWORD_HASH:
        return check_password_hash(ADMIN_PASSWORD_HASH, plain_password)

    if ADMIN_PASSWORD:
        return hmac.compare_digest(ADMIN_PASSWORD, plain_password)

    return False


@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


def get_site_setting():
    setting = SiteSetting.query.first()
    if not setting:
        setting = SiteSetting(
            needs_publish=False,
            last_updated_at=None,
            last_published_at=None,
        )
        db.session.add(setting)
        db.session.commit()
    return setting


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def ensure_berita_upload_folder():
    os.makedirs(BERITA_UPLOAD_FOLDER, exist_ok=True)


def get_berita_folder(kode_berita):
    return os.path.join(BERITA_UPLOAD_FOLDER, kode_berita)


def ensure_banner_upload_folder():
    os.makedirs(BANNER_UPLOAD_FOLDER, exist_ok=True)


def get_banner_single_folder():
    folder_path = os.path.join(BANNER_UPLOAD_FOLDER, "single")
    os.makedirs(folder_path, exist_ok=True)
    return folder_path


def is_allowed_banner_media_file(filename, media_type):
    if "." not in filename:
        return False

    ext = filename.rsplit(".", 1)[1].lower()

    if media_type == "image":
        return ext in ALLOWED_EXTENSIONS

    if media_type == "video":
        return ext in ALLOWED_VIDEO_EXTENSIONS

    return False


def get_uploaded_file_size(file_storage):
    if not file_storage or not hasattr(file_storage, "stream"):
        return 0

    current_position = file_storage.stream.tell()
    file_storage.stream.seek(0, os.SEEK_END)
    size = file_storage.stream.tell()
    file_storage.stream.seek(current_position)
    return size


def validate_target_url(target_url):
    if not target_url:
        return False, "Target URL wajib diisi."

    parsed = urlparse(target_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return False, "Target URL harus memakai http:// atau https://"

    return True, ""


def clear_old_banner_media_files(folder_path):
    removable_exts = ALLOWED_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS | {"jpg"}
    for old_ext in removable_exts:
        old_file = os.path.join(folder_path, f"media.{old_ext}")
        if os.path.exists(old_file):
            try:
                os.remove(old_file)
            except OSError:
                pass


def save_cropped_banner_image(crop_data, folder_path):
    try:
        _, encoded = crop_data.split(",", 1)
        binary = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(binary)).convert("RGB")
        image = image.resize((3150, 900), Image.LANCZOS)

        filename = "media.jpg"
        absolute_path = os.path.join(folder_path, filename)
        image.save(absolute_path, format="JPEG", quality=92, optimize=True)

        return f"uploads/banner_informasi/single/{filename}"
    except (ValueError, binascii.Error, OSError):
        return None


def save_banner_media_file(file_storage, media_type, crop_data=""):
    folder_path = get_banner_single_folder()

    if media_type == "image" and crop_data:
        clear_old_banner_media_files(folder_path)

        cropped_path = save_cropped_banner_image(crop_data, folder_path)
        if not cropped_path:
            return False, None, "Crop gambar banner gagal diproses."

        return True, cropped_path, ""

    if not file_storage or not file_storage.filename:
        return True, None, ""

    if not is_allowed_banner_media_file(file_storage.filename, media_type):
        if media_type == "image":
            return (
                False,
                None,
                "Format image tidak valid. Gunakan PNG, JPG, JPEG, atau WEBP.",
            )
        return (
            False,
            None,
            "Format video tidak valid. Gunakan MP4, WEBM, atau MOV.",
        )

    file_size = get_uploaded_file_size(file_storage)
    if file_size > BANNER_MAX_FILE_SIZE:
        return (
            False,
            None,
            f"Ukuran file melebihi {BANNER_MAX_FILE_SIZE_MB} MB.",
        )

    clear_old_banner_media_files(folder_path)

    ext = file_storage.filename.rsplit(".", 1)[1].lower()
    filename = f"media.{ext}"
    absolute_path = os.path.join(folder_path, filename)

    file_storage.stream.seek(0)
    file_storage.save(absolute_path)

    return True, f"uploads/banner_informasi/single/{filename}", ""


def delete_banner_file(relative_path):
    if not relative_path:
        return

    absolute_path = os.path.join(BASE_DIR, "static", relative_path)

    if os.path.exists(absolute_path) and os.path.isfile(absolute_path):
        try:
            os.remove(absolute_path)
        except OSError:
            pass


def get_or_create_banner_single():
    banner = BannerInformasi.query.order_by(BannerInformasi.id.asc()).first()

    if not banner:
        banner = BannerInformasi(
            judul_internal="Banner Utama",
            media_type="image",
            media_file=None,
            poster_file=None,
            target_url=None,
            is_active=False,
            sort_order=1,
            is_published=False,
            needs_publish=True,
            published_at=None,
        )
        db.session.add(banner)
        db.session.commit()

    return banner


def generate_berita_slug(judul, exclude_id=None):
    slug = judul.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")

    if not slug:
        slug = f"berita-{uuid.uuid4().hex[:8]}"

    base_slug = slug
    counter = 2

    while True:
        query = Berita.query.filter_by(slug=slug)

        if exclude_id is not None:
            query = query.filter(Berita.id != exclude_id)

        existing = query.first()
        if not existing:
            break

        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug


def generate_next_kode_berita():
    last_berita = (
        Berita.query.filter(Berita.kode_berita.isnot(None))
        .order_by(cast(Berita.kode_berita, Integer).desc())
        .first()
    )

    if not last_berita or not last_berita.kode_berita:
        return "00001"

    try:
        next_number = int(last_berita.kode_berita) + 1
    except ValueError:
        next_number = 1

    return str(next_number).zfill(5)


def save_berita_file(file_storage, kode_berita, prefix_name):
    if not file_storage or not file_storage.filename:
        return None

    if not allowed_file(file_storage.filename):
        return False

    folder_path = get_berita_folder(kode_berita)
    os.makedirs(folder_path, exist_ok=True)
    clear_old_berita_variant_files(folder_path, prefix_name)

    ext = file_storage.filename.rsplit(".", 1)[1].lower()
    filename = f"{prefix_name}.{ext}"
    absolute_path = os.path.join(folder_path, filename)

    file_storage.stream.seek(0)
    file_storage.save(absolute_path)

    return f"uploads/berita/{kode_berita}/{filename}"


def clear_old_berita_variant_files(folder_path, prefix_name):
    for old_ext in ALLOWED_EXTENSIONS | {"jpg"}:
        old_file = os.path.join(folder_path, f"{prefix_name}.{old_ext}")
        if os.path.exists(old_file):
            try:
                os.remove(old_file)
            except OSError:
                pass


def save_cropped_berita_variant(crop_data, kode_berita, prefix_name, width, height):
    try:
        folder_path = get_berita_folder(kode_berita)
        os.makedirs(folder_path, exist_ok=True)
        clear_old_berita_variant_files(folder_path, prefix_name)

        _, encoded = crop_data.split(",", 1)
        binary = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(binary)).convert("RGB")
        image = image.resize((width, height), Image.LANCZOS)

        filename = f"{prefix_name}.jpg"
        absolute_path = os.path.join(folder_path, filename)
        image.save(absolute_path, format="JPEG", quality=92, optimize=True)

        return f"uploads/berita/{kode_berita}/{filename}"
    except (ValueError, binascii.Error, OSError):
        return None


def save_berita_thumbnail(file_storage, kode_berita, crop_data=""):
    if crop_data:
        cropped_path = save_cropped_berita_variant(
            crop_data,
            kode_berita,
            "thumbnail",
            BERITA_THUMB_CROP_WIDTH,
            BERITA_THUMB_CROP_HEIGHT,
        )
        if not cropped_path:
            return False
        return cropped_path

    if not file_storage or not file_storage.filename:
        return None

    return save_berita_file(file_storage, kode_berita, "thumbnail")


def save_berita_detail(file_storage, kode_berita, crop_data=""):
    if crop_data:
        cropped_path = save_cropped_berita_variant(
            crop_data,
            kode_berita,
            "detail",
            BERITA_DETAIL_CROP_WIDTH,
            BERITA_DETAIL_CROP_HEIGHT,
        )
        if not cropped_path:
            return False
        return cropped_path

    if not file_storage or not file_storage.filename:
        return None

    return save_berita_file(file_storage, kode_berita, "detail")


def delete_berita_file(relative_path):
    if not relative_path:
        return

    absolute_path = os.path.join(BASE_DIR, "static", relative_path)

    if os.path.exists(absolute_path) and os.path.isfile(absolute_path):
        try:
            os.remove(absolute_path)
        except OSError:
            pass


def delete_berita_folder(kode_berita):
    if not kode_berita:
        return

    folder_path = get_berita_folder(kode_berita)
    if os.path.exists(folder_path) and os.path.isdir(folder_path):
        shutil.rmtree(folder_path)


def migrate_existing_berita_files():
    berita_list = Berita.query.order_by(Berita.id.asc()).all()
    changed = False

    for berita in berita_list:
        kode_berita = berita.kode_berita
        if not kode_berita:
            continue

        folder_path = get_berita_folder(kode_berita)
        os.makedirs(folder_path, exist_ok=True)

        if berita.thumbnail and berita.thumbnail.startswith(
            "uploads/berita/thumbnail/"
        ):
            old_abs = os.path.join(BASE_DIR, "static", berita.thumbnail)

            if os.path.exists(old_abs) and os.path.isfile(old_abs):
                ext = old_abs.rsplit(".", 1)[1].lower()
                new_rel = f"uploads/berita/{kode_berita}/thumbnail.{ext}"
                new_abs = os.path.join(BASE_DIR, "static", new_rel)

                for old_ext in ALLOWED_EXTENSIONS:
                    candidate = os.path.join(folder_path, f"thumbnail.{old_ext}")
                    if os.path.exists(candidate):
                        try:
                            os.remove(candidate)
                        except OSError:
                            pass

                shutil.move(old_abs, new_abs)
                berita.thumbnail = new_rel
                changed = True

        if berita.gambar_detail and berita.gambar_detail.startswith(
            "uploads/berita/detail/"
        ):
            old_abs = os.path.join(BASE_DIR, "static", berita.gambar_detail)

            if os.path.exists(old_abs) and os.path.isfile(old_abs):
                ext = old_abs.rsplit(".", 1)[1].lower()
                new_rel = f"uploads/berita/{kode_berita}/detail.{ext}"
                new_abs = os.path.join(BASE_DIR, "static", new_rel)

                for old_ext in ALLOWED_EXTENSIONS:
                    candidate = os.path.join(folder_path, f"detail.{old_ext}")
                    if os.path.exists(candidate):
                        try:
                            os.remove(candidate)
                        except OSError:
                            pass

                shutil.move(old_abs, new_abs)
                berita.gambar_detail = new_rel
                changed = True

    if changed:
        db.session.commit()



# === PUBLISHING STATUS FOUNDATION START ===

PUBLISH_STATUS_DRAFT = "draft"
PUBLISH_STATUS_SCHEDULED = "scheduled"
PUBLISH_STATUS_PUBLISHED = "published"
PUBLISH_STATUS_ARCHIVED = "archived"
PUBLISH_STATUS_FAILED = "failed"

PUBLISH_STATUS_SET = {
    PUBLISH_STATUS_DRAFT,
    PUBLISH_STATUS_SCHEDULED,
    PUBLISH_STATUS_PUBLISHED,
    PUBLISH_STATUS_ARCHIVED,
    PUBLISH_STATUS_FAILED,
}


def normalize_publish_status(value, fallback=PUBLISH_STATUS_DRAFT):
    raw = (value or "").strip().lower()
    return raw if raw in PUBLISH_STATUS_SET else fallback


def infer_publish_status(is_published=False, needs_publish=True, scheduled_at=None, published_at=None):
    if scheduled_at and not published_at:
        return PUBLISH_STATUS_SCHEDULED

    if is_published and not needs_publish:
        return PUBLISH_STATUS_PUBLISHED

    return PUBLISH_STATUS_DRAFT


def mark_content_as_draft(item):
    item.publish_status = PUBLISH_STATUS_DRAFT
    item.is_published = False
    item.needs_publish = True
    item.scheduled_at = None
    item.published_at = None


def mark_content_as_scheduled(item, scheduled_at):
    item.publish_status = PUBLISH_STATUS_SCHEDULED
    item.is_published = False
    item.needs_publish = True
    item.scheduled_at = scheduled_at
    item.published_at = None


def mark_content_as_published(item, published_at=None):
    now = published_at or datetime.utcnow()
    item.publish_status = PUBLISH_STATUS_PUBLISHED
    item.is_published = True
    item.needs_publish = False
    item.scheduled_at = None
    item.published_at = now


def mark_content_previewed(item):
    item.last_previewed_at = datetime.utcnow()


# === PUBLISHING STATUS FOUNDATION END ===


def normalize_status(value):
    raw = (value or "").strip()
    if not raw:
        return ""
    return STATUS_MAP.get(raw.upper(), raw)


def ensure_upload_root():
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)


def ensure_dekan_upload_folder():
    os.makedirs(DEKAN_UPLOAD_FOLDER, exist_ok=True)


def ensure_published_folder():
    os.makedirs(PUBLISHED_FOLDER, exist_ok=True)


def get_published_dekan_json_path():
    ensure_published_folder()
    return os.path.join(PUBLISHED_FOLDER, "dekan.json")


def get_published_berita_json_path():
    ensure_published_folder()
    return os.path.join(PUBLISHED_FOLDER, "berita.json")


def get_published_banner_json_path():
    ensure_published_folder()
    return os.path.join(PUBLISHED_FOLDER, "banner_informasi.json")


def publish_banner_snapshot(banner):
    ensure_published_folder()

    payload = {
        "published": True,
        "published_at": datetime.utcnow().isoformat(),
        "data": {
            "media_type": banner.media_type or "image",
            "media_file": banner.media_file or "",
            "target_url": banner.target_url or "",
            "updated_at": banner.updated_at.isoformat() if banner.updated_at else None,
            "published_at": (
                banner.published_at.isoformat() if banner.published_at else None
            ),
        },
    }

    output_path = get_published_banner_json_path()

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return output_path


def sync_berita_runtime_states():
    now = datetime.utcnow()
    changed = False

    due_list = Berita.query.filter(
        Berita.is_published.is_(True), Berita.needs_publish.is_(False)
    ).all()

    for berita in due_list:
        if berita.published_at is None and (
            berita.tayang_pada is None or berita.tayang_pada <= now
        ):
            berita.published_at = now
            changed = True

    if changed:
        db.session.commit()

    return now


def build_berita_payload():
    now = sync_berita_runtime_states()

    berita_list = (
        Berita.query.filter(
            Berita.is_published.is_(True), Berita.needs_publish.is_(False)
        )
        .order_by(
            cast(Berita.kode_berita, Integer).desc(),
            Berita.created_at.desc(),
            Berita.id.desc(),
        )
        .all()
    )

    payload = {
        "published": True,
        "published_at": now.isoformat(),
        "banner": [],
        "trending": [],
        "umum": [],
    }

    all_items = []

    for b in berita_list:
        new_badge_active = bool(b.is_new and (not b.new_until or b.new_until >= now))
        is_live_now = bool(b.tayang_pada is None or b.tayang_pada <= now)

        item = {
            "id": b.id,
            "kode_berita": b.kode_berita or "",
            "judul": b.judul or "",
            "slug": b.slug or "",
            "subjudul": b.subjudul or "",
            "isi": b.isi or "",
            "thumbnail": b.thumbnail or "",
            "gambar_detail": b.gambar_detail or "",
            "created_at": b.created_at.isoformat() if b.created_at else None,
            "updated_at": b.updated_at.isoformat() if b.updated_at else None,
            "published_at": b.published_at.isoformat() if b.published_at else None,
            "tayang_pada": b.tayang_pada.isoformat() if b.tayang_pada else None,
            "group_type": "umum",
            "is_new": new_badge_active,
            "title_tag": "NEW TITLE" if new_badge_active else "",
            "new_until": b.new_until.isoformat() if b.new_until else None,
            "click_count": b.click_count or 0,
            "is_live_now": is_live_now,
        }
        all_items.append(item)

    live_items = [item for item in all_items if item["is_live_now"]]

    trending_items = sorted(
        live_items,
        key=lambda item: (
            item["click_count"],
            item["published_at"] or "",
            item["created_at"] or "",
        ),
        reverse=True,
    )[:2]

    trending_ids = {item["id"] for item in trending_items}
    umum_items = [item for item in all_items if item["id"] not in trending_ids]

    payload["trending"] = trending_items
    payload["umum"] = umum_items

    return payload


def publish_berita_snapshot():
    payload = build_berita_payload()
    output_path = get_published_berita_json_path()

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return output_path


def get_dosen_folder(kode_dosen):
    return os.path.join(app.config["UPLOAD_FOLDER"], kode_dosen)


def get_absolute_upload_path(relative_path):
    if not relative_path:
        return None
    return os.path.join(app.config["UPLOAD_FOLDER"], relative_path)


def get_biodata_card_path(kode_dosen):
    return os.path.join(get_dosen_folder(kode_dosen), "biodata_card.png")


def get_dekan_photo_absolute_path(relative_path):
    if not relative_path:
        return None
    return os.path.join(BASE_DIR, "static", relative_path)


def save_dekan_variant(file_storage, prefix_name):
    if not file_storage or not file_storage.filename:
        return None

    if not allowed_file(file_storage.filename):
        return False

    ensure_dekan_upload_folder()

    ext = file_storage.filename.rsplit(".", 1)[1].lower()

    # hapus file lama dengan prefix yang sama
    for existing_name in os.listdir(DEKAN_UPLOAD_FOLDER):
        if existing_name.lower().startswith(f"{prefix_name}_"):
            existing_path = os.path.join(DEKAN_UPLOAD_FOLDER, existing_name)
            if os.path.isfile(existing_path):
                try:
                    os.remove(existing_path)
                except OSError:
                    pass

    filename = f"{prefix_name}_{uuid.uuid4().hex[:12]}.{ext}"
    absolute_path = os.path.join(DEKAN_UPLOAD_FOLDER, filename)
    file_storage.save(absolute_path)

    return f"uploads/dekan/{filename}"


def save_dekan_photo(file_storage):
    return save_dekan_variant(file_storage, "dekan_formal")


def save_dekan_frontend_photo(file_storage):
    return save_dekan_variant(file_storage, "dekan_frontend")


def delete_dekan_file(relative_path):
    absolute_path = get_dekan_photo_absolute_path(relative_path)
    if absolute_path and os.path.exists(absolute_path):
        try:
            os.remove(absolute_path)
        except OSError:
            pass


def get_dekan_biodata_card_absolute_path():
    ensure_dekan_upload_folder()
    return os.path.join(DEKAN_UPLOAD_FOLDER, "biodata_dekan.png")


def publish_dekan_snapshot(dekan):
    ensure_published_folder()

    payload = {
        "nama": dekan.nama or "",
        "jabatan": dekan.jabatan or "Dekan Fakultas Filsafat Teologi",
        "status": dekan.status or "",
        "tempat_lahir": dekan.tempat_lahir or "",
        "tanggal_lahir": dekan.tanggal_lahir or "",
        "foto_formal": dekan.foto,
        "foto_frontend": dekan.foto_frontend or dekan.foto,
        "updated_at": dekan.updated_at.isoformat() if dekan.updated_at else None,
        "published_at": datetime.utcnow().isoformat(),
    }

    output_path = get_published_dekan_json_path()
    with open(output_path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)

    return output_path


def publish_dosen_snapshot():
    ensure_published_folder()

    dosen_list = Dosen.query.order_by(cast(Dosen.kode_dosen, Integer).asc()).all()

    data = []

    for d in dosen_list:
        item = {
            "kode_dosen": d.kode_dosen,
            "nama": d.nama or "",
            "jabatan": d.jabatan or "Dosen",
            "status": d.status or "",
            "bidang_dosen": d.bidang_dosen or "",
            "tempat_lahir": d.tempat_lahir or "",
            "tanggal_lahir": d.tanggal_lahir or "",
            "foto_formal": d.foto,
            "foto_frontend": d.thumb or d.foto,
            "updated_at": d.updated_at.isoformat() if d.updated_at else None,
        }
        data.append(item)

    payload = {
        "published": True,
        "total": len(data),
        "data": data,
        "published_at": datetime.utcnow().isoformat(),
    }

    output_path = get_published_dosen_json_path()

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return output_path


def generate_next_kode_dosen():
    last_dosen = (
        Dosen.query.filter(Dosen.kode_dosen.isnot(None))
        .order_by(cast(Dosen.kode_dosen, Integer).desc())
        .first()
    )

    if not last_dosen or not last_dosen.kode_dosen:
        return "00001"

    try:
        next_number = int(last_dosen.kode_dosen) + 1
    except ValueError:
        next_number = 1

    return str(next_number).zfill(5)


def get_font(size=32, bold=False):
    candidates_bold = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
    ]
    candidates_regular = [
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
    ]

    candidates = candidates_bold if bold else candidates_regular

    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)

    return ImageFont.load_default()


def wrap_text_by_width(draw, text, font, max_width):
    if not text:
        return ["-"]

    words = str(text).split()
    if not words:
        return ["-"]

    lines = []
    current = words[0]

    for word in words[1:]:
        test_line = f"{current} {word}"
        bbox = draw.textbbox((0, 0), test_line, font=font)
        width = bbox[2] - bbox[0]

        if width <= max_width:
            current = test_line
        else:
            lines.append(current)
            current = word

    lines.append(current)
    return lines


def fit_image_cover(img, target_size):
    target_w, target_h = target_size
    src_w, src_h = img.size

    src_ratio = src_w / src_h
    target_ratio = target_w / target_h

    if src_ratio > target_ratio:
        new_h = target_h
        new_w = int(new_h * src_ratio)
    else:
        new_w = target_w
        new_h = int(new_w / src_ratio)

    resized = img.resize((new_w, new_h), Image.LANCZOS)

    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    right = left + target_w
    bottom = top + target_h

    return resized.crop((left, top, right, bottom))


def save_uploaded_variant(file_storage, kode_dosen, prefix_name):
    if not file_storage or not file_storage.filename:
        return None

    if not allowed_file(file_storage.filename):
        return False

    ext = file_storage.filename.rsplit(".", 1)[1].lower()
    folder_path = get_dosen_folder(kode_dosen)
    os.makedirs(folder_path, exist_ok=True)

    for old_ext in ALLOWED_EXTENSIONS:
        old_file = os.path.join(folder_path, f"{prefix_name}.{old_ext}")
        if os.path.exists(old_file):
            os.remove(old_file)

    filename = f"{prefix_name}.{ext}"
    save_path = os.path.join(folder_path, filename)
    file_storage.save(save_path)

    return f"{kode_dosen}/{filename}"


def save_uploaded_photo(file_storage, kode_dosen):
    return save_uploaded_variant(file_storage, kode_dosen, "foto")


def save_uploaded_thumb(file_storage, kode_dosen):
    return save_uploaded_variant(file_storage, kode_dosen, "thumb")


def delete_dosen_folder(kode_dosen):
    if not kode_dosen:
        return

    folder_path = get_dosen_folder(kode_dosen)
    if os.path.exists(folder_path) and os.path.isdir(folder_path):
        shutil.rmtree(folder_path)


def load_logo(path, size):
    if not os.path.exists(path):
        return None
    logo = Image.open(path).convert("RGBA")
    logo.thumbnail(size, Image.LANCZOS)
    return logo


def paste_logo(image, logo, x, y):
    if logo:
        image.paste(logo, (x, y), logo)


def draw_profile_rows(
    draw,
    rows,
    start_x,
    start_y,
    max_width,
    label_font,
    value_font,
    line_color="#ccb680",
):
    y = start_y
    label_width = 255
    value_x = start_x + label_width + 26

    for label, value in rows:
        value_lines = wrap_text_by_width(
            draw, value or "-", value_font, max_width - label_width - 26
        )

        draw.text((start_x, y), f"{label}", font=label_font, fill="#1d1d1d")
        draw.text((value_x, y), value_lines[0], font=value_font, fill="#2f2f2f")

        line_height = (
            max(
                draw.textbbox((0, 0), "Ag", font=label_font)[3],
                draw.textbbox((0, 0), "Ag", font=value_font)[3],
            )
            + 10
        )

        current_y = y
        for line in value_lines[1:]:
            current_y += line_height
            draw.text((value_x, current_y), line, font=value_font, fill="#2f2f2f")

        bottom_y = current_y + line_height + 8
        draw.line(
            (start_x, bottom_y, start_x + max_width, bottom_y), fill=line_color, width=2
        )

        y = bottom_y + 22

    return y


def draw_framed_photo(image, photo_path, box):
    draw = ImageDraw.Draw(image)
    outer = box
    inner = (box[0] + 12, box[1] + 12, box[2] - 12, box[3] - 12)

    draw.rectangle(outer, fill="#4f2f1b", outline="#2f190d", width=4)
    draw.rectangle(
        (outer[0] + 6, outer[1] + 6, outer[2] - 6, outer[3] - 6),
        outline="#9f7a45",
        width=3,
    )
    draw.rectangle(inner, fill="#121212")

    if photo_path and os.path.exists(photo_path):
        foto = Image.open(photo_path).convert("RGB")
        foto = fit_image_cover(foto, (inner[2] - inner[0], inner[3] - inner[1]))
        image.paste(foto, (inner[0], inner[1]))
    else:
        placeholder_draw = ImageDraw.Draw(image)
        font = get_font(22, bold=False)
        text = "Foto belum tersedia"
        bbox = placeholder_draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        x = inner[0] + ((inner[2] - inner[0]) - text_w) // 2
        y = inner[1] + ((inner[3] - inner[1]) - text_h) // 2
        placeholder_draw.text((x, y), text, font=font, fill="#d9d9d9")


def generate_profile_card(data, photo_path, output_path, title, subtitle):
    canvas_width = 1600
    canvas_height = 1000

    image = Image.new("RGB", (canvas_width, canvas_height), "#f4f1ea")
    draw = ImageDraw.Draw(image)

    draw.rounded_rectangle(
        [34, 34, canvas_width - 34, canvas_height - 34],
        radius=26,
        fill="#fcfbf8",
        outline="#d8c7a1",
        width=3,
    )

    logo_left = load_logo(
        os.path.join(BASE_DIR, "templates", "uasnlogo.png"), (180, 180)
    )
    logo_right = load_logo(
        os.path.join(BASE_DIR, "templates", "himafft.png"), (220, 150)
    )
    paste_logo(image, logo_left, 70, 48)
    paste_logo(image, logo_right, canvas_width - 280, 52)

    title_font = get_font(42, bold=True)
    subtitle_font = get_font(28, bold=False)
    label_font = get_font(27, bold=True)
    value_font = get_font(27, bold=False)
    footer_font = get_font(18, bold=False)

    draw.text((70, 240), title, font=title_font, fill="#3f3a32")
    draw.text((70, 300), subtitle, font=subtitle_font, fill="#4f4a42")

    rows = [
        ("Nama Lengkap", data.get("nama", "-")),
        ("Jabatan", data.get("jabatan", "-")),
        ("Status Kepegawaian", data.get("status", "-")),
        ("Tempat Lahir", data.get("tempat_lahir", "-")),
        ("Tanggal Lahir", data.get("tanggal_lahir", "-")),
    ]

    draw_profile_rows(
        draw,
        rows,
        start_x=70,
        start_y=410,
        max_width=820,
        label_font=label_font,
        value_font=value_font,
    )

    draw_framed_photo(image, photo_path, (1110, 270, 1460, 760))

    draw.text(
        (70, 930),
        "Dokumen digenerate otomatis melalui dashboard admin Fakultas Filsafat Teologi.",
        font=footer_font,
        fill="#726b60",
    )

    image.save(output_path, format="PNG", optimize=True)


def generate_biodata_card(dosen):
    folder_path = get_dosen_folder(dosen.kode_dosen)
    os.makedirs(folder_path, exist_ok=True)

    output_path = get_biodata_card_path(dosen.kode_dosen)
    photo_path = get_absolute_upload_path(dosen.foto)

    data = {
        "nama": dosen.nama or "-",
        "jabatan": dosen.jabatan or "-",
        "status": dosen.status or "-",
        "tempat_lahir": dosen.tempat_lahir or "-",
        "tanggal_lahir": dosen.tanggal_lahir or "-",
    }

    generate_profile_card(
        data=data,
        photo_path=photo_path,
        output_path=output_path,
        title="UNDUH BIODATA DOSEN",
        subtitle="FAKULTAS FILSAFAT TEOLOGI",
    )

    dosen.biodata_card = f"{dosen.kode_dosen}/biodata_card.png"
    db.session.commit()
    return output_path


def generate_dekan_biodata_card(dekan):
    output_path = get_dekan_biodata_card_absolute_path()
    photo_path = get_dekan_photo_absolute_path(dekan.foto)

    data = {
        "nama": dekan.nama or "-",
        "jabatan": "Dekan Fakultas Filsafat Teologi",
        "status": dekan.status or "-",
        "tempat_lahir": dekan.tempat_lahir or "-",
        "tanggal_lahir": dekan.tanggal_lahir or "-",
    }

    generate_profile_card(
        data=data,
        photo_path=photo_path,
        output_path=output_path,
        title="UNDUH BIODATA DEKAN",
        subtitle="FAKULTAS FILSAFAT TEOLOGI",
    )

    dekan.biodata_card = "uploads/dekan/biodata_dekan.png"
    db.session.commit()
    return output_path


def sync_dekan_schema():
    inspector = inspect(db.engine)
    table_names = inspector.get_table_names()

    if "dekan" not in table_names:
        db.create_all()
        return

    columns = {col["name"] for col in inspector.get_columns("dekan")}
    statements = []

    if "foto" not in columns:
        statements.append(text("ALTER TABLE dekan ADD COLUMN foto VARCHAR(255)"))

    if "foto_frontend" not in columns:
        statements.append(
            text("ALTER TABLE dekan ADD COLUMN foto_frontend VARCHAR(255)")
        )

    if "biodata_card" not in columns:
        statements.append(
            text("ALTER TABLE dekan ADD COLUMN biodata_card VARCHAR(255)")
        )

    if "is_published" not in columns:
        statements.append(
            text(
                "ALTER TABLE dekan ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT FALSE"
            )
        )

    if "needs_publish" not in columns:
        statements.append(
            text(
                "ALTER TABLE dekan ADD COLUMN needs_publish BOOLEAN NOT NULL DEFAULT TRUE"
            )
        )

    if "published_at" not in columns:
        statements.append(text("ALTER TABLE dekan ADD COLUMN published_at TIMESTAMP"))

    if "updated_at" not in columns:
        statements.append(text("ALTER TABLE dekan ADD COLUMN updated_at TIMESTAMP"))

    for stmt in statements:
        db.session.execute(stmt)

    if statements:
        db.session.commit()

    default_jabatan = "Dekan Fakultas Filsafat Teologi"

    db.session.execute(
        text(
            "UPDATE dekan "
            "SET jabatan = :jabatan "
            "WHERE jabatan IS NULL OR jabatan = ''"
        ),
        {"jabatan": default_jabatan},
    )

    db.session.execute(
        text("UPDATE dekan " "SET is_published = FALSE " "WHERE is_published IS NULL")
    )

    db.session.execute(
        text("UPDATE dekan " "SET needs_publish = TRUE " "WHERE needs_publish IS NULL")
    )

    db.session.commit()


def get_published_dosen_json_path():
    ensure_published_folder()
    return os.path.join(PUBLISHED_FOLDER, "dosen.json")


def sync_dosen_schema():
    inspector = inspect(db.engine)
    table_names = inspector.get_table_names()

    if "dosen" not in table_names:
        db.create_all()
        return

    columns = {col["name"] for col in inspector.get_columns("dosen")}
    statements = []

    if "bidang_dosen" not in columns:
        statements.append(text("ALTER TABLE dosen ADD COLUMN bidang_dosen TEXT"))

    if "thumb" not in columns:
        statements.append(text("ALTER TABLE dosen ADD COLUMN thumb VARCHAR(255)"))

    if "biodata_card" not in columns:
        statements.append(
            text("ALTER TABLE dosen ADD COLUMN biodata_card VARCHAR(255)")
        )

    if "is_published" not in columns:
        statements.append(
            text(
                "ALTER TABLE dosen ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT FALSE"
            )
        )

    if "needs_publish" not in columns:
        statements.append(
            text(
                "ALTER TABLE dosen ADD COLUMN needs_publish BOOLEAN NOT NULL DEFAULT TRUE"
            )
        )

    if "published_at" not in columns:
        statements.append(text("ALTER TABLE dosen ADD COLUMN published_at TIMESTAMP"))

    if "updated_at" not in columns:
        statements.append(text("ALTER TABLE dosen ADD COLUMN updated_at TIMESTAMP"))

    for stmt in statements:
        db.session.execute(stmt)

    if statements:
        db.session.commit()

    db.session.execute(
        text("UPDATE dosen " "SET is_published = FALSE " "WHERE is_published IS NULL")
    )

    db.session.execute(
        text("UPDATE dosen " "SET needs_publish = TRUE " "WHERE needs_publish IS NULL")
    )

    db.session.commit()


def sync_berita_schema():
    inspector = inspect(db.engine)
    table_names = inspector.get_table_names()

    if "berita" not in table_names:
        db.create_all()
        return

    columns = {col["name"] for col in inspector.get_columns("berita")}
    statements = []

    if "judul" not in columns:
        statements.append(text("ALTER TABLE berita ADD COLUMN judul VARCHAR(255)"))

    if "slug" not in columns:
        statements.append(text("ALTER TABLE berita ADD COLUMN slug VARCHAR(255)"))

    if "subjudul" not in columns:
        statements.append(text("ALTER TABLE berita ADD COLUMN subjudul VARCHAR(255)"))

    if "isi" not in columns:
        statements.append(text("ALTER TABLE berita ADD COLUMN isi TEXT"))

    if "thumbnail" not in columns:
        statements.append(text("ALTER TABLE berita ADD COLUMN thumbnail VARCHAR(255)"))

    if "gambar_detail" not in columns:
        statements.append(
            text("ALTER TABLE berita ADD COLUMN gambar_detail VARCHAR(255)")
        )

    if "is_published" not in columns:
        statements.append(
            text(
                "ALTER TABLE berita ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT FALSE"
            )
        )

    if "needs_publish" not in columns:
        statements.append(
            text(
                "ALTER TABLE berita ADD COLUMN needs_publish BOOLEAN NOT NULL DEFAULT TRUE"
            )
        )

    if "created_at" not in columns:
        statements.append(text("ALTER TABLE berita ADD COLUMN created_at TIMESTAMP"))

    if "published_at" not in columns:
        statements.append(text("ALTER TABLE berita ADD COLUMN published_at TIMESTAMP"))

    if "tayang_pada" not in columns:
        statements.append(
            text("ALTER TABLE berita ADD COLUMN tayang_pada TIMESTAMP NULL")
        )

    if "updated_at" not in columns:
        statements.append(text("ALTER TABLE berita ADD COLUMN updated_at TIMESTAMP"))

    if "kode_berita" not in columns:
        statements.append(text("ALTER TABLE berita ADD COLUMN kode_berita VARCHAR(5)"))

    if "group_type" not in columns:
        statements.append(
            text(
                "ALTER TABLE berita ADD COLUMN group_type VARCHAR(20) NOT NULL DEFAULT 'umum'"
            )
        )

    if "is_new" not in columns:
        statements.append(
            text("ALTER TABLE berita ADD COLUMN is_new BOOLEAN NOT NULL DEFAULT FALSE")
        )

    if "new_until" not in columns:
        statements.append(
            text("ALTER TABLE berita ADD COLUMN new_until TIMESTAMP NULL")
        )

    if "click_count" not in columns:
        statements.append(
            text("ALTER TABLE berita ADD COLUMN click_count INTEGER NOT NULL DEFAULT 0")
        )

    for stmt in statements:
        db.session.execute(stmt)

    if statements:
        db.session.commit()

    db.session.execute(
        text("UPDATE berita SET is_published = FALSE WHERE is_published IS NULL")
    )
    db.session.execute(
        text("UPDATE berita SET needs_publish = TRUE WHERE needs_publish IS NULL")
    )
    db.session.execute(text("UPDATE berita SET is_new = FALSE WHERE is_new IS NULL"))
    db.session.execute(
        text(
            "UPDATE berita "
            "SET created_at = COALESCE(created_at, updated_at, published_at, CURRENT_TIMESTAMP) "
            "WHERE created_at IS NULL"
        )
    )
    db.session.execute(
        text(
            "UPDATE berita "
            "SET group_type = 'umum' "
            "WHERE group_type IS NULL OR group_type = '' OR group_type IN ('banner', 'trending')"
        )
    )
    db.session.execute(
        text(
            "UPDATE berita "
            "SET tayang_pada = COALESCE(tayang_pada, published_at, updated_at, created_at) "
            "WHERE tayang_pada IS NULL AND is_published = TRUE"
        )
    )

    db.session.commit()

    berita_tanpa_kode = (
        Berita.query.filter(or_(Berita.kode_berita.is_(None), Berita.kode_berita == ""))
        .order_by(Berita.id.asc())
        .all()
    )

    if berita_tanpa_kode:
        used_codes = {
            b.kode_berita
            for b in Berita.query.filter(Berita.kode_berita.isnot(None)).all()
            if b.kode_berita
        }

        next_number = 1
        for berita in berita_tanpa_kode:
            while str(next_number).zfill(5) in used_codes:
                next_number += 1

            new_code = str(next_number).zfill(5)
            berita.kode_berita = new_code
            used_codes.add(new_code)
            next_number += 1

        db.session.commit()


def sync_banner_informasi_schema():
    inspector = inspect(db.engine)
    table_names = inspector.get_table_names()

    if "banner_informasi" not in table_names:
        db.create_all()
        return

    columns = {col["name"] for col in inspector.get_columns("banner_informasi")}
    statements = []

    if "judul_internal" not in columns:
        statements.append(
            text("ALTER TABLE banner_informasi ADD COLUMN judul_internal VARCHAR(255)")
        )

    if "media_type" not in columns:
        statements.append(
            text("ALTER TABLE banner_informasi ADD COLUMN media_type VARCHAR(20)")
        )

    if "media_file" not in columns:
        statements.append(
            text("ALTER TABLE banner_informasi ADD COLUMN media_file VARCHAR(255)")
        )

    if "poster_file" not in columns:
        statements.append(
            text("ALTER TABLE banner_informasi ADD COLUMN poster_file VARCHAR(255)")
        )

    if "target_url" not in columns:
        statements.append(
            text("ALTER TABLE banner_informasi ADD COLUMN target_url VARCHAR(500)")
        )

    if "link_test_status" not in columns:
        statements.append(
            text("ALTER TABLE banner_informasi ADD COLUMN link_test_status VARCHAR(50)")
        )

    if "link_test_message" not in columns:
        statements.append(
            text(
                "ALTER TABLE banner_informasi ADD COLUMN link_test_message VARCHAR(255)"
            )
        )

    if "link_tested_at" not in columns:
        statements.append(
            text("ALTER TABLE banner_informasi ADD COLUMN link_tested_at TIMESTAMP")
        )

    if "is_active" not in columns:
        statements.append(
            text(
                "ALTER TABLE banner_informasi ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT FALSE"
            )
        )

    if "sort_order" not in columns:
        statements.append(
            text(
                "ALTER TABLE banner_informasi ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 1"
            )
        )

    if "updated_at" not in columns:
        statements.append(
            text("ALTER TABLE banner_informasi ADD COLUMN updated_at TIMESTAMP")
        )

    if "is_published" not in columns:
        statements.append(
            text(
                "ALTER TABLE banner_informasi ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT FALSE"
            )
        )

    if "needs_publish" not in columns:
        statements.append(
            text(
                "ALTER TABLE banner_informasi ADD COLUMN needs_publish BOOLEAN NOT NULL DEFAULT TRUE"
            )
        )

    if "published_at" not in columns:
        statements.append(
            text("ALTER TABLE banner_informasi ADD COLUMN published_at TIMESTAMP")
        )

    for stmt in statements:
        db.session.execute(stmt)

    if statements:
        db.session.commit()

    db.session.execute(
        text(
            "UPDATE banner_informasi "
            "SET is_published = FALSE "
            "WHERE is_published IS NULL"
        )
    )

    db.session.execute(
        text(
            "UPDATE banner_informasi "
            "SET needs_publish = TRUE "
            "WHERE needs_publish IS NULL"
        )
    )

    db.session.commit()


def sync_site_setting_schema():
    inspector = inspect(db.engine)
    table_names = inspector.get_table_names()

    if "site_setting" not in table_names:
        db.create_all()



# === PUBLISHING STATUS MIGRATION START ===

def ensure_publishing_status_columns():
    inspector = inspect(db.engine)

    table_configs = {
        "berita": {
            "publish_status_default": "draft",
        },
        "banner_informasi": {
            "publish_status_default": "draft",
        },
    }

    for table_name, config in table_configs.items():
        try:
            columns = {column["name"] for column in inspector.get_columns(table_name)}
        except Exception:
            continue

        statements = []

        if "publish_status" not in columns:
            statements.append(
                text(
                    f"ALTER TABLE {table_name} "
                    "ADD COLUMN publish_status VARCHAR(30) NOT NULL DEFAULT 'draft'"
                )
            )

        if "scheduled_at" not in columns:
            statements.append(
                text(f"ALTER TABLE {table_name} ADD COLUMN scheduled_at TIMESTAMP NULL")
            )

        if "last_previewed_at" not in columns:
            statements.append(
                text(f"ALTER TABLE {table_name} ADD COLUMN last_previewed_at TIMESTAMP NULL")
            )

        for statement in statements:
            db.session.execute(statement)

        if statements:
            db.session.commit()

        # Sinkronkan data lama ke status baru.
        db.session.execute(
            text(
                f"""
                UPDATE {table_name}
                SET publish_status =
                    CASE
                        WHEN is_published = TRUE AND needs_publish = FALSE THEN 'published'
                        ELSE 'draft'
                    END
                WHERE publish_status IS NULL
                   OR publish_status = ''
                   OR publish_status NOT IN ('draft', 'scheduled', 'published', 'archived', 'failed')
                """
            )
        )
        db.session.commit()


# === PUBLISHING STATUS MIGRATION END ===


def init_default_data():
    ensure_publishing_status_columns()
    db.create_all()
    ensure_upload_root()
    ensure_dekan_upload_folder()
    ensure_published_folder()
    ensure_berita_upload_folder()
    ensure_banner_upload_folder()
    sync_dekan_schema()
    sync_dosen_schema()
    sync_berita_schema()
    sync_banner_informasi_schema()
    migrate_existing_berita_files()

    dekan = Dekan.query.first()
    if not dekan:
        dekan_baru = Dekan(
            nama="Nama Dekan",
            jabatan="Dekan Fakultas Filsafat Teologi",
            status="Aktif",
            tempat_lahir="Medan",
            tanggal_lahir="01 Januari 1980",
            foto=None,
            foto_frontend=None,
            biodata_card=None,
            is_published=False,
            needs_publish=True,
            published_at=None,
        )
        db.session.add(dekan_baru)
        db.session.commit()


@app.errorhandler(413)
def request_entity_too_large(error):
    flash("Ukuran file melebihi batas upload. Maksimal 400 MB.", "danger")
    return redirect(request.url)


@app.route("/")
def home():
    return redirect(url_for("admin_login"))


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "").strip()

        client_ip = get_client_ip()
        locked, remaining = is_ip_locked(client_ip)

        if locked:
            remaining_minutes = max(1, (remaining + 59) // 60)
            return render_template(
                "admin_login.html",
                error=f"Terlalu banyak percobaan login. Coba lagi dalam {remaining_minutes} menit.",
            )

        email_ok = hmac.compare_digest(email, ADMIN_EMAIL)
        password_ok = verify_admin_password(password)

        if email_ok and password_ok:
            clear_failed_login(client_ip)
            session.clear()
            session.permanent = True
            session["is_logged_in"] = True
            session["admin_email"] = ADMIN_EMAIL
            return redirect(url_for("admin_warning"))

        register_failed_login(client_ip)
        return render_template("admin_login.html", error="Email atau password salah.")

    return render_template("admin_login.html", error=None)


@app.route("/admin/warning")
def admin_warning():
    if not is_logged_in():
        return redirect(url_for("admin_login"))
    return render_template("admin_warning.html")


@app.route("/admin/choose")
def admin_choose():
    if not is_logged_in():
        return redirect(url_for("admin_login"))
    return render_template("admin_choose.html")


@app.route("/admin/berita")
def admin_berita_choose():
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    return redirect(url_for("admin_berita_list"))


@app.route("/admin/banner/active/link", methods=["POST"])
def admin_banner_active_link_update():
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    banner = BannerInformasi.query.first()
    if not banner:
        flash("Belum ada banner aktif yang bisa diubah link tujuannya.", "warning")
        return redirect(url_for("admin_banner_stock"))

    target_url = request.form.get("target_url", "").strip()

    if not target_url:
        flash("Link tujuan banner wajib diisi.", "danger")
        return redirect(url_for("admin_banner_stock"))

    url_ok, url_message = validate_target_url(target_url)
    if not url_ok:
        flash(url_message, "danger")
        return redirect(url_for("admin_banner_stock"))

    banner.target_url = target_url
    banner.updated_at = datetime.utcnow()
    banner.is_published = True
    banner.needs_publish = False
    banner.publish_status = PUBLISH_STATUS_PUBLISHED

    if not banner.published_at:
        banner.published_at = datetime.utcnow()

    db.session.commit()
    publish_banner_informasi_snapshot()

    flash("Link tujuan banner aktif berhasil diperbarui.", "success")
    return redirect(url_for("admin_banner_stock"))


@app.route("/admin/banner/active/hide", methods=["POST"])
def admin_banner_active_hide():
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    banner = BannerInformasi.query.first()
    if not banner:
        flash("Belum ada banner aktif yang bisa disembunyikan.", "warning")
        return redirect(url_for("admin_banner_stock"))

    banner.is_published = False
    banner.needs_publish = False
    banner.publish_status = "archived"
    banner.updated_at = datetime.utcnow()

    db.session.commit()
    publish_banner_informasi_snapshot()

    flash("Banner aktif berhasil disembunyikan dari website.", "success")
    return redirect(url_for("admin_banner_stock"))


@app.route("/admin/banner/stock")
def admin_banner_stock():
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    active_banner = BannerInformasi.query.first()

    stocks = BannerStock.query.filter(
        BannerStock.status == "stock"
    ).order_by(BannerStock.updated_at.desc()).all()

    used_stocks = BannerStock.query.filter(
        BannerStock.status == "used"
    ).order_by(BannerStock.activated_at.desc().nullslast(), BannerStock.updated_at.desc()).all()

    archived_stocks = BannerStock.query.filter(
        BannerStock.status == "archived"
    ).order_by(BannerStock.updated_at.desc()).all()

    stats = {
        "ready": len(stocks),
        "used": len(used_stocks),
        "archived": len(archived_stocks),
    }

    return render_template(
        "admin_banner_stock.html",
        active_banner=active_banner,
        stocks=stocks,
        used_stocks=used_stocks,
        archived_stocks=archived_stocks,
        stats=stats,
    )


@app.route("/admin/banner/stock/save", methods=["POST"])
def admin_banner_stock_save():
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    media_type = request.form.get("media_type", "image").strip().lower()
    target_url = request.form.get("target_url", "").strip()
    note = request.form.get("note", "").strip()
    media_file = request.files.get("media_file")

    if media_type not in {"image", "video"}:
        flash("Jenis banner tidak valid.", "danger")
        return redirect(url_for("admin_banner_stock"))

    url_ok, url_message = validate_target_url(target_url)
    if not url_ok:
        flash(url_message, "danger")
        return redirect(url_for("admin_banner_stock"))

    save_ok, saved_media_path, save_message = save_banner_stock_media_file(media_file, media_type)
    if not save_ok:
        flash(save_message, "danger")
        return redirect(url_for("admin_banner_stock"))

    stock = BannerStock(
        media_type=media_type,
        media_file=saved_media_path,
        target_url=target_url,
        note=note,
        status="stock",
    )

    db.session.add(stock)
    db.session.commit()

    flash("Banner berhasil disimpan ke stok.", "success")
    return redirect(url_for("admin_banner_stock"))


@app.route("/admin/banner/stock/<int:stock_id>/preview")
def admin_banner_stock_preview(stock_id):
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    stock = BannerStock.query.get_or_404(stock_id)
    stock.last_previewed_at = datetime.utcnow()
    db.session.commit()

    return render_template("admin_banner_stock_preview.html", stock=stock)



# === FFT_FIX_MISSING_BANNER_SNAPSHOT_PUBLISHER_20260518 START ===
def publish_banner_informasi_snapshot():
    """
    Fallback aman untuk route aktivasi stok banner.
    Helper lama ini dipanggil oleh admin_banner_stock_activate,
    tetapi definisinya hilang. Route utama tetap mengatur status banner
    melalui database, jadi fungsi ini dibuat no-op agar tidak memicu 500.
    """
    return None
# === FFT_FIX_MISSING_BANNER_SNAPSHOT_PUBLISHER_20260518 END ===

@app.route("/admin/banner/stock/<int:stock_id>/activate", methods=["POST"])
def admin_banner_stock_activate(stock_id):
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    stock = BannerStock.query.get_or_404(stock_id)

    active_banner = BannerInformasi.query.first()
    if not active_banner:
        active_banner = BannerInformasi()
        db.session.add(active_banner)

    copied_ok, active_media_path, copy_message = copy_banner_stock_to_active_media(stock.media_file)
    if not copied_ok:
        flash(copy_message, "danger")
        return redirect(url_for("admin_banner_stock"))

    active_banner.media_type = stock.media_type
    active_banner.media_file = active_media_path
    active_banner.target_url = stock.target_url
    active_banner.updated_at = datetime.utcnow()
    active_banner.is_published = True
    active_banner.needs_publish = False
    active_banner.publish_status = PUBLISH_STATUS_PUBLISHED
    active_banner.scheduled_at = None
    active_banner.published_at = datetime.utcnow()

    stock.status = "used"
    stock.activated_at = datetime.utcnow()
    stock.updated_at = datetime.utcnow()

    db.session.commit()
    publish_banner_informasi_snapshot()

    flash("Stok banner berhasil dijadikan banner yang tampil di website.", "success")
    return redirect(url_for("admin_banner_stock"))


@app.route("/admin/banner/stock/<int:stock_id>/delete", methods=["POST"])
def admin_banner_stock_delete(stock_id):
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    stock = BannerStock.query.get_or_404(stock_id)

    stock.status = "archived"
    stock.updated_at = datetime.utcnow()

    db.session.commit()

    flash("Stok banner berhasil dipindahkan ke arsip.", "success")
    return redirect(url_for("admin_banner_stock"))




@app.route("/admin/banner/stock/<int:stock_id>/restore", methods=["POST"])
def admin_banner_stock_restore(stock_id):
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    stock = BannerStock.query.get_or_404(stock_id)

    stock.status = "stock"
    stock.updated_at = datetime.utcnow()

    db.session.commit()

    flash("Banner arsip berhasil dipulihkan ke stok.", "success")
    return redirect(url_for("admin_banner_stock"))


@app.route("/admin/banner/stock/<int:stock_id>/delete-permanent", methods=["POST"])
def admin_banner_stock_delete_permanent(stock_id):
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    stock = BannerStock.query.get_or_404(stock_id)

    if stock.status != "archived":
        flash("Banner harus diarsipkan terlebih dahulu sebelum dihapus permanen.", "warning")
        return redirect(url_for("admin_banner_stock"))

    try:
        if stock.media_file:
            file_path = os.path.join(BASE_DIR, "static", stock.media_file)
            if os.path.exists(file_path):
                os.remove(file_path)
    except Exception:
        pass

    db.session.delete(stock)
    db.session.commit()

    flash("Banner arsip berhasil dihapus permanen.", "success")
    return redirect(url_for("admin_banner_stock"))

@app.route("/admin/banner-informasi")
def admin_banner_informasi():
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    return redirect(url_for("admin_banner_stock"))


@app.route("/admin/banner-informasi/save", methods=["POST"])
def admin_banner_informasi_save():
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    flash("Halaman banner lama sudah diganti. Gunakan Stok Banner untuk mengelola banner.", "info")
    return redirect(url_for("admin_banner_stock"))


@app.route("/admin/banner-informasi/publish", methods=["POST"])
def admin_banner_informasi_publish():
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    flash("Proses publish banner sekarang dilakukan dari tombol Jadikan Banner Tampil di Stok Banner.", "info")
    return redirect(url_for("admin_banner_stock"))


@app.route("/admin/banner-informasi/preview")
def admin_banner_informasi_preview():
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    return redirect(url_for("admin_banner_stock"))


@app.route("/api/banner-informasi")
def api_banner_informasi():
    banner = BannerInformasi.query.order_by(BannerInformasi.id.asc()).first()

    image_exts = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    video_exts = {".mp4", ".webm", ".mov"}

    def infer_media_type(media_file, fallback="image"):
        extension = os.path.splitext(str(media_file or ""))[1].lower()

        if extension in image_exts:
            return "image"

        if extension in video_exts:
            return "video"

        return fallback or "image"

    if not banner or not banner.media_file or not getattr(banner, "is_published", False):
        return jsonify(
            {
                "published": False,
                "published_at": None,
                "data": None,
            }
        )

    media_file = banner.media_file
    media_type = infer_media_type(media_file, banner.media_type)

    media_path = os.path.join(BASE_DIR, "static", media_file)

    if not os.path.exists(media_path):
        return jsonify(
            {
                "published": False,
                "published_at": banner.published_at.isoformat() if banner.published_at else None,
                "data": None,
                "error": "media_not_found",
                "missing_media_file": media_file,
            }
        )

    return jsonify(
        {
            "published": True,
            "published_at": banner.published_at.isoformat() if banner.published_at else None,
            "data": {
                "media_type": media_type,
                "media_file": media_file,
                "target_url": banner.target_url or "",
                "updated_at": banner.updated_at.isoformat() if banner.updated_at else None,
                "published_at": banner.published_at.isoformat() if banner.published_at else None,
            },
        }
    )


@app.route("/admin/dekan", methods=["GET", "POST"])
def admin_dekan():
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    dekan = Dekan.query.first()

    if not dekan:
        dekan = Dekan(
            nama="",
            jabatan="Dekan Fakultas Filsafat Teologi",
            status="Aktif",
            tempat_lahir="",
            tanggal_lahir="",
            foto=None,
            foto_frontend=None,
            biodata_card=None,
            is_published=False,
            needs_publish=True,
            published_at=None,
        )
        db.session.add(dekan)
        db.session.commit()

    if request.method == "POST":
        nama = request.form.get("nama", "").strip()
        jabatan = "Dekan Fakultas Filsafat Teologi"
        status = normalize_status(request.form.get("status", ""))
        tempat_lahir = request.form.get("tempat_lahir", "").strip()
        tanggal_lahir = request.form.get("tanggal_lahir", "").strip()

        uploaded_foto_formal = request.files.get("foto_cropped") or request.files.get(
            "foto"
        )
        uploaded_foto_frontend = request.files.get(
            "foto_frontend_cropped"
        ) or request.files.get("foto_frontend")

        if status not in {"Aktif", "Nonaktif"}:
            flash("Status kepegawaian dekan harus dipilih.", "danger")
            dekan_preview = {
                "nama": nama,
                "jabatan": jabatan,
                "status": request.form.get("status", "").strip(),
                "tempat_lahir": tempat_lahir,
                "tanggal_lahir": tanggal_lahir,
                "foto": dekan.foto,
                "foto_frontend": dekan.foto_frontend,
                "biodata_card": dekan.biodata_card,
                "is_published": dekan.is_published,
                "needs_publish": dekan.needs_publish,
                "published_at": dekan.published_at,
                "updated_at": dekan.updated_at,
            }
            return render_template("admin_dekan_form.html", dekan=dekan_preview)

        if not all([nama, jabatan, tempat_lahir, tanggal_lahir]):
            flash("Seluruh data dekan wajib diisi.", "danger")
            dekan_preview = {
                "nama": nama,
                "jabatan": jabatan,
                "status": status,
                "tempat_lahir": tempat_lahir,
                "tanggal_lahir": tanggal_lahir,
                "foto": dekan.foto,
                "foto_frontend": dekan.foto_frontend,
                "biodata_card": dekan.biodata_card,
                "is_published": dekan.is_published,
                "needs_publish": dekan.needs_publish,
                "published_at": dekan.published_at,
                "updated_at": dekan.updated_at,
            }
            return render_template("admin_dekan_form.html", dekan=dekan_preview)

        if uploaded_foto_formal and uploaded_foto_formal.filename:
            saved_formal = save_dekan_photo(uploaded_foto_formal)

            if saved_formal is False:
                flash(
                    "Format foto resmi tidak didukung. Gunakan PNG, JPG, JPEG, atau WEBP.",
                    "danger",
                )
                dekan_preview = {
                    "nama": nama,
                    "jabatan": jabatan,
                    "status": status,
                    "tempat_lahir": tempat_lahir,
                    "tanggal_lahir": tanggal_lahir,
                    "foto": dekan.foto,
                    "foto_frontend": dekan.foto_frontend,
                    "biodata_card": dekan.biodata_card,
                    "is_published": dekan.is_published,
                    "needs_publish": dekan.needs_publish,
                    "published_at": dekan.published_at,
                    "updated_at": dekan.updated_at,
                }
                return render_template("admin_dekan_form.html", dekan=dekan_preview)

            if dekan.foto and dekan.foto != saved_formal:
                delete_dekan_file(dekan.foto)

            dekan.foto = saved_formal
            dekan.biodata_card = None

        if uploaded_foto_frontend and uploaded_foto_frontend.filename:
            saved_frontend = save_dekan_frontend_photo(uploaded_foto_frontend)

            if saved_frontend is False:
                flash(
                    "Format foto frontend tidak didukung. Gunakan PNG, JPG, JPEG, atau WEBP.",
                    "danger",
                )
                dekan_preview = {
                    "nama": nama,
                    "jabatan": jabatan,
                    "status": status,
                    "tempat_lahir": tempat_lahir,
                    "tanggal_lahir": tanggal_lahir,
                    "foto": dekan.foto,
                    "foto_frontend": dekan.foto_frontend,
                    "biodata_card": dekan.biodata_card,
                    "is_published": dekan.is_published,
                    "needs_publish": dekan.needs_publish,
                    "published_at": dekan.published_at,
                    "updated_at": dekan.updated_at,
                }
                return render_template("admin_dekan_form.html", dekan=dekan_preview)

            if dekan.foto_frontend and dekan.foto_frontend != saved_frontend:
                delete_dekan_file(dekan.foto_frontend)

            dekan.foto_frontend = saved_frontend

        dekan.nama = nama
        dekan.jabatan = jabatan
        dekan.status = status
        dekan.tempat_lahir = tempat_lahir
        dekan.tanggal_lahir = tanggal_lahir
        dekan.updated_at = datetime.utcnow()
        dekan.needs_publish = True

        db.session.commit()
        flash(
            "Draft data dekan berhasil disimpan. Tekan Publish / Update Frontend untuk menayangkan perubahan.",
            "success",
        )
        return redirect(url_for("admin_dekan"))

    return render_template("admin_dekan_form.html", dekan=dekan)


@app.route("/admin/dekan/export")
def admin_dekan_export():
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    dekan = Dekan.query.first()
    if not dekan:
        flash("Data dekan belum tersedia.", "danger")
        return redirect(url_for("admin_dekan"))

    output_path = generate_dekan_biodata_card(dekan)

    return send_file(
        output_path,
        as_attachment=True,
        download_name="biodata_dekan.png",
        mimetype="image/png",
    )


@app.route("/admin/dekan/delete-photo/<photo_kind>", methods=["POST"])
def admin_dekan_delete_photo(photo_kind):
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    dekan = Dekan.query.first()
    if not dekan:
        flash("Data dekan belum tersedia.", "danger")
        return redirect(url_for("admin_dekan"))

    if photo_kind == "formal":
        if dekan.foto:
            delete_dekan_file(dekan.foto)
        dekan.foto = None
        dekan.biodata_card = None
        flash("Foto resmi dekan berhasil dihapus.", "success")

    elif photo_kind == "frontend":
        if dekan.foto_frontend:
            delete_dekan_file(dekan.foto_frontend)
        dekan.foto_frontend = None
        flash("Foto frontend dekan berhasil dihapus.", "success")

    else:
        flash("Jenis foto tidak dikenali.", "danger")
        return redirect(url_for("admin_dekan"))

    dekan.updated_at = datetime.utcnow()
    dekan.needs_publish = True
    db.session.commit()

    return redirect(url_for("admin_dekan"))


@app.route("/admin/dekan/publish", methods=["POST"])
def admin_dekan_publish():
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    dekan = Dekan.query.first()
    if not dekan:
        flash("Data dekan belum tersedia.", "danger")
        return redirect(url_for("admin_dekan"))

    if not all(
        [
            dekan.nama,
            dekan.jabatan,
            dekan.status,
            dekan.tempat_lahir,
            dekan.tanggal_lahir,
        ]
    ):
        flash("Lengkapi data dekan terlebih dahulu sebelum publish.", "danger")
        return redirect(url_for("admin_dekan"))

    publish_dekan_snapshot(dekan)

    dekan.is_published = True
    dekan.needs_publish = False
    dekan.published_at = datetime.utcnow()
    db.session.commit()

    flash("Data dekan berhasil dipublish ke frontend.", "success")
    return redirect(url_for("admin_dekan"))


@app.route("/api/dekan")
def api_dekan():
    snapshot_path = get_published_dekan_json_path()

    if not os.path.exists(snapshot_path):
        return (
            jsonify(
                {
                    "published": False,
                    "data": None,
                }
            ),
            200,
        )

    with open(snapshot_path, "r", encoding="utf-8") as handle:
        payload = json.load(handle)

    return (
        jsonify(
            {
                "published": True,
                "data": payload,
            }
        ),
        200,
    )


@app.route("/admin/dosen")
def admin_dosen_list():
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    q = request.args.get("q", "").strip()

    query = Dosen.query

    if q:
        query = query.filter(
            or_(
                Dosen.nama.ilike(f"%{q}%"),
                Dosen.kode_dosen.ilike(f"%{q}%"),
                Dosen.jabatan.ilike(f"%{q}%"),
            )
        )

    dosen_list = query.order_by(Dosen.kode_dosen.asc(), Dosen.id.asc()).all()

    return render_template(
        "admin_dosen_list.html",
        dosen_list=dosen_list,
        q=q,
    )


@app.route("/admin/dosen/new", methods=["GET", "POST"])
def admin_dosen_new():
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    if request.method == "POST":
        kode_dosen = generate_next_kode_dosen()
        nuptk = request.form.get("nuptk", "").strip()
        nama = request.form.get("nama", "").strip()
        jabatan = request.form.get("jabatan", "").strip()
        status = request.form.get("status", "").strip()
        tempat_lahir = request.form.get("tempat_lahir", "").strip()
        tanggal_lahir = request.form.get("tanggal_lahir", "").strip()
        bidang_dosen = request.form.get("bidang_dosen", "").strip()

        foto_formal_file = request.files.get("foto_cropped") or request.files.get(
            "foto"
        )
        foto_frontend_file = request.files.get(
            "foto_frontend_cropped"
        ) or request.files.get("foto_frontend")

        if status not in {"Aktif", "Nonaktif"}:
            flash("Status kepegawaian dosen harus dipilih.", "danger")
            dosen_preview = {
                "kode_dosen": kode_dosen,
                "nuptk": nuptk,
                "nama": nama,
                "jabatan": jabatan,
                "bidang_dosen": bidang_dosen,
                "status": status,
                "tempat_lahir": tempat_lahir,
                "tanggal_lahir": tanggal_lahir,
                "foto": None,
                "thumb": None,
                "biodata_card": None,
            }
            return render_template(
                "admin_dosen_form.html", mode="add", dosen=dosen_preview
            )

        if not all([nama, jabatan, bidang_dosen, tempat_lahir, tanggal_lahir]):
            flash(
                "Semua field dosen wajib diisi kecuali NUPTK dan file biodata.",
                "danger",
            )
            dosen_preview = {
                "kode_dosen": kode_dosen,
                "nuptk": nuptk,
                "nama": nama,
                "jabatan": jabatan,
                "bidang_dosen": bidang_dosen,
                "status": status,
                "tempat_lahir": tempat_lahir,
                "tanggal_lahir": tanggal_lahir,
                "foto": None,
                "thumb": None,
                "biodata_card": None,
            }
            return render_template(
                "admin_dosen_form.html", mode="add", dosen=dosen_preview
            )

        saved_formal = (
            save_uploaded_photo(foto_formal_file, kode_dosen)
            if foto_formal_file and foto_formal_file.filename
            else None
        )
        saved_frontend = (
            save_uploaded_thumb(foto_frontend_file, kode_dosen)
            if foto_frontend_file and foto_frontend_file.filename
            else None
        )

        if saved_formal is False or saved_frontend is False:
            flash(
                "Format foto tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.",
                "danger",
            )
            dosen_preview = {
                "kode_dosen": kode_dosen,
                "nuptk": nuptk,
                "nama": nama,
                "jabatan": jabatan,
                "bidang_dosen": bidang_dosen,
                "status": status,
                "tempat_lahir": tempat_lahir,
                "tanggal_lahir": tanggal_lahir,
                "foto": None,
                "thumb": None,
                "biodata_card": None,
            }
            return render_template(
                "admin_dosen_form.html", mode="add", dosen=dosen_preview
            )

        dosen_baru = Dosen(
            kode_dosen=kode_dosen,
            nuptk=nuptk or None,
            nama=nama,
            jabatan=jabatan,
            bidang_dosen=bidang_dosen,
            status=status,
            tempat_lahir=tempat_lahir,
            tanggal_lahir=tanggal_lahir,
            foto=saved_formal if saved_formal else None,
            thumb=saved_frontend if saved_frontend else None,
            biodata_card=None,
            is_published=False,
            needs_publish=True,
            published_at=None,
        )

        db.session.add(dosen_baru)
        db.session.commit()

        flash(
            "Draft data dosen baru berhasil disimpan. Silakan lanjutkan pengecekan, revisi, atau publish dari halaman ini.",
            "success",
        )
        return redirect(url_for("admin_dosen_edit", dosen_id=dosen_baru.id))

    dosen_preview = {
        "kode_dosen": generate_next_kode_dosen(),
        "nuptk": "",
        "nama": "",
        "jabatan": "",
        "bidang_dosen": "",
        "status": "",
        "tempat_lahir": "",
        "tanggal_lahir": "",
        "foto": None,
        "thumb": None,
        "biodata_card": None,
    }
    return render_template("admin_dosen_form.html", mode="add", dosen=dosen_preview)


@app.route("/admin/dosen/<int:dosen_id>/edit", methods=["GET", "POST"])
def admin_dosen_edit(dosen_id):
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    dosen = Dosen.query.get_or_404(dosen_id)

    if request.method == "POST":
        nuptk = request.form.get("nuptk", "").strip()
        nama = request.form.get("nama", "").strip()
        jabatan = request.form.get("jabatan", "").strip()
        status = request.form.get("status", "").strip()
        tempat_lahir = request.form.get("tempat_lahir", "").strip()
        tanggal_lahir = request.form.get("tanggal_lahir", "").strip()
        bidang_dosen = request.form.get("bidang_dosen", "").strip()

        foto_formal_file = request.files.get("foto_cropped") or request.files.get(
            "foto"
        )
        foto_frontend_file = request.files.get(
            "foto_frontend_cropped"
        ) or request.files.get("foto_frontend")

        if status not in {"Aktif", "Nonaktif"}:
            flash("Status kepegawaian dosen harus dipilih.", "danger")
            dosen_preview = {
                "id": dosen.id,
                "kode_dosen": dosen.kode_dosen,
                "nuptk": nuptk,
                "nama": nama,
                "jabatan": jabatan,
                "bidang_dosen": bidang_dosen,
                "status": status,
                "tempat_lahir": tempat_lahir,
                "tanggal_lahir": tanggal_lahir,
                "foto": dosen.foto,
                "thumb": dosen.thumb,
                "biodata_card": dosen.biodata_card,
            }
            return render_template(
                "admin_dosen_form.html", mode="edit", dosen=dosen_preview
            )

        if not all([nama, jabatan, bidang_dosen, tempat_lahir, tanggal_lahir]):
            flash(
                "Semua field dosen wajib diisi kecuali NUPTK dan file biodata.",
                "danger",
            )
            dosen_preview = {
                "id": dosen.id,
                "kode_dosen": dosen.kode_dosen,
                "nuptk": nuptk,
                "nama": nama,
                "jabatan": jabatan,
                "bidang_dosen": bidang_dosen,
                "status": status,
                "tempat_lahir": tempat_lahir,
                "tanggal_lahir": tanggal_lahir,
                "foto": dosen.foto,
                "thumb": dosen.thumb,
                "biodata_card": dosen.biodata_card,
            }
            return render_template(
                "admin_dosen_form.html", mode="edit", dosen=dosen_preview
            )

        saved_formal = (
            save_uploaded_photo(foto_formal_file, dosen.kode_dosen)
            if foto_formal_file and foto_formal_file.filename
            else None
        )
        saved_frontend = (
            save_uploaded_thumb(foto_frontend_file, dosen.kode_dosen)
            if foto_frontend_file and foto_frontend_file.filename
            else None
        )

        if saved_formal is False or saved_frontend is False:
            flash(
                "Format foto tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.",
                "danger",
            )
            dosen_preview = {
                "id": dosen.id,
                "kode_dosen": dosen.kode_dosen,
                "nuptk": nuptk,
                "nama": nama,
                "jabatan": jabatan,
                "bidang_dosen": bidang_dosen,
                "status": status,
                "tempat_lahir": tempat_lahir,
                "tanggal_lahir": tanggal_lahir,
                "foto": dosen.foto,
                "thumb": dosen.thumb,
                "biodata_card": dosen.biodata_card,
            }
            return render_template(
                "admin_dosen_form.html", mode="edit", dosen=dosen_preview
            )

        if saved_formal:
            dosen.foto = saved_formal
            dosen.biodata_card = None

        if saved_frontend:
            dosen.thumb = saved_frontend

        dosen.nuptk = nuptk or None
        dosen.jabatan = jabatan
        dosen.bidang_dosen = bidang_dosen
        dosen.nama = nama
        dosen.status = status
        dosen.tempat_lahir = tempat_lahir
        dosen.tanggal_lahir = tanggal_lahir
        dosen.needs_publish = True
        dosen.updated_at = datetime.utcnow()

        db.session.commit()
        flash(
            "Draft data dosen berhasil diperbarui. Anda tetap berada di halaman edit untuk melanjutkan pengecekan atau publish.",
            "success",
        )

        return redirect(url_for("admin_dosen_edit", dosen_id=dosen.id))

    return render_template("admin_dosen_form.html", mode="edit", dosen=dosen)


@app.route("/admin/dosen/<int:dosen_id>/export-biodata", methods=["POST"])
def admin_dosen_export_biodata(dosen_id):
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    dosen = Dosen.query.get_or_404(dosen_id)

    if not dosen.foto:
        flash(
            "Foto utama dosen belum ada. Upload dan crop foto utama terlebih dahulu.",
            "danger",
        )
        return redirect(url_for("admin_dosen_edit", dosen_id=dosen.id))

    try:
        output_path = generate_biodata_card(dosen)
    except Exception as e:
        flash(f"Gagal membuat biodata dosen: {str(e)}", "danger")
        return redirect(url_for("admin_dosen_edit", dosen_id=dosen.id))

    return send_file(
        output_path,
        as_attachment=True,
        download_name=f"biodata_dosen_{dosen.kode_dosen}.png",
        mimetype="image/png",
    )


@app.route("/admin/dosen/<int:dosen_id>/delete", methods=["POST"])
def admin_dosen_delete(dosen_id):
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    dosen = Dosen.query.get_or_404(dosen_id)
    kode_dosen = dosen.kode_dosen

    db.session.delete(dosen)
    db.session.commit()

    delete_dosen_folder(kode_dosen)

    flash("Data dosen berhasil dihapus beserta file terkait.", "success")
    return redirect(url_for("admin_dosen_list"))


@app.route("/admin/logout")
def admin_logout():
    session.clear()
    return redirect(url_for("admin_login"))


@app.route("/admin/dosen/publish", methods=["POST"])
def admin_dosen_publish():
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    publish_dosen_snapshot()

    # update semua dosen jadi published
    Dosen.query.update(
        {
            "is_published": True,
            "needs_publish": False,
            "published_at": datetime.utcnow(),
        }
    )

    db.session.commit()

    flash(
        "Semua perubahan data dosen berhasil dipublish ke frontend.",
        "success",
    )
    return redirect(url_for("admin_dosen_list"))


@app.route("/api/dosen")
def api_dosen():
    snapshot_path = get_published_dosen_json_path()

    if not os.path.exists(snapshot_path):
        return jsonify({"published": False, "total": 0, "data": []}), 200

    with open(snapshot_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    return jsonify(payload), 200


with app.app_context():
    init_default_data()


# NEWS_PRO_WORKFLOW_HELPERS_START

NEWS_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

def news_base_dir():
    try:
        return BASE_DIR
    except NameError:
        return os.path.dirname(os.path.abspath(__file__))


def news_pick(obj, names, default=None):
    for name in names:
        if hasattr(obj, name):
            value = getattr(obj, name)
            if value is not None and value != "":
                return value
    return default


def news_set_if_exists(obj, name, value):
    if hasattr(obj, name):
        setattr(obj, name, value)
        return True
    return False


def news_code(item):
    kode = news_pick(item, ["kode_berita", "kode"], None)
    if kode:
        return str(kode).zfill(5)
    return f"{item.id:05d}"


def news_normalize_media(value):
    path = str(value or "").strip().replace("\\", "/")

    if not path or path.lower() in {"none", "null"}:
        return ""

    if path.startswith("http://") or path.startswith("https://") or path.startswith("data:"):
        return path

    if path.startswith("/static/"):
        path = path[len("/static/"):]

    if path.startswith("backend/static/"):
        path = path[len("backend/static/"):]

    if path.startswith("static/"):
        path = path[len("static/"):]

    return path.lstrip("/")


def news_static_exists(path):
    path = news_normalize_media(path)

    if not path or path.startswith("http") or path.startswith("data:"):
        return False

    return os.path.exists(os.path.join(news_base_dir(), "static", path))


def news_scan_image(folder_rel, stems=None):
    folder_rel = news_normalize_media(folder_rel)
    folder_abs = os.path.join(news_base_dir(), "static", folder_rel)
    stems = [str(stem).lower() for stem in (stems or [])]

    if not os.path.isdir(folder_abs):
        return ""

    files = []

    for name in sorted(os.listdir(folder_abs)):
        abs_path = os.path.join(folder_abs, name)

        if not os.path.isfile(abs_path):
            continue

        stem, ext = os.path.splitext(name)
        ext = ext.lower()

        if ext in NEWS_IMAGE_EXTENSIONS or not ext:
            files.append((name, stem.lower()))

    for wanted in stems:
        for name, stem in files:
            if stem == wanted:
                return f"{folder_rel}/{name}".replace("\\", "/")

    if files:
        return f"{folder_rel}/{files[0][0]}".replace("\\", "/")

    return ""


def news_resolve_media(item, kind="thumbnail"):
    code = news_code(item)
    folder_rel = f"uploads/berita/{code}"

    if kind == "detail":
        fields = [
            "gambar_detail",
            "gambar",
            "gambar_cover",
            "gambar_utama",
            "thumbnail",
            "gambar_thumbnail",
            "image",
            "image_file",
        ]
        stems = ["detail", "gambar_detail", "cover", "thumbnail", "thumb"]
    else:
        fields = [
            "thumbnail",
            "gambar_thumbnail",
            "gambar_cover",
            "gambar_utama",
            "gambar",
            "gambar_detail",
            "image",
            "image_file",
        ]
        stems = ["thumbnail", "thumb", "detail", "gambar_detail", "cover"]

    for field in fields:
        value = news_pick(item, [field], "")
        path = news_normalize_media(value)

        if path and news_static_exists(path):
            return path

        if path and not os.path.splitext(path)[1]:
            for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
                candidate = path + ext
                if news_static_exists(candidate):
                    return candidate

    return news_scan_image(folder_rel, stems)


def news_media_url(item, kind="thumbnail"):
    path = news_resolve_media(item, kind)

    if not path:
        return ""

    if path.startswith("http://") or path.startswith("https://") or path.startswith("data:"):
        return path

    return url_for("static", filename=path)


def news_date_text(value):
    if not value:
        return "-"

    if hasattr(value, "strftime"):
        return value.strftime("%d %b %Y %H:%M")

    return str(value)


def news_sort_date(value):
    if hasattr(value, "timestamp"):
        return value.timestamp()
    return 0


def news_status_key(item):
    publish_status = str(news_pick(item, ["publish_status", "status"], "") or "").strip().lower()
    is_published = bool(news_pick(item, ["is_published"], False))

    if publish_status in {"maintenance", "nonaktif", "inactive", "offline", "archived", "archive", "arsip"}:
        return "inactive"

    if is_published:
        return "live"

    return "stock"


def news_status_label(item):
    key = news_status_key(item)

    if key == "live":
        return "Tampil"
    if key == "inactive":
        return "Nonaktif"

    return "Stok"


def news_admin_card(item):
    thumbnail = news_resolve_media(item, "thumbnail")
    detail = news_resolve_media(item, "detail")
    published_at = news_pick(item, ["published_at", "tayang_pada"], None)
    created_at = news_pick(item, ["created_at", "tanggal_dibuat"], None)
    click_count = int(news_pick(item, ["click_count", "views", "view_count"], 0) or 0)

    return {
        "id": item.id,
        "kode_berita": news_code(item),
        "judul": news_pick(item, ["judul", "title"], "Tanpa Judul"),
        "subjudul": news_pick(item, ["subjudul", "ringkasan", "excerpt", "summary"], ""),
        "isi": news_pick(item, ["isi", "content", "body"], ""),
        "group_type": news_pick(item, ["group_type", "kategori", "category"], "umum"),
        "thumbnail": thumbnail,
        "thumbnail_url": url_for("static", filename=thumbnail) if thumbnail else "",
        "detail": detail,
        "detail_url": url_for("static", filename=detail) if detail else "",
        "status_key": news_status_key(item),
        "status_label": news_status_label(item),
        "created_at": created_at,
        "published_at": published_at,
        "created_at_text": news_date_text(created_at),
        "published_at_text": news_date_text(published_at),
        "click_count": click_count,
    }


def news_to_api_item(item):
    thumbnail = news_resolve_media(item, "thumbnail")
    detail = news_resolve_media(item, "detail") or thumbnail
    kode = news_code(item)

    judul = news_pick(item, ["judul", "title"], "Tanpa Judul")
    subjudul = news_pick(item, ["subjudul", "ringkasan", "excerpt", "summary"], "")
    isi = news_pick(item, ["isi", "content", "body"], "")
    kategori = news_pick(item, ["group_type", "kategori", "category"], "umum")
    published_at = news_pick(item, ["published_at", "tayang_pada", "created_at"], None)
    created_at = news_pick(item, ["created_at"], None)
    updated_at = news_pick(item, ["updated_at"], created_at)
    click_count = int(news_pick(item, ["click_count", "views", "view_count"], 0) or 0)

    detail_url = f"berita-detail.html?id={item.id}&kode={kode}"

    return {
        "id": item.id,
        "kode": kode,
        "kode_berita": kode,
        "code": kode,

        "judul": judul,
        "judul_id": judul,
        "judul_en": judul,
        "title": judul,
        "title_id": judul,
        "title_en": judul,

        "subjudul": subjudul,
        "ringkasan": subjudul,
        "excerpt": subjudul,
        "summary": subjudul,
        "description": subjudul,

        "isi": isi,
        "content": isi,
        "body": isi,

        "group_type": kategori,
        "kategori": kategori,
        "category": kategori,

        "thumbnail": thumbnail,
        "gambar_thumbnail": thumbnail,
        "gambar_detail": detail,
        "gambar": detail,
        "image": thumbnail,
        "image_file": thumbnail,
        "image_url": f"/static/{thumbnail}" if thumbnail else "",
        "thumbnail_url": f"/static/{thumbnail}" if thumbnail else "",
        "detail_image_url": f"/static/{detail}" if detail else "",

        "click_count": click_count,
        "views": click_count,
        "view_count": click_count,

        "created_at": berita_api_datetime(created_at) if "berita_api_datetime" in globals() else str(created_at or ""),
        "updated_at": berita_api_datetime(updated_at) if "berita_api_datetime" in globals() else str(updated_at or ""),
        "published_at": berita_api_datetime(published_at) if "berita_api_datetime" in globals() else str(published_at or ""),
        "tayang_pada": berita_api_datetime(published_at) if "berita_api_datetime" in globals() else str(published_at or ""),
        "tanggal": berita_api_datetime(published_at) if "berita_api_datetime" in globals() else str(published_at or ""),
        "date": berita_api_datetime(published_at) if "berita_api_datetime" in globals() else str(published_at or ""),

        "slug": news_pick(item, ["slug"], f"berita-{kode}"),
        "url": detail_url,
        "link": detail_url,
        "detail_url": detail_url,

        "is_new": bool(news_pick(item, ["is_new"], False)),
        "is_published": True,
    }






def news_republish_frontend():
    payload = build_berita_api_payload()
    return write_published_berita_payload(payload)


# NEWS_PRO_WORKFLOW_HELPERS_END



@app.route("/admin/berita/list")
def admin_berita_list():
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    rows = Berita.query.order_by(Berita.id.desc()).all()
    cards = [news_admin_card(item) for item in rows]

    live_cards = [card for card in cards if card["status_key"] == "live"]
    stock_cards = [card for card in cards if card["status_key"] == "stock"]
    inactive_cards = [card for card in cards if card["status_key"] == "inactive"]

    stats = {
        "live": len(live_cards),
        "stock": len(stock_cards),
        "inactive": len(inactive_cards),
        "total": len(cards),
        "clicks": sum(card["click_count"] for card in cards),
    }

    return render_template(
        "admin_berita_list.html",
        cards=cards,
        live_cards=live_cards,
        stock_cards=stock_cards,
        inactive_cards=inactive_cards,
        stats=stats,
    )



@app.route("/admin/berita/add", methods=["GET", "POST"])
def admin_berita_add():
    if not fft_admin_is_logged_in():
        return redirect(url_for("admin_login"))

    if request.method == "POST":
        return fft_save_news_from_request()

    return render_template(
        "admin_berita_form.html",
        berita=None,
        is_edit=False,
        form_publish_mode="stock",
        berita_thumb_crop_width=BERITA_THUMB_CROP_WIDTH,
        berita_thumb_crop_height=BERITA_THUMB_CROP_HEIGHT,
        berita_detail_crop_width=BERITA_DETAIL_CROP_WIDTH,
        berita_detail_crop_height=BERITA_DETAIL_CROP_HEIGHT,
    )


@app.route("/admin/berita/edit/<int:berita_id>", methods=["GET", "POST"])
def admin_berita_edit(berita_id):
    if not fft_admin_is_logged_in():
        return redirect(url_for("admin_login"))

    if request.method == "POST":
        return fft_save_news_from_request(berita_id)

    berita = Berita.query.get_or_404(berita_id)

    form_publish_mode = "stock"

    if bool(getattr(berita, "is_published", False)):
        form_publish_mode = "published"

    scheduled_at = getattr(berita, "scheduled_at", None) or getattr(berita, "tayang_pada", None)
    if scheduled_at and scheduled_at > datetime.utcnow():
        form_publish_mode = "schedule"

    return render_template(
        "admin_berita_form.html",
        berita=berita,
        is_edit=True,
        form_publish_mode=form_publish_mode,
        berita_thumb_crop_width=BERITA_THUMB_CROP_WIDTH,
        berita_thumb_crop_height=BERITA_THUMB_CROP_HEIGHT,
        berita_detail_crop_width=BERITA_DETAIL_CROP_WIDTH,
        berita_detail_crop_height=BERITA_DETAIL_CROP_HEIGHT,
    )


@app.route("/admin/berita/delete/<int:berita_id>", methods=["POST"])
def admin_berita_delete(berita_id):
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    berita = Berita.query.get_or_404(berita_id)

    delete_berita_folder(berita.kode_berita)

    db.session.delete(berita)
    db.session.commit()

    flash("Berita berhasil dihapus.", "success")
    return redirect(url_for("admin_berita_list"))


@app.route("/admin/berita/save", methods=["GET", "POST"])
def admin_berita_save():
    if not fft_admin_is_logged_in():
        return redirect(url_for("admin_login"))

    if request.method == "GET":
        return redirect(url_for("admin_berita_list"))

    return fft_save_news_from_request()


@app.route("/admin/berita/publish", methods=["POST"])
def admin_berita_publish():
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    news_republish_frontend()
    flash("Preview frontend berita sudah diperbarui.", "success")

    return redirect(url_for("admin_berita_list"))


@app.route("/admin/berita/<int:berita_id>/activate", methods=["POST"])
def admin_berita_activate(berita_id):
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    from datetime import datetime

    berita = Berita.query.get_or_404(berita_id)
    now = datetime.utcnow()

    news_set_if_exists(berita, "is_published", True)
    news_set_if_exists(berita, "needs_publish", False)
    news_set_if_exists(berita, "publish_status", "published")
    news_set_if_exists(berita, "published_at", now)
    news_set_if_exists(berita, "tayang_pada", now)
    news_set_if_exists(berita, "updated_at", now)

    db.session.commit()
    news_republish_frontend()

    flash("Berita sudah diposting ke frontend.", "success")
    return redirect(url_for("admin_berita_list"))


@app.route("/admin/berita/<int:berita_id>/unpublish", methods=["POST"])
def admin_berita_unpublish(berita_id):
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    from datetime import datetime

    berita = Berita.query.get_or_404(berita_id)

    news_set_if_exists(berita, "is_published", False)
    news_set_if_exists(berita, "needs_publish", False)
    news_set_if_exists(berita, "publish_status", "stock")
    news_set_if_exists(berita, "updated_at", datetime.utcnow())

    db.session.commit()
    news_republish_frontend()

    flash("Berita diturunkan ke stok dan hilang dari frontend.", "success")
    return redirect(url_for("admin_berita_list"))


@app.route("/admin/berita/<int:berita_id>/maintenance", methods=["POST"])
def admin_berita_maintenance(berita_id):
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    from datetime import datetime

    berita = Berita.query.get_or_404(berita_id)

    news_set_if_exists(berita, "is_published", False)
    news_set_if_exists(berita, "needs_publish", False)
    news_set_if_exists(berita, "publish_status", "maintenance")
    news_set_if_exists(berita, "updated_at", datetime.utcnow())

    db.session.commit()
    news_republish_frontend()

    flash("Berita dipindahkan ke nonaktif. Berita tidak tampil di frontend.", "success")
    return redirect(url_for("admin_berita_list"))


@app.route("/admin/berita/<int:berita_id>/restore-stock", methods=["POST"])
def admin_berita_restore_stock(berita_id):
    if not session.get("logged_in") and not session.get("is_logged_in"):
        return redirect(url_for("admin_login"))

    from datetime import datetime

    berita = Berita.query.get_or_404(berita_id)

    news_set_if_exists(berita, "is_published", False)
    news_set_if_exists(berita, "needs_publish", False)
    news_set_if_exists(berita, "publish_status", "stock")
    news_set_if_exists(berita, "updated_at", datetime.utcnow())

    db.session.commit()
    news_republish_frontend()

    flash("Berita dikembalikan ke stok.", "success")
    return redirect(url_for("admin_berita_list"))

@app.route("/api/berita")
def api_berita():
    return jsonify(build_berita_api_payload())


@app.route("/api/track-click", methods=["POST"])
def track_click():
    data = request.get_json()
    article_id = data.get("articleId")

    # Cari artikel berdasarkan ID dan tambahkan 1 ke click_count
    artikel = Berita.query.get_or_404(article_id)
    artikel.click_count += 1
    db.session.commit()

    return jsonify({"message": "Click counted successfully"}), 200


@app.route("/api/get-click-analytics", methods=["GET"])
def get_click_analytics():
    berita_list = Berita.query.order_by(
        Berita.click_count.desc(),
        Berita.created_at.desc(),
        Berita.id.desc(),
    ).all()

    labels = []
    clicks = []
    total_views = 0
    artikel_live = 0

    for berita in berita_list:
        judul_ringkas = (berita.judul or "Tanpa Judul").strip()
        if len(judul_ringkas) > 42:
            judul_ringkas = judul_ringkas[:42] + "..."

        labels.append(f"{berita.kode_berita or '-'} • {judul_ringkas}")

        nilai_click = int(berita.click_count or 0)
        clicks.append(nilai_click)
        total_views += nilai_click

        if berita.published_at:
            artikel_live += 1

    return jsonify(
        {
            "labels": labels,
            "clicks": clicks,
            "total_views": total_views,
            "top_click": max(clicks) if clicks else 0,
            "artikel_live": artikel_live,
        }
    )


# FFT RANKING API START
@app.route("/api/papan-peringkat")
@app.route("/api/ranking-mahasiswa")
def api_papan_peringkat():
    import json as _json
    import os as _os

    data_path = _os.path.join(app.root_path, "static", "published", "papan_peringkat.json")

    fallback_payload = {
        "status": "success",
        "source": "fallback",
        "default_category": "umum",
        "default_period": "sekarang",
        "data": [
            {
                "rank": 1,
                "name": "Konten Sedang Maintenance",
                "name_en": "Content Under Maintenance",
                "program": "Data akan dikelola melalui backend.",
                "program_en": "Data will be managed through the backend.",
                "score": "0.00",
                "category": "umum",
                "period": "sekarang",
                "trend": "stay",
                "change": 0
            }
        ]
    }

    try:
        if _os.path.exists(data_path):
            with open(data_path, "r", encoding="utf-8-sig") as file:
                payload = _json.load(file)
        else:
            payload = fallback_payload
    except Exception as exc:
        payload = fallback_payload
        payload["source"] = "fallback-error"
        payload["error"] = str(exc)

    return app.response_class(
        response=_json.dumps(payload, ensure_ascii=False),
        status=200,
        mimetype="application/json"
    )
# FFT RANKING API END





# FFT FRONTEND STATIC SERVING START
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"


@app.route("/frontend/<path:filename>")
def fft_frontend_file(filename):
    """
    Melayani file frontend dari Flask agar link admin ke website publik tidak 404.
    Contoh:
    /frontend/pages/indexfft.html
    /frontend/css/style.css
    /frontend/js/script.js
    /frontend/assets/images/...
    """
    return send_from_directory(FRONTEND_DIR, filename)


@app.route("/favicon.ico")
def fft_admin_favicon():
    """
    Favicon fallback untuk tab browser saat halaman admin dibuka.
    """
    return send_from_directory(
        Path(app.static_folder) / "admin" / "images",
        "logo-fft.png",
        mimetype="image/png",
    )
# FFT FRONTEND STATIC SERVING END



# NEWS_API_COMPAT_HELPERS_START

def berita_api_pick(obj, names, default=None):
    for name in names:
        if hasattr(obj, name):
            value = getattr(obj, name)
            if value is not None and value != "":
                return value
    return default


def berita_api_datetime(value):
    if not value:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)




def berita_api_media_path(value):
    path = str(value or "").strip().replace("\\", "/")

    if not path or path.lower() in {"none", "null"}:
        return ""

    if path.startswith("/static/"):
        path = path[len("/static/"):]

    if path.startswith("backend/static/"):
        path = path[len("backend/static/"):]

    if path.startswith("static/"):
        path = path[len("static/"):]

    return path.lstrip("/")


def berita_to_api_item(berita):
    return news_to_api_item(berita)


def build_berita_api_payload():
    now = datetime.utcnow()
    rows = Berita.query.order_by(Berita.id.desc()).all()

    published_items = []

    for berita in rows:
        status = str(getattr(berita, "publish_status", "") or "").lower()

        if status in {"archived", "archive", "arsip"}:
            continue

        if bool(getattr(berita, "is_published", False)):
            published_items.append(berita_to_api_item(berita))

    latest = published_items
    trending = sorted(
        published_items,
        key=lambda item: int(item.get("click_count") or 0),
        reverse=True,
    )

    return {
        "published": True,
        "published_at": now.isoformat(),

        "latest": latest,
        "trending": trending,
        "banner": latest[:3],
        "data": latest,
        "berita": latest,
        "items": latest,
        "news": latest,

        "latest_news": latest,
        "trending_news": trending,
        "all": latest,

        "count": len(latest),
    }


def write_published_berita_payload(payload):
    import json

    published_dir = os.path.join(BASE_DIR, "static", "published")
    os.makedirs(published_dir, exist_ok=True)

    output_path = os.path.join(published_dir, "berita.json")

    with open(output_path, "w", encoding="utf-8") as output:
        json.dump(payload, output, ensure_ascii=False, indent=2)

    return output_path

# NEWS_API_COMPAT_HELPERS_END






# NEWS_MEDIA_RESOLVER_START

NEWS_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

def normalize_static_media_path(value):
    path = str(value or "").strip().replace("\\", "/")

    if not path or path.lower() in {"none", "null"}:
        return ""

    if path.startswith("http://") or path.startswith("https://") or path.startswith("data:"):
        return path

    if path.startswith("/static/"):
        path = path[len("/static/"):]

    if path.startswith("backend/static/"):
        path = path[len("backend/static/"):]

    if path.startswith("static/"):
        path = path[len("static/"):]

    return path.lstrip("/")


def static_media_exists(rel_path):
    rel_path = normalize_static_media_path(rel_path)

    if not rel_path or rel_path.startswith("http") or rel_path.startswith("data:"):
        return False

    return os.path.exists(os.path.join(BASE_DIR, "static", rel_path))


def scan_static_folder_for_image(folder_rel, stems=None):
    folder_rel = normalize_static_media_path(folder_rel)
    stems = [str(stem).lower() for stem in (stems or []) if stem]

    folder_abs = os.path.join(BASE_DIR, "static", folder_rel)

    if not os.path.isdir(folder_abs):
        return ""

    files = []

    for name in sorted(os.listdir(folder_abs)):
        abs_path = os.path.join(folder_abs, name)

        if not os.path.isfile(abs_path):
            continue

        stem, ext = os.path.splitext(name)
        ext = ext.lower()

        if ext in NEWS_IMAGE_EXTENSIONS or ext == "":
            files.append((name, stem.lower()))

    for wanted_stem in stems:
        for name, stem in files:
            if stem == wanted_stem or name.lower() == wanted_stem:
                return f"{folder_rel}/{name}".replace("\\", "/")

    if files:
        return f"{folder_rel}/{files[0][0]}".replace("\\", "/")

    return ""


def resolve_existing_static_media_path(value="", folder_rel="", stems=None):
    rel_path = normalize_static_media_path(value)

    if rel_path and static_media_exists(rel_path):
        return rel_path

    if rel_path and not os.path.splitext(rel_path)[1]:
        for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
            candidate = rel_path + ext
            if static_media_exists(candidate):
                return candidate

    if rel_path:
        folder = os.path.dirname(rel_path).replace("\\", "/")
        stem = os.path.splitext(os.path.basename(rel_path))[0]
        found = scan_static_folder_for_image(folder, [stem])
        if found:
            return found

    if folder_rel:
        found = scan_static_folder_for_image(folder_rel, stems)
        if found:
            return found

    return rel_path


def get_berita_media_code(berita):
    kode = getattr(berita, "kode_berita", None)

    if kode:
        return str(kode).zfill(5)

    return f"{berita.id:05d}"


def berita_media_path(berita, kind="thumbnail"):
    if not berita:
        return ""

    code = get_berita_media_code(berita)
    folder_rel = f"uploads/berita/{code}"

    if kind == "detail":
        fields = [
            "gambar_detail",
            "gambar",
            "gambar_cover",
            "gambar_utama",
            "thumbnail",
            "gambar_thumbnail",
            "image",
            "image_file",
        ]
        stems = ["detail", "gambar_detail", "cover", "thumbnail", "thumb"]
    else:
        fields = [
            "thumbnail",
            "gambar_thumbnail",
            "gambar_cover",
            "gambar_utama",
            "gambar",
            "gambar_detail",
            "image",
            "image_file",
        ]
        stems = ["thumbnail", "thumb", "detail", "gambar_detail", "cover"]

    for field in fields:
        if hasattr(berita, field):
            value = getattr(berita, field, "")
            resolved = resolve_existing_static_media_path(value, folder_rel, stems)

            if resolved and static_media_exists(resolved):
                return resolved

    return resolve_existing_static_media_path("", folder_rel, stems)


def berita_media_url(berita, kind="thumbnail"):
    rel_path = berita_media_path(berita, kind)

    if not rel_path:
        return ""

    if rel_path.startswith("http://") or rel_path.startswith("https://") or rel_path.startswith("data:"):
        return rel_path

    return url_for("static", filename=rel_path)


def static_media_url(path):
    rel_path = resolve_existing_static_media_path(path)

    if not rel_path:
        return ""

    if rel_path.startswith("http://") or rel_path.startswith("https://") or rel_path.startswith("data:"):
        return rel_path

    return url_for("static", filename=rel_path)


app.jinja_env.globals["static_media_url"] = static_media_url
app.jinja_env.globals["berita_media_url"] = berita_media_url

# NEWS_MEDIA_RESOLVER_END











# CRUD_STABILITY_HELPERS_START

def fft_admin_is_logged_in():
    return bool(session.get("logged_in") or session.get("is_logged_in"))


def fft_set_if_exists(obj, field, value):
    if hasattr(obj, field):
        setattr(obj, field, value)


def fft_slugify_text(value):
    text_value = str(value or "").strip().lower()
    text_value = re.sub(r"[^a-z0-9]+", "-", text_value)
    text_value = re.sub(r"-+", "-", text_value).strip("-")
    return text_value or "berita"


def fft_unique_news_slug(title, exclude_id=None):
    base_slug = fft_slugify_text(title)
    candidate = base_slug
    counter = 2

    if not hasattr(Berita, "slug"):
        return candidate

    while True:
        query = Berita.query.filter(Berita.slug == candidate)

        if exclude_id:
            query = query.filter(Berita.id != exclude_id)

        if not query.first():
            return candidate

        candidate = f"{base_slug}-{counter}"
        counter += 1


def fft_next_news_code():
    highest = 0

    for item in Berita.query.all():
        raw_code = str(getattr(item, "kode_berita", "") or "").strip()

        if raw_code.isdigit():
            highest = max(highest, int(raw_code))

    while True:
        highest += 1
        candidate = f"{highest:05d}"

        exists = False
        if hasattr(Berita, "kode_berita"):
            exists = Berita.query.filter(Berita.kode_berita == candidate).first() is not None

        if not exists:
            return candidate


def fft_pick_form(*names, default=""):
    for name in names:
        value = request.form.get(name)

        if value is not None and str(value).strip():
            return str(value).strip()

    return default


def fft_save_news_upload(file_storage, kode_berita, kind, crop_data=""):
    if kind == "thumbnail":
        if "save_berita_thumbnail" in globals():
            return save_berita_thumbnail(file_storage, kode_berita, crop_data)

        target_name = "thumbnail"
    else:
        if "save_berita_detail" in globals():
            return save_berita_detail(file_storage, kode_berita, crop_data)

        target_name = "detail"

    if not file_storage or not file_storage.filename:
        return ""

    folder = os.path.join(BERITA_UPLOAD_FOLDER, kode_berita)
    os.makedirs(folder, exist_ok=True)

    original = secure_filename(file_storage.filename)
    ext = os.path.splitext(original)[1].lower() or ".jpg"
    target_path = os.path.join(folder, f"{target_name}{ext}")

    file_storage.save(target_path)

    return f"uploads/berita/{kode_berita}/{target_name}{ext}"


def fft_save_news_from_request(edit_id=None):
    try:
        form_id = request.form.get("berita_id") or request.form.get("id")

        if edit_id is None and form_id:
            edit_id = int(form_id)

        is_edit = edit_id is not None
        now = datetime.utcnow()

        if is_edit:
            berita = Berita.query.get_or_404(int(edit_id))
            kode_berita = str(getattr(berita, "kode_berita", "") or "").zfill(5)
        else:
            berita = Berita()
            kode_berita = fft_next_news_code()
            fft_set_if_exists(berita, "kode_berita", kode_berita)
            fft_set_if_exists(berita, "created_at", now)

        judul = fft_pick_form("judul", "title", default="")
        subjudul = fft_pick_form("subjudul", "ringkasan", "excerpt", "summary", default="")
        isi = fft_pick_form("isi", "content", "body", default="")
        kategori = fft_pick_form("group_type", "kategori", "category", default="UMUM").upper()

        if not judul:
            judul = f"Berita {kode_berita}"

        if not subjudul:
            subjudul = "Ringkasan berita belum diisi."

        if not isi:
            isi = "Isi berita belum diisi."

        thumbnail_file = (
            request.files.get("thumbnail")
            or request.files.get("gambar_thumbnail")
            or request.files.get("image")
            or request.files.get("image_file")
        )

        detail_file = (
            request.files.get("gambar_detail")
            or request.files.get("detail")
            or request.files.get("gambar")
            or request.files.get("gambar_utama")
        )

        thumbnail_crop_data = (
            request.form.get("thumbnail_crop_data")
            or request.form.get("thumbnailCropData")
            or request.form.get("thumbnail_cropped")
            or ""
        ).strip()

        detail_crop_data = (
            request.form.get("detail_crop_data")
            or request.form.get("gambar_detail_crop_data")
            or request.form.get("detailCropData")
            or request.form.get("detail_cropped")
            or ""
        ).strip()

        if not is_edit:
            if not thumbnail_file or not thumbnail_file.filename:
                flash("Thumbnail berita wajib dipilih sebelum berita disimpan.", "danger")
                return redirect(url_for("admin_berita_add"))

            if not detail_file or not detail_file.filename:
                flash("Gambar detail berita wajib dipilih sebelum berita disimpan.", "danger")
                return redirect(url_for("admin_berita_add"))

        thumbnail_path = ""
        detail_path = ""

        if (thumbnail_file and thumbnail_file.filename) or thumbnail_crop_data:
            thumbnail_path = fft_save_news_upload(thumbnail_file, kode_berita, "thumbnail", thumbnail_crop_data)

        if (detail_file and detail_file.filename) or detail_crop_data:
            detail_path = fft_save_news_upload(detail_file, kode_berita, "detail", detail_crop_data)

        fft_set_if_exists(berita, "judul", judul)
        fft_set_if_exists(berita, "title", judul)
        fft_set_if_exists(berita, "slug", fft_unique_news_slug(judul, getattr(berita, "id", None) if is_edit else None))
        fft_set_if_exists(berita, "subjudul", subjudul)
        fft_set_if_exists(berita, "ringkasan", subjudul)
        fft_set_if_exists(berita, "isi", isi)
        fft_set_if_exists(berita, "content", isi)
        fft_set_if_exists(berita, "group_type", kategori)
        fft_set_if_exists(berita, "kategori", kategori)

        if thumbnail_path:
            fft_set_if_exists(berita, "thumbnail", thumbnail_path)
            fft_set_if_exists(berita, "gambar_thumbnail", thumbnail_path)

        if detail_path:
            fft_set_if_exists(berita, "gambar_detail", detail_path)
            fft_set_if_exists(berita, "gambar", detail_path)

        if not is_edit:
            fft_set_if_exists(berita, "is_published", False)
            fft_set_if_exists(berita, "needs_publish", True)
            fft_set_if_exists(berita, "publish_status", "stock")
            fft_set_if_exists(berita, "published_at", None)
            fft_set_if_exists(berita, "tayang_pada", None)
            fft_set_if_exists(berita, "scheduled_at", None)
            fft_set_if_exists(berita, "click_count", 0)
            fft_set_if_exists(berita, "is_new", False)
            db.session.add(berita)
        else:
            if bool(getattr(berita, "is_published", False)):
                fft_set_if_exists(berita, "needs_publish", True)

        fft_set_if_exists(berita, "updated_at", now)

        db.session.commit()

        if "build_berita_api_payload" in globals() and "write_published_berita_payload" in globals():
            try:
                write_published_berita_payload(build_berita_api_payload())
            except Exception:
                pass

        if is_edit:
            flash("Perubahan berita berhasil disimpan. Silakan tinjau kembali sebelum ditayangkan di website.", "success")
            return redirect(url_for("admin_berita_list", notice="updated"))

        flash("Berita baru berhasil disimpan sebagai stok. Berita dapat ditayangkan dari halaman daftar berita.", "success")
        return redirect(url_for("admin_berita_list", notice="created"))

    except Exception as error:
        db.session.rollback()
        print("NEWS SAVE ERROR:", repr(error))
        traceback.print_exc()
        flash("Berita belum berhasil disimpan. Periksa kembali judul, isi, dan gambar berita.", "danger")

        if edit_id:
            return redirect(url_for("admin_berita_edit", berita_id=edit_id))

        return redirect(url_for("admin_berita_add"))


def save_banner_stock_media_file(file_storage, media_type):
    if not file_storage or not file_storage.filename:
        return False, "", "File media banner wajib dipilih."

    media_type = str(media_type or "image").strip().lower()
    filename = secure_filename(file_storage.filename)
    ext = os.path.splitext(filename)[1].lower()

    image_exts = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    video_exts = {".mp4", ".webm", ".mov"}

    if media_type == "image" and ext not in image_exts:
        return False, "", "Format gambar harus JPG, JPEG, PNG, WEBP, atau GIF."

    if media_type == "video" and ext not in video_exts:
        return False, "", "Format video harus MP4, WEBM, atau MOV."

    if media_type not in {"image", "video"}:
        return False, "", "Jenis banner tidak valid."

    stock_folder = os.path.join(BANNER_UPLOAD_FOLDER, "stock")
    os.makedirs(stock_folder, exist_ok=True)

    stored_name = f"stock_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:10]}{ext}"
    absolute_path = os.path.join(stock_folder, stored_name)

    file_storage.save(absolute_path)

    return True, f"uploads/banner_informasi/stock/{stored_name}", ""


def copy_banner_stock_to_active_media(stock_media_path):
    value = str(stock_media_path or "").strip().replace("\\", "/").lstrip("/")

    if not value:
        return False, "", "Media stok banner tidak ditemukan."

    if value.startswith("backend/static/"):
        value = value[len("backend/static/"):]

    if value.startswith("static/"):
        value = value[len("static/"):]

    source_path = os.path.join(BASE_DIR, "static", value)

    if not os.path.exists(source_path):
        return False, "", "File media stok banner tidak ditemukan di storage."

    ext = os.path.splitext(source_path)[1].lower() or ".jpg"
    active_folder = os.path.join(BANNER_UPLOAD_FOLDER, "single")
    os.makedirs(active_folder, exist_ok=True)

    try:
        if "clear_old_banner_media_files" in globals():
            clear_old_banner_media_files(active_folder)
        else:
            for old_name in os.listdir(active_folder):
                if old_name.startswith("media."):
                    old_path = os.path.join(active_folder, old_name)
                    if os.path.isfile(old_path):
                        os.remove(old_path)
    except Exception:
        pass

    active_name = f"media{ext}"
    destination_path = os.path.join(active_folder, active_name)
    shutil.copy2(source_path, destination_path)

    return True, f"uploads/banner_informasi/single/{active_name}", ""

# CRUD_STABILITY_HELPERS_END

# PANIC_NEWS_BANNER_CRUD_LOCK_START
from pathlib import Path as _panic_Path
from datetime import datetime as _panic_datetime
import os as _panic_os
import re as _panic_re
import uuid as _panic_uuid
import shutil as _panic_shutil
import traceback as _panic_traceback

try:
    from werkzeug.utils import secure_filename as _panic_secure_filename
except Exception:
    _panic_secure_filename = None


def _panic_logged_in():
    return bool(session.get("logged_in") or session.get("is_logged_in"))


def _panic_static_root():
    return _panic_Path(__file__).resolve().parent / "static"


def _panic_news_columns():
    return {column.name: column for column in Berita.__table__.columns}


def _panic_news_pk_name():
    primary_keys = list(Berita.__table__.primary_key.columns)
    return primary_keys[0].name if primary_keys else "id"


def _panic_put(values, names, value):
    columns = _panic_news_columns()
    for name in names:
        if name in columns:
            values[name] = value
            return True
    return False


def _panic_get(obj, names, default=""):
    if obj is None:
        return default
    for name in names:
        if hasattr(obj, name):
            value = getattr(obj, name)
            if value is not None and str(value).strip() != "":
                return value
    return default


def _panic_slugify(value):
    value = str(value or "").strip().lower()
    value = _panic_re.sub(r"[^a-z0-9]+", "-", value)
    value = _panic_re.sub(r"-+", "-", value).strip("-")
    return value or "berita"


def _panic_unique_slug(title, exclude_id=None):
    slug_base = _panic_slugify(title)
    slug = slug_base

    if not hasattr(Berita, "slug"):
        return slug

    pk_name = _panic_news_pk_name()
    pk_attr = getattr(Berita, pk_name, None)

    counter = 2
    while True:
        query = Berita.query.filter(getattr(Berita, "slug") == slug)

        if exclude_id is not None and pk_attr is not None:
            query = query.filter(pk_attr != int(exclude_id))

        if query.first() is None:
            return slug

        slug = f"{slug_base}-{counter}"
        counter += 1


def _panic_next_news_code():
    code_attr = None

    for name in ["kode_berita", "kode", "code"]:
        if hasattr(Berita, name):
            code_attr = getattr(Berita, name)
            break

    used = set()

    if code_attr is not None:
        try:
            for row in db.session.query(code_attr).all():
                raw = row[0] if isinstance(row, tuple) else row
                match = _panic_re.search(r"(\d+)", str(raw or ""))
                if match:
                    used.add(int(match.group(1)))
        except Exception:
            pass

    number = 1
    while number in used:
        number += 1

    return f"{number:05d}"


def _panic_form(*names, default=""):
    for name in names:
        value = request.form.get(name)
        if value is not None and str(value).strip():
            return str(value).strip()
    return default


def _panic_all_uploaded_files():
    files = []
    try:
        for key in request.files:
            for item in request.files.getlist(key):
                if item and getattr(item, "filename", ""):
                    files.append(item)
    except Exception:
        pass
    return files


def _panic_file_by_names(names, index=None):
    for name in names:
        item = request.files.get(name)
        if item and getattr(item, "filename", ""):
            return item

    files = _panic_all_uploaded_files()

    if index is not None and len(files) > index:
        return files[index]

    return None


def _panic_news_folder(kode):
    folder = _panic_static_root() / "uploads" / "berita" / str(kode)
    folder.mkdir(parents=True, exist_ok=True)
    return folder


def _panic_save_news_image(file_storage, kode, kind):
    if not file_storage or not getattr(file_storage, "filename", ""):
        return ""

    folder = _panic_news_folder(kode)

    try:
        from PIL import Image, ImageOps

        try:
            file_storage.stream.seek(0)
        except Exception:
            pass

        image = Image.open(file_storage.stream)
        image = ImageOps.exif_transpose(image)

        if image.mode != "RGB":
            image = image.convert("RGB")

        target = folder / f"{kind}.jpg"
        image.save(target, "JPEG", quality=92, optimize=True)

        return f"uploads/berita/{kode}/{kind}.jpg"

    except Exception:
        try:
            try:
                file_storage.stream.seek(0)
            except Exception:
                pass

            filename = file_storage.filename or f"{kind}.jpg"

            if _panic_secure_filename:
                filename = _panic_secure_filename(filename)

            ext = _panic_os.path.splitext(filename)[1].lower()

            if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
                ext = ".jpg"

            target = folder / f"{kind}{ext}"
            file_storage.save(str(target))

            return f"uploads/berita/{kode}/{kind}{ext}"

        except Exception:
            return ""


def _panic_column_default(column, now):
    type_name = column.type.__class__.__name__.lower()

    if "bool" in type_name:
        return False

    if "int" in type_name:
        return 0

    if "float" in type_name or "numeric" in type_name or "decimal" in type_name:
        return 0

    if "datetime" in type_name:
        return now

    if type_name == "date":
        return now.date()

    return ""


def _panic_fill_required(values, now):
    for column in Berita.__table__.columns:
        name = column.name

        if column.primary_key:
            continue

        if name in values:
            if values[name] is None and not column.nullable:
                values[name] = _panic_column_default(column, now)
            continue

        if column.nullable:
            continue

        if column.default is not None or column.server_default is not None:
            continue

        values[name] = _panic_column_default(column, now)

    return values


def _panic_put_optional_datetime(values, names, now):
    columns = _panic_news_columns()

    for name in names:
        column = columns.get(name)
        if column is None:
            continue

        values[name] = None if column.nullable else now
        return True

    return False


def _panic_build_news_values(kode, title, summary, body, category, thumbnail_path, detail_path, now, is_edit=False, berita_id=None, current=None):
    values = {}

    _panic_put(values, ["kode_berita", "kode", "code"], kode)
    _panic_put(values, ["judul", "title", "headline"], title)
    _panic_put(values, ["slug"], _panic_unique_slug(title, berita_id))
    _panic_put(values, ["subjudul", "ringkasan", "summary", "excerpt", "description"], summary)
    _panic_put(values, ["isi", "konten", "content", "body", "artikel"], body)
    _panic_put(values, ["group_type", "kategori", "category", "jenis"], category)

    _panic_put(values, ["thumbnail", "gambar_thumbnail", "thumbnail_path", "image", "image_file"], thumbnail_path)
    _panic_put(values, ["gambar_detail", "detail", "detail_image", "gambar", "gambar_utama"], detail_path)

    _panic_put(values, ["updated_at"], now)

    if not is_edit:
        _panic_put(values, ["created_at"], now)
        _panic_put(values, ["is_published", "published"], False)
        _panic_put(values, ["needs_publish"], False)
        _panic_put(values, ["publish_status", "status"], "stock")
        _panic_put(values, ["click_count", "views", "view_count"], 0)
        _panic_put(values, ["is_new"], False)

        _panic_put_optional_datetime(values, ["published_at"], now)
        _panic_put_optional_datetime(values, ["tayang_pada"], now)
        _panic_put_optional_datetime(values, ["scheduled_at"], now)
        _panic_put_optional_datetime(values, ["last_previewed_at"], now)
        _panic_put_optional_datetime(values, ["new_until"], now)

    else:
        is_published = bool(_panic_get(current, ["is_published", "published"], False))
        if is_published:
            _panic_put(values, ["needs_publish"], True)

    return _panic_fill_required(values, now)


def _panic_publish_news_snapshot_safe():
    try:
        if callable(globals().get("publish_berita_snapshot")):
            publish_berita_snapshot()
            return

        if callable(globals().get("build_berita_api_payload")) and callable(globals().get("write_published_berita_payload")):
            write_published_berita_payload(build_berita_api_payload())
            return

        if callable(globals().get("build_berita_payload")) and callable(globals().get("write_published_berita_payload")):
            write_published_berita_payload(build_berita_payload())
            return
    except Exception:
        pass


def _panic_save_news(berita_id=None):
    now = _panic_datetime.utcnow()

    try:
        form_id = request.form.get("berita_id") or request.form.get("id")
        if berita_id is None and form_id:
            berita_id = int(form_id)

        is_edit = berita_id is not None
        current = Berita.query.get(int(berita_id)) if is_edit else None

        if is_edit and current is None:
            flash("Berita tidak ditemukan.", "danger")
            return redirect(url_for("admin_berita_list"))

        kode = str(_panic_get(current, ["kode_berita", "kode", "code"], "") or "").strip()
        if not kode:
            kode = _panic_next_news_code()

        title = _panic_form(
            "judul",
            "title",
            "headline",
            "nama_berita",
            default="",
        )

        summary = _panic_form(
            "subjudul",
            "ringkasan",
            "summary",
            "excerpt",
            "description",
            default="",
        )

        body = _panic_form(
            "isi",
            "konten",
            "content",
            "body",
            "artikel",
            default="",
        )

        category = _panic_form(
            "group_type",
            "kategori",
            "category",
            "jenis",
            default="UMUM",
        )

        if not title:
            title = "Berita Tanpa Judul"

        if not summary:
            summary = title

        if not body:
            body = summary

        existing_thumbnail = str(_panic_get(current, ["thumbnail", "gambar_thumbnail", "thumbnail_path", "image", "image_file"], "") or "").strip()
        existing_detail = str(_panic_get(current, ["gambar_detail", "detail", "detail_image", "gambar", "gambar_utama"], "") or "").strip()

        thumbnail_file = _panic_file_by_names(
            [
                "thumbnail",
                "thumbnail_file",
                "gambar_thumbnail",
                "gambar_thumbnail_file",
                "thumb",
                "thumb_file",
                "image",
                "image_file",
                "foto",
                "thumbnail_input",
            ],
            0,
        )

        detail_file = _panic_file_by_names(
            [
                "gambar_detail",
                "gambar_detail_file",
                "detail",
                "detail_file",
                "gambar",
                "gambar_utama",
                "gambar_utama_file",
                "main_image",
            ],
            1,
        )

        thumbnail_path = _panic_save_news_image(thumbnail_file, kode, "thumbnail") or existing_thumbnail
        detail_path = _panic_save_news_image(detail_file, kode, "detail") or existing_detail

        if thumbnail_path and not detail_path:
            detail_path = thumbnail_path

        if detail_path and not thumbnail_path:
            thumbnail_path = detail_path

        if not thumbnail_path:
            thumbnail_path = f"uploads/berita/{kode}/thumbnail.jpg"

        if not detail_path:
            detail_path = thumbnail_path

        values = _panic_build_news_values(
            kode,
            title,
            summary,
            body,
            category,
            thumbnail_path,
            detail_path,
            now,
            is_edit=is_edit,
            berita_id=berita_id,
            current=current,
        )

        table = Berita.__table__

        if is_edit:
            pk_name = _panic_news_pk_name()
            db.session.execute(
                table.update()
                .where(table.c[pk_name] == int(berita_id))
                .values(**values)
            )
            notice = "updated"
            message = "Perubahan berita berhasil disimpan. Silakan tinjau kembali sebelum berita ditayangkan di website."
        else:
            db.session.execute(table.insert().values(**values))
            notice = "created"
            message = "Berita baru berhasil disimpan sebagai stok berita. Berita dapat ditayangkan dari halaman Kelola Berita."

        db.session.commit()
        _panic_publish_news_snapshot_safe()

        flash(message, "success")
        return redirect(url_for("admin_berita_list", notice=notice))

    except Exception as error:
        db.session.rollback()

        print("\n=== PANIC NEWS SAVE ERROR ASLI ===")
        print(repr(error))
        _panic_traceback.print_exc()
        print("=== END PANIC NEWS SAVE ERROR ASLI ===\n")

        flash("Berita belum berhasil disimpan karena terjadi kesalahan teknis. Detail error sudah ditampilkan di terminal.", "danger")

        if berita_id:
            return redirect(url_for("admin_berita_edit", berita_id=berita_id))

        return redirect(url_for("admin_berita_list", notice="save_failed"))


def _panic_admin_berita_add():
    if not _panic_logged_in():
        return redirect(url_for("admin_login"))

    if request.method == "POST":
        return _panic_save_news()

    return render_template(
        "admin_berita_form.html",
        berita=None,
        is_edit=False,
        form_publish_mode="stock",
        berita_thumb_crop_width=globals().get("BERITA_THUMB_CROP_WIDTH", 1450),
        berita_thumb_crop_height=globals().get("BERITA_THUMB_CROP_HEIGHT", 1000),
        berita_detail_crop_width=globals().get("BERITA_DETAIL_CROP_WIDTH", 1600),
        berita_detail_crop_height=globals().get("BERITA_DETAIL_CROP_HEIGHT", 900),
    )


def _panic_admin_berita_edit(berita_id):
    if not _panic_logged_in():
        return redirect(url_for("admin_login"))

    if request.method == "POST":
        return _panic_save_news(berita_id)

    berita = Berita.query.get_or_404(int(berita_id))

    return render_template(
        "admin_berita_form.html",
        berita=berita,
        is_edit=True,
        form_publish_mode="published" if bool(_panic_get(berita, ["is_published", "published"], False)) else "stock",
        berita_thumb_crop_width=globals().get("BERITA_THUMB_CROP_WIDTH", 1450),
        berita_thumb_crop_height=globals().get("BERITA_THUMB_CROP_HEIGHT", 1000),
        berita_detail_crop_width=globals().get("BERITA_DETAIL_CROP_WIDTH", 1600),
        berita_detail_crop_height=globals().get("BERITA_DETAIL_CROP_HEIGHT", 900),
    )


def _panic_admin_berita_save():
    if not _panic_logged_in():
        return redirect(url_for("admin_login"))

    if request.method == "GET":
        return redirect(url_for("admin_berita_list"))

    berita_id = request.form.get("berita_id") or request.form.get("id")

    if berita_id:
        return _panic_save_news(int(berita_id))

    return _panic_save_news()


def save_banner_stock_media_file(file_storage, media_type):
    if not file_storage or not getattr(file_storage, "filename", ""):
        return False, "", "File banner wajib dipilih."

    media_type = str(media_type or "image").strip().lower()

    filename = file_storage.filename or "banner.jpg"
    if _panic_secure_filename:
        filename = _panic_secure_filename(filename)

    ext = _panic_os.path.splitext(filename)[1].lower()

    image_exts = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    video_exts = {".mp4", ".webm", ".mov", ".m4v"}

    if media_type == "video":
        allowed = video_exts
        fallback_ext = ".mp4"
    else:
        allowed = image_exts
        fallback_ext = ".jpg"
        media_type = "image"

    if ext not in allowed:
        ext = fallback_ext

    folder = _panic_static_root() / "uploads" / "banner_informasi" / "stock"
    folder.mkdir(parents=True, exist_ok=True)

    stored_name = f"stock_{_panic_datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{_panic_uuid.uuid4().hex[:10]}{ext}"
    target = folder / stored_name

    try:
        file_storage.stream.seek(0)
    except Exception:
        pass

    file_storage.save(str(target))

    return True, f"uploads/banner_informasi/stock/{stored_name}", "Banner berhasil disimpan sebagai stok."


def copy_banner_stock_to_active_media(stock_media_path):
    value = str(stock_media_path or "").strip().replace("\\", "/").lstrip("/")

    if value.startswith("backend/static/"):
        value = value[len("backend/static/"):]

    if value.startswith("static/"):
        value = value[len("static/"):]

    if value.startswith("/static/"):
        value = value[len("/static/"):]

    source = _panic_static_root() / value

    if not value or not source.exists():
        return False, "", "File stok banner tidak ditemukan."

    ext = source.suffix.lower() or ".jpg"

    active_folder = _panic_static_root() / "uploads" / "banner_informasi" / "single"
    active_folder.mkdir(parents=True, exist_ok=True)

    for old_file in active_folder.glob("media.*"):
        try:
            old_file.unlink()
        except Exception:
            pass

    target = active_folder / f"media{ext}"
    _panic_shutil.copy2(str(source), str(target))

    return True, f"uploads/banner_informasi/single/media{ext}", "Banner berhasil dijadikan tampilan aktif."


globals()["save_banner_stock_media_file"] = save_banner_stock_media_file
globals()["copy_banner_stock_to_active_media"] = copy_banner_stock_to_active_media

app.view_functions["admin_berita_add"] = _panic_admin_berita_add
app.view_functions["admin_berita_edit"] = _panic_admin_berita_edit
app.view_functions["admin_berita_save"] = _panic_admin_berita_save

# PANIC_NEWS_BANNER_CRUD_LOCK_END


# === FFT STABLE NEWS AND BANNER SAVE PATCH ===
import re as _fft_re
import uuid as _fft_uuid
import shutil as _fft_shutil
import traceback as _fft_traceback
from pathlib import Path as _fft_Path
from datetime import datetime as _fft_datetime
from flask import request as _fft_request, redirect as _fft_redirect
from werkzeug.utils import secure_filename as _fft_secure_filename


def _fft_news_slugify(value):
    value = str(value or "").strip().lower()
    value = _fft_re.sub(r"[^a-z0-9]+", "-", value)
    value = _fft_re.sub(r"-+", "-", value).strip("-")
    return value or "berita"


def _fft_news_unique_slug(title, berita_id=None):
    base = _fft_news_slugify(title)
    slug = base
    counter = 2

    while True:
        query = Berita.query.filter(Berita.slug == slug)
        if berita_id:
            query = query.filter(Berita.id != berita_id)

        if not query.first():
            return slug

        slug = f"{base}-{counter}"
        counter += 1


def _fft_news_next_code():
    used_codes = set()

    for row in db.session.query(Berita.kode_berita).all():
        raw = str(row[0] or "").strip()
        if raw.isdigit():
            used_codes.add(raw.zfill(5))

    number = 1
    while True:
        code = f"{number:05d}"
        if code not in used_codes:
            return code
        number += 1


def _fft_news_form_value(*names, default=""):
    for name in names:
        value = _fft_request.form.get(name)
        if value is not None and str(value).strip() != "":
            return str(value).strip()
    return default


def _fft_news_file_value(*names):
    for name in names:
        uploaded = _fft_request.files.get(name)
        if uploaded and uploaded.filename:
            return uploaded
    return None


def _fft_news_save_upload(uploaded_file, kode_berita, target_name):
    if not uploaded_file or not uploaded_file.filename:
        return None

    safe_name = _fft_secure_filename(uploaded_file.filename)
    ext = _fft_Path(safe_name).suffix.lower()

    allowed = {".jpg", ".jpeg", ".png", ".webp"}
    if ext not in allowed:
        ext = ".jpg"

    folder = _fft_Path(app.root_path) / "static" / "uploads" / "berita" / str(kode_berita)
    folder.mkdir(parents=True, exist_ok=True)

    for old_file in folder.glob(f"{target_name}.*"):
        try:
            old_file.unlink()
        except Exception:
            pass

    target = folder / f"{target_name}{ext}"
    uploaded_file.save(str(target))

    return f"uploads/berita/{kode_berita}/{target.name}"


def _fft_news_apply_form_to_item(item, is_new=False):
    title = _fft_news_form_value("judul", "title", default="")
    summary = _fft_news_form_value("subjudul", "ringkasan", "summary", default="")
    content = _fft_news_form_value("isi", "konten", "content", "body", default="")
    category = _fft_news_form_value("group_type", "kategori", "category", default="UMUM").upper()

    if not title:
        raise ValueError("Judul berita kosong.")

    if not content:
        content = summary or "Konten berita sedang disiapkan."

    if not summary:
        summary = content[:180]

    now = _fft_datetime.utcnow()

    if is_new:
        item.kode_berita = item.kode_berita or _fft_news_next_code()
        item.created_at = item.created_at or now
        item.is_published = False
        item.needs_publish = False
        item.publish_status = "stock"
        item.published_at = None
        item.tayang_pada = None
        item.click_count = item.click_count or 0
        item.is_new = False

    item.judul = title
    item.slug = _fft_news_unique_slug(title, getattr(item, "id", None))
    item.subjudul = summary
    item.isi = content
    item.group_type = category[:20] or "UMUM"
    item.updated_at = now

    thumbnail_file = _fft_news_file_value("thumbnail", "thumbnail_file", "gambar_thumbnail")
    detail_file = _fft_news_file_value("gambar_detail", "detail", "detail_file", "image_detail")

    if thumbnail_file:
        item.thumbnail = _fft_news_save_upload(thumbnail_file, item.kode_berita, "thumbnail")

    if detail_file:
        item.gambar_detail = _fft_news_save_upload(detail_file, item.kode_berita, "detail")

    return item


_FFT_ORIGINAL_NEWS_ADD_VIEW = app.view_functions.get("admin_berita_add")
_FFT_ORIGINAL_NEWS_EDIT_VIEW = app.view_functions.get("admin_berita_edit")


def _fft_stable_news_add():
    if _fft_request.method == "GET":
        return _FFT_ORIGINAL_NEWS_ADD_VIEW()

    try:
        item = Berita()
        _fft_news_apply_form_to_item(item, is_new=True)

        db.session.add(item)
        db.session.commit()

        return _fft_redirect("/admin/berita/list?notice=new_saved")

    except Exception:
        db.session.rollback()
        print("\n=== FFT NEWS ADD SAVE ERROR ===")
        _fft_traceback.print_exc()
        print("=== END FFT NEWS ADD SAVE ERROR ===\n")
        return _fft_redirect("/admin/berita/list?notice=save_failed")


def _fft_stable_news_edit(berita_id):
    if _fft_request.method == "GET":
        return _FFT_ORIGINAL_NEWS_EDIT_VIEW(berita_id)

    try:
        item = Berita.query.get_or_404(berita_id)

        if not item.kode_berita:
            item.kode_berita = _fft_news_next_code()

        _fft_news_apply_form_to_item(item, is_new=False)

        db.session.commit()

        return _fft_redirect("/admin/berita/list?notice=changes_saved")

    except Exception:
        db.session.rollback()
        print("\n=== FFT NEWS EDIT SAVE ERROR ===")
        _fft_traceback.print_exc()
        print("=== END FFT NEWS EDIT SAVE ERROR ===\n")
        return _fft_redirect("/admin/berita/list?notice=save_failed")


app.view_functions["admin_berita_add"] = _fft_stable_news_add
app.view_functions["admin_berita_edit"] = _fft_stable_news_edit


def save_banner_stock_media_file(media_file, media_type=None):
    if not media_file or not media_file.filename:
        return False, None, "File banner belum dipilih."

    safe_name = _fft_secure_filename(media_file.filename)
    ext = _fft_Path(safe_name).suffix.lower()

    allowed = {".jpg", ".jpeg", ".png", ".webp", ".mp4", ".webm", ".mov"}
    if ext not in allowed:
        return False, None, "Format file banner tidak didukung."

    folder = _fft_Path(app.root_path) / "static" / "uploads" / "banner_informasi" / "stock"
    folder.mkdir(parents=True, exist_ok=True)

    filename = f"stock_{_fft_datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{_fft_uuid.uuid4().hex[:10]}{ext}"
    target = folder / filename
    media_file.save(str(target))

    return True, f"uploads/banner_informasi/stock/{filename}", "Stok banner berhasil disimpan."


def copy_banner_stock_to_active_media(stock_media_path):
    rel_path = str(stock_media_path or "").strip().lstrip("/")
    if not rel_path:
        return False, None, "File stok banner tidak ditemukan."

    src = _fft_Path(app.root_path) / "static" / rel_path

    if not src.exists():
        src = _fft_Path(app.root_path) / "static" / "uploads" / "banner_informasi" / "stock" / _fft_Path(rel_path).name

    if not src.exists():
        return False, None, "File stok banner tidak ditemukan di folder upload."

    ext = src.suffix.lower() or ".jpg"

    active_folder = _fft_Path(app.root_path) / "static" / "uploads" / "banner_informasi" / "single"
    active_folder.mkdir(parents=True, exist_ok=True)

    for old_file in active_folder.glob("media.*"):
        try:
            old_file.unlink()
        except Exception:
            pass

    target = active_folder / f"media{ext}"
    _fft_shutil.copy2(src, target)

    return True, f"uploads/banner_informasi/single/{target.name}", "Banner berhasil dijadikan tampilan aktif."


# === END FFT STABLE NEWS AND BANNER SAVE PATCH ===




# === FFT STABLE NEWS AND BANNER HOTFIX START ===

def _fft_make_slug(value):
    import re
    import unicodedata

    text = unicodedata.normalize("NFKD", str(value or ""))
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text or "berita"


def _fft_unique_news_slug(title, ignore_id=None):
    base = _fft_make_slug(title)
    slug = base
    counter = 2

    while True:
        query = Berita.query.filter(Berita.slug == slug)
        if ignore_id:
            query = query.filter(Berita.id != ignore_id)

        if not query.first():
            return slug

        slug = f"{base}-{counter}"
        counter += 1


def _fft_next_news_code():
    codes = []
    for row in Berita.query.with_entities(Berita.kode_berita).all():
        code = str(row[0] or "").strip()
        if code.isdigit():
            codes.append(int(code))

    next_number = (max(codes) + 1) if codes else 1
    return f"{next_number:05d}"


def _fft_first_form_value(*names):
    from flask import request

    for name in names:
        value = request.form.get(name)
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""


def _fft_first_uploaded_file(*names):
    from flask import request

    for name in names:
        try:
            uploaded_list = request.files.getlist(name)
        except Exception:
            uploaded_list = []

        for uploaded in uploaded_list:
            filename = str(getattr(uploaded, "filename", "") or "").strip()
            if filename:
                return uploaded

    return None


def _fft_save_news_media(uploaded_file, kode_berita, target_name):
    from pathlib import Path
    from werkzeug.utils import secure_filename

    if not uploaded_file or not uploaded_file.filename:
        return None

    filename = secure_filename(uploaded_file.filename)
    suffix = Path(filename).suffix.lower() or ".jpg"

    allowed = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    if suffix not in allowed:
        suffix = ".jpg"

    news_dir = Path(app.root_path) / "static" / "uploads" / "berita" / kode_berita
    news_dir.mkdir(parents=True, exist_ok=True)

    target_file = news_dir / f"{target_name}{suffix}"
    uploaded_file.save(target_file)

    return f"uploads/berita/{kode_berita}/{target_name}{suffix}"


def _fft_save_banner_stock_media_file(media_file, media_type=None):
    from pathlib import Path
    from datetime import datetime
    from werkzeug.utils import secure_filename
    import secrets

    if not media_file or not media_file.filename:
        return False, None, "File banner belum dipilih."

    filename = secure_filename(media_file.filename)
    suffix = Path(filename).suffix.lower()

    allowed = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".mov"}
    if suffix not in allowed:
        return False, None, "Format file banner tidak didukung."

    stock_dir = Path(app.root_path) / "static" / "uploads" / "banner_informasi" / "stock"
    stock_dir.mkdir(parents=True, exist_ok=True)

    saved_name = f"stock_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{secrets.token_hex(5)}{suffix}"
    target_file = stock_dir / saved_name

    media_file.save(target_file)

    return True, f"uploads/banner_informasi/stock/{saved_name}", "Banner berhasil disimpan ke stok."


def _fft_copy_banner_stock_to_active_media(media_file):
    from pathlib import Path
    import shutil

    if not media_file:
        return False, None, "File stok banner tidak ditemukan."

    relative_path = str(media_file).replace("\\", "/").lstrip("/")
    if relative_path.startswith("static/"):
        relative_path = relative_path[len("static/"):]

    source_file = Path(app.root_path) / "static" / relative_path
    if not source_file.exists():
        return False, None, "File stok banner tidak ditemukan di folder upload."

    active_dir = Path(app.root_path) / "static" / "uploads" / "banner_informasi" / "single"
    active_dir.mkdir(parents=True, exist_ok=True)

    for old_file in active_dir.glob("media.*"):
        try:
            old_file.unlink()
        except OSError:
            pass

    suffix = source_file.suffix.lower() or ".jpg"
    active_file = active_dir / f"media{suffix}"
    shutil.copy2(source_file, active_file)

    return True, f"uploads/banner_informasi/single/media{suffix}", "Banner berhasil dijadikan tampilan utama."


globals()["save_banner_stock_media_file"] = globals().get("save_banner_stock_media_file") or _fft_save_banner_stock_media_file
globals()["copy_banner_stock_to_active_media"] = globals().get("copy_banner_stock_to_active_media") or _fft_copy_banner_stock_to_active_media


_fft_original_admin_berita_add = app.view_functions.get("admin_berita_add")
_fft_original_admin_berita_edit = app.view_functions.get("admin_berita_edit")


def _fft_create_news_from_request():
    from flask import redirect, url_for
    from datetime import datetime
    import traceback

    try:
        title = _fft_first_form_value("judul", "title")
        summary = _fft_first_form_value("subjudul", "ringkasan", "summary")
        content = _fft_first_form_value("isi", "konten", "content", "body")
        group_type = _fft_first_form_value("group_type", "kategori", "category") or "UMUM"

        thumbnail_file = _fft_first_uploaded_file(
            "thumbnail",
            "thumbnail_file",
            "thumbnail_kartu",
            "card_image",
            "image_thumbnail",
            "cropped_thumbnail",
            "thumbnail_cropped",
        )

        detail_file = _fft_first_uploaded_file(
            "gambar_detail",
            "gambar_detail_file",
            "detail_file",
            "detail_image",
            "detail",
            "image_detail",
            "cropped_detail",
            "detail_cropped",
        )

        if not title or not summary or not content or not thumbnail_file or not detail_file:
            print("[NEWS_SAVE_ERROR] Data belum lengkap.")
            print("[NEWS_SAVE_ERROR] title:", bool(title), "summary:", bool(summary), "content:", bool(content))
            print("[NEWS_SAVE_ERROR] files:", list(request.files.keys()))
            return redirect(url_for("admin_berita_list", notice="save_failed"))

        now = datetime.utcnow()
        kode_berita = _fft_next_news_code()

        news = Berita()
        news.kode_berita = kode_berita
        news.judul = title
        news.slug = _fft_unique_news_slug(title)
        news.subjudul = summary
        news.isi = content
        news.thumbnail = _fft_save_news_media(thumbnail_file, kode_berita, "thumbnail")
        news.gambar_detail = _fft_save_news_media(detail_file, kode_berita, "detail")
        news.is_published = False
        news.needs_publish = False
        news.created_at = now
        news.updated_at = now
        news.published_at = None
        news.tayang_pada = None
        news.group_type = group_type[:20]
        news.is_new = False
        news.new_until = None
        news.click_count = 0
        news.publish_status = "stock"
        news.scheduled_at = None
        news.last_previewed_at = None

        db.session.add(news)
        db.session.commit()

        return redirect(url_for("admin_berita_list", notice="created"))

    except Exception as error:
        db.session.rollback()
        print("\n[NEWS_SAVE_ERROR] Gagal menyimpan berita baru:")
        print(repr(error))
        traceback.print_exc()
        return redirect(url_for("admin_berita_list", notice="save_failed"))


def _fft_update_news_from_request(berita_id):
    from flask import redirect, url_for
    from datetime import datetime
    import traceback

    try:
        news = Berita.query.get_or_404(berita_id)

        title = _fft_first_form_value("judul", "title")
        summary = _fft_first_form_value("subjudul", "ringkasan", "summary")
        content = _fft_first_form_value("isi", "konten", "content", "body")
        group_type = _fft_first_form_value("group_type", "kategori", "category") or getattr(news, "group_type", "UMUM") or "UMUM"

        if not title or not summary or not content:
            print("[NEWS_UPDATE_ERROR] Judul, ringkasan, atau isi kosong.")
            return redirect(url_for("admin_berita_list", notice="save_failed"))

        if not getattr(news, "kode_berita", None):
            news.kode_berita = _fft_next_news_code()

        news.judul = title
        news.slug = _fft_unique_news_slug(title, ignore_id=news.id)
        news.subjudul = summary
        news.isi = content
        news.group_type = group_type[:20]
        news.updated_at = datetime.utcnow()

        thumbnail_file = _fft_first_uploaded_file(
            "thumbnail",
            "thumbnail_file",
            "thumbnail_kartu",
            "card_image",
            "image_thumbnail",
            "cropped_thumbnail",
            "thumbnail_cropped",
        )

        detail_file = _fft_first_uploaded_file(
            "gambar_detail",
            "gambar_detail_file",
            "detail_file",
            "detail_image",
            "detail",
            "image_detail",
            "cropped_detail",
            "detail_cropped",
        )

        if thumbnail_file:
            news.thumbnail = _fft_save_news_media(thumbnail_file, news.kode_berita, "thumbnail")

        if detail_file:
            news.gambar_detail = _fft_save_news_media(detail_file, news.kode_berita, "detail")

        if not getattr(news, "slug", None):
            news.slug = _fft_unique_news_slug(news.judul, ignore_id=news.id)

        if not getattr(news, "publish_status", None):
            news.publish_status = "stock"

        db.session.commit()

        return redirect(url_for("admin_berita_list", notice="saved"))

    except Exception as error:
        db.session.rollback()
        print("\n[NEWS_UPDATE_ERROR] Gagal menyimpan perubahan berita:")
        print(repr(error))
        traceback.print_exc()
        return redirect(url_for("admin_berita_list", notice="save_failed"))


def _fft_stable_admin_berita_add():
    from flask import request

    if request.method == "GET":
        return _fft_original_admin_berita_add()

    return _fft_create_news_from_request()


def _fft_stable_admin_berita_edit(berita_id):
    from flask import request

    if request.method == "GET":
        return _fft_original_admin_berita_edit(berita_id)

    return _fft_update_news_from_request(berita_id)


def _fft_stable_admin_berita_save():
    from flask import request, redirect, url_for

    if request.method == "GET":
        return redirect(url_for("admin_berita_list"))

    berita_id = request.form.get("berita_id") or request.form.get("id")
    if berita_id and str(berita_id).isdigit():
        return _fft_update_news_from_request(int(berita_id))

    return _fft_create_news_from_request()


app.view_functions["admin_berita_add"] = _fft_stable_admin_berita_add
app.view_functions["admin_berita_edit"] = _fft_stable_admin_berita_edit
app.view_functions["admin_berita_save"] = _fft_stable_admin_berita_save

# === FFT STABLE NEWS AND BANNER HOTFIX END ===


# PATCH_NEWS_EDIT_PRESERVE_STATUS_START
def _patch_news_preserve_get(obj, names, default=None):
    if obj is None:
        return default

    for name in names:
        if hasattr(obj, name):
            value = getattr(obj, name)
            if value is not None:
                return value

    return default


def _patch_news_preserve_existing_status(values, current):
    if current is None:
        return values

    preserved_columns = {
        "is_published": ["is_published", "published"],
        "published": ["is_published", "published"],
        "needs_publish": ["needs_publish"],
        "publish_status": ["publish_status", "status"],
        "status": ["publish_status", "status"],
        "published_at": ["published_at", "tayang_pada"],
        "tayang_pada": ["tayang_pada", "published_at"],
        "scheduled_at": ["scheduled_at"],
        "last_previewed_at": ["last_previewed_at"],
        "created_at": ["created_at"],
        "click_count": ["click_count", "views", "view_count"],
        "views": ["click_count", "views", "view_count"],
        "view_count": ["click_count", "views", "view_count"],
        "is_new": ["is_new"],
        "new_until": ["new_until"],
    }

    try:
        columns = _abs_news_columns() if "_abs_news_columns" in globals() else {c.name: c for c in Berita.__table__.columns}
    except Exception:
        columns = {}

    for column_name, candidate_names in preserved_columns.items():
        if column_name not in columns:
            continue

        existing_value = _patch_news_preserve_get(current, candidate_names, None)

        if existing_value is not None:
            values[column_name] = existing_value

    return values


# FFT_DISABLE_BROKEN_NEWS_PRESERVE_STATUS_PATCH_20260518
# Patch lama PATCH_NEWS_EDIT_PRESERVE_STATUS dimatikan karena memanggil
# _abs_build_news_values yang tidak ada.
# Alur edit, save, dan delete berita sekarang ditangani oleh
# FFT NEWS EDIT DELETE GUARD di bawah.



# === FFT NEWS EDIT DELETE GUARD START ===

def _fft_news_guard_logged_in():
    return bool(session.get("logged_in") or session.get("is_logged_in"))


def _fft_news_guard_text(*names, default=""):
    for name in names:
        value = request.form.get(name)
        if value is not None and str(value).strip():
            return str(value).strip()
    return default


def _fft_news_guard_file(*names):
    for name in names:
        file_storage = request.files.get(name)
        if file_storage and getattr(file_storage, "filename", ""):
            return file_storage
    return None


def _fft_news_guard_slugify(value):
    text_value = str(value or "").strip().lower()
    text_value = re.sub(r"[^a-z0-9]+", "-", text_value)
    text_value = re.sub(r"-+", "-", text_value).strip("-")
    return text_value or f"berita-{uuid.uuid4().hex[:8]}"


def _fft_news_guard_unique_slug(title, ignore_id=None):
    base_slug = _fft_news_guard_slugify(title)
    slug = base_slug
    counter = 2

    while True:
        query = Berita.query.filter(Berita.slug == slug)

        if ignore_id:
            query = query.filter(Berita.id != int(ignore_id))

        if not query.first():
            return slug

        slug = f"{base_slug}-{counter}"
        counter += 1


def _fft_news_guard_next_code():
    max_number = 0

    for item in Berita.query.all():
        raw = str(getattr(item, "kode_berita", "") or "")
        match = re.search(r"\d+", raw)
        if match:
            max_number = max(max_number, int(match.group(0)))

    return str(max_number + 1).zfill(5)


def _fft_news_guard_upload_root():
    return Path(BERITA_UPLOAD_FOLDER)


def _fft_news_guard_folder(kode_berita):
    folder = _fft_news_guard_upload_root() / str(kode_berita)
    folder.mkdir(parents=True, exist_ok=True)
    return folder


def _fft_news_guard_clean_old_variant(folder, prefix):
    allowed = set(globals().get("ALLOWED_EXTENSIONS", {"png", "jpg", "jpeg", "webp"})) | {"jpg", "jpeg", "png", "webp"}
    for ext in allowed:
        target = folder / f"{prefix}.{ext}"
        if target.exists() and target.is_file():
            try:
                target.unlink()
            except OSError:
                pass


def _fft_news_guard_save_file(file_storage, kode_berita, prefix):
    if not file_storage or not getattr(file_storage, "filename", ""):
        return None

    original_name = secure_filename(file_storage.filename)
    if "." not in original_name:
        raise ValueError("File gambar tidak memiliki ekstensi.")

    ext = original_name.rsplit(".", 1)[1].lower()
    allowed = set(globals().get("ALLOWED_EXTENSIONS", {"png", "jpg", "jpeg", "webp"}))

    if ext not in allowed:
        raise ValueError("Format gambar berita tidak didukung.")

    folder = _fft_news_guard_folder(kode_berita)
    _fft_news_guard_clean_old_variant(folder, prefix)

    filename = f"{prefix}.{ext}"
    target = folder / filename

    try:
        file_storage.stream.seek(0)
    except Exception:
        pass

    file_storage.save(str(target))

    return f"uploads/berita/{kode_berita}/{filename}"


def _fft_news_guard_make_placeholder(kode_berita, prefix):
    width = 1450 if prefix == "thumbnail" else 1600
    height = 1000 if prefix == "thumbnail" else 900

    folder = _fft_news_guard_folder(kode_berita)
    _fft_news_guard_clean_old_variant(folder, prefix)

    target = folder / f"{prefix}.jpg"

    try:
        image = Image.new("RGB", (width, height), (15, 15, 15))
        draw = ImageDraw.Draw(image)
        text_value = "Gambar berita belum tersedia"

        try:
            bbox = draw.textbbox((0, 0), text_value)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
        except Exception:
            text_w = 360
            text_h = 24

        draw.text(
            ((width - text_w) / 2, (height - text_h) / 2),
            text_value,
            fill=(230, 230, 230),
        )
        image.save(str(target), format="JPEG", quality=88)
    except Exception:
        target.write_bytes(b"")

    return f"uploads/berita/{kode_berita}/{prefix}.jpg"


def _fft_news_guard_delete_folder(kode_berita):
    if not kode_berita:
        return

    folder = _fft_news_guard_upload_root() / str(kode_berita)

    if folder.exists() and folder.is_dir():
        shutil.rmtree(str(folder), ignore_errors=True)


def _fft_news_guard_publish_snapshot():
    try:
        if "news_republish_frontend" in globals():
            news_republish_frontend()
            return

        if "publish_berita_snapshot" in globals():
            publish_berita_snapshot()
            return

        if "build_berita_api_payload" in globals() and "write_published_berita_payload" in globals():
            write_published_berita_payload(build_berita_api_payload())
    except Exception as error:
        print("[NEWS_GUARD] Snapshot berita gagal diperbarui:", repr(error))


def _fft_news_guard_is_live(item):
    status = str(getattr(item, "publish_status", "") or "").lower()
    return bool(getattr(item, "is_published", False)) or status == "published"


def _fft_news_guard_save(berita_id=None):
    if not _fft_news_guard_logged_in():
        return redirect(url_for("admin_login"))

    is_edit = berita_id is not None
    now = datetime.utcnow()

    try:
        if is_edit:
            berita = Berita.query.get_or_404(int(berita_id))
            kode_berita = getattr(berita, "kode_berita", None) or _fft_news_guard_next_code()
            old_status = str(getattr(berita, "publish_status", "") or "").lower()
            old_is_published = bool(getattr(berita, "is_published", False))
            old_needs_publish = bool(getattr(berita, "needs_publish", False))
            old_published_at = getattr(berita, "published_at", None)
            old_tayang_pada = getattr(berita, "tayang_pada", None)
        else:
            berita = Berita()
            kode_berita = _fft_news_guard_next_code()
            old_status = "stock"
            old_is_published = False
            old_needs_publish = True
            old_published_at = None
            old_tayang_pada = None

        title = _fft_news_guard_text("judul", "title", "news_title")
        summary = _fft_news_guard_text("subjudul", "ringkasan", "summary", "excerpt")
        content = _fft_news_guard_text("isi", "konten", "content", "body")
        category = _fft_news_guard_text("group_type", "kategori", "category", default="UMUM").upper()

        if not title or not content:
            flash("Berita belum berhasil disimpan. Judul dan isi berita wajib diisi.", "danger")
            return redirect(url_for("admin_berita_edit", berita_id=berita_id) if is_edit else url_for("admin_berita_add"))

        thumbnail_file = _fft_news_guard_file(
            "thumbnail_file",
            "thumbnail",
            "gambar_thumbnail",
            "gambar_cover",
            "cover",
            "image",
        )

        detail_file = _fft_news_guard_file(
            "detail_file",
            "gambar_detail",
            "gambar",
            "gambar_utama",
            "main_image",
        )

        thumbnail_path = getattr(berita, "thumbnail", None) if is_edit else None
        detail_path = getattr(berita, "gambar_detail", None) if is_edit else None

        saved_thumbnail = _fft_news_guard_save_file(thumbnail_file, kode_berita, "thumbnail")
        saved_detail = _fft_news_guard_save_file(detail_file, kode_berita, "detail")

        if saved_thumbnail:
            thumbnail_path = saved_thumbnail

        if saved_detail:
            detail_path = saved_detail

        if thumbnail_path and not detail_path:
            detail_path = thumbnail_path

        if detail_path and not thumbnail_path:
            thumbnail_path = detail_path

        if not thumbnail_path:
            thumbnail_path = _fft_news_guard_make_placeholder(kode_berita, "thumbnail")

        if not detail_path:
            detail_path = _fft_news_guard_make_placeholder(kode_berita, "detail")

        berita.kode_berita = kode_berita
        berita.judul = title
        berita.slug = _fft_news_guard_unique_slug(title, getattr(berita, "id", None))
        berita.subjudul = summary
        berita.isi = content
        berita.group_type = category
        berita.thumbnail = thumbnail_path
        berita.gambar_detail = detail_path
        berita.updated_at = now

        if not is_edit:
            berita.created_at = now
            berita.is_published = False
            berita.needs_publish = True
            berita.publish_status = "stock"
            berita.published_at = None
            berita.tayang_pada = None
            berita.scheduled_at = None
            berita.click_count = 0
            berita.is_new = False
            db.session.add(berita)
        else:
            # KUNCI UTAMA:
            # Edit tidak boleh mengubah status tayang/stok.
            # Jadi status lama dipertahankan.
            if old_status:
                berita.publish_status = old_status
            else:
                berita.publish_status = "published" if old_is_published else "stock"

            berita.is_published = old_is_published
            berita.needs_publish = old_needs_publish
            berita.published_at = old_published_at
            berita.tayang_pada = old_tayang_pada

        db.session.commit()

        if _fft_news_guard_is_live(berita):
            _fft_news_guard_publish_snapshot()

        if is_edit:
            flash("Perubahan berita berhasil disimpan. Status penayangan tetap dipertahankan.", "success")
            return redirect(url_for("admin_berita_list", notice="updated"))

        flash("Berita baru berhasil disimpan sebagai stok. Berita dapat ditayangkan dari halaman Kelola Berita.", "success")
        return redirect(url_for("admin_berita_list", notice="created"))

    except Exception as error:
        db.session.rollback()
        print("\n[NEWS_GUARD_SAVE_ERROR]")
        print(repr(error))
        traceback.print_exc()
        print("[END_NEWS_GUARD_SAVE_ERROR]\n")

        flash("Berita belum berhasil disimpan karena terjadi kesalahan teknis. Periksa terminal untuk detail error.", "danger")
        return redirect(url_for("admin_berita_edit", berita_id=berita_id) if is_edit else url_for("admin_berita_add"))


def _fft_news_guard_add():
    if not _fft_news_guard_logged_in():
        return redirect(url_for("admin_login"))

    if request.method == "POST":
        return _fft_news_guard_save()

    return render_template(
        "admin_berita_form.html",
        berita=None,
        is_edit=False,
        form_publish_mode="stock",
        berita_thumb_crop_width=globals().get("BERITA_THUMB_CROP_WIDTH", 1450),
        berita_thumb_crop_height=globals().get("BERITA_THUMB_CROP_HEIGHT", 1000),
        berita_detail_crop_width=globals().get("BERITA_DETAIL_CROP_WIDTH", 1600),
        berita_detail_crop_height=globals().get("BERITA_DETAIL_CROP_HEIGHT", 900),
    )


def _fft_news_guard_edit(berita_id):
    if not _fft_news_guard_logged_in():
        return redirect(url_for("admin_login"))

    if request.method == "POST":
        return _fft_news_guard_save(int(berita_id))

    berita = Berita.query.get_or_404(int(berita_id))

    return render_template(
        "admin_berita_form.html",
        berita=berita,
        is_edit=True,
        form_publish_mode="published" if _fft_news_guard_is_live(berita) else "stock",
        berita_thumb_crop_width=globals().get("BERITA_THUMB_CROP_WIDTH", 1450),
        berita_thumb_crop_height=globals().get("BERITA_THUMB_CROP_HEIGHT", 1000),
        berita_detail_crop_width=globals().get("BERITA_DETAIL_CROP_WIDTH", 1600),
        berita_detail_crop_height=globals().get("BERITA_DETAIL_CROP_HEIGHT", 900),
    )


def _fft_news_guard_save_route():
    if not _fft_news_guard_logged_in():
        return redirect(url_for("admin_login"))

    if request.method == "GET":
        return redirect(url_for("admin_berita_list"))

    berita_id = request.form.get("berita_id") or request.form.get("id")
    if berita_id and str(berita_id).isdigit():
        return _fft_news_guard_save(int(berita_id))

    return _fft_news_guard_save()


def _fft_news_guard_delete(berita_id):
    if not _fft_news_guard_logged_in():
        return redirect(url_for("admin_login"))

    berita = Berita.query.get_or_404(int(berita_id))
    kode_berita = getattr(berita, "kode_berita", None)
    was_live = _fft_news_guard_is_live(berita)

    try:
        _fft_news_guard_delete_folder(kode_berita)
        db.session.delete(berita)
        db.session.commit()

        if was_live:
            _fft_news_guard_publish_snapshot()

        flash("Berita berhasil dihapus dari database dan folder upload.", "success")
        return redirect(url_for("admin_berita_list", notice="deleted"))

    except Exception as error:
        db.session.rollback()
        print("\n[NEWS_GUARD_DELETE_ERROR]")
        print(repr(error))
        traceback.print_exc()
        print("[END_NEWS_GUARD_DELETE_ERROR]\n")

        flash("Berita belum berhasil dihapus. Periksa terminal untuk detail error.", "danger")
        return redirect(url_for("admin_berita_list", notice="delete_failed"))


# Nonaktifkan interceptor lama yang pernah memotong POST berita sebelum masuk route.
try:
    for _key, _funcs in list(app.before_request_funcs.items()):
        app.before_request_funcs[_key] = [
            _func for _func in _funcs
            if getattr(_func, "__name__", "") not in {"news_crop_save_intercept"}
        ]
except Exception:
    pass


app.view_functions["admin_berita_add"] = _fft_news_guard_add
app.view_functions["admin_berita_edit"] = _fft_news_guard_edit
app.view_functions["admin_berita_save"] = _fft_news_guard_save_route
app.view_functions["admin_berita_delete"] = _fft_news_guard_delete

# === FFT NEWS EDIT DELETE GUARD END ===


if __name__ == "__main__":
    app.run(debug=True)
