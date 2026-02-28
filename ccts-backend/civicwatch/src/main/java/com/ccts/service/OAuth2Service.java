package com.ccts.service;

import com.ccts.dto.AuthResponse;
import com.ccts.dto.OAuth2UserInfo;
import com.ccts.exception.CustomException;
import com.ccts.model.User;
import com.ccts.model.UserRole;
import com.ccts.repository.UserRepository;
import com.ccts.util.JwtUtil;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

/**
 * Service for OAuth2 authentication with Google, Facebook, Apple, and Microsoft
 */
@SuppressWarnings("null")
@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2Service {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RestTemplate restTemplate;

    /**
     * Process OAuth2 login for all providers (Google, Facebook, Apple, Microsoft)
     *
     * @param provider The OAuth provider (google, facebook, apple, microsoft)
     * @param code Authorization code from OAuth provider
     * @return AuthResponse with JWT token
     */
    @Transactional
    public AuthResponse processOAuth2Login(String provider, String code) {
        try {
            // Fetch user info from OAuth provider
            OAuth2UserInfo userInfo = fetchUserInfoFromProvider(provider, code);

            if (userInfo == null || userInfo.getEmail() == null) {
                throw CustomException.badRequest("Could not retrieve user information from " + provider);
            }

            // Find or create user
            User user = findOrCreateUser(userInfo, provider);
                user.setLastLoginAt(LocalDateTime.now());
                User savedUser = userRepository.save(user);

            // Generate JWT token
                UserDetails userDetails = buildUserDetails(savedUser);
            String token = jwtUtil.generateToken(userDetails);

                log.info("OAuth2 login successful for provider: {} with email: {}", provider, savedUser.getEmail());

            return AuthResponse.builder()
                    .id(savedUser.getId())
                    .name(savedUser.getName())
                    .email(savedUser.getEmail())
                    .role(savedUser.getRole())
                    .authProvider(savedUser.getOauthProvider())
                    .accountCreatedAt(savedUser.getCreatedAt())
                    .lastLoginAt(savedUser.getLastLoginAt())
                    .token(token)
                    .message("OAuth login successful")
                    .build();

        } catch (Exception e) {
            log.error("OAuth2 login failed for provider: {}", provider, e);
            throw CustomException.badRequest("OAuth authentication failed: " + e.getMessage());
        }
    }

    /**
     * Fetch user information from OAuth provider
     */
    private OAuth2UserInfo fetchUserInfoFromProvider(String provider, String code) {
        switch (provider.toLowerCase()) {
            case "google":
                return fetchGoogleUserInfo(code);
            case "facebook":
                return fetchFacebookUserInfo(code);
            case "apple":
                return fetchAppleUserInfo(code);
            case "microsoft":
                return fetchMicrosoftUserInfo(code);
            default:
                throw CustomException.badRequest("Unsupported OAuth provider: " + provider);
        }
    }

    /**
     * Fetch Google user information
     * Note: Frontend should handle OAuth code exchange and send access token
     */
    private OAuth2UserInfo fetchGoogleUserInfo(String accessToken) {
        try {
            String url = "https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken;
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                JsonElement element = JsonParser.parseString(response.getBody());
                JsonObject json = element.getAsJsonObject();

                return OAuth2UserInfo.builder()
                        .providerId(json.has("id") ? json.get("id").getAsString() : null)
                        .name(json.has("name") ? json.get("name").getAsString() : "Google User")
                        .email(json.has("email") ? json.get("email").getAsString() : null)
                        .provider("google")
                        .build();
            }
        } catch (Exception e) {
            log.error("Error fetching Google user info", e);
        }
        return null;
    }

    /**
     * Fetch Facebook user information
     */
    private OAuth2UserInfo fetchFacebookUserInfo(String accessToken) {
        try {
            String url = "https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=" + accessToken;
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                JsonElement element = JsonParser.parseString(response.getBody());
                JsonObject json = element.getAsJsonObject();

                return OAuth2UserInfo.builder()
                        .providerId(json.has("id") ? json.get("id").getAsString() : null)
                        .name(json.has("name") ? json.get("name").getAsString() : "Facebook User")
                        .email(json.has("email") ? json.get("email").getAsString() : null)
                        .provider("facebook")
                        .build();
            }
        } catch (Exception e) {
            log.error("Error fetching Facebook user info", e);
        }
        return null;
    }

    /**
     * Fetch Apple user information
     * Apple tokens are JWT tokens that need to be decoded
     */
    private OAuth2UserInfo fetchAppleUserInfo(String idToken) {
        try {
            // For Apple, we receive idToken as JWT, which we need to decode
            // This is a simplified version - in production, verify JWT signature
            String[] parts = idToken.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT token");
            }

            String payload = new String(java.util.Base64.getDecoder().decode(parts[1]));
            JsonElement element = JsonParser.parseString(payload);
            JsonObject json = element.getAsJsonObject();

            return OAuth2UserInfo.builder()
                    .providerId(json.has("sub") ? json.get("sub").getAsString() : null)
                    .email(json.has("email") ? json.get("email").getAsString() : null)
                    .name("Apple User") // Apple doesn't always provide name in token
                    .provider("apple")
                    .build();
        } catch (Exception e) {
            log.error("Error fetching Apple user info", e);
        }
        return null;
    }

    /**
     * Fetch Microsoft user information
     */
    private OAuth2UserInfo fetchMicrosoftUserInfo(String accessToken) {
        try {
            String url = "https://graph.microsoft.com/v1.0/me";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                JsonElement element = JsonParser.parseString(response.getBody());
                JsonObject json = element.getAsJsonObject();

                return OAuth2UserInfo.builder()
                        .providerId(json.has("id") ? json.get("id").getAsString() : null)
                        .name(json.has("displayName") ? json.get("displayName").getAsString() : "Microsoft User")
                        .email(json.has("userPrincipalName") ? json.get("userPrincipalName").getAsString() : null)
                        .provider("microsoft")
                        .build();
            }
        } catch (Exception e) {
            log.error("Error fetching Microsoft user info", e);
        }
        return null;
    }

    /**
     * Find existing user by email or create new user
     * Handles account linking if user registers with multiple providers
     * Note: Transaction is handled by the calling processOAuth2Login method
     */
    private User findOrCreateUser(OAuth2UserInfo userInfo, String provider) {
        String email = userInfo.getEmail();
        String providerId = userInfo.getProviderId();

        // Check if user already exists by email
        User existingUser = userRepository.findByEmail(email).orElse(null);

        if (existingUser != null) {
            // User exists - link OAuth provider
            linkOAuthProvider(existingUser, provider, providerId);
            return existingUser;
        }

        // Create new user
        User newUser = User.builder()
                .email(email)
                .name(userInfo.getName())
                .phone(generatePhoneFromEmail(email)) // Placeholder phone
                .role(UserRole.USER) // Citizens only
                .password(null) // No password for OAuth users
                .oauthProvider(provider)
                .enabled(true)
                .build();

        // Set provider identifier
        setProviderIdentifier(newUser, provider, providerId);

        User savedUser = userRepository.save(newUser);
        log.info("New user created via {} OAuth: {}", provider, email);

        return savedUser;
    }

    /**
     * Link OAuth provider to existing user account
     */
    private void linkOAuthProvider(User user, String provider, String providerId) {
        switch (provider.toLowerCase()) {
            case "google":
                if (user.getGoogleId() == null) {
                    user.setGoogleId(providerId);
                    user.setOauthProvider(provider);
                }
                break;
            case "facebook":
                if (user.getFacebookId() == null) {
                    user.setFacebookId(providerId);
                    user.setOauthProvider(provider);
                }
                break;
            case "apple":
                if (user.getAppleId() == null) {
                    user.setAppleId(providerId);
                    user.setOauthProvider(provider);
                }
                break;
            case "microsoft":
                if (user.getMicrosoftId() == null) {
                    user.setMicrosoftId(providerId);
                    user.setOauthProvider(provider);
                }
                break;
        }
        userRepository.save(user);
        log.info("OAuth provider {} linked to user: {}", provider, user.getEmail());
    }

    /**
     * Set OAuth provider identifier for new user
     */
    private void setProviderIdentifier(User user, String provider, String providerId) {
        switch (provider.toLowerCase()) {
            case "google":
                user.setGoogleId(providerId);
                break;
            case "facebook":
                user.setFacebookId(providerId);
                break;
            case "apple":
                user.setAppleId(providerId);
                break;
            case "microsoft":
                user.setMicrosoftId(providerId);
                break;
        }
    }

    /**
     * Generate temporary phone number from email (placeholder)
     */
    private String generatePhoneFromEmail(String email) {
        return "9999999999"; // Placeholder
    }

    /**
     * Build UserDetails for JWT token generation
     */
    private UserDetails buildUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword() != null ? user.getPassword() : "")
                .roles(user.getRole().name())
                .build();
    }
}
