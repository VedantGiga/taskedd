import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-context";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import TasksPage from "@/pages/tasks";
import UpcomingPage from "@/pages/upcoming";
import ImportantPage from "@/pages/important";
import ProjectsPage from "@/pages/projects";
import { Sidebar } from "./components/sidebar";

// Simple route component (no auth required)
function AppRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <Component />
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Standard routes (no auth) */}
      <Route path="/">
        {() => <AppRoute component={Dashboard} />}
      </Route>
      <Route path="/tasks">
        {() => <AppRoute component={TasksPage} />}
      </Route>
      <Route path="/upcoming">
        {() => <AppRoute component={UpcomingPage} />}
      </Route>
      <Route path="/important">
        {() => <AppRoute component={ImportantPage} />}
      </Route>
      <Route path="/projects">
        {() => <AppRoute component={ProjectsPage} />}
      </Route>
      
      {/* Catch-all for 404s */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
