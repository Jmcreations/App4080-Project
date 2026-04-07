import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Endpoint for the Python ML Backend to fetch all training data logs
 */
export const getAllDataForTraining = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("studentMLData").collect();
  },
});

/**
 * Mutation to insert new training data points (called by the UI when a student logs their actual exam score)
 */
export const insertMLData = mutation({
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
    exam_score: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("studentMLData", args);
  },
});
