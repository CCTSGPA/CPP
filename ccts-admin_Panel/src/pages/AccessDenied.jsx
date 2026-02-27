import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldOff, ArrowLeft, Home } from 'lucide-react'

const AccessDenied = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-admin-darker to-purple-900 p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 mb-6">
          <ShieldOff className="w-12 h-12 text-red-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-gray-400 text-lg mb-8 max-w-md">
          You don't have permission to access this resource. This area is restricted to administrators only.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccessDenied
