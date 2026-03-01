package com.maxprofit.calculator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

import java.io.File;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class LocalContractVerificationTest {

    private static final String BASE_URL = "http://localhost:9095";
    private ObjectMapper objectMapper;
    private JsonNode pactFile;
    private List<Interaction> interactions;

    @BeforeAll
    void setup() throws Exception {
        objectMapper = new ObjectMapper();
        pactFile = objectMapper.readTree(new File("src/test/resources/pacts/frontend-max-profit-calculator-backend.json"));
        interactions = loadInteractions();
    }

    private List<Interaction> loadInteractions() {
        List<Interaction> result = new ArrayList<>();
        JsonNode interactionsNode = pactFile.get("interactions");
        for (JsonNode interaction : interactionsNode) {
            result.add(new Interaction(interaction));
        }
        return result;
    }

    @Test
    void verifyAllInteractions() throws Exception {
        int passed = 0;
        int failed = 0;
        StringBuilder failures = new StringBuilder();
        
        for (Interaction interaction : interactions) {
            try {
                verifyInteraction(interaction);
                System.out.println("✓ " + interaction.description);
                passed++;
            } catch (AssertionError e) {
                System.out.println("✗ " + interaction.description + ": " + e.getMessage());
                failures.append("- ").append(interaction.description).append(": ").append(e.getMessage()).append("\n");
                failed++;
            }
        }
        
        System.out.println("\n" + passed + " passed, " + failed + " failed");
        if (failed > 0) {
            fail("Failed interactions:\n" + failures);
        }
    }

    private void verifyInteraction(Interaction interaction) throws Exception {
        String path = interaction.request.get("path").asText();
        String method = interaction.request.get("method").asText();
        
        HttpResponse<String> response;
        if ("POST".equalsIgnoreCase(method)) {
            String body = interaction.request.has("body") 
                ? objectMapper.writeValueAsString(interaction.request.get("body"))
                : "";
            response = sendPost(path, body);
        } else if ("GET".equalsIgnoreCase(method)) {
            response = sendGet(path);
        } else {
            throw new IllegalArgumentException("Unsupported method: " + method);
        }

        int expectedStatus = interaction.response.get("status").asInt();
        assertEquals(expectedStatus, response.statusCode(), 
            "Status code mismatch for: " + interaction.description);

        if (interaction.response.has("body")) {
            JsonNode expectedBody = interaction.response.get("body");
            
            if (expectedBody.isTextual()) {
                assertEquals(expectedBody.asText(), response.body(), 
                    "Body mismatch in " + interaction.description);
            } else {
                JsonNode actualBody = objectMapper.readTree(response.body());
                verifyBody(expectedBody, actualBody, interaction.description);
            }
        }
    }

    private void verifyBody(JsonNode expected, JsonNode actual, String description) {
        if (expected.isTextual()) {
            assertEquals(expected.asText(), actual.asText(), "Body mismatch in " + description);
            return;
        }
        
        if (expected.isObject()) {
            Iterator<String> fieldNames = expected.fieldNames();
            while (fieldNames.hasNext()) {
                String fieldName = fieldNames.next();
                JsonNode expectedValue = expected.get(fieldName);
                JsonNode actualValue = actual.get(fieldName);
                
                if (expectedValue != null && expectedValue.has("matcher")) {
                    String matcher = expectedValue.get("matcher").asText();
                    if ("type".equals(matcher)) {
                        assertNotNull(actualValue, "Field '" + fieldName + "' should exist in " + description);
                    } else if ("integer".equals(matcher) || "number".equals(matcher)) {
                        assertTrue(actualValue.isNumber(), "Field '" + fieldName + "' should be a number in " + description);
                    }
                } else if (expectedValue != null) {
                    assertEquals(expectedValue, actualValue, 
                        "Field '" + fieldName + "' mismatch in " + description);
                }
            }
        } else if (expected.isArray()) {
            for (int i = 0; i < expected.size(); i++) {
                verifyBody(expected.get(i), actual.get(i), description);
            }
        } else {
            assertEquals(expected, actual, "Body mismatch in " + description);
        }
    }

    private HttpResponse<String> sendPost(String path, String body) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + path))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> sendGet(String path) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + path))
            .GET()
            .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    static class Interaction {
        String description;
        JsonNode request;
        JsonNode response;

        Interaction(JsonNode node) {
            this.description = node.get("description").asText();
            this.request = node.get("request");
            this.response = node.get("response");
        }
    }
}
