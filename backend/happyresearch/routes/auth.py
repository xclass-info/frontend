"""Accounts. Sign-up, login and password reset happen in Firebase
Authentication (in the browser); this side keeps the student/mentor record
for each Firebase account and handles our own branded email verification."""
from flask import Blueprint, current_app, jsonify

from .. import emails
from ..errors import ApiError
from ..extensions import db, limiter
from ..models import Student, Teacher
from ..security import current_user, login_required, random_token
from ..serializers import teacher_json
from . import body, text

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

PROFILE_MODELS = {"student": Student, "teacher": Teacher}


def me_json(user):
    student = db.session.get(Student, user.id)
    teacher = db.session.get(Teacher, user.id)
    return {
        "uid": user.id,
        "email": user.email,
        "isAdmin": user.isAdmin,
        "student": student.to_dict() if student else None,
        "teacher": teacher_json(teacher, "owner") if teacher else None,
    }


def _send_verification(kind, user, profile):
    token = random_token()
    profile.accountEmailToken = token
    profile.accountEmailVerified = False
    db.session.commit()
    emails.send_account_verification(
        user.email, profile.name, emails.account_verify_link(kind, user.id, token)
    )


@bp.get("/me")
@login_required
def me():
    return jsonify(me_json(current_user()))


@bp.post("/profile")
@limiter.limit("5 per minute")
@login_required
def create_profile():
    """Called right after creating the Firebase account: creates the student
    or mentor record and emails the verification link."""
    user = current_user()
    data = body()
    kind = data.get("kind")
    model = PROFILE_MODELS.get(kind)
    if not model:
        raise ApiError(400, "INVALID_KIND", "kind must be student or teacher.")
    if db.session.get(model, user.id):
        raise ApiError(409, "PROFILE_EXISTS", "This account already has that profile.")
    name = text(data, "name", required=True, max_len=200)
    if kind == "student":
        profile = Student(
            id=user.id,
            name=name,
            email=user.email,
            grade=text(data, "grade", max_len=50),
            phone=text(data, "phone", max_len=50),
        )
    else:
        profile = Teacher(id=user.id, name=name, email=user.email, verificationStatus="incomplete")
    db.session.add(profile)
    db.session.commit()

    # The record exists either way; the page tells them to use "Resend
    # Verification Email" if this didn't go out.
    try:
        _send_verification(kind, user, profile)
        email_sent = True
    except Exception:
        current_app.logger.exception("verification email failed")
        email_sent = False
    return jsonify({"emailSent": email_sent}), 201


@bp.post("/resend-verification")
@limiter.limit("5 per minute")
@login_required
def resend_verification():
    user = current_user()
    kind = body().get("kind")
    model = PROFILE_MODELS.get(kind)
    profile = model and db.session.get(model, user.id)
    if not profile:
        raise ApiError(404, "NOT_FOUND", "No account of that type for this email.")
    _send_verification(kind, user, profile)
    return jsonify({"ok": True})


@bp.post("/verify-email")
@limiter.limit("20 per minute")
def verify_email():
    data = body()
    model = PROFILE_MODELS.get(data.get("kind"))
    uid = text(data, "uid", max_len=64)
    token = text(data, "token", max_len=200)
    profile = model and uid and token and db.session.get(model, uid)
    if not profile:
        return jsonify({"status": "invalid"})
    if profile.accountEmailVerified:
        return jsonify({"status": "success"})
    if not profile.accountEmailToken or profile.accountEmailToken != token:
        return jsonify({"status": "invalid"})
    profile.accountEmailVerified = True
    profile.accountEmailToken = None
    db.session.commit()
    return jsonify({"status": "success"})
