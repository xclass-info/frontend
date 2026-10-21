from flask import current_app, request

from .errors import ApiError
from .storage import guess_type


def read_upload(field="file", allow_pdf=False):
    """Validate the multipart file in `field`: an image (or PDF, if allowed)
    under MAX_UPLOAD_MB. Returns (bytes, filename, content_type)."""
    f = request.files.get(field)
    if not f or not f.filename:
        raise ApiError(400, "NO_FILE", "Please choose a file.")
    content_type = f.mimetype or guess_type(f.filename)
    ok = content_type.startswith("image/") or (allow_pdf and content_type == "application/pdf")
    if not ok:
        raise ApiError(
            400,
            "BAD_FILE_TYPE",
            "Please upload a PDF or image file." if allow_pdf else "Please upload an image file.",
        )
    limit_mb = current_app.config["MAX_UPLOAD_MB"]
    data = f.read(limit_mb * 1024 * 1024 + 1)
    if len(data) > limit_mb * 1024 * 1024:
        raise ApiError(400, "FILE_TOO_LARGE", f"File must be under {limit_mb}MB.")
    return data, f.filename, content_type
