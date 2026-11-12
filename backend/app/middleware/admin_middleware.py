from functools import wraps
from flask import g
from app.middleware.auth_middleware import token_required
from app.utils.responses import error_response

def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        current_user = getattr(g, "current_user", None)
        if not current_user or current_user.get("role") != "admin":
            return error_response("Access forbidden: Administrator privileges required", status_code=403)
        return f(*args, **kwargs)
    return decorated
