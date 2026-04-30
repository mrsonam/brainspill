const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * IDs created by the local-only prototype store (crypto.randomUUID or `board-*`).
 * Convex document IDs are opaque strings that do not match these patterns.
 */
export function isLocalPrototypeBoardId(id: string): boolean {
  return UUID_V4_RE.test(id) || id.startsWith("board-");
}
