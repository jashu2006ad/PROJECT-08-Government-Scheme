import datetime
from flask import Blueprint, request, g
from app.services.eligibility_engine import EligibilityEngine
from app.middleware.auth_middleware import optional_auth, token_required
from app.utils.responses import success_response, error_response
from app.config.database import Database
from bson import ObjectId

eligibility_bp = Blueprint("eligibility", __name__, url_prefix="/api/eligibility")

@eligibility_bp.route("/check", methods=["POST"])
@optional_auth
def check_eligibility():
    user_data = request.get_json() or {}
    db = Database.get_db()

    # Normalize numeric and string fields
    try:
        if "age" in user_data and user_data["age"] is not None:
            user_data["age"] = int(user_data["age"])
    except (ValueError, TypeError):
        pass

    try:
        if "annualIncome" in user_data and user_data["annualIncome"] is not None:
            user_data["annualIncome"] = float(str(user_data["annualIncome"]).replace(",", ""))
    except (ValueError, TypeError):
        pass

    # Retrieve all active schemes
    schemes = list(db.schemes.find({"isActive": True}))

    eligible_schemes = []
    potentially_eligible = []
    ineligible_schemes = []

    # Category cache
    categories = {str(c["_id"]): c.get("categoryName", "General") for c in db.categories.find({})}

    for s in schemes:
        eval_result = EligibilityEngine.evaluate_scheme(s, user_data)
        
        # Scheme summary info for frontend card
        scheme_card = {
            "id": str(s["_id"]),
            "schemeName": s.get("schemeName"),
            "slug": s.get("slug"),
            "categoryName": categories.get(str(s.get("categoryId")), "General"),
            "benefits": s.get("benefits"),
            "targetBeneficiaries": s.get("targetBeneficiaries"),
            "applicationUrl": s.get("applicationUrl"),
            "matchedConditions": eval_result["matchedConditions"],
            "unmatchedConditions": eval_result["unmatchedConditions"],
            "missingInformation": eval_result["missingInformation"],
            "explanation": eval_result["explanation"]
        }

        if eval_result["result"] == "eligible":
            eligible_schemes.append(scheme_card)
        elif eval_result["result"] == "needs_more_information":
            potentially_eligible.append(scheme_card)
        else:
            ineligible_schemes.append(scheme_card)

    now = datetime.datetime.now(datetime.timezone.utc)
    summary = {
        "totalEvaluated": len(schemes),
        "eligibleCount": len(eligible_schemes),
        "potentialCount": len(potentially_eligible),
        "ineligibleCount": len(ineligible_schemes),
        "eligibleSchemes": eligible_schemes,
        "potentiallyEligibleSchemes": potentially_eligible,
        "ineligibleSchemes": ineligible_schemes,
        "checkedAt": now.isoformat()
    }

    # Save result in MongoDB if user is logged in
    user_id = getattr(g, "user_id", None)
    if user_id:
        try:
            db.eligibility_results.insert_one({
                "userId": user_id,
                "userProfileSnapshot": user_data,
                "eligibleCount": len(eligible_schemes),
                "potentialCount": len(potentially_eligible),
                "ineligibleCount": len(ineligible_schemes),
                "eligibleSchemeIds": [s["id"] for s in eligible_schemes],
                "checkedAt": now
            })

            # Activity log
            db.activity_logs.insert_one({
                "userId": user_id,
                "action": "CHECK_ELIGIBILITY",
                "description": f"Checked eligibility: {len(eligible_schemes)} eligible schemes identified",
                "timestamp": now
            })
        except Exception:
            pass

    return success_response(summary, "Eligibility evaluation completed successfully")

@eligibility_bp.route("/history", methods=["GET"])
@token_required
def get_eligibility_history():
    db = Database.get_db()
    history = list(db.eligibility_results.find({"userId": g.user_id}).sort("checkedAt", -1).limit(10))
    return success_response(history)

@eligibility_bp.route("/<history_id>", methods=["GET"])
@token_required
def get_eligibility_by_id(history_id):
    db = Database.get_db()
    record = db.eligibility_results.find_one({"_id": ObjectId(history_id), "userId": g.user_id})
    if not record:
        return error_response("Record not found", status_code=404)
    return success_response(record)
