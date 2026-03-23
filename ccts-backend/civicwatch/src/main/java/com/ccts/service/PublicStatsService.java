package com.ccts.service;

import com.ccts.dto.GeoHeatmapResponse;
import com.ccts.dto.TransparencyStatsResponse;
import com.ccts.model.Complaint;
import com.ccts.model.ComplaintStatus;
import com.ccts.model.User;
import com.ccts.repository.ComplaintRepository;
import com.ccts.repository.DownloadFormRepository;
import com.ccts.repository.EvidenceUploadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for public transparency statistics (anonymized)
 */
@Service
@RequiredArgsConstructor
public class PublicStatsService {

    private static final int SLA_HOURS = 72;
    private static final int HIGH_SEVERITY_THRESHOLD = 75;
    private static final int MODERATE_SEVERITY_THRESHOLD = 40;

    private final ComplaintRepository complaintRepository;
    private final DownloadFormRepository downloadFormRepository;
    private final EvidenceUploadRepository evidenceUploadRepository;

    /**
     * Get anonymized transparency statistics
     */
    public TransparencyStatsResponse getTransparencyStats() {
        return buildTransparencyStats(complaintRepository.findAll());
    }

    /**
     * Get transparency statistics scoped to a single user
     */
    public TransparencyStatsResponse getTransparencyStatsForUser(User user) {
        return buildTransparencyStats(complaintRepository.findByUser(user));
    }

    private TransparencyStatsResponse buildTransparencyStats(List<Complaint> allComplaints) {
        long totalFiled = allComplaints.size();
        long evidenceUploads = allComplaints.stream().filter(c -> c.getEvidenceUrl() != null && !c.getEvidenceUrl().isBlank()).count();
        long formsAvailable = downloadFormRepository.findByActiveTrueOrderByCreatedAtDesc().size();
        long resolved = allComplaints.stream()
            .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED)
            .count();
        long underInvestigation = allComplaints.stream()
            .filter(c -> c.getStatus() == ComplaintStatus.UNDER_REVIEW || 
                        c.getStatus() == ComplaintStatus.APPROVED ||
                        c.getStatus() == ComplaintStatus.EVIDENCE_VERIFICATION_IN_PROGRESS ||
                        c.getStatus() == ComplaintStatus.INVESTIGATION_STARTED)
            .count();
        long approved = allComplaints.stream()
            .filter(c -> c.getStatus() == ComplaintStatus.APPROVED)
            .count();
        long rejected = allComplaints.stream()
            .filter(c -> c.getStatus() == ComplaintStatus.REJECTED)
            .count();
        
        // Unique categories
        Set<String> categories = allComplaints.stream()
            .map(Complaint::getCategory)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        
        double resolutionRate = totalFiled == 0 ? 0.0 : ((double) resolved / totalFiled) * 100.0;

        // Monthly trends (last 6 months)
        List<TransparencyStatsResponse.MonthlyTrend> monthlyTrends = calculateMonthlyTrends(allComplaints);

        // Status breakdown
        Map<String, Long> statusBreakdown = allComplaints.stream()
            .collect(Collectors.groupingBy(
                c -> c.getStatus().name(),
                Collectors.counting()
            ));

        // Category breakdown
        Map<String, Long> categoryBreakdown = allComplaints.stream()
            .filter(c -> c.getCategory() != null)
            .collect(Collectors.groupingBy(
                Complaint::getCategory,
                Collectors.counting()
            ));

        // Top departments
        List<TransparencyStatsResponse.DepartmentCount> topDepartments = allComplaints.stream()
            .filter(c -> c.getRespondentDepartment() != null && !c.getRespondentDepartment().isBlank())
            .collect(Collectors.groupingBy(
                Complaint::getRespondentDepartment,
                Collectors.counting()
            ))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(10)
            .map(e -> TransparencyStatsResponse.DepartmentCount.builder()
                .department(e.getKey())
                .count(e.getValue())
                .build())
            .collect(Collectors.toList());

