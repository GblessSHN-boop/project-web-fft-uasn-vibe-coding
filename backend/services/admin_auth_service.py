import hmac
from dataclasses import dataclass
from time import time
from typing import Any

try:
    from ..utils.security_helper import verify_password
except ImportError:
    from utils.security_helper import verify_password


@dataclass
class AuthResult:
    success: bool
    message: str
    admin: Any = None


class AdminAuthService:
    """
    Logic autentikasi admin yang tidak bergantung
    langsung pada route Flask.
    """

    def __init__(
        self,
        admin_password: str = "",
        admin_password_hash: str = "",
        max_login_attempts: int = 5,
        lockout_seconds: int = 15 * 60,
    ):
        self.admin_password = admin_password or ""
        self.admin_password_hash = (
            admin_password_hash or ""
        )
        self.max_login_attempts = int(
            max_login_attempts
        )
        self.lockout_seconds = int(
            lockout_seconds
        )

        self.login_attempts = {}

    def clear_old_login_attempts(self) -> None:
        now = time()

        expired = [
            ip
            for ip, data
            in self.login_attempts.items()
            if (
                now
                - data.get(
                    "last_attempt",
                    0,
                )
                > self.lockout_seconds
            )
        ]

        for ip in expired:
            self.login_attempts.pop(
                ip,
                None,
            )

    def is_ip_locked(
        self,
        ip: str,
    ) -> tuple[bool, int]:
        self.clear_old_login_attempts()

        info = self.login_attempts.get(ip)

        if not info:
            return False, 0

        if (
            info.get("count", 0)
            < self.max_login_attempts
        ):
            return False, 0

        remaining = int(
            self.lockout_seconds
            - (
                time()
                - info.get(
                    "last_attempt",
                    0,
                )
            )
        )

        if remaining <= 0:
            self.login_attempts.pop(
                ip,
                None,
            )
            return False, 0

        return True, remaining

    def register_failed_login(
        self,
        ip: str,
    ) -> None:
        data = self.login_attempts.get(
            ip,
            {
                "count": 0,
                "last_attempt": 0,
            },
        )

        data["count"] += 1
        data["last_attempt"] = time()

        self.login_attempts[ip] = data

    def clear_failed_login(
        self,
        ip: str,
    ) -> None:
        self.login_attempts.pop(
            ip,
            None,
        )

    def verify_admin_password(
        self,
        plain_password: str,
    ) -> bool:
        if self.admin_password_hash:
            return verify_password(
                plain_password,
                self.admin_password_hash,
            )

        if self.admin_password:
            return hmac.compare_digest(
                self.admin_password,
                plain_password,
            )

        return False

    @staticmethod
    def validate_login_input(
        email: str,
        password: str,
    ) -> AuthResult:
        if not email or not email.strip():
            return AuthResult(
                False,
                "Email admin wajib diisi.",
            )

        if not password:
            return AuthResult(
                False,
                "Password admin wajib diisi.",
            )

        return AuthResult(
            True,
            "Input login valid.",
        )

    @staticmethod
    def is_admin_session_active(
        session_data: dict,
        session_key: str = "is_logged_in",
    ) -> bool:
        return bool(
            session_data.get(session_key)
            or session_data.get("logged_in")
        )

    @staticmethod
    def clear_admin_session(
        session_data: dict,
    ) -> None:
        session_data.clear()
