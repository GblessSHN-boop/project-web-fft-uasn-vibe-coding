from datetime import datetime
from backend.extensions import db


class TimestampMixin:
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


class PublishMixin:
    is_published = db.Column(db.Boolean, default=False, nullable=False)
    published_at = db.Column(db.DateTime, nullable=True)


class News(db.Model, TimestampMixin, PublishMixin):
    __tablename__ = "news"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(180), nullable=False)
    slug = db.Column(db.String(220), unique=True, nullable=False, index=True)
    excerpt = db.Column(db.String(300), nullable=True)
    content = db.Column(db.Text, nullable=False)
    cover_image = db.Column(db.String(255), nullable=True)
    category = db.Column(db.String(80), nullable=True)
    author_name = db.Column(db.String(120), nullable=True)
    view_count = db.Column(db.Integer, default=0, nullable=False)
    sort_order = db.Column(db.Integer, default=0, nullable=False)

    def to_public_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "excerpt": self.excerpt,
            "content": self.content,
            "cover_image": self.cover_image,
            "category": self.category,
            "author_name": self.author_name,
            "view_count": self.view_count,
            "is_published": self.is_published,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Banner(db.Model, TimestampMixin, PublishMixin):
    __tablename__ = "banners"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(180), nullable=False)
    subtitle = db.Column(db.String(255), nullable=True)
    image_path = db.Column(db.String(255), nullable=False)
    button_text = db.Column(db.String(80), nullable=True)
    button_url = db.Column(db.String(255), nullable=True)
    placement = db.Column(db.String(80), default="homepage", nullable=False)
    sort_order = db.Column(db.Integer, default=0, nullable=False)

    def to_public_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "subtitle": self.subtitle,
            "image_path": self.image_path,
            "button_text": self.button_text,
            "button_url": self.button_url,
            "placement": self.placement,
            "sort_order": self.sort_order,
            "is_published": self.is_published,
        }


class Lecturer(db.Model, TimestampMixin):
    __tablename__ = "lecturers"

    id = db.Column(db.Integer, primary_key=True)
    nama_dosen = db.Column(db.String(160), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False, index=True)
    jabatan = db.Column(db.String(120), nullable=True)
    bidang_dosen = db.Column(db.String(180), nullable=True)
    pendidikan = db.Column(db.String(180), nullable=True)
    status = db.Column(db.String(80), nullable=True)
    foto = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    email = db.Column(db.String(160), nullable=True)
    sort_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    def to_public_dict(self):
        return {
            "id": self.id,
            "nama_dosen": self.nama_dosen,
            "slug": self.slug,
            "jabatan": self.jabatan,
            "bidang_dosen": self.bidang_dosen,
            "pendidikan": self.pendidikan,
            "status": self.status,
            "foto": self.foto,
            "bio": self.bio,
            "email": self.email,
            "is_active": self.is_active,
        }


class Dean(db.Model, TimestampMixin):
    __tablename__ = "deans"

    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.String(160), nullable=False)
    jabatan = db.Column(db.String(120), default="Dekan", nullable=False)
    periode = db.Column(db.String(80), nullable=True)
    foto = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    email = db.Column(db.String(160), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    def to_public_dict(self):
        return {
            "id": self.id,
            "nama": self.nama,
            "jabatan": self.jabatan,
            "periode": self.periode,
            "foto": self.foto,
            "bio": self.bio,
            "email": self.email,
            "is_active": self.is_active,
        }


class MediaFile(db.Model, TimestampMixin):
    __tablename__ = "media_files"

    id = db.Column(db.Integer, primary_key=True)
    original_name = db.Column(db.String(255), nullable=False)
    stored_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    mime_type = db.Column(db.String(120), nullable=True)
    file_size = db.Column(db.Integer, nullable=True)
    module_name = db.Column(db.String(80), nullable=True)
    alt_text = db.Column(db.String(255), nullable=True)


class SiteSetting(db.Model, TimestampMixin):
    __tablename__ = "site_settings"

    id = db.Column(db.Integer, primary_key=True)
    setting_key = db.Column(db.String(120), unique=True, nullable=False, index=True)
    setting_value = db.Column(db.Text, nullable=True)
    setting_group = db.Column(db.String(80), default="general", nullable=False)


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    actor = db.Column(db.String(160), nullable=True)
    action = db.Column(db.String(120), nullable=False)
    module_name = db.Column(db.String(80), nullable=True)
    target_id = db.Column(db.String(80), nullable=True)
    description = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(80), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
