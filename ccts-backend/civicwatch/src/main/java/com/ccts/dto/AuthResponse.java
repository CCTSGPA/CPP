package com.ccts.dto;

import com.ccts.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for authentication response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private String authProvider;
    private LocalDateTime accountCreatedAt;
    private LocalDateTime lastLoginAt;
    private String token;
    private String message;
}


