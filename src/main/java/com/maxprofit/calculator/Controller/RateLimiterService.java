package com.maxprofit.calculator.controller;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;

import java.time.Duration;

/**
 * Per-key token-bucket rate limiter backed by Bucket4j.
 *
 * <p>Each key (typically a client IP) gets its own {@link Bucket} created on
 * first use. Buckets idle for longer than {@link #IDLE_EXPIRY} are evicted and
 * the cache is capped at {@link #MAX_TRACKED_CLIENTS} entries, so memory stays
 * bounded however many distinct clients appear. When
 * {@link RateLimitProperties#enabled()} is {@code false} {@link #tryAcquire}
 * always returns {@code true}.
 */
public class RateLimiterService {

    static final Duration IDLE_EXPIRY = Duration.ofMinutes(10);
    static final long MAX_TRACKED_CLIENTS = 100_000;

    private final RateLimitProperties properties;
    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
            .expireAfterAccess(IDLE_EXPIRY)
            .maximumSize(MAX_TRACKED_CLIENTS)
            .build();

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
        Bucket bucket = buckets.get(key, k -> newBucket());
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