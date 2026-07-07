from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from ..models import Admin

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/login")
def login():
    data = request.json or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    admin = Admin.query.filter_by(username=username).first()
    if not admin or not admin.check_password(password):
        return jsonify({"error": "Invalid username or password"}), 401

    token = create_access_token(identity=admin.username)
    return jsonify({"access_token": token, "username": admin.username})


@auth_bp.get("/me")
@jwt_required()
def me():
    return jsonify({"username": get_jwt_identity()})
