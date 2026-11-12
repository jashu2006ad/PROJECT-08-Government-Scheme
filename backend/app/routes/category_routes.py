from flask import Blueprint, request
from app.middleware.admin_middleware import admin_required
from app.utils.responses import success_response, error_response
from app.config.database import Database
from bson import ObjectId
import datetime

category_bp = Blueprint("categories", __name__, url_prefix="/api/categories")

@category_bp.route("", methods=["GET"])
def get_categories():
    db = Database.get_db()
    categories = list(db.categories.find({"isActive": True}).sort("categoryName", 1))
    return success_response(categories)

@category_bp.route("", methods=["POST"])
@admin_required
def create_category():
    data = request.get_json() or {}
    name = data.get("categoryName", "").strip()
    if not name:
        return error_response("Category name is required")

    db = Database.get_db()
    now = datetime.datetime.now(datetime.timezone.utc)
    cat = {
        "categoryName": name,
        "description": data.get("description", ""),
        "icon": data.get("icon", "Folder"),
        "isActive": True,
        "createdAt": now
    }
    result = db.categories.insert_one(cat)
    cat["_id"] = result.inserted_id
    return success_response(cat, "Category created successfully", status_code=201)

@category_bp.route("/<category_id>", methods=["PUT"])
@admin_required
def update_category(category_id):
    data = request.get_json() or {}
    db = Database.get_db()
    updates = {}
    if "categoryName" in data:
        updates["categoryName"] = data["categoryName"].strip()
    if "description" in data:
        updates["description"] = data["description"].strip()
    if "icon" in data:
        updates["icon"] = data["icon"]
    if "isActive" in data:
        updates["isActive"] = bool(data["isActive"])

    db.categories.update_one({"_id": ObjectId(category_id)}, {"$set": updates})
    updated = db.categories.find_one({"_id": ObjectId(category_id)})
    return success_response(updated, "Category updated successfully")

@category_bp.route("/<category_id>", methods=["DELETE"])
@admin_required
def delete_category(category_id):
    db = Database.get_db()
    db.categories.update_one({"_id": ObjectId(category_id)}, {"$set": {"isActive": False}})
    return success_response(message="Category deactivated successfully")
