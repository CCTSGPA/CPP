package com.ccts.service;

import com.ccts.dto.DownloadFormRequest;
import com.ccts.dto.DownloadFormResponse;
import com.ccts.exception.CustomException;
import com.ccts.model.DownloadForm;
import com.ccts.model.User;
import com.ccts.repository.DownloadFormRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DownloadFormService {

    private final DownloadFormRepository downloadFormRepository;

    public List<DownloadFormResponse> getPublicForms() {
        return downloadFormRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<DownloadFormResponse> getAllForms() {
        return downloadFormRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DownloadFormResponse createForm(DownloadFormRequest request, User admin) {
        DownloadForm form = DownloadForm.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .department(request.getDepartment())
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .active(request.getActive() == null || request.getActive())
                .uploadedBy(admin)
                .build();
        return toResponse(downloadFormRepository.save(form));
    }

    @Transactional
    public DownloadFormResponse updateForm(Long id, DownloadFormRequest request) {
        DownloadForm form = downloadFormRepository.findById(id)
                .orElseThrow(() -> CustomException.notFound("Form not found"));

        form.setTitle(request.getTitle());
        form.setDescription(request.getDescription());
        form.setDepartment(request.getDepartment());
        form.setFileUrl(request.getFileUrl());
        form.setFileName(request.getFileName());
        if (request.getActive() != null) {
            form.setActive(request.getActive());
        }

        return toResponse(downloadFormRepository.save(form));
    }

    @Transactional
    public void deleteForm(Long id) {
        DownloadForm form = downloadFormRepository.findById(id)
                .orElseThrow(() -> CustomException.notFound("Form not found"));
        downloadFormRepository.delete(form);
    }

    private DownloadFormResponse toResponse(DownloadForm form) {
        return DownloadFormResponse.builder()
                .id(form.getId())
                .title(form.getTitle())
                .description(form.getDescription())
                .department(form.getDepartment())
                .fileUrl(form.getFileUrl())
                .fileName(form.getFileName())
                .active(form.isActive())
                .createdAt(form.getCreatedAt())
                .updatedAt(form.getUpdatedAt())
                .uploadedBy(form.getUploadedBy() != null ? form.getUploadedBy().getName() : null)
                .build();
    }
}