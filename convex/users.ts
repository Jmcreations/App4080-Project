import { mutation } from "./_generated/server";

export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Use the index defined in your schema: .index("by_user", ["userId"])
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();

    if (user !== null) return user._id;

    // Insert with ALL fields required by your schema
    return await ctx.db.insert("userProfiles", {
      userId: identity.subject, // Unique ID from Clerk
      name: identity.name ?? "Anonymous",
      email: identity.email!,
      studentId: "N/A", 
      major: "Undeclared",
      notifications: { 
        deadlineReminders: true, 
        workloadAlerts: true, 
        weeklySummary: true 
      },
      privacy: { 
        dataCollection: true, 
        usageAnalytics: true, 
        emailNotifications: true 
      },
    });
  },
});