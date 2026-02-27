package com.ccts.controller;

import com.ccts.dto.AdminComplaintUpdateRequest;
import com.ccts.dto.ApiResponse;
import com.ccts.dto.ComplaintResponse;
import com.ccts.dto.StatusUpdateRequest;
import com.ccts.exception.CustomException;
import com.ccts.model.ComplaintStatus;
import com.ccts.model.User;
import com.ccts.repository.UserRepository;
import com.ccts.service.AuthService;
import com.ccts.service.AdminService;
import com.ccts.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Compatibility routes for unified backend sync flows.
 * Keeps existing /api/v1 routes intact while adding /api/admin and /api/client aliases.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UnifiedSyncController {

    private final AdminService adminService;
    private final ComplaintService complaintService;
    private final AuthService authService;
    private final UserRepository userRepository;

    @GetMapping("/admin/complaints")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getAdminComplaints(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) ComplaintStatus status) {

        Page<ComplaintResponse> complaints = status == null
                ? adminService.getAllComplaints(pageable)
                : adminService.getComplaintsByStatus(status, pageable);

        return ResponseEntity.ok(ApiResponse.success("Complaints retrieved successfully", complaints));
    }

    @PutMapping("/admin/complaint/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateAdminComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AdminComplaintUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User admin = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> CustomException.notFound("Admin not found"));

        ComplaintResponse response = adminService.getComplaintById(id);

        if (request.getAssignedOfficer() != null) {
            response = adminService.assignComplaintToOfficer(id, request.getAssignedOfficer());
        }

        if (request.getStatus() != null || request.getAdminNotes() != null || request.getRejectionReason() != null) {
            StatusUpdateRequest statusUpdate = StatusUpdateRequest.builder()
                    .status(request.getStatus() != null ? request.getStatus() : response.getStatus())
                    .adminNotes(request.getAdminNotes())
                    .rejectionReason(request.getRejectionReason())
                    .build();
            response = adminService.updateComplaintStatus(id, statusUpdate, admin);
        }

        return ResponseEntity.ok(ApiResponse.success("Complaint updated", response));
    }

    @GetMapping("/client/my-complaints")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getClientComplaints(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {

        User user = authService.getUserByEmail(userDetails.getUsername());
        Page<ComplaintResponse> complaints = complaintService.getUserComplaints(user, pageable);
        return ResponseEntity.ok(ApiResponse.success("Complaints retrieved", complaints));
    }
}
