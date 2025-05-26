
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import SendMessage from "./pages/SendMessage";
import ModPanel from "./pages/ModPanel";
import AdminConsole from "./pages/AdminConsole";
import ModeratorSignup from "./pages/ModeratorSignup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Route guard component for protected routes
const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode,
  requiredRole?: 'User' | 'Moderator' | 'Admin'
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // If still loading authentication state, show nothing
  if (isLoading) {
    return null;
  }
  
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    console.log(`User role ${user?.role} doesn't match required role ${requiredRole}, redirecting to messages`);
    return <Navigate to="/messages" replace />;
  }
  
  return <>{children}</>;
};

// Component to redirect moderators to mod panel
const ModeratorRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return null;
  }
  
  // Redirect moderators to mod panel instead of messages/send
  if (user?.role === 'Moderator') {
    return <Navigate to="/mod-panel" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Show nothing while loading authentication state
  if (isLoading) {
    return null;
  }

  // If user is authenticated and tries to access login page, redirect based on role
  if (isAuthenticated && window.location.pathname === '/') {
    if (user?.role === 'Moderator') {
      return <Navigate to="/mod-panel" replace />;
    } else if (user?.role === 'Admin') {
      return <Navigate to="/admin-console" replace />;
    }
    return <Navigate to="/messages" replace />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/moderator-signup" element={<ModeratorSignup />} />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <ModeratorRedirect>
              <Messages />
            </ModeratorRedirect>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/send" 
        element={
          <ProtectedRoute>
            <ModeratorRedirect>
              <SendMessage />
            </ModeratorRedirect>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/mod-panel" 
        element={
          <ProtectedRoute requiredRole="Moderator">
            <ModPanel />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-console" 
        element={
          <ProtectedRoute requiredRole="Admin">
            <AdminConsole />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <Toaster />
            <Sonner />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
