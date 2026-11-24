import type { DataSnapshot, Habit, HabitEntry, Task, TaskList } from "../domain/types";

/**
 * Storage boundary for all user data. The app talks only to this interface, so the database
 * (Supabase today, possibly a self-hosted server later) can be replaced without touching the UI.
 */
export interface TodoRepository {
  load(): Promise<DataSnapshot>;
  saveTaskList(list: TaskList): Promise<void>;
  deleteTaskList(id: string): Promise<void>;
  saveTasks(tasks: readonly Task[]): Promise<void>;
  deleteTask(id: string): Promise<void>;
  saveHabit(habit: Habit): Promise<void>;
  deleteHabit(id: string): Promise<void>;
  saveHabitEntry(entry: HabitEntry): Promise<void>;
  deleteHabitEntry(id: string): Promise<void>;
  importSnapshot(snapshot: DataSnapshot): Promise<void>;
}
