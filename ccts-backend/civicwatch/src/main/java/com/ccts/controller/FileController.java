package com.ccts.controller;

import com.ccts.dto.ApiResponse;
import com.ccts.exception.CustomException;
import com.ccts.model.EvidenceUpload;
import com.ccts.model.User;
import com.ccts.model.UserRole;
import com.ccts.repository.EvidenceUploadRepository;
import com.ccts.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.ccts.service.NotificationService;
import com.ccts.service.OtpService;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * Controller for file upload operations
 * Base path: /api/v1/files
 */
@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp", "pdf", "txt");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "text/plain"
    );

    private final NotificationService notificationService;
    private final OtpService otpService;
    private final UserRepository userRepository;
    private final EvidenceUploadRepository evidenceUploadRepository;

    public FileController(NotificationService notificationService,
                          OtpService otpService,
                          UserRepository userRepository,
                          EvidenceUploadRepository evidenceUploadRepository) {
        this.notificationService = notificationService;
        this.otpService = otpService;
        this.userRepository = userRepository;
        this.evidenceUploadRepository = evidenceUploadRepository;
    }

    @Value("${file.upload-dir:./uploads/evidence}")
    private String uploadDir;

    /**
     * Upload evidence file (image/pdf/txt) for authenticated user.
     * POST /api/v1/files/upload
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        User uploadUser = getAuthenticatedUser(userDetails);
        EvidenceUpload upload = storeUpload(file, uploadUser, uploadUser);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", toUploadResponse(upload)));
    }

    /**
     * Analyze a file for suspicious content before upload/submit.
     * POST /api/v1/files/analyze
     */
    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analyzeFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        getAuthenticatedUser(userDetails);
        validateFile(file);
        Map<String, Object> analysis = analyzeFileSafety(file);
        return ResponseEntity.ok(ApiResponse.success("File analysis completed", analysis));
    }

    /**
     * Admin uploads evidence file for a specific user.
     * POST /api/v1/files/admin/upload-for-user?userId={id}
     */
    @PostMapping("/admin/upload-for-user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> adminUploadForUser(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = getAuthenticatedUser(userDetails);
        if (admin.getRole() != UserRole.ADMIN) {
            throw CustomException.forbidden("Only admins can upload evidence for users");
        }

        User targetUser = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> CustomException.notFound("Target user not found"));

        EvidenceUpload upload = storeUpload(file, targetUser, admin);
        return ResponseEntity.ok(ApiResponse.success("Evidence uploaded for user", toUploadResponse(upload)));
    }

    /**
     * Get authenticated user's uploaded evidence metadata
     * GET /api/v1/files/my
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> myUploads(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);

        List<EvidenceUpload> uploads = evidenceUploadRepository.findByUserIdOrderByUploadedAtDesc(user.getId());
        List<Map<String, Object>> data = new ArrayList<>();

        for (EvidenceUpload upload : uploads) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", upload.getId());
            item.put("originalFilename", upload.getOriginalFilename());
            item.put("storedFilename", upload.getStoredFilename());
            item.put("fileUrl", upload.getFileUrl());
            item.put("contentType", upload.getContentType());
            item.put("fileSize", upload.getFileSize());
            item.put("uploadedAt", upload.getUploadedAt());
            item.put("downloadUrl", "/api/v1/files/" + upload.getId() + "/download");
            item.put("uploadedBy", upload.getUploadedBy() != null ? upload.getUploadedBy().getName() : "System");
            item.put("uploadedByRole", upload.getUploadedBy() != null ? upload.getUploadedBy().getRole().name() : "SYSTEM");
            data.add(item);
        }

        return ResponseEntity.ok(ApiResponse.success("Uploads retrieved", data));
    }

    /**
     * Download evidence content from MySQL (BLOB) with access checks.
     * GET /api/v1/files/{uploadId}/download
     */
    @GetMapping("/{uploadId}/download")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable Long uploadId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User requestUser = getAuthenticatedUser(userDetails);
        EvidenceUpload upload = evidenceUploadRepository.findById(Objects.requireNonNull(uploadId))
                .orElseThrow(() -> CustomException.notFound("Uploaded file not found"));

        boolean isAdmin = requestUser.getRole() == UserRole.ADMIN;
        boolean isOwner = upload.getUser() != null && upload.getUser().getId().equals(requestUser.getId());
        if (!isAdmin && !isOwner) {
            throw CustomException.forbidden("You are not authorized to access this file");
        }

        byte[] content = upload.getFileData();
        if (content == null || content.length == 0) {
            throw CustomException.notFound("File content is not available");
        }

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (upload.getContentType() != null && !upload.getContentType().isBlank()) {
            try {
                mediaType = MediaType.parseMediaType(Objects.requireNonNull(upload.getContentType()));
            } catch (Exception ignored) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
        }

        String downloadName = upload.getOriginalFilename() != null && !upload.getOriginalFilename().isBlank()
                ? upload.getOriginalFilename()
                : upload.getStoredFilename();

        return ResponseEntity.ok()
                .contentType(Objects.requireNonNull(mediaType))
                .contentLength(content.length)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                .body(content);
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null || userDetails.getUsername().isBlank()) {
            throw CustomException.unauthorized("Authentication required");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> CustomException.notFound("User not found"));
    }

    private EvidenceUpload storeUpload(MultipartFile file, User ownerUser, User uploadedBy) {
        validateFile(file);
        try {
            Map<String, Object> analysis = analyzeFileSafety(file);
            boolean isSafe = Boolean.TRUE.equals(analysis.get("isSafe"));
            if (!isSafe) {
                throw CustomException.badRequest("File failed security analysis. Upload blocked.");
            }

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = extractExtension(originalFilename);
            String storedFilename = UUID.randomUUID() + (extension.isBlank() ? "" : "." + extension);

            Path filePath = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), filePath);

            String fileUrl = "/uploads/evidence/" + storedFilename;
            EvidenceUpload upload = EvidenceUpload.builder()
                    .user(ownerUser)
                    .uploadedBy(uploadedBy)
                    .originalFilename(originalFilename)
                    .storedFilename(storedFilename)
                    .fileUrl(fileUrl)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .fileData(file.getBytes())
                    .build();

            return evidenceUploadRepository.save(Objects.requireNonNull(upload));
        } catch (IOException e) {
            throw CustomException.badRequest("Failed to upload file: " + e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw CustomException.badRequest("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw CustomException.badRequest("File size must be less than 10MB");
        }

        String originalName = file.getOriginalFilename();
        String extension = extractExtension(originalName);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw CustomException.badRequest("Only JPG, PNG, GIF, WEBP, PDF, and TXT files are allowed");
        }

        String contentType = file.getContentType();
        boolean isImage = contentType != null && contentType.startsWith("image/");
        boolean isAllowedOtherType = contentType != null &&
            (ALLOWED_CONTENT_TYPES.contains(contentType) || contentType.startsWith("text/plain"));
        if (!isImage && !isAllowedOtherType) {
            throw CustomException.badRequest("Unsupported file content type: " + contentType);
        }
    }

    private Map<String, Object> analyzeFileSafety(MultipartFile file) {
        List<String> detectedThreats = new ArrayList<>();
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";

        try {
            byte[] bytes = file.getBytes();
            if (bytes.length >= 2 && bytes[0] == 0x4D && bytes[1] == 0x5A) {
                detectedThreats.add("Windows executable signature detected");
            }
            if (bytes.length >= 4 && bytes[0] == 0x7F && bytes[1] == 0x45 && bytes[2] == 0x4C && bytes[3] == 0x46) {
                detectedThreats.add("ELF executable signature detected");
            }

            int sampleLength = Math.min(bytes.length, 8192);
            String sampleText = new String(Arrays.copyOf(bytes, sampleLength), StandardCharsets.UTF_8).toLowerCase();
            if (sampleText.contains("<script") || sampleText.contains("powershell") || sampleText.contains("cmd.exe") || sampleText.contains("wscript")) {
                detectedThreats.add("Suspicious script command pattern detected");
            }

            boolean imageExtension = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif") || fileName.endsWith(".webp");
            if (imageExtension && contentType.startsWith("text/")) {
                detectedThreats.add("File extension/content type mismatch");
            }
        } catch (IOException e) {
            detectedThreats.add("Unable to analyze file content");
        }

        boolean isSafe = detectedThreats.isEmpty();
        Map<String, Object> result = new HashMap<>();
        result.put("isSafe", isSafe);
        result.put("scanStatus", isSafe ? "CLEAN" : "SUSPICIOUS");
        result.put("detectedThreats", detectedThreats);
        result.put("message", isSafe ? "No suspicious patterns detected" : "Suspicious content detected");
        return result;
    }

    private String extractExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    }

    private Map<String, Object> toUploadResponse(EvidenceUpload upload) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", upload.getId());
        response.put("url", upload.getFileUrl());
        response.put("fileUrl", upload.getFileUrl());
        response.put("downloadUrl", "/api/v1/files/" + upload.getId() + "/download");
        response.put("filename", upload.getStoredFilename());
        response.put("originalName", upload.getOriginalFilename() != null ? upload.getOriginalFilename() : "unknown");
        return response;
    }
}
