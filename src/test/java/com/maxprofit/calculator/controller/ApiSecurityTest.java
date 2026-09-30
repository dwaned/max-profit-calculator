package com.maxprofit.calculator.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end checks, on a real embedded Tomcat, for CORS, forwarded-header
 * handling in the rate limiter, input bounds and the error response shape.
 */
@AutoConfigureTestRestTemplate
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "app.ratelimit.capacity=3",
        "app.ratelimit.refill-tokens=1",
        "app.ratelimit.refill-period-seconds=3600",
        "app.cors.allowed-origins=https://allowed.example.com"
})
class ApiSecurityTest {

    private static final String VALID_BODY =
            "{\"savings\":10,\"buyPrices\":[5,5,10],\"sellPrices\":[15,10,35]}";

    // TestRestTemplate already prefixes the /api servlet context path.
    @Autowired
    private TestRestTemplate rest;

    private ResponseEntity<String> postCalculate(final String body, final HttpHeaders extra) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.addAll(extra);
        return rest.postForEntity("/calculate", new HttpEntity<>(body, headers), String.class);
    }

    private ResponseEntity<String> preflight(final String origin) {
        HttpHeaders headers = new HttpHeaders();
        headers.setOrigin(origin);
        headers.setAccessControlRequestMethod(HttpMethod.POST);
        return rest.exchange("/calculate", HttpMethod.OPTIONS, new HttpEntity<>(headers), String.class);
    }

    @Test
    @DisplayName("CORS preflight succeeds for a configured origin")
    void preflightAllowedOrigin() {
        ResponseEntity<String> response = preflight("https://allowed.example.com");
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getAccessControlAllowOrigin())
                .isEqualTo("https://allowed.example.com");
    }

    @Test
    @DisplayName("CORS preflight is rejected for an unknown origin")
    void preflightUnknownOrigin() {
        ResponseEntity<String> response = preflight("https://evil.example.com");
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getHeaders().getAccessControlAllowOrigin()).isNull();
    }

    @Test
    @DisplayName("Forged X-Forwarded-For entries do not give a client a fresh bucket")
    void forgedForwardedForDoesNotBypassRateLimit() {
        // Requests arrive from loopback, a trusted proxy, carrying the client IP
        // in CF-Connecting-IP (as Cloudflare/nginx set it). X-Forwarded-For is
        // ignored, so rotating it must not reset the client's bucket.
        for (int i = 0; i < 3; i++) {
            assertThat(postCalculate(VALID_BODY, client("198.51.100.7", "203.0.113." + i))
                    .getStatusCode()).isEqualTo(HttpStatus.OK);
        }
        assertThat(postCalculate(VALID_BODY, client("198.51.100.7", "203.0.113.200"))
                .getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);

        // A different client IP still has its own bucket.
        assertThat(postCalculate(VALID_BODY, client("198.51.100.8", "203.0.113.201"))
                .getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    private static HttpHeaders client(final String clientIp, final String forgedForwardedFor) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("CF-Connecting-IP", clientIp);
        headers.add("X-Forwarded-For", forgedForwardedFor);
        return headers;
    }

    @Test
    @DisplayName("Prices above the maximum are rejected with a message body")
    void priceAboveMaximumRejected() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("CF-Connecting-IP", "198.51.100.20");
        ResponseEntity<String> response = postCalculate(
                "{\"savings\":10,\"buyPrices\":[5],\"sellPrices\":[2000000000]}", headers);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("\"message\":\"Invalid input: Sell prices must not exceed 1000\"");
    }

    @Test
    @DisplayName("A null price is rejected with 400, not a 500")
    void nullPriceRejected() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("CF-Connecting-IP", "198.51.100.21");
        ResponseEntity<String> response = postCalculate(
                "{\"savings\":10,\"buyPrices\":[5,null],\"sellPrices\":[6,7]}", headers);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Buy prices must not contain empty values");
    }

    @Test
    @DisplayName("Missing savings is reported as required")
    void missingSavingsRejected() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("CF-Connecting-IP", "198.51.100.22");
        ResponseEntity<String> response = postCalculate(
                "{\"buyPrices\":[5],\"sellPrices\":[6]}", headers);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Savings amount is required");
    }

    @Test
    @DisplayName("Mismatched list sizes return the real reason in the message body")
    void mismatchedSizesReturnMessage() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("CF-Connecting-IP", "198.51.100.23");
        ResponseEntity<String> response = postCalculate(
                "{\"savings\":10,\"buyPrices\":[5,6],\"sellPrices\":[7]}", headers);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("\"message\":\"Invalid input:").contains("same size");
    }

    @Test
    @DisplayName("Malformed JSON returns a message body")
    void malformedJsonReturnsMessage() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("CF-Connecting-IP", "198.51.100.24");
        ResponseEntity<String> response = postCalculate("{not json", headers);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo("{\"message\":\"Invalid input: malformed request body\"}");
    }

    @Test
    @DisplayName("Actuator health does not expose component details")
    void actuatorHealthHidesDetails() {
        ResponseEntity<String> response = rest.getForEntity("/actuator/health", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).doesNotContain("components").doesNotContain("diskSpace");
    }
}
