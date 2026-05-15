from flask import redirect, session, url_for

from backend.services.admin_auth_service import AdminAuthService


def require_admin_session():
    """
    Helper controller untuk memastikan admin sudah login.
    Belum disambungkan ke app.py agar sistem lama tidak rusak.
    """

    if not AdminAuthService.is_admin_session_active(session):
        return redirect(url_for("admin_login"))

    return None


def logout_admin():
    """
    Helper controller untuk logout admin secara terpusat.
    """

    AdminAuthService.clear_admin_session(session)
    return redirect(url_for("admin_login"))
