import type { HabitColorName, HabitIconName } from "../../domain/types";
import { HABIT_COLORS } from "../../domain/colors";
import { HABIT_ICONS } from "./habitIcons";

interface HabitIconProps {
  icon: HabitIconName;
  color: HabitColorName;
  size?: "sm" | "md";
}

/** Rounded tile with a habit icon in its colour theme. */
export function HabitIcon({ icon, color, size = "md" }: HabitIconProps) {
  const Icon = HABIT_ICONS[icon];
  const hex = HABIT_COLORS[color];
  return (
    <span
      className={`habit-icon habit-icon--${size}`}
      style={{ backgroundColor: `${hex}26`, color: hex }}
      aria-hidden="true"
    >
      <Icon size={size === "sm" ? 16 : 26} strokeWidth={1.75} />
    </span>
  );
}
