package com.maxprofit.calculator;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.DockerComposeContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.File;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.lessThan;

/**
 * API Performance Tests for the Max Profit Calculator.
 * 
 * <p>This test class verifies the API endpoint meets its performance requirements:
 * <ul>
 *   <li>API must respond in under 500ms for 50 stocks</li>
 * </ul>
 * 
 * <p><b>Requirements:</b>
 * <ul>
 *   <li>Docker must be running (uses Testcontainers)</li>
 *   <li>docker-compose-test.yml must be present</li>
 * </ul>
 * 
 * <p><b>Running these tests:</b>
 * <pre>
 * mvn test -Dtest=ApiPerformanceTests -Pcontainer-tests
 * </pre>
 * 
 * @see PerformanceTests for algorithm-level performance tests
 */
@Testcontainers
@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength", "checkstyle:VisibilityModifier"})
class ApiPerformanceTests {

    private static final int APP_PORT = 9095;
    private static final int LARGE_SIZE = 50;
    private static final long LARGE_THRESHOLD_MS = 500;

    @Container
    private final DockerComposeContainer<?> environment = new DockerComposeContainer<>(
            new File("docker-compose-test.yml"))
        .withExposedService("app", APP_PORT, Wait.forListeningPort().withStartupTimeout(Duration.ofMinutes(10)));

    private final Random random = new Random(42);

    /**
     * Tests that the API endpoint responds within 500ms for 50 stocks.
     * 
     * <p>This is the main performance requirement for the API:
     * POST /api/calculate with 50 stocks must complete in under 500ms.
     * 
     * <p>Uses Testcontainers to spin up the actual application in Docker.
     * 
     * @throws org.json.JSONException if JSON construction fails
     */
    @Test
    void apiShouldRespondInUnder500msFor50Stocks() throws org.json.JSONException {
        Integer appPort = environment.getServicePort("app", APP_PORT);
        String baseUri = "http://localhost:" + appPort;

        List<Integer> currentPrices = generateRandomPrices(LARGE_SIZE);
        List<Integer> futurePrices = generateRandomPrices(LARGE_SIZE);

        given()
            .baseUri(baseUri)
            .basePath("/api")
            .contentType("application/json")
            .body(new JSONObject()
                .put("savingsAmount", 100)
                .put("currentPrices", new JSONArray(currentPrices))
                .put("futurePrices", new JSONArray(futurePrices))
                .toString())
        .when()
            .post("/calculate")
        .then()
            .statusCode(200)
            .time(lessThan(LARGE_THRESHOLD_MS));
    }

    /**
     * Generates a list of random stock prices.
     * 
     * @param size Number of prices to generate
     * @return List of random prices between 1 and 100
     */
    private List<Integer> generateRandomPrices(int size) {
        List<Integer> prices = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            prices.add(random.nextInt(100) + 1);
        }
        return prices;
    }
}
