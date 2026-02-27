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
    private String comment;
    private LocalDateTime timestamp;
}
