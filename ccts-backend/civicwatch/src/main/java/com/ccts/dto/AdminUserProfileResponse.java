package com.ccts.dto;

import com.ccts.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for admin user profile visibility
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserProfileResponse {

    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private String authProvider;
    private LocalDateTime accountCreatedAt;
    private LocalDateTime lastLoginAt;
    private String phone;
    private String department;
    private String designation;
    private long totalComplaints;
}
