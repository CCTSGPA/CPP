package com.ccts.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for notification services
 */
@Data
@Component
@ConfigurationProperties(prefix = "notification")
public class NotificationProperties {

    private boolean enabled = true;
    private String adminEmail;
    private String adminPhone;
    private boolean sendOnComplaintSubmit = true;
    private boolean sendOnStatusUpdate = true;
    private boolean sendOnAssignment = true;
}
