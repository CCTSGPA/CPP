package com.ccts.repository;

import com.ccts.model.Complaint;
import com.ccts.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for StatusHistory entity operations
 */
@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    List<StatusHistory> findByComplaintOrderByTimestampDesc(Complaint complaint);

    List<StatusHistory> findByComplaintIdOrderByTimestampDesc(Long complaintId);
}
