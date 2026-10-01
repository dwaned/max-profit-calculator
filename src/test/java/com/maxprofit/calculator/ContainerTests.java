package com.maxprofit.calculator;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.ComposeContainer;
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

    private static final int APP_PORT = 9095;
    // Container port of the nginx frontend (docker-compose-test.yml maps it to 3000 on the host).
    private static final int FRONTEND_PORT = 80;

    @Container
    private final ComposeContainer environment = new ComposeContainer(
            new File("docker-compose-test.yml"))
        .withExposedService("app", APP_PORT, Wait.forListeningPort().withStartupTimeout(Duration.ofMinutes(10)))
        .withExposedService("frontend", FRONTEND_PORT, Wait.forListeningPort().withStartupTimeout(Duration.ofMinutes(10)));

    @Test
    public void testAppAndSite() throws org.json.JSONException {
        Integer appPort = environment.getServicePort("app", APP_PORT);
        Integer sitePort = environment.getServicePort("frontend", FRONTEND_PORT);

        System.out.println("App port: " + appPort);
        System.out.println("Site port: " + sitePort);

        // Test app calculations
        given()
            .baseUri("http://localhost:" + appPort)
            .basePath("/api")
            .contentType("application/json")
            .body(new JSONObject()
                .put("savings", 6)
                .put("buyPrices", new JSONArray().put(1).put(2).put(5))
                .put("sellPrices", new JSONArray().put(2).put(3).put(20))
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