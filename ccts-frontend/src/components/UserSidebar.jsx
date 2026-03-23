import React, { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { isAuthenticated, getUserFromToken, clearAuthToken } from '../services/authService'
import {
  Home,
  FileText,
  Eye,
  Upload,
  Download,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight
} from 'lucide-react'

const UserSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(() => 
    isAuthenticated() ? getUserFromToken() : null
  )

  useEffect(() => {
    // Listen for auth changes
    const handleAuthChanged = () => {
      setUser(isAuthenticated() ? getUserFromToken() : null)
    }

    window.addEventListener('authChanged', handleAuthChanged)
    return () => window.removeEventListener('authChanged', handleAuthChanged)
  }, [])

  const userLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/file-complaint', label: 'File Complaint', icon: FileText },
    { path: '/complaint-history', label: 'Complaint History', icon: Eye },
    { path: '/upload-evidence', label: 'Upload Evidence', icon: Upload },
    { path: '/download-forms', label: 'Download Forms', icon: Download },
  ]

  const resourceLinks = [
    { path: '/departments', label: 'Departments', icon: Settings },
    { path: '/guidelines', label: 'Guidelines', icon: HelpCircle },
    { path: '/faqs', label: 'FAQs', icon: HelpCircle },
    { path: '/help', label: 'Help & Support', icon: HelpCircle },
    { path: '/about', label: 'About Us', icon: Shield },
    { path: '/contact', label: 'Contact Us', icon: Shield },
  ]

  const handleLogout = () => {
    clearAuthToken()
    setUser(null)
    setOpen(false)
    window.dispatchEvent(new Event('authChanged'))
    navigate('/')
  }

  const getUserLabel = () => {
    if (user?.name?.trim()) {
      return user.name.trim().split(" ")[0]
    }

    if (user?.email?.includes("@")) {
      return user.email.split("@")[0]
    }

    return "User"
  }

  const isActive = (path) => location.pathname === path

  const renderNavLink = (link) => {
    const active = isActive(link.path)
    const IconComponent = link.icon
    
    return (
      <li key={link.path}>
        <NavLink
          to={link.path}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 group ${
            active
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
              : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-pink-600/10'
          }`}
        >
          <IconComponent className={`w-5 h-5 transition-transform duration-300 ${
            active ? 'text-white scale-110' : 'text-gray-400 group-hover:text-white group-hover:scale-110'
          }`} />
          <span className="text-sm font-semibold flex-1 tracking-wide">{link.label}</span>
          {active && (
            <ChevronRight className="w-4 h-4 text-white" />
          )}
        </NavLink>
      </li>
    )
  }

  const sidebarContent = (
    <>
      {/* Logo - Enhanced */}
      <div className="p-6 border-b border-purple-800/40 bg-gradient-to-b from-purple-900/50 to-transparent">
        <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3 hover:opacity-90 transition-all duration-300 group">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-xl group-hover:shadow-pink-500/50 transition-all duration-300">
            <Shield className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-wider">CCTS</h1>
            <p className="text-gray-400 text-xs font-medium">Secure Shield</p>
          </div>
        </Link>
      </div>

      {/* User Info - Enhanced */}
      {isAuthenticated() && user ? (
        <div className="p-4 border-b border-purple-800/40 bg-gradient-to-b from-purple-800/20 to-transparent">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-3.5 border border-purple-600/30 hover:border-pink-600/50 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {getUserLabel()?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {getUserLabel()}
                </p>
                <p className="text-gray-400 text-xs truncate">{user?.email || 'User'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Navigation - Enhanced */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-3">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest px-2 py-1">Main Menu</p>
        </div>

        <ul className="space-y-1.5 px-3">
          {userLinks.map(renderNavLink)}
        </ul>

        <div className="px-4 mt-6 mb-3">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest px-2 py-1">Resources</p>
        </div>

        <ul className="space-y-1.5 px-3">
          {resourceLinks.map(renderNavLink)}
        </ul>
      </nav>

      {/* Bottom Actions - Enhanced */}
      <div className="p-4 border-t border-purple-800/40 bg-gradient-to-t from-purple-900/30 to-transparent">
        {isAuthenticated() ? (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-lg text-gray-300 hover:text-red-300 hover:bg-red-500/15 transition-all duration-300 font-semibold active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        ) : (
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 font-semibold active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex-col z-40 border-r border-purple-700/30 shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-4 py-2 flex items-center justify-between shadow-lg shadow-purple-500/50">
        <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white/25 flex items-center justify-center group-hover:bg-white/35 transition-all duration-300 shadow-lg">
            <Shield className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold tracking-wide">CCTS</div>
            <div className="text-xs opacity-90 font-medium">Secure Shield</div>
          </div>
        </Link>
        
        <button
          onClick={() => setOpen(!open)}
          className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 active:scale-95"
          aria-label="Toggle menu"
        >
          {open ? (
            <X size={24} className="transition-transform duration-200" />
          ) : (
            <Menu size={24} className="transition-transform duration-200" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed top-14 left-0 bottom-0 w-64 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex flex-col z-40 shadow-2xl border-r border-purple-700/30 overflow-hidden transition-all duration-300">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}

export default UserSidebar
