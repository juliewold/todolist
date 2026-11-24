import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useData } from "../../app/useData";
import { formatLongDate, todayIso } from "../../domain/dates";
import {
  selectCompletedTasks,
  selectOpenTasks,
  selectTasksForList,
  selectTodayTasks,
  selectUpcomingTasks,
} from "../../domain/taskSelectors";
import { TodayHabits } from "../habits/TodayHabits";
import { TasksView, TodayProgress } from "./TasksView";
import { TaskList } from "./TaskList";
import { EmptyState } from "../../components/EmptyState";

export function TodayPage() {
  const { snapshot } = useData();
  const today = todayIso();
  const tasks = snapshot?.tasks ?? [];
  const habits = useMemo(
    () => [...(snapshot?.habits ?? [])].sort((a, b) => a.position - b.position),
    [snapshot],
  );
  const grouped = selectTodayTasks(tasks, today);
  const visible = [...grouped.overdue, ...grouped.today];

  return (
    <TasksView
      tasks={visible}
      emptyTitle="Ingen oppgaver i dag"
      emptyText="Legg til en oppgave under, eller slapp tilbake og nyt dagen."
      quickAddDueDate={today}
      showDate={false}
      sortable
      header={
        <header className="page-header">
          <h1 className="page-title">I dag</h1>
          <p className="page-subtitle">{formatLongDate(today)}</p>
        </header>
      }
      footer={habits.length > 0 ? <TodayHabits habits={habits} today={today} /> : null}
    >
      <TodayProgress done={grouped.done} total={grouped.total} />
      <h2 className="section-title">Dagens oppgaver</h2>
    </TasksView>
  );
}

export function UpcomingPage() {
  const { snapshot, actions } = useData();
  const today = todayIso();
  const tasks = snapshot?.tasks ?? [];
  const lists = snapshot?.taskLists ?? [];
  const groups = selectUpcomingTasks(tasks, today);
  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Kommende</h1>
        <p className="page-subtitle">Neste 60 dager</p>
      </header>
      {groups.length === 0 ? (
        <EmptyState title="Ingen kommende oppgaver" />
      ) : (
        groups.map((group) => (
          <section key={group.date} className="day-group">
            <h2 className="section-title">{formatLongDate(group.date)}</h2>
            <TaskList
              tasks={group.tasks}
              allTasks={tasks}
              lists={lists}
              showDate={false}
              sortable={false}
              onToggle={actions.toggleTask}
              onOpen={() => undefined}
              onReorder={actions.saveTasks}
            />
          </section>
        ))
      )}
    </div>
  );
}

export function AllTasksPage() {
  const { snapshot } = useData();
  const today = todayIso();
  const tasks = snapshot?.tasks ?? [];
  return (
    <TasksView
      tasks={selectOpenTasks(tasks)}
      emptyTitle="Ingen åpne oppgaver"
      quickAddDueDate={null}
      showDate
      sortable
      header={
        <header className="page-header">
          <h1 className="page-title">Alle oppgaver</h1>
          <p className="page-subtitle">{formatLongDate(today)}</p>
        </header>
      }
    />
  );
}

export function CompletedPage() {
  const { snapshot, actions } = useData();
  const tasks = snapshot?.tasks ?? [];
  const lists = snapshot?.taskLists ?? [];
  const completed = selectCompletedTasks(tasks);
  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Fullført</h1>
        <p className="page-subtitle">{completed.length} oppgaver</p>
      </header>
      {completed.length === 0 ? (
        <EmptyState title="Ingen fullførte oppgaver ennå" />
      ) : (
        <TaskList
          tasks={completed}
          allTasks={tasks}
          lists={lists}
          showDate
          sortable={false}
          onToggle={actions.toggleTask}
          onOpen={() => undefined}
          onReorder={actions.saveTasks}
        />
      )}
    </div>
  );
}

export function ListTasksPage() {
  const { listId } = useParams();
  const { snapshot } = useData();
  const tasks = snapshot?.tasks ?? [];
  const list = snapshot?.taskLists.find((item) => item.id === listId);
  if (!list) {
    return <EmptyState title="Fant ikke listen" />;
  }
  return (
    <TasksView
      tasks={selectTasksForList(tasks, list.id)}
      emptyTitle={`Ingen oppgaver i ${list.name}`}
      quickAddDueDate={null}
      quickAddListId={list.id}
      showDate
      sortable
      header={
        <header className="page-header">
          <h1 className="page-title">{list.name}</h1>
        </header>
      }
    />
  );
}
