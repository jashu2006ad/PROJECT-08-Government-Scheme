import os
import logging
from pymongo import MongoClient, ASCENDING, DESCENDING
from app.config.settings import Config

logger = logging.getLogger("govscheme.db")

class Database:
    client = None
    db = None
    is_mock = False

    @classmethod
    def initialize(cls):
        if cls.db is not None:
            return cls.db

        mongodb_uri = Config.MONGODB_URI
        db_name = Config.DB_NAME

        if mongodb_uri and mongodb_uri.strip():
            try:
                logger.info("Attempting to connect to MongoDB Atlas...")
                cls.client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
                # Verify connection with server_info
                cls.client.server_info()
                cls.db = cls.client[db_name]
                cls.is_mock = False
                logger.info(f"Successfully connected to MongoDB Atlas database: {db_name}")
            except Exception as e:
                logger.warning(f"Could not connect to MongoDB Atlas ({e}). Falling back to in-memory mongomock for local development.")
                cls._init_mock(db_name)
        else:
            logger.info("No MONGODB_URI provided in environment. Initializing local in-memory mock database for offline development.")
            cls._init_mock(db_name)

        cls._ensure_indexes()
        return cls.db

    @classmethod
    def _init_mock(cls, db_name):
        try:
            import mongomock
            cls.client = mongomock.MongoClient()
            cls.db = cls.client[db_name]
            cls.is_mock = True
            logger.info(f"In-memory mongomock initialized for database: {db_name}")
        except Exception as e:
            logger.error(f"Failed to initialize mongomock: {e}")
            raise

    @classmethod
    def _ensure_indexes(cls):
        if cls.db is None:
            return
        try:
            # Users indexes
            cls.db.users.create_index([("email", ASCENDING)], unique=True)
            cls.db.users.create_index([("mobile", ASCENDING)])

            # Schemes indexes
            cls.db.schemes.create_index([("slug", ASCENDING)], unique=True)
            cls.db.schemes.create_index([("categoryId", ASCENDING)])
            cls.db.schemes.create_index([("isActive", ASCENDING)])
            cls.db.schemes.create_index([("applicableStates", ASCENDING)])

            # Saved schemes compound unique index
            cls.db.saved_schemes.create_index(
                [("userId", ASCENDING), ("schemeId", ASCENDING)],
                unique=True
            )

            # Applications index
            cls.db.applications.create_index([("userId", ASCENDING)])
            cls.db.applications.create_index([("referenceNumber", ASCENDING)])

            # Eligibility results index
            cls.db.eligibility_results.create_index([("userId", ASCENDING)])
            cls.db.eligibility_results.create_index([("checkedAt", DESCENDING)])

            # Document checklist index
            cls.db.document_checklists.create_index(
                [("userId", ASCENDING), ("schemeId", ASCENDING)],
                unique=True
            )

            logger.info("MongoDB collections and indexes ensured successfully.")
            
            # Auto-seed if collections are empty
            if cls.db.schemes.count_documents({}) == 0:
                logger.info("Database is empty. Automatically seeding verified government schemes and categories...")
                from seed.seed_data import run_seed
                run_seed()
        except Exception as e:
            logger.warning(f"Index creation or auto-seed notice: {e}")

    @classmethod
    def get_db(cls):
        if cls.db is None:
            return cls.initialize()
        return cls.db
