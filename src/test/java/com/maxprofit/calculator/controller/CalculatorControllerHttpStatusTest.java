package com.maxprofit.calculator.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CalculatorController.class)
@ExtendWith(SpringExtension.class)
@Import({RateLimitFilter.class, CalculatorControllerHttpStatusTest.TestRateLimitConfig.class})
class CalculatorControllerHttpStatusTest {

    /**
     * Test-specific wiring: replace {@code RateLimitFilterConfig}'s
     * {@link RateLimiterService} with a no-refill bucket so tests can
     * exhaust the budget deterministically without racing the production
     * 10-tokens-per-second refill. Defines {@link RateLimitProperties} directly
     * (instead of relying on {@code @EnableConfigurationProperties} binding)
     * so the test isn't affected by external property sources.
     */
    @TestConfiguration
    static class TestRateLimitConfig {

        @Bean
        public RateLimitProperties rateLimitProperties() {
            return new RateLimitProperties(true, 10, 1, 3600);
        }

        @Bean
        public RateLimiterService rateLimiterService(final RateLimitProperties properties) {
            return new RateLimiterService(properties);
        }

        @Bean
        public CorsProperties corsProperties() {
            return new CorsProperties(java.util.List.of(
                    "http://localhost:9095", "http://localhost:5173",
                    "http://localhost:3000", "https://max-profit-frontend.onrender.com"));
        }
    }
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Nested
    @DisplayName("/calculate endpoint HTTP status tests")
    class CalculateEndpoint {
        @Test
        @DisplayName("Returns 405 for GET request")
        void getMethodNotAllowed() throws Exception {
            mockMvc.perform(get("/calculate"))
                    .andExpect(status().isMethodNotAllowed());
        }

        @Test
        @DisplayName("Returns 415 for POST with no content type")
        void postNoContentType() throws Exception {
            mockMvc.perform(post("/calculate"))
                    .andExpect(status().isUnsupportedMediaType());
        }

        @Test
        @DisplayName("Returns 400 for POST with invalid JSON")
        void postInvalidJson() throws Exception {
            mockMvc.perform(post("/calculate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{invalid}"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Returns 200 for valid POST request")
        void postValidRequest() throws Exception {
            CalculationRequest request = new CalculationRequest();
            request.setSavings(10);
            request.setBuyPrices(Arrays.asList(5, 5, 10));
            request.setSellPrices(Arrays.asList(15, 10, 35));
            String jsonRequest = objectMapper.writeValueAsString(request);
            mockMvc.perform(post("/calculate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonRequest))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON));
        }

        @Test
        @DisplayName("Returns 400 when buyPrices exceeds maximum size of 100")
        void postBuyPricesExceedsMaxSize() throws Exception {
            CalculationRequest request = new CalculationRequest();
            request.setSavings(10);
            List<Integer> oversized = IntStream.rangeClosed(1, 101).boxed().collect(Collectors.toList());
            request.setBuyPrices(oversized);
            request.setSellPrices(oversized);
            String jsonRequest = objectMapper.writeValueAsString(request);
            mockMvc.perform(post("/calculate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonRequest))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Returns 400 when sellPrices exceeds maximum size of 100")
        void postSellPricesExceedsMaxSize() throws Exception {
            CalculationRequest request = new CalculationRequest();
            request.setSavings(10);
            List<Integer> matching = IntStream.rangeClosed(1, 50).boxed().collect(Collectors.toList());
            List<Integer> oversized = IntStream.rangeClosed(1, 101).boxed().collect(Collectors.toList());
            request.setBuyPrices(matching);
            request.setSellPrices(oversized);
            String jsonRequest = objectMapper.writeValueAsString(request);
            mockMvc.perform(post("/calculate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonRequest))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Returns 429 with JSON message when rate limit exceeded")
        void postExceedingRateLimitReturns429() throws Exception {
            CalculationRequest request = new CalculationRequest();
            request.setSavings(10);
            request.setBuyPrices(Arrays.asList(5, 5, 10));
            request.setSellPrices(Arrays.asList(15, 10, 35));
            String jsonRequest = objectMapper.writeValueAsString(request);

            // Default capacity is 10; send 11 requests from the same client IP.
            for (int i = 0; i < 10; i++) {
                mockMvc.perform(post("/calculate")
                        .with(req -> { req.setRemoteAddr("203.0.113.42"); return req; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                        .andExpect(status().isOk());
            }
            mockMvc.perform(post("/calculate")
                    .with(req -> { req.setRemoteAddr("203.0.113.42"); return req; })
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonRequest))
                    .andExpect(status().is(429))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.message").value("Rate limit exceeded"));
        }

        @Test
        @DisplayName("Health endpoint is exempt from rate limiting")
        void healthEndpointExemptFromRateLimit() throws Exception {
            // Default capacity is 10; send 20 GET /health calls from the same IP — all must succeed.
            for (int i = 0; i < 20; i++) {
                mockMvc.perform(get("/health")
                        .with(req -> { req.setRemoteAddr("203.0.113.99"); return req; }))
                        .andExpect(status().isOk())
                        .andExpect(content().string("OK"));
            }
        }

        @Test
        @DisplayName("Different client IPs have independent rate-limit buckets")
        void differentIpsHaveIndependentBuckets() throws Exception {
            CalculationRequest request = new CalculationRequest();
            request.setSavings(10);
            request.setBuyPrices(Arrays.asList(5, 5, 10));
            request.setSellPrices(Arrays.asList(15, 10, 35));
            String jsonRequest = objectMapper.writeValueAsString(request);

            // Exhaust IP A's bucket (capacity 10).
            for (int i = 0; i < 10; i++) {
                mockMvc.perform(post("/calculate")
                        .with(req -> { req.setRemoteAddr("198.51.100.1"); return req; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                        .andExpect(status().isOk());
            }
            mockMvc.perform(post("/calculate")
                    .with(req -> { req.setRemoteAddr("198.51.100.1"); return req; })
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonRequest))
                    .andExpect(status().is(429));

            // IP B should still have a fresh bucket.
            mockMvc.perform(post("/calculate")
                    .with(req -> { req.setRemoteAddr("198.51.100.2"); return req; })
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonRequest))
                    .andExpect(status().isOk());
        }
    }
}
