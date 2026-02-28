const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

const parseApiResponse = async (response) => {
  const text = await response.text()
  let payload = null
  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    payload = null
  }

  if (!response.ok) {
    const errorMessage = payload?.message || text || 'Request failed'
    throw new Error(errorMessage)
  }

  return payload?.data ?? payload
}

export const fetchAdminComplaints = async ({ page = 0, size = 500, status } = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (status) {
    params.set('status', status)
  }

  const response = await fetch(`/api/v1/admin/complaints?${params.toString()}`, {
    headers: getAuthHeaders()
  })

  return parseApiResponse(response)
}

export const fetchAdminComplaintById = async (id) => {
  const response = await fetch(`/api/v1/admin/complaints/${id}`, {
    headers: getAuthHeaders()
  })
  return parseApiResponse(response)
}

export const updateAdminComplaintStatus = async (id, status, adminNotes = null) => {
  const response = await fetch(`/api/v1/admin/complaints/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, adminNotes })
  })
  return parseApiResponse(response)
}

export const fetchAdminStatistics = async () => {
  const response = await fetch('/api/v1/admin/statistics', {
    headers: getAuthHeaders()
  })
  return parseApiResponse(response)
}

export const fetchAdminUserProfile = async (userId) => {
  const response = await fetch(`/api/v1/admin/users/${userId}/profile`, {
    headers: getAuthHeaders()
  })
  return parseApiResponse(response)
}

export const fetchAdminUserComplaints = async ({ userId, page = 0, size = 100 } = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  const response = await fetch(`/api/v1/admin/users/${userId}/complaints?${params.toString()}`, {
    headers: getAuthHeaders()
  })
  return parseApiResponse(response)
}

export const fetchAdminEvidence = async ({ page = 0, size = 500 } = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  const response = await fetch(`/api/v1/admin/evidence?${params.toString()}`, {
    headers: getAuthHeaders()
  })
  return parseApiResponse(response)
}

export const fetchAdminTimeline = async ({ page = 0, size = 500 } = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  const response = await fetch(`/api/v1/admin/timeline?${params.toString()}`, {
    headers: getAuthHeaders()
  })
  return parseApiResponse(response)
}

// ==================== PUBLIC ENDPOINTS (No Auth) ====================

export const fetchPublicTransparencyStats = async () => {
  const response = await fetch('/api/v1/public/transparency-stats')
  return parseApiResponse(response)
}

export const fetchPublicGeoHeatmap = async ({ category, department, dateFrom, dateTo } = {}) => {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (department) params.set('department', department)
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)
  
  const response = await fetch(`/api/v1/public/geo-heatmap?${params.toString()}`)
  return parseApiResponse(response)
}
