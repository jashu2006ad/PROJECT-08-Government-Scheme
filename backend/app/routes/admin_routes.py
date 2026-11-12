import datetime
from flask import Blueprint, request, g
from app.middleware.admin_middleware import admin_required
from app.services.application_service import ApplicationService
from app.utils.responses import success_response, error_response, paginated_response
from app.config.database import Database
from bson import ObjectId

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/dashboard", methods=["GET"])
@admin_required
def get_admin_dashboard():
    db = Database.get_db()
    total_users = db.users.count_documents({})
    active_users = db.users.count_documents({"isActive": True})
    total_schemes = db.schemes.count_documents({})
    active_schemes = db.schemes.count_documents({"isActive": True})
    inactive_schemes = total_schemes - active_schemes
    total_applications = db.applications.count_documents({})
    total_eligibility_checks = db.eligibility_results.count_documents({})

    # Status distribution
    status_counts = {}
    for st in ApplicationService.VALID_STATUSES:
        status_counts[st] = db.applications.count_documents({"currentStatus": st})

    # Recent 5 applications
    recent_apps = list(db.applications.find({}).sort("createdAt", -1).limit(5))
    # Recent 5 registered users
    recent_users = list(db.users.find({}, {"passwordHash": 0}).sort("createdAt", -1).limit(5))

    return success_response({
        "metrics": {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "totalSchemes": total_schemes,
            "activeSchemes": active_schemes,
            "inactiveSchemes": inactive_schemes,
            "totalApplications": total_applications,
            "totalEligibilityChecks": total_eligibility_checks
        },
        "statusDistribution": status_counts,
        "recentApplications": recent_apps,
        "recentUsers": recent_users
    })

@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_all_users():
    db = Database.get_db()
    search = request.args.get("search", "").strip()
    page = max(1, int(request.args.get("page", 1)))
    limit = min(50, max(1, int(request.args.get("limit", 15))))
    skip = (page - 1) * limit

    query = {}
    if search:
        import re
        reg = re.compile(re.escape(search), re.IGNORECASE)
        query["$or"] = [{"fullName": reg}, {"email": reg}, {"mobile": reg}]

    total = db.users.count_documents(query)
    users = list(db.users.find(query, {"passwordHash": 0}).sort("createdAt", -1).skip(skip).limit(limit))

    return paginated_response(users, total, page, limit)

@admin_bp.route("/users/<user_id>/status", methods=["PUT"])
@admin_required
def toggle_user_status(user_id):
    data = request.get_json() or {}
    is_active = bool(data.get("isActive", True))
    db = Database.get_db()
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"isActive": is_active, "updatedAt": datetime.datetime.now(datetime.timezone.utc)}})
    return success_response(message=f"User status updated to {'Active' if is_active else 'Deactivated'}")

@admin_bp.route("/schemes", methods=["GET"])
@admin_required
def get_admin_schemes():
    db = Database.get_db()
    schemes = list(db.schemes.find({}).sort("updatedAt", -1))
    return success_response(schemes)

@admin_bp.route("/schemes", methods=["POST"])
@admin_required
def create_scheme():
    data = request.get_json() or {}
    name = data.get("schemeName", "").strip()
    if not name:
        return error_response("Scheme name is required")

    db = Database.get_db()
    now = datetime.datetime.now(datetime.timezone.utc)
    
    # Generate slug
    import re
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', name).strip('-').lower()
    # Check duplicate slug
    if db.schemes.find_one({"slug": slug}):
        slug = f"{slug}-{int(now.timestamp())}"

    # Category handling
    cat_id = data.get("categoryId")
    if cat_id:
        try:
            cat_id = ObjectId(cat_id)
        except Exception:
            pass

    doc = {
        "schemeName": name,
        "slug": slug,
        "description": data.get("description", ""),
        "objectives": data.get("objectives", []),
        "categoryId": cat_id,
        "benefits": data.get("benefits", ""),
        "targetBeneficiaries": data.get("targetBeneficiaries", ""),
        "eligibility": data.get("eligibility", {}),
        "requiredDocuments": data.get("requiredDocuments", []),
        "applicationProcedure": data.get("applicationProcedure", []),
        "applicationUrl": data.get("applicationUrl", ""),
        "officialSourceUrl": data.get("officialSourceUrl", ""),
        "applicableStates": data.get("applicableStates", ["All India"]),
        "isActive": bool(data.get("isActive", True)),
        "lastVerifiedAt": now,
        "createdAt": now,
        "updatedAt": now
    }

    res = db.schemes.insert_one(doc)
    doc["_id"] = res.inserted_id

    return success_response(doc, "Scheme created successfully", status_code=201)

@admin_bp.route("/schemes/<scheme_id>", methods=["PUT"])
@admin_required
def update_scheme(scheme_id):
    data = request.get_json() or {}
    db = Database.get_db()
    now = datetime.datetime.now(datetime.timezone.utc)

    updates = {}
    allowed_fields = [
        "schemeName", "description", "objectives", "categoryId",
        "benefits", "targetBeneficiaries", "eligibility", "requiredDocuments",
        "applicationProcedure", "applicationUrl", "officialSourceUrl",
        "applicableStates", "isActive"
    ]

    for f in allowed_fields:
        if f in data:
            if f == "categoryId" and data[f]:
                try:
                    updates[f] = ObjectId(data[f])
                except Exception:
                    updates[f] = data[f]
            else:
                updates[f] = data[f]

    updates["updatedAt"] = now
    if data.get("verified", False):
        updates["lastVerifiedAt"] = now

    db.schemes.update_one({"_id": ObjectId(scheme_id)}, {"$set": updates})
    updated = db.schemes.find_one({"_id": ObjectId(scheme_id)})
    return success_response(updated, "Scheme updated successfully")

@admin_bp.route("/schemes/<scheme_id>", methods=["DELETE"])
@admin_required
def delete_scheme(scheme_id):
    db = Database.get_db()
    db.schemes.update_one({"_id": ObjectId(scheme_id)}, {"$set": {"isActive": False, "updatedAt": datetime.datetime.now(datetime.timezone.utc)}})
    return success_response(message="Scheme deactivated successfully")

@admin_bp.route("/applications", methods=["GET"])
@admin_required
def get_all_applications():
    db = Database.get_db()
    status_filter = request.args.get("status")
    query = {}
    if status_filter and status_filter != "all":
        query["currentStatus"] = status_filter

    page = max(1, int(request.args.get("page", 1)))
    limit = min(50, max(1, int(request.args.get("limit", 20))))
    skip = (page - 1) * limit

    total = db.applications.count_documents(query)
    apps = list(db.applications.find(query).sort("updatedAt", -1).skip(skip).limit(limit))

    # Populate citizen email/name
    for a in apps:
        try:
            u = db.users.find_one({"_id": ObjectId(a.get("userId"))})
            if u:
                a["user"] = {
                    "fullName": u.get("fullName"),
                    "email": u.get("email"),
                    "mobile": u.get("mobile"),
                    "state": u.get("state")
                }
        except Exception:
            pass

    return paginated_response(apps, total, page, limit)

@admin_bp.route("/applications/<app_id>/status", methods=["PUT"])
@admin_required
def update_application_status(app_id):
    data = request.get_json() or {}
    status = data.get("status")
    notes = data.get("notes", "")

    if not status:
        return error_response("New status is required")

    try:
        updated = ApplicationService.admin_update_status(app_id, status, notes, g.current_user)
        return success_response(updated, "Application status updated successfully")
    except ValueError as e:
        return error_response(str(e), status_code=400)
    except Exception as e:
        return error_response(f"Error updating status: {str(e)}", status_code=500)
