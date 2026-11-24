import type { SupabaseClient } from "@supabase/supabase-js";
import type { DataSnapshot, Habit, HabitEntry, Task, TaskList } from "../domain/types";
import type { TodoRepository } from "./repository";

/*
 * Row shapes mirror the tables in supabase/migrations. Column names are snake_case in the
 * database and camelCase in the domain model; the mappers below translate between them.
 */

interface TaskListRow {
  id: string;
  name: string;
  color: string;
  position: number;
}

interface TaskRow {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  list_id: string | null;
  priority: number;
  completed_at: string | null;
  position: number;
  created_at: string;
}

interface HabitRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  kind: string;
  unit: string;
  target: number | null;
  goal_period: string;
  position: number;
}

interface HabitEntryRow {
  id: string;
  habit_id: string;
  entry_date: string;
  value: number;
}

function toTaskList(row: TaskListRow): TaskList {
  return { id: row.id, name: row.name, color: row.color, position: row.position };
}

function fromTaskList(list: TaskList): TaskListRow {
  return { id: list.id, name: list.name, color: list.color, position: list.position };
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    listId: row.list_id,
    priority: row.priority as Task["priority"],
    completedAt: row.completed_at,
    position: row.position,
    createdAt: row.created_at,
  };
}

function fromTask(task: Task): TaskRow {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    due_date: task.dueDate,
    list_id: task.listId,
    priority: task.priority,
    completed_at: task.completedAt,
    position: task.position,
    created_at: task.createdAt,
  };
}

function toHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon as Habit["icon"],
    color: row.color as Habit["color"],
    kind: row.kind as Habit["kind"],
    unit: row.unit,
    target: row.target,
    goalPeriod: row.goal_period as Habit["goalPeriod"],
    position: row.position,
  };
}

function fromHabit(habit: Habit): HabitRow {
  return {
    id: habit.id,
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    kind: habit.kind,
    unit: habit.unit,
    target: habit.target,
    goal_period: habit.goalPeriod,
    position: habit.position,
  };
}

function toHabitEntry(row: HabitEntryRow): HabitEntry {
  return { id: row.id, habitId: row.habit_id, date: row.entry_date, value: row.value };
}

function fromHabitEntry(entry: HabitEntry): HabitEntryRow {
  return { id: entry.id, habit_id: entry.habitId, entry_date: entry.date, value: entry.value };
}

function ensureOk(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Supabase implementation of the repository. Row level security in the database ensures that
 * each user only reads and writes their own rows, so the client only needs the anon key.
 */
export function createSupabaseRepository(client: SupabaseClient): TodoRepository {
  return {
    async load() {
      const [lists, tasks, habits, entries] = await Promise.all([
        client.from("task_lists").select("*").order("position"),
        client.from("tasks").select("*").order("position"),
        client.from("habits").select("*").order("position"),
        client.from("habit_entries").select("*"),
      ]);
      ensureOk(lists.error);
      ensureOk(tasks.error);
      ensureOk(habits.error);
      ensureOk(entries.error);
      return {
        version: 1,
        exportedAt: new Date().toISOString(),
        taskLists: ((lists.data ?? []) as TaskListRow[]).map(toTaskList),
        tasks: ((tasks.data ?? []) as TaskRow[]).map(toTask),
        habits: ((habits.data ?? []) as HabitRow[]).map(toHabit),
        habitEntries: ((entries.data ?? []) as HabitEntryRow[]).map(toHabitEntry),
      };
    },

    async saveTaskList(list) {
      ensureOk((await client.from("task_lists").upsert(fromTaskList(list))).error);
    },

    async deleteTaskList(id) {
      ensureOk((await client.from("task_lists").delete().eq("id", id)).error);
    },

    async saveTasks(tasks) {
      if (tasks.length === 0) {
        return;
      }
      ensureOk((await client.from("tasks").upsert(tasks.map(fromTask))).error);
    },

    async deleteTask(id) {
      ensureOk((await client.from("tasks").delete().eq("id", id)).error);
    },

    async saveHabit(habit) {
      ensureOk((await client.from("habits").upsert(fromHabit(habit))).error);
    },

    async deleteHabit(id) {
      ensureOk((await client.from("habits").delete().eq("id", id)).error);
    },

    async saveHabitEntry(entry) {
      ensureOk((await client.from("habit_entries").upsert(fromHabitEntry(entry))).error);
    },

    async deleteHabitEntry(id) {
      ensureOk((await client.from("habit_entries").delete().eq("id", id)).error);
    },

    async importSnapshot(snapshot) {
      if (snapshot.taskLists.length > 0) {
        ensureOk(
          (await client.from("task_lists").upsert(snapshot.taskLists.map(fromTaskList))).error,
        );
      }
      if (snapshot.tasks.length > 0) {
        ensureOk((await client.from("tasks").upsert(snapshot.tasks.map(fromTask))).error);
      }
      if (snapshot.habits.length > 0) {
        ensureOk((await client.from("habits").upsert(snapshot.habits.map(fromHabit))).error);
      }
      if (snapshot.habitEntries.length > 0) {
        ensureOk(
          (
            await client.from("habit_entries").upsert(snapshot.habitEntries.map(fromHabitEntry))
          ).error,
        );
      }
    },
  };
}
