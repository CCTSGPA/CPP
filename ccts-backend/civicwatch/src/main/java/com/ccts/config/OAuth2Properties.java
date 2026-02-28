package com.ccts.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for OAuth2 providers
 */
@Data
@Component
@ConfigurationProperties(prefix = "oauth2")
public class OAuth2Properties {

    private GoogleOAuth2 google = new GoogleOAuth2();
    private FacebookOAuth2 facebook = new FacebookOAuth2();
    private AppleOAuth2 apple = new AppleOAuth2();
    private MicrosoftOAuth2 microsoft = new MicrosoftOAuth2();

    @Data
    public static class GoogleOAuth2 {
        private String clientId;
        private String clientSecret;
        private String redirectUri;
    }

    @Data
    public static class FacebookOAuth2 {
        private String clientId;
        private String clientSecret;
        private String redirectUri;
    }

    @Data
    public static class AppleOAuth2 {
        private String clientId;
        private String teamId;
        private String keyId;
        private String privateKey;
        private String redirectUri;
    }

    @Data
    public static class MicrosoftOAuth2 {
        private String clientId;
        private String clientSecret;
        private String redirectUri;
    }
}
