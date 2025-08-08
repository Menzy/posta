import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Projects - Main containers for content
  projects: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Scripts - Content pieces that can belong to projects or be uncategorized
  scripts: defineTable({
    userId: v.string(),
    projectId: v.optional(v.string()), // null for uncategorized
    title: v.string(),
    content: v.array(
      v.object({
        id: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("heading"),
          v.literal("bullet"),
          v.literal("divider"),
          v.literal("code"),
          v.literal("quote")
        ),
        content: v.string(),
        metadata: v.optional(v.any()),
      })
    ),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_user_uncategorized", ["userId", "projectId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Notes - General notes that can belong to projects or be standalone
  notes: defineTable({
    userId: v.string(),
    projectId: v.optional(v.string()),
    title: v.string(),
    content: v.array(
      v.object({
        id: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("heading"),
          v.literal("bullet"),
          v.literal("divider"),
          v.literal("code"),
          v.literal("quote")
        ),
        content: v.string(),
        metadata: v.optional(v.any()),
      })
    ),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Inspirations - External links, images, files
  inspirations: defineTable({
    userId: v.string(),
    projectId: v.optional(v.string()),
    type: v.union(v.literal("link"), v.literal("image"), v.literal("file")),
    title: v.string(),
    url: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")), // For uploaded files
    metadata: v.optional(
      v.object({
        description: v.optional(v.string()),
        thumbnail: v.optional(v.string()),
        domain: v.optional(v.string()),
        author: v.optional(v.string()),
        publishedAt: v.optional(v.string()),
        duration: v.optional(v.string()), // For videos
        fileSize: v.optional(v.number()),
        mimeType: v.optional(v.string()),
        filename: v.optional(v.string()), // For uploaded files
        width: v.optional(v.number()), // For images
        height: v.optional(v.number()), // For images
      })
    ),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_user_type", ["userId", "type"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Tags - For organization across all content types
  tags: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.optional(v.string()),
    usageCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),

  // User preferences and settings
  userSettings: defineTable({
    userId: v.string(),
    preferences: v.object({
      theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
      defaultView: v.union(v.literal("projects"), v.literal("inbox"), v.literal("recent")),
      compactMode: v.boolean(),
      showPreviewCards: v.boolean(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),
});