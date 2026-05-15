from dataclasses import dataclass
from typing import Any


@dataclass
class AuthResult:
    success: bool
    message: str
    admin: Any = None


class AdminAuthService:
    """
    Service ini disiapkan untuk memusatkan logic autentikasi admin.

    Untuk saat ini file ini belum disambungkan ke app.py agar backend lama tetap aman.
    Tahap berikutnya service ini akan dipakai oleh route login admin secara bertahap.
    """

    @staticmethod
    def validate_login_input(email: str, password: str) -> AuthResult:
        if not email or not email.strip():
            return AuthResult(False, "Email admin wajib diisi.")

        if not password:
            return AuthResult(False, "Password admin wajib diisi.")

        return AuthResult(True, "Input login valid.")

    @staticmethod
    def is_admin_session_active(session_data: dict, session_key: str = "logged_in") -> bool:
        return bool(session_data.get(session_key))

    @staticmethod
    def clear_admin_session(session_data: dict) -> None:
        session_data.clear()
