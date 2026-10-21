"""Uploaded files.

Files live in an S3-compatible bucket (Cloudflare R2 in production). When no
bucket is configured (local development) they're written under
backend/uploads/ instead.

Database fields hold a reference of the form "s3:<key>". file_url() turns a
reference into something a browser can open:
  * public keys (mentor photos, showcase files, request images) become
    <API_URL>/files/<key>, which redirects to a short-lived signed URL;
  * private keys (mentor verification documents) are only ever handed out as
    signed URLs to the mentor themselves or an admin.
Anything that isn't an "s3:" reference (an old external link) passes through.
"""
import mimetypes
import os
import re
import time

from flask import current_app

PREFIX = "s3:"
PUBLIC_PREFIXES = ("mentors/", "showcase-files/", "requests/")
SIGNED_URL_SECONDS = 3600

_LOCAL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")


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


def _use_s3():
    return bool(current_app.config["S3_BUCKET"])


def safe_filename(name):
    name = os.path.basename(name or "file")
    return re.sub(r"[^A-Za-z0-9._-]+", "_", name)[-120:] or "file"


def make_key(folder, filename):
    return f"{folder}/{int(time.time() * 1000)}_{safe_filename(filename)}"


def put(key, data, content_type):
    if _use_s3():
        _client().put_object(
            Bucket=current_app.config["S3_BUCKET"], Key=key, Body=data, ContentType=content_type
        )
    else:
        path = os.path.join(_LOCAL_DIR, key)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            f.write(data)
    return PREFIX + key


def key_of(ref):
    if isinstance(ref, str) and ref.startswith(PREFIX):
        return ref[len(PREFIX):]
    return None


def is_public(key):
    return key.startswith(PUBLIC_PREFIXES)


def signed_url(key):
    if _use_s3():
        return _client().generate_presigned_url(
            "get_object",
            Params={"Bucket": current_app.config["S3_BUCKET"], "Key": key},
            ExpiresIn=SIGNED_URL_SECONDS,
        )
    return f"{current_app.config['API_URL']}/files/{key}"


def file_url(ref):
    """Browser-usable URL for a stored reference (see module docstring)."""
    key = key_of(ref)
    if key is None:
        return ref
    if is_public(key):
        return f"{current_app.config['API_URL']}/files/{key}"
    return signed_url(key)


def local_path(key):
    path = os.path.realpath(os.path.join(_LOCAL_DIR, key))
    if not path.startswith(os.path.realpath(_LOCAL_DIR) + os.sep):
        return None
    return path


def guess_type(filename):
    return mimetypes.guess_type(filename)[0] or "application/octet-stream"


def exists(key):
    if _use_s3():
        from botocore.exceptions import ClientError

        try:
            _client().head_object(Bucket=current_app.config["S3_BUCKET"], Key=key)
            return True
        except ClientError:
            return False
    path = local_path(key)
    return bool(path and os.path.exists(path))
