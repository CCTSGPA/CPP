package com.ccts.controller;

import com.ccts.dto.ApiResponse;
import com.ccts.dto.ReverseGeocodeRequest;
import com.ccts.dto.ReverseGeocodeResponse;
import com.ccts.service.GeolocationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/location")
@RequiredArgsConstructor
@Slf4j
public class GeolocationController {

    private final GeolocationService geolocationService;

    @PostMapping("/reverse")
    public ResponseEntity<ApiResponse<ReverseGeocodeResponse>> reverseGeocode(
            @Valid @RequestBody ReverseGeocodeRequest request
    ) {
        log.info("Received reverse geocode request for lat={}, lon={}", request.getLatitude(), request.getLongitude());
        ReverseGeocodeResponse response = geolocationService.reverseGeocode(request.getLatitude(), request.getLongitude());
        return ResponseEntity.ok(ApiResponse.success("Location resolved successfully", response));
    }
}
