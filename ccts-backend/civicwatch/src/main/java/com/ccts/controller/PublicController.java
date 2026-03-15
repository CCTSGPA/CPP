package com.ccts.controller;

import com.ccts.dto.ApiResponse;
import com.ccts.dto.DownloadFormResponse;
import com.ccts.dto.TransparencyStatsResponse;
import com.ccts.dto.GeoHeatmapResponse;
import com.ccts.dto.TurnstileVerifyRequest;
import com.ccts.service.CloudflareService;
import com.ccts.service.DownloadFormService;
import com.ccts.service.PublicStatsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for public transparency endpoints (no authentication required)
 * Base path: /api/v1/public
 */
@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicStatsService publicStatsService;
    private final CloudflareService cloudflareService;
    private final DownloadFormService downloadFormService;

    @Value("${cloudflare.turnstile.site-key:}")
    private String turnstileSiteKey;

    /**
     * Get public transparency statistics (anonymized & aggregated)
     * GET /api/v1/public/transparency-stats
     */
    @GetMapping("/transparency-stats")
    public ResponseEntity<ApiResponse<TransparencyStatsResponse>> getTransparencyStats() {
        TransparencyStatsResponse stats = publicStatsService.getTransparencyStats();
        return ResponseEntity.ok(ApiResponse.success("Transparency statistics retrieved", stats));
    }

    /**
     * Get geo heatmap data (anonymized locations)
     * GET /api/v1/public/geo-heatmap
     */
    @GetMapping("/geo-heatmap")
    public ResponseEntity<ApiResponse<GeoHeatmapResponse>> getGeoHeatmap(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        GeoHeatmapResponse heatmap = publicStatsService.getGeoHeatmap(category, department, dateFrom, dateTo);
        return ResponseEntity.ok(ApiResponse.success("Geo heatmap data retrieved", heatmap));
    }

    /**
     * Get Cloudflare Turnstile configuration (site key only, not secret)
     * GET /api/v1/public/turnstile-config
     */
    @GetMapping("/turnstile-config")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTurnstileConfig() {
        Map<String, Object> config = Map.of(
            "enabled", cloudflareService.isEnabled(),
            "siteKey", turnstileSiteKey != null ? turnstileSiteKey : ""
        );
        return ResponseEntity.ok(ApiResponse.success("Turnstile config retrieved", config));
    }

    /**
     * Get admin-uploaded public forms
     * GET /api/v1/public/forms
     */
    @GetMapping("/forms")
    public ResponseEntity<ApiResponse<java.util.List<DownloadFormResponse>>> getPublicForms() {
        return ResponseEntity.ok(ApiResponse.success("Forms retrieved", downloadFormService.getPublicForms()));
    }

    /**
     * Verify Cloudflare Turnstile token
     * POST /api/v1/public/verify-turnstile
     */
    @PostMapping("/verify-turnstile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyTurnstile(
            @RequestBody TurnstileVerifyRequest request,
            HttpServletRequest httpRequest) {
        
        String clientIp = getClientIp(httpRequest);
        CloudflareService.TurnstileResponse result = cloudflareService.verifyToken(request.getToken(), clientIp);
        
        Map<String, Object> responseData = Map.of(
            "success", result.success(),
            "error", result.errorMessage() != null ? result.errorMessage() : ""
        );
        
        if (result.success()) {
            return ResponseEntity.ok(ApiResponse.success("Verification successful", responseData));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Verification failed: " + result.errorMessage()));
        }
    }

    /**
     * Extract client IP address from request, handling proxies
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
