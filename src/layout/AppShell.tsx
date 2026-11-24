import {
  CalendarDays,
  CheckCircle2,
  Inbox,
  LayoutGrid,
  List,
  Plus,
  Settings,
  Sun,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useData } from "../app/useData";
import { HABIT_COLORS } from "../domain/colors";
import type { TaskList } from "../domain/types";
import { ListEditor } from "../features/lists/ListEditor";
import { useAuth } from "../features/auth/authContext";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { snapshot, saveError, actions } = useData();
  const { status } = useAuth();
  const navigate = useNavigate();
  const [listEditor, setListEditor] = useState<{ list: TaskList | null } | null>(null);

  const habits = [...(snapshot?.habits ?? [])].sort((a, b) => a.position - b.position);
  const lists = [...(snapshot?.taskLists ?? [])].sort((a, b) => a.position - b.position);

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Hovedmeny">
        <div className="logo">todo.</div>

        <nav className="sidebar__section">
          <p className="sidebar__label">Planlegging</p>
          <NavLink to="/i-dag" className="nav-link">
            <Sun size={18} aria-hidden="true" /> I dag
          </NavLink>
          <NavLink to="/kommende" className="nav-link">
            <CalendarDays size={18} aria-hidden="true" /> Kommende
          </NavLink>
          <NavLink to="/alle" className="nav-link">
            <Inbox size={18} aria-hidden="true" /> Alle oppgaver
          </NavLink>
          <NavLink to="/fullfort" className="nav-link">
            <CheckCircle2 size={18} aria-hidden="true" /> Fullført
          </NavLink>
        </nav>

        <nav className="sidebar__section">
          <p className="sidebar__label">Vaner</p>
          <NavLink to="/vaner" end className="nav-link">
            <LayoutGrid size={18} aria-hidden="true" /> Habit Tracker
          </NavLink>
          {habits.map((habit) => (
            <NavLink key={habit.id} to={`/vaner/${habit.id}`} className="nav-link nav-link--sub">
              <span className="dot" style={{ backgroundColor: HABIT_COLORS[habit.color] }} />
              {habit.name}
            </NavLink>
          ))}
          <button
            type="button"
            className="nav-link nav-link--button"
            onClick={() => {
              navigate("/vaner?ny=1");
            }}
          >
            <Plus size={18} aria-hidden="true" /> Ny vane
          </button>
        </nav>

        <nav className="sidebar__section">
          <p className="sidebar__label">Mine lister</p>
          {lists.map((list) => (
            <NavLink key={list.id} to={`/lister/${list.id}`} className="nav-link nav-link--sub">
              <span className="dot" style={{ backgroundColor: list.color }} />
              {list.name}
            </NavLink>
          ))}
          <button
            type="button"
            className="nav-link nav-link--button"
            onClick={() => {
              setListEditor({ list: null });
            }}
          >
            <Plus size={18} aria-hidden="true" /> Ny liste
          </button>
        </nav>

        <div className="sidebar__footer">
          <NavLink to="/innstillinger" className="nav-link">
            <Settings size={18} aria-hidden="true" /> Innstillinger
          </NavLink>
        </div>
      </aside>

      <div className="content">
        <header className="mobile-header">
          <span className="logo">todo.</span>
          <NavLink to="/innstillinger" className="icon-button" aria-label="Innstillinger">
            <Settings size={22} aria-hidden="true" />
          </NavLink>
        </header>

        {status === "disabled" ? (
          <p className="banner" role="status">
            Lokal modus: data lagres bare i denne nettleseren og synkroniseres ikke.
          </p>
        ) : null}
        {saveError ? (
          <p className="banner banner--error" role="alert">
            Kunne ikke lagre endringen: {saveError}
            <Button variant="ghost" onClick={actions.clearSaveError}>
              Lukk
            </Button>
          </p>
        ) : null}

        <main className="main">{children}</main>

        <nav className="bottom-nav" aria-label="Bunnmeny">
          <NavLink to="/i-dag" className="bottom-nav__item">
            <Sun size={22} aria-hidden="true" />
            I dag
          </NavLink>
          <NavLink to="/kommende" className="bottom-nav__item">
            <CalendarDays size={22} aria-hidden="true" />
            Kommende
          </NavLink>
          <NavLink to="/vaner" className="bottom-nav__item">
            <LayoutGrid size={22} aria-hidden="true" />
            Vaner
          </NavLink>
          <NavLink to="/lister" className="bottom-nav__item">
            <List size={22} aria-hidden="true" />
            Lister
          </NavLink>
        </nav>
      </div>

      {listEditor ? (
        <ListEditor
          list={listEditor.list}
          nextPosition={lists.length}
          onSave={actions.saveTaskList}
          onDelete={actions.deleteTaskList}
          onClose={() => {
            setListEditor(null);
          }}
        />
      ) : null}
    </div>
  );
}
