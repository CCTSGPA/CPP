import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MainLayout from "../layouts/MainLayout";

const CATEGORIES = [
  "All Categories",
  "Bribery",
  "Fraud",
  "Abuse of Power",
  "Embezzlement",
  "Nepotism / Favoritism",
  "Extortion",
  "Other",
];

export default function GeoHeatmap() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    department: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 4);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !heatmapData?.points) return;

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add markers
    heatmapData.points.forEach((point) => {
      const severityColors = {
        critical: "#ef4444",
        high: "#f97316",
        medium: "#22c55e",
        low: "#3b82f6",
      };

      const marker = L.circleMarker([point.latitude, point.longitude], {
        radius: Math.min(8 + point.count * 2, 20),
        fillColor: severityColors[point.severity] || "#3b82f6",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div class="p-2">
          <p class="font-semibold">${point.category || "Unknown"}</p>
          <p class="text-sm text-gray-600">${point.department || "Unspecified"}</p>
          <p class="text-sm">Count: ${point.count}</p>
          <p class="text-sm capitalize">Severity: ${point.severity}</p>
        </div>
      `);
    });
  }, [heatmapData]);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== "All Categories") {
        params.set("category", filters.category);
      }
      if (filters.department) params.set("department", filters.department);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);

      const response = await fetch(`/api/v1/public/geo-heatmap?${params.toString()}`);
      const data = await response.json();
      if (data.status === "success") {
        setHeatmapData(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch heatmap data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchHeatmapData();
  };

  const resetFilters = () => {
    setFilters({ category: "", department: "", dateFrom: "", dateTo: "" });
    setTimeout(fetchHeatmapData, 0);
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 -mx-4 -mt-4 px-6 py-6 mb-6 rounded-b-2xl">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-white/80 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="p-2 bg-white/10 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Geo Heatmap</h1>
            <p className="text-sm text-purple-200">Corruption complaint locations — anonymized</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[160px]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat === "All Categories" ? "" : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Department</label>
              <input
                type="text"
                value={filters.department}
                onChange={(e) => handleFilterChange("department", e.target.value)}
                placeholder="Filter by dept..."
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-40"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <p className="text-2xl font-bold text-purple-700">{heatmapData?.mappedComplaints || 0}</p>
            <p className="text-sm text-purple-600">Mapped Complaints</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-700">{heatmapData?.hotspotsDetected || 0}</p>
            <p className="text-sm text-red-600">Hotspots Detected</p>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
            <p className="text-2xl font-bold text-orange-700">{heatmapData?.criticalPriority || 0}</p>
            <p className="text-sm text-orange-600">Critical Priority</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
            <p className="text-2xl font-bold text-yellow-700">{heatmapData?.unresolved || 0}</p>
            <p className="text-sm text-yellow-600">Unresolved</p>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-[500px]" />
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="font-medium text-gray-600">Legend:</span>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-500"></span>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-orange-500"></span>
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500"></span>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500"></span>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="w-4 h-4 rounded-full border-2 border-dashed border-red-400"></span>
              <span>Hotspot Zone (3+ complaints in 5km)</span>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400">No personal data is displayed. Locations are approximate.</p>
      </div>
    </MainLayout>
  );
}
