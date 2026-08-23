package com.maxprofit.calculator.controller;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Exposes the {@link RateLimiterService} bean and binds the
 * {@code app.ratelimit.*} configuration properties.
 *
 * <p>The filter itself is a {@code @Component} (see {@link RateLimitFilter}) and
 * Spring Boot auto-registers it for the servlet container. The filter
 * internally restricts its work to {@code /api/calculate} so other endpoints
 * (notably {@code /api/health}) are never throttled.
 */
@Configuration
@EnableConfigurationProperties(RateLimitProperties.class)
public class RateLimitFilterConfig {

    @Bean
    public RateLimiterService rateLimiterService(final RateLimitProperties properties) {
        return new RateLimiterService(properties);
    }
}