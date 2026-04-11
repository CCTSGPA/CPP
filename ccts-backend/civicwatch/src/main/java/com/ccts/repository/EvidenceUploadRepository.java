package com.ccts.repository;

import com.ccts.model.EvidenceUpload;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvidenceUploadRepository extends JpaRepository<EvidenceUpload, Long> {
    @EntityGraph(attributePaths = {"uploadedBy"})
    List<EvidenceUpload> findByUserIdOrderByUploadedAtDesc(Long userId);
}
