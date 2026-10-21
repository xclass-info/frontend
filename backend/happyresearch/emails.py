"""Every email the site sends, via Gmail SMTP (Flask-Mail)."""
from html import escape

from flask import current_app
from flask_mail import Message

from .extensions import mail

_SIGNOFF = """
  <p>Best regards,<br/>The HappyResearch Team<br/><a href="https://happyresearch.org">www.happyresearch.org</a></p>
"""


def _wrap(body):
    return f"""
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
{body}
</div>
"""


def _button(href, label):
    return f"""
  <p style="text-align:center; margin: 32px 0;">
    <a href="{escape(href)}" style="background:#2f6175; color:#ffffff; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
      {escape(label)}
    </a>
  </p>"""


def send(subject, to, html, reply_to=None):
    msg = Message(subject, recipients=[to], reply_to=reply_to)
    msg.html = html
    mail.send(msg)


def _frontend(path):
    return current_app.config["FRONTEND_URL"] + path


def send_account_verification(to_email, to_name, verify_link):
    send(
        "Welcome to HappyResearch – Verify Your Email",
        to_email,
        _wrap(f"""
  <p>Hello {escape(to_name or "there")},</p>
  <p>Welcome to HappyResearch!</p>
  <p>Thank you for joining our community of curious minds, aspiring researchers, and academic mentors.</p>
  <p>To complete your registration and activate your account, please verify your email address by clicking the button below.</p>
  {_button(verify_link, "Verify My Email Address")}
  <p style="font-size:13px; color:#666;">For your security, this verification link can only be used once.</p>
  <p style="font-size:13px; color:#666;">If you did not create a HappyResearch account, you can safely ignore this email.</p>
  <p>We look forward to supporting your research journey!</p>
  {_SIGNOFF}"""),
    )


def account_verify_link(kind, uid, token):
    return _frontend(f"/verify-account-email?kind={kind}&uid={uid}&token={token}")


def send_password_reset(to_email, token):
    link = _frontend(f"/reset-password?token={token}")
    send(
        "Reset your HappyResearch password",
        to_email,
        _wrap(f"""
  <p>Hello,</p>
  <p>We received a request to reset the password for your HappyResearch account.</p>
  {_button(link, "Choose a New Password")}
  <p style="font-size:13px; color:#666;">This link expires in 1 hour and can only be used once.</p>
  <p style="font-size:13px; color:#666;">If you didn't ask to reset your password, you can safely ignore this email - your password won't change.</p>
  {_SIGNOFF}"""),
    )


def send_work_email_verification(to_email, mentor_name, uid, token):
    link = _frontend(f"/verify-mentor-email?uid={uid}&token={token}")
    send(
        "Verify your work email for HappyResearch",
        to_email,
        _wrap(f"""
  <p>Hi {escape(mentor_name or "there")},</p>
  <p>Click the button below to verify this is your work email and continue your mentor application.</p>
  {_button(link, "Verify Work Email")}
  <p style="font-size:13px; color:#666;">If you didn't request this, you can ignore this email.</p>
  {_SIGNOFF}"""),
    )


def send_booking_confirmation(to_email, to_name, booking):
    rows = [
        ("Mentor", booking.teacherName),
        ("Student", booking.studentName),
        ("Date", booking.date),
        ("Time", booking.time),
        ("Duration", f"{booking.duration} minutes" if booking.duration else None),
    ]
    details = "".join(
        f"<tr><td style='padding:4px 12px 4px 0; color:#666;'>{label}</td><td><strong>{escape(str(v))}</strong></td></tr>"
        for label, v in rows
        if v
    )
    send(
        "✅ Your HappyResearch Session is Confirmed!",
        to_email,
        _wrap(f"""
  <p>Hi {escape(to_name or "there")},</p>
  <p>Your 1-on-1 session has been confirmed.</p>
  <table style="font-size:14px; margin: 16px 0;">{details}</table>
  {_button(booking.meeting_link, "Join the Session") if booking.meeting_link else ""}
  <p style="font-size:13px; color:#666;">Use the same link at the scheduled time. It works in any modern browser - no download needed.</p>
  {_SIGNOFF}"""),
    )


def send_team_message(subject, from_name, from_email, message):
    """Contact Us / On-demand Learning submissions, to the team inbox. Reply
    goes straight to the visitor."""
    body = escape(message).replace("\n", "<br/>")
    send(
        subject or "New message from happyresearch.org",
        current_app.config["TEAM_INBOX"],
        _wrap(f"""
  <p><strong>From:</strong> {escape(from_name)} &lt;{escape(from_email)}&gt;</p>
  <p><strong>Subject:</strong> {escape(subject or "")}</p>
  <hr style="border:none; border-top:1px solid #eee;"/>
  <p>{body}</p>"""),
        reply_to=from_email,
    )
