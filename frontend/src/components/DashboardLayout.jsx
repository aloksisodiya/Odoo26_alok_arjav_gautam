import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  LogOut,
  LayoutDashboard,
  Truck,
  Wrench,
  Compass,
  Users,
  FileCheck,
  DollarSign,
  BarChart3,
  Settings as SettingsIcon,
  AlertTriangle,
  Clock,
  Bell,
  CheckCircle,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const DashboardLayout = ({ children }) => {
  const { user, logout, token } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Inactivity timeout configuration
  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
  const WARNING_THRESHOLD = INACTIVITY_LIMIT - 30 * 1000; // Warn 30 seconds before logout

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Active alerts query
  const { data: alerts, refetch: refetchAlerts } = useQuery({
    queryKey: ["activeAlerts"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/alerts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    },
    enabled: !!user,
    refetchInterval: 10000 // Refetch every 10s
  });

  const handleResolveAlert = async (alertId) => {
    try {
      await axios.put(`http://localhost:5000/api/alerts/${alertId}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refetchAlerts();
    } catch (error) {
      console.error("Failed to resolve alert", error);
    }
  };

  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const resetTimer = () => {
    // Hide warning and clear intervals
    setShowWarning(false);
    setSecondsRemaining(30);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Set auto logout timeout
    timeoutRef.current = setTimeout(() => {
      handleAutoLogout();
    }, INACTIVITY_LIMIT);

    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      startWarningCountdown();
    }, WARNING_THRESHOLD);
  };

  const startWarningCountdown = () => {
    let remaining = 30;
    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
      }
    }, 1000);
  };

  const handleAutoLogout = () => {
    logout();
    navigate("/login");
  };

  const extendSession = () => {
    resetTimer();
  };

  // Activity listeners
  useEffect(() => {
    if (!user) return;

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    // Set initial timers
    resetTimer();

    const handleActivity = () => {
      // Don't reset timer if warning is currently shown (user must click extend button)
      if (!showWarning) {
        resetTimer();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, showWarning]);

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  // Format last login timestamp
  const formatLastLogin = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  // Navigation Links for all operational modules
  const getNavLinks = () => {
    const allLinks = [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        roles: ["Driver", "Admin"]
      },
      {
        name: "Fleet",
        path: "/fleet",
        icon: Truck,
        roles: ["FleetManager", "Admin"]
      },
      {
        name: "Drivers",
        path: "/drivers",
        icon: Users,
        roles: ["SafetyOfficer", "Admin"]
      },
      {
        name: "Trips",
        path: "/trips",
        icon: Compass,
        roles: ["Driver", "Admin"]
      },
      {
        name: "Maintenance",
        path: "/maintenance",
        icon: Wrench,
        roles: ["FleetManager", "Admin"]
      },
      {
        name: "Fuel & Expenses",
        path: "/expenses",
        icon: DollarSign,
        roles: ["FinancialAnalyst", "Admin"]
      },
      {
        name: "Analytics",
        path: "/analytics",
        icon: BarChart3,
        roles: ["FinancialAnalyst", "Admin"]
      },
      {
        name: "Settings",
        path: "/settings",
        icon: SettingsIcon,
        roles: ["FleetManager", "Driver", "SafetyOfficer", "FinancialAnalyst", "Admin"]
      },
    ];

    return allLinks.filter(link => !link.roles || link.roles.includes(user?.role));
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 flex flex-col font-sans">
      {/* INACTIVITY WARNING MODAL */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-surface border border-brand/50 p-6 rounded-lg max-w-sm w-full shadow-2xl text-center">
            <Clock className="w-12 h-12 text-brand mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wide mb-2">
              Inactivity Warning
            </h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Your session will terminate due to inactivity in{" "}
              <span className="font-mono text-brand font-bold text-sm">
                {secondsRemaining}
              </span>{" "}
              seconds.
            </p>
            <div className="space-y-2">
              <button onClick={extendSession} className="ops-btn-primary">
                Keep Me Logged In
              </button>
              <button onClick={handleAutoLogout} className="ops-btn-secondary">
                Log Out Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <header className="h-16 bg-dark-surface border-b border-dark-border px-6 flex items-center justify-between z-10">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand flex items-center justify-center rounded">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white font-mono tracking-tight">
            TransitOps
          </span>
        </div>

        {/* Right Side: Account Details & Last Login */}
        <div className="flex items-center gap-3 md:gap-6 relative">
          
          {/* ALERTS BELL NOTIFICATION BUTTON */}
          <div className="relative">
            <button 
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="relative p-2 bg-dark-bg border border-dark-border rounded text-gray-400 hover:text-white hover:border-dark-border/80 transition-colors flex items-center justify-center"
              title="Operational Alerts"
            >
              <Bell className="w-4 h-4" />
              {alerts && alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                  {alerts.length}
                </span>
              )}
            </button>

            {/* ALERTS DROPDOWN */}
            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-theme-panel border border-dark-border rounded-md shadow-2xl z-50 p-4 space-y-3 font-mono text-xs text-theme-text max-h-[350px] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-dark-border/40 pb-2">
                  <span className="font-bold text-white uppercase text-[10px]">Active Alerts</span>
                  <button onClick={() => setIsAlertsOpen(false)} className="text-theme-muted hover:text-white">✕</button>
                </div>
                {alerts && alerts.length > 0 ? (
                  <div className="space-y-2.5 divide-y divide-dark-border/30">
                    {alerts.map((alt, idx) => (
                      <div key={alt._id} className="pt-2.5 first:pt-0 space-y-1.5">
                        <div className="flex justify-between items-start gap-1">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${alt.severity === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {alt.type} · {alt.severity}
                          </span>
                          <button
                            onClick={() => handleResolveAlert(alt._id)}
                            className="text-theme-muted hover:text-green-400 font-bold flex items-center gap-0.5 text-[9px] transition-colors"
                            title="Resolve Alert"
                          >
                            <CheckCircle className="w-3 h-3" /> Resolve
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-300 leading-normal">{alt.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-theme-muted uppercase tracking-wider text-[10px]">No active operations alerts</div>
                )}
              </div>
            )}
          </div>

          <ThemeToggle className="hidden sm:inline-flex" />
          <div className="hidden lg:flex flex-col items-end border-r border-dark-border/40 pr-6">
            <span className="text-[10px] text-brand font-mono font-bold uppercase tracking-wider">
              Operational Session
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mt-0.5">
              <span>Last login:</span>
              <span className="text-gray-300 font-medium">
                {formatLastLogin(user.lastLogin)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-white">{user.name}</p>
              <span className="inline-block bg-brand/10 text-brand border border-brand/20 text-[10px] px-2 py-0.5 rounded font-mono font-medium mt-0.5 uppercase">
                {user.role.replace(/([A-Z])/g, " $1").trim()}
              </span>
            </div>

            <button
              onClick={handleAutoLogout}
              className="w-8 h-8 bg-dark-surface hover:bg-dark-hoverBg border border-dark-border text-gray-400 hover:text-red-400 rounded flex items-center justify-center transition-colors"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="sm:hidden ml-3">
          <ThemeToggle />
        </div>
      </header>

      {/* BODY WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-theme-panel-alt border-r border-dark-border p-4 flex flex-col justify-between hidden md:flex">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest pl-3">
                Authorized Modules
              </span>
              <nav className="mt-3 space-y-1">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={index}
                      to={link.path}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                        isActive
                          ? "bg-brand/10 border-l-2 border-brand text-white font-semibold"
                          : "text-gray-400 hover:text-white hover:bg-dark-surface/40"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${isActive ? "text-brand" : ""}`}
                      />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="p-3 bg-dark-surface/20 border border-dark-border/40 rounded text-center">
            <span className="text-[10px] text-gray-500 font-mono">
              DEPOT OPERATIONAL STATUS
            </span>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-gray-400 font-mono">
                DEPOT ACTIVE (127.0.0.1)
              </span>
            </div>
          </div>
        </aside>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 bg-dark-bg p-6 overflow-y-auto relative">
          {/* Mobile warning header if window is too small */}
          <div className="md:hidden mb-4 bg-dark-surface border border-dark-border p-3 rounded flex items-center justify-between text-xs">
            <span className="font-mono text-brand">Mobile Ops Mode</span>
            <div className="flex gap-2">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="text-gray-400 hover:text-white underline"
                >
                  {link.name.split(" ")[0]}
                </Link>
              ))}
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
