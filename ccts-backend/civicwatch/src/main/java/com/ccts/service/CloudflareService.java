package com.ccts.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Service for verifying Cloudflare Turnstile tokens.
 * Turnstile is Cloudflare's CAPTCHA alternative that provides
 * bot protection without user interaction.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CloudflareService {

    private static final String TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    @Value("${cloudflare.turnstile.secret-key:}")
    private String secretKey;

    @Value("${cloudflare.turnstile.enabled:false}")
    private boolean enabled;

    private final RestTemplate restTemplate;

    /**
     * Verifies a Cloudflare Turnstile token.
     *
     * @param token The token received from the client-side widget
     * @param remoteIp The IP address of the user (optional but recommended)
     * @return TurnstileResponse with verification result
     */
    public TurnstileResponse verifyToken(String token, String remoteIp) {
        if (!enabled) {
            log.debug("Cloudflare Turnstile is disabled, skipping verification");
            return TurnstileResponse.ok();
        }

        if (token == null || token.isBlank()) {
            log.warn("Empty Turnstile token received");
            return TurnstileResponse.fail("Missing Turnstile token");
        }

        if (secretKey == null || secretKey.isBlank()) {
            log.error("Cloudflare Turnstile secret key is not configured");
            return TurnstileResponse.fail("Turnstile not configured");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("secret", secretKey);
            body.add("response", token);
            if (remoteIp != null && !remoteIp.isBlank()) {
                body.add("remoteip", remoteIp);
            }

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(
                TURNSTILE_VERIFY_URL,
                request,
                Map.class
            );

            if (response.getBody() == null) {
                log.error("Empty response from Cloudflare Turnstile API");
                return TurnstileResponse.fail("Invalid response from verification service");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = response.getBody();
            boolean success = responseBody != null && Boolean.TRUE.equals(responseBody.get("success"));

            if (success) {
                log.debug("Turnstile verification successful");
                return TurnstileResponse.ok();
            } else {
                Object errorCodes = responseBody != null ? responseBody.get("error-codes") : null;
                String errorMessage = errorCodes != null ? errorCodes.toString() : "Verification failed";
                log.warn("Turnstile verification failed: {}", errorMessage);
                return TurnstileResponse.fail(errorMessage);
            }

        } catch (Exception e) {
            log.error("Error verifying Turnstile token: {}", e.getMessage(), e);
            return TurnstileResponse.fail("Verification service error");
        }
    }

    /**
     * Verifies token without IP address.
     */
    public TurnstileResponse verifyToken(String token) {
        return verifyToken(token, null);
    }

    /**
     * Checks if Turnstile verification is enabled.
     */
    public boolean isEnabled() {
        return enabled;
    }

    /**
     * Response object for Turnstile verification.
     */
    public record TurnstileResponse(boolean success, String errorMessage) {
        public static TurnstileResponse ok() {
            return new TurnstileResponse(true, null);
        }

        public static TurnstileResponse fail(String message) {
            return new TurnstileResponse(false, message);
        }
    }
}
