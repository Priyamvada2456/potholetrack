from flask import Blueprint, request, jsonify, current_app, url_for
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models import Report, STATUS_VALUES, SEVERITY_VALUES
from ..utils import haversine_meters, save_upload

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


def _photo_url(filename):
    return url_for("static_uploads", filename=filename, _external=False)


@reports_bp.get("")
def list_reports():
    """
    List reports, with optional filters used by both the public map and
    the admin dashboard.
    Query params: status, severity, bbox=minLat,minLng,maxLat,maxLng
    """
    query = Report.query

    status = request.args.get("status")
    if status:
        if status not in STATUS_VALUES:
            return jsonify({"error": f"invalid status filter '{status}'"}), 400
        query = query.filter_by(status=status)

    severity = request.args.get("severity")
    if severity:
        if severity not in SEVERITY_VALUES:
            return jsonify({"error": f"invalid severity filter '{severity}'"}), 400
        query = query.filter_by(severity=severity)

    bbox = request.args.get("bbox")
    if bbox:
        try:
            min_lat, min_lng, max_lat, max_lng = map(float, bbox.split(","))
            query = query.filter(
                Report.latitude.between(min_lat, max_lat),
                Report.longitude.between(min_lng, max_lng),
            )
        except ValueError:
            return jsonify({"error": "bbox must be minLat,minLng,maxLat,maxLng"}), 400

    reports = query.order_by(Report.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reports])


@reports_bp.get("/<int:report_id>")
def get_report(report_id):
    report = Report.query.get_or_404(report_id)
    return jsonify(report.to_dict())


@reports_bp.get("/nearby")
def nearby_reports():
    """
    Used by the frontend BEFORE submitting a new report, to warn the citizen
    "this pothole may already be reported" instead of creating a duplicate.
    Only checks reports that are still open (not yet fixed).
    """
    try:
        lat = float(request.args.get("lat"))
        lng = float(request.args.get("lng"))
    except (TypeError, ValueError):
        return jsonify({"error": "lat and lng query params are required"}), 400

    radius = current_app.config["DUPLICATE_RADIUS_METERS"]

    candidates = Report.query.filter(Report.status != "fixed").all()
    nearby = [
        r.to_dict()
        for r in candidates
        if haversine_meters(lat, lng, r.latitude, r.longitude) <= radius
    ]
    return jsonify(nearby)


@reports_bp.post("")
def create_report():
    """
    Citizen submits a new report. Expects multipart/form-data:
      photo (file), latitude, longitude, description (optional),
      force_duplicate ("true" to submit anyway after seeing a duplicate warning)
    """
    try:
        latitude = float(request.form.get("latitude"))
        longitude = float(request.form.get("longitude"))
    except (TypeError, ValueError):
        return jsonify({"error": "latitude and longitude are required numbers"}), 400

    description = request.form.get("description", "").strip() or None
    force_duplicate = request.form.get("force_duplicate", "false").lower() == "true"

    # Duplicate check (server-side, so it can't be bypassed by skipping the
    # frontend warning dialog).
    if not force_duplicate:
        radius = current_app.config["DUPLICATE_RADIUS_METERS"]
        existing_open = Report.query.filter(Report.status != "fixed").all()
        duplicate = next(
            (
                r
                for r in existing_open
                if haversine_meters(latitude, longitude, r.latitude, r.longitude)
                <= radius
            ),
            None,
        )
        if duplicate:
            return (
                jsonify(
                    {
                        "duplicate_warning": True,
                        "existing_report": duplicate.to_dict(),
                        "message": (
                            "A pothole is already reported within "
                            f"{int(radius)}m of this location. Confirm the existing "
                            "report instead, or resubmit with force_duplicate=true."
                        ),
                    }
                ),
                409,
            )

    try:
        filename = save_upload(
            request.files.get("photo"),
            current_app.config["UPLOAD_FOLDER"],
            current_app.config["ALLOWED_EXTENSIONS"],
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    report = Report(
        photo_url=filename,
        latitude=latitude,
        longitude=longitude,
        description=description,
        status="reported",
        severity="unknown",
    )
    db.session.add(report)
    db.session.commit()

    return jsonify(report.to_dict()), 201


@reports_bp.post("/<int:report_id>/upvote")
def upvote_report(report_id):
    """Citizens confirm an existing report is still there / genuine."""
    report = Report.query.get_or_404(report_id)
    report.upvote_count += 1
    db.session.commit()
    return jsonify(report.to_dict())


@reports_bp.patch("/<int:report_id>/status")
@jwt_required()
def update_status(report_id):
    """Admin-only: move a report through the repair pipeline."""
    report = Report.query.get_or_404(report_id)
    data = request.form if request.form else (request.json or {})

    new_status = data.get("status")
    if new_status and new_status not in STATUS_VALUES:
        return jsonify({"error": f"invalid status '{new_status}'"}), 400

    new_severity = data.get("severity")
    if new_severity and new_severity not in SEVERITY_VALUES:
        return jsonify({"error": f"invalid severity '{new_severity}'"}), 400

    if new_status:
        report.status = new_status
    if new_severity:
        report.severity = new_severity

    after_photo = request.files.get("after_photo") if request.files else None
    if after_photo:
        try:
            filename = save_upload(
                after_photo,
                current_app.config["UPLOAD_FOLDER"],
                current_app.config["ALLOWED_EXTENSIONS"],
            )
            report.after_photo_url = filename
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    db.session.commit()
    return jsonify(report.to_dict())


@reports_bp.get("/stats")
def public_stats():
    """Public transparency numbers: total reports, % fixed, avg fix time."""
    total = Report.query.count()
    fixed = Report.query.filter_by(status="fixed").count()
    pct_fixed = round((fixed / total) * 100, 1) if total else 0.0

    fixed_reports = Report.query.filter_by(status="fixed").all()
    if fixed_reports:
        avg_seconds = sum(
            (r.updated_at - r.created_at).total_seconds() for r in fixed_reports
        ) / len(fixed_reports)
        avg_fix_days = round(avg_seconds / 86400, 1)
    else:
        avg_fix_days = None

    return jsonify(
        {
            "total_reports": total,
            "fixed_reports": fixed,
            "percent_fixed": pct_fixed,
            "average_fix_time_days": avg_fix_days,
        }
    )
