package com.maxprofit.calculator;

import io.restassured.response.Response;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.ComposeContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.File;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * End-to-end API latency against the Docker image, started by Testcontainers.
 *
 * <p>Requirement: {@code POST /api/calculate} with 50 stocks responds in under
 * 500 ms. To be reliable on shared CI runners, the check uses the <b>median</b>
 * of several requests after a warm-up (the first requests pay for one-off
 * initialisation such as the dispatcher servlet and JIT compilation), at the
 * maximum budget. Requests are paced to stay within the API's rate limit
 * (burst 10, refill 10 per second), so every one is a real 200.
 *
 * <p>Needs Docker: {@code mvn test -Pcontainer-tests}.
 *
 * @see StressTests for the in-process algorithm checks
 */
@Testcontainers
@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength"})
class ApiPerformanceTests {

    private static final int APP_PORT = 9095;
    private static final int STOCKS = 50;
    private static final int MAX_SAVINGS = 1000;
    private static final long THRESHOLD_MS = 500;
    private static final int WARMUP_REQUESTS = 5;
    private static final int TIMED_REQUESTS = 15;
    private static final long PACING_MS = 150;

    @Container
    private final ComposeContainer environment = new ComposeContainer(
            new File("docker-compose-test.yml"))
        .withExposedService("app", APP_PORT, Wait.forListeningPort().withStartupTimeout(Duration.ofMinutes(10)));

    private final Random random = new Random(42);

    @Test
    void medianApiLatencyFor50StocksShouldBeUnder500ms() throws Exception {
        String baseUri = "http://localhost:" + environment.getServicePort("app", APP_PORT);
        String body = new JSONObject()
                .put("savings", MAX_SAVINGS)
                .put("buyPrices", new JSONArray(generateRandomPrices(STOCKS)))
                .put("sellPrices", new JSONArray(generateRandomPrices(STOCKS)))
                .toString();

        for (int i = 0; i < WARMUP_REQUESTS; i++) {
            post(baseUri, body);
            Thread.sleep(PACING_MS);
        }

        long[] millis = new long[TIMED_REQUESTS];
        for (int i = 0; i < TIMED_REQUESTS; i++) {
            Response response = post(baseUri, body);
            assertEquals(200, response.statusCode(), "Every timed request should succeed");
            millis[i] = response.time();
            Thread.sleep(PACING_MS);
        }
        Arrays.sort(millis);
        long median = millis[TIMED_REQUESTS / 2];

        System.out.printf("API, %d stocks, savings %d - median %d ms (min %d, max %d)%n",
                STOCKS, MAX_SAVINGS, median, millis[0], millis[TIMED_REQUESTS - 1]);
        assertTrue(median < THRESHOLD_MS,
                "Median API latency for " + STOCKS + " stocks should be < " + THRESHOLD_MS + "ms, was " + median + "ms");
    }

    private static Response post(final String baseUri, final String body) {
        return given()
                .baseUri(baseUri)
                .basePath("/api")
                .contentType("application/json")
                .body(body)
                .post("/calculate");
    }

    /** Random prices from 1 to 100. */
    private List<Integer> generateRandomPrices(final int size) {
        List<Integer> prices = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            prices.add(random.nextInt(100) + 1);
        }
        return prices;
    }
}
