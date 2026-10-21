"""One-way copy of the old Firebase project into Postgres + object storage.

    flask import-firebase [--auth-export users.json] [--skip-files]

* Firestore documents are read through the Firestore REST API with the web
  API key. Content tables (everything except `users`) are cleared and
  reloaded on every run - Firestore is the source of truth until cutover -
  so the command can be re-run safely, and is re-run once more at cutover.
* Logins come from `firebase auth:export users.json --format=json`. With it,
  every account keeps its password (Firebase scrypt hashes, verified by
  security.check_password and upgraded on first login). Without it, users are
  created from the students/teachers records with no password, and must use
  "Forgot password?" once. A user who already set a password in the new
  system is never overwritten.
* Files referenced by Firebase Storage download URLs are copied into object
  storage under the same path and the fields are rewritten to "s3:<path>".
"""
import json
from datetime import datetime, timezone
from urllib.parse import unquote, urlparse

import requests
from flask import current_app

from . import storage
from .extensions import db
from .models import (
    Availability,
    Booking,
    Project,
    Registration,
    Research,
    Showcase,
    Student,
    Teacher,
    User,
)

PROJECT_ID = "xclass-3e2f3"
API_KEY = "AIzaSyAqpiDMssuavUdJGXUkxvow_8pP67KvUY8"
BASE = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

COLLECTIONS = {
    "teachers": Teacher,
    "students": Student,
    "research": Research,
    "projects": Project,
    "showcase": Showcase,
    "registrations": Registration,
    "bookings": Booking,
}
FILE_FIELDS = {
    Teacher: ("photoURL", "transcriptURL", "degreeCertificateURL"),
    Showcase: ("fileUrl",),
}
# Stored as text even though some old docs have numbers.
TEXT_FIELDS = {Teacher: ("yearsOfExperience",)}


# ── Firestore REST ────────────────────────────────────────────────────────


def _value(v):
    if "nullValue" in v:
        return None
    if "stringValue" in v:
        return v["stringValue"]
    if "booleanValue" in v:
        return v["booleanValue"]
    if "integerValue" in v:
        return int(v["integerValue"])
    if "doubleValue" in v:
        return float(v["doubleValue"])
    if "timestampValue" in v:
        return datetime.fromisoformat(v["timestampValue"].replace("Z", "+00:00"))
    if "arrayValue" in v:
        return [_value(x) for x in v["arrayValue"].get("values", [])]
    if "mapValue" in v:
        return {k: _value(x) for k, x in v["mapValue"].get("fields", {}).items()}
    if "referenceValue" in v:
        return v["referenceValue"]
    raise ValueError(f"Unsupported Firestore value: {v}")


