import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { HABIT_COLORS } from "../../domain/colors";
import { createId } from "../../domain/ids";
import type { GoalPeriod, Habit, HabitColorName, HabitIconName, HabitKind } from "../../domain/types";
import { HABIT_ICON_LABELS, HABIT_ICON_NAMES, HABIT_ICONS } from "./habitIcons";

interface HabitEditorProps {
  habit: Habit | null;
  nextPosition: number;
  onSave: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const COLOR_NAMES = Object.keys(HABIT_COLORS) as HabitColorName[];

const KIND_LABELS: Record<HabitKind, string> = {
  yesNo: "Ja/nei",
  duration: "Varighet (minutter)",
  quantity: "Mengde",
};

export function HabitEditor({ habit, nextPosition, onSave, onDelete, onClose }: HabitEditorProps) {
  const [name, setName] = useState(habit?.name ?? "");
  const [icon, setIcon] = useState<HabitIconName>(habit?.icon ?? "dumbbell");
  const [color, setColor] = useState<HabitColorName>(habit?.color ?? "rose");
  const [kind, setKind] = useState<HabitKind>(habit?.kind ?? "yesNo");
  const [unit, setUnit] = useState(habit?.unit ?? "");
  const [target, setTarget] = useState(habit?.target?.toString() ?? "");
  const [goalPeriod, setGoalPeriod] = useState<GoalPeriod>(habit?.goalPeriod ?? "daily");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Skriv inn et navn.");
      return;
    }
    const parsedTarget = target.trim() === "" ? null : Number(target.replace(",", "."));
    if (parsedTarget !== null && (!Number.isFinite(parsedTarget) || parsedTarget <= 0)) {
      setError("Målet må være et positivt tall.");
      return;
    }
    if (kind === "quantity" && !unit.trim()) {
      setError("Skriv inn en enhet, for eksempel sider eller km.");
      return;
    }
    onSave({
      id: habit?.id ?? createId(),
      name: trimmed,
      icon,
      color,
      kind,
      unit: kind === "quantity" ? unit.trim() : "",
      target: parsedTarget,
      goalPeriod,
      position: habit?.position ?? nextPosition,
    });
    onClose();
  };

  return (
    <Dialog
      title={habit ? "Rediger vane" : "Ny vane"}
      onClose={onClose}
      footer={
        <>
          {habit ? (
            <Button
              variant="danger"
              onClick={() => {
                onDelete(habit.id);
                onClose();
              }}
            >
              Slett
            </Button>
          ) : (
            <span />
          )}
          <div className="dialog__actions">
            <Button onClick={onClose}>Avbryt</Button>
            <Button variant="primary" type="submit" form="habit-form">
              Lagre
            </Button>
          </div>
        </>
      }
    >
      <form id="habit-form" className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Navn</span>
          <input
            className="input"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            autoFocus
          />
        </label>
        <fieldset className="field">
          <legend className="field__label">Ikon</legend>
          <div className="choice-row">
            {HABIT_ICON_NAMES.map((name) => {
              const Icon = HABIT_ICONS[name];
              return (
                <button
                  key={name}
                  type="button"
                  className={icon === name ? "choice is-selected" : "choice"}
                  aria-pressed={icon === name}
                  aria-label={HABIT_ICON_LABELS[name]}
                  onClick={() => {
                    setIcon(name);
                  }}
                >
                  <Icon size={18} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend className="field__label">Fargetema</legend>
          <div className="choice-row">
            {COLOR_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                className={color === name ? "swatch is-selected" : "swatch"}
                style={{ backgroundColor: HABIT_COLORS[name] }}
                aria-pressed={color === name}
                aria-label={name}
                onClick={() => {
                  setColor(name);
                }}
              />
            ))}
          </div>
        </fieldset>
        <div className="form__row">
          <label className="field">
            <span className="field__label">Type</span>
            <select
              className="input"
              value={kind}
              onChange={(event) => {
                setKind(event.target.value as HabitKind);
              }}
            >
              {(Object.keys(KIND_LABELS) as HabitKind[]).map((option) => (
                <option key={option} value={option}>
                  {KIND_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Mål (valgfritt)</span>
            <input
              className="input"
              inputMode="decimal"
              value={target}
              onChange={(event) => {
                setTarget(event.target.value);
                setError(null);
              }}
            />
          </label>
        </div>
        <div className="form__row">
          {kind === "quantity" ? (
            <label className="field">
              <span className="field__label">Enhet</span>
              <input
                className="input"
                value={unit}
                onChange={(event) => {
                  setUnit(event.target.value);
                  setError(null);
                }}
              />
            </label>
          ) : null}
          <label className="field">
            <span className="field__label">Målperiode</span>
            <select
              className="input"
              value={goalPeriod}
              onChange={(event) => {
                setGoalPeriod(event.target.value as GoalPeriod);
              }}
            >
              <option value="daily">Daglig</option>
              <option value="weekly">Ukentlig</option>
            </select>
          </label>
        </div>
        {error ? <p className="field__error">{error}</p> : null}
      </form>
    </Dialog>
  );
}
