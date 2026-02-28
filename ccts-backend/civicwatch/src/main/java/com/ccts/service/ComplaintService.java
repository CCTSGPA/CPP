package com.ccts.service;

import com.ccts.dto.ComplaintRequest;
import com.ccts.dto.ComplaintResponse;
import com.ccts.exception.CustomException;
import com.ccts.model.Complaint;
import com.ccts.model.ComplaintStatus;
import com.ccts.model.User;
import com.ccts.repository.ComplaintRepository;
import com.ccts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for complaint operations
 */
@SuppressWarnings({"unused", "null"})
@Service
@RequiredArgsConstructor
public class ComplaintService {

    private static final int SLA_HOURS = 72;

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Submit a new complaint
     */
    @Transactional
    public ComplaintResponse submitComplaint(ComplaintRequest request, User user) {
        // Generate tracking number
        String trackingNumber = "CCTS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .accuracy(request.getAccuracy())
                .incidentDate(request.getIncidentDate())
                .respondentName(request.getRespondentName())
                .respondentDesignation(request.getRespondentDesignation())
                .respondentDepartment(request.getRespondentDepartment())
                .isAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false)
                .complainantName(request.getComplainantName())
                .complainantEmail(request.getComplainantEmail())
                .complainantPhone(request.getComplainantPhone())
                .aiSeverityScore(request.getAiSeverityScore())
                .aiSummary(request.getAiSummary())
                .status(ComplaintStatus.SUBMITTED)
                .user(user)
                .trackingNumber(trackingNumber)
                .build();

        complaintRepository.save(complaint);

        // Send notification for new complaint
        ComplaintResponse response = mapToResponse(complaint);
        notificationService.sendComplaintSubmittedNotification(response);

        return response;
    }

    /**
     * Get all complaints for a user
     */
    public List<ComplaintResponse> getUserComplaints(User user) {
        return complaintRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get paginated user complaints
     */
    public Page<ComplaintResponse> getUserComplaints(User user, Pageable pageable) {
        return complaintRepository.findByUser(user, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get complaint by ID
     */
    public ComplaintResponse getComplaintById(Long id, User user) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> CustomException.notFound("Complaint not found"));

        // Check if user is the owner or admin
        if (!complaint.getUser().getId().equals(user.getId()) && 
            user.getRole() != com.ccts.model.UserRole.ADMIN) {
            throw CustomException.forbidden("You are not authorized to view this complaint");
        }

        return mapToResponse(complaint);
    }

    /**
     * Update complaint status and send notification
     */
    @Transactional
    public ComplaintResponse updateComplaintStatus(Long id, ComplaintStatus newStatus, String notes) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> CustomException.notFound("Complaint not found"));

        complaint.setStatus(newStatus);
        if (notes != null && !notes.isEmpty()) {
            complaint.setAdminNotes(notes);
        }

        complaintRepository.save(complaint);
        ComplaintResponse response = mapToResponse(complaint);

        // Send status update notification
        notificationService.sendStatusUpdateNotification(response, newStatus.name(), notes);

        return response;
    }

    /**
     * Get complaint by tracking number
     */
    public ComplaintResponse getComplaintByTrackingNumber(String trackingNumber) {
        Complaint complaint = complaintRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> CustomException.notFound("Complaint not found with tracking number: " + trackingNumber));

        return mapToResponse(complaint);
    }

    /**
     * Public tracking response without PII exposure
     */
    public ComplaintResponse getComplaintByTrackingNumberPublic(String trackingNumber) {
        Complaint complaint = complaintRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> CustomException.notFound("Complaint not found with tracking number: " + trackingNumber));

        ComplaintResponse response = mapToResponse(complaint);
        response.setUserEmail(null);
        response.setUserName(null);
        response.setUserId(null);
        return response;
    }

    private LocalDateTime calculateSlaDeadline(Complaint complaint) {
        if (complaint.getCreatedAt() == null) {
            return null;
        }
        return complaint.getCreatedAt().plusHours(SLA_HOURS);
    }

    private boolean isSlaBreached(Complaint complaint) {
        LocalDateTime slaDeadline = calculateSlaDeadline(complaint);
        if (slaDeadline == null) {
            return false;
        }
        boolean terminalStatus = complaint.getStatus() == ComplaintStatus.RESOLVED || complaint.getStatus() == ComplaintStatus.REJECTED;
        return !terminalStatus && LocalDateTime.now().isAfter(slaDeadline);
    }

    /**
     * Map complaint entity to response DTO
     */
    private ComplaintResponse mapToResponse(Complaint complaint) {
        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .location(complaint.getLocation())
                .latitude(complaint.getLatitude())
                .longitude(complaint.getLongitude())
                .accuracy(complaint.getAccuracy())
                .incidentDate(complaint.getIncidentDate())
                .evidenceUrl(complaint.getEvidenceUrl())
                .respondentName(complaint.getRespondentName())
                .respondentDesignation(complaint.getRespondentDesignation())
                .respondentDepartment(complaint.getRespondentDepartment())
                .isAnonymous(complaint.getIsAnonymous())
                .complainantName(complaint.getComplainantName())
                .complainantEmail(complaint.getComplainantEmail())
                .complainantPhone(complaint.getComplainantPhone())
                .status(complaint.getStatus())
                .trackingNumber(complaint.getTrackingNumber())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .adminNotes(complaint.getAdminNotes())
                .aiSeverityScore(complaint.getAiSeverityScore())
                .aiSummary(complaint.getAiSummary())
                .slaDeadline(calculateSlaDeadline(complaint))
                .slaBreached(isSlaBreached(complaint))
                .escalationFlagged(isSlaBreached(complaint))
                .userId(complaint.getUser().getId())
                .userName(complaint.getUser().getName())
                .userEmail(complaint.getUser().getEmail())
                .assignedOfficerId(complaint.getAssignedOfficer() != null ? complaint.getAssignedOfficer().getId() : null)
                .assignedOfficerName(complaint.getAssignedOfficer() != null ? complaint.getAssignedOfficer().getName() : null)
                .build();
    }
}


