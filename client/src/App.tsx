import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ProfilePage from "@/pages/profile";
import VehiclesPage from "@/pages/vehicles";
import ProductsPage from "@/pages/products";
import CartPage from "@/pages/cart";
import TicketsPage from "@/pages/tickets";
import ChatsPage from "@/pages/chats";
import EmployeesPage from "@/pages/employees";
import ServiceCenterPage from "@/pages/service-center";
import SystemPage from "@/pages/system";
import MessengerPage from "@/pages/messenger";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      <Route path="/">
        <ProtectedRoute>
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute>
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/vehicles">
        <ProtectedRoute>
          <AppLayout>
            <VehiclesPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/products">
        <ProtectedRoute>
          <AppLayout>
            <ProductsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/cart">
        <ProtectedRoute>
          <AppLayout>
            <CartPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/tickets">
        <ProtectedRoute>
          <AppLayout>
            <TicketsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/chats">
        <ProtectedRoute>
          <AppLayout>
            <ChatsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/employees">
        <ProtectedRoute>
          <AppLayout>
            <EmployeesPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/service-center">
        <ProtectedRoute>
          <AppLayout>
            <ServiceCenterPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/system">
        <ProtectedRoute>
          <AppLayout>
            <SystemPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/messenger">
        <ProtectedRoute>
          <AppLayout>
            <MessengerPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute>
          <AppLayout>
            <div className="p-6">
              <h1 className="text-2xl font-semibold mb-4">Settings</h1>
              <p className="text-muted-foreground">Settings page coming soon.</p>
            </div>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
