interface ProgressBarProps {
  value: number;
  color?: string;
  label: string;
}

/** Horizontal progress indicator. `value` is a fraction between 0 and 1. */
export function ProgressBar({ value, color, label }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div
        className="progress__fill"
        style={{ width: `${percent}%`, backgroundColor: color ?? "var(--accent)" }}
      />
    </div>
  );
}
