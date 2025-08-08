import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate upload URL for file uploads
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.storage.generateUploadUrl();
  },
});

// Create inspiration from uploaded file
export const createImageInspiration = mutation({
  args: {
    fileId: v.id("_storage"),
    title: v.string(),
    projectId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({
      filename: v.optional(v.string()),
      fileSize: v.optional(v.number()),
      mimeType: v.optional(v.string()),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const now = Date.now();
    return await ctx.db.insert("inspirations", {
      userId,
      projectId: args.projectId,
      type: "image",
      title: args.title,
      fileId: args.fileId,
      metadata: args.metadata || {},
      tags: args.tags || [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get file URL
export const getFileUrl = query({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.getUrl(args.fileId);
  },
});

// Delete file and related inspiration
export const deleteFile = mutation({
  args: { 
    fileId: v.id("_storage"),
    inspirationId: v.optional(v.id("inspirations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    // If there's an associated inspiration, verify ownership and delete it
    if (args.inspirationId) {
      const inspiration = await ctx.db.get(args.inspirationId);
      if (inspiration && inspiration.userId === userId) {
        await ctx.db.delete(args.inspirationId);
      }
    }

    // Delete the file from storage
    await ctx.storage.delete(args.fileId);
  },
});

// Get all uploaded images for a user
export const getUserImages = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const imageInspirations = await ctx.db
      .query("inspirations")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("type", "image"))
      .order("desc")
      .collect();

    // Get URLs for all images
    const imagesWithUrls = await Promise.all(
      imageInspirations.map(async (inspiration) => {
        if (inspiration.fileId) {
          const url = await ctx.storage.getUrl(inspiration.fileId);
          return {
            ...inspiration,
            url,
          };
        }
        return inspiration;
      })
    );

    return imagesWithUrls;
  },
});