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
import os
import shutil
import uuid
import re
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

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

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


def is_logged_in():
    return session.get("is_logged_in", False)


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


def init_default_data():
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
    if not is_logged_in():
        return redirect(url_for("admin_login"))
    return render_template("admin_berita_choose.html")


@app.route("/admin/banner-informasi")
def admin_banner_informasi():
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    banner = get_or_create_banner_single()
    return render_template(
        "admin_banner_informasi.html",
        banner=banner,
        banner_crop_width=BANNER_CROP_WIDTH,
        banner_crop_height=BANNER_CROP_HEIGHT,
        banner_max_file_size_mb=BANNER_MAX_FILE_SIZE_MB,
    )


@app.route("/admin/banner-informasi/save", methods=["POST"])
def admin_banner_informasi_save():
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    banner = get_or_create_banner_single()

    media_type = request.form.get("media_type", "image").strip().lower()
    target_url = request.form.get("target_url", "").strip()
    media_crop_data = request.form.get("media_crop_data", "").strip()
    media_file = request.files.get("media_file")

    if media_type not in {"image", "video"}:
        flash("Tipe media banner tidak valid.", "danger")
        return redirect(url_for("admin_banner_informasi"))

    if (
        banner.media_type
        and banner.media_type != media_type
        and (not media_file or not media_file.filename)
    ):
        flash("Saat mengganti tipe media, upload file baru yang sesuai.", "danger")
        return redirect(url_for("admin_banner_informasi"))

    url_ok, url_message = validate_target_url(target_url)
    if not url_ok:
        flash(url_message, "danger")
        return redirect(url_for("admin_banner_informasi"))

    save_ok, saved_media_path, save_message = save_banner_media_file(
        media_file,
        media_type,
        media_crop_data,
    )
    if not save_ok:
        flash(save_message, "danger")
        return redirect(url_for("admin_banner_informasi"))

    if not saved_media_path and not banner.media_file:
        flash("Media banner wajib diupload.", "danger")
        return redirect(url_for("admin_banner_informasi"))

    old_media_path = banner.media_file

    banner.judul_internal = "Banner Utama"
    banner.media_type = media_type
    banner.target_url = target_url
    banner.poster_file = None
    banner.sort_order = 1
    banner.updated_at = datetime.utcnow()
    banner.needs_publish = True

    if saved_media_path:
        banner.media_file = saved_media_path

    db.session.commit()

    if saved_media_path and old_media_path and old_media_path != saved_media_path:
        delete_banner_file(old_media_path)

    flash(
        "Draft banner berhasil disimpan. Lanjutkan dengan Publish / Update Frontend.",
        "success",
    )
    return redirect(url_for("admin_banner_informasi"))


@app.route("/admin/banner-informasi/publish", methods=["POST"])
def admin_banner_informasi_publish():
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    banner = get_or_create_banner_single()

    if not banner.media_file:
        flash("Upload media banner terlebih dahulu sebelum publish.", "danger")
        return redirect(url_for("admin_banner_informasi"))

    url_ok, url_message = validate_target_url(banner.target_url or "")
    if not url_ok:
        flash(url_message, "danger")
        return redirect(url_for("admin_banner_informasi"))

    banner.is_published = True
    banner.is_active = True
    banner.needs_publish = False
    banner.published_at = datetime.utcnow()

    db.session.commit()
    publish_banner_snapshot(banner)

    flash("Banner berhasil dipublish ke frontend.", "success")
    return redirect(url_for("admin_banner_informasi"))


