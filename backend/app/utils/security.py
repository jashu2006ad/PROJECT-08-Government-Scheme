import datetime
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from app.config.settings import Config

def hash_password(password: str) -> str:
    """Generate secure salted password hash."""
    return generate_password_hash(password, method="scrypt")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored hash."""
    if not hashed_password:
        return False
    return check_password_hash(hashed_password, plain_password)

def generate_token(user_id: str, email: str, role: str) -> str:
    """Generate JWT auth token."""
    payload = {
        "userId": str(user_id),
        "email": email,
        "role": role,
        "exp": datetime.datetime.now(datetime.timezone.utc) + Config.JWT_ACCESS_TOKEN_EXPIRES,
        "iat": datetime.datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")

def decode_token(token: str) -> dict:
    """Decode and validate JWT token."""
    try:
        decoded = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        return decoded
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid authentication token")
