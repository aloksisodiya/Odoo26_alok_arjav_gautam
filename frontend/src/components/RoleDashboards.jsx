import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Truck, Users, Compass, DollarSign, Wrench, BarChart3, ShieldAlert, Sliders } from 'lucide-react';

const Card = ({ title, value, desc, icon: Icon, color = 'text-brand' }) => (
  <div className="bg-[#121216] border border-dark-border p-5 rounded shadow hover:border-brand/40 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">{title}</p>
        <h4 className="text-2xl font-bold mt-1.5 technical-mono text-white">{value}</h4>
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white font-mono">DISPATCH OPERATIONS CENTRE</h2>
        <p className="text-xs text-gray-400 mt-1">Real-time status overview of active trips, drivers, and vehicles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card title="Active Trips" value="8 / 12" desc="4 trips in queue" icon={Compass} />
        <Card title="Vehicles Available" value="18 / 22" desc="4 in maintenance shop" icon={Truck} color="text-green-400" />
        <Card title="Drivers Active" value="14 / 20" desc="6 off-duty, 0 suspended" icon={Users} color="text-blue-400" />
        <Card title="Warning Alerts" value="0" desc="All license & compliance valid" icon={ShieldAlert} color="text-red-400" />
      </div>

      <div className="bg-[#121216] border border-dark-border rounded p-6">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4">Active Dispatches</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-gray-300">
            <thead>
              <tr className="border-b border-dark-border pb-3 text-gray-500 text-[10px] uppercase">
                <th className="py-2">Trip ID</th>
                <th>Route</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Cargo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40">
              <tr className="hover:bg-dark-surface/20">
                <td className="py-3 text-brand">TRIP-204</td>
                <td>Depot A ➔ Sector 4 Distribution</td>
                <td>TRK-882 (Volvo)</td>
                <td>Gautam Kumar</td>
                <td className="technical-mono">8,500 kg</td>
                <td><span className="ops-badge-warning">Dispatched</span></td>
              </tr>
              <tr className="hover:bg-dark-surface/20">
                <td className="py-3 text-brand">TRIP-205</td>
                <td>Depot A ➔ North Terminal</td>
                <td>VAN-103 (Transit)</td>
                <td>Alok Kumar</td>
                <td className="technical-mono">1,200 kg</td>
                <td><span className="ops-badge-warning">Dispatched</span></td>
              </tr>
              <tr className="hover:bg-dark-surface/20">
                <td className="py-3 text-brand">TRIP-206</td>
                <td>West Warehouse ➔ South Depot</td>
                <td>TRK-901 (Scania)</td>
                <td>S. Shinde</td>
                <td className="technical-mono">12,000 kg</td>
                <td><span className="ops-badge-success">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 2. Dispatcher component: Trips
export const TripsManager = () => (
  <div className="bg-[#121216] border border-dark-border p-6 rounded text-center py-12">
    <Compass className="w-12 h-12 text-brand mx-auto mb-4" />
    <h3 className="text-lg font-bold text-white font-mono">TRIP DISPATCHER</h3>
    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
      Create, dispatch, and manage operations. (This module will be fully populated in the upcoming phases).
    </p>
  </div>
);

// 3. Fleet Manager component: Fleet Registry
export const FleetRegistry = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-white font-mono">VEHICLE REGISTRY</h2>
      <p className="text-xs text-gray-400 mt-1">Manage and track company transportation assets.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Card title="Total Registered" value="32 Vehicles" desc="24 Trucks, 8 Vans" icon={Truck} />
      <Card title="Operational Status" value="28 Active" desc="4 in shop for maintenance" icon={Wrench} color="text-green-400" />
      <Card title="Avg Odometer" value="142,390 km" desc="Calculated across entire fleet" icon={Compass} color="text-blue-400" />
    </div>
    <div className="bg-[#121216] border border-dark-border p-6 rounded text-center py-8">
      <p className="text-xs text-gray-500 font-mono">Asset creation forms and logs will load here.</p>
    </div>
  </div>
);

// 4. Fleet Manager component: Maintenance
export const MaintenanceLogs = () => (
  <div className="bg-[#121216] border border-dark-border p-6 rounded text-center py-12">
    <Wrench className="w-12 h-12 text-brand mx-auto mb-4" />
    <h3 className="text-lg font-bold text-white font-mono">MAINTENANCE SCHEDULER</h3>
    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
      Open work logs and track repair tickets. (This module will be fully populated in the upcoming phases).
    </p>
  </div>
);