@app.route("/api/banner-informasi")
def api_banner_informasi():
    snapshot_path = get_published_banner_json_path()

    if not os.path.exists(snapshot_path):
        return jsonify({"published": False, "data": None}), 200

    with open(snapshot_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    return jsonify(payload), 200


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


@app.route("/admin/berita/list")
def admin_berita_list():
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    now = sync_berita_runtime_states()

    berita_list = Berita.query.order_by(
        cast(Berita.kode_berita, Integer).desc(),
        Berita.created_at.desc(),
        Berita.id.desc(),
    ).all()

    def fmt(value):
        return value.strftime("%d/%m/%Y %H:%M") if value else "-"

    editor_cards = []

    for b in berita_list:
        is_new_active = bool(b.is_new and (not b.new_until or b.new_until >= now))

        if not b.is_published:
            status_key = "draft"
            status_label = "Draft"
            status_note = "Belum disiapkan ke frontend."
        elif b.needs_publish:
            status_key = "queue"
            status_label = "Belum Dirilis"
            status_note = "Perlu Publish / Update Frontend."
        elif b.tayang_pada and b.tayang_pada > now:
            status_key = "schedule"
            status_label = "Terjadwal"
            status_note = "Sudah masuk snapshot, menunggu waktu tayang."
        else:
            status_key = "live"
            status_label = "Sudah Rilis"
            status_note = "Sudah tampil di frontend."

        editor_cards.append(
            {
                "id": b.id,
                "kode_berita": b.kode_berita or "-",
                "judul": b.judul or "",
                "subjudul": b.subjudul or "",
                "thumbnail": b.thumbnail,
                "gambar_detail": b.gambar_detail,
                "click_count": b.click_count or 0,
                "created_at_text": fmt(b.created_at),
                "updated_at_text": fmt(b.updated_at),
                "published_at_text": fmt(b.published_at),
                "tayang_pada_text": fmt(b.tayang_pada),
                "created_sort": b.created_at or datetime.min,
                "published_sort": b.published_at or datetime.min,
                "status_key": status_key,
                "status_label": status_label,
                "status_note": status_note,
                "title_tag": "NEW TITLE" if is_new_active else "",
                "is_new_active": is_new_active,
            }
        )

    live_cards = [item for item in editor_cards if item["status_key"] == "live"]

    preview_trending = sorted(
        live_cards,
        key=lambda item: (
            item["click_count"],
            item["published_sort"],
            item["created_sort"],
        ),
        reverse=True,
    )[:2]

    preview_trending_ids = {item["id"] for item in preview_trending}
    preview_grid = [
        item for item in live_cards if item["id"] not in preview_trending_ids
    ]

    stats = {
        "total": len(editor_cards),
        "draft": len([item for item in editor_cards if item["status_key"] == "draft"]),
        "queue": len([item for item in editor_cards if item["status_key"] == "queue"]),
        "schedule": len(
            [item for item in editor_cards if item["status_key"] == "schedule"]
        ),
        "live": len([item for item in editor_cards if item["status_key"] == "live"]),
    }

    return render_template(
        "admin_berita_list.html",
        editor_cards=editor_cards,
        preview_trending=preview_trending,
        preview_grid=preview_grid,
        stats=stats,
    )


@app.route("/admin/berita/add")
def admin_berita_add():
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    return render_template(
        "admin_berita_form.html",
        berita=None,
        form_publish_mode="now",
        berita_thumb_crop_width=BERITA_THUMB_CROP_WIDTH,
        berita_thumb_crop_height=BERITA_THUMB_CROP_HEIGHT,
        berita_detail_crop_width=BERITA_DETAIL_CROP_WIDTH,
        berita_detail_crop_height=BERITA_DETAIL_CROP_HEIGHT,
    )


@app.route("/admin/berita/edit/<int:berita_id>")
def admin_berita_edit(berita_id):
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    berita = Berita.query.get_or_404(berita_id)

    form_publish_mode = "now"
    if (
        berita.is_published
        and berita.tayang_pada
        and (berita.published_at is None or berita.tayang_pada > datetime.utcnow())
    ):
        form_publish_mode = "schedule"

    return render_template(
        "admin_berita_form.html",
        berita=berita,
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
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    if request.method == "GET":
        return redirect(url_for("admin_berita_list"))

    berita_id = request.form.get("berita_id")
    judul = request.form.get("judul", "").strip()
    subjudul = request.form.get("subjudul", "").strip()
    isi = request.form.get("isi", "").strip()

    thumbnail_crop_data = request.form.get("thumbnail_crop_data", "").strip()
    detail_crop_data = request.form.get("detail_crop_data", "").strip()

    thumbnail_file = request.files.get("thumbnail")
    gambar_detail_file = request.files.get("gambar_detail")

    redirect_target = (
        url_for("admin_berita_edit", berita_id=int(berita_id))
        if berita_id
        else url_for("admin_berita_add")
    )

    if not judul or not isi:
        flash("Judul dan isi berita wajib diisi.", "danger")
        return redirect(redirect_target)

    if thumbnail_file and thumbnail_file.filename and not thumbnail_crop_data:
        flash("Thumbnail frontend wajib dicrop terlebih dahulu.", "danger")
        return redirect(redirect_target)

    if gambar_detail_file and gambar_detail_file.filename and not detail_crop_data:
        flash("Gambar halaman detail wajib dicrop terlebih dahulu.", "danger")
        return redirect(redirect_target)

    if berita_id:
        berita = Berita.query.get_or_404(int(berita_id))
        kode_berita = berita.kode_berita or generate_next_kode_berita()
        berita.kode_berita = kode_berita
        slug_baru = generate_berita_slug(judul, exclude_id=berita.id)
    else:
        berita = None
        kode_berita = generate_next_kode_berita()
        slug_baru = generate_berita_slug(judul)

        if not thumbnail_file or not thumbnail_file.filename:
            flash("Thumbnail frontend berita wajib diupload.", "danger")
            return redirect(redirect_target)

        if not gambar_detail_file or not gambar_detail_file.filename:
            flash("Gambar halaman detail berita wajib diupload.", "danger")
            return redirect(redirect_target)

    thumbnail_path = (
        save_berita_thumbnail(thumbnail_file, kode_berita, thumbnail_crop_data)
        if (thumbnail_file and thumbnail_file.filename) or thumbnail_crop_data
        else None
    )

    gambar_detail_path = (
        save_berita_detail(gambar_detail_file, kode_berita, detail_crop_data)
        if (gambar_detail_file and gambar_detail_file.filename) or detail_crop_data
        else None
    )

    if thumbnail_path is False or gambar_detail_path is False:
        flash(
            "Format file tidak didukung atau crop gagal diproses. Gunakan PNG, JPG, JPEG, atau WEBP.",
            "danger",
        )
        return redirect(redirect_target)

    now = datetime.utcnow()


@app.route("/admin/berita/publish", methods=["POST"])
def admin_berita_publish():
    if not is_logged_in():
        return redirect(url_for("admin_login"))

    now = datetime.utcnow()

    ready_items = Berita.query.filter(Berita.is_published.is_(True)).all()

    live_count = 0
    schedule_count = 0

    for berita in ready_items:
        berita.needs_publish = False

        if berita.tayang_pada and berita.tayang_pada > now:
            schedule_count += 1
            continue

        if berita.published_at is None:
            berita.published_at = now

        live_count += 1

    db.session.commit()
    publish_berita_snapshot()

    flash(
        f"{live_count} berita live berhasil diupdate ke frontend. {schedule_count} berita tetap menunggu jadwal tayang.",
        "success",
    )
    return redirect(url_for("admin_berita_list"))


@app.route("/api/berita")
def api_berita():
    return jsonify(build_berita_payload()), 200


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

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
