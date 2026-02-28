package com.ccts.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for Cloudflare Turnstile
 */
@Data
@Component
@ConfigurationProperties(prefix = "cloudflare")
public class CloudflareProperties {

    private Turnstile turnstile = new Turnstile();

    @Data
    public static class Turnstile {
        private boolean enabled = false;
        private String siteKey;
        private String secretKey;
    }
}
