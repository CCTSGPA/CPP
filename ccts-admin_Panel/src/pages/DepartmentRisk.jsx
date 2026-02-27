import React, { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  AlertTriangle,
  TrendingDown,
  Clock,
  MapPin,
  BarChart3,
  RefreshCw,
  Shield
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { fetchAdminComplaints } from '../services/adminApi'

const RiskBadge = ({ level }) => {
  const styles = {
    LOW: 'bg-green-100 text-green-800 border-green-300',
    MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    HIGH: 'bg-red-100 text-red-800 border-red-300'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[level] || styles.LOW}`}>
      {level}
    </span>
  )
}

const DepartmentRisk = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchAdminComplaints({ page: 0, size: 500 })
        setComplaints(data?.content || [])
      } catch {
        setComplaints([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const departments = useMemo(() => {
    const grouped = complaints.reduce((acc, complaint) => {
      const name = complaint.respondentDepartment || 'Unspecified Department'
      if (!acc[name]) {
        acc[name] = {
          id: name,
          name,
          totalComplaints: 0,
          slaBreaches: 0,
          highSeverity: 0,
          resolved: 0,
          pending: 0,
          geoClusters: new Set(),
          categories: {}
        }
      }

      const bucket = acc[name]
      bucket.totalComplaints += 1
      if (complaint.slaBreached) bucket.slaBreaches += 1
      if ((complaint.aiSeverityScore || 0) >= 75) bucket.highSeverity += 1
      if (complaint.status === 'RESOLVED' || complaint.status === 'APPROVED') {
        bucket.resolved += 1
      } else {
        bucket.pending += 1
      }
      if (complaint.location) {
        bucket.geoClusters.add(complaint.location)
      }

      const category = complaint.category || 'other'
      bucket.categories[category] = (bucket.categories[category] || 0) + 1

      return acc
    }, {})

    return Object.values(grouped).map((dept) => {
      const riskScore = Number((dept.totalComplaints * 0.4 + dept.slaBreaches * 0.3 + dept.highSeverity * 0.3).toFixed(2))
      const riskLevel = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MODERATE' : 'LOW'

      const categoryTotal = Object.values(dept.categories).reduce((sum, value) => sum + value, 0) || 1
      const categoryPercentages = Object.entries(dept.categories).reduce((acc, [key, value]) => {
        acc[key] = Math.round((value / categoryTotal) * 100)
        return acc
      }, {})

      return {
        ...dept,
        riskScore,
        riskLevel,
        trend: 'stable',
        trendValue: 0,
        geoClusters: Array.from(dept.geoClusters).slice(0, 3),
        categories: categoryPercentages
      }
    })
  }, [complaints])

  const radarData = selectedDepartment ? [
    { subject: 'Complaints', value: selectedDepartment.totalComplaints, fullMark: 250 },
    { subject: 'SLA Breaches', value: selectedDepartment.slaBreaches, fullMark: 50 },
    { subject: 'High Severity', value: selectedDepartment.highSeverity, fullMark: 100 },
    { subject: 'Pending', value: selectedDepartment.pending, fullMark: 150 },
    { subject: 'Risk Score', value: selectedDepartment.riskScore, fullMark: 100 }
  ] : []

  const overallStats = {
    totalComplaints: departments.reduce((acc, d) => acc + d.totalComplaints, 0),
    totalSlaBreaches: departments.reduce((acc, d) => acc + d.slaBreaches, 0),
    avgRiskScore: departments.length === 0 ? 0 : Math.round(departments.reduce((acc, d) => acc + d.riskScore, 0) / departments.length),
    highRiskDepts: departments.filter((d) => d.riskLevel === 'HIGH').length
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
      {complaints.length === 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center text-gray-500">
          No data available
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Complaints</p>
              <p className="text-xl font-bold text-gray-800">{overallStats.totalComplaints}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">SLA Breaches</p>
              <p className="text-xl font-bold text-gray-800">{overallStats.totalSlaBreaches}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Risk Score</p>
              <p className="text-xl font-bold text-gray-800">{overallStats.avgRiskScore}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">High Risk Depts</p>
              <p className="text-xl font-bold text-gray-800">{overallStats.highRiskDepts}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-800">Department Risk Overview</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedDepartment?.id === dept.id ? 'bg-purple-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{dept.name}</h4>
                        <div className="flex items-center gap-2">
                          <RiskBadge level={dept.riskLevel} />
                          <span className="text-xs flex items-center gap-1 text-gray-500">
                            <TrendingDown className="w-3 h-3" />
                            {dept.trendValue}% stable
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">{dept.riskScore}</p>
                      <p className="text-xs text-gray-500">Risk Score</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          dept.riskScore > 70 ? 'bg-gradient-to-r from-yellow-500 to-red-500' :
                          dept.riskScore > 40 ? 'bg-gradient-to-r from-green-500 to-yellow-500' :
                          'bg-gradient-to-r from-green-400 to-green-500'
                        }`}
                        style={{ width: `${Math.min(Number(dept.riskScore), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-semibold">{dept.totalComplaints}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">SLA Breaches</p>
                      <p className="font-semibold text-red-600">{dept.slaBreaches}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Resolved</p>
                      <p className="font-semibold text-green-600">{dept.resolved}</p>
                    </div>
                  </div>

                  {dept.geoClusters.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <div className="flex gap-1">
                        {dept.geoClusters.map((cluster, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                            {cluster}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {departments.length === 0 && (
              <div className="p-6 text-sm text-gray-500">No data available</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Department Analysis</h3>
            {selectedDepartment ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">{selectedDepartment.name}</p>
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <span className="text-2xl font-bold text-white">{selectedDepartment.riskScore}</span>
                  </div>
                  <div className="mt-2">
                    <RiskBadge level={selectedDepartment.riskLevel} />
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar name="Department" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>

                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Complaint Categories</p>
                  <div className="space-y-2">
                    {Object.entries(selectedDepartment.categories).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 capitalize">{key}</span>
                          <span className="font-medium">{value}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a department to view details</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Complaint Density</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={departments.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="name" type="category" stroke="#6b7280" width={100} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="totalComplaints" fill="#8b5cf6" name="Complaints" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepartmentRisk
