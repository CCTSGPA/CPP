package com.ccts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for geo heatmap data (anonymized)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeoHeatmapResponse {

    private long mappedComplaints;
    private long hotspotsDetected;
    private long criticalPriority;
    private long unresolved;

    private List<GeoPoint> points;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GeoPoint {
        private Double latitude;
        private Double longitude;
        private int count;
        private String severity; // low, medium, high, critical
        private String category;
        private String department;
    }
}
