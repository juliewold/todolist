import { parseSnapshot } from "../domain/snapshotSchema";
import { snapshotReducer, type SnapshotAction } from "../domain/snapshotReducer";
import type { DataSnapshot, Habit, HabitEntry, Task, TaskList } from "../domain/types";
import type { TodoRepository } from "./repository";

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const LOCAL_STORAGE_KEY = "todo.data.v1";

export function createEmptySnapshot(now: Date = new Date()): DataSnapshot {
  return {
    version: 1,
    exportedAt: now.toISOString(),
    taskLists: [],
    tasks: [],
    habits: [],
    habitEntries: [],
  };
}

/** A repository that keeps all data in a key-value store, used offline and in tests. */
export function createLocalRepository(
  storage: KeyValueStorage,
  key: string = LOCAL_STORAGE_KEY,
): TodoRepository {
  const read = (): DataSnapshot => {
    const raw = storage.getItem(key);
    if (raw === null) {
      return createEmptySnapshot();
    }
    try {
      return parseSnapshot(JSON.parse(raw));
    } catch {
      return createEmptySnapshot();
    }
  };

  const apply = async (...actions: SnapshotAction[]): Promise<void> => {
    const next = actions.reduce(snapshotReducer, read());
    storage.setItem(key, JSON.stringify(next));
  };

  return {
    load: async () => read(),
    saveTaskList: (list: TaskList) => apply({ type: "upsertTaskList", list }),
    deleteTaskList: (id: string) => apply({ type: "deleteTaskList", id }),
    saveTasks: (tasks: readonly Task[]) => apply({ type: "upsertTasks", tasks: [...tasks] }),
    deleteTask: (id: string) => apply({ type: "deleteTask", id }),
    saveHabit: (habit: Habit) => apply({ type: "upsertHabit", habit }),
    deleteHabit: (id: string) => apply({ type: "deleteHabit", id }),
    saveHabitEntry: (entry: HabitEntry) => apply({ type: "upsertHabitEntry", entry }),
    deleteHabitEntry: (id: string) => apply({ type: "deleteHabitEntry", id }),
    importSnapshot: (snapshot: DataSnapshot) =>
      apply(
        ...snapshot.taskLists.map((list): SnapshotAction => ({ type: "upsertTaskList", list })),
        { type: "upsertTasks", tasks: snapshot.tasks },
        ...snapshot.habits.map((habit): SnapshotAction => ({ type: "upsertHabit", habit })),
        ...snapshot.habitEntries.map(
          (entry): SnapshotAction => ({ type: "upsertHabitEntry", entry }),
        ),
      ),
  };
}
