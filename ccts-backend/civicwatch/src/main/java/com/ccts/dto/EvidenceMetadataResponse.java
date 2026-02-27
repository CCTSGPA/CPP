package com.ccts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for evidence metadata in admin panel
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenceMetadataResponse {

    private Long id;
    private Long complaintId;
    private String complaintTrackingNumber;
    private String fileName;
    private String fileType;
    private String fileUrl;
    private LocalDateTime uploadDate;
    private String integrityStatus;
    private String virusScanStatus;
    private String sha256;
}
