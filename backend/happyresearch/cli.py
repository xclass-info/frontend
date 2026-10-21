import click


def register(app):
    @app.cli.command("import-firebase")
    @click.option("--auth-export", type=click.Path(exists=True), help="users.json from `firebase auth:export`.")
    @click.option("--skip-files", is_flag=True, help="Don't copy Firebase Storage files.")
    @click.confirmation_option(
        prompt="This REPLACES all content tables with Firebase's data. Only run before cutover. Continue?"
    )
    def import_firebase(auth_export, skip_files):
        """Copy all data from the old Firebase project (safe to re-run before cutover)."""
        from .firebase_import import run

        run(auth_export=auth_export, skip_files=skip_files, log=click.echo)
