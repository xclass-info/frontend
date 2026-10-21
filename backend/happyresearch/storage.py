"""Uploaded files.

Files are stored in Postgres (the `stored_files` table). If an S3-compatible
bucket is configured (S3_BUCKET etc. - e.g. Cloudflare R2) they go there
instead; nothing else changes.

Database fields hold a reference of the form "s3:<key>" (the prefix is just
a marker - it's used for both backends). file_url() turns a reference into
something a browser can open:
  * public keys (mentor photos, showcase files, request images) become
    <API_URL>/files/<key>;
  * private keys (mentor verification documents) are only ever handed out,
    to the mentor themselves or an admin, as signed links that expire after
    an hour.
Anything that isn't an "s3:" reference (an old external link) passes through.
"""
import hashlib
import hmac
import mimetypes
import os
import re
import time

from flask import current_app

from .extensions import db
from .models import StoredFile

PREFIX = "s3:"
PUBLIC_PREFIXES = ("mentors/", "showcase-files/", "requests/")
SIGNED_URL_SECONDS = 3600


def _client():
    import boto3

    cfg = current_app.config
    return boto3.client(
        "s3",
        endpoint_url=cfg["S3_ENDPOINT_URL"],
        aws_access_key_id=cfg["S3_ACCESS_KEY_ID"],
        aws_secret_access_key=cfg["S3_SECRET_ACCESS_KEY"],
        region_name=cfg["S3_REGION"],
    )


def use_s3():
    return bool(current_app.config["S3_BUCKET"])


def safe_filename(name):
    name = os.path.basename(name or "file")
    return re.sub(r"[^A-Za-z0-9._-]+", "_", name)[-120:] or "file"


def make_key(folder, filename):
    return f"{folder}/{int(time.time() * 1000)}_{safe_filename(filename)}"


def put(key, data, content_type):
    if use_s3():
        _client().put_object(
            Bucket=current_app.config["S3_BUCKET"], Key=key, Body=data, ContentType=content_type
        )
    else:
        db.session.merge(StoredFile(key=key, contentType=content_type, size=len(data), data=data))
        db.session.commit()
    return PREFIX + key


def get(key):
    """(bytes, content_type) of a file stored in Postgres, or None."""
    row = db.session.get(StoredFile, key)
    return (row.data, row.contentType) if row else None


def exists(key):
    if use_s3():
        from botocore.exceptions import ClientError

        try:
            _client().head_object(Bucket=current_app.config["S3_BUCKET"], Key=key)
            return True
        except ClientError:
            return False
    return db.session.query(StoredFile.key).filter_by(key=key).first() is not None


def key_of(ref):
    if isinstance(ref, str) and ref.startswith(PREFIX):
        return ref[len(PREFIX):]
    return None


def is_public(key):
    return key.startswith(PUBLIC_PREFIXES)


# ── Signed links (private files) ─────────────────────────────────────────


def _signature(key, expires):
    secret = current_app.config["SECRET_KEY"].encode()
    return hmac.new(secret, f"{key}:{expires}".encode(), hashlib.sha256).hexdigest()


def check_signature(key, expires, sig):
    try:
        expires = int(expires)
    except (TypeError, ValueError):
        return False
    return expires > time.time() and hmac.compare_digest(_signature(key, expires), sig or "")


def signed_url(key):
    if use_s3():
        return _client().generate_presigned_url(
            "get_object",
            Params={"Bucket": current_app.config["S3_BUCKET"], "Key": key},
            ExpiresIn=SIGNED_URL_SECONDS,
        )
    expires = int(time.time()) + SIGNED_URL_SECONDS
    return (
        f"{current_app.config['API_URL']}/files/{key}"
        f"?expires={expires}&sig={_signature(key, expires)}"
    )


def file_url(ref):
    """Browser-usable URL for a stored reference (see module docstring)."""
    key = key_of(ref)
    if key is None:
        return ref
    if is_public(key):
        return f"{current_app.config['API_URL']}/files/{key}"
    return signed_url(key)


def guess_type(filename):
    return mimetypes.guess_type(filename)[0] or "application/octet-stream"
