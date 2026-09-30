package com.maxprofit.calculator.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Guards the springdoc integration: an incompatible springdoc/Spring pairing
 * makes {@code /v3/api-docs} fail with a 500 at runtime while everything else
 * still works.
 */
@AutoConfigureTestRestTemplate
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OpenApiDocsTest {

    // TestRestTemplate already prefixes the /api servlet context path.
    @Autowired
    private TestRestTemplate rest;

    @Test
    @DisplayName("OpenAPI document is served and describes the calculate endpoint")
    void apiDocsServed() {
        ResponseEntity<String> response = rest.getForEntity("/v3/api-docs", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("\"/calculate\"").contains("\"/health\"");
    }

    @Test
    @DisplayName("Swagger UI is served")
    void swaggerUiServed() {
        ResponseEntity<String> response = rest.getForEntity("/swagger-ui/index.html", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
