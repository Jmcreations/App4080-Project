import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Contact the local FastAPI server to get predictions.
 * Ensure your FastAPI server is running on http://127.0.0.1:8000
 */
export const predictScore = action({
  args: {
    age: v.number(),
    gender: v.string(),
    study_hours_per_day: v.number(),
    social_media_hours: v.number(),
    netflix_hours: v.number(),
    part_time_job: v.string(),
    attendance_percentage: v.number(),
    sleep_hours: v.number(),
    diet_quality: v.string(),
    exercise_frequency: v.number(),
    parental_education_level: v.optional(v.string()),
    internet_quality: v.string(),
    mental_health_rating: v.number(),
    extracurricular_participation: v.string(),
  },
  handler: async (ctx, args) => {
    // In production, process.env.ML_API_URL should be set
    const apiUrl = process.env.ML_API_URL || "http://127.0.0.1:8000";
    
    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        throw new Error(`FastAPI responded with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error predicting score:", error);
      throw new Error("Unable to connect to ML Backend.");
    }
  },
});
