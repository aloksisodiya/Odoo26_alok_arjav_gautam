import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Truck,
  Users,
  Compass,
  DollarSign,
  Wrench,
  BarChart3,
  ShieldAlert,
  Sliders,
  Search,
  CheckCircle,
  FileText,
  AlertTriangle
} from "lucide-react";

const Card = ({ title, value, desc, icon: Icon, color = "text-brand" }) => (
  <div className="bg-dark-surface border border-dark-border p-5 rounded shadow hover:border-brand/40 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">
          {title}
        </p>
        <h4 className="text-2xl font-bold mt-1.5 technical-mono text-white">
          {value}
        </h4>
      </div>
      <div className={`p-2.5 bg-dark-surface rounded ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    {desc && <p className="text-xs text-gray-400 mt-3">{desc}</p>}
  </div>
);

// 1. Dispatcher default: Dashboard
export const DispatcherDashboard = () => {
  const [search, setSearch] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const token = useAuthStore.getState().token;
      const response = await axios.get("http://localhost:5000/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    },
    refetchInterval: 10000 // Keep operational stats live
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-theme-muted font-mono">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
        <span>CONNECTING DEPOT FEED...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/40 border border-red-500/30 p-6 rounded text-center text-red-400 font-mono">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h4 className="font-bold">FEED ERROR</h4>
        <p className="text-xs mt-1">Failed to establish active websocket/data connection to database.</p>
      </div>
    );
  }

  const { metrics, vehicleStatus, recentTrips } = data;

  // Filter logic
  const filteredTrips = recentTrips.filter(trip => {
    const matchesSearch = 
      trip.tripId.toLowerCase().includes(search.toLowerCase()) ||
      trip.source.toLowerCase().includes(search.toLowerCase()) ||
      trip.destination.toLowerCase().includes(search.toLowerCase()) ||
      trip.driver.toLowerCase().includes(search.toLowerCase()) ||
      trip.vehicle.toLowerCase().includes(search.toLowerCase());

    const matchesType = vehicleTypeFilter === "All" || trip.vehicleType === vehicleTypeFilter;
    const matchesStatus = statusFilter === "All" || trip.status === statusFilter;
    const matchesSource = sourceFilter === "All" || trip.source === sourceFilter;

    return matchesSearch && matchesType && matchesStatus && matchesSource;
  });

  // Calculate percentages for vehicle status progress bars
  const totalVehicles = (vehicleStatus.available || 0) + (vehicleStatus.onTrip || 0) + (vehicleStatus.inShop || 0) + (vehicleStatus.retired || 0);
  const getPct = (val) => totalVehicles > 0 ? Math.round((val / totalVehicles) * 100) : 0;

  // Unique sources for the dropdown filter
  const uniqueSources = [...new Set(recentTrips.map(t => t.source))];

  return (
    <div className="space-y-6 text-theme-text transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-tight text-theme-text uppercase">
            Dispatch Operations Centre
          </h2>
          <p className="text-xs text-theme-muted mt-1 font-mono">
            Real-time database feed of active dispatches, driver rosters, and fleet metrics.
          </p>
        </div>
        
        {/* Search bar */}
        <div className="relative w-full md:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-theme-muted">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search dispatches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ops-input pl-9"
          />
        </div>
      </div>

      {/* METRIC GRID (7 Cards Side by Side) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-theme-panel border border-dark-border p-4 rounded shadow flex flex-col justify-between border-l-2 border-l-blue-500">
          <div>
            <span className="text-[9px] text-theme-muted font-mono font-bold uppercase tracking-wider block">Active Vehicles</span>
            <span className="text-2xl font-bold font-mono text-theme-text mt-1 block">{String(metrics.activeVehicles).padStart(2, '0')}</span>
          </div>
          <span className="text-[9px] text-theme-muted font-mono mt-2 block leading-none">In transit en route</span>
        </div>

        <div className="bg-theme-panel border border-dark-border p-4 rounded shadow flex flex-col justify-between border-l-2 border-l-green-500">
          <div>
            <span className="text-[9px] text-theme-muted font-mono font-bold uppercase tracking-wider block">Available</span>
            <span className="text-2xl font-bold font-mono text-theme-text mt-1 block">{String(metrics.availableVehicles).padStart(2, '0')}</span>
          </div>
          <span className="text-[9px] text-theme-muted font-mono mt-2 block leading-none">In depot ready</span>
        </div>

        <div className="bg-theme-panel border border-dark-border p-4 rounded shadow flex flex-col justify-between border-l-2 border-l-amber-500">
          <div>
            <span className="text-[9px] text-theme-muted font-mono font-bold uppercase tracking-wider block">In Shop</span>
            <span className="text-2xl font-bold font-mono text-theme-text mt-1 block">{String(metrics.vehiclesInMaintenance).padStart(2, '0')}</span>
          </div>
          <span className="text-[9px] text-theme-muted font-mono mt-2 block leading-none">Maintenance status</span>
        </div>

        <div className="bg-theme-panel border border-dark-border p-4 rounded shadow flex flex-col justify-between border-l-2 border-l-indigo-500">
          <div>
            <span className="text-[9px] text-theme-muted font-mono font-bold uppercase tracking-wider block">Active Trips</span>
            <span className="text-2xl font-bold font-mono text-theme-text mt-1 block">{String(metrics.activeTrips).padStart(2, '0')}</span>
          </div>
          <span className="text-[9px] text-theme-muted font-mono mt-2 block leading-none">Dispatched trips</span>
        </div>

        <div className="bg-theme-panel border border-dark-border p-4 rounded shadow flex flex-col justify-between border-l-2 border-l-sky-400">
          <div>
            <span className="text-[9px] text-theme-muted font-mono font-bold uppercase tracking-wider block">Pending Trips</span>
            <span className="text-2xl font-bold font-mono text-theme-text mt-1 block">{String(metrics.pendingTrips).padStart(2, '0')}</span>
          </div>
          <span className="text-[9px] text-theme-muted font-mono mt-2 block leading-none">Draft queues</span>
        </div>

        <div className="bg-theme-panel border border-dark-border p-4 rounded shadow flex flex-col justify-between border-l-2 border-l-gray-500">
          <div>
            <span className="text-[9px] text-theme-muted font-mono font-bold uppercase tracking-wider block">Drivers Duty</span>
            <span className="text-2xl font-bold font-mono text-theme-text mt-1 block">{String(metrics.driversOnDuty).padStart(2, '0')}</span>
          </div>
          <span className="text-[9px] text-theme-muted font-mono mt-2 block leading-none">On-road drivers</span>
        </div>

        <div className="bg-theme-panel border border-dark-border p-4 rounded shadow flex flex-col justify-between border-l-2 border-l-brand">
          <div>
            <span className="text-[9px] text-theme-muted font-mono font-bold uppercase tracking-wider block">Utilization</span>
            <span className="text-2xl font-bold font-mono text-theme-text mt-1 block">{metrics.fleetUtilization}%</span>
          </div>
          <span className="text-[9px] text-theme-muted font-mono mt-2 block leading-none">Operational ratio</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-theme-panel border border-dark-border p-4 rounded shadow space-y-3">
        <span className="text-[10px] text-theme-muted font-mono font-bold uppercase tracking-widest block">Operations Filters</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] text-theme-muted font-mono uppercase mb-1 font-bold">Vehicle Type</label>
            <select 
              value={vehicleTypeFilter} 
              onChange={(e) => setVehicleTypeFilter(e.target.value)} 
              className="ops-input cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Mini">Mini</option>
              <option value="Container">Container</option>
              <option value="Flatbed">Flatbed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[10px] text-theme-muted font-mono uppercase mb-1 font-bold">Trip Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="ops-input cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-theme-muted font-mono uppercase mb-1 font-bold">Source Region</label>
            <select 
              value={sourceFilter} 
              onChange={(e) => setSourceFilter(e.target.value)} 
              className="ops-input cursor-pointer"
            >
              <option value="All">All Regions</option>
              {uniqueSources.map((source, idx) => (
                <option key={idx} value={source}>{source}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MAIN DATA SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT TRIPS TABLE (2/3 width) */}
        <div className="lg:col-span-2 bg-theme-panel border border-dark-border rounded p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-theme-text flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand" /> Recent Trips Log
            </h3>
            <span className="text-[10px] text-theme-muted font-mono">Showing {filteredTrips.length} dispatches</span>
          </div>

          <div className="overflow-x-auto">
            {filteredTrips.length > 0 ? (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-dark-border pb-3 text-theme-muted text-[10px] uppercase">
                    <th className="py-2.5">Trip ID</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Route Map</th>
                    <th>Status</th>
                    <th className="text-right">ETA / Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40 text-theme-text">
                  {filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-dark-hoverBg/25 transition-colors">
                      <td className="py-3 text-brand font-bold">{trip.tripId}</td>
                      <td>
                        <span className="font-semibold block">{trip.vehicle}</span>
                        <span className="text-[10px] text-theme-muted font-sans block">{trip.vehicleName}</span>
                      </td>
                      <td className="font-semibold">{trip.driver}</td>
                      <td>
                        <span className="block text-[11px] font-sans truncate max-w-[200px]" title={`${trip.source} ➔ ${trip.destination}`}>
                          {trip.source} ➔ {trip.destination}
                        </span>
                      </td>
                      <td>
                        {trip.status === "Completed" && <span className="ops-badge-success">Completed</span>}
                        {trip.status === "Dispatched" && <span className="ops-badge-warning">Dispatched</span>}
                        {trip.status === "Draft" && <span className="ops-badge-info bg-gray-500/10 text-gray-400 border-gray-500/20">Draft</span>}
                        {trip.status === "Cancelled" && <span className="ops-badge-danger">Cancelled</span>}
                      </td>
                      <td className="text-right technical-mono text-theme-muted font-bold">
                        {trip.status === "Dispatched" ? (
                          <span className="text-blue-400 font-mono">{trip.eta}</span>
                        ) : trip.status === "Draft" ? (
                          <span className="text-gray-500 font-mono">Awaiting vehicle</span>
                        ) : (
                          <span className="text-theme-muted font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-theme-muted font-mono text-xs">
                NO DISPATCHES MATCHING SELECTED FILTERS.
              </div>
            )}
          </div>
        </div>

        {/* VEHICLE STATUS PROGRESS BARS (1/3 width) */}
        <div className="bg-theme-panel border border-dark-border rounded p-6 shadow space-y-6">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-theme-text flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand" /> Vehicle Status Distribution
          </h3>

          <div className="space-y-4">
            {/* Available */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-theme-text">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Available
                </span>
                <span className="font-bold">{vehicleStatus.available} vehicles ({getPct(vehicleStatus.available)}%)</span>
              </div>
              <div className="w-full bg-dark-bg border border-dark-border h-2.5 rounded overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-500" 
                  style={{ width: `${getPct(vehicleStatus.available)}%` }}
                ></div>
              </div>
            </div>

            {/* On Trip */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-theme-text">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> On Trip
                </span>
                <span className="font-bold">{vehicleStatus.onTrip} vehicles ({getPct(vehicleStatus.onTrip)}%)</span>
              </div>
              <div className="w-full bg-dark-bg border border-dark-border h-2.5 rounded overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${getPct(vehicleStatus.onTrip)}%` }}
                ></div>
              </div>
            </div>

            {/* In Shop */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-theme-text">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> In Shop
                </span>
                <span className="font-bold">{vehicleStatus.inShop} vehicles ({getPct(vehicleStatus.inShop)}%)</span>
              </div>
              <div className="w-full bg-dark-bg border border-dark-border h-2.5 rounded overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-500" 
                  style={{ width: `${getPct(vehicleStatus.inShop)}%` }}
                ></div>
              </div>
            </div>

            {/* Retired */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-theme-text">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Retired
                </span>
                <span className="font-bold">{vehicleStatus.retired} vehicles ({getPct(vehicleStatus.retired)}%)</span>
              </div>
              <div className="w-full bg-dark-bg border border-dark-border h-2.5 rounded overflow-hidden">
                <div 
                  className="bg-red-500 h-full transition-all duration-500" 
                  style={{ width: `${getPct(vehicleStatus.retired)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="border-t border-dark-border/40 pt-4 text-center">
            <span className="text-[10px] text-theme-muted font-mono">
              TOTAL OPERATIONAL FLEET: {totalVehicles - (vehicleStatus.retired || 0)} UNITS
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

// 2. Dispatcher component: Trips
export const TripsManager = () => (
  <div className="bg-dark-surface border border-dark-border p-6 rounded text-center py-12">
    <Compass className="w-12 h-12 text-brand mx-auto mb-4" />
    <h3 className="text-lg font-bold text-white font-mono">TRIP DISPATCHER</h3>
    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
      Create, dispatch, and manage operations. (This module will be fully
      populated in the upcoming phases).
    </p>
  </div>
);

// 3. Fleet Manager component: Fleet Registry
export const FleetRegistry = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-white font-mono">
        VEHICLE REGISTRY
      </h2>
      <p className="text-xs text-gray-400 mt-1">
        Manage and track company transportation assets.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Card
        title="Total Registered"
        value="32 Vehicles"
        desc="24 Trucks, 8 Vans"
        icon={Truck}
      />
      <Card
        title="Operational Status"
        value="28 Active"
        desc="4 in shop for maintenance"
        icon={Wrench}
        color="text-green-400"
      />
      <Card
        title="Avg Odometer"
        value="142,390 km"
        desc="Calculated across entire fleet"
        icon={Compass}
        color="text-blue-400"
      />
    </div>
    <div className="bg-dark-surface border border-dark-border p-6 rounded text-center py-8">
      <p className="text-xs text-gray-500 font-mono">
        Asset creation forms and logs will load here.
      </p>
    </div>
  </div>
);

// 4. Fleet Manager component: Maintenance
export const MaintenanceLogs = () => (
  <div className="bg-dark-surface border border-dark-border p-6 rounded text-center py-12">
    <Wrench className="w-12 h-12 text-brand mx-auto mb-4" />
    <h3 className="text-lg font-bold text-white font-mono">
      MAINTENANCE SCHEDULER
    </h3>
    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
      Open work logs and track repair tickets. (This module will be fully
      populated in the upcoming phases).
    </p>
  </div>
);

// 5. Safety Officer component: Driver Registry
export const DriverRegistry = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-white font-mono">
        DRIVER REGISTRY & SECURITY
      </h2>
      <p className="text-xs text-gray-400 mt-1">
        Driver licensing, history, scores, and status monitoring.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Card
        title="Total Drivers"
        value="20 Officers"
        desc="18 available, 2 off-duty"
        icon={Users}
      />
      <Card
        title="License Expirations"
        value="0 Alerts"
        desc="All licenses valid > 30 days"
        icon={ShieldAlert}
        color="text-green-400"
      />
      <Card
        title="Depot Safety Rating"
        value="94%"
        desc="Calculated on driving logs"
        icon={BarChart3}
        color="text-blue-400"
      />
    </div>
    <div className="bg-dark-surface border border-dark-border p-6 rounded text-center py-8">
      <p className="text-xs text-gray-500 font-mono">
        Driver records will load here.
      </p>
    </div>
  </div>
);

// 6. Safety Officer component: Compliance
export const ComplianceLogs = () => (
  <div className="bg-dark-surface border border-dark-border p-6 rounded text-center py-12">
    <ShieldAlert className="w-12 h-12 text-brand mx-auto mb-4" />
    <h3 className="text-lg font-bold text-white font-mono">
      COMPLIANCE ENGINE
    </h3>
    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
      Monitor safety violations and licensing checks. (This module will be fully
      populated in the upcoming phases).
    </p>
  </div>
);

// 7. Financial Analyst component: Fuel & Expenses
export const FuelExpenses = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-white font-mono">
        FUEL & OPERATION EXPENSES
      </h2>
      <p className="text-xs text-gray-400 mt-1">
        Real-time ledger matching trip receipts, fuel cards, and tolls.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Card
        title="Total Fuel Cost"
        value="$14,280"
        desc="Based on 4,200 Liters logged"
        icon={DollarSign}
      />
      <Card
        title="Total Toll & Other"
        value="$2,490"
        desc="Tolls and highway logs"
        icon={Compass}
        color="text-green-400"
      />
      <Card
        title="Total Operational Cost"
        value="$16,770"
        desc="Sum of fuel & maintenance cost"
        icon={Wrench}
        color="text-blue-400"
      />
    </div>
    <div className="bg-dark-surface border border-dark-border p-6 rounded text-center py-8">
      <p className="text-xs text-gray-500 font-mono">
        Ledger invoices will load here.
      </p>
    </div>
  </div>
);

// 8. Financial Analyst component: Analytics Dashboard
export const AnalyticsDashboard = () => (
  <div className="bg-dark-surface border border-dark-border p-6 rounded text-center py-12">
    <BarChart3 className="w-12 h-12 text-brand mx-auto mb-4" />
    <h3 className="text-lg font-bold text-white font-mono">ANALYTICS ENGINE</h3>
    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
      View asset ROI calculations, carbon logs, and efficiency scores. (This
      module will be fully populated in the upcoming phases).
    </p>
  </div>
);

// 9. Common component: Settings
export const SystemSettings = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-white font-mono">
        SYSTEM SETTINGS
      </h2>
      <p className="text-xs text-gray-400 mt-1">
        Configure global operational params and permission matrices.
      </p>
    </div>

    <div className="bg-dark-surface border border-dark-border rounded p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-mono">
            Depot Name
          </label>
          <input
            type="text"
            defaultValue="TransitOps Depot Alpha"
            className="ops-input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-mono">
            Currency
          </label>
          <select className="ops-input cursor-pointer">
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-mono">
            Distance Unit
          </label>
          <select className="ops-input cursor-pointer">
            <option value="km">Kilometers (km)</option>
            <option value="mi">Miles (mi)</option>
          </select>
        </div>
      </div>

      <div className="border-t border-dark-border pt-6">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand" /> RBAC Permission Matrix
          (Dynamically enforced)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-gray-300">
            <thead>
              <tr className="border-b border-dark-border pb-3 text-gray-500 text-[10px] uppercase">
                <th className="py-2">Role</th>
                <th>Fleet Module</th>
                <th>Dispatcher Module</th>
                <th>Safety Module</th>
                <th>Finance Module</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40">
              <tr>
                <td className="py-3 text-white font-bold">Fleet Manager</td>
                <td>
                  <span className="ops-badge-success">Edit & Read</span>
                </td>
                <td>
                  <span className="ops-badge-danger">None</span>
                </td>
                <td>
                  <span className="ops-badge-danger">None</span>
                </td>
                <td>
                  <span className="ops-badge-info">Read Only</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 text-white font-bold">Dispatcher</td>
                <td>
                  <span className="ops-badge-info">Read Only</span>
                </td>
                <td>
                  <span className="ops-badge-success">Edit & Read</span>
                </td>
                <td>
                  <span className="ops-badge-danger">None</span>
                </td>
                <td>
                  <span className="ops-badge-danger">None</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 text-white font-bold">Safety Officer</td>
                <td>
                  <span className="ops-badge-danger">None</span>
                </td>
                <td>
                  <span className="ops-badge-danger">None</span>
                </td>
                <td>
                  <span className="ops-badge-success">Edit & Read</span>
                </td>
                <td>
                  <span className="ops-badge-danger">None</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 text-white font-bold">Financial Analyst</td>
                <td>
                  <span className="ops-badge-info">Read Only</span>
                </td>
                <td>
                  <span className="ops-badge-danger">None</span>
                </td>
                <td>
                  <span className="ops-badge-danger">None</span>
                </td>
                <td>
                  <span className="ops-badge-success">Edit & Read</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
