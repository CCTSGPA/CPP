package com.ccts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for Cloudflare Turnstile token verification.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TurnstileVerifyRequest {
    private String token;
}
