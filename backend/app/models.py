from datetime import datetime, timezone
from .extensions import db, bcrypt

# --- Enumerated values (kept as plain strings + CHECK constraints so the
# schema stays simple and portable, rather than using native Postgres ENUM
# types which are annoying to alter later). ---

STATUS_VALUES = ("reported", "verified", "in_progress", "fixed")
SEVERITY_VALUES = ("unknown", "small", "medium", "large")


def utcnow():
    return datetime.now(timezone.utc)


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)

    photo_url = db.Column(db.String(512), nullable=False)
    after_photo_url = db.Column(db.String(512), nullable=True)

    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    description = db.Column(db.Text, nullable=True)

    status = db.Column(db.String(20), nullable=False, default="reported")
    severity = db.Column(db.String(20), nullable=False, default="unknown")

    upvote_count = db.Column(db.Integer, nullable=False, default=0)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    __table_args__ = (
        db.CheckConstraint(f"status IN {STATUS_VALUES}", name="ck_reports_status"),
        db.CheckConstraint(
            f"severity IN {SEVERITY_VALUES}", name="ck_reports_severity"
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "photo_url": self.photo_url,
            "after_photo_url": self.after_photo_url,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "description": self.description,
            "status": self.status,
            "severity": self.severity,
            "upvote_count": self.upvote_count,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class Admin(db.Model):
    __tablename__ = "admins"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    def set_password(self, raw_password):
        self.password_hash = bcrypt.generate_password_hash(raw_password).decode("utf-8")

    def check_password(self, raw_password):
        return bcrypt.check_password_hash(self.password_hash, raw_password)
