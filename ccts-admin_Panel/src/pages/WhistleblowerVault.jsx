import React, { useState } from 'react'
import {
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  Lock,
  Unlock,
  Clock,
  User,
  FileText,
  RefreshCw,
  Key,
  History,
  AlertCircle
} from 'lucide-react'

const WhistleblowerVault = () => {
  const [whistleblowers, setWhistleblowers] = useState([
    {
      id: 1,
      complaintId: 'CCTS-1246',
      token: 'ANON-3K9P5N',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+91 98765 43210',
      identityRevealed: true,
      revealTimestamp: '2024-01-15 10:30:00',
      revealedBy: 'Admin SuperUser',
      status: 'protected'
    },
    {
      id: 2,
      complaintId: 'CCTS-1244',
      token: 'ANON-5L1W4Q',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+91 87654 32109',
      identityRevealed: false,
      revealTimestamp: null,
      revealedBy: null,
      status: 'protected'
    },
    {
      id: 3,
      complaintId: 'CCTS-1238',
      token: 'ANON-1M3N7R',
      name: 'Mike Johnson',
      email: 'mike.j@email.com',
      phone: '+91 76543 21098',
      identityRevealed: true,
      revealTimestamp: '2024-01-10 14:20:00',
      revealedBy: 'Admin Senior',
      status: 'compromised'
    },
    {
      id: 4,
      complaintId: 'CCTS-1232',
      token: 'ANON-9K2P4S',
      name: 'Sarah Williams',
      email: 'sarah.w@email.com',
      phone: '+91 65432 10987',
      identityRevealed: false,
      revealTimestamp: null,
      revealedBy: null,
      status: 'protected'
    },
    {
      id: 5,
      complaintId: 'CCTS-1225',
      token: 'ANON-6H8J2V',
      name: 'Robert Brown',
      email: 'r.brown@email.com',
      phone: '+91 54321 09876',
      identityRevealed: true,
      revealTimestamp: '2024-01-08 09:15:00',
      revealedBy: 'Admin SuperUser',
      status: 'protected'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [revealedIds, setRevealedIds] = useState([1, 3, 5])
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'Identity Revealed', user: 'Admin SuperUser', target: 'John Doe', timestamp: '2024-01-15 10:30:00', ip: '192.168.1.100' },
    { id: 2, action: 'Identity Revealed', user: 'Admin Senior', target: 'Mike Johnson', timestamp: '2024-01-10 14:20:00', ip: '192.168.1.101' },
    { id: 3, action: 'Identity Revealed', user: 'Admin SuperUser', target: 'Robert Brown', timestamp: '2024-01-08 09:15:00', ip: '192.168.1.100' },
    { id: 4, action: 'Identity Access Attempt', user: 'Admin User', target: 'Jane Smith', timestamp: '2024-01-12 16:45:00', ip: '192.168.1.102', result: 'DENIED' },
  ])

  const [selectedWhistleblower, setSelectedWhistleblower] = useState(null)

  const filteredWhistleblowers = whistleblowers.filter(wb => {
    if (searchTerm && !wb.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !wb.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !wb.token.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (filterStatus && wb.status !== filterStatus) return false
    return true
  })

  const revealIdentity = (id) => {
    setRevealedIds([...revealedIds, id])
    const wb = whistleblowers.find(w => w.id === id)
    const newLog = {
      id: auditLogs.length + 1,
      action: 'Identity Revealed',
      user: 'Current Admin',
      target: wb.name,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ip: '192.168.1.100'
    }
    setAuditLogs([newLog, ...auditLogs])
    setWhistleblowers(whistleblowers.map(w => 
      w.id === id ? { ...w, identityRevealed: true, revealTimestamp: newLog.timestamp, revealedBy: 'Current Admin' } : w
    ))
  }

  const StatusBadge = ({ status }) => {
    const styles = {
      protected: 'bg-green-100 text-green-800',
      compromised: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 text-white">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Restricted Access - Whistleblower Identity Vault</h3>
            <p className="text-sm opacity-90">Only Super Admins can access this section. All access is logged and audited.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Whistleblowers</p>
              <p className="text-xl font-bold text-gray-800">{whistleblowers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Protected</p>
              <p className="text-xl font-bold text-gray-800">{whistleblowers.filter(w => w.status === 'protected').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Compromised</p>
              <p className="text-xl font-bold text-gray-800">{whistleblowers.filter(w => w.status === 'compromised').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Identities Revealed</p>
              <p className="text-xl font-bold text-gray-800">{whistleblowers.filter(w => w.identityRevealed).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Whistleblower List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filter */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, complaint ID, or token..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">All Status</option>
                <option value="protected">Protected</option>
                <option value="compromised">Compromised</option>
              </select>
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Whistleblower</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Complaint</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Identity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredWhistleblowers.map((wb) => (
                    <tr key={wb.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{wb.name}</p>
                            <p className="text-xs text-gray-400">{wb.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-purple-600">{wb.complaintId}</p>
                        <p className="text-xs text-gray-400">{wb.token}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={wb.status} />
                      </td>
                      <td className="px-4 py-3">
                        {revealedIds.includes(wb.id) ? (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <Unlock className="w-4 h-4" />
                            Revealed
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Lock className="w-4 h-4" />
                            Encrypted
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedWhistleblower(wb)}
                            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!revealedIds.includes(wb.id) ? (
                            <button
                              onClick={() => revealIdentity(wb.id)}
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                              title="Reveal Identity"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              className="p-1.5 text-gray-400 cursor-not-allowed"
                              disabled
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <History className="w-4 h-4" /> Audit Log
            </h3>
            <button className="text-purple-600 text-sm hover:text-purple-700">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-1">
                  <p className={`text-sm font-medium ${log.result === 'DENIED' ? 'text-red-600' : 'text-gray-800'}`}>
                    {log.action}
                  </p>
                  <span className="text-xs text-gray-400">{log.timestamp.split(' ')[1]}</span>
                </div>
                <p className="text-xs text-gray-500">
                  by <span className="font-medium">{log.user}</span>
                </p>
                <p className="text-xs text-gray-400">
                  Target: {log.target} • IP: {log.ip}
                </p>
                {log.result && (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                    log.result === 'DENIED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {log.result}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedWhistleblower && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Whistleblower Details</h2>
                  <p className="text-sm text-gray-500">{selectedWhistleblower.complaintId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWhistleblower(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedWhistleblower.status} />
                {revealedIds.includes(selectedWhistleblower.id) ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <Unlock className="w-4 h-4" /> Identity Revealed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Lock className="w-4 h-4" /> Identity Encrypted
                  </span>
                )}
              </div>

              {/* Identity Info */}
              {revealedIds.includes(selectedWhistleblower.id) ? (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800 mb-3">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="font-semibold">Identity Revealed</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-green-600">Name</p>
                        <p className="font-medium">{selectedWhistleblower.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-600">Email</p>
                        <p className="font-medium">{selectedWhistleblower.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-600">Phone</p>
                        <p className="font-medium">{selectedWhistleblower.phone}</p>
                      </div>
                    </div>
                  </div>
                  {selectedWhistleblower.revealTimestamp && (
                    <div className="text-xs text-gray-500">
                      <p>Revealed by: {selectedWhistleblower.revealedBy}</p>
                      <p>Timestamp: {selectedWhistleblower.revealTimestamp}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Identity Encrypted</p>
                  <p className="text-sm text-gray-500">Click the reveal button to decrypt identity information</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {!revealedIds.includes(selectedWhistleblower.id) && (
                  <button
                    onClick={() => revealIdentity(selectedWhistleblower.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Unlock className="w-4 h-4" />
                    Reveal Identity
                  </button>
                )}
                <button
                  onClick={() => setSelectedWhistleblower(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    Revealing whistleblower identity is a serious action. This will be logged in the audit trail and may compromise the whistleblower's safety.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WhistleblowerVault
