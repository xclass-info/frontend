from flask import jsonify
from werkzeug.exceptions import HTTPException


class ApiError(Exception):
    """Raised anywhere in a request to return {"error", "code"} JSON. `code`
    is a stable machine-readable string the frontend switches on (e.g.
    "FULL", "DUPLICATE", "INVALID_CREDENTIALS")."""

    def __init__(self, status, code, message=None):
        super().__init__(message or code)
        self.status = status
        self.code = code
        self.message = message or code


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(err):
        return jsonify({"error": err.message, "code": err.code}), err.status

    @app.errorhandler(HTTPException)
    def handle_http_error(err):
        code = "RATE_LIMITED" if err.code == 429 else err.name.upper().replace(" ", "_")
        return jsonify({"error": err.description, "code": code}), err.code
