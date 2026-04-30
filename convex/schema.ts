import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    tokenIdentifier: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_token_identifier", ["tokenIdentifier"]),

  boards: defineTable({
    ownerId: v.id("users"),
    title: v.string(),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastOpenedAt: v.optional(v.number()),
  })
    .index("by_owner_updated", ["ownerId", "updatedAt"])
    .index("by_owner_archived", ["ownerId", "archivedAt"]),

  boardMembers: defineTable({
    boardId: v.id("boards"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_board", ["boardId"])
    .index("by_user", ["userId"])
    .index("by_board_user", ["boardId", "userId"]),

  assets: defineTable({
    boardId: v.id("boards"),
    ownerId: v.id("users"),
    storageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    mimeType: v.string(),
    fileSize: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    transparent: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_board", ["boardId"])
    .index("by_owner", ["ownerId"]),

  documentSnapshots: defineTable({
    boardId: v.id("boards"),
    storageId: v.optional(v.id("_storage")),
    updateClock: v.optional(v.number()),
    byteSize: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_board_created", ["boardId", "createdAt"])
    .index("by_creator", ["createdBy"]),
});
