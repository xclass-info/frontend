import click


def register(app):
    @app.cli.command("move-files-to-s3")
    def move_files_to_s3():
        """Copy files stored in Postgres to the configured S3/R2 bucket, then
        remove them from Postgres. Database references don't change."""
        from . import storage
        from .extensions import db
        from .models import StoredFile

        if not storage.use_s3():
            raise click.ClickException("Set S3_BUCKET, S3_ENDPOINT_URL, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY first.")
        keys = [k for (k,) in db.session.query(StoredFile.key).all()]
        for key in keys:
            row = db.session.get(StoredFile, key)
            storage.put(key, row.data, row.contentType)
            if not storage.exists(key):
                raise click.ClickException(f"Upload of {key} could not be confirmed; stopping.")
            db.session.delete(row)
            db.session.commit()
            click.echo(f"moved {key}")
        click.echo(f"done - {len(keys)} file(s) moved.")

    @app.cli.command("import-firebase-passwords")
    @click.argument("export_file", type=click.Path(exists=True))
    def import_firebase_passwords(export_file):
        """Let users keep their old Firebase password.

        EXPORT_FILE is from `firebase auth:export users.json --format=json`
        (project xclass-3e2f3); also set the FIREBASE_HASH_* config vars from
        Firebase console > Authentication > Users > ⋮ > Password hash
        parameters. Only accounts that haven't set a new password yet are
        touched. Matches by Firebase uid, then by email.
        """
        import json

        from .extensions import db
        from .models import User

        with open(export_file) as f:
            exported = json.load(f).get("users", [])
        updated = 0
        for u in exported:
            if not u.get("passwordHash"):
                continue
            user = db.session.get(User, u["localId"])
            if not user and u.get("email"):
                user = User.query.filter_by(email=u["email"].strip().lower()).first()
            if not user or user.passwordAlgo is not None:
                continue
            user.passwordHash = u["passwordHash"]
            user.passwordSalt = u.get("salt")
            user.passwordAlgo = "firebase_scrypt"
            updated += 1
        db.session.commit()
        click.echo(f"done - {updated} account(s) can now log in with their old password.")
