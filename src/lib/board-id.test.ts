import { describe, expect, it } from "vitest";

import { isLocalPrototypeBoardId } from "./board-id";

describe("isLocalPrototypeBoardId", () => {
  it("treats UUID v4 ids as local prototype ids", () => {
    expect(
      isLocalPrototypeBoardId("550e8400-e29b-41d4-a716-446655440000"),
    ).toBe(true);
  });

  it("treats legacy random ids as local prototype ids", () => {
    expect(isLocalPrototypeBoardId("board-a1b2c3d4")).toBe(true);
  });

  it("does not treat convex-looking opaque ids as local", () => {
    expect(isLocalPrototypeBoardId("jd71bcdef012345678901234567890a")).toBe(
      false,
    );
  });
});
