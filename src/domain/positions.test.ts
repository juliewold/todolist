import { describe, expect, it } from "vitest";
import { nextPosition, reorderVisible } from "./positions";

const items = [
  { id: "a", position: 0 },
  { id: "b", position: 1 },
  { id: "c", position: 2 },
  { id: "d", position: 3 },
];

describe("nextPosition", () => {
  it("places new items after the highest position", () => {
    expect(nextPosition(items)).toBe(4);
    expect(nextPosition([])).toBe(0);
  });
});

describe("reorderVisible", () => {
  it("reuses the visible slots in their new order", () => {
    const changed = reorderVisible(items, ["c", "a", "d"]);
    expect(changed).toEqual([
      { id: "c", position: 0 },
      { id: "a", position: 2 },
    ]);
  });

  it("keeps hidden items in their place", () => {
    const changed = reorderVisible(items, ["d", "b"]);
    expect(changed.map((item) => item.id)).toEqual(["d", "b"]);
    expect(changed.find((item) => item.id === "a")).toBeUndefined();
  });
});
