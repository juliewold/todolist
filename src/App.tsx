import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthProvider";
import { useAuth } from "./features/auth/authContext";
import { LoginPage } from "./features/auth/LoginPage";
import { HabitsPage } from "./features/habits/HabitsPage";
import { ListsIndexPage } from "./features/lists/ListsIndexPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import {
  AllTasksPage,
  CompletedPage,
  ListTasksPage,
  TodayPage,
  UpcomingPage,
} from "./features/tasks/TaskPages";
import { AppShell } from "./layout/AppShell";
import { DataProvider } from "./app/DataProvider";
import type { TodoRepository } from "./data/repository";
import type { SupabaseClient } from "@supabase/supabase-js";

interface AppProps {
  supabase: SupabaseClient | null;
  repository: TodoRepository;
}

export function App({ supabase, repository }: AppProps) {
  return (
    <AuthProvider supabase={supabase}>
      <HashRouter>
        <AuthGate repository={repository} />
      </HashRouter>
    </AuthProvider>
  );
}

function AuthGate({ repository }: { repository: TodoRepository }) {
  const { status, email } = useAuth();

  useEffect(() => {
    document.title = "todo.";
  }, []);

  if (status === "loading") {
    return <div className="splash">todo.</div>;
  }
  if (status === "signedOut") {
    return <LoginPage />;
  }
  return (
    <DataProvider key={email ?? "local"} repository={repository}>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/i-dag" replace />} />
          <Route path="/i-dag" element={<TodayPage />} />
          <Route path="/kommende" element={<UpcomingPage />} />
          <Route path="/alle" element={<AllTasksPage />} />
          <Route path="/fullfort" element={<CompletedPage />} />
          <Route path="/lister" element={<ListsIndexPage />} />
          <Route path="/lister/:listId" element={<ListTasksPage />} />
          <Route path="/vaner" element={<HabitsPage />} />
          <Route path="/vaner/:habitId" element={<HabitsPage />} />
          <Route path="/innstillinger" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/i-dag" replace />} />
        </Routes>
      </AppShell>
    </DataProvider>
  );
}
