import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAssignments = query({
args: { userId: v.string() },
handler: async (ctx, args) => {
return await ctx.db.query("assignments").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect();
},
});

export const addAssignment = mutation({
args: {
userId: v.string(), title: v.string(), desc: v.string(), course: v.string(),
deadline: v.string(), hours: v.string(), priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
status: v.union(v.literal("pending"), v.literal("in progress"), v.literal("completed"))
},
handler: async (ctx, args) => {
await ctx.db.insert("assignments", args);
},
});

export const updateStatus = mutation({
args: { id: v.id("assignments"), status: v.union(v.literal("pending"), v.literal("in progress"), v.literal("completed")) },
handler: async (ctx, args) => {
await ctx.db.patch(args.id, { status: args.status });
},
});

export const deleteAssignment = mutation({
args: { id: v.id("assignments") },
handler: async (ctx, args) => {
await ctx.db.delete(args.id);
},
});

export const seedAssignments = mutation({
args: { userId: v.string() },
handler: async (ctx, args) => {
const existing = await ctx.db.query("assignments").withIndex("by_user", (q) => q.eq("userId", args.userId)).first();
if (!existing) {
await ctx.db.insert("assignments", {
userId: args.userId,
title: "Machine Learning Lab 1",
desc: "Implement linear regression in Python",
course: "CS 401 - Machine Learning",
deadline: "Mar 15, 2026",
hours: "5h",
priority: "high",
status: "pending",
});
}
},
});