import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { jsPDF } from "jspdf";
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
  AlertTriangle,
  Plus,
  Calendar,
  FileCheck,
  Download,
  Play
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
export const TripsManager = () => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [distance, setDistance] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const pathLayerRef = React.useRef(null);
  const markersRef = React.useRef([]);
  const vehicleMarkerRef = React.useRef(null);

  const token = useAuthStore((state) => state.token);

  // Depot mapping coords
  const coordsMap = {
    "Depot Alpha": [23.2156, 72.6369],
    "Sector 4 Distribution": [23.2200, 72.6500],
    "West Warehouse": [23.0300, 72.5000],
    "North Terminal": [23.3000, 72.6000],
    "South Depot": [22.9000, 72.6000],
    "Gandhinagar Depot": [23.2156, 72.6369],
    "Ahmedabad Hub": [23.0225, 72.5714],
  };

  // Queries
  const { data: trips, refetch: refetchTrips } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/trips", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const { data: vehicles, refetch: refetchVehicles } = useQuery({
    queryKey: ["dispatcherVehicles"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/vehicles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const { data: drivers, refetch: refetchDrivers } = useQuery({
    queryKey: ["dispatcherDrivers"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/drivers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  // Map effect
  useEffect(() => {
    if (!mapRef.current) return;

    // Prevent double-initialization crash
    if (mapRef.current._leaflet_id) {
      return;
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([23.1000, 72.6000], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      
      // Fix tile misalignment on render
      map.invalidateSize();
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when selectedTrip changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing
    if (pathLayerRef.current) {
      mapInstanceRef.current.removeLayer(pathLayerRef.current);
      pathLayerRef.current = null;
    }
    markersRef.current.forEach(m => mapInstanceRef.current.removeLayer(m));
    markersRef.current = [];
    if (vehicleMarkerRef.current) {
      mapInstanceRef.current.removeLayer(vehicleMarkerRef.current);
      vehicleMarkerRef.current = null;
    }

    if (selectedTrip) {
      const srcName = selectedTrip.source;
      const destName = selectedTrip.destination;

      const srcCoords = coordsMap[srcName] || coordsMap["Depot Alpha"];
      const destCoords = coordsMap[destName] || coordsMap["Ahmedabad Hub"];

      const startIcon = L.divIcon({
        html: `<div style="background-color: #22c55e; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>`,
        className: "",
        iconSize: [12, 12]
      });

      const endIcon = L.divIcon({
        html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>`,
        className: "",
        iconSize: [12, 12]
      });

      const startMarker = L.marker(srcCoords, { icon: startIcon }).addTo(mapInstanceRef.current).bindPopup(`Source: ${srcName}`);
      const endMarker = L.marker(destCoords, { icon: endIcon }).addTo(mapInstanceRef.current).bindPopup(`Destination: ${destName}`);
      markersRef.current = [startMarker, endMarker];

      pathLayerRef.current = L.polyline([srcCoords, destCoords], {
        color: "#3b82f6",
        weight: 3,
        dashArray: "5, 10"
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.fitBounds([srcCoords, destCoords], { padding: [40, 40] });

      if (selectedTrip.status === "Dispatched") {
        const vehicleIcon = L.divIcon({
          html: `<div style="background-color: #3b82f6; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.5); transform: translateY(-5px); z-index: 1000;" class="animate-bounce">🚚</div>`,
          className: "",
          iconSize: [22, 22]
        });
        vehicleMarkerRef.current = L.marker(srcCoords, { icon: vehicleIcon }).addTo(mapInstanceRef.current).bindPopup("Truck Tracking Active");
      }
    }
  }, [selectedTrip]);

  // GPS Runner animation
  const handleSimulateGPS = () => {
    if (!selectedTrip || selectedTrip.status !== "Dispatched" || isSimulating) return;

    const srcName = selectedTrip.source;
    const destName = selectedTrip.destination;
    const srcCoords = coordsMap[srcName] || coordsMap["Depot Alpha"];
    const destCoords = coordsMap[destName] || coordsMap["Ahmedabad Hub"];

    setIsSimulating(true);
    setErrorMsg("");
    setSuccessMsg("");
    let step = 0;
    const totalSteps = 40; // 4 seconds

    const interval = setInterval(async () => {
      step++;
      const ratio = step / totalSteps;
      const lat = srcCoords[0] + (destCoords[0] - srcCoords[0]) * ratio;
      const lng = srcCoords[1] + (destCoords[1] - srcCoords[1]) * ratio;

      if (vehicleMarkerRef.current && mapInstanceRef.current) {
        vehicleMarkerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.panTo([lat, lng]);
      }

      if (step >= totalSteps) {
        clearInterval(interval);
        setIsSimulating(false);
        setSuccessMsg(`Simulated geofence breached! Vehicle entered destination boundary. Trip completed.`);
        await handleUpdateStatus(selectedTrip._id, "Completed");
      }
    }, 100);
  };

  // jsPDF Invoice
  const handleDownloadInvoice = (trip) => {
    const doc = new jsPDF();
    const cost = (trip.plannedDistanceKm * 10) + (trip.cargoWeightKg * 0.5);

    // Styling
    doc.setFillColor(24, 24, 27); // Dark zinc header
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("TRANSITOPS BILLING INVOICE", 15, 25);

    doc.setTextColor(82, 82, 91);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Invoice Ref: INV-${trip.tripId}-${Math.floor(Math.random() * 10000)}`, 15, 55);
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 15, 62);
    
    // Details
    doc.setFont("helvetica", "bold");
    doc.text("SHIPMENT DETAIL MATRIX", 15, 80);
    doc.line(15, 82, 195, 82);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Source Depot: ${trip.source}`, 15, 92);
    doc.text(`Destination Depot: ${trip.destination}`, 15, 99);
    doc.text(`Vehicle Asset: ${trip.vehicleId ? trip.vehicleId.registrationNo : "N/A"}`, 15, 106);
    doc.text(`Assigned Driver: ${trip.driverId ? trip.driverId.name : "N/A"}`, 15, 113);
    doc.text(`Cargo Volume: ${trip.cargoWeightKg} kg`, 15, 120);
    doc.text(`Odometer Run: ${trip.plannedDistanceKm} km`, 15, 127);
    
    // Charges Table
    doc.setFont("helvetica", "bold");
    doc.text("BILLING MATRIX BREAKDOWN", 15, 145);
    doc.line(15, 147, 195, 147);
    
    doc.setFont("helvetica", "normal");
    doc.text("Distance Freight charge (INR 10/km):", 15, 157);
    doc.text(`INR ${(trip.plannedDistanceKm * 10).toLocaleString()}`, 150, 157);
    
    doc.text("Cargo Weight freight surcharge (INR 0.50/kg):", 15, 164);
    doc.text(`INR ${(trip.cargoWeightKg * 0.5).toLocaleString()}`, 150, 164);
    
    doc.setFont("helvetica", "bold");
    doc.text("NET PAYABLE DUE:", 15, 178);
    doc.text(`INR ${cost.toLocaleString()}`, 150, 178);
    
    doc.line(15, 182, 195, 182);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("TransitOps automated billing registry matrix. Paid invoice copy.", 15, 200);

    // Save PDF
    doc.save(`Invoice_${trip.tripId}.pdf`);
  };

  // Export CSV
  const handleExportTripsCSV = () => {
    const headers = ["Trip ID", "Source", "Destination", "Vehicle Reg", "Driver Name", "Cargo Weight (kg)", "Planned Distance (km)", "Status"];
    const rows = (trips || []).map(t => [
      t.tripId,
      t.source,
      t.destination,
      t.vehicleId ? t.vehicleId.registrationNo : "—",
      t.driverId ? t.driverId.name : "—",
      t.cargoWeightKg,
      t.plannedDistanceKm,
      t.status
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Trips_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter available items
  const availableVehicles = (vehicles || []).filter(v => v.status === "Available");
  const availableDrivers = (drivers || []).filter(d => {
    const isAvail = d.status === "Available";
    const isLicenseValid = new Date(d.licenseExpiry) > new Date();
    return isAvail && isLicenseValid;
  });

  const selectedVehicle = (vehicles || []).find(v => v._id === vehicleId);
  const selectedDriver = (drivers || []).find(d => d._id === driverId);

  // Warnings / Validation
  const capacityExceeded = selectedVehicle && Number(cargoWeight) > selectedVehicle.capacityKg;
  const isDispatchBlocked = capacityExceeded || !source || !destination || !vehicleId || !driverId || !cargoWeight || !distance;

  const handleCreateTrip = async (status = "Draft") => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await axios.post("http://localhost:5000/api/trips", {
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeightKg: Number(cargoWeight),
        plannedDistanceKm: Number(distance),
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMsg(status === "Dispatched" ? "Trip dispatched successfully!" : "Draft trip saved!");
      setSource("");
      setDestination("");
      setVehicleId("");
      setDriverId("");
      setCargoWeight("");
      setDistance("");
      refetchTrips();
      refetchVehicles();
      refetchDrivers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create trip");
    }
  };

  const handleUpdateStatus = async (tripId, targetStatus) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await axios.put(`http://localhost:5000/api/trips/${tripId}/status`, {
        status: targetStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg(`Trip updated to ${targetStatus}!`);
      refetchTrips();
      refetchVehicles();
      refetchDrivers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update trip status");
    }
  };

  const filteredTrips = (trips || []).filter(t => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      t.tripId.toLowerCase().includes(term) ||
      t.source.toLowerCase().includes(term) ||
      t.destination.toLowerCase().includes(term) ||
      (t.driverId && t.driverId.name.toLowerCase().includes(term)) ||
      (t.vehicleId && t.vehicleId.registrationNo.toLowerCase().includes(term));
    return matchesSearch;
  });

  return (
    <div className="space-y-6 text-theme-text">
      <div>
        <h2 className="text-xl font-bold font-mono uppercase tracking-tight">Trip Dispatcher</h2>
        <p className="text-xs text-theme-muted mt-1 font-mono">Create, dispatch, and manage active operational dispatches.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-950/40 border border-red-500/30 p-3.5 rounded text-xs text-red-400 font-mono">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-950/40 border border-green-500/30 p-3.5 rounded text-xs text-green-400 font-mono">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CREATE TRIP FORM (col-span-5) */}
        <div className="lg:col-span-5 bg-theme-panel border border-dark-border p-6 rounded shadow space-y-6">
          
          {/* Lifecycle display */}
          <div className="space-y-2">
            <span className="text-[10px] text-theme-muted font-mono font-bold uppercase tracking-wider block">Trip Lifecycle</span>
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-center bg-dark-bg p-3 border border-dark-border rounded">
              <span className={`px-2 py-0.5 rounded ${(!selectedTrip || selectedTrip.status === "Draft") ? "bg-brand text-black" : "text-theme-muted"}`}>Draft</span>
              <span className="text-theme-muted">➔</span>
              <span className={`px-2 py-0.5 rounded ${(selectedTrip && selectedTrip.status === "Dispatched") ? "bg-blue-500 text-white" : "text-theme-muted"}`}>Dispatched</span>
              <span className="text-theme-muted">➔</span>
              <span className={`px-2 py-0.5 rounded ${(selectedTrip && selectedTrip.status === "Completed") ? "bg-green-500 text-white" : "text-theme-muted"}`}>Completed</span>
              <span className="text-theme-muted">/</span>
              <span className={`px-2 py-0.5 rounded ${(selectedTrip && selectedTrip.status === "Cancelled") ? "bg-red-500 text-white" : "text-theme-muted"}`}>Cancelled</span>
            </div>
            {selectedTrip && (
              <div className="flex items-center justify-between text-[10px] font-mono text-brand bg-brand/5 border border-brand/20 p-2 rounded">
                <span>Selected: {selectedTrip.tripId} ({selectedTrip.status})</span>
                <button 
                  onClick={() => setSelectedTrip(null)}
                  className="text-theme-muted hover:text-white"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold uppercase text-white font-mono tracking-wide">Create Trip</h3>
            
            <div className="space-y-1">
              <label className="block text-[10px] text-theme-muted uppercase font-bold">Source Location</label>
              <input
                type="text"
                placeholder="e.g. Gandhinagar Depot"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="ops-input"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-theme-muted uppercase font-bold">Destination</label>
              <input
                type="text"
                placeholder="e.g. Ahmedabad Hub"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="ops-input"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-theme-muted uppercase font-bold">Vehicle (Available Only)</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="ops-input cursor-pointer"
              >
                <option value="">Select Available Vehicle</option>
                {availableVehicles.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.registrationNo} — {v.name} ({v.type}, Cap: {v.capacityKg}kg)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-theme-muted uppercase font-bold">Driver (Available & Licensed)</label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="ops-input cursor-pointer"
              >
                <option value="">Select Available Driver</option>
                {availableDrivers.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.licenseCategory}, Score: {d.safetyScore}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] text-theme-muted uppercase font-bold">Cargo Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 700"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                  className="ops-input"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-[10px] text-theme-muted uppercase font-bold">Planned Distance (km)</label>
                <input
                  type="number"
                  placeholder="e.g. 38"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="ops-input"
                />
              </div>
            </div>

            {/* Warnings Alert Box */}
            {selectedVehicle && (
              <div className={`p-3 border rounded text-[10px] font-semibold leading-relaxed ${capacityExceeded ? "bg-red-950/20 border-red-500/30 text-red-400" : "bg-dark-bg border-dark-border text-theme-muted"}`}>
                <div className="flex items-center justify-between">
                  <span>Vehicle Capacity:</span>
                  <span className="font-bold">{selectedVehicle.capacityKg} kg</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span>Cargo Weight:</span>
                  <span className="font-bold">{cargoWeight || 0} kg</span>
                </div>
                {capacityExceeded && (
                  <div className="mt-2 border-t border-red-500/20 pt-1.5 font-bold flex items-center gap-1.5 text-[9px] uppercase">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 inline-block shrink-0" />
                    <span>Capacity exceeded by {Number(cargoWeight) - selectedVehicle.capacityKg} kg — Dispatch Blocked</span>
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                disabled={isDispatchBlocked}
                onClick={() => handleCreateTrip("Dispatched")}
                className={`py-2 px-4 rounded font-bold uppercase text-[11px] tracking-wide text-center transition-all ${isDispatchBlocked ? "bg-gray-700/30 text-gray-500 border border-gray-600/30 cursor-not-allowed" : "bg-brand text-black hover:bg-brand-light shadow"}`}
              >
                Dispatch
              </button>
              <button
                type="button"
                disabled={!source || !destination || capacityExceeded}
                onClick={() => handleCreateTrip("Draft")}
                className={`py-2 px-4 rounded font-bold uppercase text-[11px] border tracking-wide text-center transition-all ${(!source || !destination || capacityExceeded) ? "border-gray-700/30 text-gray-500 cursor-not-allowed" : "border-dark-border hover:bg-dark-hoverBg/10 text-white"}`}
              >
                Save Draft
              </button>
            </div>
          </form>
        </div>

        {/* MAP & LIVE BOARD (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* LEAFLET MAP PANEL */}
          <div className="bg-theme-panel border border-dark-border p-6 rounded shadow space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Live Route Tracker</h3>
                {selectedTrip && (
                  <p className="text-[10px] text-theme-muted font-mono mt-0.5">
                    Selected Route: {selectedTrip.source} ➔ {selectedTrip.destination} ({selectedTrip.status})
                  </p>
                )}
              </div>
              {selectedTrip && selectedTrip.status === "Dispatched" && (
                <button
                  onClick={handleSimulateGPS}
                  disabled={isSimulating}
                  className={`bg-brand text-black text-[10px] font-bold uppercase px-3 py-1.5 rounded hover:bg-brand-light transition-all flex items-center gap-1 ${isSimulating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Play className="w-3.5 h-3.5" /> {isSimulating ? "Simulating GPS..." : "Simulate GPS"}
                </button>
              )}
            </div>
            
            {/* Map Canvas */}
            <div 
              ref={mapRef} 
              className="h-64 w-full bg-dark-bg border border-dark-border rounded overflow-hidden z-10"
              style={{ minHeight: "260px" }}
            ></div>
          </div>

          {/* LIVE BOARD */}
          <div className="bg-theme-panel border border-dark-border p-6 rounded shadow space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-theme-text">Live Board</h3>
                <button
                  onClick={handleExportTripsCSV}
                  className="bg-dark-surface border border-dark-border text-white text-[10px] uppercase px-2.5 py-1 rounded hover:bg-dark-hoverBg transition-colors flex items-center gap-1 font-bold"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
              <div className="relative w-full sm:w-56">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-theme-muted">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search board..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ops-input pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredTrips.length > 0 ? (
                filteredTrips.map(trip => (
                  <div 
                    key={trip._id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`p-4 rounded border font-mono text-xs transition-all cursor-pointer ${selectedTrip?._id === trip._id ? "border-brand bg-brand/5 shadow" : "border-dark-border bg-dark-bg hover:border-dark-border/80"}`}
                  >
                    <div className="flex items-center justify-between border-b border-dark-border/40 pb-2 mb-2">
                      <div>
                        <span className="text-brand font-bold text-sm block">{trip.tripId}</span>
                        <span className="text-[10px] text-theme-muted font-sans mt-0.5 block">
                          {trip.vehicleId ? `${trip.vehicleId.registrationNo} / ${trip.vehicleId.name}` : "Unassigned Vehicle"}
                        </span>
                      </div>
                      <div className="text-right">
                        {trip.status === "Completed" && <span className="ops-badge-success">Completed</span>}
                        {trip.status === "Dispatched" && <span className="ops-badge-warning">Dispatched</span>}
                        {trip.status === "Draft" && <span className="ops-badge-info bg-gray-500/10 text-gray-400 border-gray-500/20">Draft</span>}
                        {trip.status === "Cancelled" && <span className="ops-badge-danger">Cancelled</span>}
                        <span className="text-[10px] text-theme-muted block mt-1">
                          {trip.driverId ? trip.driverId.name : "Unassigned Driver"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-theme-muted pt-1">
                      <div>
                        <span className="block text-theme-text font-semibold">{trip.source} ➔ {trip.destination}</span>
                        <span className="block mt-0.5">Cargo: {trip.cargoWeightKg} kg • Distance: {trip.plannedDistanceKm} km</span>
                      </div>
                      
                      {/* Action controllers */}
                      <div className="flex items-center gap-2">
                        {trip.status === "Completed" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(trip); }}
                            className="bg-brand hover:bg-brand-light text-black font-bold px-2.5 py-1 rounded text-[9px] uppercase font-mono tracking-wide transition-colors flex items-center gap-0.5"
                          >
                            <FileText className="w-3 h-3" /> Invoice
                          </button>
                        )}
                        {trip.status === "Dispatched" && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(trip._id, "Completed"); }}
                              className="bg-green-600 hover:bg-green-500 text-white font-bold px-2 py-1 rounded text-[9px] uppercase font-mono tracking-wide transition-colors"
                            >
                              Complete
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(trip._id, "Cancelled"); }}
                              className="bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-400 font-bold px-2 py-1 rounded text-[9px] uppercase font-mono tracking-wide transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {trip.status === "Draft" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(trip._id, "Dispatched"); }}
                            className="bg-brand hover:bg-brand-light text-black font-bold px-2 py-1 rounded text-[9px] uppercase font-mono tracking-wide transition-colors"
                          >
                            Dispatch Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-theme-muted font-mono text-xs">
                  NO TRIPS CURRENTLY LOGGED ON THE LIVE BOARD.
                </div>
              )}
            </div>

            <div className="border-t border-dark-border/40 pt-4 text-center font-mono text-[9px] text-theme-muted uppercase tracking-wider">
              On Complete: odometer ➔ fuel log ➔ expenses ➔ Vehicle & Driver Available
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

// 3. Fleet Manager component: Fleet Registry
export const FleetRegistry = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchRegNo, setSearchRegNo] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form states
  const [regNo, setRegNo] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("Truck");
  const [capacity, setCapacity] = useState("");
  const [odometer, setOdometer] = useState("");
  const [acqCost, setAcqCost] = useState("");
  const [status, setStatus] = useState("Available");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const token = useAuthStore((state) => state.token);

  const { data: vehicles, isLoading: vehiclesLoading, refetch } = useQuery({
    queryKey: ["fleetVehicles"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/vehicles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const { data: maintenance, isLoading: maintLoading } = useQuery({
    queryKey: ["fleetMaintenance"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/maintenance", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const isLoading = vehiclesLoading || maintLoading;

  // Aggregate repair logs
  const maintenanceCosts = {};
  (maintenance || []).forEach(log => {
    const vId = log.vehicleId?._id || log.vehicleId;
    if (vId) {
      maintenanceCosts[vId] = (maintenanceCosts[vId] || 0) + (log.cost || 0);
    }
  });

  const handleExportCSV = () => {
    const headers = ["Registration No", "Name/Model", "Type", "Capacity (kg)", "Odometer (km)", "Acquisition Cost (₹)", "Status", "Cumulative Repairs (₹)"];
    const rows = (vehicles || []).map(v => [
      v.registrationNo,
      v.name,
      v.type,
      v.capacityKg,
      v.odometerKm,
      v.acquisitionCost,
      v.status,
      maintenanceCosts[v._id] || 0
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fleet_Assets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await axios.post("http://localhost:5000/api/vehicles", {
        registrationNo: regNo,
        name,
        type,
        capacityKg: Number(capacity),
        odometerKm: Number(odometer),
        acquisitionCost: Number(acqCost),
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Vehicle registered successfully!");
      setIsModalOpen(false);
      setRegNo("");
      setName("");
      setType("Truck");
      setCapacity("");
      setOdometer("");
      setAcqCost("");
      setStatus("Available");
      refetch();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to register vehicle");
    }
  };

  const filtered = (vehicles || []).filter(v => {
    const matchesSearch = v.registrationNo.toLowerCase().includes(searchRegNo.toLowerCase()) || v.name.toLowerCase().includes(searchRegNo.toLowerCase());
    const matchesType = typeFilter === "All" || v.type === typeFilter;
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Analytics helper metrics
  const totalVehiclesCount = (vehicles || []).length;
  const operationalCount = (vehicles || []).filter(v => v.status !== "Retired").length;
  const activeCount = (vehicles || []).filter(v => v.status === "OnTrip").length;
  const inShopCount = (vehicles || []).filter(v => v.status === "InShop").length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-theme-muted font-mono">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
        <span>LOADING FLEET DATABASES...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-theme-text">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono uppercase tracking-tight">Vehicle Registry</h2>
          <p className="text-xs text-theme-muted mt-1 font-mono">Manage and track company transportation assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-dark-surface border border-dark-border text-white font-bold font-mono text-xs uppercase px-4 py-2 rounded shadow hover:bg-dark-hoverBg flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand text-black font-bold font-mono text-xs uppercase px-4 py-2 rounded shadow hover:bg-brand-light flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-950/40 border border-green-500/30 p-3.5 rounded text-xs text-green-400 font-mono">
          {successMsg}
        </div>
      )}

      {/* MODAL WINDOW FOR ADDING VEHICLE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-theme-panel border border-dark-border rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border/40 pb-3">
              <h3 className="font-bold text-white font-mono text-sm uppercase">Register Asset</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-theme-muted hover:text-white font-mono text-sm">✕</button>
            </div>
            
            {errorMsg && (
              <div className="bg-red-950/40 border border-red-500/30 p-3 rounded text-[10px] text-red-400 font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Registration No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GJ01AB452"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="ops-input uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Name / Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VAN-05"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="ops-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="ops-input cursor-pointer"
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini">Mini</option>
                    <option value="Container">Container</option>
                    <option value="Flatbed">Flatbed</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Capacity (kg)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="ops-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Odometer (km)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 74000"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="ops-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Acq. Cost (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 620000"
                    value={acqCost}
                    onChange={(e) => setAcqCost(e.target.value)}
                    className="ops-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-theme-muted uppercase font-bold">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="ops-input cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="OnTrip">On Trip</option>
                  <option value="InShop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-brand text-black font-bold uppercase py-2.5 rounded hover:bg-brand-light tracking-wide text-xs mt-4 transition-colors"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      )}

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card
          title="Total Registered"
          value={`${totalVehiclesCount} Vehicles`}
          desc="Across all statuses"
          icon={Truck}
        />
        <Card
          title="Operational Status"
          value={`${operationalCount} Active`}
          desc={`${inShopCount} in shop for maintenance`}
          icon={Wrench}
          color="text-green-400"
        />
        <Card
          title="Active On Road"
          value={`${activeCount} On Trip`}
          desc="In transit right now"
          icon={Compass}
          color="text-blue-400"
        />
        <Card
          title="Avg Odometer"
          value="142,390 km"
          desc="Across operational assets"
          icon={BarChart3}
          color="text-indigo-400"
        />
      </div>

      {/* FILTERS PANEL */}
      <div className="bg-theme-panel border border-dark-border p-4 rounded shadow grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] text-theme-muted font-mono uppercase mb-1 font-bold">Vehicle Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="ops-input cursor-pointer text-xs"
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
          <label className="block text-[10px] text-theme-muted font-mono uppercase mb-1 font-bold">Vehicle Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ops-input cursor-pointer text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="OnTrip">On Trip</option>
            <option value="InShop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-theme-muted font-mono uppercase mb-1 font-bold">Search Reg No.</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-theme-muted">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search registration..."
              value={searchRegNo}
              onChange={(e) => setSearchRegNo(e.target.value)}
              className="ops-input pl-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* VEHICLES LEDGER TABLE */}
      <div className="bg-theme-panel border border-dark-border rounded p-6 shadow">
        <div className="overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-dark-border pb-3 text-theme-muted text-[10px] uppercase">
                  <th className="py-2.5">Reg. No. (Unique)</th>
                  <th>Name/Model</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Odometer</th>
                  <th>Acq. Cost</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 text-theme-text">
                {filtered.map(v => {
                  const repairsCost = maintenanceCosts[v._id] || 0;
                  const isHighDepreciation = repairsCost >= (v.acquisitionCost || 0) * 0.5;

                  return (
                    <tr key={v._id} className="hover:bg-dark-hoverBg/25 transition-colors">
                      <td className="py-3 text-white font-bold">
                        <div>{v.registrationNo}</div>
                        {isHighDepreciation && (
                          <div className="text-[9px] text-red-400 font-bold mt-1 flex items-center gap-0.5 uppercase tracking-wide">
                            ⚠️ Depr. Alert (Repairs: ₹{repairsCost.toLocaleString()} &gt; 50% cost)
                          </div>
                        )}
                      </td>
                      <td className="font-semibold">{v.name}</td>
                      <td>{v.type}</td>
                      <td>{v.capacityKg} kg</td>
                      <td className="technical-mono">{Number(v.odometerKm).toLocaleString()} km</td>
                      <td className="technical-mono">₹{Number(v.acquisitionCost).toLocaleString()}</td>
                      <td className="text-right">
                        {v.status === "Available" && <span className="ops-badge-success">Available</span>}
                        {v.status === "OnTrip" && <span className="ops-badge-warning bg-blue-500/10 text-blue-400 border-blue-500/20">On Trip</span>}
                        {v.status === "InShop" && <span className="ops-badge-warning">In Shop</span>}
                        {v.status === "Retired" && <span className="ops-badge-danger">Retired</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-theme-muted font-mono text-xs">
              NO REGISTERED VEHICLES MATCHING CURRENT FILTERS.
            </div>
          )}
        </div>
      </div>

      {/* Policy warning rules */}
      <div className="text-[10px] text-amber-500/80 font-mono uppercase text-center font-semibold tracking-wider">
        Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher
      </div>

    </div>
  );
};

// 4. Fleet Manager component: Maintenance
export const MaintenanceLogs = () => {
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Active");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const token = useAuthStore((state) => state.token);

  // Queries
  const { data: logs, refetch: refetchLogs } = useQuery({
    queryKey: ["maintenanceLogs"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/maintenance", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const { data: vehicles } = useQuery({
    queryKey: ["maintenanceVehicles"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/vehicles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await axios.post("http://localhost:5000/api/maintenance", {
        vehicleId: selectedVehicle,
        serviceType,
        cost: Number(cost),
        date: date || new Date(),
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMsg("Service record saved successfully!");
      // Reset form
      setSelectedVehicle("");
      setServiceType("");
      setCost("");
      setDate("");
      setStatus("Active");
      refetchLogs();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to log service record");
    }
  };

  const handleComplete = async (logId) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await axios.put(`http://localhost:5000/api/maintenance/${logId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Maintenance completed and vehicle restored to Available!");
      refetchLogs();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to close service record");
    }
  };

  return (
    <div className="space-y-6 text-theme-text">
      <div>
        <h2 className="text-xl font-bold font-mono uppercase tracking-tight">Maintenance Scheduler</h2>
        <p className="text-xs text-theme-muted mt-1 font-mono">Open service tickets and track vehicle repair workshops.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-950/40 border border-red-500/30 p-3.5 rounded text-xs text-red-400 font-mono">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-950/40 border border-green-500/30 p-3.5 rounded text-xs text-green-400 font-mono">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LOG SERVICE RECORD FORM (col-span-5) */}
        <div className="lg:col-span-5 bg-theme-panel border border-dark-border p-6 rounded shadow space-y-4">
          <h3 className="text-sm font-bold uppercase text-white font-mono tracking-wide">Log Service Record</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <label className="block text-[10px] text-theme-muted uppercase font-bold">Vehicle</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="ops-input cursor-pointer"
                required
              >
                <option value="">Select Vehicle</option>
                {(vehicles || []).map(v => (
                  <option key={v._id} value={v._id}>{v.registrationNo} — {v.name} ({v.status})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-theme-muted uppercase font-bold">Service Type</label>
              <input
                type="text"
                placeholder="e.g. Oil Change / Engine Repair"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="ops-input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] text-theme-muted uppercase font-bold">Cost (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="ops-input"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-theme-muted uppercase font-bold">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="ops-input cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-theme-muted uppercase font-bold">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="ops-input cursor-pointer"
              >
                <option value="Active">Active (In Shop)</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-brand text-black font-bold uppercase py-2 rounded hover:bg-brand-light tracking-wide text-[11px] mt-2 transition-colors"
            >
              Save Record
            </button>
          </form>

          {/* Service transition rules */}
          <div className="border-t border-dark-border/40 pt-4 space-y-1 font-mono text-[9px] text-theme-muted leading-relaxed uppercase">
            <div className="flex justify-between items-center text-green-500/80 font-bold">
              <span>Available</span>
              <span>➔ (Open log) ➔</span>
              <span>In Shop</span>
            </div>
            <div className="flex justify-between items-center text-blue-400 font-bold">
              <span>In Shop</span>
              <span>➔ (Mark Completed) ➔</span>
              <span>Available</span>
            </div>
            <p className="text-[8px] text-center text-red-400 font-semibold mt-2">
              Note: In Shop vehicles are removed from the dispatch pool.
            </p>
          </div>
        </div>

        {/* SERVICE LOGS TABLE (col-span-7) */}
        <div className="lg:col-span-7 bg-theme-panel border border-dark-border p-6 rounded shadow space-y-4">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-theme-text">Service Log</h3>
          
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto pr-1">
            {(logs || []).length > 0 ? (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-dark-border pb-3 text-theme-muted text-[10px] uppercase">
                    <th className="py-2.5">Vehicle</th>
                    <th>Service Type</th>
                    <th>Cost</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40 text-theme-text">
                  {(logs || []).map(log => (
                    <tr key={log._id} className="hover:bg-dark-hoverBg/25 transition-colors">
                      <td className="py-3 font-bold text-white">
                        {log.vehicleId ? log.vehicleId.registrationNo : "—"}
                      </td>
                      <td className="font-semibold">{log.serviceType}</td>
                      <td className="technical-mono">₹{Number(log.cost).toLocaleString()}</td>
                      <td>
                        {log.status === "Completed" ? (
                          <span className="ops-badge-success">Completed</span>
                        ) : (
                          <span className="ops-badge-warning">In Shop</span>
                        )}
                      </td>
                      <td className="text-right">
                        {log.status === "Active" && (
                          <button
                            onClick={() => handleComplete(log._id)}
                            className="bg-brand text-black font-bold uppercase text-[9px] px-2 py-1 rounded hover:bg-brand-light transition-all font-mono"
                          >
                            Complete
                          </button>
                        )}
                        {log.status === "Completed" && (
                          <span className="text-[10px] text-theme-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-theme-muted font-mono text-xs">
                NO MAINTENANCE LOGS FOUND IN THE DATABASE.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// 5. Safety Officer component: Driver Registry
export const DriverRegistry = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [licenseCategory, setLicenseCategory] = useState("LMV");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [contact, setContact] = useState("");
  const [tripCompletionPct, setTripCompletionPct] = useState("");
  const [safetyScore, setSafetyScore] = useState("");
  const [status, setStatus] = useState("Available");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const token = useAuthStore((state) => state.token);

  // Queries
  const { data: drivers, isLoading, refetch } = useQuery({
    queryKey: ["fleetDrivers"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/drivers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await axios.post("http://localhost:5000/api/drivers", {
        name,
        licenseNo,
        licenseCategory,
        licenseExpiry,
        contact,
        tripCompletionPct: Number(tripCompletionPct) || 0,
        safetyScore: Number(safetyScore) || 100,
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMsg("Driver profile created successfully!");
      setIsModalOpen(false);
      // Reset Form
      setName("");
      setLicenseNo("");
      setLicenseCategory("LMV");
      setLicenseExpiry("");
      setContact("");
      setTripCompletionPct("");
      setSafetyScore("");
      setStatus("Available");
      refetch();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create driver");
    }
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const getFormattedDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Metrics
  const totalCount = (drivers || []).length;
  const expiredCount = (drivers || []).filter(d => isExpired(d.licenseExpiry)).length;
  const safetyRatingAvg = (drivers || []).reduce((acc, curr) => acc + (curr.safetyScore || 100), 0) / (totalCount || 1);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-theme-muted font-mono">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
        <span>LOADING SAFETY RECORDS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-theme-text">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono uppercase tracking-tight font-sans">Drivers & Safety Profiles</h2>
          <p className="text-xs text-theme-muted mt-1 font-mono">Driver licensing, safety scores, and rosters tracking.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand text-black font-bold font-mono text-xs uppercase px-4 py-2 rounded shadow hover:bg-brand-light flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Driver
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-950/40 border border-green-500/30 p-3.5 rounded text-xs text-green-400 font-mono">
          {successMsg}
        </div>
      )}

      {/* ADD DRIVER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-theme-panel border border-dark-border rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border/40 pb-3">
              <h3 className="font-bold text-white font-mono text-sm uppercase">Add Driver Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-theme-muted hover:text-white font-mono text-sm">✕</button>
            </div>
            
            {errorMsg && (
              <div className="bg-red-950/40 border border-red-500/30 p-3 rounded text-[10px] text-red-400 font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Driver Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="ops-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">License No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-88213"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="ops-input uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Category</label>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value)}
                    className="ops-input cursor-pointer"
                  >
                    <option value="LMV">LMV</option>
                    <option value="HMV">HMV</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="ops-input cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Contact Info</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 98765xxxxx"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="ops-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Trip Completion %</label>
                  <input
                    type="number"
                    placeholder="e.g. 96"
                    value={tripCompletionPct}
                    onChange={(e) => setTripCompletionPct(e.target.value)}
                    className="ops-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Safety Score (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    className="ops-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Roster Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="ops-input cursor-pointer"
                  >
                    <option value="Available">Available</option>
                    <option value="OnTrip">On Trip</option>
                    <option value="OffDuty">Off Duty</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand text-black font-bold uppercase py-2.5 rounded hover:bg-brand-light tracking-wide text-xs mt-4 transition-colors"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card
          title="Total Registered Officers"
          value={`${totalCount} Officers`}
          desc="On file driver roster"
          icon={Users}
        />
        <Card
          title="License Alerts"
          value={`${expiredCount} Expired`}
          desc="License validation failure"
          icon={ShieldAlert}
          color={expiredCount > 0 ? "text-red-400" : "text-green-400"}
        />
        <Card
          title="Depot Safety Index"
          value={`${Math.round(safetyRatingAvg)}% Avg`}
          desc="Calculated on safety points"
          icon={BarChart3}
          color="text-blue-400"
        />
      </div>

      {/* TABLE */}
      <div className="bg-theme-panel border border-dark-border rounded p-6 shadow">
        <div className="overflow-x-auto">
          {(drivers || []).length > 0 ? (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-dark-border pb-3 text-theme-muted text-[10px] uppercase">
                  <th className="py-2.5">Driver</th>
                  <th>License No.</th>
                  <th>Category</th>
                  <th>Expiry</th>
                  <th>Contact</th>
                  <th>Trip Compl.</th>
                  <th>Safety</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 text-theme-text">
                {(drivers || []).map(d => {
                  const expired = isExpired(d.licenseExpiry);
                  return (
                    <tr key={d._id} className="hover:bg-dark-hoverBg/25 transition-colors">
                      <td className="py-3 text-white font-bold">{d.name}</td>
                      <td className="font-semibold">{d.licenseNo}</td>
                      <td>{d.licenseCategory}</td>
                      <td>
                        <span className={expired ? "text-amber-500 font-bold" : ""}>
                          {getFormattedDate(d.licenseExpiry)} {expired && "EXPIRED"}
                        </span>
                      </td>
                      <td className="text-theme-muted">{d.contact}</td>
                      <td className="technical-mono">{d.tripCompletionPct || 0}%</td>
                      <td>
                        {d.status === "Suspended" ? (
                          <span className="ops-badge-warning">Suspended</span>
                        ) : d.status === "OnTrip" ? (
                          <span className="ops-badge-warning bg-blue-500/10 text-blue-400 border-blue-500/20">On Trip</span>
                        ) : (
                          <span className="ops-badge-success">Available</span>
                        )}
                      </td>
                      <td className="text-right">
                        {d.status === "Available" && <span className="ops-badge-success">Available</span>}
                        {d.status === "OnTrip" && <span className="ops-badge-warning bg-blue-500/10 text-blue-400 border-blue-500/20">On Trip</span>}
                        {d.status === "OffDuty" && <span className="ops-badge-info bg-gray-500/10 text-gray-400 border-gray-500/20">Off Duty</span>}
                        {d.status === "Suspended" && <span className="ops-badge-danger">Suspended</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-theme-muted font-mono text-xs">
              NO REGISTERED DRIVER RECORDS FOUND.
            </div>
          )}
        </div>
      </div>

      {/* Toggle visual status legend at bottom */}
      <div className="bg-theme-panel border border-dark-border p-4 rounded shadow space-y-2">
        <span className="text-[10px] text-theme-muted font-mono uppercase font-bold tracking-widest block text-center">Toggle Status Legend</span>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="ops-badge-success uppercase font-mono text-[9px]">Available</span>
          <span className="ops-badge-warning bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase font-mono text-[9px]">On Trip</span>
          <span className="ops-badge-info bg-gray-500/10 text-gray-400 border-gray-500/20 uppercase font-mono text-[9px]">Off Duty</span>
          <span className="ops-badge-danger uppercase font-mono text-[9px]">Suspended</span>
        </div>
      </div>

      <div className="text-[10px] text-amber-500/80 font-mono uppercase text-center font-semibold tracking-wider">
        Rule: Expired license or Suspended status ➔ blocked from trip assignment
      </div>

    </div>
  );
};

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
export const FuelExpenses = () => {
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Fuel Form State
  const [fuelVehicle, setFuelVehicle] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [fuelDate, setFuelDate] = useState("");

  // Expense Form State
  const [expTrip, setExpTrip] = useState("");
  const [expVehicle, setExpVehicle] = useState("");
  const [expToll, setExpToll] = useState("");
  const [expOther, setExpOther] = useState("");
  const [expMaint, setExpMaint] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const token = useAuthStore((state) => state.token);

  // Queries
  const { data: expenseData, refetch } = useQuery({
    queryKey: ["expensesData"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const { data: vehicles } = useQuery({
    queryKey: ["expenseVehicles"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/vehicles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const { data: trips } = useQuery({
    queryKey: ["expenseTrips"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/trips", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const handleLogFuel = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await axios.post("http://localhost:5000/api/expenses/fuel", {
        vehicleId: fuelVehicle,
        liters: Number(fuelLiters),
        cost: Number(fuelCost),
        date: fuelDate || new Date()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMsg("Fuel log added successfully!");
      setIsFuelModalOpen(false);
      setFuelVehicle("");
      setFuelLiters("");
      setFuelCost("");
      setFuelDate("");
      refetch();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to log fuel");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await axios.post("http://localhost:5000/api/expenses/other", {
        tripId: expTrip || null,
        vehicleId: expVehicle,
        toll: Number(expToll) || 0,
        other: Number(expOther) || 0,
        maintenanceCost: Number(expMaint) || 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMsg("Expense record added successfully!");
      setIsExpenseModalOpen(false);
      setExpTrip("");
      setExpVehicle("");
      setExpToll("");
      setExpOther("");
      setExpMaint("");
      refetch();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to add expense");
    }
  };

  const getFormattedDate = (dateStr) => {
    const date = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const { fuelLogs = [], otherExpenses = [], metrics = {} } = expenseData || {};

  const handleExportFuelCSV = () => {
    const headers = ["Vehicle", "Date", "Liters", "Cost (INR)"];
    const rows = (fuelLogs || []).map(log => [
      log.vehicleId ? log.vehicleId.registrationNo : "—",
      getFormattedDate(log.date),
      `${log.liters} L`,
      log.cost
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fuel_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExpensesCSV = () => {
    const headers = ["Trip", "Vehicle", "Toll (INR)", "Other (INR)", "Maintenance Linked (INR)", "Total (INR)"];
    const rows = (otherExpenses || []).map(exp => [
      exp.tripId ? exp.tripId.tripId : "—",
      exp.vehicleId ? exp.vehicleId.registrationNo : "—",
      exp.toll,
      exp.other,
      exp.maintenanceCost,
      exp.total
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Other_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-theme-text font-mono text-xs">
      <div>
        <h2 className="text-xl font-bold font-mono uppercase tracking-tight text-theme-text">Fuel & Expense Management</h2>
        <p className="text-[10px] text-theme-muted mt-1 font-mono font-semibold">Log vehicle fuel inputs, tolls, maintenance costs, and aggregate operations expenses.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-950/40 border border-red-500/30 p-3 rounded text-red-400 font-mono">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-950/40 border border-green-500/30 p-3 rounded text-green-400 font-mono">
          {successMsg}
        </div>
      )}

      {/* FUEL MODAL */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-theme-panel border border-dark-border rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border/40 pb-3">
              <h3 className="font-bold text-white font-mono text-sm uppercase">Log Fuel Input</h3>
              <button onClick={() => setIsFuelModalOpen(false)} className="text-theme-muted hover:text-white">✕</button>
            </div>
            <form onSubmit={handleLogFuel} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] text-theme-muted uppercase font-bold">Vehicle</label>
                <select
                  value={fuelVehicle}
                  onChange={(e) => setFuelVehicle(e.target.value)}
                  className="ops-input cursor-pointer"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {(vehicles || []).map(v => (
                    <option key={v._id} value={v._id}>{v.registrationNo} — {v.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Liters (L)</label>
                  <input
                    type="number"
                    placeholder="e.g. 42"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="ops-input"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Fuel Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 3150"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="ops-input"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-theme-muted uppercase font-bold">Log Date</label>
                <input
                  type="date"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  className="ops-input cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand text-black font-bold uppercase py-2.5 rounded hover:bg-brand-light transition-colors text-xs"
              >
                Log Fuel Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-theme-panel border border-dark-border rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border/40 pb-3">
              <h3 className="font-bold text-white font-mono text-sm uppercase">Log Operational Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-theme-muted hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Linked Trip</label>
                  <select
                    value={expTrip}
                    onChange={(e) => setExpTrip(e.target.value)}
                    className="ops-input cursor-pointer"
                  >
                    <option value="">Unlinked / None</option>
                    {(trips || []).map(t => (
                      <option key={t._id} value={t._id}>{t.tripId} ({t.source} ➔ {t.destination})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-theme-muted uppercase font-bold">Vehicle</label>
                  <select
                    value={expVehicle}
                    onChange={(e) => setExpVehicle(e.target.value)}
                    className="ops-input cursor-pointer"
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {(vehicles || []).map(v => (
                      <option key={v._id} value={v._id}>{v.registrationNo} — {v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] text-theme-muted uppercase font-bold">Toll cost (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    value={expToll}
                    onChange={(e) => setExpToll(e.target.value)}
                    className="ops-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] text-theme-muted uppercase font-bold">Other (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={expOther}
                    onChange={(e) => setExpOther(e.target.value)}
                    className="ops-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] text-theme-muted uppercase font-bold">Maint. (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 18000"
                    value={expMaint}
                    onChange={(e) => setExpMaint(e.target.value)}
                    className="ops-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand text-black font-bold uppercase py-2.5 rounded hover:bg-brand-light transition-colors text-xs"
              >
                Log Expense Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FUEL LOGS SECTION */}
      <div className="bg-theme-panel border border-dark-border rounded p-6 shadow space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase text-white font-mono tracking-wider">Fuel Logs</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportFuelCSV}
              className="bg-dark-surface border border-dark-border text-white text-[10px] uppercase px-3 py-1.5 rounded hover:bg-dark-hoverBg flex items-center gap-1 transition-colors font-bold"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => setIsFuelModalOpen(true)}
              className="bg-brand text-black font-bold text-[10px] uppercase px-3 py-1.5 rounded hover:bg-brand-light flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Log Fuel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {fuelLogs.length > 0 ? (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-dark-border pb-2.5 text-theme-muted text-[10px] uppercase">
                  <th className="py-2">Vehicle</th>
                  <th>Date</th>
                  <th>Liters</th>
                  <th className="text-right">Fuel Cost (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 text-theme-text">
                {fuelLogs.map(log => (
                  <tr key={log._id} className="hover:bg-dark-hoverBg/20">
                    <td className="py-2.5 font-bold text-white">
                      {log.vehicleId ? log.vehicleId.registrationNo : "—"}
                    </td>
                    <td>{getFormattedDate(log.date)}</td>
                    <td>{log.liters} L</td>
                    <td className="text-right font-bold text-brand">₹{Number(log.cost).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-6 text-center text-theme-muted font-mono">NO FUEL LOGS REGISTERED.</div>
          )}
        </div>
      </div>

      {/* OTHER EXPENSES SECTION */}
      <div className="bg-theme-panel border border-dark-border rounded p-6 shadow space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase text-white font-mono tracking-wider">Other Expenses (Toll / Misc)</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExpensesCSV}
              className="bg-dark-surface border border-dark-border text-white text-[10px] uppercase px-3 py-1.5 rounded hover:bg-dark-hoverBg flex items-center gap-1 transition-colors font-bold"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="bg-brand text-black font-bold text-[10px] uppercase px-3 py-1.5 rounded hover:bg-brand-light flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Expense
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {otherExpenses.length > 0 ? (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-dark-border pb-2.5 text-theme-muted text-[10px] uppercase">
                  <th className="py-2">Trip</th>
                  <th>Vehicle</th>
                  <th>Toll (₹)</th>
                  <th>Other (₹)</th>
                  <th>Maint. (Linked)</th>
                  <th className="text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 text-theme-text">
                {otherExpenses.map(exp => (
                  <tr key={exp._id} className="hover:bg-dark-hoverBg/20">
                    <td className="py-2.5 text-white font-bold">{exp.tripId ? exp.tripId.tripId : "—"}</td>
                    <td>{exp.vehicleId ? exp.vehicleId.registrationNo : "—"}</td>
                    <td>₹{Number(exp.toll).toLocaleString()}</td>
                    <td>₹{Number(exp.other).toLocaleString()}</td>
                    <td>₹{Number(exp.maintenanceCost).toLocaleString()}</td>
                    <td className="text-right font-bold text-brand">₹{Number(exp.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-6 text-center text-theme-muted font-mono">NO OTHER EXPENSE LOGS REGISTERED.</div>
          )}
        </div>
      </div>

      {/* TOTAL COST COUNTER */}
      <div className="bg-brand/10 border border-brand/20 p-4 rounded shadow flex items-center justify-between text-brand text-sm font-bold uppercase">
        <span>Total Operational Cost (Auto) = Fuel + Maint + Tolls</span>
        <span className="text-xl technical-mono font-bold">
          ₹{Number(metrics.totalOperationalCost || 0).toLocaleString()}
        </span>
      </div>

    </div>
  );
};

// 8. Financial Analyst component: Analytics Dashboard
export const AnalyticsDashboard = () => {
  const token = useAuthStore((state) => state.token);

  // Queries
  const { data: expenseData } = useQuery({
    queryKey: ["analyticsExpenses"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["analyticsDashboard"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const { metrics: expMetrics = {} } = expenseData || {};
  const { metrics: dbMetrics = {} } = dashboardData || {};

  // Operational metrics
  const utilization = dbMetrics.fleetUtilization || 81;
  const opCost = expMetrics.totalOperationalCost || 34070;

  const handleExportOperationalReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(24, 24, 27); // Dark zinc header
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("TRANSITOPS OPERATIONS REPORT", 15, 25);
    
    doc.setTextColor(82, 82, 91);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 15, 55);
    doc.text(`Operational Status: Active`, 15, 62);
    
    // Core KPIs
    doc.setFont("helvetica", "bold");
    doc.text("KEY PERFORMANCE INDICATORS (KPIs)", 15, 80);
    doc.line(15, 82, 195, 82);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Fleet Utilization Index:`, 15, 92);
    doc.text(`${utilization}%`, 150, 92);
    
    doc.text(`Total Operational Cost (Fuel + Repairs + Tolls):`, 15, 99);
    doc.text(`INR ${Number(opCost).toLocaleString()}`, 150, 99);
    
    doc.text(`Average Fleet Fuel Efficiency:`, 15, 106);
    doc.text(`8.4 km/l`, 150, 106);
    
    doc.text(`Annualized Yield (ROI):`, 15, 113);
    doc.text(`14.2%`, 150, 113);
    
    // Financials
    doc.setFont("helvetica", "bold");
    doc.text("FINANCIAL SUMMARY MATRIX", 15, 130);
    doc.line(15, 132, 195, 132);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Simulated Monthly Revenue:`, 15, 142);
    doc.text(`INR 1,240,000`, 150, 142);
    doc.text(`Simulated Cost Base:`, 15, 149);
    doc.text(`INR 385,000`, 150, 149);
    doc.text(`Estimated Net Profit:`, 15, 156);
    doc.text(`INR 855,000`, 150, 156);
    
    doc.line(15, 160, 195, 160);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("Report generated by TransitOps portal. Strictly confidential operational audit document.", 15, 180);

    doc.save(`TransitOps_Operations_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6 text-theme-text font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono uppercase tracking-tight text-theme-text">Reports & Analytics</h2>
          <p className="text-[10px] text-theme-muted mt-1 font-mono font-semibold">Operational efficiency, fleet yields, and costs tracking ledger.</p>
        </div>
        <button
          onClick={handleExportOperationalReport}
          className="bg-brand text-black font-bold font-mono text-xs uppercase px-4 py-2 rounded shadow hover:bg-brand-light flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" /> Export Report (PDF)
        </button>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-theme-panel border border-dark-border p-4 rounded shadow">
          <span className="text-[9px] text-theme-muted font-bold block uppercase tracking-wider">Fuel Efficiency</span>
          <span className="text-2xl font-bold block mt-1">8.4 km/l</span>
          <span className="text-[8px] text-theme-muted block mt-2">Avg across active dispatches</span>
        </div>

        <div className="bg-theme-panel border border-dark-border p-4 rounded shadow border-l-2 border-l-green-500">
          <span className="text-[9px] text-theme-muted font-bold block uppercase tracking-wider">Fleet Utilization</span>
          <span className="text-2xl font-bold block mt-1">{utilization}%</span>
          <span className="text-[8px] text-theme-muted block mt-2">Active dispatches ratio</span>
        </div>

        <div className="bg-theme-panel border border-dark-border p-4 rounded shadow border-l-2 border-l-amber-500">
          <span className="text-[9px] text-theme-muted font-bold block uppercase tracking-wider">Operational Cost</span>
          <span className="text-2xl font-bold block mt-1">₹{Number(opCost).toLocaleString()}</span>
          <span className="text-[8px] text-theme-muted block mt-2">Sum of fuel + maintenance + tolls</span>
        </div>

        <div className="bg-theme-panel border border-dark-border p-4 rounded shadow border-l-2 border-l-brand">
          <span className="text-[9px] text-theme-muted font-bold block uppercase tracking-wider">Vehicle ROI</span>
          <span className="text-2xl font-bold block mt-1">14.2%</span>
          <span className="text-[8px] text-theme-muted block mt-2">Annualized yield index</span>
        </div>
      </div>

      <div className="text-[9px] text-theme-muted uppercase tracking-wider text-center mt-2 border-b border-dark-border/40 pb-4 font-semibold">
        ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      </div>

      {/* Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* MONTHLY REVENUE (col-span-7) */}
        <div className="lg:col-span-7 bg-theme-panel border border-dark-border p-6 rounded shadow space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Monthly Revenue</h3>
          
          {/* Custom CSS visual bar chart */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-dark-border/40 pb-2">
            {[
              { month: "Jan", val: 55 },
              { month: "Feb", val: 70 },
              { month: "Mar", val: 60 },
              { month: "Apr", val: 85 },
              { month: "May", val: 78 },
              { month: "Jun", val: 95 },
              { month: "Jul", val: 90 }
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div 
                  className="w-full bg-blue-500/80 hover:bg-brand rounded-t transition-all duration-300"
                  style={{ height: `${col.val}%` }}
                  title={`₹${col.val * 1000} logged`}
                ></div>
                <span className="text-[9px] text-theme-muted font-bold block group-hover:text-white">{col.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TOP COSTLIEST VEHICLES (col-span-5) */}
        <div className="lg:col-span-5 bg-theme-panel border border-dark-border p-6 rounded shadow space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Top Costliest Vehicles</h3>
          
          <div className="space-y-4 pt-2">
            {/* Vehicle 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-theme-text font-bold">
                <span>TRUCK-11</span>
                <span>₹18,000</span>
              </div>
              <div className="w-full bg-dark-bg border border-dark-border h-2 rounded overflow-hidden">
                <div className="bg-red-500 h-full w-[85%]"></div>
              </div>
            </div>

            {/* Vehicle 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-theme-text font-bold">
                <span>MINI-03</span>
                <span>₹6,200</span>
              </div>
              <div className="w-full bg-dark-bg border border-dark-border h-2 rounded overflow-hidden">
                <div className="bg-amber-500 h-full w-[45%]"></div>
              </div>
            </div>

            {/* Vehicle 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-theme-text font-bold">
                <span>VAN-05</span>
                <span>₹2,500</span>
              </div>
              <div className="w-full bg-dark-bg border border-dark-border h-2 rounded overflow-hidden">
                <div className="bg-blue-500 h-full w-[20%]"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// 9. Common component: Settings
export const SystemSettings = () => {
  const [depotName, setDepotName] = useState("Gandhinagar Depot GJ4");
  const [currency, setCurrency] = useState("INR");
  const [distanceUnit, setDistanceUnit] = useState("km");
  const [success, setSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-theme-text font-mono text-xs">
      <div>
        <h2 className="text-xl font-bold font-mono uppercase tracking-tight text-theme-text">Settings & RBAC</h2>
        <p className="text-[10px] text-theme-muted mt-1 font-mono">Configure global transport operations parameters and role permissions registry.</p>
      </div>

      {success && (
        <div className="bg-green-950/40 border border-green-500/30 p-3 rounded text-green-400 font-mono uppercase tracking-wider">
          Settings changes saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GENERAL SETTINGS FORM (col-span-5) */}
        <div className="lg:col-span-5 bg-theme-panel border border-dark-border p-6 rounded shadow space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">General Settings</h3>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] text-theme-muted uppercase font-bold">Depot Name</label>
              <input
                type="text"
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                className="ops-input"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-theme-muted uppercase font-bold">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="ops-input cursor-pointer"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-theme-muted uppercase font-bold">Distance Unit</label>
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="ops-input cursor-pointer"
              >
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-brand text-black font-bold uppercase py-2 rounded hover:bg-brand-light transition-all text-xs"
            >
              Save changes
            </button>
          </form>
        </div>

        {/* RBAC MATRIX (col-span-7) */}
        <div className="lg:col-span-7 bg-theme-panel border border-dark-border p-6 rounded shadow space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Role-Based Access (RBAC)</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-dark-border pb-3 text-theme-muted text-[10px] uppercase">
                  <th className="py-2.5">Role</th>
                  <th>Fleet</th>
                  <th>Driver</th>
                  <th>Trips</th>
                  <th>Fuel/Exp.</th>
                  <th>Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 text-theme-text">
                <tr>
                  <td className="py-3 font-bold text-white">Fleet Manager</td>
                  <td className="text-green-500 font-bold">✓</td>
                  <td className="text-green-500 font-bold">✓</td>
                  <td className="text-theme-muted">—</td>
                  <td className="text-theme-muted">—</td>
                  <td className="text-green-500 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-white">Driver</td>
                  <td className="text-blue-400 font-bold">View</td>
                  <td className="text-theme-muted">—</td>
                  <td className="text-green-500 font-bold">✓</td>
                  <td className="text-theme-muted">—</td>
                  <td className="text-theme-muted">—</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-white">Safety Officer</td>
                  <td className="text-theme-muted">—</td>
                  <td className="text-green-500 font-bold">✓</td>
                  <td className="text-blue-400 font-bold">View</td>
                  <td className="text-theme-muted">—</td>
                  <td className="text-theme-muted">—</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-white">Financial Analyst</td>
                  <td className="text-blue-400 font-bold">View</td>
                  <td className="text-theme-muted">—</td>
                  <td className="text-theme-muted">—</td>
                  <td className="text-green-500 font-bold">✓</td>
                  <td className="text-green-500 font-bold">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

