import React, { useState } from 'react'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Lock,
  Unlock,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Ban,
  Key,
  Bug,
  Server,
  Globe,
  Smartphone,
  UserCheck,
  XCircle,
  CheckCircle
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const SecurityControls = () => {
  const [securityData, setSecurityData] = useState({
    rateLimits: {
      total: 15420,
      blocked: 234,
      warnings: 56
    },
    captcha: {
      total: 8934,
      failed: 123,
      success: 8811
    },
    suspiciousActivity: [
      { id: 1, type: 'brute_force', ip: '192.168.1.105', location: 'Mumbai, IN', attempts: 45, timestamp: '2024-01-15 14:30:00', status: 'blocked' },
      { id: 2, type: 'sql_injection', ip: '45.33.32.156', location: 'US', payload: "' OR '1'='1", timestamp: '2024-01-15 14:25:00', status: 'blocked' },
      { id: 3, type: 'xss_attack', ip: '103.25.43.12', location: 'IN', payload: '<script>alert(1)</script>', timestamp: '2024-01-15 14:20:00', status: 'blocked' },
      { id: 4, type: 'rapid_requests', ip: '10.0.0.45', location: 'Internal', requests: 523, timestamp: '2024-01-15 14:15:00', status: 'flagged' },
      { id: 5, type: 'unusual_pattern', ip: '87.65.43.21', location: 'UK', pattern: 'Automated scanning', timestamp: '2024-01-15 14:10:00', status: 'investigating' },
    ],
    xssLogs: [
      { id: 1, timestamp: '2024-01-15 13:45:00', payload: '<img src=x onerror=alert(1)>', ip: '192.168.1.50', blocked: true },
      { id: 2, timestamp: '2024-01-15 12:30:00', payload: 'javascript:alert(1)', ip: '10.0.0.25', blocked: true },
      { id: 3, timestamp: '2024-01-15 11:15:00', payload: '<svg onload=alert(1)>', ip: '192.168.1.75', blocked: true },
    ],
    injectionLogs: [
      { id: 1, timestamp: '2024-01-15 14:20:00', type: 'SQL', payload: "admin'--", ip: '45.33.32.156', blocked: true },
      { id: 2, timestamp: '2024-01-15 13:10:00', type: 'NoSQL', payload: '{"$ne": null}', ip: '103.25.43.12', blocked: true },
      { id: 3, timestamp: '2024-01-15 10:45:00', type: 'LDAP', payload: '*)(uid=*))(|(uid=*', ip: '87.65.43.21', blocked: true },
    ]
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

  const hourlyData = [
    { hour: '00:00', requests: 234, blocked: 12 },
    { hour: '02:00', requests: 189, blocked: 8 },
    { hour: '04:00', requests: 156, blocked: 5 },
    { hour: '06:00', requests: 289, blocked: 15 },
    { hour: '08:00', requests: 567, blocked: 32 },
    { hour: '10:00', requests: 789, blocked: 45 },
    { hour: '12:00', requests: 823, blocked: 38 },
    { hour: '14:00', requests: 756, blocked: 41 },
    { hour: '16:00', requests: 698, blocked: 35 },
    { hour: '18:00', requests: 534, blocked: 28 },
    { hour: '20:00', requests: 423, blocked: 18 },
    { hour: '22:00', requests: 312, blocked: 14 },
  ]

  const AttackTypeIcon = ({ type }) => {
    const icons = {
      brute_force: <Key className="w-4 h-4" />,
      sql_injection: <Bug className="w-4 h-4" />,
      xss_attack: <Bug className="w-4 h-4" />,
      rapid_requests: <Activity className="w-4 h-4" />,
      unusual_pattern: <AlertTriangle className="w-4 h-4" />
    }
    return icons[type] || <ShieldAlert className="w-4 h-4" />
  }

  const StatusBadge = ({ status }) => {
    const styles = {
      blocked: 'bg-red-100 text-red-800',
      flagged: 'bg-yellow-100 text-yellow-800',
      investigating: 'bg-blue-100 text-blue-800'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-xl font-bold text-gray-800">{securityData.rateLimits.total.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Blocked</p>
              <p className="text-xl font-bold text-gray-800">{securityData.rateLimits.blocked}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">CAPTCHA Success</p>
              <p className="text-xl font-bold text-gray-800">{((securityData.captcha.success / securityData.captcha.total) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Suspicious Events</p>
              <p className="text-xl font-bold text-gray-800">{securityData.suspiciousActivity.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b px-4">
          <div className="flex gap-4">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'suspicious', label: 'Suspicious Activity', icon: ShieldAlert },
              { id: 'xss', label: 'XSS Detection', icon: Bug },
              { id: 'injection', label: 'Injection Detection', icon: Bug }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Request Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Traffic & Blocks</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Line type="monotone" dataKey="requests" stroke="#8b5cf6" strokeWidth={2} name="Total Requests" />
                    <Line type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} name="Blocked" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Security Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">System Protected</p>
                      <p className="text-sm text-green-600">All security measures active</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Server className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-800">Rate Limiting</p>
                      <p className="text-sm text-blue-600">Active - 100 req/min</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Globe className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-semibold text-purple-800">CAPTCHA</p>
                      <p className="text-sm text-purple-600">Enabled for submissions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Suspicious Activity Tab */}
          {activeTab === 'suspicious' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by IP or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {securityData.suspiciousActivity.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <AttackTypeIcon type={activity.type} />
                            <span className="text-sm font-medium capitalize">{activity.type.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{activity.ip}</code>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{activity.location}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {activity.attempts && `${activity.attempts} attempts`}
                          {activity.payload && <code className="text-xs bg-red-50 text-red-600 px-1 rounded ml-1">{activity.payload.substring(0, 20)}...</code>}
                          {activity.requests && `${activity.requests} reqs`}
                          {activity.pattern && activity.pattern}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{activity.timestamp}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={activity.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* XSS Logs Tab */}
          {activeTab === 'xss' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">XSS Attack Detection Logs</h3>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {securityData.xssLogs.length} Detected
                </span>
              </div>

              <div className="space-y-3">
                {securityData.xssLogs.map((log) => (
                  <div key={log.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {log.blocked ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium text-gray-800">XSS Attack Blocked</span>
                      </div>
                      <span className="text-sm text-gray-500">{log.timestamp}</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Payload:</p>
                      <code className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded block">
                        {log.payload}
                      </code>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>IP: {log.ip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Injection Logs Tab */}
          {activeTab === 'injection' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Injection Attack Detection Logs</h3>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {securityData.injectionLogs.length} Detected
                </span>
              </div>

              <div className="space-y-3">
                {securityData.injectionLogs.map((log) => (
                  <div key={log.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {log.blocked ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium text-gray-800">{log.type} Injection Blocked</span>
                      </div>
                      <span className="text-sm text-gray-500">{log.timestamp}</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Payload:</p>
                      <code className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded block">
                        {log.payload}
                      </code>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>IP: {log.ip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SecurityControls
