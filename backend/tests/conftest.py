import os

import pytest

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg:///happyresearch_test")

from happyresearch import create_app  # noqa: E402
from happyresearch.extensions import db, limiter, mail  # noqa: E402
from happyresearch.models import Student, Teacher, User  # noqa: E402
from happyresearch.security import set_password  # noqa: E402


@pytest.fixture()
def app(tmp_path, monkeypatch):
    app = create_app(
        {
            "TESTING": True,
            "MAIL_SUPPRESS_SEND": True,
            "SQLALCHEMY_DATABASE_URI": os.environ["DATABASE_URL"],
            "S3_BUCKET": None,
            "API_URL": "http://api.test",
            "FRONTEND_URL": "http://site.test",
            "ADMIN_EMAILS": ["admin@example.com"],
            "MAIL_DEFAULT_SENDER": ("HappyResearch", "noreply@example.com"),
        }
    )
    monkeypatch.setattr("happyresearch.storage._LOCAL_DIR", str(tmp_path))
    limiter.enabled = False
    with app.app_context():
        db.drop_all()
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def outbox(app):
    with mail.record_messages() as sent:
        yield sent


def make_user(email, password="secret123", *, student=False, teacher=False, admin=False, **profile):
    user = User(email=email, isAdmin=admin)
    set_password(user, password)
    db.session.add(user)
    db.session.flush()
    if student:
        db.session.add(Student(id=user.id, email=email, name=profile.get("name", "Stu"), accountEmailVerified=True))
    if teacher:
        db.session.add(
            Teacher(
                id=user.id,
                email=email,
                name=profile.get("name", "Dr. T"),
                verificationStatus=profile.get("verificationStatus", "approved"),
                accountEmailVerified=True,
            )
        )
    db.session.commit()
    return user


def login(client, email, password="secret123"):
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.json
    return {"Authorization": f"Bearer {res.json['token']}"}
