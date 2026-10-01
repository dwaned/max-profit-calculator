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

    @Test
    @DisplayName("Metrics endpoints are not exposed over HTTP")
    void metricsEndpointsNotExposed() {
        assertThat(rest.getForEntity("/actuator/prometheus", String.class).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(rest.getForEntity("/actuator/metrics", String.class).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("A null company name is rejected with 400")
    void nullCompanyNameRejected() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("CF-Connecting-IP", "198.51.100.25");
        ResponseEntity<String> response = postCalculate(
                "{\"savings\":1,\"buyPrices\":[1],\"sellPrices\":[1],\"companyNames\":[null]}", headers);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Company names must not contain empty values");
    }

    @Test
    @DisplayName("Company names of a different length than the prices are rejected with 400")
    void mismatchedCompanyNamesRejected() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("CF-Connecting-IP", "198.51.100.26");
        ResponseEntity<String> response = postCalculate(
                "{\"savings\":10,\"buyPrices\":[1,2],\"sellPrices\":[5,6],\"companyNames\":[\"OnlyOne\"]}", headers);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("companyNames must have the same size");
    }

    @Test
    @DisplayName("Unsupported media type uses the API error format")
    void unsupportedMediaTypeUsesErrorFormat() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.add("CF-Connecting-IP", "198.51.100.27");
        ResponseEntity<String> response = rest.postForEntity("/calculate", new HttpEntity<>("hi", headers), String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        assertThat(response.getBody()).isEqualTo("{\"message\":\"Unsupported media type: send application/json\"}");
    }

    @Test
    @DisplayName("405 lists the supported methods in Allow and uses the API error format")
    void methodNotAllowedHasAllowHeader() {
        ResponseEntity<String> response = rest.exchange("/calculate", HttpMethod.DELETE, HttpEntity.EMPTY, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
        assertThat(response.getHeaders().getAllow()).containsExactly(HttpMethod.POST);
        assertThat(response.getBody()).contains("\"message\":\"Method DELETE is not supported");
    }

    @Test
    @DisplayName("Values of the wrong JSON type are rejected, not coerced")
    void wrongJsonTypesRejected() {
        String[] bodies = {
            "{\"savings\":1,\"buyPrices\":[1],\"sellPrices\":[1],\"companyNames\":[false]}",
            "{\"savings\":\"5\",\"buyPrices\":[1],\"sellPrices\":[1]}",
            "{\"savings\":5,\"buyPrices\":[1.5],\"sellPrices\":[2]}",
        };
        for (int i = 0; i < bodies.length; i++) {
            HttpHeaders headers = new HttpHeaders();
            headers.add("CF-Connecting-IP", "198.51.100.3" + i);
            ResponseEntity<String> response = postCalculate(bodies[i], headers);
            assertThat(response.getStatusCode()).as(bodies[i]).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).as(bodies[i]).contains("\"message\":\"Invalid input: malformed request body\"");
        }
    }
}
