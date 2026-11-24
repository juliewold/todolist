import { createContext } from "react";
import type { DataSnapshot, Habit, Task, TaskList } from "../domain/types";

export interface DataActions {
  saveTaskList(list: TaskList): void;
  deleteTaskList(id: string): void;
  saveTask(task: Task): void;
  saveTasks(tasks: readonly Task[]): void;
  toggleTask(id: string): void;
  deleteTask(id: string): void;
  saveHabit(habit: Habit): void;
  deleteHabit(id: string): void;
  /** Sets the value for a habit on a date. A value of 0 removes the entry. */
  setHabitValue(habitId: string, date: string, value: number): void;
  importSnapshot(snapshot: DataSnapshot): Promise<void>;
  clearSaveError(): void;
}

export interface DataContextValue {
  /** Null while the data is loading. */
  snapshot: DataSnapshot | null;
  loadError: string | null;
  saveError: string | null;
  actions: DataActions;
}

export const DataContext = createContext<DataContextValue | null>(null);
