package com.ccts.service;

import org.springframework.stereotype.Service;
import com.ccts.service.NotificationService;
import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple OTP generation/verification service.
 * In a production scenario you'd persist codes with expiration in a cache or database.
 */
@Service
public class OtpService {
    private final NotificationService notificationService;
    private final Map<String, String> cache = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public OtpService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Generate a six‑digit code, store it in memory, and send via SMS/email.
     */
    public void sendOtp(String phone, String email) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        if (phone != null && !phone.isBlank()) {
            cache.put(phone, code);
            notificationService.sendSMS("Your verification code is " + code, phone);
        }
        if (email != null && !email.isBlank()) {
            cache.put(email, code);
            notificationService.sendEmail("Your OTP Code", "Your verification code is " + code, email);
        }
    }

    /**
     * Verify a previously‑generated code. Either phone or email may be used for lookup.
     */
    public boolean verifyOtp(String key, String code) {
        if (key == null || code == null) return false;
        String expected = cache.get(key);
        if (expected != null && expected.equals(code)) {
            cache.remove(key);
            return true;
        }
        return false;
    }
}
