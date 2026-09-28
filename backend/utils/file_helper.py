import os
from pathlib import Path
from urllib.parse import urlparse
from uuid import uuid4

from werkzeug.utils import secure_filename


def get_file_extension(filename: str) -> str:
    if not filename or "." not in filename:
        return ""

    return filename.rsplit(".", 1)[1].lower()


def is_allowed_file(
    filename: str,
    allowed_extensions: set[str],
) -> bool:
    extension = get_file_extension(
        filename
    )

    return extension in allowed_extensions


def build_safe_filename(
    original_filename: str,
    prefix: str = "file",
) -> str:
    extension = get_file_extension(
        original_filename
    )

    safe_prefix = (
        secure_filename(prefix)
        or "file"
    )

    unique_name = uuid4().hex

    if extension:
        return (
            f"{safe_prefix}-"
            f"{unique_name}."
            f"{extension}"
        )

    return (
        f"{safe_prefix}-"
        f"{unique_name}"
    )


def ensure_directory(
    path: str | Path,
) -> Path:
    directory = Path(path)

    directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    return directory


class FilePathHelper:
    def __init__(
        self,
        *,
        base_dir,
        upload_folder,
        dekan_upload_folder,
        berita_upload_folder,
        banner_upload_folder,
        published_folder,
        allowed_extensions,
    ):
        self.base_dir = str(
            base_dir
        )
        self.upload_folder = str(
            upload_folder
        )
        self.dekan_upload_folder = str(
            dekan_upload_folder
        )
        self.berita_upload_folder = str(
            berita_upload_folder
        )
        self.banner_upload_folder = str(
            banner_upload_folder
        )
        self.published_folder = str(
            published_folder
        )

        self.allowed_extensions = set(
            allowed_extensions
        )

    def allowed_file(
        self,
        filename,
    ):
        return is_allowed_file(
            filename,
            self.allowed_extensions,
        )

    def ensure_berita_upload_folder(
        self,
    ):
        ensure_directory(
            self.berita_upload_folder
        )

    def get_berita_folder(
        self,
        kode_berita,
    ):
        return os.path.join(
            self.berita_upload_folder,
            str(kode_berita),
        )

    def ensure_banner_upload_folder(
        self,
    ):
        ensure_directory(
            self.banner_upload_folder
        )

    def get_banner_single_folder(
        self,
    ):
        folder_path = os.path.join(
            self.banner_upload_folder,
            "single",
        )

        ensure_directory(
            folder_path
        )

        return folder_path

    @staticmethod
    def get_uploaded_file_size(
        file_storage,
    ):
        if (
            not file_storage
            or not hasattr(
                file_storage,
                "stream",
            )
        ):
            return 0

        current_position = (
            file_storage.stream.tell()
        )

        file_storage.stream.seek(
            0,
            os.SEEK_END,
        )

        size = (
            file_storage.stream.tell()
        )

        file_storage.stream.seek(
            current_position
        )

        return size

    @staticmethod
    def validate_target_url(
        target_url,
    ):
        if not target_url:
            return (
                False,
                "Target URL wajib diisi.",
            )

        parsed = urlparse(
            target_url
        )

        if (
            parsed.scheme
            not in {
                "http",
                "https",
            }
            or not parsed.netloc
        ):
            return (
                False,
                (
                    "Target URL harus memakai "
                    "http:// atau https://"
                ),
            )

        return True, ""

    def ensure_upload_root(
        self,
    ):
        ensure_directory(
            self.upload_folder
        )

    def ensure_dekan_upload_folder(
        self,
    ):
        ensure_directory(
            self.dekan_upload_folder
        )

    def ensure_published_folder(
        self,
    ):
        ensure_directory(
            self.published_folder
        )

    def get_published_dekan_json_path(
        self,
    ):
        self.ensure_published_folder()

        return os.path.join(
            self.published_folder,
            "dekan.json",
        )

    def get_published_berita_json_path(
        self,
    ):
        self.ensure_published_folder()

        return os.path.join(
            self.published_folder,
            "berita.json",
        )

    def get_published_banner_json_path(
        self,
    ):
        self.ensure_published_folder()

        return os.path.join(
            self.published_folder,
            "banner_informasi.json",
        )

    def get_published_dosen_json_path(
        self,
    ):
        self.ensure_published_folder()

        return os.path.join(
            self.published_folder,
            "dosen.json",
        )

    def get_dosen_folder(
        self,
        kode_dosen,
    ):
        return os.path.join(
            self.upload_folder,
            str(kode_dosen),
        )

    def get_absolute_upload_path(
        self,
        relative_path,
    ):
        if not relative_path:
            return None

        return os.path.join(
            self.upload_folder,
            relative_path,
        )

    def get_biodata_card_path(
        self,
        kode_dosen,
    ):
        return os.path.join(
            self.get_dosen_folder(
                kode_dosen
            ),
            "biodata_card.png",
        )

    def get_dekan_photo_absolute_path(
        self,
        relative_path,
    ):
        if not relative_path:
            return None

        return os.path.join(
            self.base_dir,
            "static",
            relative_path,
        )

    def get_dekan_biodata_card_absolute_path(
        self,
    ):
        self.ensure_dekan_upload_folder()

        return os.path.join(
            self.dekan_upload_folder,
            "biodata_dekan.png",
        )
