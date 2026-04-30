import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireBoardAccess, requireEditableBoard } from "./boardAccess";
import { getCurrentUser, getOrCreateCurrentUser } from "./users";

const MAX_SCENE_BYTES = 16 * 1024 * 1024;

const boardSceneDownloadReturn = v.object({
  url: v.string(),
  updatedAt: v.number(),
  byteSize: v.number(),
});

export const generateSceneUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (!user) {
      throw new Error("Sign in to sync your canvas.");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const commitBoardScene = mutation({
  args: {
    boardId: v.id("boards"),
    storageId: v.id("_storage"),
    byteSize: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    await requireEditableBoard(ctx, args.boardId, user._id);

    if (args.byteSize <= 0 || args.byteSize > MAX_SCENE_BYTES) {
      throw new Error("Scene snapshot size is out of bounds.");
    }

    const existing = await ctx.db
      .query("boardScenes")
      .withIndex("by_boardId", (q) => q.eq("boardId", args.boardId))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.storage.delete(existing.storageId);
      await ctx.db.patch(existing._id, {
        storageId: args.storageId,
        updatedAt: now,
        updatedBy: user._id,
        byteSize: args.byteSize,
      });
    } else {
      await ctx.db.insert("boardScenes", {
        boardId: args.boardId,
        storageId: args.storageId,
        updatedAt: now,
        updatedBy: user._id,
        byteSize: args.byteSize,
      });
    }

    return null;
  },
});

export const getBoardSceneDownload = query({
  args: {
    boardId: v.id("boards"),
  },
  returns: v.union(boardSceneDownloadReturn, v.null()),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (!user) {
      return null;
    }

    await requireBoardAccess(ctx, args.boardId, user._id);

    const row = await ctx.db
      .query("boardScenes")
      .withIndex("by_boardId", (q) => q.eq("boardId", args.boardId))
      .unique();

    if (!row) {
      return null;
    }

    const url = await ctx.storage.getUrl(row.storageId);

    if (!url) {
      return null;
    }

    return {
      url,
      updatedAt: row.updatedAt,
      byteSize: row.byteSize,
    };
  },
});
