"""Who is making this request.

Logins are Firebase Authentication accounts. The browser signs in with the
Firebase SDK and sends its Firebase ID token as `Authorization: Bearer ...`;
we verify that token against Google's published signing certificates (no
service account needed) and map its uid to our `users` row, creating it on
first sight.
"""
import secrets
import threading
import time
from functools import wraps

import jwt
import requests
from cryptography.x509 import load_pem_x509_certificate
from flask import current_app, request
from sqlalchemy.exc import IntegrityError

from .errors import ApiError
from .extensions import db
from .models import Student, Teacher, User

GOOGLE_CERTS_URL = (
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
)

_certs = {"keys": {}, "expires": 0}
_certs_lock = threading.Lock()


def _google_certs():
    """{key id: public key} for Firebase ID tokens, cached as long as Google
    says (Cache-Control max-age)."""
    with _certs_lock:
        if time.time() >= _certs["expires"]:
            resp = requests.get(GOOGLE_CERTS_URL, timeout=10)
            resp.raise_for_status()
            max_age = 3600
            for part in resp.headers.get("Cache-Control", "").split(","):
                if part.strip().startswith("max-age="):
                    max_age = int(part.strip()[8:])
            _certs["keys"] = {
                kid: load_pem_x509_certificate(pem.encode()).public_key()
                for kid, pem in resp.json().items()
            }
            _certs["expires"] = time.time() + max_age
        return _certs["keys"]


def verify_firebase_token(token):
    """The claims of a valid Firebase ID token for our project, else None."""
    project = current_app.config["FIREBASE_PROJECT_ID"]
    try:
        kid = jwt.get_unverified_header(token).get("kid")
        key = _google_certs().get(kid)
        if not key:
            return None
        claims = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=project,
            issuer=f"https://securetoken.google.com/{project}",
            leeway=30,
        )
    except (jwt.PyJWTError, ValueError):
        return None
    return claims if claims.get("sub") else None


# ── Current user ──────────────────────────────────────────────────────────

_USER_KEY = "happyresearch.user"


def current_user():
    """The User behind this request's Firebase token, or None (cached per request)."""
    if _USER_KEY not in request.environ:
        request.environ[_USER_KEY] = _user_from_token()
    return request.environ[_USER_KEY]


def _user_from_token():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    claims = verify_firebase_token(header[7:])
    if not claims:
        return None
    email = (claims.get("email") or "").strip().lower()
    user = db.session.get(User, claims["sub"])
    if email:
        # Firebase emails are unique, so another row with this email is a
        # stale placeholder (e.g. created by the one-time data import).
        stale = User.query.filter(User.email == email, User.id != claims["sub"]).first()
        if stale:
            db.session.delete(stale)
            db.session.flush()
    if not user:
        if not email:
            return None
        user = User(id=claims["sub"], email=email)
        db.session.add(user)
    # Keep in step with Firebase (the email can be changed there).
    if email and user.email != email:
        user.email = email
    is_admin = user.email in current_app.config["ADMIN_EMAILS"]
    if user.isAdmin != is_admin:
        user.isAdmin = is_admin
    if db.session.dirty or db.session.new or db.session.deleted:
        try:
            db.session.commit()
        except IntegrityError:
            # A parallel first request for this account created it already.
            db.session.rollback()
            user = db.session.get(User, claims["sub"])
    return user


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not current_user():
            raise ApiError(401, "UNAUTHENTICATED", "Please log in.")
        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = current_user()
        if not user:
            raise ApiError(401, "UNAUTHENTICATED", "Please log in.")
        if not user.isAdmin:
            raise ApiError(403, "FORBIDDEN", "Admins only.")
        return fn(*args, **kwargs)

    return wrapper


def current_teacher():
    """The logged-in mentor's Teacher row (raises if not a mentor)."""
    user = current_user()
    if not user:
        raise ApiError(401, "UNAUTHENTICATED", "Please log in.")
    teacher = db.session.get(Teacher, user.id)
    if not teacher:
        raise ApiError(403, "NOT_A_MENTOR", "This account is not a mentor account.")
    if not is_verified(teacher):
        raise ApiError(403, "EMAIL_NOT_VERIFIED", "Please verify your email first.")
    return teacher


def current_student():
    """The logged-in, verified student's Student row (raises otherwise)."""
    user = current_user()
    if not user:
        raise ApiError(401, "UNAUTHENTICATED", "Please log in.")
    student = db.session.get(Student, user.id)
    if not student:
        raise ApiError(403, "NOT_A_STUDENT", "This account is not a student account.")
    if not is_verified(student):
        raise ApiError(403, "EMAIL_NOT_VERIFIED", "Please verify your email first.")
    return student


def is_verified(account):
    # Accounts created before email verification existed have no value at
    # all - treat that as verified so nobody gets locked out.
    return account.accountEmailVerified is not False


def random_token():
    return secrets.token_hex(24)
