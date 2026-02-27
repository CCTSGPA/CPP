package com.ccts.service;

import com.ccts.dto.AuthRequest;
import com.ccts.dto.AuthResponse;
import com.ccts.dto.RegisterRequest;
import com.ccts.exception.CustomException;
import com.ccts.model.User;
import com.ccts.model.UserRole;
import com.ccts.repository.UserRepository;
import com.ccts.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service for authentication operations
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ObjectProvider<AuthenticationManager> authenticationManagerProvider;

    /**
     * Load user by username for Spring Security
     */
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    /**
     * Register a new user
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw CustomException.conflict("Email already registered");
        }

        // Create new user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole() != null ? request.getRole() : UserRole.USER)
                .department(request.getDepartment())
                .designation(request.getDesignation())
                .oauthProvider("local")
                .lastLoginAt(LocalDateTime.now())
                .enabled(true)
                .build();

        userRepository.save(user);

        // Generate token
        String token = jwtUtil.generateToken(loadUserByUsername(user.getEmail()));

        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .authProvider(user.getOauthProvider())
                .accountCreatedAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .token(token)
                .message("Registration successful")
                .build();
    }

    /**
     * Login user
     */
    public AuthResponse login(AuthRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> CustomException.unauthorized("Invalid email or password"));

        // Verify password manually
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw CustomException.unauthorized("Invalid email or password");
        }

        user.setLastLoginAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        // Generate token
        String token = jwtUtil.generateToken(loadUserByUsername(savedUser.getEmail()));

        return AuthResponse.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .authProvider(savedUser.getOauthProvider())
                .accountCreatedAt(savedUser.getCreatedAt())
                .lastLoginAt(savedUser.getLastLoginAt())
                .token(token)
                .message("Login successful")
                .build();
    }

    /**
     * Get user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> CustomException.notFound("User not found"));
    }
}


