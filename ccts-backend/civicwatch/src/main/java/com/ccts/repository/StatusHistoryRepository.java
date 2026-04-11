package com.ccts.repository;

import com.ccts.model.Complaint;
import com.ccts.model.ComplaintStatus;
import com.ccts.model.StatusHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for StatusHistory entity operations
 */
@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    @EntityGraph(attributePaths = {"complaint", "changedBy"})
    List<StatusHistory> findByComplaintOrderByTimestampDesc(Complaint complaint);

    @EntityGraph(attributePaths = {"complaint", "changedBy"})
    List<StatusHistory> findByComplaintIdOrderByTimestampDesc(Long complaintId);

    @EntityGraph(attributePaths = {"complaint", "changedBy"})
    List<StatusHistory> findByComplaintIdAndVisibleToUserTrueOrderByTimestampDesc(Long complaintId);

    @EntityGraph(attributePaths = {"complaint", "changedBy"})
    Page<StatusHistory> findByComplaintIdOrderByTimestampDesc(Long complaintId, Pageable pageable);

    @EntityGraph(attributePaths = {"complaint", "changedBy"})
    Page<StatusHistory> findAllBy(Pageable pageable);

    Optional<StatusHistory> findFirstByComplaintIdAndNewStatusInOrderByTimestampDesc(Long complaintId, List<ComplaintStatus> statuses);
}
