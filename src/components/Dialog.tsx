import { X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";
import { Button } from "./Button";

interface DialogProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/** Modal dialog that closes on Escape and on backdrop click. */
export function Dialog({ title, onClose, children, footer }: DialogProps) {
  const titleId = useId();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <header className="dialog__header">
          <h2 id={titleId}>{title}</h2>
          <Button variant="ghost" className="icon-button" onClick={onClose} aria-label="Lukk">
            <X size={20} aria-hidden="true" />
          </Button>
        </header>
        <div className="dialog__body">{children}</div>
        {footer ? <footer className="dialog__footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
