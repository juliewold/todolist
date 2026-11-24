import { useCallback, useState } from "react";
import type { Task } from "../../domain/types";

/** Tracks which task (or a new task) is open in the editor dialog. */
export interface EditingState {
  task: Task | null;
}

export function useTaskEditing() {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const openNew = useCallback(() => {
    setEditing({ task: null });
  }, []);
  const openTask = useCallback((task: Task) => {
    setEditing({ task });
  }, []);
  const close = useCallback(() => {
    setEditing(null);
  }, []);
  return { editing, openNew, openTask, close };
}
