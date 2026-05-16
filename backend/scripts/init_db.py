from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app import app
from backend.extensions import db
from backend.models import AuditLog, Banner, Dean, Lecturer, MediaFile, News, SiteSetting


def main():
    with app.app_context():
        db.create_all()
        print("Database tables berhasil dibuat atau sudah tersedia.")


if __name__ == "__main__":
    main()
