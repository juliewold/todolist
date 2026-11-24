import { BookOpen, Dumbbell, GraduationCap, Heart, Leaf, Sun, type LucideIcon } from "lucide-react";
import type { HabitIconName } from "../../domain/types";

export const HABIT_ICONS: Record<HabitIconName, LucideIcon> = {
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  heart: Heart,
  leaf: Leaf,
  sun: Sun,
};

export const HABIT_ICON_NAMES = Object.keys(HABIT_ICONS) as HabitIconName[];

export const HABIT_ICON_LABELS: Record<HabitIconName, string> = {
  dumbbell: "Trening",
  "book-open": "Lesing",
  "graduation-cap": "Studier",
  heart: "Hjerte",
  leaf: "Natur",
  sun: "Sol",
};
