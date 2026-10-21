import time

import jwt
from cryptography.hazmat.primitives.asymmetric import rsa

from happyresearch.extensions import db
from happyresearch.models import Student, Teacher, User

from .conftest import auth, firebase_token, make_user


def test_student_signup_verify(client, outbox):
    # Firebase account already created in the browser; now the profile.
    headers = auth("fb-ann", "Ann@Example.com")
    res = client.post(
        "/api/auth/profile", json={"kind": "student", "name": "Ann", "grade": "10th"}, headers=headers
    )
    assert res.status_code == 201 and res.json["emailSent"]
    assert len(outbox) == 1 and outbox[0].recipients == ["ann@example.com"]

    student = db.session.get(Student, "fb-ann")
    assert student.accountEmailVerified is False and student.email == "ann@example.com"
    token = student.accountEmailToken
    assert token in outbox[0].html

    # Not usable as a student until verified.
    assert client.get("/api/students/me/registrations", headers=headers).json["code"] == "EMAIL_NOT_VERIFIED"
    bad = client.post("/api/auth/verify-email", json={"kind": "student", "uid": "fb-ann", "token": "nope"})
    assert bad.json["status"] == "invalid"
    ok = client.post("/api/auth/verify-email", json={"kind": "student", "uid": "fb-ann", "token": token})
    assert ok.json["status"] == "success"
    assert client.get("/api/students/me/registrations", headers=headers).status_code == 200

    me = client.get("/api/auth/me", headers=headers).json
    assert me["student"]["name"] == "Ann" and me["teacher"] is None
    assert "accountEmailToken" not in me["student"]

    dup = client.post("/api/auth/profile", json={"kind": "student", "name": "Ann"}, headers=headers)
    assert dup.json["code"] == "PROFILE_EXISTS"


def test_resend_verification_issues_new_link(client, outbox):
    headers = auth("fb-t", "t@example.com")
    client.post("/api/auth/profile", json={"kind": "teacher", "name": "Dr. T"}, headers=headers)
    first = db.session.get(Teacher, "fb-t").accountEmailToken
    assert client.post("/api/auth/resend-verification", json={"kind": "teacher"}, headers=headers).status_code == 200
    teacher = db.session.get(Teacher, "fb-t")
    assert teacher.accountEmailToken != first and teacher.verificationStatus == "incomplete"
    assert len(outbox) == 2


def test_bad_tokens_are_rejected(client):
    other_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    for token in (
        "garbage",
        firebase_token("u1", "a@example.com", project="someone-else"),
        firebase_token("u1", "a@example.com", key=other_key),
        firebase_token("u1", "a@example.com", expires_in=-3600),
    ):
        res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 401
    assert client.get("/api/auth/me").status_code == 401


def test_first_request_creates_user_and_replaces_stale_row(client):
    # A placeholder login holding the email under another id (from the import).
    db.session.add(User(id="placeholder", email="admin@example.com"))
    db.session.commit()
    me = client.get("/api/auth/me", headers=auth("real-uid", "Admin@example.com")).json
    assert me["uid"] == "real-uid" and me["isAdmin"] is True
    assert db.session.get(User, "placeholder") is None


def test_admin_role_follows_admin_emails(client):
    make_user("s@example.com", student=True)
    assert client.get("/api/auth/me", headers=auth(User.query.one().id, "s@example.com")).json["isAdmin"] is False


def test_token_email_change_is_synced(client):
    user = make_user("old@example.com")
    client.get("/api/auth/me", headers=auth(user.id, "new@example.com"))
    assert db.session.get(User, user.id).email == "new@example.com"


def test_parallel_first_requests_share_one_user(client, monkeypatch):
    # Simulate the other request winning the race to create the row.
    real_get = db.session.get
    calls = {"n": 0}

    def get(model, ident, *a, **kw):
        if model is User and ident == "racer" and calls["n"] == 0:
            calls["n"] += 1
            with db.engine.begin() as conn:
                conn.execute(User.__table__.insert().values(id="racer", email="racer@example.com", is_admin=False))
            return None
        return real_get(model, ident, *a, **kw)

    monkeypatch.setattr(db.session, "get", get)
    res = client.get("/api/auth/me", headers=auth("racer", "racer@example.com"))
    assert res.status_code == 200 and res.json["uid"] == "racer"
