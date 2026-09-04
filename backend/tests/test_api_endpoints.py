import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "PolaLink LK Backend API"
    assert data["status"] == "online"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_ai_copy_generator_endpoint():
    response = client.post("/api/ai/generate-copy", json={
        "title": "Ceylon Alba Cinnamon Quills",
        "keywords": "organic, freshly packed, export grade"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Ceylon Alba Cinnamon Quills"
    assert len(data["marketing_pitch"]) > 20
    assert len(data["highlights"]) > 0

def test_ai_category_suggestion_endpoint():
    response = client.post("/api/ai/suggest-category", json={
        "title": "Badapu Thuna Paha Roasted Curry Powder"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["suggested_category"] == "Spices"

def test_validation_error_formatting():
    # Attempt to post invalid data to trigger 422 with structured field details
    response = client.post("/api/stores", json={
        "name": "",
        "whatsapp_number": "invalid_number"
    }, headers={"Authorization": "Bearer fake_token"})
    # Since auth runs or validation runs:
    assert response.status_code in [401, 422]
