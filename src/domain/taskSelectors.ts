import { addDays } from "./dates";
import type { Task } from "./types";

export function byPosition(a: Task, b: Task): number {
  return a.position - b.position;
}

export function selectOpenTasks(tasks: readonly Task[]): Task[] {
  return tasks.filter((task) => task.completedAt === null).sort(byPosition);
}

export function selectCompletedTasks(tasks: readonly Task[]): Task[] {
  return tasks
    .filter((task) => task.completedAt !== null)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
}

export function selectTasksForList(tasks: readonly Task[], listId: string): Task[] {
  return selectOpenTasks(tasks).filter((task) => task.listId === listId);
}

export interface TodayTasks {
  overdue: Task[];
  today: Task[];
  done: number;
  total: number;
}

/** Open tasks for today plus overdue tasks, with progress for today's tasks. */
export function selectTodayTasks(tasks: readonly Task[], today: string): TodayTasks {
  const open = selectOpenTasks(tasks);
  const todayTasks = tasks.filter((task) => task.dueDate === today);
  const done = todayTasks.filter((task) => task.completedAt !== null).length;
  return {
    overdue: open.filter((task) => task.dueDate !== null && task.dueDate < today),
    today: open.filter((task) => task.dueDate === today),
    done,
    total: todayTasks.length,
  };
}

export interface UpcomingGroup {
  date: string;
  tasks: Task[];
}

/** Open tasks with a due date after today, grouped by date, for the next `days` days. */
export function selectUpcomingTasks(
  tasks: readonly Task[],
  today: string,
  days = 60,
): UpcomingGroup[] {
  const last = addDays(today, days);
  const groups = new Map<string, Task[]>();
  for (const task of selectOpenTasks(tasks)) {
    if (task.dueDate === null || task.dueDate <= today || task.dueDate > last) {
      continue;
    }
    const group = groups.get(task.dueDate) ?? [];
    group.push(task);
    groups.set(task.dueDate, group);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, groupTasks]) => ({ date, tasks: groupTasks }));
}
