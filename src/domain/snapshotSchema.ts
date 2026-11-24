import { isIsoDate } from "./dates";
import type {
  DataSnapshot,
  GoalPeriod,
  Habit,
  HabitColorName,
  HabitEntry,
  HabitIconName,
  HabitKind,
  Priority,
  Task,
  TaskList,
} from "./types";

const HABIT_KINDS: readonly HabitKind[] = ["yesNo", "duration", "quantity"];
const GOAL_PERIODS: readonly GoalPeriod[] = ["daily", "weekly"];
const HABIT_ICONS: readonly HabitIconName[] = [
  "dumbbell",
  "book-open",
  "graduation-cap",
  "heart",
  "leaf",
  "sun",
];
const HABIT_COLORS: readonly HabitColorName[] = [
  "rose",
  "blue",
  "sage",
  "lavender",
  "amber",
  "peach",
];

type Json = Record<string, unknown>;

class SnapshotFormatError extends Error {}

function fail(path: string): never {
  throw new SnapshotFormatError(`Ugyldig dataformat: ${path}`);
}

function asRecord(value: unknown, path: string): Json {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(path);
  }
  return value as Json;
}

function asArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    fail(path);
  }
  return value;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    fail(path);
  }
  return value;
}

function asNullableString(value: unknown, path: string): string | null {
  return value === null ? null : asString(value, path);
}

function asNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(path);
  }
  return value;
}

function asNullableNumber(value: unknown, path: string): number | null {
  return value === null ? null : asNumber(value, path);
}

function asOneOf<T extends string>(value: unknown, options: readonly T[], path: string): T {
  if (typeof value !== "string" || !options.includes(value as T)) {
    fail(path);
  }
  return value as T;
}

const PRIORITIES: readonly number[] = [0, 1, 2, 3];

function asPriority(value: unknown, path: string): Priority {
  const priority = asNumber(value, path);
  if (!PRIORITIES.includes(priority)) {
    fail(path);
  }
  return priority as Priority;
}

function asDate(value: unknown, path: string): string {
  const text = asString(value, path);
  if (!isIsoDate(text)) {
    fail(path);
  }
  return text;
}

function parseTaskList(value: unknown, path: string): TaskList {
  const record = asRecord(value, path);
  return {
    id: asString(record["id"], `${path}.id`),
    name: asString(record["name"], `${path}.name`),
    color: asString(record["color"], `${path}.color`),
    position: asNumber(record["position"], `${path}.position`),
  };
}

function parseTask(value: unknown, path: string): Task {
  const record = asRecord(value, path);
  return {
    id: asString(record["id"], `${path}.id`),
    title: asString(record["title"], `${path}.title`),
    description: asString(record["description"], `${path}.description`),
    dueDate: record["dueDate"] === null ? null : asDate(record["dueDate"], `${path}.dueDate`),
    listId: asNullableString(record["listId"], `${path}.listId`),
    priority: asPriority(record["priority"], `${path}.priority`),
    completedAt: asNullableString(record["completedAt"], `${path}.completedAt`),
    position: asNumber(record["position"], `${path}.position`),
    createdAt: asString(record["createdAt"], `${path}.createdAt`),
  };
}

function parseHabit(value: unknown, path: string): Habit {
  const record = asRecord(value, path);
  return {
    id: asString(record["id"], `${path}.id`),
    name: asString(record["name"], `${path}.name`),
    icon: asOneOf(record["icon"], HABIT_ICONS, `${path}.icon`),
    color: asOneOf(record["color"], HABIT_COLORS, `${path}.color`),
    kind: asOneOf(record["kind"], HABIT_KINDS, `${path}.kind`),
    unit: asString(record["unit"], `${path}.unit`),
    target: asNullableNumber(record["target"], `${path}.target`),
    goalPeriod: asOneOf(record["goalPeriod"], GOAL_PERIODS, `${path}.goalPeriod`),
    position: asNumber(record["position"], `${path}.position`),
  };
}

function parseHabitEntry(value: unknown, path: string): HabitEntry {
  const record = asRecord(value, path);
  return {
    id: asString(record["id"], `${path}.id`),
    habitId: asString(record["habitId"], `${path}.habitId`),
    date: asDate(record["date"], `${path}.date`),
    value: asNumber(record["value"], `${path}.value`),
  };
}

/**
 * Validates an untrusted JSON value (for example an imported file) and returns a typed snapshot.
 * Throws a Norwegian error message when the data does not match the expected format.
 */
export function parseSnapshot(value: unknown): DataSnapshot {
  const record = asRecord(value, "root");
  if (record["version"] !== 1) {
    fail("version");
  }
  return {
    version: 1,
    exportedAt: asString(record["exportedAt"], "exportedAt"),
    taskLists: asArray(record["taskLists"], "taskLists").map((item, index) =>
      parseTaskList(item, `taskLists[${index}]`),
    ),
    tasks: asArray(record["tasks"], "tasks").map((item, index) =>
      parseTask(item, `tasks[${index}]`),
    ),
    habits: asArray(record["habits"], "habits").map((item, index) =>
      parseHabit(item, `habits[${index}]`),
    ),
    habitEntries: asArray(record["habitEntries"], "habitEntries").map((item, index) =>
      parseHabitEntry(item, `habitEntries[${index}]`),
    ),
  };
}

export function isSnapshotFormatError(error: unknown): error is Error {
  return error instanceof SnapshotFormatError;
}
