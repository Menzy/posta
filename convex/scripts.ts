import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get scripts for a user (optionally filtered by project)
export const getScripts = query({
  args: { projectId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    if (args.projectId) {
      return await ctx.db
        .query("scripts")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("scripts")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get a single script by ID
export const getScript = query({
  args: { id: v.id("scripts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const script = await ctx.db.get(args.id);
    if (!script || script.userId !== userId) {
      return null;
    }

    return script;
  },
});

// Get scripts by project ID
export const getScriptsByProject = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    return await ctx.db
      .query("scripts")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

// Get uncategorized scripts (inbox)
export const getUncategorizedScripts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    return await ctx.db
      .query("scripts")
      .withIndex("by_user_uncategorized", (q) => q.eq("userId", userId).eq("projectId", undefined))
      .order("desc")
      .collect();
  },
});

// Create a new script
export const createScript = mutation({
  args: {
    title: v.string(),
    projectId: v.optional(v.string()),
    content: v.optional(v.array(
      v.object({
        id: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("heading"),
          v.literal("bullet"),
          v.literal("divider")
        ),
        content: v.string(),
        metadata: v.optional(v.any()),
      })
    )),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const now = Date.now();
    return await ctx.db.insert("scripts", {
      userId,
      projectId: args.projectId,
      title: args.title,
      content: args.content || [{
        id: crypto.randomUUID(),
        type: "text" as const,
        content: "",
      }],
      tags: args.tags || [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a script
export const updateScript = mutation({
  args: {
    id: v.id("scripts"),
    title: v.optional(v.string()),
    projectId: v.optional(v.string()),
    content: v.optional(v.array(
      v.object({
        id: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("heading"),
          v.literal("bullet"),
          v.literal("divider")
        ),
        content: v.string(),
        metadata: v.optional(v.any()),
      })
    )),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const script = await ctx.db.get(args.id);
    if (!script || script.userId !== userId) {
      throw new Error("Script not found or access denied");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.projectId !== undefined) updates.projectId = args.projectId;
    if (args.content !== undefined) updates.content = args.content;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.id, updates);
  },
});