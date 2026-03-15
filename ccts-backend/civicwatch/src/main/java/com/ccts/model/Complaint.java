package com.ccts.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Complaint entity representing a corruption complaint submitted by a citizen.
 */
@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    private String location;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "accuracy")
    private Float accuracy;

    @Column(name = "incident_date")
    private LocalDateTime incidentDate;

    @Column(name = "evidence_url")
    private String evidenceUrl;

    @Column(name = "evidence_file_name")
    private String evidenceFileName;

    @Column(name = "evidence_upload_date")
    private LocalDateTime evidenceUploadDate;

    @Column(name = "evidence_verification_status")
    private String evidenceVerificationStatus;

    @Column(name = "evidence_review_status")
    private String evidenceReviewStatus;

    @Column(name = "evidence_used_in_investigation")
    @Builder.Default
    private Boolean evidenceUsedInInvestigation = false;

    @Column(name = "evidence_sha256", length = 128)
    private String evidenceSha256;

    @Column(name = "respondent_name")
    private String respondentName;

    @Column(name = "respondent_designation")
    private String respondentDesignation;

    @Column(name = "respondent_department")
    private String respondentDepartment;

    @Column(name = "is_anonymous")
    @Builder.Default
    private Boolean isAnonymous = false;

    @Column(name = "complainant_name")
    private String complainantName;

    @Column(name = "complainant_email")
    private String complainantEmail;

    @Column(name = "complainant_phone")
    private String complainantPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.SUBMITTED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_officer_id")
    private User assignedOfficer;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "ai_severity_score")
    private Integer aiSeverityScore;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "tracking_number", unique = true)
    private String trackingNumber;

    @Column(name = "progress_percentage")
    @Builder.Default
    private Integer progressPercentage = 10;
}


