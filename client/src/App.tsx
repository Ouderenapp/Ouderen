import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Center from "@/pages/center";
import Activity from "@/pages/activity";
import Profile from "@/pages/profile";
import Auth from "@/pages/auth";
import CenterAdmin from "@/pages/center-admin";
import ActivityStats from "@/pages/activity-stats";
import Navigation from "@/components/navigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/centers/:id" component={Center} />
      <Route path="/activities/:id" component={Activity} />
      <Route path="/profile" component={Profile} />
      <Route path="/auth" component={Auth} />
      <Route path="/center-admin" component={CenterAdmin} />
      <Route path="/activity-stats" component={ActivityStats} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <Router />
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
import { Route, Switch } from "wouter";
import HomePage from "./pages/home";
import CenterPage from "./pages/center";
import ProfilePage from "./pages/profile";
import CenterAdminPage from "./pages/center-admin";
import RegisterPage from "./pages/register";
import LoginPage from "./pages/login";
import NotFoundPage from "./pages/not-found";
import HelpPage from "./pages/help"; // Importeer de help pagina
import { AuthProvider } from "./contexts/auth-context";
import { ThemeProvider } from "./contexts/theme-context";
import "./index.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/centers/:id" component={CenterPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/admin" component={CenterAdminPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/help" component={HelpPage} /> {/* Voeg de help route toe */}
          <Route component={NotFoundPage} />
        </Switch>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
