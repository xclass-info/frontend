from happyresearch.extensions import db
from happyresearch.models import Student, Teacher, User

from .conftest import login, make_user

# Example parameters + hash from Firebase's published scrypt docs
# (github.com/firebase/scrypt), password "user1password".
FIREBASE_PARAMS = {
    "FIREBASE_HASH_SIGNER_KEY": "jxspr8Ki0RYycVU8zykbdLGjFQ3McFUH0uiiTvC8pVMXAn210wjLNmdZJzxUECKbm0QsEmYUSDzZvpjeJ9WmXA==",
    "FIREBASE_HASH_SALT_SEPARATOR": "Bw==",
    "FIREBASE_HASH_ROUNDS": 8,
    "FIREBASE_HASH_MEM_COST": 14,
}
FIREBASE_SALT = "42xEC+ixf3L2lw=="
FIREBASE_HASH = "lSrfV15cpx95/sZS2W9c9Kp6i/LVgQNDNC/qzrCnh1SAyZvqmZqAjTdn3aoItz+VHjoZilo78198JAdRuid5lQ=="


def test_student_signup_verify_login(client, outbox):
    res = client.post(
        "/api/auth/register",
        json={"kind": "student", "name": "Ann", "email": "Ann@Example.com", "password": "secret123", "grade": "10th"},
    )
    assert res.status_code == 201 and res.json["emailSent"]
    uid = res.json["uid"]
    assert len(outbox) == 1 and outbox[0].recipients == ["ann@example.com"]

    student = db.session.get(Student, uid)
    assert student.accountEmailVerified is False
    token = student.accountEmailToken
    assert token in outbox[0].html

    # Logging in works, but the account isn't usable as a student yet.
    headers = login(client, "ann@example.com")
    assert client.get("/api/students/me/registrations", headers=headers).json["code"] == "EMAIL_NOT_VERIFIED"

    bad = client.post("/api/auth/verify-email", json={"kind": "student", "uid": uid, "token": "nope"})
    assert bad.json["status"] == "invalid"
    ok = client.post("/api/auth/verify-email", json={"kind": "student", "uid": uid, "token": token})
    assert ok.json["status"] == "success"
    assert client.get("/api/students/me/registrations", headers=headers).status_code == 200

    me = client.get("/api/auth/me", headers=headers).json
    assert me["student"]["name"] == "Ann" and me["teacher"] is None
    assert "accountEmailToken" not in me["student"]


def test_duplicate_email_and_bad_password(client):
    make_user("a@example.com")
    res = client.post(
        "/api/auth/register",
        json={"kind": "teacher", "name": "A", "email": "A@example.com", "password": "secret123"},
    )
    assert res.json["code"] == "EMAIL_IN_USE"
    res = client.post("/api/auth/login", json={"email": "a@example.com", "password": "wrong"})
    assert res.status_code == 401 and res.json["code"] == "INVALID_CREDENTIALS"


def test_password_reset_invalidates_old_tokens(client, outbox):
    make_user("r@example.com")
    old = login(client, "r@example.com")
    assert client.post("/api/auth/forgot-password", json={"email": "r@example.com"}).status_code == 200
    # Unknown emails get the same answer (no account enumeration).
    assert client.post("/api/auth/forgot-password", json={"email": "x@example.com"}).status_code == 200
    assert len(outbox) == 1
    token = outbox[0].html.split("reset-password?token=")[1].split('"')[0]

    res = client.post("/api/auth/reset-password", json={"token": token, "password": "newpass1"})
    assert res.status_code == 200
    assert client.get("/api/auth/me", headers=old).status_code == 401
    login(client, "r@example.com", "newpass1")
    # Single use.
    res = client.post("/api/auth/reset-password", json={"token": token, "password": "another1"})
    assert res.json["code"] == "INVALID_TOKEN"


def test_migrated_account_without_password_must_reset(client):
    db.session.add(User(id="olduid", email="old@example.com", passwordAlgo=None))
    db.session.commit()
    res = client.post("/api/auth/login", json={"email": "old@example.com", "password": "whatever"})
    assert res.status_code == 409 and res.json["code"] == "PASSWORD_RESET_REQUIRED"


def test_firebase_scrypt_hash_is_accepted_and_upgraded(app, client):
    app.config.update(FIREBASE_PARAMS)
    db.session.add(
        User(
            id="fbuid",
            email="fb@example.com",
            passwordAlgo="firebase_scrypt",
            passwordHash=FIREBASE_HASH,
            passwordSalt=FIREBASE_SALT,
        )
    )
    db.session.commit()
    assert client.post("/api/auth/login", json={"email": "fb@example.com", "password": "wrong"}).status_code == 401
    login(client, "fb@example.com", "user1password")
    assert db.session.get(User, "fbuid").passwordAlgo == "werkzeug"
    login(client, "fb@example.com", "user1password")


def test_teacher_signup_gives_incomplete_mentor(client):
    res = client.post(
        "/api/auth/register",
        json={"kind": "teacher", "name": "Dr. Who", "email": "who@example.com", "password": "secret123"},
    )
    teacher = db.session.get(Teacher, res.json["uid"])
    assert teacher.verificationStatus == "incomplete"
    assert teacher.accountEmailVerified is False


def test_admin_email_gets_admin_role(client):
    client.post(
        "/api/auth/register",
        json={"kind": "student", "name": "Boss", "email": "admin@example.com", "password": "secret123"},
    )
    assert User.query.filter_by(email="admin@example.com").one().isAdmin


def test_import_firebase_passwords_command(app, client, tmp_path):
    import json

    app.config.update(FIREBASE_PARAMS)
    db.session.add(User(id="fbuid", email="fb@example.com", passwordAlgo=None))
    make_user("kept@example.com", "mynewpass")
    db.session.commit()
    export = tmp_path / "users.json"
    export.write_text(json.dumps({"users": [
        {"localId": "fbuid", "email": "fb@example.com", "passwordHash": FIREBASE_HASH, "salt": FIREBASE_SALT},
        {"localId": "other", "email": "kept@example.com", "passwordHash": FIREBASE_HASH, "salt": FIREBASE_SALT},
    ]}))
    result = app.test_cli_runner().invoke(args=["import-firebase-passwords", str(export)])
    assert "1 account(s)" in result.output
    login(client, "fb@example.com", "user1password")
    login(client, "kept@example.com", "mynewpass")  # a new password is never overwritten
