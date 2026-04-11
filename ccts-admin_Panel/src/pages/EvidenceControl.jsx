import React, { useEffect, useMemo, useState } from 'react'
import {
  FolderOpen,
  File,
  FileText,
  Image,
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Hash,
  Eye,
  ShieldCheck,
  ShieldAlert,
  RefreshCw
} from 'lucide-react'
import { fetchAdminComplaints, fetchAdminEvidence, uploadEvidenceForUser } from '../services/adminApi'

const FileTypeIcon = ({ type }) => {
  if (String(type || '').includes('image')) return <Image className="w-8 h-8 text-purple-500" />
  if (String(type || '').includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />
  return <File className="w-8 h-8 text-gray-500" />
}

const IntegrityBadge = ({ status }) => {
  const styles = {
    VERIFIED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    FAILED: 'bg-red-100 text-red-800',
    VERIFYING: 'bg-blue-100 text-blue-800',
    UNKNOWN: 'bg-gray-100 text-gray-800'
  }
  const icons = {
    VERIFIED: <CheckCircle className="w-3 h-3 mr-1" />,
    PENDING: <Clock className="w-3 h-3 mr-1" />,
    FAILED: <AlertTriangle className="w-3 h-3 mr-1" />,
    VERIFYING: <RefreshCw className="w-3 h-3 mr-1 animate-spin" />,
    UNKNOWN: <Clock className="w-3 h-3 mr-1" />
  }

  const resolved = status || 'UNKNOWN'

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[resolved] || styles.UNKNOWN}`}>
      {icons[resolved] || icons.UNKNOWN}
      {resolved}
    </span>
  )
}

const VirusScanBadge = ({ status }) => {
  const styles = {
    CLEAN: 'bg-green-100 text-green-800',
    SCANNING: 'bg-yellow-100 text-yellow-800',
    INFECTED: 'bg-red-100 text-red-800',
    UNKNOWN: 'bg-gray-100 text-gray-800'
  }

  const resolved = status || 'UNKNOWN'

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[resolved] || styles.UNKNOWN}`}>
      {resolved}
    </span>
  )
}

