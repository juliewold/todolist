import { describe, expect, it } from "vitest";
import { snapshotReducer } from "./snapshotReducer";
import type { DataSnapshot, Habit, Task } from "./types";

const emptySnapshot: DataSnapshot = {
  version: 1,
  exportedAt: "2026-11-24T00:00:00.000Z",
  taskLists: [{ id: "studier", name: "Studier", color: "#7f9a72", position: 0 }],
  tasks: [
    {
      id: "t1",
      title: "Lese",
      description: "",
      dueDate: null,
      listId: "studier",
      priority: 0,
      completedAt: null,
      position: 0,
      createdAt: "2026-11-01T00:00:00.000Z",
    },
  ],
  habits: [],
  habitEntries: [],
};

const habit: Habit = {
  id: "h1",
  name: "Lesing",
  icon: "book-open",
  color: "blue",
  kind: "duration",
  unit: "min",
  target: 20,
  goalPeriod: "daily",
  position: 0,
};

describe("snapshotReducer", () => {
  it("updates an existing task without duplicating it", () => {
    const task = emptySnapshot.tasks[0] as Task;
    const next = snapshotReducer(emptySnapshot, {
      type: "upsertTasks",
      tasks: [{ ...task, completedAt: "2026-11-24T10:00:00.000Z" }],
    });
    expect(next.tasks).toHaveLength(1);
    expect(next.tasks[0]?.completedAt).toBe("2026-11-24T10:00:00.000Z");
  });

  it("clears the list reference of tasks when their list is deleted", () => {
    const next = snapshotReducer(emptySnapshot, { type: "deleteTaskList", id: "studier" });
    expect(next.taskLists).toEqual([]);
    expect(next.tasks[0]?.listId).toBeNull();
  });

  it("removes habit entries together with the habit", () => {
    const withEntries: DataSnapshot = {
      ...emptySnapshot,
      habits: [habit],
      habitEntries: [{ id: "e1", habitId: "h1", date: "2026-11-24", value: 20 }],
    };
    const next = snapshotReducer(withEntries, { type: "deleteHabit", id: "h1" });
    expect(next.habits).toEqual([]);
    expect(next.habitEntries).toEqual([]);
  });

  it("adds new habit entries", () => {
    const next = snapshotReducer(emptySnapshot, {
      type: "upsertHabitEntry",
      entry: { id: "e2", habitId: "h1", date: "2026-11-24", value: 5 },
    });
    expect(next.habitEntries).toHaveLength(1);
  });
});
