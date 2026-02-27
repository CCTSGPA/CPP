import React, { useState } from 'react'
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  User,
  Building2,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Lock,
  Unlock,
  ChevronRight,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react'

const EscalationWorkflow = () => {
  const [escalationTiers] = useState([
    { level: 1, name: 'Department Officer', description: 'Initial handling by concerned department', sla: '48 hours', color: 'blue' },
    { level: 2, name: 'Department Head', description: 'Senior officer review', sla: '24 hours', color: 'yellow' },
    { level: 3, name: 'Vigilance Authority', description: 'High-level investigation', sla: '12 hours', color: 'red' }
  ])

  const [escalationCases, setEscalationCases] = useState([
    {
      id: 'CCTS-1247',
      title: 'Bribe demand by traffic officer',
      currentLevel: 1,
      status: 'in_progress',
      assignedTo: 'Officer Sharma',
      department: 'Police',
      createdAt: '2024-01-10',
      escalatedAt: '2024-01-12',
      history: [
        { level: 1, from: 'System', to: 'Officer Sharma', reason: 'Auto-assigned', timestamp: '2024-01-10 10:00:00' }
      ],
      locked: false,
      reopenCount: 0
    },
    {
      id: 'CCTS-1245',
      title: 'Fake certificate racket',
      currentLevel: 2,
      status: 'in_progress',
      assignedTo: 'ASP Mumbai',
      department: 'Education',
      createdAt: '2024-01-08',
      escalatedAt: '2024-01-11',
      history: [
        { level: 1, from: 'Officer Sharma', to: 'Dept Head', reason: 'Complexity increased', timestamp: '2024-01-10 14:00:00' },
        { level: 2, from: 'System', to: 'ASP Mumbai', reason: 'Auto-escalated', timestamp: '2024-01-11 10:00:00' }
      ],
      locked: false,
      reopenCount: 1
    },
    {
      id: 'CCTS-1239',
      title: 'Tax evasion in contract',
      currentLevel: 3,
      status: 'investigating',
      assignedTo: 'Vigilance Commissioner',
      department: 'Revenue',
      createdAt: '2024-01-05',
      escalatedAt: '2024-01-12',
      history: [
        { level: 1, from: 'System', to: 'Officer Kumar', reason: 'Auto-assigned', timestamp: '2024-01-05 09:00:00' },
        { level: 2, from: 'Officer Kumar', to: 'Dept Head', reason: 'Evidence found', timestamp: '2024-01-08 11:00:00' },
        { level: 3, from: 'Dept Head', to: 'Vigilance', reason: 'Cross-department involvement', timestamp: '2024-01-12 15:00:00' }
      ],
      locked: false,
      reopenCount: 0
    },
    {
      id: 'CCTS-1225',
      title: 'Medical supply manipulation',
      currentLevel: 3,
      status: 'resolved',
      assignedTo: 'Vigilance Commissioner',
      department: 'Health',
      createdAt: '2024-01-01',
      escalatedAt: '2024-01-08',
      resolvedAt: '2024-01-14',
      history: [
        { level: 1, from: 'System', to: 'Dr. Patel', reason: 'Auto-assigned', timestamp: '2024-01-01 10:00:00' },
        { level: 2, from: 'Dr. Patel', to: 'Health Secretary', reason: 'Major irregularity', timestamp: '2024-01-05 14:00:00' },
        { level: 3, from: 'Health Secretary', to: 'Vigilance', reason: 'Criminal angle detected', timestamp: '2024-01-08 09:00:00' }
      ],
      locked: true,
      reopenCount: 2
    }
  ])

  const [selectedCase, setSelectedCase] = useState(null)
  const [showReopenModal, setShowReopenModal] = useState(false)
  const [reopenReason, setReopenReason] = useState('')

  const escalateCase = (caseId) => {
    setEscalationCases(cases => cases.map(c => {
      if (c.id === caseId && c.currentLevel < 3) {
        const newLevel = c.currentLevel + 1
        const tier = escalationTiers.find(t => t.level === newLevel)
        return {
          ...c,
          currentLevel: newLevel,
          status: 'in_progress',
          escalatedAt: new Date().toISOString().split('T')[0],
          history: [...c.history, {
            level: newLevel,
            from: c.assignedTo,
            to: tier.name,
            reason: 'Manual escalation',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
          }]
        }
      }
      return c
    }))
  }

  const reopenCase = (caseId) => {
    if (!reopenReason) return
    setEscalationCases(cases => cases.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          status: 'reopened',
          locked: false,
          reopenCount: c.reopenCount + 1,
          history: [...c.history, {
            level: c.currentLevel,
            from: 'System',
            to: c.assignedTo,
            reason: `Reopened: ${reopenReason}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
          }]
        }
      }
      return c
    }))
    setShowReopenModal(false)
    setReopenReason('')
  }

  const lockCase = (caseId) => {
    setEscalationCases(cases => cases.map(c => 
      c.id === caseId ? { ...c, locked: true } : c
    ))
  }

  const getStatusBadge = (status, locked) => {
    if (locked) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">Locked</span>
    }
    const styles = {
      in_progress: 'bg-blue-100 text-blue-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      reopened: 'bg-orange-100 text-orange-800'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  const getLevelBadge = (level) => {
    const colors = {
      1: 'bg-blue-100 text-blue-800 border-blue-300',
      2: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      3: 'bg-red-100 text-red-800 border-red-300'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold border ${colors[level]}`}>
        Level {level}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tier Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {escalationTiers.map((tier) => (
          <div key={tier.level} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
            tier.level === 1 ? 'border-blue-500' : tier.level === 2 ? 'border-yellow-500' : 'border-red-500'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{tier.name}</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${tier.color}-100 text-${tier.color}-800`}>
                Level {tier.level}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{tier.description}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>SLA: {tier.sla}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowUpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Escalations</p>
              <p className="text-xl font-bold text-gray-800">{escalationCases.filter(c => c.status !== 'resolved').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Level 2 Cases</p>
              <p className="text-xl font-bold text-gray-800">{escalationCases.filter(c => c.currentLevel === 2).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Level 3 Cases</p>
              <p className="text-xl font-bold text-gray-800">{escalationCases.filter(c => c.currentLevel === 3).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-xl font-bold text-gray-800">{escalationCases.filter(c => c.status === 'resolved').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Cases */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Escalation Cases</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {escalationCases.map((caseItem) => (
            <div key={caseItem.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-purple-600">{caseItem.id}</span>
                    {getLevelBadge(caseItem.currentLevel)}
                    {getStatusBadge(caseItem.status, caseItem.locked)}
                  </div>
                  <h4 className="font-medium text-gray-800">{caseItem.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  {caseItem.currentLevel < 3 && !caseItem.locked && (
                    <button
                      onClick={() => escalateCase(caseItem.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      Escalate
                    </button>
                  )}
                  {caseItem.status === 'resolved' && caseItem.currentLevel === 3 && (
                    <button
                      onClick={() => { setSelectedCase(caseItem); setShowReopenModal(true); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
                    >
                      <Unlock className="w-4 h-4" />
                      Reopen
                    </button>
                  )}
                  {caseItem.status === 'resolved' && !caseItem.locked && (
                    <button
                      onClick={() => lockCase(caseItem.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
                    >
                      <Lock className="w-4 h-4" />
                      Lock
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Department</p>
                  <p className="font-medium flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {caseItem.department}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Assigned To</p>
                  <p className="font-medium flex items-center gap-1">
                    <User className="w-3 h-3" /> {caseItem.assignedTo}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Escalated At</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {caseItem.escalatedAt}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Reopen Count</p>
                  <p className="font-medium flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> {caseItem.reopenCount} times
                  </p>
                </div>
              </div>

              {/* Escalation Path */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Escalation Path:</p>
                <div className="flex items-center gap-2">
                  {caseItem.history.map((h, idx) => (
                    <React.Fragment key={idx}>
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                        <span className="font-medium">L{h.level}</span>
                        <span className="text-gray-500">→</span>
                      </div>
                      {idx < caseItem.history.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reopen Modal */}
      {showReopenModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Reopen Case</h2>
              <p className="text-sm text-gray-500">{selectedCase.id}</p>
            </div>
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Warning</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Only Super Admins can reopen resolved cases. This action will be logged.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Reopening
                </label>
                <textarea
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  rows="3"
                  placeholder="Enter reason for reopening this case..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button
                onClick={() => { setShowReopenModal(false); setReopenReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => reopenCase(selectedCase.id)}
                disabled={!reopenReason}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                Reopen Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EscalationWorkflow
