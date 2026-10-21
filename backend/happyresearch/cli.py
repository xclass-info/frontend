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
