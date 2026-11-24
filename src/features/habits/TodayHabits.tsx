import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CompletionCircle } from "../../components/CompletionCircle";
import { ProgressBar } from "../../components/ProgressBar";
import { useData } from "../../app/useData";
import { HABIT_COLORS } from "../../domain/colors";
import { getEntryValue, getGoalProgress, getRepresentativeValue, getUnitLabel } from "../../domain/habits";
import type { Habit } from "../../domain/types";
import { HabitIcon } from "./HabitIcon";

interface TodayHabitsProps {
  habits: readonly Habit[];
  today: string;
}

/** Quick logging of today's habits directly from the start page. */
export function TodayHabits({ habits, today }: TodayHabitsProps) {
  const { snapshot, actions } = useData();
  const navigate = useNavigate();
  const entries = snapshot?.habitEntries ?? [];

  return (
    <section className="today-section" aria-label="Dagens vaner">
      <h2 className="section-title">Dagens vaner</h2>
      <ul className="card today-habits">
        {habits.map((habit) => {
          const value = getEntryValue(entries, habit.id, today);
          const progress = getGoalProgress(habit, entries, today);
          const done = progress >= 1;
          const unit = getUnitLabel(habit);
          const color = HABIT_COLORS[habit.color];
          const description =
            habit.kind === "yesNo"
              ? done
                ? "Gjort"
                : "Ikke gjort ennå"
              : `${value} / ${habit.target ?? 1} ${unit}`.trim();

          return (
            <li key={habit.id} className="today-habit">
              <button
                type="button"
                className="today-habit__open"
                onClick={() => {
                  navigate(`/vaner/${habit.id}`);
                }}
              >
                <HabitIcon icon={habit.icon} color={habit.color} />
                <span className="today-habit__text">
                  <span className="today-habit__title">
                    {habit.name}
                    <ChevronRight size={14} aria-hidden="true" className="today-habit__chevron" />
                  </span>
                  <span className="muted">{description}</span>
                  <ProgressBar value={progress} color={color} label={`Fremdrift for ${habit.name}`} />
                </span>
              </button>
              <CompletionCircle
                checked={done}
                color={color}
                label={done ? `Angre ${habit.name}` : `Registrer ${habit.name} i dag`}
                onToggle={() => {
                  if (done) {
                    actions.setHabitValue(habit.id, today, 0);
                  } else {
                    actions.setHabitValue(
                      habit.id,
                      today,
                      habit.kind === "yesNo" ? 1 : getRepresentativeValue(habit, 4),
                    );
                  }
                }}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
