import datetime
from bson import ObjectId
from app.config.database import Database
from app.utils.security import hash_password, verify_password, generate_token

class AuthService:
    @staticmethod
    def register_user(data: dict) -> dict:
        db = Database.get_db()
        email = data.get("email", "").strip().lower()
        mobile = data.get("mobile", "").strip()
        full_name = data.get("fullName", "").strip()
        password = data.get("password", "")
        state = data.get("state", "").strip()
        district = data.get("district", "").strip()
        role = data.get("role", "user")

        if not email or not password or not full_name:
            raise ValueError("Full name, email, and password are required")

        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters")

        # Check existing email
        if db.users.find_one({"email": email}):
            raise ValueError("An account with this email address already exists")

        # Check existing mobile if provided
        if mobile and db.users.find_one({"mobile": mobile}):
            raise ValueError("An account with this mobile number already exists")

        now = datetime.datetime.now(datetime.timezone.utc)
        user_doc = {
            "fullName": full_name,
            "email": email,
            "mobile": mobile,
            "passwordHash": hash_password(password),
            "role": role if role in ["admin", "user"] else "user",
            "state": state,
            "district": district,
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        }

        result = db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)

        # Log activity
        db.activity_logs.insert_one({
            "userId": user_id,
            "action": "REGISTER",
            "description": f"User {email} registered successfully",
            "timestamp": now
        })

        token = generate_token(user_id, email, user_doc["role"])

        return {
            "token": token,
            "user": {
                "id": user_id,
                "fullName": full_name,
                "email": email,
                "mobile": mobile,
                "role": user_doc["role"],
                "state": state,
                "district": district
            }
        }

    @staticmethod
    def login_user(data: dict) -> dict:
        db = Database.get_db()
        login_identifier = data.get("identifier") or data.get("email") or ""
        login_identifier = login_identifier.strip()
        password = data.get("password", "")

        if not login_identifier or not password:
            raise ValueError("Email/mobile and password are required")

        user = db.users.find_one({
            "$or": [
                {"email": login_identifier.lower()},
                {"mobile": login_identifier}
            ]
        })

        if not user:
            raise ValueError("Invalid credentials")

        if not user.get("isActive", True):
            raise ValueError("Your account has been deactivated. Please contact support.")

        if not verify_password(password, user.get("passwordHash", "")):
            raise ValueError("Invalid credentials")

        user_id = str(user["_id"])
        token = generate_token(user_id, user["email"], user.get("role", "user"))

        # Log activity
        db.activity_logs.insert_one({
            "userId": user_id,
            "action": "LOGIN",
            "description": "User logged in",
            "timestamp": datetime.datetime.now(datetime.timezone.utc)
        })

        return {
            "token": token,
            "user": {
                "id": user_id,
                "fullName": user.get("fullName"),
                "email": user.get("email"),
                "mobile": user.get("mobile"),
                "role": user.get("role", "user"),
                "state": user.get("state"),
                "district": user.get("district")
            }
        }

    @staticmethod
    def get_profile(user_id: str) -> dict:
        db = Database.get_db()
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise ValueError("User not found")
        return {
            "id": str(user["_id"]),
            "fullName": user.get("fullName"),
            "email": user.get("email"),
            "mobile": user.get("mobile"),
            "role": user.get("role", "user"),
            "state": user.get("state"),
            "district": user.get("district"),
            "createdAt": user.get("createdAt")
        }

    @staticmethod
    def update_profile(user_id: str, data: dict) -> dict:
        db = Database.get_db()
        updates = {}
        for field in ["fullName", "mobile", "state", "district"]:
            if field in data:
                updates[field] = data[field].strip() if isinstance(data[field], str) else data[field]

        updates["updatedAt"] = datetime.datetime.now(datetime.timezone.utc)
        db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})

        # Log activity
        db.activity_logs.insert_one({
            "userId": user_id,
            "action": "UPDATE_PROFILE",
            "description": "User profile updated",
            "timestamp": updates["updatedAt"]
        })

        return AuthService.get_profile(user_id)

    @staticmethod
    def change_password(user_id: str, current_password: str, new_password: str):
        db = Database.get_db()
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise ValueError("User not found")

        if not verify_password(current_password, user.get("passwordHash", "")):
            raise ValueError("Current password is incorrect")

        if len(new_password) < 6:
            raise ValueError("New password must be at least 6 characters")

        now = datetime.datetime.now(datetime.timezone.utc)
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"passwordHash": hash_password(new_password), "updatedAt": now}}
        )

        db.activity_logs.insert_one({
            "userId": user_id,
            "action": "CHANGE_PASSWORD",
            "description": "User changed password",
            "timestamp": now
        })
