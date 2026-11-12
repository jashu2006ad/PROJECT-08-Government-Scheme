import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "govscheme-super-secret-key-change-in-prod-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "govscheme-jwt-secret-key-32bytes-secure")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # MongoDB Atlas connection
    MONGODB_URI = os.getenv("MONGODB_URI", "")
    DB_NAME = os.getenv("DB_NAME", "govscheme")
    
    # Environment & Host
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = FLASK_ENV == "development"
    
    # CORS
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://govscheme.vercel.app",
        FRONTEND_URL
    ]
