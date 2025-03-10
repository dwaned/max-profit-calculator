package com.maxprofit.calculator;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.DockerComposeContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.File;
import java.time.Duration;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

@SuppressWarnings({"checkstyle:LineLength", "checkstyle:MagicNumber"})
@Testcontainers
public class ContainerTests {


    /**
     * The ports for the application and site.
     */
    private static final int APP_PORT = 9095;
    /**
     * The site port number.
     */
    private static final int SITE_PORT = 3000;

    /**
     * The Docker Compose container environment.
     */
    @SuppressWarnings("resource")
    @Container
    public static final DockerComposeContainer<?> ENVIRONMENT;

    static {
        try {
            ENVIRONMENT = new DockerComposeContainer<>(new File("docker-compose-test.yml"))
                    .withExposedService("app", APP_PORT, 
                        Wait.forListeningPort()
                            .withStartupTimeout(Duration.ofMinutes(10)))
                    .withExposedService("site", SITE_PORT,
                        Wait.forListeningPort()
                            .withStartupTimeout(Duration.ofMinutes(10)));
        } catch (Exception e) {
            System.err.println("Error initializing Docker environment: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Sets up the environment before all tests are run.
     */
    @BeforeAll
    public static void setUp() {
        try {
            System.out.println("Starting Docker environment...");
            ENVIRONMENT.start();
            System.out.println("Docker environment started successfully");
        } catch (Exception e) {
            System.err.println("Failed to start containers: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Stops the Docker Compose container environment after all tests.
     */
    @AfterAll
    public static void tearDown() {
        if (ENVIRONMENT != null) {
            try {
                ENVIRONMENT.stop();
            } catch (Exception e) {
                System.err.println("Error during container cleanup: " + e.getMessage());
            }
        }
    }

    /**
     * Tests the application and site endpoints.
     */
    @Test
    public void testAppAndSite() {
        Integer appPort = ENVIRONMENT.getServicePort("app", APP_PORT);
        Integer sitePort = ENVIRONMENT.getServicePort("site", SITE_PORT);

        System.out.println("App port: " + appPort);
        System.out.println("Site port: " + sitePort);

        // Test app calculations
        given()
            .baseUri("http://localhost:" + appPort)
            .basePath("/api")
            .contentType("application/json")
            .body(new JSONObject()
                .put("savingsAmount", 6)
                .put("currentPrices", new JSONArray().put(1).put(2).put(5))
                .put("futurePrices", new JSONArray().put(2).put(3).put(20))
                .toString())
            .when()
            .post("/calculate")
            .then()
            .statusCode(200)
            .body("maxProfit", equalTo(16));

        // Test site
        given()
            .baseUri("http://localhost:" + sitePort)
            .when()
            .get("/")
            .then()
            .statusCode(200);
    }
}
