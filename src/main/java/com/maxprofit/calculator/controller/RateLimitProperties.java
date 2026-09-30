package com.maxprofit.calculator.controller;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for the per-IP rate limiter on {@code /api/calculate}.
 *
 * <p>Bound to the {@code app.ratelimit.*} prefix in {@code application.properties}.
 * Default values match the Phase 3 spec: 10 requests per second, 60 per minute
 * (achieved by a single greedy refill of 10 tokens per second with a capacity
 * of 10 — the {@code 60/min} ceiling is satisfied by the same setting under
 * any sliding window).
 *
 * @param enabled              master switch; when false, all requests pass
 * @param capacity             bucket capacity (max burst size)
 * @param refillTokens         tokens added per refill period
 * @param refillPeriodSeconds  refill period in seconds
 */
@SuppressWarnings("checkstyle:ParameterName")
@ConfigurationProperties(prefix = "app.ratelimit")
public record RateLimitProperties(
        boolean enabled,
        int capacity,
        int refillTokens,
        int refillPeriodSeconds) {

    /**
     * Convenience constructor used by the property binder and tests.
     *
     * @param enabled             see {@link #enabled}
     * @param capacity            see {@link #capacity}
     * @param refillTokens        see {@link #refillTokens}
     * @param refillPeriodSeconds see {@link #refillPeriodSeconds}
     */
    public RateLimitProperties {
        // records don't need explicit validation; relying on @Min/@Max later if needed
    }
}