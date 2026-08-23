package com.maxprofit.calculator.controller;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Per-key token-bucket rate limiter backed by Bucket4j.
 *
 * <p>Each key (typically a client IP) gets its own {@link Bucket} created on
 * first use and cached for the lifetime of the service. When
 * {@link RateLimitProperties#enabled()} is {@code false} {@link #tryAcquire}
 * always returns {@code true}.
 */
public class RateLimiterService {

    private final RateLimitProperties properties;
    private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimiterService(final RateLimitProperties properties) {
        this.properties = properties;
    }

    /**
     * Attempts to consume one token from the bucket associated with {@code key}.
     *
     * @param key the client identifier (typically a remote IP)
     * @return {@code true} if the request may proceed; {@code false} if it
     *         should be rejected with HTTP 429
     */
    public boolean tryAcquire(final String key) {
        if (!properties.enabled()) {
            return true;
        }
        Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket());
        return bucket.tryConsume(1);
    }

    private Bucket newBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(properties.capacity())
                .refillGreedy(properties.refillTokens(),
                        Duration.ofSeconds(properties.refillPeriodSeconds()))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }
}