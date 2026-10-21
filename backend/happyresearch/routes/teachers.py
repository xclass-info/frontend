"""Mentors: public listings/profiles, the mentor's own profile, the mentor
verification workflow, and availability slots."""
from flask import Blueprint, current_app, jsonify, request

from .. import emails, storage
from ..errors import ApiError
from ..extensions import db, limiter
from ..models import Availability, Teacher, utcnow
from ..security import current_teacher, random_token
from ..serializers import rows, teacher_json
from ..uploads import read_upload
from . import body, text, valid_email

bp = Blueprint("teachers", __name__, url_prefix="/api/teachers")

MENTOR_TYPES = ("phd_student", "phd_graduate", "faculty")


# ── Public ────────────────────────────────────────────────────────────────


@bp.get("")
def list_teachers():
    return jsonify([teacher_json(t) for t in Teacher.query.all()])


@bp.get("/<teacher_id>")
def get_teacher(teacher_id):
    teacher = db.session.get(Teacher, teacher_id)
    if not teacher:
        raise ApiError(404, "NOT_FOUND", "Mentor not found.")
    return jsonify(teacher_json(teacher))


@bp.get("/<teacher_id>/availability")
def public_availability(teacher_id):
    slots = Availability.query.filter_by(teacherId=teacher_id).all()
    return jsonify(rows(slots))


@bp.post("/verify-work-email")
@limiter.limit("20 per minute")
def verify_work_email():
    data = body()
    uid = text(data, "uid", max_len=64)
    token = text(data, "token", max_len=200)
    teacher = uid and token and db.session.get(Teacher, uid)
    if not teacher:
        return jsonify({"status": "invalid"})
    if teacher.workEmailVerified:
        return jsonify({"status": "success"})
    if not teacher.workEmailToken or teacher.workEmailToken != token:
        return jsonify({"status": "invalid"})
    teacher.workEmailVerified = True
    teacher.workEmailToken = None
    db.session.commit()
    return jsonify({"status": "success"})


# ── The logged-in mentor ──────────────────────────────────────────────────


@bp.get("/me")
def get_me():
    return jsonify(teacher_json(current_teacher(), "owner"))


@bp.patch("/me")
def update_me():
    teacher = current_teacher()
    data = body()
    teacher.apply(
        {k: (v.strip() if isinstance(v, str) else v) for k, v in data.items()},
        Teacher.PROFILE_FIELDS,
    )
    if "yearsOfExperience" in data and data["yearsOfExperience"] is not None:
        teacher.yearsOfExperience = str(data["yearsOfExperience"])
    teacher.updatedAt = utcnow()
    db.session.commit()
    return jsonify(teacher_json(teacher, "owner"))


@bp.post("/me/mentor-type")
def set_mentor_type():
    teacher = current_teacher()
    value = body().get("mentorType")
    if value is None:
        # "Change type" - back to the type picker, status untouched.
        teacher.mentorType = None
    elif value in MENTOR_TYPES:
        teacher.mentorType = value
        teacher.verificationStatus = "incomplete"
    else:
        raise ApiError(400, "INVALID_MENTOR_TYPE", "Unknown mentor type.")
    db.session.commit()
    return jsonify(teacher_json(teacher, "owner"))


@bp.post("/me/verification-document")
@limiter.limit("10 per minute")
def upload_verification_document():
    teacher = current_teacher()
    if teacher.mentorType not in ("phd_student", "phd_graduate"):
        raise ApiError(400, "WRONG_MENTOR_TYPE", "Choose PhD Student or PhD Graduate first.")
    data, filename, content_type = read_upload(allow_pdf=True)
    ref = storage.put(
        storage.make_key(f"mentor-documents/{teacher.id}", filename), data, content_type
    )
    field = "transcriptURL" if teacher.mentorType == "phd_student" else "degreeCertificateURL"
    setattr(teacher, field, ref)
    teacher.verificationStatus = "pending_review"
    teacher.rejectionReason = None
    teacher.submittedAt = utcnow()
    db.session.commit()
    return jsonify(teacher_json(teacher, "owner"))


@bp.post("/me/work-email")
@limiter.limit("5 per minute")
def send_work_email():
    teacher = current_teacher()
    work_email = text(body(), "workEmail", required=True, max_len=320)
    if not valid_email(work_email):
        raise ApiError(400, "INVALID_EMAIL", "Please enter a valid email address.")
    token = random_token()
    teacher.workEmail = work_email
    teacher.workEmailToken = token
    teacher.workEmailVerified = False
    db.session.commit()
    emails.send_work_email_verification(work_email, teacher.name, teacher.id, token)
    return jsonify(teacher_json(teacher, "owner"))


@bp.post("/me/faculty-application")
def submit_faculty_application():
    teacher = current_teacher()
    profile_url = text(body(), "universityProfileURL", required=True, max_len=2000)
    teacher.universityProfileURL = profile_url
    teacher.verificationStatus = "pending_review"
    teacher.rejectionReason = None
    teacher.submittedAt = utcnow()
    db.session.commit()
    return jsonify(teacher_json(teacher, "owner"))


# ── Availability ──────────────────────────────────────────────────────────


@bp.get("/me/availability")
def my_availability():
    teacher = current_teacher()
    return jsonify(rows(Availability.query.filter_by(teacherId=teacher.id).all()))


@bp.post("/me/availability")
def add_slot():
    teacher = current_teacher()
    data = body()
    date = text(data, "date", required=True, max_len=10)
    time = text(data, "time", required=True, max_len=5)
    try:
        duration = int(data.get("duration") or 60)
        price = float(data.get("price") or 0)
    except (TypeError, ValueError):
        raise ApiError(400, "INVALID_NUMBER", "Duration and price must be numbers.")
    slot = Availability(
        teacherId=teacher.id, date=date, time=time, duration=duration, price=price, booked=False
    )
    db.session.add(slot)
    db.session.commit()
    return jsonify(slot.to_dict()), 201


@bp.delete("/me/availability/<slot_id>")
def delete_slot(slot_id):
    teacher = current_teacher()
    slot = db.session.get(Availability, slot_id)
    if not slot or slot.teacherId != teacher.id:
        raise ApiError(404, "NOT_FOUND", "Slot not found.")
    if slot.booked:
        raise ApiError(409, "SLOT_BOOKED", "Booked slots can't be removed.")
    db.session.delete(slot)
    db.session.commit()
    return jsonify({"ok": True})
