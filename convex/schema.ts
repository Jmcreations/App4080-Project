import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  // 👤 Students
  students: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    registrationNumber: v.string(),
    yearOfStudy: v.number(),
    program: v.optional(v.string()),
    clerkId: v.optional(v.string()), // if using Clerk auth
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_registration", ["registrationNumber"])
    .index("by_clerk_id", ["clerkId"]),


  // 👨‍🏫 Lecturers
  lecturers: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    department: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),


  // 📘 Courses
  courses: defineTable({
    courseCode: v.string(),
    courseName: v.string(),
    creditUnits: v.number(),
    lecturerId: v.optional(v.id("lecturers")),
  })
    .index("by_course_code", ["courseCode"])
    .index("by_lecturer", ["lecturerId"]),


  // 📝 Enrollments (Student ↔ Course relationship)
  enrollments: defineTable({
    studentId: v.id("students"),
    courseId: v.id("courses"),
    semester: v.string(),
    academicYear: v.string(),
  })
    .index("by_student", ["studentId"])
    .index("by_course", ["courseId"])
    .index("by_student_course", ["studentId", "courseId"]),


  // 📂 Assignments
  assignments: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(), // store as timestamp
    estimatedHours: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_due_date", ["dueDate"]),


  // 📤 Submissions
  submissions: defineTable({
    assignmentId: v.id("assignments"),
    studentId: v.id("students"),
    submittedAt: v.optional(v.number()),
    actualHoursSpent: v.optional(v.number()),
    status: v.string(), // Pending | Submitted | Late
    grade: v.optional(v.number()),
  })
    .index("by_student", ["studentId"])
    .index("by_assignment", ["assignmentId"])
    .index("by_student_assignment", ["studentId", "assignmentId"]),


  // 📊 Workload Analytics (Core Intelligence)
  workloadAnalytics: defineTable({
    studentId: v.id("students"),
    weekStartDate: v.number(), // timestamp
    totalAssignments: v.number(),
    totalEstimatedHours: v.number(),
    totalActualHours: v.number(),
    workloadStatus: v.string(), // Light | Balanced | Overloaded
    generatedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_student_week", ["studentId", "weekStartDate"]),
});
