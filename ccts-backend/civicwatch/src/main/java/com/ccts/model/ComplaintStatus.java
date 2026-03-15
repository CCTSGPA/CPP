package com.ccts.model;

/**
 * Enum representing the status of a complaint in the system.
 * SUBMITTED - Initial status when complaint is first submitted
 * UNDER_REVIEW - Complaint is being reviewed by an officer
 * APPROVED - Complaint has been verified and approved
 * REJECTED - Complaint has been rejected
 * RESOLVED - Complaint has been resolved
 */
public enum ComplaintStatus {
    SUBMITTED,
    UNDER_REVIEW,
    EVIDENCE_VERIFICATION_IN_PROGRESS,
    INVESTIGATION_STARTED,
    APPROVED,
    REJECTED,
    RESOLVED
}


