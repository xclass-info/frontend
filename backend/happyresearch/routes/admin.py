"""Admin dashboard API. Every route requires an admin account."""
from flask import Blueprint, jsonify

from .. import storage
from ..errors import ApiError
from ..extensions import db
from ..models import Registration, Research, Student, Teacher
from ..security import admin_required
from ..serializers import teacher_json
from ..uploads import read_upload
from . import body, text
from .registrations import _locked_item, _seats_full, student_registrations

bp = Blueprint("admin", __name__, url_prefix="/api/admin")

EDITABLE = {"teachers": Teacher, "research": Research}
# Never editable through the generic edit form: ids, secrets, and file
# fields (photos go through the upload route below).
NOT_EDITABLE = {
    "id", "accountEmailToken", "workEmailToken", "createdAt",
    *Teacher.FILE_FIELDS,
}


def _row(collection, row_id):
    model = EDITABLE.get(collection)
    row = model and db.session.get(model, row_id)
    if not row:
        raise ApiError(404, "NOT_FOUND", "Not found.")
    return row


def _json(row):
    return teacher_json(row, "admin") if isinstance(row, Teacher) else row.to_dict()


@bp.get("/students")
@admin_required
def students():
    return jsonify([s.to_dict() for s in Student.query.all()])


@bp.get("/students/<student_id>/registrations")
@admin_required
def student_activity(student_id):
    student = db.session.get(Student, student_id)
    if not student:
        raise ApiError(404, "NOT_FOUND", "Student not found.")
    return jsonify(student_registrations(student.email, student.id))


@bp.get("/teachers")
@admin_required
def teachers():
    return jsonify([teacher_json(t, "admin") for t in Teacher.query.all()])


@bp.get("/research")
@admin_required
def research():
    return jsonify([r.to_dict() for r in Research.query.all()])


@bp.get("/registrations")
@admin_required
def registrations():
    return jsonify([r.to_dict() for r in Registration.query.all()])


@bp.patch("/<collection>/<row_id>")
@admin_required
def edit(collection, row_id):
    row = _row(collection, row_id)
    # The edit form sends the whole record back; timestamps aren't editable.
    columns = {
        a.key
        for a in row.__mapper__.column_attrs
        if not isinstance(a.columns[0].type, db.DateTime)
    }
    row.apply(body(), columns - NOT_EDITABLE)
    if isinstance(row, Teacher) and row.yearsOfExperience is not None:
        row.yearsOfExperience = str(row.yearsOfExperience)
    db.session.commit()
    return jsonify(_json(row))


@bp.delete("/<collection>/<row_id>")
@admin_required
def delete(collection, row_id):
    db.session.delete(_row(collection, row_id))
    db.session.commit()
    return jsonify({"ok": True})


@bp.post("/teachers/<teacher_id>/photo")
@admin_required
def upload_photo(teacher_id):
    teacher = _row("teachers", teacher_id)
    data, filename, content_type = read_upload()
    teacher.photoURL = storage.put(
        storage.make_key("mentors", f"{teacher.id}_{filename}"), data, content_type
    )
    db.session.commit()
    return jsonify(_json(teacher))


@bp.post("/teachers/<teacher_id>/approve")
@admin_required
def approve_mentor(teacher_id):
    teacher = _row("teachers", teacher_id)
    teacher.verificationStatus = "approved"
    teacher.rejectionReason = None
    db.session.commit()
    return jsonify(_json(teacher))


@bp.post("/teachers/<teacher_id>/reject")
@admin_required
def reject_mentor(teacher_id):
    teacher = _row("teachers", teacher_id)
    teacher.verificationStatus = "rejected"
    teacher.rejectionReason = text(body(), "reason", required=True, max_len=5000)
    db.session.commit()
    return jsonify(_json(teacher))


@bp.post("/registrations/<path:reg_id>/approve")
@admin_required
def approve_registration(reg_id):
    """Re-check seats (several applications can be pending for fewer seats),
    then take the seat and approve, atomically."""
    reg = db.session.query(Registration).filter_by(id=reg_id).with_for_update().first()
    if not reg:
        raise ApiError(404, "NOT_FOUND", "Application not found.")
    if reg.status and reg.status != "pending":
        raise ApiError(409, "ALREADY_REVIEWED", "This application was already reviewed.")
    item = _locked_item(reg.kind, reg.itemId)
    if _seats_full(item):
        raise ApiError(409, "FULL", "No seats left - can't approve this application.")
    item.enrolledCount = (item.enrolledCount or 0) + 1
    reg.status = "approved"
    db.session.commit()
    return jsonify(reg.to_dict())


@bp.post("/registrations/<path:reg_id>/reject")
@admin_required
def reject_registration(reg_id):
    reg = db.session.get(Registration, reg_id)
    if not reg:
        raise ApiError(404, "NOT_FOUND", "Application not found.")
    reg.status = "rejected"
    reg.rejectionReason = text(body(), "reason", required=True, max_len=5000)
    db.session.commit()
    return jsonify(reg.to_dict())

