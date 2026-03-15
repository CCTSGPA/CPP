package com.ccts.service;

import com.ccts.dto.ComplaintRequest;
import com.ccts.dto.ComplaintResponse;
import com.ccts.dto.ComplaintTrackingDetailsResponse;
import com.ccts.dto.EvidenceMetadataResponse;
import com.ccts.dto.TimelineEntryResponse;
import com.ccts.exception.CustomException;
import com.ccts.model.Complaint;
import com.ccts.model.ComplaintStatus;
import com.ccts.model.StatusHistory;
import com.ccts.model.User;
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
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.ArrayList;

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
    private final StatusHistoryRepository statusHistoryRepository;
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
                .evidenceUrl(request.getEvidenceUrl())
                .evidenceFileName(request.getEvidenceFileName())
                .evidenceSha256(request.getEvidenceSha256())
                .evidenceUploadDate(request.getEvidenceUrl() != null ? LocalDateTime.now() : null)
                .evidenceVerificationStatus(request.getEvidenceUrl() != null ? "RECEIVED" : null)
                .evidenceReviewStatus(request.getEvidenceUrl() != null ? "UNDER_REVIEW" : null)
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
                .progressPercentage(10)
                .user(user)
                .trackingNumber(trackingNumber)
                .build();

        complaintRepository.save(complaint);

        // Send notification for new complaint
        ComplaintResponse response = mapToResponse(complaint);

        createTimelineEntry(
            complaint,
            null,
            ComplaintStatus.SUBMITTED,
            user,
            "Complaint Submitted",
            "COMPLAINT_SUBMITTED",
            "Complaint submitted",
            "Complaint has been received by the system.",
            10,
            true
        );

        if (complaint.getEvidenceUrl() != null) {
            createTimelineEntry(
                complaint,
                ComplaintStatus.SUBMITTED,
                ComplaintStatus.SUBMITTED,
                user,
                "Evidence Uploaded",
                "EVIDENCE_UPLOADED",
                "Evidence uploaded successfully",
                "Evidence received and queued for integrity verification.",
                15,
                true
            );
            complaint.setProgressPercentage(15);
            complaintRepository.save(complaint);
            response = mapToResponse(complaint);
        }

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

    public ComplaintTrackingDetailsResponse getComplaintTrackingDetails(String trackingNumber) {
        Complaint complaint = complaintRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> CustomException.notFound("Complaint not found with tracking number: " + trackingNumber));

        ComplaintResponse response = mapToResponse(complaint);
        List<TimelineEntryResponse> timeline = statusHistoryRepository
                .findByComplaintIdAndVisibleToUserTrueOrderByTimestampDesc(complaint.getId())
                .stream()
                .map(this::mapTimeline)
                .collect(Collectors.toList());

        List<TimelineEntryResponse> activities = timeline.stream()
                .filter(item -> item.getPublicSummary() != null && !item.getPublicSummary().isBlank())
                .collect(Collectors.toList());

        return ComplaintTrackingDetailsResponse.builder()
                .complaint(response)
                .timeline(timeline)
                .activities(activities)
                .evidence(buildEvidenceItems(complaint))
                .progressPercentage(complaint.getProgressPercentage() != null ? complaint.getProgressPercentage() : 0)
                .build();
    }

    public ComplaintResponse updateComplaintEvidence(Long complaintId,
                                                     String evidenceVerificationStatus,
                                                     String evidenceReviewStatus,
                                                     Boolean usedInInvestigation,
                                                     User changedBy,
                                                     String publicSummary) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> CustomException.notFound("Complaint not found"));

        complaint.setEvidenceVerificationStatus(evidenceVerificationStatus != null ? evidenceVerificationStatus : complaint.getEvidenceVerificationStatus());
        complaint.setEvidenceReviewStatus(evidenceReviewStatus != null ? evidenceReviewStatus : complaint.getEvidenceReviewStatus());
        if (usedInInvestigation != null) {
            complaint.setEvidenceUsedInInvestigation(usedInInvestigation);
        }

        Integer progress = complaint.getProgressPercentage() != null ? complaint.getProgressPercentage() : 0;
        if ("HASH_VERIFIED".equalsIgnoreCase(complaint.getEvidenceVerificationStatus())) {
            progress = Math.max(progress, 25);
        }
        if ("UNDER_REVIEW".equalsIgnoreCase(complaint.getEvidenceReviewStatus())) {
            progress = Math.max(progress, 35);
        }
        if (Boolean.TRUE.equals(complaint.getEvidenceUsedInInvestigation())) {
            progress = Math.max(progress, 45);
        }
        complaint.setProgressPercentage(progress);

        complaintRepository.save(complaint);

        createTimelineEntry(
                complaint,
                complaint.getStatus(),
                complaint.getStatus(),
                changedBy,
                "Evidence Processing Update",
                "EVIDENCE_MONITORING",
                publicSummary != null ? publicSummary : "Evidence processing update",
                "Evidence status updated.",
                complaint.getProgressPercentage(),
                true
        );

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
        List<TimelineEntryResponse> timeline = statusHistoryRepository.findByComplaintIdAndVisibleToUserTrueOrderByTimestampDesc(complaint.getId())
            .stream()
            .map(this::mapTimeline)
            .collect(Collectors.toList());

        List<TimelineEntryResponse> activitySummaries = timeline.stream()
            .filter(item -> item.getPublicSummary() != null && !item.getPublicSummary().isBlank())
            .collect(Collectors.toList());

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
                .isAnonymous(complaint.getIsAnonymous())
                .complainantName(complaint.getComplainantName())
                .complainantEmail(complaint.getComplainantEmail())
                .complainantPhone(complaint.getComplainantPhone())
                .status(complaint.getStatus())
                .trackingNumber(complaint.getTrackingNumber())
                .progressPercentage(complaint.getProgressPercentage() != null ? complaint.getProgressPercentage() : 0)
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
                .timeline(timeline)
                .activitySummaries(activitySummaries)
                .evidenceItems(buildEvidenceItems(complaint))
                .build();
    }

    private TimelineEntryResponse mapTimeline(StatusHistory history) {
        return TimelineEntryResponse.builder()
                .id(history.getId())
                .complaintId(history.getComplaint().getId())
                .trackingNumber(history.getComplaint().getTrackingNumber())
                .oldStatus(history.getOldStatus())
                .newStatus(history.getNewStatus())
                .changedBy(history.getChangedBy() != null ? history.getChangedBy().getName() : "System")
                .title(history.getTitle())
                // Only expose public summaries to complainants.
                .comment(null)
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

    private List<EvidenceMetadataResponse> buildEvidenceItems(Complaint complaint) {
        List<EvidenceMetadataResponse> items = new ArrayList<>();
        if (complaint.getEvidenceUrl() == null || complaint.getEvidenceUrl().isBlank()) {
            return items;
        }

        String fileName = complaint.getEvidenceFileName() != null ? complaint.getEvidenceFileName() : complaint.getEvidenceUrl();
        String fileType = null;
        if (fileName.contains(".")) {
            fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        }

        items.add(EvidenceMetadataResponse.builder()
                .id(complaint.getId())
                .complaintId(complaint.getId())
                .complaintTrackingNumber(complaint.getTrackingNumber())
                .fileName(fileName)
                .fileType(fileType)
                .fileUrl(complaint.getEvidenceUrl())
                .uploadDate(complaint.getEvidenceUploadDate() != null ? complaint.getEvidenceUploadDate() : complaint.getCreatedAt())
                .integrityStatus(complaint.getEvidenceVerificationStatus())
                .virusScanStatus("NOT_AVAILABLE")
                .reviewStatus(complaint.getEvidenceReviewStatus())
                .usedInInvestigation(complaint.getEvidenceUsedInInvestigation())
                .sha256(complaint.getEvidenceSha256())
                .build());
        return items;
    }

    public StatusHistory createTimelineEntry(Complaint complaint,
                                             ComplaintStatus oldStatus,
                                             ComplaintStatus newStatus,
                                             User changedBy,
                                             String title,
                                             String activityType,
                                             String comment,
                                             String publicSummary,
                                             Integer progressPercentage,
                                             Boolean visibleToUser) {
        StatusHistory history = StatusHistory.builder()
                .complaint(complaint)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(changedBy != null ? changedBy : complaint.getUser())
                .title(title)
                .activityType(activityType)
                .comment(comment)
                .publicSummary(publicSummary)
                .progressPercentage(progressPercentage)
                .visibleToUser(visibleToUser)
                .evidenceFileName(complaint.getEvidenceFileName())
                .evidenceVerificationStatus(complaint.getEvidenceVerificationStatus())
                .evidenceReviewStatus(complaint.getEvidenceReviewStatus())
                .usedInInvestigation(complaint.getEvidenceUsedInInvestigation())
                .notificationChannels(notificationService.getNotificationChannels(mapToResponse(complaint)))
                .timestamp(LocalDateTime.now())
                .build();
        return statusHistoryRepository.save(history);
    }
}


