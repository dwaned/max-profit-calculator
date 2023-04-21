package com.maxprofit.calculator;


import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.DockerComposeContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.images.builder.ImageFromDockerfile;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.io.File;
import java.nio.file.Paths;
import java.time.Duration;

import static io.restassured.RestAssured.given;

@Testcontainers
public class ContainerTests {

//    @Rule
//    public GenericContainer app = new GenericContainer(
//            new ImageFromDockerfile()
//                    .withDockerfile(Paths.get(System.getProperty("user.dir") + "\\Dockerfile")))
//            .withExposedPorts(9095)
//            .waitingFor(Wait.forHttp("/api/health")
//                    .forStatusCode(200));
//
//    @Rule
//    public GenericContainer site = new GenericContainer(
//        new ImageFromDockerfile()
//                .withDockerfile(Paths.get(System.getProperty("user.dir") + "\\site\\LiveTerm\\Dockerfile")))
//            .withExposedPorts(3000);

//      @Rule
//      public GenericContainer site = new GenericContainer(
//              new DockerImageName("calculator-site:latest"))
//              .withExposedPorts(3000);

//    @Test
//    public void testApp() {
//        System.out.println("Starting container...");
//        System.out.println("This may take a few minutes...");
//        System.out.println(Paths.get(System.getProperty("user.dir") + "\\Dockerfile"));
//
//        app.start();
//
//        try {
//            // Get the mapped port of the container
//            Integer mappedPort = app.getMappedPort(9095);
//
//            // Send a request to the container
//            given()
//                    .baseUri("http://localhost:" + mappedPort)
//                    .basePath("/api")
//                    .when()
//                    .body(new JSONObject()
//                            .put("savingsAmount", 6)
//                            .put("currentPrices", new JSONArray().put(1).put(2).put(5))
//                            .put("futurePrices", new JSONArray().put(2).put(3).put(20))
//                            .toString())
//                    .header("Content-Type", "application/json")
//                    .header("Accept", "application/json")
//                    .post("/calculate")
//                    .then()
//                    .body("maxProfit", org.hamcrest.Matchers.equalTo(16))
//                    .and().body("indices", org.hamcrest.Matchers.notNullValue())
//                    .statusCode(200);
//            System.out.println("Test passed");
//        } catch (JSONException e) {
//            throw new RuntimeException(e);
//        } finally {
//            app.stop();
//        }
//    }

//    @Test
//    public void testSite(){
//        site.start();
//
//        try {
//            Integer mappedPort = site.getMappedPort(3000);
//
//            given()
//                    .baseUri("http://localhost:" + mappedPort)
//                    .basePath("/")
//                    .when()
//                    .get("/")
//                    .then()
//                    .statusCode(200);
//        } finally {
//            site.stop();
//        }
//
//    }

//    @Test
//    public void testCompose() {
//        DockerComposeContainer environment = new DockerComposeContainer(
//                new File("docker-compose-test.yml"))
//                .withExposedService("app", 9095,
//                        Wait.forHttp("/api/health")
//                                .forStatusCode(200))
//                                .withStartupTimeout(Duration.ofMinutes(5))
//                .withExposedService("site", 3000)
//                        .withLocalCompose(true);
//
//        System.out.println("Starting docker-compose...");
//        System.out.println("This may take a few minutes...");
//
//        environment.start();
//
//        try {
//
//            // Get the host and port of the "app" service
//            String appHost = app.getServiceHost("app_1", 9095);
//            Integer appPort = app.getServicePort("app_1", 9095);
//
//            // Get the host and port of the "app" service
////            String siteHost = environment.getServiceHost("site_1", 3000);
////            Integer sitePort = environment.getServicePort("site_1", 3000);
//
//            // Print the host and port to the console
////            System.out.println("App service running at " + appHost + ":" + appPort);
//
//            // Print the host and port to the console
////            System.out.println("Site service running at " + siteHost + ":" + sitePort);
//
////            given()
////                    .baseUri("http://localhost:9095")
////                    .basePath("/api")
////                    .when()
////                    .body("{ 'savingsAmount': 6, 'currentPrices': [1, 2, 5], 'futurePrices': [2, 3, 20]}")
////                    .post("/calculate")
////                    .then()
////                    .statusCode(200);
//
//
//            // Get the mapped port of the container
//            Integer mappedPort = app.getMappedPort(9095);
//
//            // Send a request to the container
//            given()
//                    .baseUri("http://localhost:" + mappedPort)
//                    .basePath("/api")
//                    .when()
//                    .body(new JSONObject()
//                            .put("savingsAmount", 6)
//                            .put("currentPrices", new JSONArray().put(1).put(2).put(5))
//                            .put("futurePrices", new JSONArray().put(2).put(3).put(20))
//                            .toString())
//                    .header("Content-Type", "application/json")
//                    .header("Accept", "application/json")
//                    .post("/calculate")
//                    .then()
//                    .body("maxProfit", org.hamcrest.Matchers.equalTo(16))
//                    .and().body("indices", org.hamcrest.Matchers.notNullValue())
//                    .statusCode(200);
//        } catch (JSONException e) {
//            throw new RuntimeException(e);
//        } finally {
//            app.stop();
//        }
//    }

    public static DockerComposeContainer environment =
            new DockerComposeContainer(Paths.get(System.getProperty("user.dir") + "\\docker-compose-test.yml").toFile())
                    .withExposedService("site_1", 3000)
                    .withExposedService("app_1", 9095);


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
        // Wait.forHttp("http://localhost:" + siteMappedPort).withStartupTimeout(Duration.ofSeconds(60));

    }

    @AfterAll
    public static void tearDown() {
        environment.stop();
    }

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


        // Send a request to the site container
//        given().baseUri("http://localhost:" + siteMappedPort)
//                .when().get("/")
//                .then().statusCode(200);
    }

}
