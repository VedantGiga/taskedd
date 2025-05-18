import { createRoot } from "react-dom/client";
import App from "./App";
import "./theme.css"; // Import theme CSS first
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="taskflow-theme">
    <App />
  </ThemeProvider>
);
