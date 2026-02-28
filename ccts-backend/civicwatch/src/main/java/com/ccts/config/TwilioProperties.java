package com.ccts.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for Twilio SMS service
 */
@Data
@Component
@ConfigurationProperties(prefix = "twilio")
public class TwilioProperties {

    private String accountSid;
    private String authToken;
    private String phoneNumber;
    private String messagingServiceSid;
}
