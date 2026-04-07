import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getProfile = query({
args: { userId: v.string() },
handler: async (ctx, args) => {
return await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", args.userId)).unique();
},
});

export const upsertProfile = mutation({
args: {
userId: v.string(), name: v.string(), email: v.string(), studentId: v.string(), major: v.string(),
notifications: v.object({ deadlineReminders: v.boolean(), workloadAlerts: v.boolean(), weeklySummary: v.boolean() }),
privacy: v.object({ dataCollection: v.boolean(), usageAnalytics: v.boolean(), emailNotifications: v.boolean() })
},
handler: async (ctx, args) => {
const existing = await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", args.userId)).unique();
if (existing) {
await ctx.db.patch(existing._id, args);
} else {
await ctx.db.insert("userProfiles", args);
}
},
});