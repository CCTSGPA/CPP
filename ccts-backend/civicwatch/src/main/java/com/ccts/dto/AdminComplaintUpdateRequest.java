package com.ccts.dto;

import com.ccts.model.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for unified admin complaint update route compatibility.
 * Some fields are accepted for compatibility with client payloads.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminComplaintUpdateRequest {

    private ComplaintStatus status;
    private Long assignedOfficer;
    private String adminNotes;
    private String rejectionReason;

    // Accepted for compatibility when present in payloads
    private String priority;
    private Boolean slaFlag;
}
