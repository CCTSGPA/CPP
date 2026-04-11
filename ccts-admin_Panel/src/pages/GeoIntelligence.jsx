import React, { useState, useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react'
import { fetchAdminComplaints, fetchPublicGeoHeatmap } from '../services/adminApi'

const GeoIntelligence = () => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [rawComplaints, setRawComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filters, setFilters] = useState({
    department: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    severity: ''
  })
  const [viewMode, setViewMode] = useState('clusters')
  const [hoveredLocation, setHoveredLocation] = useState(null)
  const [showLegend, setShowLegend] = useState(true)
  const [selectedHotspotKey, setSelectedHotspotKey] = useState('')

  useEffect(() => {
    const loadComplaints = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const [adminData, heatmapData] = await Promise.all([
          fetchAdminComplaints({ page: 0, size: 500 }),
          fetchPublicGeoHeatmap()
        ])

        const adminContent = (adminData?.content || [])
          .filter((item) => item.latitude != null && item.longitude != null)
          .map((item) => ({ ...item, complaintCount: 1 }))

        const publicPoints = (heatmapData?.points || [])
          .filter((point) => point.latitude != null && point.longitude != null)
          .map((point, idx) => ({
            id: `public-${idx}`,
            latitude: point.latitude,
            longitude: point.longitude,
            respondentDepartment: point.department || 'Unspecified',
            category: point.category || 'Other',
            aiSeverityScore:
              String(point.severity || '').toLowerCase() === 'high' ? 90 :
              String(point.severity || '').toLowerCase() === 'medium' ? 60 : 30,
            complaintCount: Number(point.count) > 0 ? Number(point.count) : 1,
            createdAt: new Date().toISOString()
          }))

        setRawComplaints([...adminContent, ...publicPoints])
      } catch (err) {
        setRawComplaints([])
        setLoadError(err?.message || 'Unable to load geo intelligence data')
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
      setTimeout(() => mapInstance.invalidateSize(), 0)
    }

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [])

  const filteredRawComplaints = useMemo(() => {
    return rawComplaints.filter((item) => {
      const severityScore = item.aiSeverityScore || 0
      const severity = severityScore >= 75 ? 'high' : severityScore >= 50 ? 'medium' : 'low'

      if (filters.department && (item.respondentDepartment || 'Unspecified') !== filters.department) return false
      if (filters.category && (item.category || 'Other') !== filters.category) return false
      if (filters.severity && severity !== filters.severity) return false
      if (filters.dateFrom) {
        const createdAt = item.createdAt ? new Date(item.createdAt) : null
        if (!createdAt || createdAt < new Date(filters.dateFrom)) return false
      }
      if (filters.dateTo) {
        const createdAt = item.createdAt ? new Date(item.createdAt) : null
        const toDate = new Date(filters.dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (!createdAt || createdAt > toDate) return false
      }
      return true
    })
  }, [rawComplaints, filters])

  const displayedLocations = useMemo(() => {
    if (viewMode === 'heat') {
      return filteredRawComplaints.map((item) => {
        const severityScore = item.aiSeverityScore || 0
        return {
          id: item.id,
          lat: item.latitude,
          lng: item.longitude,
          department: item.respondentDepartment || 'Unspecified',
          category: item.category || 'Other',
          count: Number(item.complaintCount) > 0 ? Number(item.complaintCount) : 1,
          rawSeverity: severityScore,
          severity: severityScore >= 75 ? 'high' : severityScore >= 50 ? 'medium' : 'low'
        }
      })
    }

    const groupedByCoordinate = filteredRawComplaints.reduce((acc, item) => {
      const lat = Number(item.latitude)
      const lng = Number(item.longitude)
      const key = `${lat.toFixed(3)},${lng.toFixed(3)}`
      if (!acc[key]) {
        acc[key] = {
          id: key,
          lat,
          lng,
          department: item.respondentDepartment || 'Unspecified',
          category: item.category || 'Other',
          count: 0,
          severity: 'low',
          rawSeverity: 0
        }
      }
      const complaintCount = Number(item.complaintCount) > 0 ? Number(item.complaintCount) : 1
      acc[key].count += complaintCount
      const severityScore = item.aiSeverityScore || 0
      if (severityScore > acc[key].rawSeverity) {
        acc[key].rawSeverity = severityScore
        acc[key].severity = severityScore >= 75 ? 'high' : severityScore >= 50 ? 'medium' : 'low'
      }
      return acc
    }, {})

    return Object.values(groupedByCoordinate)
  }, [filteredRawComplaints, viewMode])

  const visibleLocations = useMemo(() => {
    if (!selectedHotspotKey) return displayedLocations
    return displayedLocations.filter((item) => item.id === selectedHotspotKey)
  }, [displayedLocations, selectedHotspotKey])

  // Add markers when map data changes
  useEffect(() => {
    if (!map) return

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer)
      }
    })

    // Add markers
    visibleLocations.forEach((complaint) => {
      const severityColors = {
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#10b981'
      }

      let marker
      if (viewMode === 'heat') {
        marker = L.circle([complaint.lat, complaint.lng], {
          radius: Math.max(500, Math.min(6000, complaint.count * 350 + (complaint.rawSeverity || 0) * 30)),
          fillColor: severityColors[complaint.severity],
          color: severityColors[complaint.severity],
          weight: 1,
          opacity: 0.25,
          fillOpacity: 0.28
        }).addTo(map)
      } else {
        marker = L.circleMarker([complaint.lat, complaint.lng], {
          radius: Math.max(7, Math.min(22, Math.sqrt(complaint.count) * 5)),
          fillColor: severityColors[complaint.severity],
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.82
        }).addTo(map)
      }

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold">${complaint.department}</h3>
          <p>${complaint.category}</p>
          <p>Complaints: ${complaint.count}</p>
          <p>Mode: ${viewMode === 'heat' ? 'Heatmap' : 'Cluster'}</p>
        </div>
      `)

      marker.on('mouseover', () => {
        setHoveredLocation(complaint)
      })

      marker.on('mouseout', () => {
        setHoveredLocation(null)
      })
    })

    if (visibleLocations.length > 0) {
      const bounds = L.latLngBounds(visibleLocations.map((item) => [item.lat, item.lng]))
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 })
      }
    }
  }, [map, visibleLocations, viewMode])

  const departments = [...new Set(rawComplaints.map((item) => item.respondentDepartment || 'Unspecified'))]
  const categories = [...new Set(rawComplaints.map((item) => item.category || 'Other'))]

  const filteredComplaints = visibleLocations

  const locationStats = filteredComplaints
    .map((item) => ({
      key: item.id,
      name: `${item.lat.toFixed(2)}, ${item.lng.toFixed(2)}`,
      lat: item.lat,
      lng: item.lng,
      complaints: item.count,
      trend: '0%',
      severity: item.severity
    }))
    .sort((a, b) => b.complaints - a.complaints)
    .slice(0, 6)

  const hotspotCount = filteredComplaints.filter((item) => item.severity === 'high').length

  const selectedHotspot = useMemo(() => {
    if (!selectedHotspotKey) return null
    return displayedLocations.find((item) => item.id === selectedHotspotKey) || null
  }, [displayedLocations, selectedHotspotKey])

  const activeFilterChips = useMemo(() => {
    const chips = []
    if (filters.department) chips.push({ key: 'department', label: `Department: ${filters.department}` })
    if (filters.category) chips.push({ key: 'category', label: `Category: ${filters.category}` })
    if (filters.severity) chips.push({ key: 'severity', label: `Severity: ${filters.severity}` })
    if (filters.dateFrom) chips.push({ key: 'dateFrom', label: `From: ${filters.dateFrom}` })
    if (filters.dateTo) chips.push({ key: 'dateTo', label: `To: ${filters.dateTo}` })
    if (selectedHotspot) chips.push({ key: 'hotspot', label: `Hotspot: ${selectedHotspot.lat.toFixed(2)}, ${selectedHotspot.lng.toFixed(2)}` })
    chips.push({ key: 'mode', label: `Mode: ${viewMode === 'heat' ? 'Heatmap' : 'Clusters'}`, static: true })
    return chips
  }, [filters, selectedHotspot, viewMode])

  const clearFilterChip = (key) => {
    if (key === 'department') setFilters((prev) => ({ ...prev, department: '' }))
    if (key === 'category') setFilters((prev) => ({ ...prev, category: '' }))
    if (key === 'severity') setFilters((prev) => ({ ...prev, severity: '' }))
    if (key === 'dateFrom') setFilters((prev) => ({ ...prev, dateFrom: '' }))
    if (key === 'dateTo') setFilters((prev) => ({ ...prev, dateTo: '' }))
    if (key === 'hotspot') setSelectedHotspotKey('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Locations</p>
              <p className="text-xl font-bold text-gray-800">{displayedLocations.length}</p>
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
              <p className="text-xl font-bold text-gray-800">{filteredRawComplaints.length}</p>
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
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
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
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowLegend((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${showLegend ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  {showLegend ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  Legend
                </button>
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
                {selectedHotspotKey && (
                  <button
                    onClick={() => setSelectedHotspotKey('')}
                    className="px-3 py-1.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200"
                  >
                    Clear Hotspot Filter
                  </button>
                )}
              </div>
            </div>

            <div className="px-4 py-2 border-b bg-gray-50/60 flex flex-wrap items-center gap-2">
              {activeFilterChips.map((chip) => (
                <span
                  key={chip.key}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${chip.static ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}
                >
                  {chip.label}
                  {!chip.static && (
                    <button
                      type="button"
                      onClick={() => clearFilterChip(chip.key)}
                      className="font-bold leading-none"
                      title="Remove filter"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFilters({ department: '', category: '', dateFrom: '', dateTo: '', severity: '' })
                  setSelectedHotspotKey('')
                }}
                className="ml-auto text-xs text-red-700 hover:underline"
              >
                Clear all filters
              </button>
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
              <div className="absolute top-4 right-4 bg-black/70 text-white rounded-lg px-3 py-1.5 z-[1200] text-xs font-semibold">
                {viewMode === 'heat' ? 'Heatmap Mode' : 'Cluster Mode'}
              </div>

              {showLegend && (
                <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1200] w-56">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Legend ({viewMode === 'heat' ? 'Heatmap' : 'Clusters'})</p>
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-xs text-gray-600">High AI severity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-xs text-gray-600">Medium AI severity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-600">Low AI severity</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {viewMode === 'heat'
                      ? 'Larger glow means higher complaint concentration and risk.'
                      : 'Larger circles mean more complaints in that location cluster.'}
                  </p>
                </div>
              )}
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
                <button
                  key={location.key}
                  type="button"
                  onClick={() => {
                    setSelectedHotspotKey((prev) => prev === location.key ? '' : location.key)
                    if (map) {
                      map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 8), { duration: 0.8 })
                    }
                  }}
                  className={`w-full text-left p-3 hover:bg-gray-50 ${selectedHotspotKey === location.key ? 'bg-purple-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded text-xs font-medium text-gray-600">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-800">{location.name}</span>
                    </div>
                    <span className={`text-xs ${
                      location.severity === 'high' ? 'text-red-600' : location.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {location.trend}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-gray-500">{location.complaints} complaints</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      location.severity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : location.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {location.severity}
                    </span>
                  </div>
                </button>
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
