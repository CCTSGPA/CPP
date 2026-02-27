import React, { createContext, useContext, useState, useEffect } from 'react'

const AdminAuthContext = createContext(null)

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('adminToken'))

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminUser')
    if (token && storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin))
      } catch (e) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        setToken(null)
      }
    }
    setLoading(false)
  }, [token])

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      })

      const rawBody = await response.text()
      let parsedBody = null
      try {
        parsedBody = rawBody ? JSON.parse(rawBody) : null
      } catch {
        parsedBody = null
      }
      
      if (!response.ok) {
        const errorMessage = parsedBody?.message || rawBody || 'Login failed'
        throw new Error(errorMessage)
      }
      
      const data = parsedBody?.data ?? parsedBody
      if (!data || !data.token) {
        throw new Error('Invalid server response format')
      }
      
      const normalizedRole = String(data.role || '').toLowerCase()
      if (normalizedRole !== 'admin' && normalizedRole !== 'super_admin') {
        throw new Error('Access denied. Admin role required.')
      }
      
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminUser', JSON.stringify(data))
      setToken(data.token)
      setAdmin(data)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setToken(null)
    setAdmin(null)
  }

  const isAuthenticated = () => {
    return !!token && !!admin
  }

  const hasRole = (roles) => {
    if (!admin) return false
    const currentRole = String(admin.role || '').toLowerCase()
    if (Array.isArray(roles)) {
      return roles.map((role) => String(role).toLowerCase()).includes(currentRole)
    }
    return currentRole === String(roles).toLowerCase()
  }

  return (
    <AdminAuthContext.Provider value={{
      admin,
      token,
      loading,
      login,
      logout,
      isAuthenticated,
      hasRole
    }}>
      {children}
    </AdminAuthContext.Provider>
  )
}
