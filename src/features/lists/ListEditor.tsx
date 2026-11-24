import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { DEFAULT_LIST_COLOR, LIST_COLORS } from "../../domain/colors";
import { createId } from "../../domain/ids";
import type { TaskList } from "../../domain/types";

interface ListEditorProps {
  list: TaskList | null;
  nextPosition: number;
  onSave: (list: TaskList) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function ListEditor({ list, nextPosition, onSave, onDelete, onClose }: ListEditorProps) {
  const [name, setName] = useState(list?.name ?? "");
  const [color, setColor] = useState(list?.color ?? DEFAULT_LIST_COLOR);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Skriv inn et navn.");
      return;
    }
    onSave({
      id: list?.id ?? createId(),
      name: trimmed,
      color,
      position: list?.position ?? nextPosition,
    });
    onClose();
  };

  return (
    <Dialog
      title={list ? "Rediger liste" : "Ny liste"}
      onClose={onClose}
      footer={
        <>
          {list ? (
            <Button
              variant="danger"
              onClick={() => {
                onDelete(list.id);
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
            <Button variant="primary" type="submit" form="list-form">
              Lagre
            </Button>
          </div>
        </>
      }
    >
      <form id="list-form" className="form" onSubmit={handleSubmit}>
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
          {error ? <span className="field__error">{error}</span> : null}
        </label>
        <fieldset className="field">
          <legend className="field__label">Farge</legend>
          <div className="choice-row">
            {LIST_COLORS.map((option) => (
              <button
                key={option}
                type="button"
                className={color === option ? "swatch is-selected" : "swatch"}
                style={{ backgroundColor: option }}
                aria-pressed={color === option}
                aria-label={`Farge ${option}`}
                onClick={() => {
                  setColor(option);
                }}
              />
            ))}
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}
