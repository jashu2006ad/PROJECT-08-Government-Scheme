import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from app.config.settings import Config
from app.config.database import Database
from app.utils.responses import error_response, success_response

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("govscheme")

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize CORS
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "Accept"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # Initialize Limiter
    limiter.init_app(app)

    # Initialize Database
    with app.app_context():
        try:
            Database.initialize()
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")

    # Register Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp
    from app.routes.scheme_routes import scheme_bp
    from app.routes.category_routes import category_bp
    from app.routes.eligibility_routes import eligibility_bp
    from app.routes.application_routes import app_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(scheme_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(eligibility_bp)
    app.register_blueprint(app_bp)
    app.register_blueprint(admin_bp)

    # Health Check Endpoint
    @app.route("/api/health", methods=["GET"])
    def health_check():
        db_status = "connected" if Database.db is not None else "disconnected"
        is_mock = getattr(Database, "is_mock", False)
        return success_response({
            "status": "online",
            "service": "GovScheme API",
            "version": "1.0.0",
            "database": {
                "status": db_status,
                "provider": "MongoDB Atlas" if not is_mock else "In-Memory Mock (Dev/Fallback)",
                "isMock": is_mock
            },
            "environment": Config.FLASK_ENV
        }, message="GovScheme API is operational")

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return error_response("The requested resource was not found on GovScheme server", status_code=404)

    @app.errorhandler(429)
    def ratelimit_handler(e):
        return error_response(f"Rate limit exceeded: {e.description}", status_code=429)

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal server error: {e}")
        return error_response("An internal server error occurred. Please try again later.", status_code=500)

    return app
