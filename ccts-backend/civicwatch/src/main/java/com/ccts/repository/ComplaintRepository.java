package com.ccts.repository;

import com.ccts.model.Complaint;
import com.ccts.model.ComplaintStatus;
import com.ccts.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Complaint entity operations
 */
@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUser(User user);

    Page<Complaint> findByUser(User user, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "assignedOfficer"})
    Page<Complaint> findWithDetailsByUser(User user, Pageable pageable);

    List<Complaint> findByStatus(ComplaintStatus status);

    Page<Complaint> findByStatus(ComplaintStatus status, Pageable pageable);

    Optional<Complaint> findByTrackingNumber(String trackingNumber);

    @EntityGraph(attributePaths = {"user", "assignedOfficer"})
    Optional<Complaint> findWithDetailsByTrackingNumber(String trackingNumber);

    @EntityGraph(attributePaths = {"user", "assignedOfficer"})
    Optional<Complaint> findWithDetailsById(Long id);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status")
    long countByStatus(@Param("status") ComplaintStatus status);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.user = :user")
    long countByUser(@Param("user") User user);

    @EntityGraph(attributePaths = {"user", "assignedOfficer"})
    Page<Complaint> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE c.user.id = :userId")
    List<Complaint> findAllByUserId(@Param("userId") Long userId);

    Page<Complaint> findByEvidenceUrlIsNotNull(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "assignedOfficer"})
    @Query("SELECT c FROM Complaint c")
    Page<Complaint> findAllComplaints(Pageable pageable);
}
