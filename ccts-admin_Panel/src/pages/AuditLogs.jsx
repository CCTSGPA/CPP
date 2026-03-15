import React, { useEffect, useMemo, useState } from 'react'
import {
  FileText,
  Search,
  Download,
  User,
  Shield,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  Globe,
  Smartphone,
  RefreshCw
} from 'lucide-react'
import { fetchAdminTimeline } from '../services/adminApi'

const AuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    const loadTimeline = async () => {
      setLoading(true)
      try {
        const data = await fetchAdminTimeline({ page: 0, size: 500 })
        const content = data?.content || []
        setAuditLogs(content.map((item) => ({
          id: item.id,
          action: item.activityType || 'STATUS_CHANGE',
          admin: item.changedBy || 'System',
          target: item.trackingNumber || `Complaint-${item.complaintId}`,
          details: [
            item.title,
            item.comment,
            item.publicSummary,
            item.oldStatus || item.newStatus ? `${item.oldStatus || 'N/A'} -> ${item.newStatus || 'N/A'}` : null,
            item.evidenceVerificationStatus ? `Integrity: ${item.evidenceVerificationStatus}` : null,
            item.evidenceReviewStatus ? `Review: ${item.evidenceReviewStatus}` : null,
            item.usedInInvestigation === true ? 'Used in investigation' : null,
            item.notificationChannels ? `Notified: ${item.notificationChannels}` : null
          ].filter(Boolean).join(' | '),
          ip: 'N/A',
          device: 'N/A',
          timestamp: item.timestamp ? new Date(item.timestamp).toLocaleString() : '-',
          status: 'success'
        })))
      } catch {
        setAuditLogs([])
      } finally {
        setLoading(false)
      }
    }

    loadTimeline()
  }, [])

  const actionTypes = [...new Set(auditLogs.map((log) => log.action))]

  const filteredLogs = useMemo(() => auditLogs.filter((log) => {
    if (
      searchTerm &&
      !log.admin.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.target.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.details.toLowerCase().includes(searchTerm.toLowerCase())
    ) return false
    if (filterAction && log.action !== filterAction) return false
    if (filterStatus && log.status !== filterStatus) return false
    return true
  }), [auditLogs, searchTerm, filterAction, filterStatus])

  const exportLogs = (format) => {
    if (filteredLogs.length === 0) return

    if (format === 'CSV') {
      const headers = ['Timestamp', 'Action', 'Admin', 'Target', 'Details', 'Status']
      const rows = filteredLogs.map((log) => [
        log.timestamp,
        log.action,
        log.admin,
        log.target,
        String(log.details).replaceAll(',', ';'),
        log.status
      ])
      const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'audit-logs.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    if (format === 'PDF') {
      window.print()
    }
  }

  const ActionBadge = ({ action }) => {
    const styles = {
      STATUS_CHANGE: 'bg-blue-100 text-blue-800'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[action] || 'bg-gray-100 text-gray-800'}`}>
        {String(action || 'UNKNOWN').replace(/_/g, ' ')}
      </span>
    )
  }

  const StatusIcon = ({ status }) => {
    return status === 'success'
      ? <CheckCircle className="w-4 h-4 text-green-600" />
      : <XCircle className="w-4 h-4 text-red-600" />
  }

  const stats = {
    totalActions: auditLogs.length,
    successful: auditLogs.filter((l) => l.status === 'success').length,
    failed: auditLogs.filter((l) => l.status === 'failed').length,
    uniqueAdmins: [...new Set(auditLogs.map((l) => l.admin))].length
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Actions</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalActions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Successful</p>
              <p className="text-xl font-bold text-gray-800">{stats.successful}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-xl font-bold text-gray-800">{stats.failed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Admins</p>
              <p className="text-xl font-bold text-gray-800">{stats.uniqueAdmins}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search admin, target, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Actions</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <button
            onClick={() => exportLogs('CSV')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => exportLogs('PDF')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Target</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Device</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">{log.admin}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-sm text-purple-600 font-medium">{log.target}</span></td>
                  <td className="px-4 py-3"><span className="text-sm text-gray-600 max-w-xs truncate block">{log.details}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-gray-400" />
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{log.ip}</code>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{log.device}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusIcon status={log.status} /></td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800">Immutable Audit Trail</h3>
            <p className="text-sm text-blue-600 mt-1">
              All administrative actions are permanently logged and cannot be modified or deleted.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuditLogs
