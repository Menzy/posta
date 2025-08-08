import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all tags for a user
export const getTags = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// Get tags with usage count
export const getTagsWithUsage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tags = await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Calculate actual usage across all content types
    const tagUsage = new Map<string, number>();
    
    // Count projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    
    // Count scripts
    const scripts = await ctx.db
      .query("scripts")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    
    // Count notes
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    
    // Count inspirations
    const inspirations = await ctx.db
      .query("inspirations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Calculate usage
    [...projects, ...scripts, ...notes, ...inspirations].forEach((item) => {
      item.tags.forEach((tag) => {
        tagUsage.set(tag, (tagUsage.get(tag) || 0) + 1);
      });
    });

    return tags.map((tag) => ({
      ...tag,
      actualUsageCount: tagUsage.get(tag.name) || 0,
    }));
  },
});

// Create or update a tag
export const createTag = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if tag already exists
    const existingTag = await ctx.db
      .query("tags")
      .withIndex("by_user_name", (q) => 
        q.eq("userId", identity.subject).eq("name", args.name.toLowerCase())
      )
      .first();

    if (existingTag) {
      // Update existing tag
      return await ctx.db.patch(existingTag._id, {
        color: args.color,
      });
    }

    // Create new tag
    return await ctx.db.insert("tags", {
      userId: identity.subject,
      name: args.name.toLowerCase(),
      color: args.color,
      usageCount: 0,
      createdAt: Date.now(),
    });
  },
});

// Delete a tag
export const deleteTag = mutation({
  args: {
    id: v.id("tags"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tag = await ctx.db.get(args.id);
    if (!tag || tag.userId !== identity.subject) {
      throw new Error("Tag not found or access denied");
    }

    // Remove tag from all content before deleting
    const tagName = tag.name;
    
    // Remove from projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    
    for (const project of projects) {
      if (project.tags.includes(tagName)) {
        await ctx.db.patch(project._id, {
          tags: project.tags.filter(t => t !== tagName),
          updatedAt: Date.now(),
        });
      }
    }

    // Remove from scripts
    const scripts = await ctx.db
      .query("scripts")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    
    for (const script of scripts) {
      if (script.tags.includes(tagName)) {
        await ctx.db.patch(script._id, {
          tags: script.tags.filter(t => t !== tagName),
          updatedAt: Date.now(),
        });
      }
    }

    // Remove from notes
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    
    for (const note of notes) {
      if (note.tags.includes(tagName)) {
        await ctx.db.patch(note._id, {
          tags: note.tags.filter(t => t !== tagName),
          updatedAt: Date.now(),
        });
      }
    }

    // Remove from inspirations
    const inspirations = await ctx.db
      .query("inspirations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    
    for (const inspiration of inspirations) {
      if (inspiration.tags.includes(tagName)) {
        await ctx.db.patch(inspiration._id, {
          tags: inspiration.tags.filter(t => t !== tagName),
          updatedAt: Date.now(),
        });
      }
    }

    // Delete the tag
    await ctx.db.delete(args.id);
  },
});

// Add tag to content item
export const addTagToItem = mutation({
  args: {
    itemType: v.union(v.literal("projects"), v.literal("scripts"), v.literal("notes"), v.literal("inspirations")),
    itemId: v.string(),
    tagName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the item
    const item = await ctx.db.get(args.itemId as any);
    if (!item || item.userId !== identity.subject) {
      throw new Error("Item not found or access denied");
    }

    const tagName = args.tagName.toLowerCase();

    // Don't add if already exists
    if (item.tags.includes(tagName)) {
      return;
    }

    // Add tag to item
    await ctx.db.patch(args.itemId as any, {
      tags: [...item.tags, tagName],
      updatedAt: Date.now(),
    });

    // Create tag if it doesn't exist
    const existingTag = await ctx.db
      .query("tags")
      .withIndex("by_user_name", (q) => 
        q.eq("userId", identity.subject).eq("name", tagName)
      )
      .first();

    if (!existingTag) {
      await ctx.db.insert("tags", {
        userId: identity.subject,
        name: tagName,
        usageCount: 1,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.patch(existingTag._id, {
        usageCount: existingTag.usageCount + 1,
      });
    }
  },
});

// Remove tag from content item
export const removeTagFromItem = mutation({
  args: {
    itemType: v.union(v.literal("projects"), v.literal("scripts"), v.literal("notes"), v.literal("inspirations")),
    itemId: v.string(),
    tagName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the item
    const item = await ctx.db.get(args.itemId as any);
    if (!item || item.userId !== identity.subject) {
      throw new Error("Item not found or access denied");
    }

    const tagName = args.tagName.toLowerCase();

    // Remove tag from item
    await ctx.db.patch(args.itemId as any, {
      tags: item.tags.filter(t => t !== tagName),
      updatedAt: Date.now(),
    });

    // Update tag usage count
    const tag = await ctx.db
      .query("tags")
      .withIndex("by_user_name", (q) => 
        q.eq("userId", identity.subject).eq("name", tagName)
      )
      .first();

    if (tag) {
      const newCount = Math.max(0, tag.usageCount - 1);
      if (newCount === 0) {
        // Optionally delete unused tags
        // await ctx.db.delete(tag._id);
      } else {
        await ctx.db.patch(tag._id, {
          usageCount: newCount,
        });
      }
    }
  },
});

// Get content by tag
export const getContentByTag = query({
  args: {
    tagName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tagName = args.tagName.toLowerCase();
    
    const [projects, scripts, notes, inspirations] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .filter((q) => q.field("tags").includes(tagName))
        .collect(),
      ctx.db
        .query("scripts")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .filter((q) => q.field("tags").includes(tagName))
        .collect(),
      ctx.db
        .query("notes")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .filter((q) => q.field("tags").includes(tagName))
        .collect(),
      ctx.db
        .query("inspirations")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .filter((q) => q.field("tags").includes(tagName))
        .collect(),
    ]);

    return {
      projects: projects.map(p => ({ ...p, type: "project" as const })),
      scripts: scripts.map(s => ({ ...s, type: "script" as const })),
      notes: notes.map(n => ({ ...n, type: "note" as const })),
      inspirations: inspirations.map(i => ({ ...i, type: "inspiration" as const })),
    };
  },
});