from flask import Blueprint, request, g
from app.services.application_service import ApplicationService
from app.middleware.auth_middleware import token_required
from app.utils.responses import success_response, error_response
from app.config.database import Database
from bson import ObjectId

app_bp = Blueprint("applications", __name__, url_prefix="/api")

@app_bp.route("/applications", methods=["POST"])
@token_required
def create_application():
    data = request.get_json() or {}
    try:
        record = ApplicationService.create_application_record(g.user_id, data)
        return success_response(record, "Application record saved successfully", status_code=201)
    except ValueError as e:
        return error_response(str(e), status_code=400)
    except Exception as e:
        return error_response(f"Error creating record: {str(e)}", status_code=500)

@app_bp.route("/applications", methods=["GET"])
@token_required
def get_applications():
    try:
        apps = ApplicationService.get_user_applications(g.user_id)
        return success_response(apps)
    except Exception as e:
        return error_response(f"Error retrieving applications: {str(e)}", status_code=500)

@app_bp.route("/applications/<app_id>", methods=["GET"])
@token_required
def get_application_by_id(app_id):
    try:
        is_admin = g.current_user.get("role") == "admin"
        app = ApplicationService.get_application_by_id(app_id, user_id=g.user_id, is_admin=is_admin)
        return success_response(app)
    except ValueError as e:
        return error_response(str(e), status_code=404)
    except Exception as e:
        return error_response(f"Error retrieving application: {str(e)}", status_code=500)

@app_bp.route("/applications/<app_id>", methods=["PUT"])
@token_required
def update_application(app_id):
    data = request.get_json() or {}
    try:
        updated = ApplicationService.update_application_record(app_id, g.user_id, data)
        return success_response(updated, "Application updated successfully")
    except ValueError as e:
        return error_response(str(e), status_code=400)
    except Exception as e:
        return error_response(f"Error updating application: {str(e)}", status_code=500)

@app_bp.route("/applications/<app_id>", methods=["DELETE"])
@token_required
def delete_application(app_id):
    db = Database.get_db()
    res = db.applications.delete_one({"_id": ObjectId(app_id), "userId": g.user_id})
    if res.deleted_count == 0:
        return error_response("Application not found or unauthorized", status_code=404)
    return success_response(message="Application record deleted")

# Document Checklist routes
@app_bp.route("/documents/<scheme_id>", methods=["GET"])
@token_required
def get_document_checklist(scheme_id):
    try:
        data = ApplicationService.get_document_checklist(g.user_id, scheme_id)
        return success_response(data)
    except Exception as e:
        return error_response(f"Error fetching document checklist: {str(e)}", status_code=500)

@app_bp.route("/documents/<scheme_id>", methods=["PUT"])
@token_required
def update_document_checklist(scheme_id):
    data = request.get_json() or {}
    docs = data.get("documents", [])
    try:
        res = ApplicationService.update_document_checklist(g.user_id, scheme_id, docs)
        return success_response(res, "Document checklist updated")
    except Exception as e:
        return error_response(f"Error saving checklist: {str(e)}", status_code=500)
