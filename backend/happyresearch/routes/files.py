"""Public uploaded files (mentor photos, showcase files, request images).
Private files are never served here - see storage.py."""
from flask import Blueprint, abort, redirect, send_file

from .. import storage

bp = Blueprint("files", __name__)


@bp.get("/files/<path:key>")
def serve(key):
    if ".." in key or not storage.is_public(key):
        abort(404)
    if storage._use_s3():
        response = redirect(storage.signed_url(key))
        # Browsers may reuse the redirect while the signed URL is still valid.
        response.headers["Cache-Control"] = "public, max-age=3000"
        return response
    path = storage.local_path(key)
    if not path:
        abort(404)
    try:
        return send_file(path)
    except FileNotFoundError:
        abort(404)
