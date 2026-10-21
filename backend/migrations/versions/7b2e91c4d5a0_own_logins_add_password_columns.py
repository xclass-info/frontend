"""own logins again (no Firebase Auth): add password columns back

Existing users get no password (password_algo NULL), so they're asked to
reset it on their first login.

Revision ID: 7b2e91c4d5a0
Revises: 3a0fc499adf1
Create Date: 2026-10-21

"""
from alembic import op
import sqlalchemy as sa


revision = "7b2e91c4d5a0"
down_revision = "3a0fc499adf1"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column("password_hash", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("password_algo", sa.String(length=32), nullable=True))
        batch_op.add_column(sa.Column("password_salt", sa.Text(), nullable=True))
        batch_op.add_column(
            sa.Column("token_version", sa.Integer(), nullable=False, server_default="0")
        )
        batch_op.add_column(sa.Column("reset_token_hash", sa.String(length=64), nullable=True))
        batch_op.add_column(
            sa.Column("reset_token_expires", sa.DateTime(timezone=True), nullable=True)
        )
        batch_op.create_index(batch_op.f("ix_users_reset_token_hash"), ["reset_token_hash"], unique=False)


def downgrade():
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_users_reset_token_hash"))
        batch_op.drop_column("reset_token_expires")
        batch_op.drop_column("reset_token_hash")
        batch_op.drop_column("token_version")
        batch_op.drop_column("password_salt")
        batch_op.drop_column("password_algo")
        batch_op.drop_column("password_hash")
