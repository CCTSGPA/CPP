package com.ccts.controller;

import com.ccts.dto.ApiResponse;
import com.ccts.dto.ComplaintRequest;
import com.ccts.dto.ComplaintResponse;
import com.ccts.model.User;
import com.ccts.service.AuthService;
import com.ccts.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for complaint endpoints (user-facing)
 * Base path: /api/v1/complaints
 */
@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;
    private final AuthService authService;

    /**
     * Submit a new complaint
     * POST /api/v1/complaints
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ComplaintResponse>> submitComplaint(
            @Valid @RequestBody ComplaintRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = authService.getUserByEmail(userDetails.getUsername());
        ComplaintResponse response = complaintService.submitComplaint(request, user);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint submitted successfully", response));
    }

    /**
     * Get all complaints for the authenticated user (paginated)
     * GET /api/v1/complaints/my?page=0&size=10
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getMyComplaints(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        
        User user = authService.getUserByEmail(userDetails.getUsername());
        Page<ComplaintResponse> complaints = complaintService.getUserComplaints(user, pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Complaints retrieved", complaints));
    }

    /**
     * Get a specific complaint by ID
     * GET /api/v1/complaints/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = authService.getUserByEmail(userDetails.getUsername());
        ComplaintResponse response = complaintService.getComplaintById(id, user);
        
        return ResponseEntity.ok(ApiResponse.success("Complaint retrieved successfully", response));
    }

    /**
     * Track complaint by tracking number (public endpoint)
     * GET /api/v1/complaints/track/{trackingNumber}
     */
    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> trackComplaint(
            @PathVariable String trackingNumber) {
        
        ComplaintResponse response = complaintService.getComplaintByTrackingNumberPublic(trackingNumber);
        
        return ResponseEntity.ok(ApiResponse.success("Complaint tracked successfully", response));
    }
}


