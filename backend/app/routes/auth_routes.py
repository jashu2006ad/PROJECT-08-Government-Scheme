from flask import Blueprint, request, g
from app.services.auth_service import AuthService
from app.middleware.auth_middleware import token_required
from app.utils.responses import success_response, error_response
from app.config.database import Database
import secrets
import datetime

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    try:
        res = AuthService.register_user(data)
        return success_response(res, "Registration successful", status_code=201)
    except ValueError as e:
        return error_response(str(e), status_code=400)
    except Exception as e:
        return error_response(f"Registration failed: {str(e)}", status_code=500)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    try:
        res = AuthService.login_user(data)
        return success_response(res, "Login successful")
    except ValueError as e:
        return error_response(str(e), status_code=401)
    except Exception as e:
        return error_response(f"Login failed: {str(e)}", status_code=500)

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():
    user = g.current_user
    return success_response({
        "id": str(user["_id"]),
        "fullName": user.get("fullName"),
        "email": user.get("email"),
        "mobile": user.get("mobile"),
        "role": user.get("role", "user"),
        "state": user.get("state"),
        "district": user.get("district"),
        "createdAt": user.get("createdAt")
    })

@auth_bp.route("/logout", methods=["POST"])
def logout():
    # Stateless JWT logout acknowledged by client clearing token
    return success_response(message="Logged out successfully")

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    if not email:
        return error_response("Email address is required")

    db = Database.get_db()
    user = db.users.find_one({"email": email})
    if not user:
        # Prevent email enumeration by returning friendly success message
        return success_response(message="If an account exists with this email, a reset token has been issued.")

    token = secrets.token_urlsafe(32)
    now = datetime.datetime.now(datetime.timezone.utc)
    db.password_reset_tokens.insert_one({
        "userId": str(user["_id"]),
        "tokenHash": token,
        "expiresAt": now + datetime.timedelta(hours=1),
        "used": False,
        "createdAt": now
    })

    return success_response({
        "resetToken": token,
        "instructions": "In production this reset link is sent via official email/SMS."
    }, message="Reset token generated successfully.")

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json() or {}
    token = data.get("token")
    new_password = data.get("newPassword")

    if not token or not new_password:
        return error_response("Token and new password are required")

    if len(new_password) < 6:
        return error_response("Password must be at least 6 characters")

    db = Database.get_db()
    now = datetime.datetime.now(datetime.timezone.utc)
    token_doc = db.password_reset_tokens.find_one({
        "tokenHash": token,
        "used": False,
        "expiresAt": {"$gt": now}
    })

    if not token_doc:
        return error_response("Invalid or expired password reset token", status_code=400)

    user_id = token_doc["userId"]
    from app.utils.security import hash_password
    from bson import ObjectId

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"passwordHash": hash_password(new_password), "updatedAt": now}}
    )
    db.password_reset_tokens.update_one(
        {"_id": token_doc["_id"]},
        {"$set": {"used": True}}
    )

    return success_response(message="Password reset successfully. You can now login with your new password.")