def fetch_collection(path):
    """[(doc_id, fields_dict)] for every document in a collection path."""
    docs, token = [], None
    while True:
        params = {"pageSize": 300, "key": API_KEY}
        if token:
            params["pageToken"] = token
        resp = requests.get(f"{BASE}/{path}", params=params, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        for doc in data.get("documents", []):
            doc_id = doc["name"].rsplit("/", 1)[1]
            docs.append((doc_id, {k: _value(v) for k, v in doc.get("fields", {}).items()}))
        token = data.get("nextPageToken")
        if not token:
            return docs


# ── Rows ──────────────────────────────────────────────────────────────────


def _to_row(model, doc_id, fields, warn):
    columns = {a.key: a for a in model.__mapper__.column_attrs}
    values = {"id": doc_id}
    for key, value in fields.items():
        if key not in columns:
            warn(f"{model.__tablename__}/{doc_id}: dropping unknown field {key!r}")
            continue
        if key in TEXT_FIELDS.get(model, ()) and value is not None:
            value = str(value)
        if isinstance(value, datetime) and value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        values[key] = value
    return model(**values)


def _firebase_storage_path(url):
    """'mentors/abc.jpg' for a Firebase Storage download URL, else None."""
    if not isinstance(url, str) or "firebasestorage.googleapis.com" not in url:
        return None
    path = urlparse(url).path
    if "/o/" not in path:
        return None
    return unquote(path.split("/o/", 1)[1])


def _copy_file(url, log):
    path = _firebase_storage_path(url)
    if not path:
        return url
    ref = storage.PREFIX + path
    if storage.exists(path):
        return ref
    resp = requests.get(url, timeout=120)
    if resp.status_code != 200:
        log(f"  ! could not download {path} (HTTP {resp.status_code}); keeping old URL")
        return url
    storage.put(path, resp.content, resp.headers.get("Content-Type") or storage.guess_type(path))
    log(f"  copied {path}")
    return ref


# ── Users ─────────────────────────────────────────────────────────────────


def _auth_users(auth_export):
    if not auth_export:
        return None
    with open(auth_export) as f:
        return json.load(f).get("users", [])


def _upsert_user(uid, email, created_at, password_hash, salt, log):
    email = (email or "").strip().lower()
    if not email:
        return
    user = db.session.get(User, uid)
    clash = User.query.filter(User.email == email, User.id != uid).first()
    if clash:
        log(f"  ! {email} already belongs to user {clash.id}; skipping login for {uid}")
        return
    if not user:
        user = User(id=uid, email=email, createdAt=created_at)
        db.session.add(user)
    elif user.passwordAlgo == "werkzeug":
        return  # already set a password in the new system - keep it
    user.email = email
    if password_hash:
        user.passwordHash = password_hash
        user.passwordSalt = salt
        user.passwordAlgo = "firebase_scrypt"
    elif user.passwordAlgo != "firebase_scrypt":
        user.passwordAlgo = None
    db.session.flush()


def import_users(auth_users, teachers, students, log):
    if auth_users is not None:
        for u in auth_users:
            created = None
            if u.get("createdAt"):
                created = datetime.fromtimestamp(int(u["createdAt"]) / 1000, tz=timezone.utc)
            _upsert_user(u["localId"], u.get("email"), created, u.get("passwordHash"), u.get("salt"), log)
        log(f"users: {len(auth_users)} from auth export")
    else:
        log("users: no auth export given - creating password-less logins from profiles")
        for row in [*students, *teachers]:
            _upsert_user(row.id, row.email, row.createdAt, None, None, log)

    for email in current_app.config["ADMIN_EMAILS"]:
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(email=email, passwordAlgo=None)
            db.session.add(user)
            log(f"  created admin login {email} (needs a password reset)")
        user.isAdmin = True
    db.session.flush()


# ── Entry point ───────────────────────────────────────────────────────────


def run(auth_export=None, skip_files=False, log=print):
    warnings = []

    def warn(msg):
        warnings.append(msg)

    fetched = {}
    for name, model in COLLECTIONS.items():
        fetched[name] = [_to_row(model, i, f, warn) for i, f in fetch_collection(name)]
        log(f"{name}: {len(fetched[name])} documents")

    slots = []
    for teacher in fetched["teachers"]:
        for slot_id, f in fetch_collection(f"teachers/{teacher.id}/availability"):
            row = _to_row(Availability, slot_id, f, warn)
            row.teacherId = teacher.id
            slots.append(row)
    log(f"availability: {len(slots)} slots")

    if not skip_files:
        log("copying files...")
        for name, model in COLLECTIONS.items():
            for row in fetched[name]:
                for field in FILE_FIELDS.get(model, ()):
                    value = getattr(row, field)
                    if value:
                        setattr(row, field, _copy_file(value, log))

    # Content: replace wholesale.
    for model in (Availability, *COLLECTIONS.values()):
        db.session.query(model).delete()
    for name in COLLECTIONS:
        db.session.add_all(fetched[name])
    db.session.add_all(slots)
    db.session.flush()

    import_users(_auth_users(auth_export), fetched["teachers"], fetched["students"], log)
    db.session.commit()

    for msg in sorted(set(warnings)):
        log("  ! " + msg)
    log("done.")
