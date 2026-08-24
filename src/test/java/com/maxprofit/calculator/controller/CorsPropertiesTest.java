package com.maxprofit.calculator.controller;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

class CorsPropertiesTest {

    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(TestConfig.class)
            .withPropertyValues(
                    "app.cors.allowed-origins=http://localhost:9095,http://localhost:5173");

    @Test
    void bindsOriginsFromCommaSeparatedProperty() {
        runner.run(ctx -> {
            CorsProperties props = ctx.getBean(CorsProperties.class);
            assertThat(props.allowedOrigins()).containsExactly(
                    "http://localhost:9095", "http://localhost:5173");
        });
    }

    @EnableConfigurationProperties(CorsProperties.class)
    static class TestConfig {}
}