import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { createServices } from "./app/services";
import { applyTheme, readThemePreference } from "./features/settings/theme";
import "./styles/app.css";

applyTheme(readThemePreference());
const services = createServices(import.meta.env);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App supabase={services.supabase} repository={services.repository} />
  </StrictMode>,
);
