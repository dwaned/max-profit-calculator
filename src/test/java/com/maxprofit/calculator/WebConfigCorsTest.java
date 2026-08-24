package com.maxprofit.calculator;

import com.maxprofit.calculator.controller.CorsProperties;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.WebApplicationContextRunner;
import org.springframework.web.servlet.config.annotation.CorsRegistration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class WebConfigCorsTest {

    private final WebApplicationContextRunner runner = new WebApplicationContextRunner()
            .withUserConfiguration(WebConfig.class)
            .withBean(CorsProperties.class,
                    () -> new CorsProperties(List.of("https://app.example.com", "http://localhost:9095")));

    @Test
    void webConfigIsInstantiableWithCorsProperties() {
        runner.run(ctx -> {
            WebConfig webConfig = ctx.getBean(WebConfig.class);
            assertThat(webConfig).isNotNull();
        });
    }

    @Test
    void addCorsMappingsUsesConfiguredOriginsNotWildcard() {
        runner.run(ctx -> {
            WebConfig webConfig = ctx.getBean(WebConfig.class);
            CorsRegistry registry = mock(CorsRegistry.class);
            CorsRegistration registration = mock(CorsRegistration.class);
            when(registry.addMapping(anyString())).thenReturn(registration);
            when(registration.allowedOrigins(any(String[].class))).thenReturn(registration);
            when(registration.allowedMethods(any(String[].class))).thenReturn(registration);
            when(registration.allowedHeaders(any(String[].class))).thenReturn(registration);
            when(registration.allowCredentials(any(Boolean.class))).thenReturn(registration);

            webConfig.addCorsMappings(registry);

            verify(registry).addMapping("/api/**");
            verify(registration).allowedOrigins(eq(new String[]{
                    "https://app.example.com", "http://localhost:9095"}));
            verify(registration).allowCredentials(eq(false));
        });
    }
}