const EvidenceControl = () => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [targetUserId, setTargetUserId] = useState('')
  const [userOptions, setUserOptions] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadMessageType, setUploadMessageType] = useState('')

  const loadEvidence = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminEvidence({ page: 0, size: 500 })
      const content = data?.content || []
      setFiles(content.map((item, index) => ({
        id: item.id ?? index,
        name: item.fileName || `evidence-${item.complaintId}`,
        type: item.fileType || 'unknown',
        size: 0,
        uploadDate: item.uploadDate ? new Date(item.uploadDate).toLocaleString() : '-',
        complaintId: item.complaintTrackingNumber || String(item.complaintId || ''),
        sha256: item.sha256 || 'Not available',
        integrityStatus: item.integrityStatus || 'UNKNOWN',
        virusScanStatus: item.virusScanStatus || 'UNKNOWN',
        metadata: {
          fileUrl: item.fileUrl || 'Not available',
          complaintId: item.complaintId || '-',
          uploadDate: item.uploadDate ? new Date(item.uploadDate).toLocaleString() : '-'
        }
      })))
    } catch {
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const loadUserOptions = async () => {
    try {
      const complaintsPage = await fetchAdminComplaints({ page: 0, size: 500 })
      const complaintItems = complaintsPage?.content || []

      const uniqueUsers = new Map()
      complaintItems.forEach((item) => {
        if (!item?.userId) return
        if (!uniqueUsers.has(item.userId)) {
          uniqueUsers.set(item.userId, {
            id: String(item.userId),
            name: item.userName || 'Unknown User',
            email: item.userEmail || 'No email'
          })
        }
      })

      setUserOptions(Array.from(uniqueUsers.values()))
    } catch {
      setUserOptions([])
    }
  }

  useEffect(() => {
    loadEvidence()
    loadUserOptions()
  }, [])

  useEffect(() => {
    if (selectedUserId) {
      setTargetUserId(selectedUserId)
    }
  }, [selectedUserId])

  const handleUploadForUser = async () => {
    setUploadMessage('')
    setUploadMessageType('')
    if (!targetUserId || Number.isNaN(Number(targetUserId))) {
      setUploadMessage('Enter a valid numeric user ID.')
      setUploadMessageType('error')
      return
    }
    if (!uploadFile) {
      setUploadMessage('Select a PDF or image file to upload.')
      setUploadMessageType('error')
      return
    }

    setUploading(true)
    try {
      await uploadEvidenceForUser({ userId: targetUserId, file: uploadFile })
      setUploadMessage('Evidence uploaded successfully for user. User can view it in their Upload Evidence page.')
      setUploadMessageType('success')
      setUploadFile(null)
      await loadEvidence()
    } catch (err) {
      setUploadMessage(err?.message || 'Failed to upload evidence for user.')
      setUploadMessageType('error')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return 'N/A'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const filteredFiles = useMemo(() => files.filter((file) => {
    if (
      searchTerm &&
      !file.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !file.complaintId.toLowerCase().includes(searchTerm.toLowerCase())
    ) return false
    if (filterStatus && file.integrityStatus !== filterStatus) return false
    return true
  }), [files, searchTerm, filterStatus])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Send PDF/Image To User</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-end">
          <div className="min-w-0">
            <label className="block text-xs font-medium text-gray-600 mb-1">Select User</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Choose user by name/email</option>
              {userOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email}) - ID {user.id}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-medium text-gray-600 mb-1">User ID</label>
            <input
              type="number"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="e.g. 12"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-medium text-gray-600 mb-1">Evidence File</label>
            <input
              type="file"
              accept=".pdf,image/*,.txt"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="block w-full max-w-full px-3 py-2 border border-gray-200 rounded-lg text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-purple-50 file:text-purple-700"
            />
          </div>
          <button
            type="button"
            onClick={handleUploadForUser}
            disabled={uploading}
            className="w-full md:col-span-2 xl:col-span-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload For User'}
          </button>
        </div>
        {uploadMessage && (
          <p
            className={`mt-2 text-sm ${
              uploadMessageType === 'success' ? 'text-green-700' : 'text-red-600'
            }`}
          >
            {uploadMessage}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Files</p>
              <p className="text-xl font-bold text-gray-800">{files.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Verified</p>
              <p className="text-xl font-bold text-gray-800">{files.filter((f) => f.integrityStatus === 'VERIFIED').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-gray-800">{files.filter((f) => f.integrityStatus === 'PENDING').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Issues</p>
              <p className="text-xl font-bold text-gray-800">{files.filter((f) => f.integrityStatus === 'FAILED' || f.virusScanStatus === 'INFECTED').length}</p>
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
              placeholder="Search by filename or complaint ID..."
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
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="UNKNOWN">Unknown</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">File</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Complaint</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Integrity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Virus Scan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Upload Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileTypeIcon type={file.type} />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{file.name}</p>
                        <p className="text-xs text-gray-400">{file.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-purple-600 font-medium">{file.complaintId}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatFileSize(file.size)}</td>
                  <td className="px-4 py-3"><IntegrityBadge status={file.integrityStatus} /></td>
                  <td className="px-4 py-3"><VirusScanBadge status={file.virusScanStatus} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{file.uploadDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Download"
                        onClick={() => {
                          if (file.metadata.fileUrl && file.metadata.fileUrl !== 'Not available') {
                            window.open(file.metadata.fileUrl, '_blank', 'noopener,noreferrer')
                          }
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFiles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No complaints found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileTypeIcon type={selectedFile.type} />
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{selectedFile.name}</h2>
                  <p className="text-sm text-gray-500">{selectedFile.complaintId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="sr-only">Close</span>×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">File Size</p>
                  <p className="font-medium">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Upload Date</p>
                  <p className="font-medium">{selectedFile.uploadDate}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2"><Hash className="w-4 h-4" /> SHA-256 Hash</p>
                <div className="bg-gray-900 rounded-lg p-3">
                  <code className="text-green-400 text-xs font-mono break-all">{selectedFile.sha256}</code>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Integrity Status</p>
                  <IntegrityBadge status={selectedFile.integrityStatus} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Virus Scan Status</p>
                  <VirusScanBadge status={selectedFile.virusScanStatus} />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">File Metadata</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selectedFile.metadata).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-500 capitalize">{key}</p>
                        <p className="text-sm font-medium break-all">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  onClick={() => {
                    if (selectedFile.metadata.fileUrl && selectedFile.metadata.fileUrl !== 'Not available') {
                      window.open(selectedFile.metadata.fileUrl, '_blank', 'noopener,noreferrer')
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EvidenceControl
