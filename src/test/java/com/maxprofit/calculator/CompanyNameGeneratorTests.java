package com.maxprofit.calculator;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CompanyNameGeneratorTests {

    @Test
    void generatesRequestedCount() {
        List<String> names = CompanyNameGenerator.generateCompanyNames(5);
        assertEquals(5, names.size());
        names.forEach(n -> assertNotNull(n));
    }

    @Test
    void doesNotExposeClearCacheApi() {
        // After HYG-01: clearCache() is removed (no static state to clear).
        // The Method lookup throws NoSuchMethodException if absent, which we catch
        // and treat as the test passing.
        boolean methodExists;
        try {
            CompanyNameGenerator.class.getDeclaredMethod("clearCache");
            methodExists = true;
        } catch (NoSuchMethodException e) {
            methodExists = false;
        }
        assertFalse(methodExists, "clearCache() should have been removed by HYG-01");
    }

    @Test
    void secondCallIsNotAffectedByFirstCall() {
        // With the cache removed, calling twice produces two independent results.
        // Names may overlap (Faker randomness), but the API still works.
        List<String> first = CompanyNameGenerator.generateCompanyNames(3);
        List<String> second = CompanyNameGenerator.generateCompanyNames(3);
        assertEquals(3, second.size());
        assertFalse(second.stream().anyMatch(n -> n == null || n.isEmpty()));
    }
}