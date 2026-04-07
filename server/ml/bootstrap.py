import os
import pandas as pd
from predictor import StudentPerformanceModel

def bootstrap_model():
    # Attempt to locate the CSV file
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    dataset_path = os.path.join(base_dir, "Machine Learning", "Datasets", "student_habits_performance.csv")
    
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}")
        return
        
    print(f"Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)
    print(f"Loaded {len(df)} rows.")
    
    model = StudentPerformanceModel()
    r2 = model.train_and_save(df)
    
    print(f"Model successfully trained and saved! Initial R2 Score: {r2:.4f}")

if __name__ == "__main__":
    bootstrap_model()
