import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  assignments: defineTable({
    userId:   v.string(),
    title:    v.string(),
    desc:     v.string(),
    course:   v.string(),
    deadline: v.string(),
    hours:    v.string(),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    status:   v.union(v.literal("pending"), v.literal("in progress"), v.literal("completed")),
  }).index("by_user", ["userId"]),

  studySessions: defineTable({
    userId:  v.string(),
    course:  v.string(),
    date:    v.string(),
    planned: v.number(),
    actual:  v.number(),
    notes:   v.string(),
  }).index("by_user", ["userId"]),

  userProfiles: defineTable({
    userId:    v.string(),
    name:      v.string(),
    email:     v.string(),
    studentId: v.string(),
    major:     v.string(),
    notifications: v.object({
      deadlineReminders: v.boolean(),
      workloadAlerts:    v.boolean(),
      weeklySummary:     v.boolean(),
    }),
    privacy: v.object({
      dataCollection:     v.boolean(),
      usageAnalytics:     v.boolean(),
      emailNotifications: v.boolean(),
    }),
  }).index("by_user", ["userId"]),

  studentMLData: defineTable({
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
  }),
});