package com.maxprofit.calculator;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.DockerComposeContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.nio.file.Paths;

import static io.restassured.RestAssured.given;

@SuppressWarnings({"checkstyle:LineLength", "checkstyle:MagicNumber"})
@Testcontainers
public class ContainerTests {

    /**
     * The Docker Compose container environment for testing.
     * This static field represents the Docker environment configuration used across tests.
     * The {@link DockerComposeContainer} allows for setting up and managing Docker containers
     * during test execution.
     * 
     * Note: The checkstyle visibility modifier warning is suppressed for this field.
     */
    @SuppressWarnings("checkstyle:VisibilityModifier")
    public static DockerComposeContainer<?> environment;

    static {
        environment = new DockerComposeContainer<>(Paths.get("docker-compose-test.yml").toFile())
                .withExposedService("app", 9095)
                .withExposedService("site", 3000)
                .withLocalCompose(true)
                .waitingFor("app", Wait.forLogMessage(".*Started MaxProfitCalculatorApplication.*\\n", 1))
                .waitingFor("site", Wait.forLogMessage(".*webpack compiled successfully.*\\n", 1));
    }

    /**
     * Sets up the environment before all tests are run.
     * This method is annotated with {@code @BeforeAll}, meaning it will be executed once before any of the test methods in the current class.
     * It starts the environment required for the tests.
     */
    @BeforeAll
    public static void setUp() {
        environment.start();
    }

    /**
     * Stops the Docker Compose container environment after all tests have been executed.
     * This ensures that all Docker containers are properly shut down and resources are released.
     */
    @AfterAll
    public static void tearDown() {
        if (environment != null) {
            environment.stop();
        }
    }

    @Test
    public void testAppAndSite() {
        Integer appPort = environment.getServicePort("app", 9095);
        Integer sitePort = environment.getServicePort("site", 3000);

        // Test app
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
            .body("maxProfit", org.hamcrest.Matchers.equalTo(16));

        // Test site
        given()
            .baseUri("http://localhost:" + sitePort)
            .when()
            .get("/")
            .then()
            .statusCode(200);
    }
}
