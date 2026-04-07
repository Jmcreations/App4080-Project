import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSessions = query({
args: { userId: v.string() },
handler: async (ctx, args) => {
return await ctx.db.query("studySessions").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect();
},
});

export const logSession = mutation({
args: { userId: v.string(), course: v.string(), date: v.string(), planned: v.number(), actual: v.number(), notes: v.string() },
handler: async (ctx, args) => {
await ctx.db.insert("studySessions", args);
},
});

export const deleteSession = mutation({
args: { id: v.id("studySessions") },
handler: async (ctx, args) => {
await ctx.db.delete(args.id);
},
});

export const seedSessions = mutation({
args: { userId: v.string() },
handler: async (ctx, args) => {
const existing = await ctx.db.query("studySessions").withIndex("by_user", (q) => q.eq("userId", args.userId)).first();
if (!existing) {
await ctx.db.insert("studySessions", {
userId: args.userId,
course: "CS 401 - Machine Learning",
date: "Mar 7, 2026",
planned: 3,
actual: 4,
notes: "Focused on gradient descent theory",
});
}
},
});