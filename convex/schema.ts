import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  threads: defineTable({
    userId: v.string(), // Authoritative Supabase Auth UUID (identity.subject)
    tankId: v.optional(v.string()), // Optional active tank UUID
    title: v.string(),
    status: v.union(v.literal("active"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId", "updatedAt"])
    .index("by_user_tank", ["userId", "tankId"]),

  messages: defineTable({
    threadId: v.id("threads"),
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    structuredAnswer: v.optional(
      v.object({
        observedFacts: v.array(
          v.object({
            label: v.string(),
            value: v.string(),
            sourceId: v.string(),
            observedAt: v.string(),
            freshness: v.string(),
          })
        ),
        possibleCauses: v.array(
          v.object({
            text: v.string(),
            confidence: v.string(),
            evidenceIds: v.array(v.string()),
          })
        ),
        missingInformation: v.array(v.string()),
        recommendedNextSteps: v.array(v.string()),
        sources: v.array(
          v.object({
            title: v.string(),
            url: v.optional(v.string()),
          })
        ),
        safetyLevel: v.string(),
      })
    ),
    createdAt: v.number(),
  }).index("by_thread", ["threadId", "createdAt"]),

  memorySummaries: defineTable({
    userId: v.string(),
    tankId: v.optional(v.string()),
    summary: v.string(),
    sourceMessageIds: v.array(v.id("messages")),
    version: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId", "updatedAt"])
    .index("by_user_tank", ["userId", "tankId"]),

  knowledgeChunks: defineTable({
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    sourceTitle: v.string(),
    sourceUrl: v.optional(v.string()),
    isPublished: v.boolean(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  aiUsage: defineTable({
    userId: v.string(),
    modelId: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    neuronsEstimated: v.number(),
    timestamp: v.number(),
  }).index("by_user_day", ["userId", "timestamp"]),
});
