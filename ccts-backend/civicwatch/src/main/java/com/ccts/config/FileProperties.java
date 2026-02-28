package com.ccts.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for file uploads
 */
@Data
@Component
@ConfigurationProperties(prefix = "file")
public class FileProperties {

    private String uploadDir = "./uploads/evidence";
}
