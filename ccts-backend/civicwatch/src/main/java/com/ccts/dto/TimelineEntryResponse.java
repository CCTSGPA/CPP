package com.ccts.dto;

import com.ccts.model.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for complaint timeline entries
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineEntryResponse {

    private Long id;
    private Long complaintId;
    private String trackingNumber;
    private ComplaintStatus oldStatus;
    private ComplaintStatus newStatus;
    private String changedBy;
    private String title;
    private String comment;
    private String publicSummary;
    private Boolean visibleToUser;
    private String activityType;
    private Integer progressPercentage;
    private String evidenceFileName;
    private String evidenceVerificationStatus;
    private String evidenceReviewStatus;
    private Boolean usedInInvestigation;
    private String notificationChannels;
    private LocalDateTime timestamp;
}
