import os

from dotenv import load_dotenv
from flask import Flask, jsonify

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

from .config import Config  # noqa: E402  (needs .env loaded first)
from .errors import register_error_handlers  # noqa: E402
from .extensions import cors, db, limiter, mail, migrate  # noqa: E402


def create_app(config_overrides=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if config_overrides:
        app.config.update(config_overrides)

    db.init_app(app)
    migrate.init_app(app, db, directory=os.path.join(os.path.dirname(os.path.dirname(__file__)), "migrations"))
    mail.init_app(app)
    limiter.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGINS"]}},
        allow_headers=["Content-Type", "Authorization", "X-API-Key"],
    )
    register_error_handlers(app)

    from .routes import register_blueprints

    register_blueprints(app)

    @app.route("/")
    def index():
        return jsonify({"status": "ok", "service": "happyresearch-api"})

    from . import cli

    cli.register(app)
    return app
