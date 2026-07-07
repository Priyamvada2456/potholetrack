import os
import click
from flask import Flask, send_from_directory

from .config import Config
from .extensions import db, jwt, bcrypt, cors


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Serve uploaded photos. In production you'd put these behind
    # nginx/S3/Cloudinary instead of Flask, but this keeps local dev simple.
    @app.route("/uploads/<path:filename>")
    def static_uploads(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    from .routes.reports import reports_bp
    from .routes.auth import auth_bp

    app.register_blueprint(reports_bp)
    app.register_blueprint(auth_bp)

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    register_cli_commands(app)

    return app


def register_cli_commands(app):
    @app.cli.command("create-admin")
    @click.argument("username")
    @click.argument("password")
    def create_admin(username, password):
        """Usage: flask create-admin <username> <password>"""
        from .models import Admin

        if Admin.query.filter_by(username=username).first():
            click.echo(f"Admin '{username}' already exists.")
            return

        admin = Admin(username=username)
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        click.echo(f"Admin '{username}' created.")
