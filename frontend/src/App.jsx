import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import DashboardLayout from "./components/DashboardLayout";
import {
  DispatcherDashboard,
  TripsManager,
  FleetRegistry,
  MaintenanceLogs,
  DriverRegistry,
  ComplianceLogs,
  FuelExpenses,
  AnalyticsDashboard,
  SystemSettings,
} from "./components/RoleDashboards";

// Route protection with Role-Based Access Control
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="bg-dark-surface border border-red-500/20 p-8 rounded shadow text-center py-16">
        <h3 className="text-xl font-bold text-red-400 font-mono tracking-wider uppercase">
          Access Forbidden
        </h3>
        <p className="text-xs text-gray-400 mt-3 max-w-md mx-auto">
          Your active credentials ({user.role}) do not possess permission
          parameters to read or write in this module. Contact depot admin for
          settings matrix adjustments.
        </p>
      </div>
    );
  }

  return children;
};

// Route redirection helper for authenticated users hitting standard paths
const AuthRedirect = ({ children }) => {
  const { user, token } = useAuthStore();

  if (token && user) {
    switch (user.role) {
      case "FleetManager":
        return <Navigate to="/fleet" replace />;
      case "Dispatcher":
        return <Navigate to="/dashboard" replace />;
      case "SafetyOfficer":
        return <Navigate to="/drivers" replace />;
      case "FinancialAnalyst":
        return <Navigate to="/expenses" replace />;
      case "Admin":
        return <Navigate to="/settings" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

const queryClient = new QueryClient();

function App() {
  const { checkAuth } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);

  // Validate session token on app load/reload
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRedirect>
                <Register />
              </AuthRedirect>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthRedirect>
                <ForgotPassword />
              </AuthRedirect>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <AuthRedirect>
                <ResetPassword />
              </AuthRedirect>
            }
          />

          {/* Protected Operational Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Dispatcher"]}>
                <DashboardLayout>
                  <DispatcherDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Dispatcher"]}>
                <DashboardLayout>
                  <TripsManager />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/fleet"
            element={
              <ProtectedRoute allowedRoles={["Admin", "FleetManager"]}>
                <DashboardLayout>
                  <FleetRegistry />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute allowedRoles={["Admin", "FleetManager"]}>
                <DashboardLayout>
                  <MaintenanceLogs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/drivers"
            element={
              <ProtectedRoute allowedRoles={["Admin", "SafetyOfficer"]}>
                <DashboardLayout>
                  <DriverRegistry />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/compliance"
            element={
              <ProtectedRoute allowedRoles={["Admin", "SafetyOfficer"]}>
                <DashboardLayout>
                  <ComplianceLogs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses"
            element={
              <ProtectedRoute allowedRoles={["Admin", "FinancialAnalyst"]}>
                <DashboardLayout>
                  <FuelExpenses />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={["Admin", "FinancialAnalyst"]}>
                <DashboardLayout>
                  <AnalyticsDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Settings accessible by all roles, but layout handles navigation */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                  "FleetManager",
                  "Dispatcher",
                  "SafetyOfficer",
                  "FinancialAnalyst",
                ]}
              >
                <DashboardLayout>
                  <SystemSettings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all Routing */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
