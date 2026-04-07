package com.ccts.repository;

import com.ccts.model.Complaint;
import com.ccts.model.ComplaintStatus;
import com.ccts.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for StatusHistory entity operations
 */
@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    List<StatusHistory> findByComplaintOrderByTimestampDesc(Complaint complaint);

    List<StatusHistory> findByComplaintIdOrderByTimestampDesc(Long complaintId);

    List<StatusHistory> findByComplaintIdAndVisibleToUserTrueOrderByTimestampDesc(Long complaintId);

    Optional<StatusHistory> findFirstByComplaintIdAndNewStatusInOrderByTimestampDesc(Long complaintId, List<ComplaintStatus> statuses);
}
