package com.maxprofit.calculator;

import com.maxprofit.calculator.controller.CorsProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SuppressWarnings({"checkstyle:DesignForExtension", "checkstyle:FinalParameters"})
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final CorsProperties corsProperties;

    public WebConfig(final CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }

    @Override
    public void addCorsMappings(final CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(corsProperties.allowedOrigins().toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}