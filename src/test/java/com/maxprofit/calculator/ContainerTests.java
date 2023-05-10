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
import java.time.Duration;

import static io.restassured.RestAssured.given;

@SuppressWarnings({"checkstyle:LineLength", "checkstyle:MagicNumber"})
@Testcontainers
public class ContainerTests {

    /**
     * Docker compose container.
     */
    @SuppressWarnings("checkstyle:VisibilityModifier")
    public static DockerComposeContainer environment =
            new DockerComposeContainer(Paths.get("docker-compose-test.yml")
                    .toFile())
                    .withExposedService("site_1", 3000)
                    .withExposedService("app_1", 9095);


    /**
     * Set up.
     */
    @BeforeAll
    public static void setUp() {
        environment.start();
        // Get the mapped port for the app container
        Integer appMappedPort = environment.getServicePort("app", 9095);
        System.out.println("App service running at " + appMappedPort);

        // Get the mapped port for the site container
        Integer siteMappedPort = environment.getServicePort("site", 3000);
        System.out.println("Site service running at " + siteMappedPort);

        Wait.forHttp("http://localhost:" + appMappedPort).withStartupTimeout(Duration.ofSeconds(60));
         Wait.forHttp("http://localhost:" + siteMappedPort).withStartupTimeout(Duration.ofSeconds(60));

    }

    /**
     * Tear down.
     */
    @AfterAll
    public static void tearDown() {
        environment.stop();
    }

    /**
     * Test app and site.
     */
    @Test
    public void testAppAndSite() {
        System.out.println("Starting docker-compose...");

        Integer appMappedPort = environment.getServicePort("app", 9095);
        Integer siteMappedPort = environment.getServicePort("site", 3000);

        // Send a request to the app container
        given().baseUri("http://localhost:" + appMappedPort).basePath("/api")
                .when().body(new JSONObject()
                        .put("savingsAmount", 6)
                        .put("currentPrices", new JSONArray().put(1)
                                .put(2).put(5))
                        .put("futurePrices", new JSONArray()
                                .put(2).put(3)
                                .put(20)).toString())
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .post("/calculate")
                .then().body("maxProfit", org.hamcrest.Matchers.equalTo(16))
                .and().body("indices", org.hamcrest.Matchers.notNullValue()).statusCode(200);
        System.out.println("App is up and running");


        // Send a request to the site container
        given().baseUri("http://localhost:" + siteMappedPort)
                .when().get("/")
                .then().statusCode(200);
        System.out.println("Site is up and running");
    }

    /**
     * Test api docs.
     */
    @Test
    public void testApiDocs() {
        System.out.println("Starting docker-compose...");

        Integer appMappedPort = environment.getServicePort("app", 9095);

        // Send a request to the app container
        given().baseUri("http://localhost:" + appMappedPort).basePath("/api")
                .when().get("/v3/api-docs")
                .then().statusCode(200);
        System.out.println("Api docs are available");

        // Send request to Swagger UI site
        given().baseUri("http://localhost:" + appMappedPort).basePath("/api")
                .when().get("/swagger-ui.html")
                .then().statusCode(200);
        System.out.println("Swagger UI is up and running");
    }

}
