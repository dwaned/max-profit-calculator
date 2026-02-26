package com.maxprofit.calculator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.Map;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class PactProviderVerificationTest {

    @LocalServerPort
    private int port;

    private String baseUrl;
    private final RestTemplate restTemplate = new RestTemplate();

    @BeforeEach
    void setup() {
        baseUrl = "http://localhost:" + port + "/api";
    }

    @Test
    void verifyCalculateEndpointWithValidRequest() {
        String url = baseUrl + "/calculate";
        
        Map<String, Object> request = new HashMap<>();
        request.put("savings", 10);
        request.put("buyPrices", new Integer[]{5, 5, 10});
        request.put("sellPrices", new Integer[]{15, 10, 35});
        request.put("companyNames", new String[]{"Acme Corp", "Globex Inc", "Initech"});

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().get("maxProfit"));
        assertNotNull(response.getBody().get("indices"));
    }

    @Test
    void verifyCalculateEndpointWithMinimalRequest() {
        String url = baseUrl + "/calculate";
        
        Map<String, Object> request = new HashMap<>();
        request.put("savings", 100);
        request.put("buyPrices", new Integer[]{50});
        request.put("sellPrices", new Integer[]{100});

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void verifyCalculateEndpointWithInvalidSavingsNegative() {
        String url = baseUrl + "/calculate";
        
        Map<String, Object> request = new HashMap<>();
        request.put("savings", -10);
        request.put("buyPrices", new Integer[]{5, 5, 10});
        request.put("sellPrices", new Integer[]{15, 10, 35});

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            restTemplate.postForEntity(url, entity, Map.class);
            fail("Expected exception for negative savings");
        } catch (Exception e) {
            assertTrue(e.getMessage().contains("400") || 
                      e.getMessage().contains("Bad Request") ||
                      e instanceof org.springframework.web.client.HttpClientErrorException.BadRequest);
        }
    }

    @Test
    void verifyCalculateEndpointWithInvalidSavingsExceedsMaximum() {
        String url = baseUrl + "/calculate";
        
        Map<String, Object> request = new HashMap<>();
        request.put("savings", 1001);
        request.put("buyPrices", new Integer[]{5, 5, 10});
        request.put("sellPrices", new Integer[]{15, 10, 35});

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            restTemplate.postForEntity(url, entity, Map.class);
            fail("Expected exception for savings exceeding maximum");
        } catch (Exception e) {
            assertTrue(e.getMessage().contains("400") || 
                      e.getMessage().contains("Bad Request") ||
                      e instanceof org.springframework.web.client.HttpClientErrorException.BadRequest);
        }
    }

    @Test
    void verifyCalculateEndpointWithEmptyBuyPrices() {
        String url = baseUrl + "/calculate";
        
        Map<String, Object> request = new HashMap<>();
        request.put("savings", 10);
        request.put("buyPrices", new Integer[]{});
        request.put("sellPrices", new Integer[]{15});

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            restTemplate.postForEntity(url, entity, Map.class);
            fail("Expected exception for empty buy prices");
        } catch (Exception e) {
            assertTrue(e.getMessage().contains("400") || 
                      e.getMessage().contains("Bad Request") ||
                      e instanceof org.springframework.web.client.HttpClientErrorException.BadRequest);
        }
    }

    @Test
    void verifyHealthCheckEndpoint() {
        String url = baseUrl + "/health";
        
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("OK", response.getBody());
    }
}
