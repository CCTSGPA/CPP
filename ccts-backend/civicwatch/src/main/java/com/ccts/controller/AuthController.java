package com.ccts.controller;

import com.ccts.dto.ApiResponse;
import com.ccts.dto.AuthRequest;
import com.ccts.dto.AuthResponse;
import com.ccts.dto.OAuth2LoginRequest;
import com.ccts.dto.RegisterRequest;
import com.ccts.service.AuthService;
import com.ccts.service.OAuth2Service;
import com.ccts.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for authentication endpoints
 * Base path: /api/v1/auth
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OAuth2Service oAuth2Service;
    private final OtpService otpService;

    /**
     * Register a new user
     * POST /api/v1/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    /**
     * Login user with email and password
     * POST /api/v1/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * OAuth2 login endpoint for Google, Facebook, Apple, Microsoft
     * POST /api/v1/auth/oauth2/login
     *
     * Request body:
     * {
     *   "provider": "google|facebook|apple|microsoft",
     *   "code": "authorization_code_from_provider"
     * }
     */
    @PostMapping("/oauth2/login")
    public ResponseEntity<ApiResponse<AuthResponse>> oAuth2Login(@Valid @RequestBody OAuth2LoginRequest request) {
        AuthResponse response = oAuth2Service.processOAuth2Login(request.getProvider(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success("OAuth login successful", response));
    }

    /**
     * OAuth2 callback endpoint (alternative approach if handling callback server-side)
     * GET /api/v1/auth/oauth2/callback/{provider}?code=...&state=...
     *
     * For now, we handle OAuth in the frontend and POST to /oauth2/login
     * This endpoint is reserved for future server-side OAuth handling
     */
    @GetMapping("/oauth2/callback/{provider}")
    public ResponseEntity<ApiResponse<String>> oAuth2Callback(
            @PathVariable String provider,
            @RequestParam String code,
            @RequestParam(required = false) String state) {

        // In production, handle state parameter validation for CSRF protection
        return ResponseEntity.ok(ApiResponse.success(
                "OAuth callback received for provider: " + provider,
                "Please complete authentication in frontend with code: " + code
        ));
    }

    /**
     * Forgot password - request password reset link
     * POST /api/v1/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "Email is required"));
        }
        
        // For security, don't reveal whether email exists or not
        // Always return success message regardless
        // In production: generate token, save to DB, send email
        
        return ResponseEntity.ok(ApiResponse.success(
                "If an account with that email exists, a password reset link has been sent.",
                email
        ));
    }

    /**
     * Send OTP to a phone number or email address
     * POST /api/v1/auth/send-otp
     * Body: { "phone": "+917020057494", "email": "user@example.com" }
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<String>> sendOtp(@RequestBody java.util.Map<String, String> request) {
        String phone = request.get("phone");
        String email = request.get("email");
        if ((phone == null || phone.isBlank()) && (email == null || email.isBlank())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "Phone or email must be provided"));
        }
        otpService.sendOtp(phone, email);
        return ResponseEntity.ok(ApiResponse.success("OTP sent", phone != null && !phone.isBlank() ? phone : email));
    }

    /**
     * Verify OTP code
     * POST /api/v1/auth/verify-otp
     * Body: { "key": "+917020057494 or user@example.com", "code": "123456" }
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Boolean>> verifyOtp(@RequestBody java.util.Map<String, String> request) {
        String key = request.get("key");
        String code = request.get("code");
        boolean valid = otpService.verifyOtp(key, code);
        return ResponseEntity.ok(ApiResponse.success(valid ? "OTP valid" : "OTP invalid", valid));
    }
}