        // Department risk index
        List<TransparencyStatsResponse.DepartmentRisk> departmentRisks = calculateDepartmentRisks(allComplaints);

        return TransparencyStatsResponse.builder()
            .totalComplaintsFiled(totalFiled)
            .evidenceUploads(evidenceUploads)
            .formsAvailable(formsAvailable)
            .casesResolved(resolved)
            .underInvestigation(underInvestigation)
            .complaintsApproved(approved)
            .complaintsRejected(rejected)
            .categoriesTracked(categories.size())
            .resolutionRate(Math.round(resolutionRate * 10.0) / 10.0)
            .monthlyTrends(monthlyTrends)
            .statusBreakdown(statusBreakdown)
            .categoryBreakdown(categoryBreakdown)
            .topDepartments(topDepartments)
            .departmentRisks(departmentRisks)
            .build();
    }

    /**
     * Get geo heatmap data with optional filters
     */
    public GeoHeatmapResponse getGeoHeatmap(String category, String department, String dateFrom, String dateTo) {
        List<Complaint> complaints = complaintRepository.findAll();
        
        // Apply filters
        if (category != null && !category.isBlank()) {
            complaints = complaints.stream()
                .filter(c -> category.equalsIgnoreCase(c.getCategory()))
                .collect(Collectors.toList());
        }
        
        if (department != null && !department.isBlank()) {
            complaints = complaints.stream()
                .filter(c -> department.equalsIgnoreCase(c.getRespondentDepartment()))
                .collect(Collectors.toList());
        }
        
        if (dateFrom != null && !dateFrom.isBlank()) {
            LocalDate from = LocalDate.parse(dateFrom);
            complaints = complaints.stream()
                .filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().toLocalDate().isBefore(from))
                .collect(Collectors.toList());
        }
        
        if (dateTo != null && !dateTo.isBlank()) {
            LocalDate to = LocalDate.parse(dateTo);
            complaints = complaints.stream()
                .filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().toLocalDate().isAfter(to))
                .collect(Collectors.toList());
        }

        // Only include complaints with valid coordinates
        List<Complaint> geoComplaints = complaints.stream()
            .filter(c -> c.getLatitude() != null && c.getLongitude() != null)
            .collect(Collectors.toList());

        // Round coordinates to reduce precision (privacy)
        Map<String, List<Complaint>> grouped = geoComplaints.stream()
            .collect(Collectors.groupingBy(c -> 
                String.format("%.2f,%.2f", c.getLatitude(), c.getLongitude())
            ));

        List<GeoHeatmapResponse.GeoPoint> points = grouped.entrySet().stream()
            .map(entry -> {
                List<Complaint> group = entry.getValue();
                Complaint first = group.get(0);
                
                // Determine severity based on max AI score in group
                int maxScore = group.stream()
                    .mapToInt(c -> c.getAiSeverityScore() != null ? c.getAiSeverityScore() : 0)
                    .max()
                    .orElse(0);
                
                String severity;
                if (maxScore >= HIGH_SEVERITY_THRESHOLD) {
                    severity = "critical";
                } else if (maxScore >= 50) {
                    severity = "high";
                } else if (maxScore >= MODERATE_SEVERITY_THRESHOLD) {
                    severity = "medium";
                } else {
                    severity = "low";
                }

                return GeoHeatmapResponse.GeoPoint.builder()
                    .latitude(Math.round(first.getLatitude() * 100.0) / 100.0)
                    .longitude(Math.round(first.getLongitude() * 100.0) / 100.0)
                    .count(group.size())
                    .severity(severity)
                    .category(first.getCategory())
                    .department(first.getRespondentDepartment())
                    .build();
            })
            .collect(Collectors.toList());

        // Calculate stats
        long hotspotsDetected = points.stream()
            .filter(p -> p.getCount() >= 3)
            .count();
        
        long criticalPriority = geoComplaints.stream()
            .filter(c -> c.getAiSeverityScore() != null && c.getAiSeverityScore() >= HIGH_SEVERITY_THRESHOLD)
            .count();
        
        long unresolved = geoComplaints.stream()
            .filter(c -> c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.REJECTED)
            .count();

        return GeoHeatmapResponse.builder()
            .mappedComplaints(geoComplaints.size())
            .hotspotsDetected(hotspotsDetected)
            .criticalPriority(criticalPriority)
            .unresolved(unresolved)
            .points(points)
            .build();
    }

    private List<TransparencyStatsResponse.MonthlyTrend> calculateMonthlyTrends(List<Complaint> complaints) {
        List<TransparencyStatsResponse.MonthlyTrend> trends = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yy");
        
        for (int i = 5; i >= 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            LocalDateTime startOfMonth = month.atDay(1).atStartOfDay();
            LocalDateTime endOfMonth = month.atEndOfMonth().atTime(23, 59, 59);
            
            long filed = complaints.stream()
                .filter(c -> c.getCreatedAt() != null && 
                            !c.getCreatedAt().isBefore(startOfMonth) && 
                            !c.getCreatedAt().isAfter(endOfMonth))
                .count();
            
            long resolved = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED &&
                            c.getUpdatedAt() != null &&
                            !c.getUpdatedAt().isBefore(startOfMonth) && 
                            !c.getUpdatedAt().isAfter(endOfMonth))
                .count();
            
            trends.add(TransparencyStatsResponse.MonthlyTrend.builder()
                .month(month.format(formatter))
                .filed(filed)
                .resolved(resolved)
                .build());
        }
        
        return trends;
    }

    private List<TransparencyStatsResponse.DepartmentRisk> calculateDepartmentRisks(List<Complaint> complaints) {
        Map<String, List<Complaint>> byDepartment = complaints.stream()
            .filter(c -> c.getRespondentDepartment() != null && !c.getRespondentDepartment().isBlank())
            .collect(Collectors.groupingBy(Complaint::getRespondentDepartment));

        return byDepartment.entrySet().stream()
            .map(entry -> {
                String dept = entry.getKey();
                List<Complaint> deptComplaints = entry.getValue();
                
                // Calculate risk score based on:
                // - Unresolved complaints (40%)
                // - SLA breaches (30%)
                // - AI severity (30%)
                long unresolved = deptComplaints.stream()
                    .filter(c -> c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.REJECTED)
                    .count();
                
                long slaBreaches = deptComplaints.stream()
                    .filter(this::isSlaBreached)
                    .count();
                
                double avgSeverity = deptComplaints.stream()
                    .mapToInt(c -> c.getAiSeverityScore() != null ? c.getAiSeverityScore() : 0)
                    .average()
                    .orElse(0);
                
                int total = deptComplaints.size();
                int riskScore = (int) Math.round(
                    (unresolved * 40.0 / Math.max(total, 1)) + 
                    (slaBreaches * 30.0 / Math.max(total, 1)) + 
                    (avgSeverity * 0.3)
                );
                riskScore = Math.min(100, riskScore);
                
                String riskLevel;
                if (riskScore >= 60) {
                    riskLevel = "High";
                } else if (riskScore >= 30) {
                    riskLevel = "Moderate";
                } else {
                    riskLevel = "Low Risk";
                }
                
                return TransparencyStatsResponse.DepartmentRisk.builder()
                    .department(dept)
                    .complaintCount(total)
                    .riskScore(riskScore)
                    .riskLevel(riskLevel)
                    .build();
            })
            .sorted((a, b) -> Integer.compare(b.getRiskScore(), a.getRiskScore()))
            .limit(10)
            .collect(Collectors.toList());
    }

    private boolean isSlaBreached(Complaint complaint) {
        if (complaint.getCreatedAt() == null) {
            return false;
        }
        LocalDateTime slaDeadline = complaint.getCreatedAt().plusHours(SLA_HOURS);
        boolean terminalStatus = complaint.getStatus() == ComplaintStatus.RESOLVED || 
                                 complaint.getStatus() == ComplaintStatus.REJECTED;
        return !terminalStatus && LocalDateTime.now().isAfter(slaDeadline);
    }
}
