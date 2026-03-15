package com.ccts.repository;

import com.ccts.model.DownloadForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DownloadFormRepository extends JpaRepository<DownloadForm, Long> {

    List<DownloadForm> findByActiveTrueOrderByCreatedAtDesc();

    List<DownloadForm> findAllByOrderByCreatedAtDesc();
}