// 5. Safety Officer component: Driver Registry
export const DriverRegistry = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-white font-mono">DRIVER REGISTRY & SECURITY</h2>
      <p className="text-xs text-gray-400 mt-1">Driver licensing, history, scores, and status monitoring.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Card title="Total Drivers" value="20 Officers" desc="18 available, 2 off-duty" icon={Users} />
      <Card title="License Expirations" value="0 Alerts" desc="All licenses valid > 30 days" icon={ShieldAlert} color="text-green-400" />
      <Card title="Depot Safety Rating" value="94%" desc="Calculated on driving logs" icon={BarChart3} color="text-blue-400" />
    </div>
    <div className="bg-[#121216] border border-dark-border p-6 rounded text-center py-8">
      <p className="text-xs text-gray-500 font-mono">Driver records will load here.</p>
    </div>
  </div>
);

// 6. Safety Officer component: Compliance
export const ComplianceLogs = () => (
  <div className="bg-[#121216] border border-dark-border p-6 rounded text-center py-12">
    <ShieldAlert className="w-12 h-12 text-brand mx-auto mb-4" />
    <h3 className="text-lg font-bold text-white font-mono">COMPLIANCE ENGINE</h3>
    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
      Monitor safety violations and licensing checks. (This module will be fully populated in the upcoming phases).
    </p>
  </div>
);

// 7. Financial Analyst component: Fuel & Expenses
export const FuelExpenses = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-white font-mono">FUEL & OPERATION EXPENSES</h2>
      <p className="text-xs text-gray-400 mt-1">Real-time ledger matching trip receipts, fuel cards, and tolls.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Card title="Total Fuel Cost" value="$14,280" desc="Based on 4,200 Liters logged" icon={DollarSign} />
      <Card title="Total Toll & Other" value="$2,490" desc="Tolls and highway logs" icon={Compass} color="text-green-400" />
      <Card title="Total Operational Cost" value="$16,770" desc="Sum of fuel & maintenance cost" icon={Wrench} color="text-blue-400" />
    </div>
    <div className="bg-[#121216] border border-dark-border p-6 rounded text-center py-8">
      <p className="text-xs text-gray-500 font-mono">Ledger invoices will load here.</p>
    </div>
  </div>
);

// 8. Financial Analyst component: Analytics Dashboard
export const AnalyticsDashboard = () => (
  <div className="bg-[#121216] border border-dark-border p-6 rounded text-center py-12">
    <BarChart3 className="w-12 h-12 text-brand mx-auto mb-4" />
    <h3 className="text-lg font-bold text-white font-mono">ANALYTICS ENGINE</h3>
    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
      View asset ROI calculations, carbon logs, and efficiency scores. (This module will be fully populated in the upcoming phases).
    </p>
  </div>
);

// 9. Common component: Settings
export const SystemSettings = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-white font-mono">SYSTEM SETTINGS</h2>
      <p className="text-xs text-gray-400 mt-1">Configure global operational params and permission matrices.</p>
    </div>

    <div className="bg-[#121216] border border-dark-border rounded p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-mono">Depot Name</label>
          <input type="text" defaultValue="TransitOps Depot Alpha" className="ops-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-mono">Currency</label>
          <select className="ops-input cursor-pointer">
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-mono">Distance Unit</label>
          <select className="ops-input cursor-pointer">
            <option value="km">Kilometers (km)</option>
            <option value="mi">Miles (mi)</option>
          </select>
        </div>
      </div>

      <div className="border-t border-dark-border pt-6">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand" /> RBAC Permission Matrix (Dynamically enforced)
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
                <td><span className="ops-badge-success">Edit & Read</span></td>
                <td><span className="ops-badge-danger">None</span></td>
                <td><span className="ops-badge-danger">None</span></td>
                <td><span className="ops-badge-info">Read Only</span></td>
              </tr>
              <tr>
                <td className="py-3 text-white font-bold">Dispatcher</td>
                <td><span className="ops-badge-info">Read Only</span></td>
                <td><span className="ops-badge-success">Edit & Read</span></td>
                <td><span className="ops-badge-danger">None</span></td>
                <td><span className="ops-badge-danger">None</span></td>
              </tr>
              <tr>
                <td className="py-3 text-white font-bold">Safety Officer</td>
                <td><span className="ops-badge-danger">None</span></td>
                <td><span className="ops-badge-danger">None</span></td>
                <td><span className="ops-badge-success">Edit & Read</span></td>
                <td><span className="ops-badge-danger">None</span></td>
              </tr>
              <tr>
                <td className="py-3 text-white font-bold">Financial Analyst</td>
                <td><span className="ops-badge-info">Read Only</span></td>
                <td><span className="ops-badge-danger">None</span></td>
                <td><span className="ops-badge-danger">None</span></td>
                <td><span className="ops-badge-success">Edit & Read</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
