from flask import request
from werkzeug.security import (
    check_password_hash,
    generate_password_hash,
)


def hash_password(password: str) -> str:
    if not password:
        raise ValueError(
            "Password tidak boleh kosong."
        )

    return generate_password_hash(password)


def verify_password(
    password: str,
    password_hash: str,
) -> bool:
    if not password or not password_hash:
        return False

    return check_password_hash(
        password_hash,
        password,
    )


def get_client_ip() -> str:
    forwarded_for = request.headers.get(
        "X-Forwarded-For",
        "",
    )

    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    return request.remote_addr or "unknown"


def add_security_headers(response):
    response.headers[
        "X-Content-Type-Options"
    ] = "nosniff"

    response.headers[
        "X-Frame-Options"
    ] = "SAMEORIGIN"

    response.headers[
        "Referrer-Policy"
    ] = "strict-origin-when-cross-origin"

    response.headers[
        "Permissions-Policy"
    ] = (
        "camera=(), microphone=(), geolocation=()"
    )

    return response
