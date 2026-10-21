"""Serves uploaded files. Public files (mentor photos, showcase files,
request images) are open to anyone; private ones (mentor verification
documents) need a valid signed link - see storage.py."""
from flask import Blueprint, Response, abort, redirect, request

from .. import storage

bp = Blueprint("files", __name__)


@bp.get("/files/<path:key>")
def serve(key):
    public = storage.is_public(key)
    if not public and not storage.check_signature(
        key, request.args.get("expires"), request.args.get("sig")
    ):
        abort(404)

    if storage.use_s3():
        response = redirect(storage.signed_url(key))
        # Browsers may reuse the redirect while the signed URL is still valid.
        response.headers["Cache-Control"] = "public, max-age=3000" if public else "private, no-store"
        return response

    found = storage.get(key)
    if not found:
        abort(404)
    data, content_type = found
    response = Response(data, mimetype=content_type)
    response.headers["Cache-Control"] = "public, max-age=86400" if public else "private, no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    if content_type == "image/svg+xml":
        # SVGs can carry scripts - never let one run on our domain.
        response.headers["Content-Security-Policy"] = "sandbox"
    return response
