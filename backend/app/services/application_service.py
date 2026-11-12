import datetime
from bson import ObjectId
from app.config.database import Database

class ApplicationService:
    VALID_STATUSES = [
        "Draft",
        "Submitted",
        "Under Verification",
        "Approved",
        "Rejected",
        "Completed"
    ]

    @classmethod
    def create_application_record(cls, user_id: str, data: dict) -> dict:
        db = Database.get_db()
        scheme_id = data.get("schemeId")
        ref_number = data.get("referenceNumber", "").strip()
        status = data.get("currentStatus", "Submitted")
        notes = data.get("notes", "").strip()
        submission_date_raw = data.get("submissionDate")

        if not scheme_id:
            raise ValueError("Scheme ID is required")
        if not ref_number:
            raise ValueError("Application reference number is required")
        if status not in cls.VALID_STATUSES:
            status = "Submitted"

        # Check scheme exists
        scheme = None
        try:
            scheme = db.schemes.find_one({"_id": ObjectId(scheme_id)})
        except Exception:
            scheme = db.schemes.find_one({"_id": scheme_id})

        scheme_name = scheme.get("schemeName") if scheme else data.get("schemeName", "Government Scheme")

        now = datetime.datetime.now(datetime.timezone.utc)
        sub_date = submission_date_raw or now.strftime("%Y-%m-%d")

        doc = {
            "userId": user_id,
            "schemeId": scheme_id,
            "schemeName": scheme_name,
            "referenceNumber": ref_number,
            "submissionDate": sub_date,
            "currentStatus": status,
            "notes": notes,
            "sourceType": "user_entered",
            "statusHistory": [
                {
                    "status": status,
                    "notes": notes or "Application record entered by citizen",
                    "updatedAt": now,
                    "updatedBy": "Citizen"
                }
            ],
            "createdAt": now,
            "updatedAt": now
        }

        result = db.applications.insert_one(doc)
        doc["_id"] = result.inserted_id

        # Log activity
        db.activity_logs.insert_one({
            "userId": user_id,
            "action": "CREATE_APPLICATION_RECORD",
            "description": f"Recorded application for {scheme_name} (Ref: {ref_number})",
            "timestamp": now
        })

        return doc

    @classmethod
    def get_user_applications(cls, user_id: str) -> list:
        db = Database.get_db()
        apps = list(db.applications.find({"userId": user_id}).sort("updatedAt", -1))
        for a in apps:
            try:
                scheme = db.schemes.find_one({"_id": ObjectId(a.get("schemeId"))})
                if scheme:
                    a["scheme"] = {
                        "id": str(scheme["_id"]),
                        "name": scheme.get("schemeName"),
                        "slug": scheme.get("slug"),
                        "applicationUrl": scheme.get("applicationUrl")
                    }
            except Exception:
                pass
        return apps

    @classmethod
    def get_application_by_id(cls, app_id: str, user_id: str = None, is_admin: bool = False) -> dict:
        db = Database.get_db()
        app = db.applications.find_one({"_id": ObjectId(app_id)})
        if not app:
            raise ValueError("Application record not found")

        if not is_admin and app.get("userId") != user_id:
            raise ValueError("Unauthorized access to this application record")

        return app

    @classmethod
    def update_application_record(cls, app_id: str, user_id: str, data: dict) -> dict:
        db = Database.get_db()
        app = db.applications.find_one({"_id": ObjectId(app_id), "userId": user_id})
        if not app:
            raise ValueError("Application record not found or unauthorized")

        updates = {}
        if "referenceNumber" in data:
            updates["referenceNumber"] = data["referenceNumber"].strip()
        if "submissionDate" in data:
            updates["submissionDate"] = data["submissionDate"]
        if "notes" in data:
            updates["notes"] = data["notes"].strip()

        now = datetime.datetime.now(datetime.timezone.utc)
        updates["updatedAt"] = now

        db.applications.update_one({"_id": ObjectId(app_id)}, {"$set": updates})
        return cls.get_application_by_id(app_id, user_id=user_id)

    @classmethod
    def admin_update_status(cls, app_id: str, status: str, notes: str, admin_user: dict) -> dict:
        if status not in cls.VALID_STATUSES:
            raise ValueError(f"Invalid status. Must be one of {cls.VALID_STATUSES}")

        db = Database.get_db()
        app = db.applications.find_one({"_id": ObjectId(app_id)})
        if not app:
            raise ValueError("Application record not found")

        now = datetime.datetime.now(datetime.timezone.utc)
        history_entry = {
            "status": status,
            "notes": notes or f"Status updated by Administrator ({admin_user.get('fullName', 'Admin')})",
            "updatedAt": now,
            "updatedBy": admin_user.get("fullName", "Admin")
        }

        db.applications.update_one(
            {"_id": ObjectId(app_id)},
            {
                "$set": {
                    "currentStatus": status,
                    "sourceType": "admin_verified",
                    "updatedAt": now
                },
                "$push": {"statusHistory": history_entry}
            }
        )

        return cls.get_application_by_id(app_id, is_admin=True)

    @classmethod
    def get_document_checklist(cls, user_id: str, scheme_id: str) -> dict:
        db = Database.get_db()
        record = db.document_checklists.find_one({
            "userId": user_id,
            "schemeId": scheme_id
        })
        if not record:
            return {"schemeId": scheme_id, "documents": []}
        return record

    @classmethod
    def update_document_checklist(cls, user_id: str, scheme_id: str, documents: list) -> dict:
        db = Database.get_db()
        now = datetime.datetime.now(datetime.timezone.utc)
        db.document_checklists.update_one(
            {"userId": user_id, "schemeId": scheme_id},
            {
                "$set": {
                    "userId": user_id,
                    "schemeId": scheme_id,
                    "documents": documents,
                    "updatedAt": now
                }
            },
            upsert=True
        )
        return {"userId": user_id, "schemeId": scheme_id, "documents": documents, "updatedAt": now}
