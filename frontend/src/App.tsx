import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ColorSchemeProvider } from "@/components/color-scheme-provider";
import { SettingsProvider } from "@/components/settings-provider";
import { AppShell } from "@/components/layout/AppShell";
import { CandidateShell } from "@/components/layout/CandidateShell";
import { PageLoadSplash } from "@/components/system/PageLoadSplash";
import { NetworkStatusProvider } from "@/components/system/NetworkStatusIndicator";
import { AINotificationsProvider } from "@/components/ai/ai-notifications";
import { getSession } from "@/lib/auth";

// Admin pages
import Dashboard from "@/pages/Dashboard";
import Batches from "@/pages/Batches";
import BatchNew from "@/pages/BatchNew";
import BatchDetail from "@/pages/BatchDetail";
import Candidates from "@/pages/Candidates";
import CandidateDetail from "@/pages/CandidateDetail";
import Attendance from "@/pages/Attendance";
import Schedule from "@/pages/Schedule";
import Assessments from "@/pages/Assessments";
import Trainers from "@/pages/Trainers";
import TrainerDetail from "@/pages/TrainerDetail";
import Feedback from "@/pages/Feedback";
import Reports from "@/pages/Reports";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

// Candidate pages
import CandidateHome from "@/pages/candidate/CandidateHome";
import CandidateMyBatch from "@/pages/candidate/CandidateMyBatch";
import CandidateMySchedule from "@/pages/candidate/CandidateMySchedule";
import CandidateMyAssessments from "@/pages/candidate/CandidateMyAssessments";
import CandidateMyFeedback from "@/pages/candidate/CandidateMyFeedback";
import CandidateMyProfile from "@/pages/candidate/CandidateMyProfile";
import CandidateMySettings from "@/pages/candidate/CandidateMySettings";

const queryClient = new QueryClient();

function CandidateRouter() {
  return (
    <CandidateShell>
      <Switch>
        <Route path="/" component={CandidateHome} />
        <Route path="/batch" component={CandidateMyBatch} />
        <Route path="/schedule" component={CandidateMySchedule} />
        <Route path="/assessments" component={CandidateMyAssessments} />
        <Route path="/feedback" component={CandidateMyFeedback} />
        <Route path="/profile" component={CandidateMyProfile} />
        <Route path="/settings" component={CandidateMySettings} />
        <Route component={NotFound} />
      </Switch>
    </CandidateShell>
  );
}

function AdminRouter() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/batches" component={Batches} />
        <Route path="/batches/new" component={BatchNew} />
        <Route path="/batches/:id" component={BatchDetail} />
        <Route path="/candidates" component={Candidates} />
        <Route path="/candidates/:id" component={CandidateDetail} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/assessments" component={Assessments} />
        <Route path="/trainers" component={Trainers} />
        <Route path="/trainers/:id" component={TrainerDetail} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/reports" component={Reports} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/settings" component={Settings} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function Router() {
  const [location] = useLocation();
  const session = getSession();

  if (location === "/login") {
    // Already logged in — redirect to the right portal
    if (session) {
      return <Redirect to={session.role === "candidate" ? "/candidate" : "/"} />;
    }
    return <Login />;
  }

  // Protect all routes — redirect unauthenticated users to login
  if (!session) {
    return <Redirect to="/login" />;
  }

  // Candidate tries to access admin area — send them to their portal
  if (session.role === "candidate" && !location.startsWith("/candidate")) {
    return <Redirect to="/candidate" />;
  }

  // Admin tries to access candidate area — send them to admin dashboard
  if (session.role === "admin" && (location === "/candidate" || location.startsWith("/candidate/"))) {
    return <Redirect to="/" />;
  }

  if (location === "/candidate" || location.startsWith("/candidate/")) {
    return (
      <WouterRouter base="/candidate">
        <CandidateRouter />
      </WouterRouter>
    );
  }

  return <AdminRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <ColorSchemeProvider>
          <SettingsProvider>
            <TooltipProvider>
              <NetworkStatusProvider>
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <AINotificationsProvider>
                    <Router />
                  </AINotificationsProvider>
                </WouterRouter>
                <Toaster />
                <PageLoadSplash />
              </NetworkStatusProvider>
            </TooltipProvider>
          </SettingsProvider>
        </ColorSchemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
