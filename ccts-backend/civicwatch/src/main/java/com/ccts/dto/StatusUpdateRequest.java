package com.ccts.dto;

import com.ccts.model.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for status update request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ComplaintStatus status;

    private String rejectionReason;
    private String adminNotes;
    private String publicMessage;
    private Integer progressPercentage;
    private String evidenceVerificationStatus;
    private String evidenceReviewStatus;
    private Boolean usedInInvestigation;
}


