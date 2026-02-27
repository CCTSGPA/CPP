package com.ccts.controller;

import com.ccts.dto.AdminUserProfileResponse;
import com.ccts.dto.AdminUserSummaryResponse;
import com.ccts.dto.ApiResponse;
import com.ccts.dto.ComplaintResponse;
import com.ccts.dto.EvidenceMetadataResponse;
import com.ccts.dto.StatsResponse;
import com.ccts.dto.StatusUpdateRequest;
import com.ccts.dto.TimelineEntryResponse;
import com.ccts.model.ComplaintStatus;
import com.ccts.model.User;
import com.ccts.repository.UserRepository;
import com.ccts.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for admin endpoints
 * Base path: /api/v1/admin
 * Authorization: ADMIN role only
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    /**
     * Get all complaints (admin view) with optional status filter
     * GET /api/v1/admin/complaints?status=SUBMITTED&page=0&size=20
     */
    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getAllComplaints(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) ComplaintStatus status) {
        
        Page<ComplaintResponse> complaints;
        if (status != null) {
            complaints = adminService.getComplaintsByStatus(status, pageable);
        } else {
            complaints = adminService.getAllComplaints(pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Complaints retrieved successfully", complaints));
    }

    /**
     * Get a specific complaint by ID
     * GET /api/v1/admin/complaints/{id}
     */
    @GetMapping("/complaints/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(@PathVariable Long id) {
        ComplaintResponse response = adminService.getComplaintById(id);
        return ResponseEntity.ok(ApiResponse.success("Complaint retrieved successfully", response));
    }

    /**
     * Update complaint status
     * PUT /api/v1/admin/complaints/{id}/status
     */
    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaintStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User admin = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        ComplaintResponse response = adminService.updateComplaintStatus(id, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated", response));
    }

    /**
     * Assign complaint to officer
     * PUT /api/v1/admin/complaints/{id}/assign?officerId=2
     */
    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<ApiResponse<ComplaintResponse>> assignComplaint(
            @PathVariable Long id,
            @RequestParam Long officerId) {
        
        ComplaintResponse response = adminService.assignComplaintToOfficer(id, officerId);
        return ResponseEntity.ok(ApiResponse.success("Complaint assigned successfully", response));
    }

    /**
     * Get statistics
     * GET /api/v1/admin/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<StatsResponse>> getStats() {
        StatsResponse stats = adminService.getStats();
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved", stats));
    }

    /**
     * Get all users (admin view, paginated)
     * GET /api/v1/admin/users?page=0&size=20
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<AdminUserSummaryResponse>>> getAllUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<AdminUserSummaryResponse> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    /**
     * Get full user profile for admin visibility
     * GET /api/v1/admin/users/{userId}/profile
     */
    @GetMapping("/users/{userId}/profile")
    public ResponseEntity<ApiResponse<AdminUserProfileResponse>> getUserProfile(@PathVariable Long userId) {
        AdminUserProfileResponse profile = adminService.getUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved", profile));
    }

    /**
     * Get all complaints submitted by user
     * GET /api/v1/admin/users/{userId}/complaints?page=0&size=20
     */
    @GetMapping("/users/{userId}/complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getComplaintsByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ComplaintResponse> complaints = adminService.getComplaintsByUserId(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success("User complaints retrieved", complaints));
    }

    /**
     * Get evidence metadata from complaints
     * GET /api/v1/admin/evidence?page=0&size=20
     */
    @GetMapping("/evidence")
    public ResponseEntity<ApiResponse<Page<EvidenceMetadataResponse>>> getEvidence(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<EvidenceMetadataResponse> evidence = adminService.getEvidenceMetadata(pageable);
        return ResponseEntity.ok(ApiResponse.success("Evidence metadata retrieved", evidence));
    }

    /**
     * Get global timeline entries
     * GET /api/v1/admin/timeline?page=0&size=50
     */
    @GetMapping("/timeline")
    public ResponseEntity<ApiResponse<Page<TimelineEntryResponse>>> getTimeline(
            @PageableDefault(size = 50, sort = "timestamp") Pageable pageable) {
        Page<TimelineEntryResponse> timeline = adminService.getTimeline(pageable);
        return ResponseEntity.ok(ApiResponse.success("Timeline retrieved", timeline));
    }

    /**
     * Get timeline entries for a complaint
     * GET /api/v1/admin/complaints/{id}/timeline?page=0&size=20
     */
    @GetMapping("/complaints/{id}/timeline")
    public ResponseEntity<ApiResponse<Page<TimelineEntryResponse>>> getComplaintTimeline(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<TimelineEntryResponse> timeline = adminService.getTimelineByComplaintId(id, pageable);
        return ResponseEntity.ok(ApiResponse.success("Complaint timeline retrieved", timeline));
    }
}
