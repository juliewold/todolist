/** Priority of a task: 0 = none, 1 = low, 2 = medium, 3 = high. */
export type Priority = 0 | 1 | 2 | 3;

export interface TaskList {
  id: string;
  name: string;
  color: string;
  position: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD) or null when the task has no date. */
  dueDate: string | null;
  listId: string | null;
  priority: Priority;
  /** ISO timestamp when the task was completed, otherwise null. */
  completedAt: string | null;
  position: number;
  createdAt: string;
}

export type HabitKind = "yesNo" | "duration" | "quantity";

export type GoalPeriod = "daily" | "weekly";

export type HabitIconName = "dumbbell" | "book-open" | "graduation-cap" | "heart" | "leaf" | "sun";

export type HabitColorName = "rose" | "blue" | "sage" | "lavender" | "amber" | "peach";

export interface Habit {
  id: string;
  name: string;
  icon: HabitIconName;
  color: HabitColorName;
  kind: HabitKind;
  /** Unit shown for quantity habits, e.g. "sider" or "km". */
  unit: string;
  /** Goal per period. Null means "any registered value counts". */
  target: number | null;
  goalPeriod: GoalPeriod;
  position: number;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Yes/no habits store 1, duration habits store minutes, quantity habits store the amount. */
  value: number;
}

export interface DataSnapshot {
  version: 1;
  exportedAt: string;
  taskLists: TaskList[];
  tasks: Task[];
  habits: Habit[];
  habitEntries: HabitEntry[];
}
