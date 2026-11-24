/* dnd-kit returns ref objects from useSortable and reads them during render by design. */
/* eslint-disable react-hooks/refs */
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Flag, GripVertical } from "lucide-react";
import { formatShortDate } from "../../domain/dates";
import { PRIORITY_LABELS } from "../../domain/priority";
import type { Task, TaskList } from "../../domain/types";
import { CompletionCircle } from "../../components/CompletionCircle";

interface TaskRowProps {
  task: Task;
  list: TaskList | undefined;
  /** Shows the due date (useful outside the Today view). */
  showDate: boolean;
  onToggle: (id: string) => void;
  onOpen: (task: Task) => void;
  sortable: boolean;
}

export function TaskRow({ task, list, showDate, onToggle, onOpen, sortable }: TaskRowProps) {
  const sort = useSortable({ id: task.id, disabled: !sortable });
  const style = {
    transform: CSS.Transform.toString(sort.transform),
    transition: sort.transition,
  };
  const done = task.completedAt !== null;

  return (
    <li
      ref={sort.setNodeRef}
      style={style}
      className={sort.isDragging ? "task-row is-dragging" : "task-row"}
    >
      {sortable ? (
        <button
          type="button"
          className="task-row__handle"
          aria-label={`Dra for å endre rekkefølge: ${task.title}`}
          {...sort.attributes}
          {...sort.listeners}
        >
          <GripVertical size={16} aria-hidden="true" />
        </button>
      ) : null}
      <CompletionCircle
        checked={done}
        label={done ? `Angre fullføring av ${task.title}` : `Fullfør ${task.title}`}
        color={list?.color}
        onToggle={() => {
          onToggle(task.id);
        }}
      />
      <button type="button" className="task-row__body" onClick={() => onOpen(task)}>
        <span className={done ? "task-row__title is-done" : "task-row__title"}>{task.title}</span>
        {task.description || list || (showDate && task.dueDate) ? (
          <span className="task-row__meta">
            {showDate && task.dueDate ? (
              <span className="task-row__date">{formatShortDate(task.dueDate)}</span>
            ) : null}
            {list ? (
              <span className="tag" style={{ color: list.color, backgroundColor: `${list.color}22` }}>
                <span className="tag__dot" style={{ backgroundColor: list.color }} />
                {list.name}
              </span>
            ) : null}
          </span>
        ) : null}
      </button>
      {task.priority > 0 ? (
        <Flag
          className={`priority priority--${task.priority}`}
          size={18}
          aria-label={PRIORITY_LABELS[task.priority]}
          role="img"
        />
      ) : null}
    </li>
  );
}
