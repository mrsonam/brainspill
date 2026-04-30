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
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  boards: defineTable({
    ownerId: v.id("users"),
    title: v.string(),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastOpenedAt: v.optional(v.number()),
  })
    .index("by_ownerId_and_updatedAt", ["ownerId", "updatedAt"])
    .index("by_ownerId_and_archivedAt_and_updatedAt", [
      "ownerId",
      "archivedAt",
      "updatedAt",
    ]),

  boardMembers: defineTable({
    boardId: v.id("boards"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastOpenedAt: v.optional(v.number()),
  })
    .index("by_boardId", ["boardId"])
    .index("by_userId", ["userId"])
    .index("by_boardId_and_userId", ["boardId", "userId"]),

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
    .index("by_boardId", ["boardId"])
    .index("by_ownerId", ["ownerId"]),

  documentSnapshots: defineTable({
    boardId: v.id("boards"),
    storageId: v.optional(v.id("_storage")),
    updateClock: v.optional(v.number()),
    byteSize: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_boardId_and_createdAt", ["boardId", "createdAt"])
    .index("by_createdBy", ["createdBy"]),

  /** Latest serialized canvas scene per board (blob in file storage). */
  boardScenes: defineTable({
    boardId: v.id("boards"),
    storageId: v.id("_storage"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
    byteSize: v.number(),
  }).index("by_boardId", ["boardId"]),
});
