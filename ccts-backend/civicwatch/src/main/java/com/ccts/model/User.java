package com.ccts.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * User entity representing a citizen, officer, or admin in the system.
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_role", columnList = "role")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    // OAuth Provider Fields
    @Column(name = "google_id")
    private String googleId;

    @Column(name = "facebook_id")
    private String facebookId;

    @Column(name = "apple_id")
    private String appleId;

    @Column(name = "microsoft_id")
    private String microsoftId;

    @Column(name = "oauth_provider")
    private String oauthProvider; // Stores: google, facebook, apple, microsoft

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(nullable = true)
    private String phone;

    private String department;

    private String designation;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    private boolean enabled = true;
}


