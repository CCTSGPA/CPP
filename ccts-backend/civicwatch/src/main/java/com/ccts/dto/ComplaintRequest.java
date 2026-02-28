package com.ccts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for creating or updating a complaint
 */
@SuppressWarnings("unused")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String location;

    private Double latitude;

    private Double longitude;

    private Float accuracy;

    private LocalDateTime incidentDate;

    private String respondentName;

    private String respondentDesignation;

    private String respondentDepartment;

    private Boolean isAnonymous;

    private String complainantName;

    private String complainantEmail;

    private String complainantPhone;

    private Integer aiSeverityScore;

    private String aiSummary;
}


