package com.ccts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for admin statistics response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsResponse {

    private long totalComplaints;
    private long submittedCount;
    private long underReviewCount;
    private long approvedCount;
    private long rejectedCount;
    private long resolvedCount;
    private long slaBreaches;
    private long highSeverity;
    private double resolutionRate;
    private long totalUsers;
    private long totalOfficers;
}


