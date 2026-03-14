package com.ccts.service;

import com.ccts.config.NotificationProperties;
import com.ccts.dto.ComplaintResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for sending notifications via Email, SMS, and Push
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationProperties notificationProperties;
    private final ObjectMapper objectMapper;

    // Twilio Configuration
    @Value("${twilio.account-sid}")
    private String twilioAccountSid;

    @Value("${twilio.auth-token}")
    private String twilioAuthToken;

    @Value("${twilio.phone-number}")
    private String twilioPhoneNumber;

    // SendGrid Configuration
    @Value("${sendgrid.api-key}")
    private String sendgridApiKey;

    @Value("${sendgrid.from-email}")
    private String fromEmail;

    @Value("${sendgrid.from-name}")
    private String fromName;

    @PostConstruct
    public void initTwilio() {
        if (twilioAccountSid != null && !twilioAccountSid.equals("your_account_sid") &&
            twilioAuthToken != null && !twilioAuthToken.equals("your_auth_token")) {
            Twilio.init(twilioAccountSid, twilioAuthToken);
        }
    }

    /**
     * Send notification for new complaint submission
     */
    @Transactional
    public void sendComplaintSubmittedNotification(ComplaintResponse complaint) {
        if (!notificationProperties.isEnabled() || 
            !notificationProperties.isSendOnComplaintSubmit()) {
            return;
        }

        String subject = "New Complaint Submitted - " + complaint.getTrackingNumber();
        String message = String.format(
            "A new complaint has been submitted:\n\n" +
            "Tracking Number: %s\n" +
            "Title: %s\n" +
            "Category: %s\n" +
            "Location: %s\n" +
            "Description: %s\n" +
            "Submitted by: %s\n" +
            "Date: %s",
            complaint.getTrackingNumber(),
            complaint.getTitle(),
            complaint.getCategory(),
            formatLocation(complaint),
            complaint.getDescription(),
            complaint.getUserName(),
            complaint.getCreatedAt()
        );

        // Send email to admin
        sendEmail(subject, message, notificationProperties.getAdminEmail());

        // Send SMS to admin if phone is configured
        if (notificationProperties.getAdminPhone() != null && 
            !notificationProperties.getAdminPhone().equals("+1234567890")) {
            sendSMS(formatSMSMessage(complaint), notificationProperties.getAdminPhone());
        }

        // Send push notification (placeholder)
        sendPushNotification("New Complaint", "Complaint " + complaint.getTrackingNumber() + " has been submitted");
    }

    /**
     * Send notification for status update
     */
    @Transactional
    public void sendStatusUpdateNotification(ComplaintResponse complaint, String newStatus, String notes) {
        if (!notificationProperties.isEnabled() || 
            !notificationProperties.isSendOnStatusUpdate()) {
            return;
        }

        String subject = "Complaint Status Updated - " + complaint.getTrackingNumber();
        String message = String.format(
            "Complaint status has been updated:\n\n" +
            "Tracking Number: %s\n" +
            "Title: %s\n" +
            "New Status: %s\n" +
            "Notes: %s\n" +
            "Updated at: %s",
            complaint.getTrackingNumber(),
            complaint.getTitle(),
            newStatus,
            notes != null ? notes : "No notes provided",
            complaint.getUpdatedAt()
        );

        // Send email to admin and complaint owner
        sendEmail(subject, message, notificationProperties.getAdminEmail());
        
        // TODO: Send email to user who submitted complaint (need user email service)
        // For now, just send to admin

        // Send SMS to admin
        if (notificationProperties.getAdminPhone() != null && 
            !notificationProperties.getAdminPhone().equals("+1234567890")) {
            sendSMS(formatSMSMessage(complaint, newStatus), notificationProperties.getAdminPhone());
        }

        // Send push notification
        sendPushNotification("Status Update", "Complaint " + complaint.getTrackingNumber() + " status is now " + newStatus);
    }

    /**
     * Send notification for complaint assignment
     */
    @Transactional
    public void sendAssignmentNotification(ComplaintResponse complaint, String officerName) {
        if (!notificationProperties.isEnabled() || 
            !notificationProperties.isSendOnAssignment()) {
            return;
        }

        String subject = "Complaint Assigned - " + complaint.getTrackingNumber();
        String message = String.format(
            "A complaint has been assigned:\n\n" +
            "Tracking Number: %s\n" +
            "Title: %s\n" +
            "Assigned to: %s\n" +
            "Category: %s\n" +
            "Location: %s",
            complaint.getTrackingNumber(),
            complaint.getTitle(),
            officerName,
            complaint.getCategory(),
            formatLocation(complaint)
        );

        // Send email to admin and assigned officer
        sendEmail(subject, message, notificationProperties.getAdminEmail());
        
        // TODO: Send email to officer if we have their email
        // This would require fetching officer user details

        // Send SMS to admin
        if (notificationProperties.getAdminPhone() != null && 
            !notificationProperties.getAdminPhone().equals("+1234567890")) {
            sendSMS(formatSMSMessage(complaint, "Assigned to " + officerName), notificationProperties.getAdminPhone());
        }

        // Send push notification
        sendPushNotification("Complaint Assigned", "Complaint " + complaint.getTrackingNumber() + " assigned to " + officerName);
    }

    /**
     * Send email using SendGrid
     */
    public void sendEmail(String subject, String body, String toEmail) {
        try {
            // Check if SendGrid API key is configured
            if (sendgridApiKey == null || sendgridApiKey.equals("your_sendgrid_api_key")) {
                System.out.println("SendGrid not configured. Email would be: " + subject);
                System.out.println("To: " + toEmail);
                System.out.println("Body: " + body);
                return;
            }

            // Using SendGrid Java SDK
            com.sendgrid.SendGrid sendgrid = new com.sendgrid.SendGrid(sendgridApiKey);
            com.sendgrid.Request request = new com.sendgrid.Request();

            request.setMethod(com.sendgrid.Method.POST);
            request.setEndpoint("mail/send");
            
            Map<String, Object> email = new HashMap<>();
            email.put("from", Map.of("email", fromEmail, "name", fromName));
            email.put("subject", subject);
            
            Map<String, Object> content = new HashMap<>();
            content.put("type", "text/plain");
            content.put("value", body);
            email.put("content", java.util.List.of(content));
            
            email.put("personalizations", java.util.List.of(
                Map.of("to", java.util.List.of(Map.of("email", toEmail)))
            ));

            // Convert map to JSON string
            String jsonBody = objectMapper.writeValueAsString(email);
            request.setBody(jsonBody);
            sendgrid.api(request);
            
            System.out.println("Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Send SMS using Twilio
     */
    public void sendSMS(String message, String toPhoneNumber) {
        try {
            // Check if Twilio is configured
            if (twilioAccountSid == null || twilioAccountSid.equals("your_account_sid") ||
                twilioAuthToken == null || twilioAuthToken.equals("your_auth_token")) {
                System.out.println("Twilio not configured. SMS would be:");
                System.out.println("To: " + toPhoneNumber);
                System.out.println("Message: " + message);
                return;
            }

            Message.creator(
                new PhoneNumber(toPhoneNumber),
                new PhoneNumber(twilioPhoneNumber),
                message
            ).create();

            System.out.println("SMS sent successfully to: " + toPhoneNumber);
        } catch (Exception e) {
            System.err.println("Failed to send SMS: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Send push notification (placeholder - can be implemented with Firebase or Twilio Notify)
     */
    private void sendPushNotification(String title, String body) {
        // TODO: Implement push notification using Firebase Cloud Messaging or Twilio Notify
        // For now, just log the notification
        System.out.println("Push Notification:");
        System.out.println("Title: " + title);
        System.out.println("Body: " + body);
        
        // Implementation options:
        // 1. Firebase Cloud Messaging (FCM) for Android/iOS/Web
        // 2. Twilio Notify for multi-channel push
        // 3. Web Push API for browser notifications
    }

    /**
     * Format location string for notifications
     */
    private String formatLocation(ComplaintResponse complaint) {
        StringBuilder sb = new StringBuilder();
        if (complaint.getLocation() != null && !complaint.getLocation().isEmpty()) {
            sb.append(complaint.getLocation());
        }
        if (complaint.getLatitude() != null && complaint.getLongitude() != null) {
            if (sb.length() > 0) sb.append(" (");
            sb.append("Lat: ").append(complaint.getLatitude())
              .append(", Lon: ").append(complaint.getLongitude());
            if (complaint.getAccuracy() != null) {
                sb.append(", Accuracy: ").append(complaint.getAccuracy()).append("m");
            }
            if (sb.length() > 0 && sb.charAt(sb.length() - 1) == '(') {
                sb.append(")");
            }
        }
        return sb.toString();
    }

    /**
     * Format SMS message (concise for SMS)
     */
    private String formatSMSMessage(ComplaintResponse complaint) {
        return String.format(
            "CivicWatch Alert: New complaint %s - %s. Category: %s. Location: %s",
            complaint.getTrackingNumber(),
            truncate(complaint.getTitle(), 50),
            complaint.getCategory(),
            complaint.getLocation() != null ? complaint.getLocation() : 
                (complaint.getLatitude() != null ? String.format("%.4f,%.4f", 
                    complaint.getLatitude(), complaint.getLongitude()) : "N/A")
        );
    }

    private String formatSMSMessage(ComplaintResponse complaint, String status) {
        return String.format(
            "CivicWatch Update: Complaint %s status changed to %s",
            complaint.getTrackingNumber(),
            status
        );
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() <= maxLength ? text : text.substring(0, maxLength) + "...";
    }
}
