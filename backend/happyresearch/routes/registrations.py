"""Student applications for research posts / projects, and the student's own
account data."""
from urllib.parse import quote

from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from ..errors import ApiError
from ..extensions import db, limiter
from ..models import ITEM_MODELS, Registration, Teacher
from ..security import current_student, current_user
from . import body, text

bp = Blueprint("registrations", __name__, url_prefix="/api")


# Characters JS encodeURIComponent leaves alone.
_URI_SAFE = "-_.!~*'()"


def registration_id(item_id, email):
    # Same id scheme as the old Firestore docs.
    return f"{item_id}_{quote(email.strip().lower(), safe=_URI_SAFE)}"


def _locked_item(kind, item_id):
    """The research/project row, locked for the rest of the transaction so
    two applications/approvals can't both take the last seat."""
    model = ITEM_MODELS.get(kind)
    if not model:
        raise ApiError(400, "INVALID_KIND", "kind must be research or project.")
    item = db.session.query(model).filter_by(id=item_id).with_for_update().first()
    if not item:
        raise ApiError(404, "NOT_FOUND", "This is no longer available.")
    return item


def _seats_full(item):
    # Like the old client code, an item without a seat count never reads as full.
    return item.seats is not None and (item.enrolledCount or 0) >= item.seats


@bp.post("/registrations")
@limiter.limit("10 per minute")
def register_for_item():
    """Apply for one item. Applying only reserves a review slot - the seat is
    taken when an admin approves (see admin.approve_registration). A
    previously rejected application can be replaced by a fresh one."""
    student = current_student()
    user = current_user()
    data = body()
    kind = data.get("kind")
    item = _locked_item(kind, text(data, "itemId", required=True, max_len=64))

    email = user.email
    reg_id = registration_id(item.id, email)
    existing = db.session.get(Registration, reg_id)
    if existing and existing.status != "rejected":
        raise ApiError(409, "DUPLICATE", "You've already applied to this.")
    if _seats_full(item):
        raise ApiError(409, "FULL", "Sorry, the last seat was just taken.")

    if existing:
        db.session.delete(existing)
        db.session.flush()
    db.session.add(
        Registration(
            id=reg_id,
            kind=kind,
            itemId=item.id,
            itemTitle=item.title,
            teacherId=item.teacherId,
            studentName=(student.name or "").strip(),
            studentEmail=email,
            studentEmailLower=email.lower(),
            studentUid=user.id,
            status="pending",
        )
    )
    db.session.commit()
    return jsonify({"id": reg_id}), 201


@bp.get("/registrations")
def list_for_item():
    """Who applied for an item - for the mentor who owns it (or an admin)."""
    user = current_user()
    if not user:
        raise ApiError(401, "UNAUTHENTICATED", "Please log in.")
    item_id = request.args.get("itemId")
    if not item_id:
        raise ApiError(400, "MISSING_FIELD", "itemId is required.")
    regs = Registration.query.filter_by(itemId=item_id).all()
    owner_ids = {
        row.teacherId
        for model in ITEM_MODELS.values()
        if (row := db.session.get(model, item_id))
    }
    if not user.isAdmin and user.id not in owner_ids:
        raise ApiError(403, "FORBIDDEN", "Not your item.")
    return jsonify([r.to_dict() for r in regs])


def student_registrations(email, uid):
    """Everything the student dashboard lists: the student's registrations,
    newest first, each with the item as it is now and the mentor's details.
    Matches on email (old rows) as well as uid (newer rows)."""
    e = (email or "").strip().lower()
    conditions = [Registration.studentEmail == e, Registration.studentEmailLower == e]
    if uid:
        conditions.append(Registration.studentUid == uid)
    regs = (
        Registration.query.filter(or_(*conditions))
        .order_by(Registration.createdAt.desc().nullslast())
        .all()
    )
    out = []
    for reg in regs:
        model = ITEM_MODELS.get(reg.kind)
        item = db.session.get(model, reg.itemId) if model else None
        teacher = db.session.get(Teacher, reg.teacherId) if reg.teacherId else None
        out.append(
            {
                "reg": reg.to_dict(),
                "item": item.to_dict() if item else None,
                "mentorName": teacher.name if teacher else None,
                "mentorType": teacher.mentorType if teacher else None,
                "mentorDegree": teacher.degree if teacher else None,
            }
        )
    return out


@bp.get("/students/me/registrations")
def my_registrations():
    student = current_student()
    user = current_user()
    return jsonify(student_registrations(user.email, student.id))


@bp.patch("/students/me")
def update_my_profile():
    student = current_student()
    data = body()
    if "name" in data:
        student.name = text(data, "name", required=True, max_len=200)
    if "grade" in data:
        student.grade = text(data, "grade", max_len=50)
    if "phone" in data:
        student.phone = text(data, "phone", max_len=50)
    db.session.commit()
    return jsonify(student.to_dict())
