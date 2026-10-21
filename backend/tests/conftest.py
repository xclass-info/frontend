import os
import time

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg:///happyresearch_test")

from happyresearch import create_app, security  # noqa: E402
from happyresearch.extensions import db, limiter, mail  # noqa: E402
from happyresearch.models import Student, Teacher, User  # noqa: E402

PROJECT = "test-project"
_KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)


@pytest.fixture()
def app(monkeypatch):
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
            "FIREBASE_PROJECT_ID": PROJECT,
        }
    )
    # Tokens in tests are signed with our own key instead of Google's.
    monkeypatch.setattr(security, "_google_certs", lambda: {"test-kid": _KEY.public_key()})
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


def firebase_token(uid, email, project=PROJECT, key=_KEY, expires_in=3600):
    now = int(time.time())
    claims = {
        "iss": f"https://securetoken.google.com/{project}",
        "aud": project,
        "sub": uid,
        "user_id": uid,
        "email": email,
        "iat": now,
        "exp": now + expires_in,
        "auth_time": now,
    }
    return jwt.encode(claims, key, algorithm="RS256", headers={"kid": "test-kid"})


def auth(uid, email):
    return {"Authorization": f"Bearer {firebase_token(uid, email)}"}


_counter = iter(range(10**6))


def make_user(email, *, student=False, teacher=False, admin=False, **profile):
    user = User(id=f"uid{next(_counter)}", email=email, isAdmin=admin)
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


def login(client, email):
    """Auth headers for the existing user with this email."""
    user = User.query.filter_by(email=email).one()
    return auth(user.id, email)
