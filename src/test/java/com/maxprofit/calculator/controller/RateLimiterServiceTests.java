package com.maxprofit.calculator.controller;

import net.jqwik.api.Arbitraries;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.Provide;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

/**
 * Property-based tests for the {@code /api/calculate} rate limiter (SEC-05).
 *
 * <p>Verifies the Bucket4j-backed limiter honours the configured per-IP
 * capacity under fuzzed burst patterns. Uses a frozen {@link RateLimiterService}
 * constructed directly with a small capacity (5) so the property can exhaust
 * the bucket in a single test invocation without waiting for refill.
 *
 * <p>Invariants checked:
 * <ul>
 *   <li>For any IP key, the first {@code capacity} rapid {@code tryAcquire}
 *       calls return {@code true}.</li>
 *   <li>The next call (the {@code capacity + 1}-th) returns {@code false}.</li>
 *   <li>Different IP keys have independent buckets — a request from IP A
 *       being throttled does not affect IP B.</li>
 * </ul>
 */
@SuppressWarnings({"checkstyle:LineLength", "checkstyle:magicnumber"})
class RateLimiterServiceTests {

    private static final int CAPACITY = 5;

    @Property
    void firstCapacityAcquiresSucceedForAnyKey(@ForAll("ipKeys") final String key) {
        RateLimiterService limiter = new RateLimiterService(
                new RateLimitProperties(true, CAPACITY, CAPACITY, 1));

        for (int i = 0; i < CAPACITY; i++) {
            assertTrue(limiter.tryAcquire(key),
                    "Acquires 1.." + CAPACITY + " must succeed for key=" + key);
        }
        assertFalse(limiter.tryAcquire(key),
                "Acquire " + (CAPACITY + 1) + " must be rejected for key=" + key);
    }

    @Property
    void keysHaveIndependentBuckets(@ForAll("ipKeys") final String keyA,
                                    @ForAll("ipKeys") final String keyB) {
        org.junit.jupiter.api.Assumptions.assumeTrue(!keyA.equals(keyB),
                "Property requires distinct keys");

        RateLimiterService limiter = new RateLimiterService(
                new RateLimitProperties(true, CAPACITY, CAPACITY, 1));

        // Exhaust keyA's bucket.
        for (int i = 0; i < CAPACITY; i++) {
            assertTrue(limiter.tryAcquire(keyA));
        }
        assertFalse(limiter.tryAcquire(keyA));

        // keyB's bucket should still be fresh.
        for (int i = 0; i < CAPACITY; i++) {
            assertTrue(limiter.tryAcquire(keyB),
                    "keyB must have an independent bucket; got false at acquire " + (i + 1));
        }
        assertFalse(limiter.tryAcquire(keyB));
    }

    @Property
    void disabledLimiterNeverRejects(@ForAll("ipKeys") final String key) {
        RateLimiterService limiter = new RateLimiterService(
                new RateLimitProperties(false, CAPACITY, CAPACITY, 1));

        // Many rapid calls — none should be rejected when the limiter is off.
        for (int i = 0; i < CAPACITY * 3; i++) {
            assertTrue(limiter.tryAcquire(key),
                    "Disabled limiter must never reject; got false at " + i);
        }
    }

    @Property
    void totalAcceptedCountEqualsCapacity(@ForAll("ipKeys") final String key,
                                          @ForAll("burstSizes") final int burstSize) {
        org.junit.jupiter.api.Assumptions.assumeTrue(burstSize >= 0);

        RateLimiterService limiter = new RateLimiterService(
                new RateLimitProperties(true, CAPACITY, CAPACITY, 1));

        int accepted = 0;
        for (int i = 0; i < burstSize; i++) {
            if (limiter.tryAcquire(key)) {
                accepted++;
            }
        }

        assertEquals(Math.min(burstSize, CAPACITY), accepted,
                "Accepted count must be min(burstSize, capacity)");
    }

    @Provide
    Arbitrary<String> ipKeys() {
        return Arbitraries.strings().withCharRange('a', 'z').ofMinLength(1).ofMaxLength(20);
    }

    @Provide
    Arbitrary<Integer> burstSizes() {
        return Arbitraries.integers().between(0, 50);
    }
}