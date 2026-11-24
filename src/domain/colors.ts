import type { HabitColorName } from "./types";

/** Pastel palette used for habits, lists and accents. */
export const HABIT_COLORS: Record<HabitColorName, string> = {
  rose: "#c27d93",
  blue: "#7f97b8",
  sage: "#7f9a72",
  lavender: "#9b8fb8",
  amber: "#c9a06a",
  peach: "#d18f78",
};

/** Colors that can be chosen for task lists. */
export const LIST_COLORS: readonly string[] = [
  "#7f9a72",
  "#c27d93",
  "#7f97b8",
  "#9b8fb8",
  "#c9a06a",
  "#d18f78",
  "#8c8c84",
];

export const DEFAULT_LIST_COLOR = LIST_COLORS[0] ?? "#7f9a72";
