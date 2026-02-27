import React, { useState, useEffect } from 'react'
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Building2,
  Activity,
  RefreshCw,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { fetchAdminComplaints, fetchAdminStatistics } from '../services/adminApi'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const StatCard = ({ title, value, icon: Icon, change, changeType, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        {change && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {changeType === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
)

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState({
    totalComplaints: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    slaBreached: 0,
    highSeverity: 0,
    resolutionRate: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const [statsData, complaintsData] = await Promise.all([
          fetchAdminStatistics(),
          fetchAdminComplaints({ page: 0, size: 500 })
        ])

        const content = complaintsData?.content || []
        setComplaints(content)

        setStats({
          totalComplaints: statsData?.totalComplaints || 0,
          open: statsData?.submittedCount || 0,
          inProgress: statsData?.underReviewCount || 0,
          resolved: statsData?.resolvedCount || 0,
          rejected: statsData?.rejectedCount || 0,
          slaBreached: statsData?.slaBreaches || 0,
          highSeverity: statsData?.highSeverity || 0,
          resolutionRate: Number(statsData?.resolutionRate || 0)
        })
      } catch {
        setComplaints([])
        setStats({
          totalComplaints: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          rejected: 0,
          slaBreached: 0,
          highSeverity: 0,
          resolutionRate: 0
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statusData = [
    { name: 'Open', value: stats.open, color: '#3b82f6' },
    { name: 'In Progress', value: stats.inProgress, color: '#f59e0b' },
    { name: 'Resolved', value: stats.resolved, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
  ]

  const monthlyData = [
    { month: 'Current', complaints: stats.totalComplaints, resolved: stats.resolved }
  ]

  const departmentMap = complaints.reduce((acc, complaint) => {
    const key = complaint.respondentDepartment || 'Unspecified'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const departmentData = Object.entries(departmentMap).map(([department, total]) => ({
    department,
    complaints: total
  }))

  const noData = stats.totalComplaints === 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Complaints"
          value={stats.totalComplaints}
          icon={FileText}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Open Complaints"
          value={stats.open}
          icon={Clock}
          color="bg-gradient-to-br from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle}
          change="+18%"
          changeType="up"
          color="bg-gradient-to-br from-green-500 to-emerald-500"
        />
        <StatCard
          title="SLA Breached"
          value={stats.slaBreached}
          icon={AlertTriangle}
          color="bg-gradient-to-br from-red-500 to-rose-500"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Activity}
          color="bg-gradient-to-br from-purple-500 to-violet-500"
        />
        <StatCard
          title="High Severity"
          value={stats.highSeverity}
          icon={TrendingUp}
          color="bg-gradient-to-br from-pink-500 to-rose-500"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="bg-gradient-to-br from-gray-500 to-slate-500"
        />
        <StatCard
          title="Resolution Rate"
          value={`${stats.resolutionRate.toFixed(1)}%`}
          icon={Building2}
          color="bg-gradient-to-br from-indigo-500 to-blue-500"
        />
      </div>

      {noData && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center text-gray-500">
          No data available
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Complaint Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="complaints" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} name="New Complaints" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Risk Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis dataKey="department" type="category" stroke="#6b7280" width={100} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="complaints" fill="#8b5cf6" name="Complaints" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {(complaints.slice(0, 5)).map((complaint, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{complaint.title}</p>
                  <p className="text-xs text-gray-500">Status: {String(complaint.status || '').replace('_', ' ')}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : '-'}</span>
            </div>
          ))}
          {complaints.length === 0 && (
            <div className="text-sm text-gray-500">No data available</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
