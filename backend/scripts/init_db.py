from pathlib import Path
import sys
from urllib.parse import urlsplit, urlunsplit

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app import app, db, init_default_data


def mask_database_uri(uri: str) -> str:
    if not uri:
        return ""

    try:
        parts = urlsplit(uri)
        netloc = parts.netloc

        if "@" in netloc:
            userinfo, hostinfo = netloc.rsplit("@", 1)
            if ":" in userinfo:
                username, _password = userinfo.split(":", 1)
                netloc = f"{username}:***@{hostinfo}"
            else:
                netloc = f"{userinfo}:***@{hostinfo}"

        return urlunsplit((parts.scheme, netloc, parts.path, parts.query, parts.fragment))
    except Exception:
        return "***"


def main():
    database_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")

    print("Menggunakan database:")
    print(mask_database_uri(database_uri))

    with app.app_context():
        init_default_data()
        print("Database aktif app.py berhasil diinisialisasi.")


if __name__ == "__main__":
    main()
