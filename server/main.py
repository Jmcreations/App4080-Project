import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from convex import ConvexClient

from ml.predictor import StudentPerformanceModel

load_dotenv()

app = FastAPI(title="Student ML Predictor API")

# Setup CORS to allow Next.js app to communicate directly if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
model = StudentPerformanceModel()
# Attempt to load model at startup
model.load_model()

# We need the convex URL to initialize the client
CONVEX_URL = os.environ.get("NEXT_PUBLIC_CONVEX_URL")
if CONVEX_URL:
    convex_client = ConvexClient(CONVEX_URL)
else:
    convex_client = None

class StudentData(BaseModel):
    age: int
    gender: str
    study_hours_per_day: float
    social_media_hours: float
    netflix_hours: float
    part_time_job: str
    attendance_percentage: float
    sleep_hours: float
    diet_quality: str
    exercise_frequency: int
    parental_education_level: str = None
    internet_quality: str
    mental_health_rating: int
    extracurricular_participation: str

@app.post("/predict")
async def predict_score(data: StudentData):
    try:
        score = model.predict(data.dict())
        return {
            "success": True,
            "predicted_exam_score": score,
            "insights": f"Predicted score is {score:.2f}. Consider increasing study hours if below 70."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrain")
async def retrain_model():
    if not convex_client:
        raise HTTPException(status_code=500, detail="Convex client not configured. Set NEXT_PUBLIC_CONVEX_URL.")
    
    try:
        # Fetch data from convex
        # We assume there is a query 'ml:getAllDataForTraining' that returns a list of dictionaries
        db_data = convex_client.query("ml:getAllDataForTraining")
        
        if not db_data or len(db_data) < 10:
            return {"success": False, "message": "Not enough data in DB to retrain.", "rows_fetched": len(db_data) if db_data else 0}

        # Let's also load the old CSV and combine them to ensure we don't lose the base dataset
        base_dir = os.path.dirname(os.path.dirname(__file__))
        dataset_path = os.path.join(base_dir, "Machine Learning", "Datasets", "student_habits_performance.csv")
        
        df_db = pd.DataFrame(db_data)
        
        if os.path.exists(dataset_path):
            df_csv = pd.read_csv(dataset_path)
            # Find matching columns and concat
            common_cols = list(set(df_csv.columns) & set(df_db.columns))
            # Just fallback to appending
            df_combined = pd.concat([df_csv, df_db], ignore_index=True)
        else:
            df_combined = df_db
            
        r2 = model.train_and_save(df_combined)
        return {"success": True, "message": "Model retrained successfully.", "r2_score": r2, "total_rows": len(df_combined)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def root():
    return {"status": "ok", "model_loaded": model.model is not None}
