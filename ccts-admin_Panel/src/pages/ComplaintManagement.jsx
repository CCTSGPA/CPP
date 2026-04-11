import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  XCircle,
  ChevronDown,
  RefreshCw,
  FileText,
  Shield,
  Calendar,
  Building2,
  User,
  ArrowUpCircle,
  Activity
} from 'lucide-react'
import {
  fetchAdminComplaints,
  fetchAdminComplaintTimeline,
  fetchAdminUserProfile,
  updateAdminComplaintStatus
} from '../services/adminApi'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const StatusBadge = ({ status }) => {
  const styles = {
    SUBMITTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    EVIDENCE_VERIFICATION_IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
    INVESTIGATION_STARTED: 'bg-violet-100 text-violet-800',
    APPROVED: 'bg-green-100 text-green-800',
    RESOLVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800'
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {String(status || '').replace(/_/g, ' ')}
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

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString()
}

const getSolvedDate = (complaint) => {
  const terminalStatuses = new Set(['RESOLVED', 'REJECTED'])
  if (!terminalStatuses.has(String(complaint?.status || ''))) {
    return null
  }
  return complaint?.solvedAt || complaint?.updatedAt || null
}

const getPriorityFromScore = (score) => {
  const value = Number(score || 0)
  if (value >= 80) return 'CRITICAL'
  if (value >= 60) return 'HIGH'
  if (value >= 40) return 'MEDIUM'
  return 'LOW'
}

const clampAiScore = (value) => Math.max(0, Math.min(100, Number(value || 0)))

const getAiRecommendation = (complaint, overrideScore = null) => {
  const score = overrideScore == null ? Number(complaint?.aiSeverityScore || 0) : clampAiScore(overrideScore)
  const currentProgress = Number(complaint?.progressPercentage || 0)

  if (score >= 80) {
    return {
      label: 'Escalate Now',
      status: 'UNDER_REVIEW',
      progressPercentage: Math.max(currentProgress, 35),
      publicMessage: 'AI recommendation applied: critical severity fast-tracked for immediate review.',
      adminNotes: 'AI score 80+ triggered immediate escalation by admin.',
      reason: 'Critical risk (AI score 80+)'
    }
  }

  if (score >= 60) {
    return {
      label: 'Fast-track',
      status: 'EVIDENCE_VERIFICATION_IN_PROGRESS',
      progressPercentage: Math.max(currentProgress, 45),
      publicMessage: 'AI recommendation applied: complaint moved to fast-track evidence verification.',
      adminNotes: 'AI score 60-79 moved complaint to fast-track queue.',
      reason: 'High risk (AI score 60-79)'
    }
  }

  return {
    label: 'Standard Queue',
    status: 'SUBMITTED',
    progressPercentage: Math.max(currentProgress, 15),
    publicMessage: 'AI recommendation applied: complaint retained in standard review queue.',
    adminNotes: 'AI score below 60 kept case in standard processing queue.',
    reason: 'Normal risk (AI score below 60)'
  }
}

const ComplaintManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const autoOpenedRef = useRef('')
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: '',
    userName: '',
    dateFrom: '',
    dateTo: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [aiActionFilter, setAiActionFilter] = useState('ALL')
  const [prioritizeByAiScore, setPrioritizeByAiScore] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedUserProfile, setSelectedUserProfile] = useState(null)
  const [complaintTimeline, setComplaintTimeline] = useState([])
  const [aiScoreOverride, setAiScoreOverride] = useState('')
  const [updateDraft, setUpdateDraft] = useState({
    status: 'SUBMITTED',
    adminNotes: '',
    publicMessage: '',
    progressPercentage: 10,
    evidenceVerificationStatus: 'RECEIVED',
    evidenceReviewStatus: 'UNDER_REVIEW',
    usedInInvestigation: false
  })

  const exportComplaints = () => {
    const headers = [
      'Tracking Number',
      'Title',
      'Status',
      'Department',
      'AI Severity Score',
      'Progress %',
      'SLA Deadline',
      'Submitted Date',
      'Solved Date'
    ]

    const rows = filteredComplaints.map((item) => [
      item.trackingNumber || item.id || '',
      item.title || '',
      item.status || '',
      item.respondentDepartment || '',
      item.aiSeverityScore ?? 0,
      item.progressPercentage ?? 0,
      item.slaDeadline ? new Date(item.slaDeadline).toISOString() : '',
      item.createdAt ? new Date(item.createdAt).toISOString() : '',
      getSolvedDate(item) ? new Date(getSolvedDate(item)).toISOString() : ''
    ])

    const escapeCsv = (value) => {
      const str = String(value ?? '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    link.href = url
    link.download = `complaints-export-${stamp}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportComplaintsPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' })
    const stamp = new Date().toLocaleString('en-US', { hour12: true })

    doc.setFontSize(14)
    doc.text('Complaint Management Report', 14, 14)
    doc.setFontSize(9)
    doc.text(`Generated: ${stamp}`, 14, 20)

    const body = filteredComplaints.map((item) => [
      item.trackingNumber || item.id || '-',
      item.title || '-',
      item.status || '-',
      item.respondentDepartment || '-',
      String(item.aiSeverityScore ?? 0),
      `${item.progressPercentage ?? 0}%`,
      item.slaDeadline ? new Date(item.slaDeadline).toLocaleDateString() : '-',
      formatDate(item.createdAt),
      formatDate(getSolvedDate(item))
    ])

    autoTable(doc, {
      startY: 26,
      head: [[
        'Tracking Number',
        'Title',
        'Status',
        'Department',
        'AI Score',
        'Progress',
        'SLA Deadline',
        'Submitted Date',
        'Solved Date'
      ]],
      body,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [109, 40, 217] }
    })

    const fileStamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    doc.save(`complaints-export-${fileStamp}.pdf`)
  }

  const loadComplaints = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await fetchAdminComplaints({ page: 0, size: 500 })
      setComplaints(data?.content || [])
    } catch (err) {
      setComplaints([])
      const message = err?.message || 'Unable to load complaints.'
      setLoadError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  useEffect(() => {
    if (loading || complaints.length === 0) return

    const complaintIdParam = searchParams.get('complaintId')
    const trackingNumberParam = searchParams.get('trackingNumber')

    if (!complaintIdParam && !trackingNumberParam) return

    const queryKey = `${complaintIdParam || ''}|${trackingNumberParam || ''}`
    if (autoOpenedRef.current === queryKey) return

    const targetComplaint = complaints.find((item) =>
      (complaintIdParam && String(item.id) === String(complaintIdParam)) ||
      (trackingNumberParam && String(item.trackingNumber || '').toLowerCase() === String(trackingNumberParam).toLowerCase())
    )

    if (targetComplaint) {
      autoOpenedRef.current = queryKey
      viewComplaintDetails(targetComplaint)
    }
  }, [loading, complaints, searchParams])

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedComplaint(null)
    setSelectedUserProfile(null)
    setComplaintTimeline([])
    setAiScoreOverride('')

    if (searchParams.get('complaintId') || searchParams.get('trackingNumber')) {
      setSearchParams({})
      autoOpenedRef.current = ''
    }
  }

  const filteredComplaints = complaints.filter(c => {
    const normalizedSearch = searchTerm.toLowerCase()
    const aiScore = Number(c.aiSeverityScore || 0)

    if (
      searchTerm &&
      !String(c.trackingNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
      !String(c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
      !String(c.userName || '').toLowerCase().includes(normalizedSearch)
    ) return false

    if (filters.status && c.status !== filters.status) return false
    if (filters.priority && getPriorityFromScore(c.aiSeverityScore) !== filters.priority) return false
    if (filters.department && c.respondentDepartment !== filters.department) return false
    if (filters.userName && !String(c.userName || '').toLowerCase().includes(filters.userName.toLowerCase())) return false

    if (aiActionFilter === 'ESCALATE_NOW' && aiScore < 80) return false
    if (aiActionFilter === 'FAST_TRACK' && (aiScore < 60 || aiScore >= 80)) return false
    if (aiActionFilter === 'STANDARD' && aiScore >= 60) return false

    if (filters.dateFrom) {
      const createdAt = c.createdAt ? new Date(c.createdAt) : null
      const fromDate = new Date(filters.dateFrom)
      if (!createdAt || Number.isNaN(createdAt.getTime()) || createdAt < fromDate) return false
    }

    if (filters.dateTo) {
      const createdAt = c.createdAt ? new Date(c.createdAt) : null
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999)
      if (!createdAt || Number.isNaN(createdAt.getTime()) || createdAt > toDate) return false
    }

    return true
  }).sort((a, b) => {
    if (!prioritizeByAiScore) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    }

    const aiDiff = Number(b.aiSeverityScore || 0) - Number(a.aiSeverityScore || 0)
    if (aiDiff !== 0) return aiDiff
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })

  const viewComplaintDetails = async (complaint) => {
    setSelectedComplaint(complaint)
    setAiScoreOverride(complaint?.aiSeverityScore ?? '')
    setUpdateDraft({
      status: complaint.status || 'SUBMITTED',
      adminNotes: '',
      publicMessage: '',
      progressPercentage: complaint.progressPercentage ?? 10,
      evidenceVerificationStatus: complaint.evidenceVerificationStatus || 'RECEIVED',
      evidenceReviewStatus: complaint.evidenceReviewStatus || 'UNDER_REVIEW',
      usedInInvestigation: !!complaint.evidenceUsedInInvestigation
    })

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

    try {
      const timeline = await fetchAdminComplaintTimeline({ complaintId: complaint.id, page: 0, size: 100 })
      setComplaintTimeline(timeline?.content || [])
    } catch {
      setComplaintTimeline([])
    }

    setShowDetailModal(true)
  }

  const updateStatus = async (complaintId, payload) => {
    try {
      const updated = await updateAdminComplaintStatus(complaintId, payload)
      setComplaints((prev) => prev.map(c => c.id === complaintId ? updated : c))
      setSelectedComplaint((prev) => prev && prev.id === complaintId ? updated : prev)

      try {
        const timeline = await fetchAdminComplaintTimeline({ complaintId, page: 0, size: 100 })
        setComplaintTimeline(timeline?.content || [])
      } catch {
        setComplaintTimeline([])
      }
    } catch {
      // keep current state
    }
  }

  const escalateCase = (complaintId) => {
    updateStatus(complaintId, {
      status: 'UNDER_REVIEW',
      publicMessage: 'Complaint under review',
      adminNotes: 'Escalated for immediate review',
      progressPercentage: 35
    })
  }

  const saveStatusUpdate = async () => {
    if (!selectedComplaint) return
    await updateStatus(selectedComplaint.id, {
      ...updateDraft,
      progressPercentage: Number(updateDraft.progressPercentage)
    })
  }

  const applyAiRecommendation = async () => {
    if (!selectedComplaint) return

    const hasOverride = aiScoreOverride !== '' && aiScoreOverride !== null
    const overrideScore = hasOverride ? clampAiScore(aiScoreOverride) : null
    const recommendation = getAiRecommendation(selectedComplaint, overrideScore)
    const noteWithOverride = hasOverride
      ? `${recommendation.adminNotes} Manual score override applied (${overrideScore}).`
      : recommendation.adminNotes

    setUpdateDraft((prev) => ({
      ...prev,
      status: recommendation.status,
      progressPercentage: recommendation.progressPercentage,
      publicMessage: recommendation.publicMessage,
      adminNotes: noteWithOverride
    }))

    await updateStatus(selectedComplaint.id, {
      ...updateDraft,
      status: recommendation.status,
      progressPercentage: recommendation.progressPercentage,
      publicMessage: recommendation.publicMessage,
      adminNotes: noteWithOverride
    })

    if (hasOverride) {
      setSelectedComplaint((prev) => prev ? { ...prev, aiSeverityScore: overrideScore } : prev)
      setComplaints((prev) => prev.map((item) => (
        item.id === selectedComplaint.id
          ? { ...item, aiSeverityScore: overrideScore }
          : item
      )))
    }
  }

  const hasOverrideValue = aiScoreOverride !== '' && aiScoreOverride !== null
  const effectiveAiScore = hasOverrideValue ? clampAiScore(aiScoreOverride) : Number(selectedComplaint?.aiSeverityScore || 0)
  const effectiveRecommendation = selectedComplaint ? getAiRecommendation(selectedComplaint, hasOverrideValue ? effectiveAiScore : null) : null

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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="text-sm text-red-700">
            <p className="font-semibold">Failed to load complaints</p>
            <p>{loadError}</p>
            {(loadError.toLowerCase().includes('401') || loadError.toLowerCase().includes('403') || loadError.toLowerCase().includes('unauthorized')) && (
              <p className="mt-1">Your admin session may have expired. Please logout and login again.</p>
            )}
          </div>
          <button
            onClick={loadComplaints}
            className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-1">Why AI Score is used</h3>
        <p className="text-sm text-blue-700">
          AI score helps triage complaints quickly: score 80+ gets immediate escalation, 60-79 gets fast-track review, and below 60 stays in standard queue. This reduces delay for high-risk complaints.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Complaint ID, title, or username..."
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
          <button
            onClick={exportComplaints}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={exportComplaintsPdf}
            className="flex items-center gap-2 px-4 py-2 border border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-6 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">All Status</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="EVIDENCE_VERIFICATION_IN_PROGRESS">Evidence Verification</option>
              <option value="INVESTIGATION_STARTED">Investigation Started</option>
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
              <option value="CRITICAL">Critical (AI score 80+)</option>
              <option value="HIGH">High (AI score 60-79)</option>
              <option value="MEDIUM">Medium (AI score 40-59)</option>
              <option value="LOW">Low (AI score 0-39)</option>
            </select>

            <input
              type="text"
              value={filters.userName}
              onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Filter by username"
            />

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

            <select
              value={aiActionFilter}
              onChange={(e) => setAiActionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="ALL">All AI Buckets</option>
              <option value="ESCALATE_NOW">Escalate Now (80+)</option>
              <option value="FAST_TRACK">Fast-track (60-79)</option>
              <option value="STANDARD">Standard Queue (&lt;60)</option>
            </select>

            <label className="px-3 py-2 border border-gray-200 rounded-lg text-sm flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={prioritizeByAiScore}
                onChange={(e) => setPrioritizeByAiScore(e.target.checked)}
              />
              Prioritize table by highest AI score first
            </label>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">AI Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Submitted Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Solved Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SLA</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredComplaints.map((complaint) => {
                const complaintAiScore = clampAiScore(complaint.aiSeverityScore)
                return (
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
                    <PriorityBadge priority={getPriorityFromScore(complaintAiScore)} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{complaint.respondentDepartment || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{complaint.userName || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            complaintAiScore > 75 ? 'bg-red-500' :
                            complaintAiScore > 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${complaintAiScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{complaintAiScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(complaint.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(getSolvedDate(complaint))}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${(complaint.slaBreached) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {complaint.slaDeadline ? new Date(complaint.slaDeadline).toLocaleDateString() : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 min-w-32">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600" style={{ width: `${Math.max(0, Math.min(100, complaint.progressPercentage || 0))}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500">{complaint.progressPercentage || 0}%</span>
                    </div>
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
                )
              })}
              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-sm text-gray-500">No complaints found.</td>
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
                onClick={closeDetailModal}
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
                  String(selectedComplaint.evidenceVerificationStatus || '').includes('VERIFIED')
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <Shield className="w-3 h-3 inline mr-1" />
                  Evidence: {selectedComplaint.evidenceVerificationStatus || 'RECEIVED'}
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
                            style={{ width: `${effectiveAiScore}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-gray-800">{effectiveAiScore}</span>
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
                        {selectedComplaint.slaDeadline ? new Date(selectedComplaint.slaDeadline).toLocaleString('en-US', { hour12: true }) : '-'}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">AI Recommended Action</p>
                      <p className="text-sm font-semibold text-purple-700">
                        {effectiveRecommendation?.label}
                      </p>
                      <p className="text-xs text-gray-600">{effectiveRecommendation?.reason}</p>
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
                    <div><span className="text-gray-500">Created:</span> <span className="font-medium">{selectedUserProfile.accountCreatedAt ? new Date(selectedUserProfile.accountCreatedAt).toLocaleString('en-US', { hour12: true }) : '-'}</span></div>
                    <div><span className="text-gray-500">Last Login:</span> <span className="font-medium">{selectedUserProfile.lastLoginAt ? new Date(selectedUserProfile.lastLoginAt).toLocaleString('en-US', { hour12: true }) : '-'}</span></div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">User profile not available.</div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={aiScoreOverride}
                    onChange={(e) => setAiScoreOverride(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="AI score override (0-100)"
                  />

                  <button
                    onClick={() => setAiScoreOverride(selectedComplaint.aiSeverityScore ?? '')}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Reset to original score ({selectedComplaint.aiSeverityScore || 0})
                  </button>

                  <button
                    onClick={applyAiRecommendation}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 md:col-span-2"
                  >
                    Apply AI Recommendation (Score {effectiveAiScore})
                  </button>

                  <select
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    value={updateDraft.status}
                    onChange={(e) => setUpdateDraft((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="EVIDENCE_VERIFICATION_IN_PROGRESS">Evidence Verification In Progress</option>
                    <option value="INVESTIGATION_STARTED">Investigation Started</option>
                    <option value="APPROVED">Approved</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  <select
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    value={updateDraft.evidenceVerificationStatus}
                    onChange={(e) => setUpdateDraft((prev) => ({ ...prev, evidenceVerificationStatus: e.target.value }))}
                  >
                    <option value="RECEIVED">Evidence Received</option>
                    <option value="HASH_VERIFIED">Evidence Hash Verified</option>
                    <option value="VERIFIED">Evidence Integrity Verified</option>
                    <option value="REJECTED">Evidence Rejected</option>
                  </select>

                  <select
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    value={updateDraft.evidenceReviewStatus}
                    onChange={(e) => setUpdateDraft((prev) => ({ ...prev, evidenceReviewStatus: e.target.value }))}
                  >
                    <option value="UNDER_REVIEW">Evidence Under Review</option>
                    <option value="ACCEPTED">Evidence Accepted</option>
                    <option value="REJECTED">Evidence Rejected</option>
                  </select>

                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={updateDraft.progressPercentage}
                    onChange={(e) => setUpdateDraft((prev) => ({ ...prev, progressPercentage: e.target.value }))}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="Progress %"
                  />

                  <input
                    value={updateDraft.publicMessage}
                    onChange={(e) => setUpdateDraft((prev) => ({ ...prev, publicMessage: e.target.value }))}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm md:col-span-2"
                    placeholder="Public activity summary visible to user"
                  />

                  <textarea
                    value={updateDraft.adminNotes}
                    onChange={(e) => setUpdateDraft((prev) => ({ ...prev, adminNotes: e.target.value }))}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm md:col-span-2"
                    rows={3}
                    placeholder="Internal admin notes (not publicly shown)"
                  />

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={updateDraft.usedInInvestigation}
                      onChange={(e) => setUpdateDraft((prev) => ({ ...prev, usedInInvestigation: e.target.checked }))}
                    />
                    Evidence used in investigation
                  </label>

                  <button
                    onClick={saveStatusUpdate}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                  >
                    Save Update
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
                  {complaintTimeline.length === 0 && (
                    <div className="text-sm text-gray-500">No activity entries yet.</div>
                  )}
                  {complaintTimeline.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{log.title || String(log.newStatus || '').replace(/_/g, ' ')}</p>
                        <p className="text-xs text-gray-500">by {log.changedBy || 'System'}</p>
                        <p className="text-xs text-gray-500">{log.publicSummary || log.comment || 'Update posted'}</p>
                      </div>
                      <span className="text-xs text-gray-400">{log.timestamp ? new Date(log.timestamp).toLocaleString('en-US', { hour12: true }) : '-'}</span>
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
