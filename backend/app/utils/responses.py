from flask import jsonify
from bson import ObjectId
from datetime import datetime, date

def serialize_mongo(obj):
    """Recursively convert MongoDB types (ObjectId, datetime) to JSON serializable structures."""
    if isinstance(obj, list):
        return [serialize_mongo(item) for item in obj]
    elif isinstance(obj, dict):
        res = {}
        for k, v in obj.items():
            if k == "_id":
                res["id"] = str(v)
            elif isinstance(v, ObjectId):
                res[k] = str(v)
            elif isinstance(v, (datetime, date)):
                res[k] = v.isoformat()
            elif isinstance(v, (dict, list)):
                res[k] = serialize_mongo(v)
            else:
                res[k] = v
        return res
    elif isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, (datetime, date)):
        return obj.isoformat()
    return obj

def success_response(data=None, message="Success", status_code=200):
    payload = {
        "success": True,
        "message": message,
        "data": serialize_mongo(data) if data is not None else None
    }
    return jsonify(payload), status_code

def error_response(message="An error occurred", errors=None, status_code=400):
    payload = {
        "success": False,
        "message": message,
        "errors": errors or []
    }
    return jsonify(payload), status_code

def paginated_response(items, total, page, limit, message="Success"):
    total_pages = (total + limit - 1) // limit if limit > 0 else 1
    payload = {
        "success": True,
        "message": message,
        "data": serialize_mongo(items),
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": total_pages,
            "hasNext": page < total_pages,
            "hasPrev": page > 1
        }
    }
    return jsonify(payload), 200
