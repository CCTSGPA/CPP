import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ComplaintManagement from './pages/ComplaintManagement'
import EvidenceControl from './pages/EvidenceControl'
import DepartmentRisk from './pages/DepartmentRisk'
import GeoIntelligence from './pages/GeoIntelligence'
import WhistleblowerVault from './pages/WhistleblowerVault'
import SecurityControls from './pages/SecurityControls'
import AuditLogs from './pages/AuditLogs'
import AdvancedAnalytics from './pages/AdvancedAnalytics'
import EscalationWorkflow from './pages/EscalationWorkflow'
import FormsManagement from './pages/FormsManagement'
import AccessDenied from './pages/AccessDenied'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          
          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/complaints" element={<ComplaintManagement />} />
              <Route path="/evidence" element={<EvidenceControl />} />
              <Route path="/departments" element={<DepartmentRisk />} />
              <Route path="/geo" element={<GeoIntelligence />} />
              <Route path="/security" element={<SecurityControls />} />
              <Route path="/analytics" element={<AdvancedAnalytics />} />
              <Route path="/escalation" element={<EscalationWorkflow />} />
              <Route path="/forms" element={<FormsManagement />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              
              {/* Super Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                <Route path="/whistleblower-vault" element={<WhistleblowerVault />} />
              </Route>
            </Route>
          </Route>
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  )
}

export default App
