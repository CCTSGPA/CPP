import React, { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw,
  Target,
  Activity,
  Award,
  Zap
} from 'lucide-react'
import { fetchAdminComplaints, fetchAdminStatistics } from '../services/adminApi'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const AdvancedAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month')
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [statsData, complaintsData] = await Promise.all([
          fetchAdminStatistics(),
          fetchAdminComplaints({ page: 0, size: 500 })
        ])
        setStats(statsData)
        setComplaints(complaintsData?.content || [])
      } catch {
        setStats(null)
        setComplaints([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [timeRange])

  const totalComplaints = stats?.totalComplaints || 0
  const resolved = stats?.resolvedCount || 0
  const resolutionRateValue = totalComplaints === 0 ? 0 : Number((((resolved / totalComplaints) * 100)).toFixed(2))
  const slaBreaches = stats?.slaBreaches || 0
  const slaComplianceValue = totalComplaints === 0 ? 0 : Number((((totalComplaints - slaBreaches) / totalComplaints) * 100).toFixed(2))
  const highSeverity = stats?.highSeverity || 0
  const avgResolutionTimeValue = 0

  const noData = totalComplaints === 0

  // Resolution Rate Data
  const resolutionData = [
    { month: 'Current', rate: resolutionRateValue, target: 0 }
  ]

  // Resolution Time Data
  const resolutionTimeData = [
    { month: 'Current', avgDays: avgResolutionTimeValue, target: 0 }
  ]

  // SLA Performance
  const slaPerformance = [
    { month: 'Current', compliance: slaComplianceValue, breach: totalComplaints === 0 ? 0 : Number(((slaBreaches / totalComplaints) * 100).toFixed(2)) }
  ]

  // Complaint Growth
  const complaintGrowth = [
    { month: 'Current', complaints: totalComplaints, resolved }
  ]

  const departmentPerformance = useMemo(() => {
    const grouped = complaints.reduce((acc, item) => {
      const dept = item.respondentDepartment || 'Unspecified'
      if (!acc[dept]) {
        acc[dept] = { dept, total: 0, resolved: 0, breached: 0 }
      }
      acc[dept].total += 1
      if (item.status === 'RESOLVED' || item.status === 'APPROVED') acc[dept].resolved += 1
      if (item.slaBreached) acc[dept].breached += 1
      return acc
    }, {})

    return Object.values(grouped).map((dept) => {
      const resolution = dept.total === 0 ? 0 : Math.round((dept.resolved / dept.total) * 100)
      const sla = dept.total === 0 ? 0 : Math.round(((dept.total - dept.breached) / dept.total) * 100)
      return { dept: dept.dept, resolution, sla, avgTime: 0 }
    })
  }, [complaints])

  // Category Distribution
  const categoryData = [
    ...Object.entries(complaints.reduce((acc, item) => {
      const key = item.category || 'Other'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})).map(([name, value], index) => ({
      name,
      value,
      color: ['#ef4444', '#f59e0b', '#8b5cf6', '#10b981', '#6b7280'][index % 5]
    }))
  ]

  // Key Metrics
  const metrics = {
    resolutionRate: { current: resolutionRateValue, target: 0, trend: '0%', trendUp: true },
    avgResolutionTime: { current: avgResolutionTimeValue, target: 0, trend: '0 days', trendUp: true },
    slaCompliance: { current: slaComplianceValue, target: 0, trend: '0%', trendUp: true },
    backlogCount: { current: Math.max(totalComplaints - resolved, 0), target: 0, trend: '0', trendUp: true },
    repeatDepartments: { current: 0, target: 0, trend: '0', trendUp: true },
    satisfactionScore: { current: highSeverity, target: 0, trend: '0', trendUp: true }
  }

  const exportReport = () => {
    const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const sections = []

    sections.push(['Metric', 'Value'])
    sections.push(['Total Complaints', totalComplaints])
    sections.push(['Resolved', resolved])
    sections.push(['Resolution Rate %', resolutionRateValue])
    sections.push(['SLA Breaches', slaBreaches])
    sections.push(['SLA Compliance %', slaComplianceValue])
    sections.push(['High Severity', highSeverity])
    sections.push([])

    sections.push(['Category', 'Count'])
    categoryData.forEach((item) => {
      sections.push([item.name, item.value])
    })
    sections.push([])

    sections.push(['Department', 'Resolution %', 'SLA %', 'Avg Time (days)'])
    departmentPerformance.forEach((item) => {
      sections.push([item.dept, item.resolution, item.sla, item.avgTime])
    })

    const escapeCsv = (value) => {
      const str = String(value ?? '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csv = sections
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `advanced-analytics-report-${stamp}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportReportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' })
    const stamp = new Date().toLocaleString()

    doc.setFontSize(14)
    doc.text('Advanced Analytics Report', 14, 14)
    doc.setFontSize(9)
    doc.text(`Generated: ${stamp}`, 14, 20)

    autoTable(doc, {
      startY: 26,
      head: [['Metric', 'Value']],
      body: [
        ['Total Complaints', totalComplaints],
        ['Resolved', resolved],
        ['Resolution Rate %', resolutionRateValue],
        ['SLA Breaches', slaBreaches],
        ['SLA Compliance %', slaComplianceValue],
        ['High Severity', highSeverity]
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [109, 40, 217] }
    })

    autoTable(doc, {
      head: [['Category', 'Count']],
      body: categoryData.map((item) => [item.name, item.value]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 139, 230] }
    })

    autoTable(doc, {
      head: [['Department', 'Resolution %', 'SLA %', 'Avg Time (days)']],
      body: departmentPerformance.map((item) => [item.dept, item.resolution, item.sla, item.avgTime]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }
    })

    const fileStamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    doc.save(`advanced-analytics-report-${fileStamp}.pdf`)
  }

  const StatCard = ({ title, value, target, trend, trendUp, icon: Icon, suffix = '' }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Icon className="w-5 h-5 text-purple-600" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {trend}
        </div>
      </div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}{suffix}</p>
      <p className="text-xs text-gray-400">Target: {target}{suffix}</p>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {noData && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center text-gray-500">
          No data available
        </div>
      )}

      {complaints.length === 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center text-gray-500">
          No AI insights available yet.
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Advanced Analytics</h2>
          <p className="text-gray-500">Comprehensive performance insights and KPIs</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={exportReportPdf}
            className="flex items-center gap-2 px-4 py-2 border border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Resolution Rate"
          value={metrics.resolutionRate.current}
          target={metrics.resolutionRate.target}
          trend={metrics.resolutionRate.trend}
          trendUp={metrics.resolutionRate.trendUp}
          icon={CheckCircle}
          suffix="%"
        />
        <StatCard
          title="Avg Resolution Time"
          value={metrics.avgResolutionTime.current}
          target={metrics.avgResolutionTime.target}
          trend={metrics.avgResolutionTime.trend}
          trendUp={metrics.avgResolutionTime.trendUp}
          icon={Clock}
          suffix=" days"
        />
        <StatCard
          title="SLA Compliance"
          value={metrics.slaCompliance.current}
          target={metrics.slaCompliance.target}
          trend={metrics.slaCompliance.trend}
          trendUp={metrics.slaCompliance.trendUp}
          icon={Target}
          suffix="%"
        />
        <StatCard
          title="Backlog Count"
          value={metrics.backlogCount.current}
          target={metrics.backlogCount.target}
          trend={metrics.backlogCount.trend}
          trendUp={metrics.backlogCount.trendUp}
          icon={AlertTriangle}
        />
        <StatCard
          title="Repeat Depts"
          value={metrics.repeatDepartments.current}
          target={metrics.repeatDepartments.target}
          trend={metrics.repeatDepartments.trend}
          trendUp={metrics.repeatDepartments.trendUp}
          icon={Activity}
        />
        <StatCard
          title="Satisfaction"
          value={metrics.satisfactionScore.current}
          target={metrics.satisfactionScore.target}
          trend={metrics.satisfactionScore.trend}
          trendUp={metrics.satisfactionScore.trendUp}
          icon={Award}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resolution Rate vs Target */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resolution Rate vs Target</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={resolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="rate" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Actual Rate %" />
              <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} name="Target %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Average Resolution Time */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Average Resolution Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resolutionTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgDays" fill="#f59e0b" name="Avg Days" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} name="Target Days" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Compliance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">SLA Compliance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={slaPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Area type="monotone" dataKey="compliance" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Compliance %" />
              <Area type="monotone" dataKey="breach" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Breach %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Complaint Category Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Complaint Growth Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Complaint Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={complaintGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="complaints" stroke="#ef4444" strokeWidth={2} name="New" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Department Performance Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Resolution Rate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SLA Compliance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Avg Time (Days)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {departmentPerformance.map((dept) => (
                <tr key={dept.dept} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{dept.dept}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${dept.resolution >= 90 ? 'bg-green-500' : dept.resolution >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${dept.resolution}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{dept.resolution}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${dept.sla >= 90 ? 'bg-green-500' : dept.sla >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${dept.sla}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{dept.sla}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${dept.avgTime <= 10 ? 'text-green-600' : dept.avgTime <= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {dept.avgTime} days
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {dept.resolution >= 90 && dept.sla >= 90 ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Excellent</span>
                    ) : dept.resolution >= 80 && dept.sla >= 80 ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Good</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Needs Improvement</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdvancedAnalytics
