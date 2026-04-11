package com.ccts.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SendOtpRequest {

    @Pattern(regexp = "^$|^\\+?[1-9]\\d{7,14}$", message = "Phone must be a valid international number")
    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    @AssertTrue(message = "Either phone or email must be provided")
    public boolean isPhoneOrEmailPresent() {
        return (phone != null && !phone.isBlank()) || (email != null && !email.isBlank());
    }
}
