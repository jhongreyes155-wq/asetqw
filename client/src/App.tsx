import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotFound from "@/pages/not-found";
import RoleSelector from "@/pages/RoleSelector";
import AdminReviewQueue from "@/pages/AdminReviewQueue";
import AuthorLabs from "@/pages/AuthorLabs";
import CreateLab from "@/pages/CreateLab";
import { useEffect, useState } from "react";
import { api } from "./lib/api";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role="admin" />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AuthorLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role="author" />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await api.getCurrentUser();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      // Redirect to login
      window.location.href = '/api/login';
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  return (
    <Switch>
      <Route path="/" component={RoleSelector} />

      <Route path="/admin/review">
        <AdminLayout>
          <AdminReviewQueue />
        </AdminLayout>
      </Route>

      <Route path="/admin/labs">
        <AdminLayout>
          <div className="p-6">
            <h1 className="text-2xl font-semibold">All Labs</h1>
            <p className="text-muted-foreground mt-2">View and manage all labs in the system</p>
          </div>
        </AdminLayout>
      </Route>

      <Route path="/admin/settings">
        <AdminLayout>
          <div className="p-6">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-muted-foreground mt-2">Configure system settings</p>
          </div>
        </AdminLayout>
      </Route>

      <Route path="/author/labs">
        <AuthorLayout>
          <AuthorLabs />
        </AuthorLayout>
      </Route>

      <Route path="/author/labs/new">
        <AuthorLayout>
          <CreateLab />
        </AuthorLayout>
      </Route>

      <Route path="/author/labs/:id/edit">
        <AuthorLayout>
          <div className="p-6">
            <h1 className="text-2xl font-semibold">Edit Lab</h1>
            <p className="text-muted-foreground mt-2">Edit your lab details</p>
          </div>
        </AuthorLayout>
      </Route>

      <Route path="/author/labs/:id">
        <AuthorLayout>
          <div className="p-6">
            <h1 className="text-2xl font-semibold">Lab Details</h1>
            <p className="text-muted-foreground mt-2">View lab details and status</p>
          </div>
        </AuthorLayout>
      </Route>

      <Route path="/author/profile">
        <AuthorLayout>
          <div className="p-6">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your profile settings</p>
          </div>
        </AuthorLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;