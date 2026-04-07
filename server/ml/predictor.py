import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score

# Store artifacts relative to this file
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")
COLS_PATH = os.path.join(os.path.dirname(__file__), "model_cols.joblib")

class StudentPerformanceModel:
    def __init__(self):
        self.model = None
        self.expected_cols = None
        self.mode_parental_education = None
        self.categorical_cols = None

    def load_model(self):
        if os.path.exists(MODEL_PATH) and os.path.exists(COLS_PATH):
            self.model = joblib.load(MODEL_PATH)
            loaded_data = joblib.load(COLS_PATH)
            self.expected_cols = loaded_data['expected_cols']
            self.mode_parental_education = loaded_data['mode_parental_education']
            self.categorical_cols = loaded_data['categorical_cols']
            return True
        return False

    def train_and_save(self, df: pd.DataFrame):
        # Drop student_id if present
        if 'student_id' in df.columns:
            # Drop the column in a way that doesn't trigger warnings
            df = df.drop(columns=['student_id'])

        # Filter out rows missing target explicitly (safety)
        if 'exam_score' in df.columns:
            df = df.dropna(subset=['exam_score'])

        # Handle missing values
        if 'parental_education_level' in df.columns:
            self.mode_parental_education = df['parental_education_level'].mode()[0]
            df['parental_education_level'] = df['parental_education_level'].fillna(self.mode_parental_education)

        # Convert appropriate types
        self.categorical_cols = df.select_dtypes(include=['object', 'string']).columns.tolist()
        
        # We dummy-encode drop_first=True to avoid collinearity
        df_encoded = pd.get_dummies(df, columns=self.categorical_cols, drop_first=True)
        
        self.expected_cols = df_encoded.drop(columns=['exam_score']).columns.tolist()

        X = df_encoded[self.expected_cols]
        y = df_encoded['exam_score']

        self.model = RandomForestRegressor(random_state=42)
        self.model.fit(X, y)

        joblib.dump(self.model, MODEL_PATH)
        joblib.dump({
            'expected_cols': self.expected_cols, 
            'mode_parental_education': self.mode_parental_education,
            'categorical_cols': self.categorical_cols
        }, COLS_PATH)

        return r2_score(y, self.model.predict(X))

    def predict(self, input_data: dict) -> float:
        if self.model is None or self.expected_cols is None:
            if not self.load_model():
                raise Exception("Model not trained yet.")

        df = pd.DataFrame([input_data])
        if 'student_id' in df.columns:
            df = df.drop('student_id', axis=1)

        if 'parental_education_level' in df.columns and self.mode_parental_education:
            df['parental_education_level'] = df['parental_education_level'].fillna(self.mode_parental_education)

        # get dummies doesn't know all classes for single prediction, so handle carefully
        df_encoded = pd.get_dummies(df, columns=[c for c in self.categorical_cols if c in df.columns])

        for col in self.expected_cols:
            if col not in df_encoded.columns:
                df_encoded[col] = 0

        X = df_encoded[self.expected_cols]
        # ensure column order
        prediction = self.model.predict(X)
        return float(prediction[0])
