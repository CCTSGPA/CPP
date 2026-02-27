import React, { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import {
  Map,
  MapPin,
  Filter,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Layers,
  Search,
  Calendar
} from 'lucide-react'
import { fetchAdminComplaints } from '../services/adminApi'

const GeoIntelligence = () => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    department: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    severity: ''
  })
  const [viewMode, setViewMode] = useState('clusters')
  const [hoveredLocation, setHoveredLocation] = useState(null)

  useEffect(() => {
    const loadComplaints = async () => {
      setLoading(true)
      try {
        const data = await fetchAdminComplaints({ page: 0, size: 500 })
        const content = data?.content || []

        const groupedByCoordinate = content
          .filter((item) => item.latitude != null && item.longitude != null)
          .reduce((acc, item) => {
            const key = `${item.latitude},${item.longitude}`
            if (!acc[key]) {
              acc[key] = {
                id: key,
                lat: item.latitude,
                lng: item.longitude,
                department: item.respondentDepartment || 'Unspecified',
                category: item.category || 'Other',
                count: 0,
                severity: 'low',
                rawSeverity: 0
              }
            }
            acc[key].count += 1
            const severityScore = item.aiSeverityScore || 0
            if (severityScore > acc[key].rawSeverity) {
              acc[key].rawSeverity = severityScore
              acc[key].severity = severityScore >= 75 ? 'high' : severityScore >= 50 ? 'medium' : 'low'
            }
            return acc
          }, {})

        setComplaints(Object.values(groupedByCoordinate))
      } catch {
        setComplaints([])
      } finally {
        setLoading(false)
      }
    }

    loadComplaints()
  }, [])

  useEffect(() => {
    // Initialize map
    if (mapRef.current && !map) {
      const mapInstance = L.map(mapRef.current).setView([20.5937, 78.9629], 5)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance)

      setMap(mapInstance)
    }

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [])

  // Add markers when map or complaints change
  useEffect(() => {
    if (!map) return

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer)
      }
    })

    // Add markers
    complaints.forEach((complaint) => {
      const severityColors = {
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#10b981'
      }

      const marker = L.circleMarker([complaint.lat, complaint.lng], {
        radius: Math.sqrt(complaint.count) * 2,
        fillColor: severityColors[complaint.severity],
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7
      }).addTo(map)

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold">${complaint.department}</h3>
          <p>${complaint.category}</p>
          <p>Complaints: ${complaint.count}</p>
        </div>
      `)

      marker.on('mouseover', () => {
        setHoveredLocation(complaint)
      })

      marker.on('mouseout', () => {
        setHoveredLocation(null)
      })
    })
  }, [map, complaints, filters])

  const departments = [...new Set(complaints.map((item) => item.department))]

  const filteredComplaints = complaints.filter(c => {
    if (filters.department && c.department !== filters.department) return false
    if (filters.severity && c.severity !== filters.severity) return false
    return true
  })

  const locationStats = filteredComplaints
    .map((item) => ({
      name: `${item.lat.toFixed(2)}, ${item.lng.toFixed(2)}`,
      complaints: item.count,
      trend: '0%',
      severity: item.severity
    }))
    .sort((a, b) => b.complaints - a.complaints)
    .slice(0, 6)

  const hotspotCount = filteredComplaints.filter((item) => item.severity === 'high').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Locations</p>
              <p className="text-xl font-bold text-gray-800">{complaints.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hotspots</p>
              <p className="text-xl font-bold text-gray-800">{hotspotCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rising Areas</p>
              <p className="text-xl font-bold text-gray-800">{filteredComplaints.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Layers className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Clusters</p>
              <p className="text-xl font-bold text-gray-800">{filteredComplaints.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Map Controls */}
            <div className="p-4 border-b flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All Severity</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setViewMode('clusters')}
                  className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'clusters' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Clusters
                </button>
                <button
                  onClick={() => setViewMode('heat')}
                  className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'heat' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Heatmap
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative">
              <div ref={mapRef} className="h-[500px] w-full"></div>
              {filteredComplaints.length === 0 && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] text-sm text-gray-600">
                  No complaint data available
                </div>
              )}
              
              {/* Hover Info */}
              {hoveredLocation && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] min-w-48">
                  <h4 className="font-semibold text-gray-800">{hoveredLocation.department}</h4>
                  <p className="text-sm text-gray-600">{hoveredLocation.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm">Complaints: <strong>{hoveredLocation.count}</strong></span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      hoveredLocation.severity === 'high' ? 'bg-red-100 text-red-800' :
                      hoveredLocation.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {hoveredLocation.severity}
                    </span>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                <p className="text-xs font-semibold text-gray-600 mb-2">Severity</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-gray-600">High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs text-gray-600">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600">Low</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Top Locations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-800">Top Locations</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {locationStats.map((location, idx) => (
                <div key={idx} className="p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded text-xs font-medium text-gray-600">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-800">{location.name}</span>
                    </div>
                    <span className={`text-xs ${
                      location.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {location.trend}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-gray-500">{location.complaints} complaints</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      location.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {location.severity}
                    </span>
                  </div>
                </div>
              ))}
              {locationStats.length === 0 && (
                <div className="p-3 text-sm text-gray-500">No complaint data available</div>
              )}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-800">Geo Alerts</h3>
            </div>
            <div className="p-3 space-y-2">
              {locationStats.slice(0, 3).map((alert, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">Location {alert.name} has {alert.complaints} complaints</p>
                  <p className="text-xs text-gray-500">Severity: {alert.severity}</p>
                </div>
              ))}
              {locationStats.length === 0 && (
                <div className="text-sm text-gray-500">No complaint data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeoIntelligence
