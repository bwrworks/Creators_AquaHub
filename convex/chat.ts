import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Creates a new conversation thread strictly for the authenticated user.
 */
export const createThread = mutation({
  args: {
    tankId: v.optional(v.string()),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Valid Supabase authentication token required.");
    }

    const now = Date.now();
    const threadId = await ctx.db.insert("threads", {
      userId: identity.subject, // Authoritative Supabase Auth UUID
      tankId: args.tankId,
      title: args.title,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return threadId;
  },
});

/**
 * Lists threads owned strictly by the authenticated caller.
 */
export const listMyThreads = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("threads")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);
  },
});

/**
 * Verification PoC query: Asserts that User B cannot read User A's thread.
 */
export const getThread = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Missing authentication token.");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread) return null;

    if (thread.userId !== identity.subject) {
      throw new Error("Forbidden: Cross-user thread access is strictly prohibited.");
    }

    return thread;
  },
});
