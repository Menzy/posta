import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get inspirations for a user (optionally filtered by project)
export const getInspirations = query({
  args: { projectId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    if (args.projectId) {
      return await ctx.db
        .query("inspirations")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("inspirations")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get inspirations by project ID
export const getInspirationsByProject = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    return await ctx.db
      .query("inspirations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

// Create a new inspiration with metadata fetching
export const createInspiration = mutation({
  args: {
    title: v.string(),
    url: v.optional(v.string()),
    type: v.union(v.literal("link"), v.literal("image"), v.literal("file")),
    projectId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    let metadata = {};
    
    // If it's a link, try to fetch metadata
    if (args.type === "link" && args.url) {
      metadata = await fetchLinkMetadata(args.url);
    }

    const now = Date.now();
    return await ctx.db.insert("inspirations", {
      userId,
      projectId: args.projectId,
      type: args.type,
      title: args.title,
      url: args.url,
      metadata,
      tags: args.tags || [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an inspiration
export const updateInspiration = mutation({
  args: {
    id: v.id("inspirations"),
    title: v.optional(v.string()),
    projectId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const inspiration = await ctx.db.get(args.id);
    if (!inspiration || inspiration.userId !== userId) {
      throw new Error("Inspiration not found or access denied");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.projectId !== undefined) updates.projectId = args.projectId;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.id, updates);
  },
});

// Delete an inspiration
export const deleteInspiration = mutation({
  args: { id: v.id("inspirations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const inspiration = await ctx.db.get(args.id);
    if (!inspiration || inspiration.userId !== userId) {
      throw new Error("Inspiration not found or access denied");
    }

    await ctx.db.delete(args.id);
  },
});

// Helper function to fetch link metadata
async function fetchLinkMetadata(url: string) {
  try {
    // Parse the URL to get domain info
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Basic metadata structure
    let metadata: any = {
      domain,
      description: "External link",
    };

    // Add specific handling for popular platforms
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      metadata.type = 'video';
      metadata.platform = 'YouTube';
      
      // Extract video ID for thumbnail
      let videoId = '';
      if (domain.includes('youtube.com')) {
        const searchParams = new URLSearchParams(urlObj.search);
        videoId = searchParams.get('v') || '';
      } else if (domain.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
      }
      
      if (videoId) {
        metadata.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        metadata.videoId = videoId;
      }
    } else if (domain.includes('instagram.com')) {
      metadata.type = 'social';
      metadata.platform = 'Instagram';
    } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
      metadata.type = 'social';
      metadata.platform = 'Twitter/X';
    } else if (domain.includes('tiktok.com')) {
      metadata.type = 'video';
      metadata.platform = 'TikTok';
    } else {
      metadata.type = 'webpage';
    }

    return metadata;
  } catch (error) {
    // If URL parsing fails, return basic metadata
    return {
      domain: 'unknown',
      description: 'External link',
      type: 'webpage',
    };
  }
}