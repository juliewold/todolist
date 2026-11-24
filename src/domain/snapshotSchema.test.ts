import { describe, expect, it } from "vitest";
import { parseSnapshot } from "./snapshotSchema";

const valid = {
  version: 1,
  exportedAt: "2026-11-24T10:00:00.000Z",
  taskLists: [{ id: "l1", name: "Studier", color: "#7f9a72", position: 0 }],
  tasks: [
    {
      id: "t1",
      title: "Lese",
      description: "",
      dueDate: "2026-11-24",
      listId: "l1",
      priority: 3,
      completedAt: null,
      position: 0,
      createdAt: "2026-11-20T10:00:00.000Z",
    },
  ],
  habits: [
    {
      id: "h1",
      name: "Lesing",
      icon: "book-open",
      color: "blue",
      kind: "duration",
      unit: "min",
      target: 20,
      goalPeriod: "daily",
      position: 0,
    },
  ],
  habitEntries: [{ id: "e1", habitId: "h1", date: "2026-11-24", value: 25 }],
};

describe("parseSnapshot", () => {
  it("accepts a valid export", () => {
    expect(parseSnapshot(valid).tasks[0]?.priority).toBe(3);
  });

  it("rejects unknown versions", () => {
    expect(() => parseSnapshot({ ...valid, version: 2 })).toThrow("Ugyldig dataformat");
  });

  it("rejects invalid dates", () => {
    const broken = { ...valid, habitEntries: [{ ...valid.habitEntries[0], date: "2026-02-31" }] };
    expect(() => parseSnapshot(broken)).toThrow("habitEntries[0].date");
  });

  it("rejects unknown habit kinds", () => {
    const broken = { ...valid, habits: [{ ...valid.habits[0], kind: "sleep" }] };
    expect(() => parseSnapshot(broken)).toThrow("habits[0].kind");
  });

  it("rejects non-object input", () => {
    expect(() => parseSnapshot("hei")).toThrow();
    expect(() => parseSnapshot(null)).toThrow();
  });
});
