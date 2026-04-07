package com.ccts.service;

import com.ccts.dto.AdminUserProfileResponse;
import com.ccts.dto.AdminUserSummaryResponse;
import com.ccts.dto.ComplaintResponse;
import com.ccts.dto.EvidenceMetadataResponse;
import com.ccts.dto.StatsResponse;
import com.ccts.dto.StatusUpdateRequest;
import com.ccts.dto.TimelineEntryResponse;
import com.ccts.exception.CustomException;
import com.ccts.model.Complaint;
import com.ccts.model.ComplaintStatus;
import com.ccts.model.StatusHistory;
import com.ccts.model.User;
import com.ccts.model.UserRole;
import com.ccts.repository.ComplaintRepository;
import com.ccts.repository.StatusHistoryRepository;
import com.ccts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Arrays;

/**
 * Service for admin operations
 */
@SuppressWarnings("null")
@Service
@RequiredArgsConstructor
public class AdminService {

    private static final int SLA_HOURS = 72;
    private static final int HIGH_SEVERITY_THRESHOLD = 75;

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final NotificationService notificationService;

    /**
     * Get all complaints (admin view)
     */
    public Page<ComplaintResponse> getAllComplaints(Pageable pageable) {
        return complaintRepository.findAllComplaints(pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get complaints by status
     */
    public Page<ComplaintResponse> getComplaintsByStatus(ComplaintStatus status, Pageable pageable) {
        return complaintRepository.findByStatus(status, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get complaint by ID
     */
    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> CustomException.notFound("Complaint not found"));
        return mapToResponse(complaint);
    }

    public Page<AdminUserSummaryResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(user -> AdminUserSummaryResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .authProvider(user.getOauthProvider())
                        .accountCreatedAt(user.getCreatedAt())
                        .lastLoginAt(user.getLastLoginAt())
                        .enabled(user.isEnabled())
                        .build());
    }

    public Page<EvidenceMetadataResponse> getEvidenceMetadata(Pageable pageable) {
        return complaintRepository.findByEvidenceUrlIsNotNull(pageable)
                .map(this::mapToEvidenceMetadataResponse);
    }

    public Page<TimelineEntryResponse> getTimeline(Pageable pageable) {
        return statusHistoryRepository.findAll(pageable)
                .map(this::mapToTimelineResponse);
    }

    public Page<TimelineEntryResponse> getTimelineByComplaintId(Long complaintId, Pageable pageable) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> CustomException.notFound("Complaint not found"));

