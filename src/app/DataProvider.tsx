import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { parseSnapshot } from "../domain/snapshotSchema";
import { snapshotReducer, type SnapshotAction } from "../domain/snapshotReducer";
import { createId } from "../domain/ids";
import type { DataSnapshot, Habit, HabitEntry, Task, TaskList } from "../domain/types";
import type { TodoRepository } from "../data/repository";
import { DataContext, type DataActions, type DataContextValue } from "./dataContext";

interface DataProviderProps {
  repository: TodoRepository;
  children: ReactNode;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ukjent feil";
}

export function DataProvider({ repository, children }: DataProviderProps) {
  const [snapshot, setSnapshot] = useState<DataSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    repository
      .load()
      .then((loaded) => {
        if (active) {
          setSnapshot(loaded);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(errorMessage(error));
        }
      });
    return () => {
      active = false;
    };
  }, [repository]);

  /** Applies the change locally straight away, then persists it. */
  const commit = useCallback(
    (action: SnapshotAction, persist: () => Promise<void>) => {
      setSnapshot((current) => (current ? snapshotReducer(current, action) : current));
      persist().catch((error: unknown) => {
        setSaveError(errorMessage(error));
      });
    },
    [],
  );

  const actions = useMemo<DataActions>(() => {
    const current = (): DataSnapshot | null => snapshot;

    return {
      saveTaskList(list: TaskList) {
        commit({ type: "upsertTaskList", list }, () => repository.saveTaskList(list));
      },
      deleteTaskList(id: string) {
        commit({ type: "deleteTaskList", id }, () => repository.deleteTaskList(id));
      },
      saveTask(task: Task) {
        commit({ type: "upsertTasks", tasks: [task] }, () => repository.saveTasks([task]));
      },
      saveTasks(tasks: readonly Task[]) {
        commit({ type: "upsertTasks", tasks: [...tasks] }, () => repository.saveTasks(tasks));
      },
      toggleTask(id: string) {
        const task = current()?.tasks.find((item) => item.id === id);
        if (!task) {
          return;
        }
        const updated: Task = {
          ...task,
          completedAt: task.completedAt === null ? new Date().toISOString() : null,
        };
        commit({ type: "upsertTasks", tasks: [updated] }, () => repository.saveTasks([updated]));
      },
      deleteTask(id: string) {
        commit({ type: "deleteTask", id }, () => repository.deleteTask(id));
      },
      saveHabit(habit: Habit) {
        commit({ type: "upsertHabit", habit }, () => repository.saveHabit(habit));
      },
      deleteHabit(id: string) {
        commit({ type: "deleteHabit", id }, () => repository.deleteHabit(id));
      },
      setHabitValue(habitId: string, date: string, value: number) {
        const existing = current()?.habitEntries.find(
          (entry) => entry.habitId === habitId && entry.date === date,
        );
        if (value <= 0) {
          if (existing) {
            commit({ type: "deleteHabitEntry", id: existing.id }, () =>
              repository.deleteHabitEntry(existing.id),
            );
          }
          return;
        }
        const entry: HabitEntry = existing
          ? { ...existing, value }
          : { id: createId(), habitId, date, value };
        commit({ type: "upsertHabitEntry", entry }, () => repository.saveHabitEntry(entry));
      },
      async importSnapshot(input: DataSnapshot) {
        const parsed = parseSnapshot(input);
        await repository.importSnapshot(parsed);
        setSnapshot(await repository.load());
      },
      clearSaveError() {
        setSaveError(null);
      },
    };
  }, [commit, repository, snapshot]);

  const value = useMemo<DataContextValue>(
    () => ({ snapshot, loadError, saveError, actions }),
    [snapshot, loadError, saveError, actions],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
