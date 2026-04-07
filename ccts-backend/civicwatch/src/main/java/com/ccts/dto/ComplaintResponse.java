package com.ccts.dto;

import com.ccts.model.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for complaint response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String location;

    private Double latitude;

    private Double longitude;

    private Float accuracy;

    private LocalDateTime incidentDate;
    private String evidenceUrl;
    private String evidenceFileName;
    private LocalDateTime evidenceUploadDate;
    private String evidenceVerificationStatus;
    private String evidenceReviewStatus;
    private Boolean evidenceUsedInInvestigation;
    private String evidenceSha256;
    private String respondentName;
    private String respondentDesignation;
    private String respondentDepartment;
    private Boolean isAnonymous;
    private String complainantName;
    private String complainantEmail;
    private String complainantPhone;
    private ComplaintStatus status;
    private String trackingNumber;
    private Integer progressPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime solvedAt;
    private String adminNotes;
    private String rejectionReason;
    private Integer aiSeverityScore;
    private String aiSummary;
    private LocalDateTime slaDeadline;
    private boolean slaBreached;
    private boolean escalationFlagged;
    
    // User info (without sensitive data)
    private Long userId;
    private String userName;
    private String userEmail;
    
    // Assigned officer info
    private Long assignedOfficerId;
    private String assignedOfficerName;

    // Transparency data
    private List<TimelineEntryResponse> timeline;
    private List<TimelineEntryResponse> activitySummaries;
    private List<EvidenceMetadataResponse> evidenceItems;
}

