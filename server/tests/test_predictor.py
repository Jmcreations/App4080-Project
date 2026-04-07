import pytest
import pandas as pd
import os
from ml.predictor import StudentPerformanceModel

@pytest.fixture
def sample_training_data():
    # A small dummy dataset to test the training logic
    return pd.DataFrame({
        "age": [15, 16, 15, 17],
        "gender": ["Male", "Female", "Male", "Female"],
        "study_hours_per_day": [2.5, 4.0, 1.5, 5.0],
        "social_media_hours": [3.0, 1.0, 4.0, 0.5],
        "netflix_hours": [2.0, 1.0, 3.0, 0.0],
        "part_time_job": ["No", "No", "Yes", "No"],
        "attendance_percentage": [85.0, 95.0, 70.0, 99.0],
        "sleep_hours": [7.0, 8.0, 6.0, 8.5],
        "diet_quality": ["Average", "Good", "Poor", "Good"],
        "exercise_frequency": [2, 4, 1, 5],
        "parental_education_level": ["High School", "Bachelor", None, "Master"],
        "internet_quality": ["Good", "Excellent", "Poor", "Excellent"],
        "mental_health_rating": [3, 4, 2, 5],
        "extracurricular_participation": ["Yes", "Yes", "No", "Yes"],
        "exam_score": [75.0, 90.0, 60.0, 98.0]
    })

def test_model_training_and_prediction(sample_training_data):
    model = StudentPerformanceModel()
    
    # 1. Test that the model can train on a dataframe
    r2 = model.train_and_save(sample_training_data)
    assert r2 is not None
    assert isinstance(r2, float)
    
    # 2. Test that it generated the joblib files in the correct directory
    artifacts_dir = os.path.dirname(os.path.dirname(__file__)) # Go up from /tests to /server
    model_path = os.path.join(artifacts_dir, "ml", "model.joblib")
    assert os.path.exists(model_path)
    
    # 3. Test the prediction flow using a sample dictionary input
    sample_input = {
        "age": 16,
        "gender": "Female",
        "study_hours_per_day": 3.0,
        "social_media_hours": 2.0,
        "netflix_hours": 1.0,
        "part_time_job": "No",
        "attendance_percentage": 90.0,
        "sleep_hours": 8.0,
        "diet_quality": "Good",
        "exercise_frequency": 3,
        "parental_education_level": "Bachelor",
        "internet_quality": "Excellent",
        "mental_health_rating": 4,
        "extracurricular_participation": "Yes"
    }
    
    prediction = model.predict(sample_input)
    
    # Ensure it returns a float score
    assert isinstance(prediction, float)
