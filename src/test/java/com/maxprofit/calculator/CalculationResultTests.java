package com.maxprofit.calculator;

import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Tests for {@link CalculationResult} constructor invariants.
 *
 * Specifically guards against {@code getCompanyNames()} returning {@code null}
 * for callers that use the no-arg or 4-arg constructors — every caller
 * should be able to iterate {@code getCompanyNames()} without a null check.
 */
@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength"})
class CalculationResultTests {

    @Test
    void fourArgConstructorShouldReturnNonNullCompanyNames() {
        CalculationResult result = new CalculationResult(0, Collections.emptyList(), 0, 0);
        assertNotNull(result.getCompanyNames(), "getCompanyNames() must not return null");
    }

    @Test
    void fourArgConstructorShouldReturnEmptyCompanyNamesWhenNotProvided() {
        CalculationResult result = new CalculationResult(0, Collections.emptyList(), 0, 0);
        List<String> names = result.getCompanyNames();
        assertEquals(0, names.size(), "getCompanyNames() should be empty by default");
    }

    @Test
    void noArgConstructorShouldReturnNonNullCompanyNames() {
        CalculationResult result = new CalculationResult();
        assertNotNull(result.getCompanyNames(), "getCompanyNames() must not return null");
    }

    @Test
    void fiveArgConstructorShouldStillReturnProvidedCompanyNames() {
        List<String> provided = List.of("Acme", "Beta");
        CalculationResult result = new CalculationResult(0, Collections.emptyList(), 0, 0, provided);
        assertEquals(provided, result.getCompanyNames(),
                "Explicit company names must be preserved verbatim");
    }
}