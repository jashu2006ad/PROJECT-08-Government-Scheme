import pytest
import json
from app import create_app
from app.config.database import Database

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data["success"] is True
    assert data["data"]["status"] == "online"

def test_login_demo_admin(client):
    res = client.post("/api/auth/login", json={
        "email": "admin@govscheme.nic.in",
        "password": "Admin@12345"
    })
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data["success"] is True
    assert "token" in data["data"]
    assert data["data"]["user"]["role"] == "admin"

def test_login_demo_citizen(client):
    res = client.post("/api/auth/login", json={
        "email": "citizen@govscheme.in",
        "password": "Citizen@12345"
    })
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data["success"] is True
    assert "token" in data["data"]
    assert data["data"]["user"]["role"] == "user"

def test_register_and_duplicate_check(client):
    # Register new citizen
    res = client.post("/api/auth/register", json={
        "fullName": "Priya Sharma",
        "email": "priya.test@govscheme.in",
        "mobile": "9988776655",
        "password": "Password@123",
        "state": "Telangana",
        "district": "Hyderabad"
    })
    assert res.status_code == 201
    data = json.loads(res.data)
    assert data["success"] is True
    assert data["data"]["user"]["email"] == "priya.test@govscheme.in"

    # Try duplicate registration with same email
    res_dup = client.post("/api/auth/register", json={
        "fullName": "Priya Duplicate",
        "email": "priya.test@govscheme.in",
        "mobile": "9988776656",
        "password": "Password@123"
    })
    assert res_dup.status_code == 400
    data_dup = json.loads(res_dup.data)
    assert data_dup["success"] is False

def test_schemes_list_and_stats(client):
    res = client.get("/api/schemes")
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data["success"] is True
    assert len(data["data"]) > 0
    assert "pagination" in data

    res_stats = client.get("/api/schemes/stats")
    assert res_stats.status_code == 200
    stats = json.loads(res_stats.data)["data"]
    assert stats["totalSchemes"] >= 10
    assert stats["availableCategories"] >= 8

def test_eligibility_engine(client):
    # Test Farmer demographic
    farmer_profile = {
        "age": 42,
        "gender": "Male",
        "occupation": "Farmer",
        "annualIncome": 180000,
        "state": "Andhra Pradesh"
    }
    res = client.post("/api/eligibility/check", json=farmer_profile)
    assert res.status_code == 200
    data = json.loads(res.data)["data"]
    assert data["eligibleCount"] >= 1
    # Verify PM-KISAN is among eligible schemes
    eligible_names = [s["schemeName"] for s in data["eligibleSchemes"]]
    assert any("PM-KISAN" in name for name in eligible_names)

    # Test Student demographic
    student_profile = {
        "age": 20,
        "gender": "Female",
        "occupation": "Student",
        "annualIncome": 120000,
        "state": "Telangana"
    }
    res_student = client.post("/api/eligibility/check", json=student_profile)
    assert res_student.status_code == 200
    student_data = json.loads(res_student.data)["data"]
    eligible_names_student = [s["schemeName"] for s in student_data["eligibleSchemes"]]
    assert any("Scholarship" in name for name in eligible_names_student)

def test_admin_route_protection(client):
    # Citizen token should be rejected with 403 on admin routes
    res_citizen_login = client.post("/api/auth/login", json={
        "email": "citizen@govscheme.in",
        "password": "Citizen@12345"
    })
    citizen_token = json.loads(res_citizen_login.data)["data"]["token"]

    res_forbidden = client.get("/api/admin/dashboard", headers={
        "Authorization": f"Bearer {citizen_token}"
    })
    assert res_forbidden.status_code == 403

    # Admin token should succeed
    res_admin_login = client.post("/api/auth/login", json={
        "email": "admin@govscheme.nic.in",
        "password": "Admin@12345"
    })
    admin_token = json.loads(res_admin_login.data)["data"]["token"]

    res_allowed = client.get("/api/admin/dashboard", headers={
        "Authorization": f"Bearer {admin_token}"
    })
    assert res_allowed.status_code == 200
    admin_dash = json.loads(res_allowed.data)["data"]
    assert "metrics" in admin_dash
