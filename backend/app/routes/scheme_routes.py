from flask import Blueprint, request, g
from app.services.scheme_service import SchemeService
from app.middleware.auth_middleware import token_required, optional_auth
from app.middleware.admin_middleware import admin_required
from app.utils.responses import success_response, error_response, paginated_response
from app.config.database import Database
from bson import ObjectId
import datetime

scheme_bp = Blueprint("schemes", __name__, url_prefix="/api")

@scheme_bp.route("/schemes", methods=["GET"])
@optional_auth
def get_all_schemes():
    params = request.args.to_dict()
    # Check if admin query param or user is admin
    if getattr(g, "current_user", None) and g.current_user.get("role") == "admin":
        params["isAdmin"] = True

    try:
        schemes, total, page, limit = SchemeService.get_schemes(params)
        return paginated_response(schemes, total, page, limit)
    except Exception as e:
        return error_response(f"Error fetching schemes: {str(e)}", status_code=500)

@scheme_bp.route("/schemes/search", methods=["GET"])
def search_schemes():
    q = request.args.get("q", "").strip()
    limit = int(request.args.get("limit", 6))
    if not q:
        return success_response([])

    db = Database.get_db()
    import re
    regex = re.compile(re.escape(q), re.IGNORECASE)
    results = list(db.schemes.find(
        {"$or": [{"schemeName": regex}, {"description": regex}, {"targetBeneficiaries": regex}], "isActive": True},
        {"schemeName": 1, "slug": 1, "targetBeneficiaries": 1, "benefits": 1, "categoryId": 1}
    ).limit(limit))

    return success_response(results)

@scheme_bp.route("/schemes/stats", methods=["GET"])
def get_stats():
    try:
        stats = SchemeService.get_portal_stats()
        return success_response(stats)
    except Exception as e:
        return error_response(f"Error fetching stats: {str(e)}", status_code=500)

@scheme_bp.route("/schemes/<identifier>", methods=["GET"])
def get_scheme_by_id(identifier):
    try:
        scheme = SchemeService.get_scheme_by_id_or_slug(identifier)
        return success_response(scheme)
    except ValueError as e:
        return error_response(str(e), status_code=404)
    except Exception as e:
        return error_response(f"Error fetching scheme: {str(e)}", status_code=500)

@scheme_bp.route("/schemes/category/<categoryId>", methods=["GET"])
def get_schemes_by_category(categoryId):
    params = {"categoryId": categoryId, "limit": 20}
    try:
        schemes, total, page, limit = SchemeService.get_schemes(params)
        return paginated_response(schemes, total, page, limit)
    except Exception as e:
        return error_response(f"Error fetching schemes: {str(e)}", status_code=500)

# Saved Schemes routes
@scheme_bp.route("/saved-schemes", methods=["GET"])
@token_required
def get_saved_schemes():
    try:
        schemes = SchemeService.get_saved_schemes(g.user_id)
        return success_response(schemes)
    except Exception as e:
        return error_response(f"Error fetching saved schemes: {str(e)}", status_code=500)

@scheme_bp.route("/saved-schemes", methods=["POST"])
@token_required
def save_scheme():
    data = request.get_json() or {}
    scheme_id = data.get("schemeId")
    if not scheme_id:
        return error_response("Scheme ID is required")
    try:
        result = SchemeService.save_scheme(g.user_id, scheme_id)
        return success_response(result)
    except Exception as e:
        return error_response(f"Error saving scheme: {str(e)}", status_code=500)

@scheme_bp.route("/saved-schemes/<scheme_id>", methods=["DELETE"])
@token_required
def unsave_scheme(scheme_id):
    try:
        result = SchemeService.unsave_scheme(g.user_id, scheme_id)
        return success_response(result)
    except Exception as e:
        return error_response(f"Error removing saved scheme: {str(e)}", status_code=500)
