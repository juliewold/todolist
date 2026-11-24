import { addDays, diffDays, getYear, startOfIsoWeek } from "./dates";
import type { Habit, HabitEntry } from "./types";

/** Intensity level from 0 (nothing registered) to 5 (highest). Used for colouring cells. */
export type IntensityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const MAX_INTENSITY: IntensityLevel = 5;

/** Upper bounds (inclusive, minutes) for levels 1–4. Anything above 60 minutes is level 5. */
const DURATION_UPPER_BOUNDS: readonly number[] = [15, 30, 45, 60];
/** Minutes stored when a duration level is picked in the legend. */
const DURATION_REPRESENTATIVE: readonly number[] = [0, 10, 25, 40, 55, 75];
/** Ratio of the target for quantity levels 1–4 (exclusive upper bounds). */
const QUANTITY_UPPER_RATIOS: readonly number[] = [0.25, 0.5, 0.75, 1];
/** Ratio of the target stored when a quantity level is picked in the legend. */
const QUANTITY_REPRESENTATIVE_RATIO: readonly number[] = [0, 0.125, 0.375, 0.625, 0.875, 1];

export function getIntensityLevel(habit: Habit, value: number): IntensityLevel {
  if (value <= 0) {
    return 0;
  }
  switch (habit.kind) {
    case "yesNo":
      return 4;
    case "duration": {
      const index = DURATION_UPPER_BOUNDS.findIndex((bound) => value <= bound);
      return index === -1 ? MAX_INTENSITY : ((index + 1) as IntensityLevel);
    }
    case "quantity": {
      if (!habit.target || habit.target <= 0) {
        return 3;
      }
      const ratio = value / habit.target;
      const index = QUANTITY_UPPER_RATIOS.findIndex((bound) => ratio < bound);
      return index === -1 ? MAX_INTENSITY : ((index + 1) as IntensityLevel);
    }
  }
}

/** The value stored when the user picks an intensity level in the legend. */
export function getRepresentativeValue(habit: Habit, level: IntensityLevel): number {
  if (level === 0) {
    return 0;
  }
  switch (habit.kind) {
    case "yesNo":
      return 1;
    case "duration":
      return DURATION_REPRESENTATIVE[level] ?? 0;
    case "quantity": {
      if (!habit.target || habit.target <= 0) {
        return level;
      }
      const ratio = QUANTITY_REPRESENTATIVE_RATIO[level] ?? 1;
      return Math.round(habit.target * ratio * 100) / 100;
    }
  }
}

/** Human readable legend label for a level, in Norwegian. */
export function getLegendLabel(habit: Habit, level: IntensityLevel): string {
  if (habit.kind === "yesNo") {
    return level === 0 ? "Ikke gjort" : "Gjort";
  }
  if (habit.kind === "duration") {
    switch (level) {
      case 0:
        return "Ingen trening";
      case 1:
        return "1–15 min";
      case 2:
        return "16–30 min";
      case 3:
        return "31–45 min";
      case 4:
        return "46–60 min";
      case 5:
        return "Over 60 min";
    }
  }
  const unit = habit.unit ? ` ${habit.unit}` : "";
  return level === 0 ? "Ingen" : `${getRepresentativeValue(habit, level)}${unit}`;
}

/** The value that counts as meeting the goal on a single day or week. */
function goalThreshold(habit: Habit): number {
  if (habit.target !== null && habit.target > 0) {
    return habit.target;
  }
  return 1;
}

export function isGoalMet(habit: Habit, total: number): boolean {
  return total >= goalThreshold(habit);
}

/** Sum of entries for the period containing `date` (day or ISO week). */
export function getPeriodTotal(
  habit: Habit,
  entries: readonly HabitEntry[],
  date: string,
): number {
  const matches = (entryDate: string): boolean => {
    if (habit.goalPeriod === "daily") {
      return entryDate === date;
    }
    const weekStart = startOfIsoWeek(date);
    return entryDate >= weekStart && entryDate <= addDays(weekStart, 6);
  };
  return entries
    .filter((entry) => entry.habitId === habit.id && matches(entry.date))
    .reduce((sum, entry) => sum + entry.value, 0);
}

export interface HabitStats {
  activeDays: number;
  totalValue: number;
  averageValue: number;
  currentStreak: number;
  longestStreak: number;
}

/**
 * Streak counts consecutive periods (days or weeks) where the goal is met.
 * The current streak may end on the previous period, so it is not reset before the day is over.
 */
export function computeHabitStats(
  habit: Habit,
  entries: readonly HabitEntry[],
  today: string,
  year = getYear(today),
): HabitStats {
  const own = entries.filter((entry) => entry.habitId === habit.id && entry.value > 0);
  const yearEntries = own.filter((entry) => getYear(entry.date) === year);
  const totalValue = yearEntries.reduce((sum, entry) => sum + entry.value, 0);
  const activeDays = yearEntries.length;
  const averageValue = activeDays === 0 ? 0 : Math.round((totalValue / activeDays) * 10) / 10;

  const metPeriods = getMetPeriodKeys(habit, entries, today);
  const { current, longest } = computeStreaks(metPeriods, habit.goalPeriod, today);
  return { activeDays, totalValue, averageValue, currentStreak: current, longestStreak: longest };
}

function periodKey(habit: Habit, date: string): string {
  return habit.goalPeriod === "daily" ? date : startOfIsoWeek(date);
}

function getMetPeriodKeys(habit: Habit, entries: readonly HabitEntry[], today: string): Set<string> {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    if (entry.habitId !== habit.id || entry.date > today) {
      continue;
    }
    const key = periodKey(habit, entry.date);
    totals.set(key, (totals.get(key) ?? 0) + entry.value);
  }
  const met = new Set<string>();
  for (const [key, total] of totals) {
    if (isGoalMet(habit, total)) {
      met.add(key);
    }
  }
  return met;
}

function step(period: "daily" | "weekly", key: string, days: number): string {
  return addDays(key, days * (period === "daily" ? 1 : 7));
}

function computeStreaks(
  metKeys: ReadonlySet<string>,
  period: "daily" | "weekly",
  today: string,
): { current: number; longest: number } {
  const days = period === "daily" ? 1 : 7;
  const currentKey = period === "daily" ? today : startOfIsoWeek(today);

  // Count back from the most recent period that is met, allowing the current period to be open.
  let anchor = currentKey;
  if (!metKeys.has(anchor)) {
    anchor = step(period, anchor, -1);
  }
  let current = 0;
  while (metKeys.has(anchor)) {
    current++;
    anchor = step(period, anchor, -1);
  }

  let longest = 0;
  let run = 0;
  let previous: string | null = null;
  for (const key of [...metKeys].sort()) {
    run = previous !== null && diffDays(previous, key) === days ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = key;
  }
  return { current, longest };
}

/** Returns the value entered for a habit on a given date, or 0. */
export function getEntryValue(
  entries: readonly HabitEntry[],
  habitId: string,
  date: string,
): number {
  return entries.find((entry) => entry.habitId === habitId && entry.date === date)?.value ?? 0;
}

/** Progress from 0 to 1 towards the goal for the period containing `date`. */
export function getGoalProgress(habit: Habit, entries: readonly HabitEntry[], date: string): number {
  const total = getPeriodTotal(habit, entries, date);
  return Math.min(1, total / goalThreshold(habit));
}
