package com.ccts.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for OAuth2 login request from frontend
 * Contains the authorization code received from OAuth provider
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OAuth2LoginRequest {

    @NotBlank(message = "Provider is required")
    private String provider; // google, facebook, apple, microsoft

    @NotBlank(message = "Authorization code or access token is required")
    private String code; // Authorization code or access token from provider
}
