"""Messages from visitors to the team inbox, plus the legacy verification
email endpoint the pre-migration frontend still calls."""
from flask import Blueprint, current_app, jsonify, request

from .. import emails, storage
from ..errors import ApiError
from ..extensions import limiter
from ..uploads import read_upload
from . import body, text, valid_email

bp = Blueprint("contact", __name__, url_prefix="/api")


def _sender(data):
    name = text(data, "name", required=True, max_len=200)
    email = text(data, "email", required=True, max_len=320)
    if not valid_email(email):
        raise ApiError(400, "INVALID_EMAIL", "Invalid email")
    return name, email


@bp.post("/contact")
@limiter.limit("5 per minute")
def contact():
    data = body()
    name, email = _sender(data)
    emails.send_team_message(
        text(data, "subject", max_len=300),
        name,
        email,
        text(data, "message", required=True),
    )
    return jsonify({"ok": True})


@bp.post("/on-demand-request")
@limiter.limit("5 per minute")
def on_demand_request():
    """On-demand Learning form: multipart (name, email, details, optional
    image). The image is stored and linked in the email."""
    data = request.form
    name, email = _sender(data)
    message = text(data, "details", required=True)
    if request.files.get("image"):
        file_data, filename, content_type = read_upload("image")
        ref = storage.put(storage.make_key("requests", filename), file_data, content_type)
        message += f"\n\nAttached image: {storage.file_url(ref)}"
    emails.send_team_message("New request: On-demand Learning", name, email, message)
    return jsonify({"ok": True})


@bp.post("/send-verification-email")
@limiter.limit("5 per minute")
def legacy_send_verification_email():
    """Kept so the live (Firebase-era) frontend keeps working until cutover."""
    key = current_app.config["MAIL_API_KEY"]
    if not key or request.headers.get("X-API-Key") != key:
        return jsonify({"error": "Unauthorized"}), 401
    data = body()
    to_email = text(data, "to_email")
    verify_link = text(data, "verify_link")
    if not to_email or not verify_link:
        return jsonify({"error": "to_email and verify_link are required"}), 400
    try:
        emails.send_account_verification(to_email, text(data, "to_name"), verify_link)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Verification email sent"}), 200
