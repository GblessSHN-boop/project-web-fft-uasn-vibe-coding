from pathlib import Path
from uuid import uuid4
from werkzeug.utils import secure_filename


def get_file_extension(filename: str) -> str:
    if not filename or "." not in filename:
        return ""
    return filename.rsplit(".", 1)[1].lower()


def is_allowed_file(filename: str, allowed_extensions: set[str]) -> bool:
    extension = get_file_extension(filename)
    return extension in allowed_extensions


def build_safe_filename(original_filename: str, prefix: str = "file") -> str:
    extension = get_file_extension(original_filename)
    safe_prefix = secure_filename(prefix) or "file"
    unique_name = uuid4().hex

    if extension:
        return f"{safe_prefix}-{unique_name}.{extension}"

    return f"{safe_prefix}-{unique_name}"


def ensure_directory(path: str | Path) -> Path:
    directory = Path(path)
    directory.mkdir(parents=True, exist_ok=True)
    return directory
