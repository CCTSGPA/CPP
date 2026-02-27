package com.ccts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReverseGeocodeResponse {
    private Double latitude;
    private Double longitude;
    private String city;
    private String area;
    private String state;
    private String pincode;
    private String displayAddress;
}
