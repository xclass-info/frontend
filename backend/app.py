import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, ".env"))

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
MAIL_API_KEY = os.environ.get("MAIL_API_KEY")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [FRONTEND_ORIGIN, "http://localhost:5173"]}})

app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USE_SSL"] = False
app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD")
app.config["MAIL_DEFAULT_SENDER"] = ("HappyResearch", os.environ.get("MAIL_USERNAME"))

mail = Mail(app)
limiter = Limiter(get_remote_address, app=app, default_limits=[])


def verification_email_html(to_name, verify_link):
    return f"""
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
  <p>Hello {to_name or "there"},</p>
  <p>Welcome to HappyResearch!</p>
  <p>Thank you for joining our community of curious minds, aspiring researchers, and academic mentors.</p>
  <p>To complete your registration and activate your account, please verify your email address by clicking the button below.</p>
  <p style="text-align:center; margin: 32px 0;">
    <a href="{verify_link}" style="background:#2f6175; color:#ffffff; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
      Verify My Email Address
    </a>
  </p>
  <p style="font-size:13px; color:#666;">For your security, this verification link can only be used once.</p>
  <p style="font-size:13px; color:#666;">If you did not create a HappyResearch account, you can safely ignore this email.</p>
  <p>We look forward to supporting your research journey!</p>
  <p>Best regards,<br/>The HappyResearch Team<br/><a href="https://happyresearch.org">www.happyresearch.org</a></p>
</div>
"""


@app.route("/")
def index():
    return jsonify({"status": "ok", "service": "happyresearch-mail-service"})


@app.route("/api/send-verification-email", methods=["POST"])
@limiter.limit("5 per minute")
def send_verification_email():
    if not MAIL_API_KEY or request.headers.get("X-API-Key") != MAIL_API_KEY:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    to_email = (data.get("to_email") or "").strip()
    to_name = (data.get("to_name") or "").strip()
    verify_link = (data.get("verify_link") or "").strip()

    if not to_email or not verify_link:
        return jsonify({"error": "to_email and verify_link are required"}), 400

    try:
        msg = Message(
            "Welcome to HappyResearch – Verify Your Email",
            recipients=[to_email],
        )
        msg.html = verification_email_html(to_name, verify_link)
        mail.send(msg)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Verification email sent"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5050)
