import { MousePointerClick, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { useData } from "../../app/useData";
import { HABIT_COLORS } from "../../domain/colors";
import { getYear, todayIso } from "../../domain/dates";
import {
  computeHabitStats,
  countActiveDaysPerMonth,
  getEntryValue,
  getIntensityLevel,
  getLegendLabel,
  getRepresentativeValue,
  getUnitLabel,
  type IntensityLevel,
} from "../../domain/habits";
import type { Habit } from "../../domain/types";
import { HabitEditor } from "./HabitEditor";
import { HabitIcon } from "./HabitIcon";
import { MONTH_SHORT } from "./monthLabels";
import { YearGrid } from "./YearGrid";

export function HabitsPage() {
  const { snapshot, actions } = useData();
  const { habitId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const habits = useMemo(
    () => [...(snapshot?.habits ?? [])].sort((a, b) => a.position - b.position),
    [snapshot],
  );
  const selected = habits.find((habit) => habit.id === habitId) ?? habits[0];
  const creating = searchParams.get("ny") === "1";
  const closeCreate = () => {
    setSearchParams({});
  };

  return (
    <div className="page">
      <header className="page-header page-header--split">
        <div>
          <p className="eyebrow">Mine vaner</p>
          <h1 className="page-title">Habit Tracker</h1>
          <p className="page-subtitle">Små steg, hver dag.</p>
        </div>
      </header>

      <nav className="habit-tabs" aria-label="Velg vane">
        {habits.map((habit) => (
          <button
            key={habit.id}
            type="button"
            className={habit.id === selected?.id ? "habit-tab is-active" : "habit-tab"}
            style={{ "--tab-color": HABIT_COLORS[habit.color] } as React.CSSProperties}
            aria-current={habit.id === selected?.id ? "page" : undefined}
            onClick={() => {
              navigate(`/vaner/${habit.id}`);
            }}
          >
            <HabitIcon icon={habit.icon} color={habit.color} size="sm" />
            {habit.name}
          </button>
        ))}
        <Button
          variant="secondary"
          className="habit-tab habit-tab--add"
          icon={<Plus size={16} aria-hidden="true" />}
          onClick={() => {
            setSearchParams({ ny: "1" });
          }}
        >
          Ny vane
        </Button>
      </nav>

      {selected ? (
        <HabitDetail key={selected.id} habit={selected} />
      ) : (
        <EmptyState title="Ingen vaner ennå">
          Legg til en vane for å begynne å registrere.
        </EmptyState>
      )}

      {creating ? (
        <HabitEditor
          habit={null}
          nextPosition={habits.length}
          onSave={actions.saveHabit}
          onDelete={actions.deleteHabit}
          onClose={closeCreate}
        />
      ) : null}
    </div>
  );
}

interface HabitDetailProps {
  habit: Habit;
}

function defaultLevel(habit: Habit): IntensityLevel {
  if (habit.kind === "yesNo") {
    return 4;
  }
  if (habit.target !== null && habit.target > 0) {
    return getIntensityLevel(habit, habit.target);
  }
  return 4;
}

/** Everything shown for a single habit: stats, year grid, legend and editor. */
function HabitDetail({ habit }: HabitDetailProps) {
  const { snapshot, actions } = useData();
  const today = todayIso();
  const [year, setYear] = useState(getYear(today));
  const [level, setLevel] = useState<IntensityLevel>(defaultLevel(habit));
  const [editing, setEditing] = useState(false);

  const entries = snapshot?.habitEntries ?? [];
  const stats = computeHabitStats(habit, entries, today, year);
  const monthly = countActiveDaysPerMonth(entries, habit.id, year);
  const maxMonthly = Math.max(1, ...monthly);
  const unit = getUnitLabel(habit);
  const legendLevels: IntensityLevel[] = habit.kind === "yesNo" ? [0, 4] : [0, 1, 2, 3, 4, 5];
  const color = HABIT_COLORS[habit.color];
  const yearOptions = [getYear(today), getYear(today) - 1, getYear(today) - 2];

  const handleCellClick = (date: string) => {
    const value = getEntryValue(entries, habit.id, date);
    if (habit.kind === "yesNo") {
      actions.setHabitValue(habit.id, date, value > 0 ? 0 : 1);
      return;
    }
    const isSameLevel = value > 0 && getIntensityLevel(habit, value) === level;
    actions.setHabitValue(habit.id, date, isSameLevel ? 0 : getRepresentativeValue(habit, level));
  };

  return (
    <>
      <div className="habit-toolbar">
        <label className="select-inline">
          <span className="visually-hidden">År</span>
          <select
            className="input input--compact"
            value={year}
            onChange={(event) => {
              setYear(Number(event.target.value));
            }}
          >
            {yearOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="card habit-summary">
        <HabitIcon icon={habit.icon} color={habit.color} />
        <div className="habit-summary__title">
          <h2>{habit.name}</h2>
          <p className="muted">
            Årsoversikt · {year}
            {habit.target
              ? ` · Mål: ${habit.target} ${unit} ${habit.goalPeriod === "daily" ? "daglig" : "per uke"}`
              : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          className="icon-button"
          aria-label="Rediger vane"
          onClick={() => {
            setEditing(true);
          }}
        >
          <Pencil size={18} aria-hidden="true" />
        </Button>
      </section>

      <div className="habit-layout">
        <section className="card habit-grid-card" aria-label="Årsoversikt">
          <YearGrid
            habit={habit}
            entries={entries}
            year={year}
            today={today}
            onCellClick={handleCellClick}
          />
          <div className="month-summary" aria-label="Månedsoversikt">
            {MONTH_SHORT.map((month, index) => (
              <div key={month} className="month-summary__item">
                <span className="month-summary__bar">
                  <span
                    className="month-summary__fill"
                    style={{
                      height: `${((monthly[index] ?? 0) / maxMonthly) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </span>
                <span className="month-summary__count">{monthly[index] ?? 0}</span>
                <span className="month-summary__label">{month}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="habit-side">
          <div className="stat-grid">
            <div className="card stat">
              <span className="stat__label">Aktive dager</span>
              <span className="stat__value" style={{ color }}>
                {stats.activeDays}
              </span>
              <span className="stat__hint">av {daysInYear(year)} dager</span>
            </div>
            <div className="card stat">
              <span className="stat__label">Gjennomsnitt</span>
              <span className="stat__value" style={{ color }}>
                {stats.averageValue}
              </span>
              <span className="stat__hint">{unit || "ganger"} per aktiv dag</span>
            </div>
            <div className="card stat">
              <span className="stat__label">Nåværende streak</span>
              <span className="stat__value" style={{ color }}>
                {stats.currentStreak}
              </span>
              <span className="stat__hint">
                {habit.goalPeriod === "daily" ? "dager" : "uker"} på rad
              </span>
            </div>
            <div className="card stat">
              <span className="stat__label">Lengste streak</span>
              <span className="stat__value" style={{ color }}>
                {stats.longestStreak}
              </span>
              <span className="stat__hint">{habit.goalPeriod === "daily" ? "dager" : "uker"}</span>
            </div>
          </div>

          <section className="card hint-card">
            <MousePointerClick size={20} aria-hidden="true" />
            <div>
              <p className="hint-card__title">Registrer aktivitet</p>
              <p className="muted">
                {habit.kind === "yesNo"
                  ? "Trykk på en rute i kalenderen for å markere dagen."
                  : "Velg nivå under og trykk på en rute i kalenderen."}
              </p>
            </div>
          </section>

          <section className="card legend" aria-label="Velg nivå">
            <h3 className="section-label">
              {habit.kind === "duration" ? "Velg varighet" : "Velg nivå"}
            </h3>
            <div className="legend__options">
              {legendLevels.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={option === level ? "legend__option is-selected" : "legend__option"}
                  aria-pressed={option === level}
                  onClick={() => {
                    setLevel(option);
                  }}
                >
                  <span
                    className={`legend__swatch cell--${option}`}
                    style={{ "--cell-color": color } as React.CSSProperties}
                    aria-hidden="true"
                  />
                  <span>{getLegendLabel(habit, option)}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {editing ? (
        <HabitEditor
          habit={habit}
          nextPosition={habit.position}
          onSave={actions.saveHabit}
          onDelete={actions.deleteHabit}
          onClose={() => {
            setEditing(false);
          }}
        />
      ) : null}
    </>
  );
}

function daysInYear(year: number): number {
  return new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
}
