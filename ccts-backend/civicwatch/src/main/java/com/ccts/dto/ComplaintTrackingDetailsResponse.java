package com.ccts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintTrackingDetailsResponse {

    private ComplaintResponse complaint;
    private List<TimelineEntryResponse> timeline;
    private List<TimelineEntryResponse> activities;
    private List<EvidenceMetadataResponse> evidence;
    private Integer progressPercentage;
}