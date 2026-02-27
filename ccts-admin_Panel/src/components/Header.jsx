import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { Bell, Search, RefreshCw, Calendar, LogOut } from 'lucide-react'

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
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    setLastRefresh(new Date())
    window.location.reload()
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
          <button className="relative p-2 text-gray-500 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Time Display */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span className="text-sm text-gray-500">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
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
