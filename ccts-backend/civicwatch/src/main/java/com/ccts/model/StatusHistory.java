package com.ccts.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity for tracking complaint status changes (audit trail)
 */
@Entity
@Table(name = "status_history", indexes = {
    @Index(name = "idx_status_history_complaint_timestamp", columnList = "complaint_id,timestamp"),
    @Index(name = "idx_status_history_complaint_visible_timestamp", columnList = "complaint_id,visible_to_user,timestamp"),
    @Index(name = "idx_status_history_new_status", columnList = "new_status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status")
    private ComplaintStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false)
    private ComplaintStatus newStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    @Column(name = "comment")
    private String comment;

    @Column(name = "title")
    private String title;

    @Column(name = "activity_type")
    private String activityType;

    @Column(name = "public_summary", columnDefinition = "TEXT")
    private String publicSummary;

    @Column(name = "visible_to_user")
    @Builder.Default
    private Boolean visibleToUser = true;

    @Column(name = "progress_percentage")
    private Integer progressPercentage;

    @Column(name = "evidence_file_name")
    private String evidenceFileName;

    @Column(name = "evidence_verification_status")
    private String evidenceVerificationStatus;

    @Column(name = "evidence_review_status")
    private String evidenceReviewStatus;

    @Column(name = "used_in_investigation")
    private Boolean usedInInvestigation;

    @Column(name = "notification_channels")
    private String notificationChannels;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;
}
