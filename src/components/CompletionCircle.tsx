import { Check } from "lucide-react";

interface CompletionCircleProps {
  checked: boolean;
  label: string;
  color?: string;
  onToggle: () => void;
}

/** Round checkbox used for tasks and habits. */
export function CompletionCircle({ checked, label, color, onToggle }: CompletionCircleProps) {
  return (
    <button
      type="button"
      className={checked ? "completion is-checked" : "completion"}
      style={checked && color ? { backgroundColor: color, borderColor: color } : undefined}
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      {checked ? <Check size={16} strokeWidth={2.5} aria-hidden="true" /> : null}
    </button>
  );
}
