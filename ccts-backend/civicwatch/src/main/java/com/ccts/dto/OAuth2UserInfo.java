package com.ccts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user information fetched from OAuth providers
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OAuth2UserInfo {
    private String providerId;      // User ID from provider (google_id, facebook_id, etc.)
    private String name;            // User's name from provider
    private String email;           // User's email from provider
    private String provider;        // Provider name (google, facebook, apple, microsoft)
    private String picture;         // Optional profile picture URL
}
