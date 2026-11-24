import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";

interface QuickAddTaskProps {
  placeholder: string;
  onAdd: (title: string) => void;
}

/** Inline input for adding a task by typing a title and pressing Enter. */
export function QuickAddTask({ placeholder, onAdd }: QuickAddTaskProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = value.trim();
    if (!title) {
      return;
    }
    onAdd(title);
    setValue("");
  };

  return (
    <form className="quick-add" onSubmit={handleSubmit}>
      <Plus size={18} aria-hidden="true" />
      <input
        className="quick-add__input"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
    </form>
  );
}
