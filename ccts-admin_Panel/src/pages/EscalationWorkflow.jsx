import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpCircle,
  Clock,
  Building2,
  User,
  CheckCircle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { fetchAdminComplaints, updateAdminComplaintStatus } from '../services/adminApi'

const levelConfig = {
  1: { label: 'Department Officer', sla: '48 hours', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  2: { label: 'Department Head', sla: '24 hours', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  3: { label: 'Vigilance Authority', sla: '12 hours', color: 'bg-red-100 text-red-800 border-red-200' }
}

const getLevelFromComplaint = (item) => {
  const status = String(item?.status || '')
  const score = Number(item?.aiSeverityScore || 0)

  if (status === 'INVESTIGATION_STARTED' || status === 'APPROVED' || status === 'RESOLVED' || status === 'REJECTED' || score >= 75) {
    return 3
  }
  if (status === 'UNDER_REVIEW' || status === 'EVIDENCE_VERIFICATION_IN_PROGRESS' || score >= 50) {
    return 2
  }
  return 1
}

const getEscalationReason = (item) => {
  if (item?.slaBreached) return 'SLA breached'
  const score = Number(item?.aiSeverityScore || 0)
  if (score >= 80) return 'Critical AI severity score'
  if (score >= 60) return 'High AI severity score'
  return 'Pending review workload'
}

const StatusBadge = ({ status }) => {
  const styles = {
    SUBMITTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    EVIDENCE_VERIFICATION_IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
    INVESTIGATION_STARTED: 'bg-violet-100 text-violet-800',
    APPROVED: 'bg-green-100 text-green-800',
    RESOLVED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {String(status || '').replace(/_/g, ' ')}
    </span>
  )
}

const EscalationWorkflow = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')

  const loadComplaints = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAdminComplaints({ page: 0, size: 500 })
      setComplaints(data?.content || [])
    } catch (err) {
      setComplaints([])
      setError(err?.message || 'Unable to load escalation cases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  const escalationCases = useMemo(() => {
    return complaints
      .filter((item) => item.status !== 'RESOLVED' && item.status !== 'REJECTED')
      .map((item) => ({ ...item, escalationLevel: getLevelFromComplaint(item) }))
      .sort((a, b) => (b.aiSeverityScore || 0) - (a.aiSeverityScore || 0))
  }, [complaints])

  const stats = useMemo(() => {
    return {
      active: escalationCases.length,
      level2: escalationCases.filter((item) => item.escalationLevel === 2).length,
      level3: escalationCases.filter((item) => item.escalationLevel === 3).length,
      slaBreached: escalationCases.filter((item) => item.slaBreached).length
    }
  }, [escalationCases])

  const escalateCase = async (item) => {
    const currentStatus = String(item?.status || '')
    let nextPayload = null

    if (currentStatus === 'SUBMITTED') {
      nextPayload = {
        status: 'UNDER_REVIEW',
        publicMessage: 'Escalated to Department Head for faster review',
        adminNotes: 'Escalation Level 2 triggered by admin workflow',
        progressPercentage: Math.max(Number(item.progressPercentage || 0), 35)
      }
    } else if (currentStatus === 'UNDER_REVIEW' || currentStatus === 'EVIDENCE_VERIFICATION_IN_PROGRESS') {
      nextPayload = {
        status: 'INVESTIGATION_STARTED',
        publicMessage: 'Escalated to Vigilance Authority for investigation',
        adminNotes: 'Escalation Level 3 triggered by admin workflow',
        progressPercentage: Math.max(Number(item.progressPercentage || 0), 65)
      }
    }

    if (!nextPayload) return

    setSavingId(item.id)
    try {
      await updateAdminComplaintStatus(item.id, nextPayload)
      await loadComplaints()
    } catch (err) {
      setError(err?.message || 'Failed to escalate case')
    } finally {
      setSavingId(null)
    }
  }

  const autoEscalateRiskCases = async () => {
    const queue = escalationCases.filter((item) =>
      (item.slaBreached || Number(item.aiSeverityScore || 0) >= 80) &&
      (item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW' || item.status === 'EVIDENCE_VERIFICATION_IN_PROGRESS')
    )

    for (const item of queue) {
      // eslint-disable-next-line no-await-in-loop
      await escalateCase(item)
    }
  }

  const markResolved = async (item) => {
    setSavingId(item.id)
    try {
      await updateAdminComplaintStatus(item.id, {
        status: 'RESOLVED',
        publicMessage: 'Complaint resolved after escalation workflow actions',
        adminNotes: 'Resolved by escalation workflow',
        progressPercentage: 100
      })
      await loadComplaints()
    } catch (err) {
      setError(err?.message || 'Failed to resolve case')
    } finally {
      setSavingId(null)
    }
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
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-indigo-900 mb-2">Main work of Escalation Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-indigo-800">
          <div>
            <p className="font-semibold">1. Prioritize risk</p>
            <p>Uses AI severity score + SLA breach to identify complaints that need urgent attention.</p>
          </div>
          <div>
            <p className="font-semibold">2. Route to right authority</p>
            <p>Moves complaints from officer to department head and then vigilance authority based on level.</p>
          </div>
          <div>
            <p className="font-semibold">3. Prevent delay</p>
            <p>Auto-escalation pushes critical cases early so they are not stuck in normal queue.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Active Escalations</p>
          <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Level 2 Cases</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.level2}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Level 3 Cases</p>
          <p className="text-2xl font-bold text-red-700">{stats.level3}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">SLA Breached</p>
          <p className="text-2xl font-bold text-orange-700">{stats.slaBreached}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Escalation Cases</h3>
              <p className="text-sm text-gray-500">Cases prioritized by AI severity score, SLA breaches, and status.</p>
            </div>
            <button
              onClick={autoEscalateRiskCases}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              Auto Escalate Risk Cases
            </button>
          </div>
        </div>

        {escalationCases.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No active escalation cases.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {escalationCases.map((item) => {
              const level = item.escalationLevel
              const canEscalate = item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW' || item.status === 'EVIDENCE_VERIFICATION_IN_PROGRESS'

              return (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-purple-700">{item.trackingNumber || item.id}</span>
                        <span className={`px-2 py-1 rounded border text-xs font-medium ${levelConfig[level].color}`}>
                          Level {level} · {levelConfig[level].label}
                        </span>
                        <StatusBadge status={item.status} />
                        {item.slaBreached && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3" /> SLA Breached
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {item.respondentDepartment || 'Unspecified'}</div>
                        <div className="flex items-center gap-1"><User className="w-3 h-3" /> {item.userName || '-'}</div>
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> SLA: {levelConfig[level].sla}</div>
                        <div>AI Score: <span className="font-semibold">{item.aiSeverityScore || 0}</span></div>
                      </div>
                      <p className="mt-2 text-xs text-purple-700 font-medium">Escalation reason: {getEscalationReason(item)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {canEscalate && (
                        <button
                          onClick={() => escalateCase(item)}
                          disabled={savingId === item.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-60"
                        >
                          <ArrowUpCircle className="w-4 h-4" />
                          Escalate
                        </button>
                      )}
                      <button
                        onClick={() => markResolved(item)}
                        disabled={savingId === item.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-60"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default EscalationWorkflow
