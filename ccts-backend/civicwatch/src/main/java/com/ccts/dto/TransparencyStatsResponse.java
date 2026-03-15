package com.ccts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for public transparency statistics (anonymized)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransparencyStatsResponse {

    private long totalComplaintsFiled;
    private long casesResolved;
    private long underInvestigation;
    private long complaintsApproved;
    private long complaintsRejected;
    private int categoriesTracked;
    private double resolutionRate;

    // Monthly trend data (last 6 months)
    private List<MonthlyTrend> monthlyTrends;

    // Status breakdown
    private Map<String, Long> statusBreakdown;

    // Complaints by category
    private Map<String, Long> categoryBreakdown;

    // Top reported departments (anonymized counts)
    private List<DepartmentCount> topDepartments;

    // Department risk index
    private List<DepartmentRisk> departmentRisks;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyTrend {
        private String month;
        private long filed;
        private long resolved;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentCount {
        private String department;
        private long count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentRisk {
        private String department;
        private long complaintCount;
        private int riskScore;
        private String riskLevel; // LOW, MODERATE, HIGH
    }
}
