import { useMemo, type ReactNode } from "react";
import { ProgressBar } from "../../components/ProgressBar";
import { EmptyState } from "../../components/EmptyState";
import { useData } from "../../app/useData";
import { createId } from "../../domain/ids";
import { nextPosition } from "../../domain/positions";
import type { Task } from "../../domain/types";
import { TaskEditor } from "./TaskEditor";
import { TaskList } from "./TaskList";
import { QuickAddTask } from "./QuickAddTask";
import { useTaskEditing } from "./useTaskEditing";

interface TasksViewProps {
  /** Visible tasks in display order. */
  tasks: readonly Task[];
  emptyTitle: string;
  emptyText?: string;
  /** Date given to tasks created with the quick add field. */
  quickAddDueDate: string | null;
  /** List given to tasks created with the quick add field. */
  quickAddListId?: string | null;
  showDate: boolean;
  sortable: boolean;
  header?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

/** Shared body for task pages: quick add, sortable task list and the task editor. */
export function TasksView({
  tasks,
  emptyTitle,
  emptyText,
  quickAddDueDate,
  quickAddListId = null,
  showDate,
  sortable,
  header,
  children,
  footer,
}: TasksViewProps) {
  const { snapshot, actions } = useData();
  const editor = useTaskEditing();
  const allTasks = useMemo(() => snapshot?.tasks ?? [], [snapshot]);
  const lists = useMemo(() => snapshot?.taskLists ?? [], [snapshot]);

  const handleQuickAdd = (title: string) => {
    actions.saveTask({
      id: createId(),
      title,
      description: "",
      dueDate: quickAddDueDate,
      listId: quickAddListId,
      priority: 0,
      completedAt: null,
      position: nextPosition(allTasks),
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="page">
      {header}
      {children}
      <QuickAddTask placeholder="Legg til en oppgave …" onAdd={handleQuickAdd} />
      {tasks.length === 0 ? (
        <EmptyState title={emptyTitle}>{emptyText}</EmptyState>
      ) : (
        <TaskList
          tasks={tasks}
          allTasks={allTasks}
          lists={lists}
          showDate={showDate}
          sortable={sortable}
          onToggle={actions.toggleTask}
          onOpen={editor.openTask}
          onReorder={actions.saveTasks}
        />
      )}
      {editor.editing ? (
        <TaskEditor
          task={editor.editing.task}
          lists={lists}
          defaultDueDate={quickAddDueDate}
          defaultListId={quickAddListId}
          nextPosition={nextPosition(allTasks)}
          onSave={actions.saveTask}
          onDelete={actions.deleteTask}
          onClose={editor.close}
        />
      ) : null}
      {footer}
    </div>
  );
}

interface TodayProgressProps {
  done: number;
  total: number;
}

export function TodayProgress({ done, total }: TodayProgressProps) {
  const fraction = total === 0 ? 0 : done / total;
  return (
    <section className="card progress-card" aria-label="Dagens fremdrift">
      <div className="progress-card__header">
        <span>Dagens fremdrift</span>
        <span className="progress-card__count">
          {done} / {total}
        </span>
      </div>
      <ProgressBar value={fraction} label="Dagens fremdrift" />
    </section>
  );
}
