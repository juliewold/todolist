import type { DataSnapshot, Habit, HabitEntry, Task, TaskList } from "./types";

/** Pure state transitions for the in-memory copy of the user's data. */
export type SnapshotAction =
  | { type: "replace"; snapshot: DataSnapshot }
  | { type: "upsertTaskList"; list: TaskList }
  | { type: "deleteTaskList"; id: string }
  | { type: "upsertTasks"; tasks: Task[] }
  | { type: "deleteTask"; id: string }
  | { type: "upsertHabit"; habit: Habit }
  | { type: "deleteHabit"; id: string }
  | { type: "upsertHabitEntry"; entry: HabitEntry }
  | { type: "deleteHabitEntry"; id: string };

function upsert<T extends { id: string }>(items: readonly T[], item: T): T[] {
  const exists = items.some((existing) => existing.id === item.id);
  return exists
    ? items.map((existing) => (existing.id === item.id ? item : existing))
    : [...items, item];
}

function upsertMany<T extends { id: string }>(items: readonly T[], changed: readonly T[]): T[] {
  return changed.reduce((result, item) => upsert(result, item), [...items]);
}

export function snapshotReducer(state: DataSnapshot, action: SnapshotAction): DataSnapshot {
  switch (action.type) {
    case "replace":
      return action.snapshot;
    case "upsertTaskList":
      return { ...state, taskLists: upsert(state.taskLists, action.list) };
    case "deleteTaskList":
      return {
        ...state,
        taskLists: state.taskLists.filter((list) => list.id !== action.id),
        tasks: state.tasks.map((task) =>
          task.listId === action.id ? { ...task, listId: null } : task,
        ),
      };
    case "upsertTasks":
      return { ...state, tasks: upsertMany(state.tasks, action.tasks) };
    case "deleteTask":
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id) };
    case "upsertHabit":
      return { ...state, habits: upsert(state.habits, action.habit) };
    case "deleteHabit":
      return {
        ...state,
        habits: state.habits.filter((habit) => habit.id !== action.id),
        habitEntries: state.habitEntries.filter((entry) => entry.habitId !== action.id),
      };
    case "upsertHabitEntry":
      return { ...state, habitEntries: upsert(state.habitEntries, action.entry) };
    case "deleteHabitEntry":
      return {
        ...state,
        habitEntries: state.habitEntries.filter((entry) => entry.id !== action.id),
      };
  }
}
