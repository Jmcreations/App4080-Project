
import { mutation, query } from "./_generated/server";

export const getUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("students").collect();
  },
});