        List<StatusHistory> history = statusHistoryRepository.findByComplaintOrderByTimestampDesc(complaint);
        List<TimelineEntryResponse> mapped = history.stream().map(this::mapToTimelineResponse).toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), mapped.size());
        List<TimelineEntryResponse> pageContent = start >= mapped.size() ? List.of() : mapped.subList(start, end);
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, mapped.size());
    }

        public AdminUserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> CustomException.notFound("User not found"));

        long totalComplaints = complaintRepository.countByUser(user);

        return AdminUserProfileResponse.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .authProvider(user.getOauthProvider())
            .accountCreatedAt(user.getCreatedAt())
            .lastLoginAt(user.getLastLoginAt())
            .phone(user.getPhone())
            .department(user.getDepartment())
            .designation(user.getDesignation())
            .totalComplaints(totalComplaints)
            .build();
        }

        public Page<ComplaintResponse> getComplaintsByUserId(Long userId, Pageable pageable) {
        return complaintRepository.findByUserId(userId, pageable)
            .map(this::mapToResponse);
        }

    /**
     * Update complaint status
     */
    @Transactional
    public ComplaintResponse updateComplaintStatus(Long id, StatusUpdateRequest request, User admin) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> CustomException.notFound("Complaint not found"));

        ComplaintStatus oldStatus = complaint.getStatus();
        ComplaintStatus newStatus = request.getStatus();

        // Update complaint
        complaint.setStatus(newStatus);
        complaint.setProgressPercentage(resolveProgress(request.getProgressPercentage(), newStatus));
        if (request.getAdminNotes() != null) {
            complaint.setAdminNotes(request.getAdminNotes());
        }
        if (request.getRejectionReason() != null) {
            complaint.setRejectionReason(request.getRejectionReason());
        }
        if (request.getEvidenceVerificationStatus() != null) {
            complaint.setEvidenceVerificationStatus(request.getEvidenceVerificationStatus());
        }
        if (request.getEvidenceReviewStatus() != null) {
            complaint.setEvidenceReviewStatus(request.getEvidenceReviewStatus());
        }
        if (request.getUsedInInvestigation() != null) {
            complaint.setEvidenceUsedInInvestigation(request.getUsedInInvestigation());
        }

        complaintRepository.save(complaint);

        // Record status history
        StatusHistory history = StatusHistory.builder()
                .complaint(complaint)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(admin)
                .title(titleForStatus(newStatus))
            .activityType(activityTypeForStatus(newStatus))
                .comment(request.getAdminNotes())
                .publicSummary(request.getPublicMessage() != null ? request.getPublicMessage() : publicSummaryForStatus(newStatus))
                .visibleToUser(true)
                .progressPercentage(complaint.getProgressPercentage())
                .evidenceFileName(complaint.getEvidenceFileName())
                .evidenceVerificationStatus(complaint.getEvidenceVerificationStatus())
                .evidenceReviewStatus(complaint.getEvidenceReviewStatus())
                .usedInInvestigation(complaint.getEvidenceUsedInInvestigation())
            .notificationChannels(notificationService.getNotificationChannels(mapToResponse(complaint)))
                .timestamp(LocalDateTime.now())
                .build();
        
        statusHistoryRepository.save(history);
        
        // Send status update notification
        ComplaintResponse response = mapToResponse(complaint);
        notificationService.sendStatusUpdateNotification(response, newStatus.name(), request.getAdminNotes());
        
        return response;
    }

    /**
     * Assign complaint to officer
     */
    @Transactional
    public ComplaintResponse assignComplaintToOfficer(Long complaintId, Long officerId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> CustomException.notFound("Complaint not found"));

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> CustomException.notFound("Officer not found"));

        if (officer.getRole() != UserRole.OFFICER && officer.getRole() != UserRole.ADMIN) {
            throw CustomException.badRequest("User is not an officer");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        
        complaint.setAssignedOfficer(officer);
        complaint.setStatus(ComplaintStatus.UNDER_REVIEW);
        complaint.setProgressPercentage(Math.max(complaint.getProgressPercentage() != null ? complaint.getProgressPercentage() : 0, 40));
        
        complaintRepository.save(complaint);

        // Record status history
        StatusHistory history = StatusHistory.builder()
                .complaint(complaint)
                .oldStatus(oldStatus)
                .newStatus(ComplaintStatus.UNDER_REVIEW)
                .changedBy(officer)
                .title("Officer Assigned")
                .activityType("ASSIGNMENT")
                .comment("Assigned to officer: " + officer.getName())
                .publicSummary("Officer assigned to case")
                .visibleToUser(true)
                .progressPercentage(complaint.getProgressPercentage())
            .notificationChannels(notificationService.getNotificationChannels(mapToResponse(complaint)))
                .timestamp(LocalDateTime.now())
                .build();
        
        statusHistoryRepository.save(history);
        
        // Send assignment notification
        ComplaintResponse response = mapToResponse(complaint);
        notificationService.sendAssignmentNotification(response, officer.getName());
        
        return response;
    }

    /**
     * Get statistics
     */
    public StatsResponse getStats() {
        long totalComplaints = complaintRepository.count();
        long submittedCount = complaintRepository.countByStatus(ComplaintStatus.SUBMITTED);
        long underReviewCount = complaintRepository.countByStatus(ComplaintStatus.UNDER_REVIEW);
        long approvedCount = complaintRepository.countByStatus(ComplaintStatus.APPROVED);
        long rejectedCount = complaintRepository.countByStatus(ComplaintStatus.REJECTED);
        long resolvedCount = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        List<Complaint> allComplaints = complaintRepository.findAll();

        long slaBreaches = allComplaints.stream().filter(this::isSlaBreached).count();
        long highSeverity = allComplaints.stream()
            .filter(c -> c.getAiSeverityScore() != null && c.getAiSeverityScore() >= HIGH_SEVERITY_THRESHOLD)
            .count();
        double resolutionRate = totalComplaints == 0 ? 0.0 : ((double) resolvedCount / (double) totalComplaints) * 100.0;
        
        long totalUsers = userRepository.findByRole(UserRole.USER).size();
        long totalOfficers = userRepository.findByRole(UserRole.OFFICER).size();

        return StatsResponse.builder()
                .totalComplaints(totalComplaints)
                .submittedCount(submittedCount)
                .underReviewCount(underReviewCount)
                .approvedCount(approvedCount)
                .rejectedCount(rejectedCount)
                .resolvedCount(resolvedCount)
                .slaBreaches(slaBreaches)
                .highSeverity(highSeverity)
                .resolutionRate(resolutionRate)
                .totalUsers(totalUsers)
                .totalOfficers(totalOfficers)
                .build();
    }

    private LocalDateTime calculateSlaDeadline(Complaint complaint) {
        if (complaint.getCreatedAt() == null) {
            return null;
        }
        return complaint.getCreatedAt().plusHours(SLA_HOURS);
    }

    private EvidenceMetadataResponse mapToEvidenceMetadataResponse(Complaint complaint) {
        String evidenceUrl = complaint.getEvidenceUrl();
        String fileName = evidenceUrl;
        if (evidenceUrl != null) {
            int lastSlash = evidenceUrl.lastIndexOf('/');
            if (lastSlash >= 0 && lastSlash < evidenceUrl.length() - 1) {
                fileName = evidenceUrl.substring(lastSlash + 1);
            }
        }

        String fileType = null;
        if (fileName != null && fileName.contains(".")) {
            fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        }

        return EvidenceMetadataResponse.builder()
                .id(complaint.getId())
                .complaintId(complaint.getId())
                .complaintTrackingNumber(complaint.getTrackingNumber())
                .fileName(fileName)
                .fileType(fileType)
                .fileUrl(evidenceUrl)
                .uploadDate(complaint.getEvidenceUploadDate() != null ? complaint.getEvidenceUploadDate() : complaint.getCreatedAt())
                .integrityStatus(complaint.getEvidenceVerificationStatus())
                .virusScanStatus("NOT_AVAILABLE")
                .reviewStatus(complaint.getEvidenceReviewStatus())
                .usedInInvestigation(complaint.getEvidenceUsedInInvestigation())
                .sha256(complaint.getEvidenceSha256())
                .build();
    }

    private TimelineEntryResponse mapToTimelineResponse(StatusHistory history) {
        return TimelineEntryResponse.builder()
                .id(history.getId())
                .complaintId(history.getComplaint().getId())
                .trackingNumber(history.getComplaint().getTrackingNumber())
                .oldStatus(history.getOldStatus())
                .newStatus(history.getNewStatus())
                .changedBy(history.getChangedBy() != null ? history.getChangedBy().getName() : null)
                .title(history.getTitle())
                .comment(history.getComment())
                .publicSummary(history.getPublicSummary())
                .visibleToUser(history.getVisibleToUser())
                .activityType(history.getActivityType())
                .progressPercentage(history.getProgressPercentage())
                .evidenceFileName(history.getEvidenceFileName())
                .evidenceVerificationStatus(history.getEvidenceVerificationStatus())
                .evidenceReviewStatus(history.getEvidenceReviewStatus())
                .usedInInvestigation(history.getUsedInInvestigation())
                .notificationChannels(history.getNotificationChannels())
                .timestamp(history.getTimestamp())
                .build();
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
                .evidenceFileName(complaint.getEvidenceFileName())
                .evidenceUploadDate(complaint.getEvidenceUploadDate())
                .evidenceVerificationStatus(complaint.getEvidenceVerificationStatus())
                .evidenceReviewStatus(complaint.getEvidenceReviewStatus())
                .evidenceUsedInInvestigation(complaint.getEvidenceUsedInInvestigation())
                .evidenceSha256(complaint.getEvidenceSha256())
                .respondentName(complaint.getRespondentName())
                .respondentDesignation(complaint.getRespondentDesignation())
                .respondentDepartment(complaint.getRespondentDepartment())
                .status(complaint.getStatus())
                .trackingNumber(complaint.getTrackingNumber())
                .progressPercentage(complaint.getProgressPercentage() != null ? complaint.getProgressPercentage() : 0)
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .solvedAt(resolveSolvedAt(complaint))
                .adminNotes(complaint.getAdminNotes())
                .rejectionReason(complaint.getRejectionReason())
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

    private LocalDateTime resolveSolvedAt(Complaint complaint) {
        ComplaintStatus status = complaint.getStatus();
        if (status != ComplaintStatus.RESOLVED && status != ComplaintStatus.REJECTED) {
            return null;
        }

        return statusHistoryRepository
                .findFirstByComplaintIdAndNewStatusInOrderByTimestampDesc(
                        complaint.getId(),
                        Arrays.asList(ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED)
                )
                .map(StatusHistory::getTimestamp)
                .orElse(complaint.getUpdatedAt());
    }

    private Integer resolveProgress(Integer requestedProgress, ComplaintStatus status) {
        if (requestedProgress != null) {
            return Math.max(0, Math.min(100, requestedProgress));
        }
        return switch (status) {
            case SUBMITTED -> 10;
            case UNDER_REVIEW -> 35;
            case EVIDENCE_VERIFICATION_IN_PROGRESS -> 50;
            case INVESTIGATION_STARTED -> 65;
            case APPROVED -> 85;
            case REJECTED -> 100;
            case RESOLVED -> 100;
        };
    }

    private String titleForStatus(ComplaintStatus status) {
        return switch (status) {
            case SUBMITTED -> "Complaint Submitted";
            case UNDER_REVIEW -> "Under Review";
            case EVIDENCE_VERIFICATION_IN_PROGRESS -> "Evidence Verification in Progress";
            case INVESTIGATION_STARTED -> "Investigation Started";
            case APPROVED -> "Decision Made (Approved)";
            case REJECTED -> "Decision Made (Rejected)";
            case RESOLVED -> "Case Resolved";
        };
    }

    private String publicSummaryForStatus(ComplaintStatus status) {
        return switch (status) {
            case SUBMITTED -> "Complaint received";
            case UNDER_REVIEW -> "Complaint under review";
            case EVIDENCE_VERIFICATION_IN_PROGRESS -> "Evidence verification in progress";
            case INVESTIGATION_STARTED -> "Field investigation initiated";
            case APPROVED -> "Complaint approved";
            case REJECTED -> "Complaint rejected";
            case RESOLVED -> "Case resolved";
        };
    }

    private String activityTypeForStatus(ComplaintStatus status) {
        return switch (status) {
            case SUBMITTED -> "COMPLAINT_RECEIVED";
            case UNDER_REVIEW -> "UNDER_REVIEW";
            case EVIDENCE_VERIFICATION_IN_PROGRESS -> "EVIDENCE_REVIEW_STARTED";
            case INVESTIGATION_STARTED -> "FIELD_INVESTIGATION_INITIATED";
            case APPROVED, REJECTED -> "DECISION_PENDING_COMPLETED";
            case RESOLVED -> "CASE_RESOLVED";
        };
    }
}
