import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function getBoardMembership(
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

export async function requireBoardAccess(
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

export async function requireEditableBoard(
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

export async function requireOwnedBoard(
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
