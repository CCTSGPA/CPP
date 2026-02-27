package com.ccts.dto;

import com.ccts.model.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
    private String respondentName;
    private String respondentDesignation;
    private String respondentDepartment;
    private ComplaintStatus status;
    private String trackingNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
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
}

