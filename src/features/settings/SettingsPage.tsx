import { Download, LogOut, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "../../components/Button";
import { useAuth } from "../auth/authContext";
import { useData } from "../../app/useData";
import { isSnapshotFormatError, parseSnapshot } from "../../domain/snapshotSchema";
import type { DataSnapshot } from "../../domain/types";
import { readThemePreference, writeThemePreference, type ThemePreference } from "./theme";

const THEME_LABELS: Record<ThemePreference, string> = {
  system: "Følg systemet",
  light: "Lys",
  dark: "Mørk",
};

export function SettingsPage() {
  const { snapshot, actions } = useData();
  const auth = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<ThemePreference>(readThemePreference);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = () => {
    if (!snapshot) {
      return;
    }
    const exported: DataSnapshot = { ...snapshot, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `todo-eksport-${exported.exportedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Eksporten er lastet ned.");
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    try {
      const data = parseSnapshot(JSON.parse(await file.text()));
      await actions.importSnapshot(data);
      setMessage("Importen er fullført.");
    } catch (error: unknown) {
      setMessage(
        isSnapshotFormatError(error) || error instanceof SyntaxError
          ? error.message
          : "Kunne ikke importere filen.",
      );
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Innstillinger</h1>
      </header>

      <section className="card settings-card">
        <h2 className="section-title">Utseende</h2>
        <div className="choice-row">
          {(Object.keys(THEME_LABELS) as ThemePreference[]).map((option) => (
            <Button
              key={option}
              variant={theme === option ? "primary" : "secondary"}
              aria-pressed={theme === option}
              onClick={() => {
                setTheme(option);
                writeThemePreference(option);
              }}
            >
              {THEME_LABELS[option]}
            </Button>
          ))}
        </div>
      </section>

      <section className="card settings-card">
        <h2 className="section-title">Data</h2>
        <p className="muted">Last ned alle oppgaver, lister og vaner som en JSON-fil, eller importer en tidligere eksport.</p>
        <div className="choice-row">
          <Button icon={<Download size={16} aria-hidden="true" />} onClick={handleExport}>
            Eksporter
          </Button>
          <Button
            icon={<Upload size={16} aria-hidden="true" />}
            onClick={() => {
              fileInput.current?.click();
            }}
          >
            Importer
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={handleImport}
          />
        </div>
        {message ? (
          <p className="muted" role="status">
            {message}
          </p>
        ) : null}
      </section>

      {auth.status === "signedIn" ? (
        <section className="card settings-card">
          <h2 className="section-title">Konto</h2>
          <p className="muted">Innlogget som {auth.email}</p>
          <Button
            icon={<LogOut size={16} aria-hidden="true" />}
            onClick={() => {
              void auth.signOut();
            }}
          >
            Logg ut
          </Button>
        </section>
      ) : null}
    </div>
  );
}
