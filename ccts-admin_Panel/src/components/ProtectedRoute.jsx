import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { admin, loading, isAuthenticated } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-admin-darker">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const currentRole = String(admin?.role || '').toLowerCase()
  const allowedRolesNormalized = Array.isArray(allowedRoles)
    ? allowedRoles.map((role) => String(role).toLowerCase())
    : []

  if (allowedRolesNormalized.length > 0 && !allowedRolesNormalized.includes(currentRole)) {
    return <Navigate to="/access-denied" replace />
  }

  return children || <Outlet />
}

export default ProtectedRoute
