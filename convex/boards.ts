import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { getCurrentUser, getOrCreateCurrentUser } from "./users";

const boardReturn = v.object({
  _id: v.id("boards"),
  _creationTime: v.number(),
  ownerId: v.id("users"),
  title: v.string(),
  archivedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  lastOpenedAt: v.optional(v.number()),
});

function normalizeTitle(title: string) {
  const trimmed = title.trim();

  return trimmed.length > 0 ? trimmed : "Untitled board";
}

async function getBoardMembership(
  ctx: QueryCtx | MutationCtx,
  boardId: Id<"boards">,
  userId: Id<"users">,
) {
  return await ctx.db
    .query("boardMembers")
    .withIndex("by_boardId_and_userId", (q) =>
      q.eq("boardId", boardId).eq("userId", userId),
    )
    .unique();
}

async function requireBoardAccess(
  ctx: QueryCtx | MutationCtx,
  boardId: Id<"boards">,
  userId: Id<"users">,
) {
  const board = await ctx.db.get(boardId);

  if (!board || board.archivedAt !== undefined) {
    throw new Error("Board not found.");
  }

  if (board.ownerId === userId) {
    return board;
  }

  const membership = await getBoardMembership(ctx, boardId, userId);

  if (!membership) {
    throw new Error("You do not have access to this board.");
  }

  return board;
}

async function requireEditableBoard(
  ctx: MutationCtx,
  boardId: Id<"boards">,
  userId: Id<"users">,
) {
  const board = await requireBoardAccess(ctx, boardId, userId);

  if (board.ownerId === userId) {
    return board;
  }

  const membership = await getBoardMembership(ctx, boardId, userId);

  if (!membership || membership.role === "viewer") {
    throw new Error("You do not have permission to edit this board.");
  }

  return board;
}

async function requireOwnedBoard(
  ctx: MutationCtx,
  boardId: Id<"boards">,
  userId: Id<"users">,
) {
  const board = await requireBoardAccess(ctx, boardId, userId);

  if (board.ownerId !== userId) {
    throw new Error("Only the board owner can perform this action.");
  }

  return board;
}

export const list = query({
  args: {
    includeArchived: v.optional(v.boolean()),
  },
  returns: v.array(boardReturn),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (!user) {
      return [];
    }

    if (args.includeArchived) {
      return await ctx.db
        .query("boards")
        .withIndex("by_ownerId_and_updatedAt", (q) =>
          q.eq("ownerId", user._id),
        )
        .order("desc")
        .take(100);
    }

    return await ctx.db
      .query("boards")
      .withIndex("by_ownerId_and_archivedAt_and_updatedAt", (q) =>
        q.eq("ownerId", user._id).eq("archivedAt", undefined),
      )
      .order("desc")
      .take(100);
  },
});

export const get = query({
  args: {
    boardId: v.id("boards"),
  },
  returns: v.union(boardReturn, v.null()),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (!user) {
      return null;
    }

    return await requireBoardAccess(ctx, args.boardId, user._id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
  },
  returns: boardReturn,
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const now = Date.now();
    const boardId = await ctx.db.insert("boards", {
      ownerId: user._id,
      title: normalizeTitle(args.title),
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
    });

    await ctx.db.insert("boardMembers", {
      boardId,
      userId: user._id,
      role: "owner",
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
    });

    const board = await ctx.db.get(boardId);

    if (!board) {
      throw new Error("Could not create board.");
    }

    return board;
  },
});

export const rename = mutation({
  args: {
    boardId: v.id("boards"),
    title: v.string(),
  },
  returns: boardReturn,
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const board = await requireEditableBoard(ctx, args.boardId, user._id);
    const now = Date.now();

    await ctx.db.patch(board._id, {
      title: normalizeTitle(args.title),
      updatedAt: now,
    });

    const updatedBoard = await ctx.db.get(board._id);

    if (!updatedBoard) {
      throw new Error("Could not rename board.");
    }

    return updatedBoard;
  },
});

export const archive = mutation({
  args: {
    boardId: v.id("boards"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const board = await requireOwnedBoard(ctx, args.boardId, user._id);
    const now = Date.now();

    await ctx.db.patch(board._id, {
      archivedAt: now,
      updatedAt: now,
    });

    return null;
  },
});

export const markOpened = mutation({
  args: {
    boardId: v.id("boards"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    await requireBoardAccess(ctx, args.boardId, user._id);
    const membership = await getBoardMembership(ctx, args.boardId, user._id);
    const now = Date.now();

    if (!membership) {
      throw new Error("Board membership not found.");
    }

    await ctx.db.patch(membership._id, {
      lastOpenedAt: now,
      updatedAt: now,
    });

    return null;
  },
});
