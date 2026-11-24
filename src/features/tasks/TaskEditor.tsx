import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { createId } from "../../domain/ids";
import type { Priority, Task, TaskList } from "../../domain/types";
import { PRIORITY_LABELS } from "../../domain/priority";

interface TaskEditorProps {
  /** Existing task to edit, or null to create a new one. */
  task: Task | null;
  lists: readonly TaskList[];
  defaultDueDate: string | null;
  defaultListId: string | null;
  nextPosition: number;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const PRIORITIES: Priority[] = [0, 1, 2, 3];

export function TaskEditor({
  task,
  lists,
  defaultDueDate,
  defaultListId,
  nextPosition,
  onSave,
  onDelete,
  onClose,
}: TaskEditorProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? defaultDueDate ?? "");
  const [listId, setListId] = useState(task?.listId ?? defaultListId ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Skriv inn en tittel.");
      return;
    }
    onSave({
      id: task?.id ?? createId(),
      title: trimmed,
      description: description.trim(),
      dueDate: dueDate || null,
      listId: listId || null,
      priority,
      completedAt: task?.completedAt ?? null,
      position: task?.position ?? nextPosition,
      createdAt: task?.createdAt ?? new Date().toISOString(),
    });
    onClose();
  };

  return (
    <Dialog
      title={task ? "Rediger oppgave" : "Ny oppgave"}
      onClose={onClose}
      footer={
        <>
          {task ? (
            <Button
              variant="danger"
              onClick={() => {
                onDelete(task.id);
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
            <Button variant="primary" type="submit" form="task-form">
              Lagre
            </Button>
          </div>
        </>
      }
    >
      <form id="task-form" className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Tittel</span>
          <input
            className="input"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setError(null);
            }}
            autoFocus
          />
          {error ? <span className="field__error">{error}</span> : null}
        </label>
        <label className="field">
          <span className="field__label">Beskrivelse</span>
          <textarea
            className="input input--textarea"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
            }}
            rows={3}
          />
        </label>
        <div className="form__row">
          <label className="field">
            <span className="field__label">Dato</span>
            <input
              className="input"
              type="date"
              value={dueDate}
              onChange={(event) => {
                setDueDate(event.target.value);
              }}
            />
          </label>
          <label className="field">
            <span className="field__label">Kategori</span>
            <select
              className="input"
              value={listId}
              onChange={(event) => {
                setListId(event.target.value);
              }}
            >
              <option value="">Ingen</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          <span className="field__label">Prioritet</span>
          <select
            className="input"
            value={priority}
            onChange={(event) => {
              setPriority(Number(event.target.value) as Priority);
            }}
          >
            {PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {PRIORITY_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
      </form>
    </Dialog>
  );
}
