from werkzeug.security import generate_password_hash, check_password_hash


def hash_password(password: str) -> str:
    if not password:
        raise ValueError("Password tidak boleh kosong.")
    return generate_password_hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    if not password or not password_hash:
        return False
    return check_password_hash(password_hash, password)
