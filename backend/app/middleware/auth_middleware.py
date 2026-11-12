from functools import wraps
from flask import request, g
from bson import ObjectId
from app.utils.security import decode_token
from app.utils.responses import error_response
from app.config.database import Database

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return error_response("Authorization token is missing", status_code=401)
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return error_response("Invalid Authorization header format. Format: Bearer <token>", status_code=401)
        
        token = parts[1]
        try:
            payload = decode_token(token)
            user_id = payload.get("userId")
            if not user_id:
                return error_response("Invalid token payload", status_code=401)
            
            db = Database.get_db()
            user = db.users.find_one({"_id": ObjectId(user_id), "isActive": True})
            if not user:
                return error_response("User not found or account deactivated", status_code=401)
            
            g.current_user = user
            g.user_id = str(user["_id"])
        except ValueError as e:
            return error_response(str(e), status_code=401)
        except Exception as e:
            return error_response(f"Authentication error: {str(e)}", status_code=401)
        
        return f(*args, **kwargs)
    return decorated

def optional_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        g.current_user = None
        g.user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == "bearer":
                try:
                    payload = decode_token(parts[1])
                    user_id = payload.get("userId")
                    if user_id:
                        db = Database.get_db()
                        user = db.users.find_one({"_id": ObjectId(user_id), "isActive": True})
                        if user:
                            g.current_user = user
                            g.user_id = str(user["_id"])
                except Exception:
                    pass
        return f(*args, **kwargs)
    return decorated
