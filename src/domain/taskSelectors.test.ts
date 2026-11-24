import { describe, expect, it } from "vitest";
import {
  selectCompletedTasks,
  selectOpenTasks,
  selectTasksForList,
  selectTodayTasks,
  selectUpcomingTasks,
} from "./taskSelectors";
import type { Task } from "./types";

const today = "2026-11-24";

function task(overrides: Partial<Task> & { id: string }): Task {
  return {
    title: overrides.id,
    description: "",
    dueDate: null,
    listId: null,
    priority: 0,
    completedAt: null,
    position: 0,
    createdAt: "2026-11-01T10:00:00.000Z",
    ...overrides,
  };
}

const tasks: Task[] = [
  task({ id: "overdue", dueDate: "2026-11-20", position: 1 }),
  task({ id: "today-open", dueDate: today, position: 2 }),
  task({
    id: "today-done",
    dueDate: today,
    position: 3,
    completedAt: "2026-11-24T08:00:00.000Z",
  }),
  task({ id: "tomorrow", dueDate: "2026-11-25", position: 4 }),
  task({ id: "later", dueDate: "2026-12-02", position: 5 }),
  task({ id: "undated", position: 6 }),
  task({
    id: "old-done",
    dueDate: "2026-11-10",
    position: 7,
    completedAt: "2026-11-11T08:00:00.000Z",
    listId: "studier",
  }),
  task({ id: "list-open", listId: "studier", position: 8 }),
];

describe("selectOpenTasks", () => {
  it("returns open tasks sorted by position", () => {
    expect(selectOpenTasks(tasks).map((item) => item.id)).toEqual([
      "overdue",
      "today-open",
      "tomorrow",
      "later",
      "undated",
      "list-open",
    ]);
  });
});

describe("selectCompletedTasks", () => {
  it("returns completed tasks, newest first", () => {
    expect(selectCompletedTasks(tasks).map((item) => item.id)).toEqual([
      "today-done",
      "old-done",
    ]);
  });
});

describe("selectTodayTasks", () => {
  it("separates overdue and today's open tasks and reports progress", () => {
    const result = selectTodayTasks(tasks, today);
    expect(result.overdue.map((item) => item.id)).toEqual(["overdue"]);
    expect(result.today.map((item) => item.id)).toEqual(["today-open"]);
    expect(result.done).toBe(1);
    expect(result.total).toBe(2);
  });
});

describe("selectUpcomingTasks", () => {
  it("groups future open tasks by date", () => {
    const groups = selectUpcomingTasks(tasks, today, 7);
    expect(groups.map((group) => group.date)).toEqual(["2026-11-25"]);
    expect(groups[0]?.tasks.map((item) => item.id)).toEqual(["tomorrow"]);
  });
});

describe("selectTasksForList", () => {
  it("returns open tasks in the given list", () => {
    expect(selectTasksForList(tasks, "studier").map((item) => item.id)).toEqual(["list-open"]);
  });
});
