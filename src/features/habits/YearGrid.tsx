import { useMemo, type CSSProperties } from "react";
import { HABIT_COLORS } from "../../domain/colors";
import { daysInMonth, isoDateOf } from "../../domain/dates";
import { getIntensityLevel, getLegendLabel, type IntensityLevel } from "../../domain/habits";
import type { Habit, HabitEntry } from "../../domain/types";
import { MONTH_SHORT } from "./monthLabels";

const MONTH_LONG = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];
const DAY_ROWS = Array.from({ length: 31 }, (_, index) => index + 1);

interface YearGridProps {
  habit: Habit;
  entries: readonly HabitEntry[];
  year: number;
  today: string;
  onCellClick: (date: string) => void;
}

/** Year overview with months as columns and days as rows, like the design. */
export function YearGrid({ habit, entries, year, today, onCellClick }: YearGridProps) {
  const valueByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of entries) {
      if (entry.habitId === habit.id) {
        map.set(entry.date, entry.value);
      }
    }
    return map;
  }, [entries, habit.id]);

  const color = HABIT_COLORS[habit.color];

  return (
    <div className="year-grid" role="table" aria-label={`Årsoversikt for ${habit.name}, ${year}`}>
      <div className="year-grid__row year-grid__row--head" role="row">
        <span role="columnheader" />
        {MONTH_SHORT.map((month) => (
          <span key={month} role="columnheader">
            {month}
          </span>
        ))}
      </div>
      {DAY_ROWS.map((day) => (
        <div key={day} className="year-grid__row" role="row">
          <span className="year-grid__day" role="rowheader">
            {day}
          </span>
          {MONTH_SHORT.map((_, monthIndex) => {
            if (day > daysInMonth(year, monthIndex)) {
              return <span key={monthIndex} className="cell cell--empty" role="cell" />;
            }
            const date = isoDateOf(year, monthIndex, day);
            const value = valueByDate.get(date) ?? 0;
            const level: IntensityLevel = getIntensityLevel(habit, value);
            const label = value > 0 ? getLegendLabel(habit, level) : "ikke registrert";
            return (
              <span key={monthIndex} role="cell">
                <button
                  type="button"
                  className={`cell cell--${level}`}
                  style={{ "--cell-color": color } as CSSProperties}
                  disabled={date > today}
                  aria-label={`${day}. ${MONTH_LONG[monthIndex]} ${year}: ${label}`}
                  onClick={() => {
                    onCellClick(date);
                  }}
                />
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
