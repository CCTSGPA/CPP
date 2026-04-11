import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { Bell, Search, RefreshCw, Calendar, LogOut } from 'lucide-react'
import { fetchAdminTimeline, fetchAdminComplaints } from '../services/adminApi'

const pageTitles = {
  '/dashboard': 'Dashboard Overview',
  '/complaints': 'Complaint Management',
  '/evidence': 'Evidence Control Panel',
  '/departments': 'Department Risk Monitoring',
  '/geo': 'Geo Intelligence',
  '/whistleblower-vault': 'Whistleblower Identity Vault',
  '/security': 'Security Controls',
  '/analytics': 'Advanced Analytics',
  '/escalation': 'Escalation Workflow',
  '/audit-logs': 'Audit & Compliance Logs',
}

const Header = () => {
  const { admin, logout } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [readNotifications, setReadNotifications] = useState({})
  const [notificationFilter, setNotificationFilter] = useState('all')
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const notificationMenuRef = useRef(null)
  const readStorageKey = `adminReadNotifications:${admin?.username || 'default'}`
  const seenComplaintStorageKey = `adminSeenComplaints:${admin?.username || 'default'}`
  const [seenComplaintIds, setSeenComplaintIds] = useState([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const onClickOutside = (event) => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(readStorageKey)
      setReadNotifications(stored ? JSON.parse(stored) : {})
    } catch {
      setReadNotifications({})
    }
  }, [readStorageKey])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(seenComplaintStorageKey)
      const parsed = stored ? JSON.parse(stored) : []
      setSeenComplaintIds(Array.isArray(parsed) ? parsed : [])
    } catch {
      setSeenComplaintIds([])
    }
  }, [seenComplaintStorageKey])

  useEffect(() => {
    localStorage.setItem(readStorageKey, JSON.stringify(readNotifications))
  }, [readNotifications, readStorageKey])

  useEffect(() => {
    localStorage.setItem(seenComplaintStorageKey, JSON.stringify(seenComplaintIds))
  }, [seenComplaintIds, seenComplaintStorageKey])

  const handleRefresh = () => {
    setLastRefresh(new Date())
    window.location.reload()
  }

  const loadNotifications = async () => {
    setLoadingNotifications(true)
    try {
      const [timeline, complaintsPage] = await Promise.all([
        fetchAdminTimeline({ page: 0, size: 50, sort: 'timestamp,desc' }),
        fetchAdminComplaints({ page: 0, size: 100 })
      ])

      const timelineItems = timeline?.content || timeline || []
      const complaintItems = complaintsPage?.content || []
      const complaintIds = complaintItems.map((item) => String(item.id)).filter(Boolean)

      let syntheticNewComplaintNotifications = []

      if (seenComplaintIds.length > 0) {
        syntheticNewComplaintNotifications = complaintItems
          .filter((item) => item?.id != null && !seenComplaintIds.includes(String(item.id)))
          .map((item) => ({
            id: `new-${item.id}`,
            complaintId: item.id,
            title: 'New Complaint Submitted',
            activityType: 'COMPLAINT_SUBMITTED',
            trackingNumber: item.trackingNumber,
            publicSummary: `${item.userName || 'Citizen'} filed a new complaint${item.respondentDepartment ? ` for ${item.respondentDepartment}` : ''}.`,
            timestamp: item.createdAt || new Date().toISOString()
          }))
      }

      const combined = [...syntheticNewComplaintNotifications, ...timelineItems].sort((a, b) => {
        const tsA = new Date(a?.timestamp || 0).getTime()
        const tsB = new Date(b?.timestamp || 0).getTime()
        return tsB - tsA
      })

      setNotifications(combined)
      setSeenComplaintIds((prev) => Array.from(new Set([...prev, ...complaintIds])))
    } catch {
      setNotifications([])
    } finally {
      setLoadingNotifications(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    const timer = setInterval(() => {
      loadNotifications()
    }, 20000)
    return () => clearInterval(timer)
  }, [])

  const getNotificationTitle = (item) => {
    if (item?.activityType === 'COMPLAINT_SUBMITTED') {
      return `New complaint filed${item?.trackingNumber ? `: ${item.trackingNumber}` : ''}`
    }
    if (item?.title) {
      return item.title
    }
    return String(item?.newStatus || '').replace(/_/g, ' ') || 'Status Update'
  }

  const getNotificationSummary = (item) => {
    if (item?.activityType === 'COMPLAINT_SUBMITTED') {
      return item?.publicSummary || 'A new complaint has been submitted and is awaiting review.'
    }
    return item?.publicSummary || item?.comment || 'A complaint update was posted.'
  }

  const getNotificationKey = (item) => item.id || `${item.timestamp || 'na'}-${item.newStatus || item.title || 'status'}`

  const markNotificationAsRead = (item) => {
    const key = getNotificationKey(item)
    setReadNotifications((prev) => ({ ...prev, [key]: true }))
  }

  const openNotificationComplaint = (item) => {
    markNotificationAsRead(item)
    setShowNotifications(false)

    const complaintId = item?.complaintId
    const trackingNumber = item?.trackingNumber
    if (complaintId != null) {
      navigate(`/complaints?complaintId=${encodeURIComponent(complaintId)}`)
      return
    }
    if (trackingNumber) {
      navigate(`/complaints?trackingNumber=${encodeURIComponent(trackingNumber)}`)
    }
  }

  const markAllAsRead = () => {
    const next = { ...readNotifications }
    notifications.forEach((item) => {
      next[getNotificationKey(item)] = true
    })
    setReadNotifications(next)
  }

  const unreadCount = notifications.filter((item) => !readNotifications[getNotificationKey(item)]).length
  const readCount = Math.max(notifications.length - unreadCount, 0)

  const filteredNotifications = notifications.filter((item) => {
    const isRead = !!readNotifications[getNotificationKey(item)]
    if (notificationFilter === 'read') return isRead
    if (notificationFilter === 'unread') return !isRead
    return true
  })

  const toggleNotifications = async () => {
    const next = !showNotifications
    setShowNotifications(next)
    if (next) {
      await loadNotifications()
    }
  }

  const pageTitle = pageTitles[location.pathname] || 'Admin Panel'

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{pageTitle}</h2>
          <p className="text-sm text-gray-500">
            Welcome back, <span className="font-semibold text-purple-600">{admin?.username}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationMenuRef}>
            <button
              onClick={toggleNotifications}
              className="relative p-2 text-gray-500 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Notifications</p>
                  <div className="flex items-center gap-3">
                    <button onClick={markAllAsRead} className="text-xs text-gray-600 hover:underline">
                      Mark all read
                    </button>
                    <button onClick={loadNotifications} className="text-xs text-purple-600 hover:underline">
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="px-4 py-2 border-b bg-white flex items-center gap-2">
                  <button
                    onClick={() => setNotificationFilter('all')}
                    className={`px-2.5 py-1 rounded-full text-xs ${notificationFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotificationFilter('unread')}
                    className={`px-2.5 py-1 rounded-full text-xs ${notificationFilter === 'unread' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    onClick={() => setNotificationFilter('read')}
                    className={`px-2.5 py-1 rounded-full text-xs ${notificationFilter === 'read' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Read ({readCount})
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {loadingNotifications && (
                    <div className="px-4 py-3 text-sm text-gray-500">Loading notifications...</div>
                  )}
                  {!loadingNotifications && filteredNotifications.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">No notifications found.</div>
                  )}
                  {!loadingNotifications && filteredNotifications.map((item) => {
                    const key = getNotificationKey(item)
                    const isRead = !!readNotifications[key]
                    return (
                    <button
                      key={key}
                      onClick={() => openNotificationComplaint(item)}
                      className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 ${isRead ? 'bg-white' : 'bg-purple-50/40'}`}
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {getNotificationTitle(item)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getNotificationSummary(item)}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-[11px] text-gray-400">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString('en-US', { hour12: true }) : 'Just now'}
                        </p>
                        {!isRead && <span className="text-[10px] text-purple-700 font-semibold">Unread</span>}
                      </div>
                    </button>
                  )})}
                </div>
              </div>
            )}
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span className="text-sm text-gray-500">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
