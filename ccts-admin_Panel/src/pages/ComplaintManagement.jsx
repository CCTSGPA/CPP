import React, { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  RefreshCw,
  FileText,
  Shield,
  Calendar,
  Building2,
  User,
  MessageSquare,
  ArrowUpCircle,
  Hash,
  Activity
} from 'lucide-react'
import {
  fetchAdminComplaints,
  fetchAdminUserProfile,
  updateAdminComplaintStatus
} from '../services/adminApi'

const StatusBadge = ({ status }) => {
  const styles = {
    SUBMITTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    RESOLVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    ESCALATED: 'bg-purple-100 text-purple-800'
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}

const PriorityBadge = ({ priority }) => {
  const colors = {
    LOW: 'text-green-600',
    MEDIUM: 'text-yellow-600',
    HIGH: 'text-orange-600',
    CRITICAL: 'text-red-600'
  }
  return (
    <span className={`font-semibold ${colors[priority] || 'text-gray-600'}`}>
      {priority}
    </span>
  )
}

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: '',
    dateFrom: '',
    dateTo: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedUserProfile, setSelectedUserProfile] = useState(null)

  useEffect(() => {
    const loadComplaints = async () => {
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

    loadComplaints()
  }, [])

  const filteredComplaints = complaints.filter(c => {
    if (
      searchTerm &&
      !String(c.trackingNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
      !String(c.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) return false
    if (filters.status && c.status !== filters.status) return false
    if (filters.department && c.respondentDepartment !== filters.department) return false
    return true
  })

  const viewComplaintDetails = async (complaint) => {
    setSelectedComplaint(complaint)
    if (complaint?.userId) {
      try {
        const profile = await fetchAdminUserProfile(complaint.userId)
        setSelectedUserProfile(profile)
      } catch {
        setSelectedUserProfile(null)
      }
    } else {
      setSelectedUserProfile(null)
    }
    setShowDetailModal(true)
  }

  const updateStatus = async (complaintId, newStatus) => {
    try {
      const updated = await updateAdminComplaintStatus(complaintId, newStatus)
      setComplaints((prev) => prev.map(c => c.id === complaintId ? updated : c))
      setSelectedComplaint((prev) => prev && prev.id === complaintId ? updated : prev)
    } catch {
      // keep current state
    }
  }

  const escalateCase = (complaintId) => {
    updateStatus(complaintId, 'UNDER_REVIEW')
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
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Complaint ID or Anonymous Token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">All Status</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">All Priority</option>
            </select>

            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">All Departments</option>
              {[...new Set(complaints.map((item) => item.respondentDepartment).filter(Boolean))].map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="From Date"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="To Date"
            />
          </div>
        )}
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">AI Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SLA</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800">{complaint.trackingNumber || complaint.id}</p>
                      <p className="text-xs text-gray-400">User ID: {complaint.userId || '-'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-800 max-w-xs truncate">{complaint.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={
                      complaint.aiSeverityScore >= 80 ? 'CRITICAL' :
                      complaint.aiSeverityScore >= 60 ? 'HIGH' :
                      complaint.aiSeverityScore >= 40 ? 'MEDIUM' : 'LOW'
                    } />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{complaint.respondentDepartment || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            (complaint.aiSeverityScore || 0) > 75 ? 'bg-red-500' :
                            (complaint.aiSeverityScore || 0) > 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${complaint.aiSeverityScore || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{complaint.aiSeverityScore || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${(complaint.slaBreached) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {complaint.slaDeadline ? new Date(complaint.slaDeadline).toLocaleDateString() : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewComplaintDetails(complaint)}
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => escalateCase(complaint.id)}
                        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded"
                        title="Escalate"
                      >
                        <ArrowUpCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No complaints found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedComplaint.trackingNumber || selectedComplaint.id}</h2>
                <p className="text-sm text-gray-500">User: {selectedComplaint.userName || '-'}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Priority */}
              <div className="flex flex-wrap gap-3">
                <StatusBadge status={selectedComplaint.status} />
                <PriorityBadge priority={selectedComplaint.priority} />
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedComplaint.evidenceIntegrity === 'VERIFIED' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <Shield className="w-3 h-3 inline mr-1" />
                  Evidence: {selectedComplaint.evidenceIntegrity}
                </span>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Complaint Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Complaint Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Title</p>
                      <p className="text-sm font-medium">{selectedComplaint.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm">{selectedComplaint.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {selectedComplaint.respondentDepartment || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date Filed</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {selectedComplaint.createdAt ? new Date(selectedComplaint.createdAt).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm">{selectedComplaint.location}</p>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> AI Analysis
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {complaints.length === 0 && (
                      <p className="text-sm text-gray-500">No AI insights available yet.</p>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Severity Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full"
                            style={{ width: `${selectedComplaint.aiSeverityScore || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-gray-800">{selectedComplaint.aiSeverityScore || 0}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duplicate Risk</p>
                      <p className="text-sm">0% similarity with existing cases</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">AI Summary</p>
                      <p className="text-sm">{selectedComplaint.aiSummary || 'No AI insights available yet.'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">SLA Deadline</p>
                      <p className="text-sm font-medium text-orange-600">
                        {selectedComplaint.slaDeadline ? new Date(selectedComplaint.slaDeadline).toLocaleString() : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Profile */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> User Profile
                </h3>
                {selectedUserProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4 text-sm">
                    <div><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedUserProfile.name}</span></div>
                    <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedUserProfile.email}</span></div>
                    <div><span className="text-gray-500">Role:</span> <span className="font-medium">{selectedUserProfile.role}</span></div>
                    <div><span className="text-gray-500">Provider:</span> <span className="font-medium">{selectedUserProfile.authProvider || 'local'}</span></div>
                    <div><span className="text-gray-500">Created:</span> <span className="font-medium">{selectedUserProfile.accountCreatedAt ? new Date(selectedUserProfile.accountCreatedAt).toLocaleString() : '-'}</span></div>
                    <div><span className="text-gray-500">Last Login:</span> <span className="font-medium">{selectedUserProfile.lastLoginAt ? new Date(selectedUserProfile.lastLoginAt).toLocaleString() : '-'}</span></div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">User profile not available.</div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <select
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    value={selectedComplaint.status}
                    onChange={(e) => updateStatus(selectedComplaint.id, e.target.value)}
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  <select
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    value={selectedComplaint.priority}
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="CRITICAL">Critical</option>
                  </select>

                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                    Add Note
                  </button>

                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
                    Assign Officer
                  </button>

                  {!selectedComplaint.escalationFlagged && (
                    <button 
                      onClick={() => escalateCase(selectedComplaint.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                    >
                      Escalate Case
                    </button>
                  )}
                </div>
              </div>

              {/* Activity Log */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">Activity Log</h3>
                <div className="space-y-3">
                  {[
                    { action: 'Status changed to IN_PROGRESS', user: 'Admin User', time: '2 hours ago' },
                    { action: 'Assigned to Officer Sharma', user: 'System', time: '3 hours ago' },
                    { action: 'Evidence uploaded', user: 'Complainant', time: '5 hours ago' },
                    { action: 'Complaint filed', user: 'System', time: '1 day ago' }
                  ].map((log, index) => (
                    <div key={index} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{log.action}</p>
                        <p className="text-xs text-gray-500">by {log.user}</p>
                      </div>
                      <span className="text-xs text-gray-400">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComplaintManagement
