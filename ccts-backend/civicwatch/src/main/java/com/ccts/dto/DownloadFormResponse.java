package com.ccts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DownloadFormResponse {

    private Long id;
    private String title;
    private String description;
    private String department;
    private String fileUrl;
    private String fileName;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String uploadedBy;
}