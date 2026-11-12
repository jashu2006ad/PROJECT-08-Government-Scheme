from flask import Blueprint, request, g
from app.services.auth_service import AuthService
from app.middleware.auth_middleware import token_required
from app.utils.responses import success_response, error_response
from app.config.database import Database
from bson import ObjectId

user_bp = Blueprint("users", __name__, url_prefix="/api/users")

@user_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():
    try:
        profile = AuthService.get_profile(g.user_id)
        return success_response(profile)
    except ValueError as e:
        return error_response(str(e), status_code=404)

@user_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    data = request.get_json() or {}
    try:
        updated = AuthService.update_profile(g.user_id, data)
        return success_response(updated, "Profile updated successfully")
    except ValueError as e:
        return error_response(str(e), status_code=400)

@user_bp.route("/change-password", methods=["PUT"])
@token_required
def change_password():
    data = request.get_json() or {}
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")
    if not current_password or not new_password:
        return error_response("Current and new passwords are required")

    try:
        AuthService.change_password(g.user_id, current_password, new_password)
        return success_response(message="Password changed successfully")
    except ValueError as e:
        return error_response(str(e), status_code=400)

@user_bp.route("/account", methods=["DELETE"])
@token_required
def delete_account():
    db = Database.get_db()
    db.users.update_one({"_id": ObjectId(g.user_id)}, {"$set": {"isActive": False}})
    return success_response(message="Account deactivated successfully")

@user_bp.route("/activity", methods=["GET"])
@token_required
def get_user_activity():
    db = Database.get_db()
    logs = list(db.activity_logs.find({"userId": g.user_id}).sort("timestamp", -1).limit(20))
    return success_response(logs)
