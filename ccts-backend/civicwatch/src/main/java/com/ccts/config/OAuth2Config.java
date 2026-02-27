package com.ccts.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration for OAuth2 authentication
 */
@Configuration
public class OAuth2Config {

    /**
     * RestTemplate bean for making HTTP requests to OAuth providers
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
