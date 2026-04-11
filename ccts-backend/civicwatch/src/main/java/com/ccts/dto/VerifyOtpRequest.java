package com.ccts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VerifyOtpRequest {

    @NotBlank(message = "Key is required")
    private String key;

    @NotBlank(message = "OTP code is required")
    @Pattern(regexp = "^\\d{4,8}$", message = "OTP must be numeric and 4 to 8 digits")
    private String code;
}
