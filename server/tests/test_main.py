import pytest
from fastapi.testclient import TestClient
from main import app

# Create a test client that mocks out our FastAPI server
client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    
    data = response.json()
    assert "status" in data
    assert data["status"] == "ok"
    assert "model_loaded" in data

def test_predict_endpoint():
    # Sample payload expected by the StudentData Pydantic model
    payload = {
        "age": 18,
        "gender": "Male",
        "study_hours_per_day": 4.5,
        "social_media_hours": 1.0,
        "netflix_hours": 2.0,
        "part_time_job": "No",
        "attendance_percentage": 95.0,
        "sleep_hours": 8.0,
        "diet_quality": "Good",
        "exercise_frequency": 3,
        "parental_education_level": "Bachelor",
        "internet_quality": "Excellent",
        "mental_health_rating": 4,
        "extracurricular_participation": "Yes"
    }
    
    response = client.post("/predict", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "predicted_exam_score" in data
    assert "insights" in data
