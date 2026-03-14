package com.ccts.controller;

import com.ccts.dto.ApiResponse;
import com.ccts.exception.CustomException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.ccts.service.NotificationService;
import com.ccts.service.OtpService;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for file upload operations
 * Base path: /api/v1/files
 */
@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final NotificationService notificationService;
    private final OtpService otpService;

    public FileController(NotificationService notificationService, OtpService otpService) {
        this.notificationService = notificationService;
        this.otpService = otpService;
    }

    @Value("${file.upload-dir:./uploads/evidence}")
    private String uploadDir;

    /**
     * Upload evidence file (image)
     * POST /api/v1/files/upload
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (file.isEmpty()) {
            throw CustomException.badRequest("File is empty");
        }

        // Validate file type (only images)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw CustomException.badRequest("Only image files are allowed");
        }

        // Validate file size (max 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw CustomException.badRequest("File size must be less than 10MB");
        }

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                    ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                    : "";
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // Return file URL (relative path that can be accessed via static resource mapping)
            String fileUrl = "/uploads/evidence/" + filename;

            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", filename);
            response.put("originalName", originalFilename != null ? originalFilename : "unknown");

            // notify user by email and optionally send OTP
            String userEmail = null;
            if (userDetails != null) {
                userEmail = userDetails.getUsername();
            }
            if (userEmail != null && !userEmail.isBlank()) {
                notificationService.sendEmail("File Uploaded Successfully",
                                            "Your file has been saved at " + fileUrl,
                                            userEmail);
            }
            // if the user stored a phone number in their profile we could send OTP here
            // for demo, send OTP to the same email address as key
            if (userEmail != null && !userEmail.isBlank()) {
                otpService.sendOtp(null, userEmail);
            }

            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", response));

        } catch (IOException e) {
            throw CustomException.badRequest("Failed to upload file: " + e.getMessage());
        }
    }
}
