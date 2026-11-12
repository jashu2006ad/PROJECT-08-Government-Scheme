import re
import datetime
from bson import ObjectId
from app.config.database import Database

class SchemeService:
    @staticmethod
    def get_schemes(query_params: dict) -> tuple:
        db = Database.get_db()
        filter_query = {}

        # Search by keyword or scheme name
        search = query_params.get("search", "").strip()
        if search:
            regex = re.compile(re.escape(search), re.IGNORECASE)
            filter_query["$or"] = [
                {"schemeName": regex},
                {"description": regex},
                {"targetBeneficiaries": regex},
                {"benefits": regex}
            ]

        # Category filter
        category_id = query_params.get("categoryId")
        if category_id:
            try:
                filter_query["categoryId"] = ObjectId(category_id)
            except Exception:
                filter_query["categoryId"] = category_id

        # State filter
        state = query_params.get("state")
        if state and state.lower() != "all":
            filter_query["applicableStates"] = {"$in": ["All India", "All", state]}

        # Beneficiary filter
        beneficiary = query_params.get("beneficiary")
        if beneficiary and beneficiary.lower() != "all":
            filter_query["targetBeneficiaries"] = re.compile(re.escape(beneficiary), re.IGNORECASE)

        # Active status (admins can query all, users get only active)
        is_admin = query_params.get("isAdmin", False)
        if not is_admin:
            filter_query["isActive"] = True
        elif "isActive" in query_params:
            filter_query["isActive"] = query_params["isActive"] == "true" or query_params["isActive"] is True

        # Sorting
        sort_by = query_params.get("sortBy", "recent")
        if sort_by == "alpha_asc":
            sort_order = [("schemeName", 1)]
        elif sort_by == "alpha_desc":
            sort_order = [("schemeName", -1)]
        elif sort_by == "category":
            sort_order = [("categoryId", 1), ("schemeName", 1)]
        else:
            sort_order = [("updatedAt", -1)]

        # Pagination
        try:
            page = max(1, int(query_params.get("page", 1)))
        except (ValueError, TypeError):
            page = 1

        try:
            limit = min(50, max(1, int(query_params.get("limit", 9))))
        except (ValueError, TypeError):
            limit = 9

        skip = (page - 1) * limit

        total = db.schemes.count_documents(filter_query)
        cursor = db.schemes.find(filter_query).sort(sort_order).skip(skip).limit(limit)

        schemes = list(cursor)

        # Populate category details
        category_cache = {}
        for s in schemes:
            cid = s.get("categoryId")
            if cid:
                if str(cid) not in category_cache:
                    cat = db.categories.find_one({"_id": ObjectId(cid) if isinstance(cid, str) else cid})
                    category_cache[str(cid)] = cat.get("categoryName") if cat else "General"
                s["categoryName"] = category_cache[str(cid)]
            else:
                s["categoryName"] = "General"

        return schemes, total, page, limit

    @staticmethod
    def get_scheme_by_id_or_slug(identifier: str) -> dict:
        db = Database.get_db()
        scheme = None
        try:
            scheme = db.schemes.find_one({"_id": ObjectId(identifier)})
        except Exception:
            pass

        if not scheme:
            scheme = db.schemes.find_one({"slug": identifier})

        if not scheme:
            raise ValueError("Scheme not found")

        cid = scheme.get("categoryId")
        if cid:
            cat = db.categories.find_one({"_id": ObjectId(cid) if isinstance(cid, str) else cid})
            scheme["categoryName"] = cat.get("categoryName") if cat else "General"

        return scheme

    @staticmethod
    def save_scheme(user_id: str, scheme_id: str):
        db = Database.get_db()
        existing = db.saved_schemes.find_one({
            "userId": user_id,
            "schemeId": scheme_id
        })
        if existing:
            return {"saved": True, "message": "Scheme is already saved in your favorites"}

        now = datetime.datetime.now(datetime.timezone.utc)
        db.saved_schemes.insert_one({
            "userId": user_id,
            "schemeId": scheme_id,
            "savedAt": now
        })

        db.activity_logs.insert_one({
            "userId": user_id,
            "action": "SAVE_SCHEME",
            "description": f"Saved scheme {scheme_id}",
            "timestamp": now
        })

        return {"saved": True, "message": "Scheme saved successfully"}

    @staticmethod
    def unsave_scheme(user_id: str, scheme_id: str):
        db = Database.get_db()
        db.saved_schemes.delete_one({
            "userId": user_id,
            "schemeId": scheme_id
        })
        return {"saved": False, "message": "Scheme removed from saved list"}

    @staticmethod
    def get_saved_schemes(user_id: str) -> list:
        db = Database.get_db()
        saved_records = list(db.saved_schemes.find({"userId": user_id}).sort("savedAt", -1))
        scheme_ids = [r["schemeId"] for r in saved_records]

        # Fetch full scheme details
        results = []
        for r in saved_records:
            try:
                s = db.schemes.find_one({"_id": ObjectId(r["schemeId"])})
                if s:
                    cid = s.get("categoryId")
                    if cid:
                        cat = db.categories.find_one({"_id": ObjectId(cid) if isinstance(cid, str) else cid})
                        s["categoryName"] = cat.get("categoryName") if cat else "General"
                    s["savedAt"] = r["savedAt"]
                    results.append(s)
            except Exception:
                continue
        return results

    @staticmethod
    def get_portal_stats() -> dict:
        db = Database.get_db()
        total_schemes = db.schemes.count_documents({"isActive": True})
        total_categories = db.categories.count_documents({"isActive": True})
        total_users = db.users.count_documents({"isActive": True})
        total_applications = db.applications.count_documents({})
        total_eligibility_checks = db.eligibility_results.count_documents({})

        return {
            "totalSchemes": total_schemes,
            "availableCategories": total_categories,
            "registeredCitizens": total_users,
            "applicationsRecorded": total_applications,
            "eligibilityChecksCompleted": total_eligibility_checks
        }
