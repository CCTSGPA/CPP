import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Building2,
  Map,
  Shield,
  LogOut,
  Bell,
  Settings,
  ChevronRight,
  BarChart3,
  History,
  ArrowUpCircle
} from 'lucide-react'

const Sidebar = () => {
  const { admin, logout } = useAdminAuth()
  const location = useLocation()

  const adminLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/complaints', label: 'Complaints', icon: FileText },
    { path: '/evidence', label: 'Evidence Control', icon: FolderOpen },
    { path: '/departments', label: 'Department Risk', icon: Building2 },
    { path: '/geo', label: 'Geo Intelligence', icon: Map },
    { path: '/escalation', label: 'Escalation Workflow', icon: ArrowUpCircle },
    { path: '/analytics', label: 'Advanced Analytics', icon: BarChart3 },
    { path: '/audit-logs', label: 'Audit Logs', icon: History },
    { path: '/security', label: 'Security Controls', icon: Shield },
  ]

  const superAdminLinks = [
    { path: '/whistleblower-vault', label: 'Whistleblower Vault', icon: Shield },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 sidebar-gradient flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">CCTS</h1>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Admin Info */}
      <div className="p-4 border-b border-white/10">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              {admin?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{admin?.username || 'Admin'}</p>
              <p className="text-gray-400 text-xs capitalize">{admin?.role?.replace('_', ' ') || 'Admin'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3">Main Menu</p>
        </div>
        
        <ul className="space-y-1 px-3">
          {adminLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <link.icon className={`w-5 h-5 ${isActive(link.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                <span className="text-sm font-medium">{link.label}</span>
                {isActive(link.path) && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {String(admin?.role || '').toLowerCase() === 'super_admin' && (
          <>
            <div className="px-3 mt-6 mb-2">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3">Super Admin</p>
            </div>
            <ul className="space-y-1 px-3">
              {superAdminLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive(link.path)
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <link.icon className={`w-5 h-5 ${isActive(link.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    <span className="text-sm font-medium">{link.label}</span>
                    {isActive(link.path) && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
