import api from "./api";

/**
 * Upload evidence file
 * POST /api/v1/files/upload
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await api.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data; // Returns: { status, message, data: { url, filename, originalName } }
}

/**
 * Submit a new complaint
 * POST /api/v1/complaints
 */
export async function submitComplaint(complaintData) {
  // complaintData: { title, description, category, location, incidentDate, respondentName, etc. }
  const response = await api.post("/complaints", complaintData);
  return response.data; // Returns: { status, message, data: ComplaintResponse }
}

/**
 * Get all complaints for current user (paginated)
 * GET /api/client/my-complaints?page=0&size=10
 */
export async function getMyComplaints(page = 0, size = 10) {
  const response = await api.get(`/api/client/my-complaints?page=${page}&size=${size}`);
  return response.data; // Returns: { status, message, data: { content: [], pageNumber, pageSize, ... } }
}

/**
 * Get specific complaint by ID
 * GET /api/v1/complaints/{id}
 */
export async function getComplaintById(id) {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
}

/**
 * Track complaint by tracking number (public endpoint)
 * GET /api/v1/complaints/track/{trackingNumber}
 */
export async function trackComplaint(trackingNumber) {
  const response = await api.get(`/complaints/track/${trackingNumber}`);
  return response.data;
}

/**
 * Track complaint with timeline, activities, evidence, progress
 * GET /api/v1/complaints/track/{trackingNumber}/details
 */
export async function trackComplaintDetails(trackingNumber) {
  const response = await api.get(`/complaints/track/${trackingNumber}/details`);
  return response.data;
}

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get all complaints (admin view)
 * GET /api/v1/admin/complaints?status=SUBMITTED&page=0&size=20
 */
export async function getAllComplaints(page = 0, size = 20, status = null) {
  let url = `/admin/complaints?page=${page}&size=${size}`;
  if (status) {
    url += `&status=${status}`;
  }
  const response = await api.get(url);
  return response.data;
}

/**
 * Get specific complaint by ID (admin)
 * GET /api/v1/admin/complaints/{id}
 */
export async function getComplaintByIdAdmin(id) {
  const response = await api.get(`/admin/complaints/${id}`);
  return response.data;
}

/**
 * Update complaint status
 * PUT /api/v1/admin/complaints/{id}/status
 */
export async function updateComplaintStatus(id, status, rejectionReason = null) {
  const data = { status };
  if (rejectionReason) {
    data.rejectionReason = rejectionReason;
  }
  const response = await api.put(`/admin/complaints/${id}/status`, data);
  return response.data;
}

/**
 * Assign complaint to officer
 * PUT /api/v1/admin/complaints/{id}/assign?officerId=2
 */
export async function assignComplaintToOfficer(complaintId, officerId) {
  const response = await api.put(`/admin/complaints/${complaintId}/assign?officerId=${officerId}`);
  return response.data;
}

/**
 * Get statistics
 * GET /api/v1/admin/statistics
 */
export async function getStatistics() {
  const response = await api.get("/admin/statistics");
  return response.data;
}

// Keep legacy functions for backwards compatibility
export async function getAllComplaintsLegacy() {
  const response = await api.get("/admin/complaints");
  return response.data;
}

export async function updateComplaintStatusLegacy(id, data) {
  // Map old status format to new
  const statusMap = {
    OPEN: "SUBMITTED",
    IN_PROGRESS: "UNDER_REVIEW",
    CLOSED: "RESOLVED"
  };
  const newStatus = statusMap[data.status] || data.status;
  return updateComplaintStatus(id, newStatus);
}

// eslint-disable-next-line no-unused-vars
export async function assignDepartment(id, department) {
  // For now, this is handled differently in admin
  return { success: true };
}

export async function closeComplaint(id) {
  return updateComplaintStatus(id, "RESOLVED");
}
