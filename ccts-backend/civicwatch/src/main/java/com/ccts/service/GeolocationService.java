package com.ccts.service;

import com.ccts.dto.ReverseGeocodeResponse;
import com.ccts.exception.GeolocationException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class GeolocationService {

    private static final String NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/reverse";
    private static final long CACHE_TTL_MS = 5 * 60 * 1000;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final Map<String, CachedLocation> cache = new ConcurrentHashMap<>();

    public GeolocationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();
    }

    public ReverseGeocodeResponse reverseGeocode(Double latitude, Double longitude) {
        try {
            // Validate location is within India
            // India bounds: Lat 8°N to 37°N, Lon 68°E to 97°E
            if (latitude == null || longitude == null || 
                latitude < 8.0 || latitude > 37.0 || 
                longitude < 68.0 || longitude > 97.0) {
                log.warn("Location outside India: lat={}, lon={}", latitude, longitude);
                throw new GeolocationException("Your location is outside India. Complaints can only be filed from within India.");
            }

            String cacheKey = toCacheKey(latitude, longitude);
            CachedLocation cachedLocation = cache.get(cacheKey);
            if (cachedLocation != null && cachedLocation.expiresAt() > System.currentTimeMillis()) {
                log.debug("Reverse geocode cache hit for key={}", cacheKey);
                return cachedLocation.response();
            }

            URI uri = UriComponentsBuilder.fromUriString(NOMINATIM_BASE_URL)
                    .queryParam("lat", latitude)
                    .queryParam("lon", longitude)
                    .queryParam("format", "jsonv2")
                    .queryParam("addressdetails", 1)
                    .build(true)
                    .toUri();

            log.info("Calling Nominatim reverse geocode for lat={}, lon={}", latitude, longitude);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(10))
                    .header("Accept", "application/json")
                    .header("User-Agent", "CivicWatch/1.0 (support@civicwatch.local)")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("Nominatim reverse geocode failed with status={}", response.statusCode());
                throw new GeolocationException("Reverse geocoding service returned status " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            if (root.isMissingNode() || root.isEmpty()) {
                throw new GeolocationException("Reverse geocoding service returned empty payload");
            }

            JsonNode address = root.path("address");

            String city = firstNonBlank(
                    address.path("city").asText(null),
                    address.path("town").asText(null),
                    address.path("village").asText(null),
                    address.path("municipality").asText(null)
            );

            String area = firstNonBlank(
                    address.path("suburb").asText(null),
                    address.path("neighbourhood").asText(null),
                    address.path("quarter").asText(null),
                    address.path("hamlet").asText(null)
            );

            String state = address.path("state").asText(null);
            String pincode = address.path("postcode").asText(null);
            String displayAddress = root.path("display_name").asText("");

            ReverseGeocodeResponse result = ReverseGeocodeResponse.builder()
                    .latitude(latitude)
                    .longitude(longitude)
                    .city(sanitize(city))
                    .area(sanitize(area))
                    .state(sanitize(state))
                    .pincode(sanitize(pincode))
                    .displayAddress(displayAddress)
                    .build();

            cache.put(cacheKey, new CachedLocation(result, System.currentTimeMillis() + CACHE_TTL_MS));
            return result;

        } catch (GeolocationException ex) {
            log.warn("Geolocation exception: {}", ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to reverse geocode location", ex);
            throw new GeolocationException("Failed to resolve location details", ex);
        }
    }

    private String toCacheKey(Double latitude, Double longitude) {
        return String.format("%.4f:%.4f", latitude, longitude);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private String sanitize(String value) {
        return value == null ? "" : value;
    }

    private record CachedLocation(ReverseGeocodeResponse response, long expiresAt) {}
}
