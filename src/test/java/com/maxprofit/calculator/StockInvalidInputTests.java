package com.maxprofit.calculator;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Property-based tests asserting {@link Stock#returnIndicesMaxProfit} throws
 * {@link IllegalArgumentException} (not silent empty results) for invalid inputs.
 * This is the only behavior change in the v2 milestone; see HYG-04.
 */
@SuppressWarnings({"checkstyle:LineLength", "checkstyle:magicnumber"})
class StockInvalidInputTests {

    static Stream<Arguments> invalidInputs() {
        return Stream.of(
                Arguments.of("null currentValue",   null,                     Arrays.asList(1, 2, 3), "currentValue"),
                Arguments.of("null futureValue",    Arrays.asList(1, 2, 3),   null,                   "futureValue"),
                Arguments.of("mismatched sizes",    Arrays.asList(1, 2),     Arrays.asList(1),       "size"),
                Arguments.of("non-positive current", Arrays.asList(0, 1),     Arrays.asList(1, 2),   "positive"),
                Arguments.of("non-positive future",  Arrays.asList(1, 2),     Arrays.asList(1, 0),   "positive"),
                Arguments.of("oversize list",       Collections.nCopies(101, 1), Collections.nCopies(101, 2), "exceed")
        );
    }

    @ParameterizedTest
    @MethodSource("invalidInputs")
    void throwsOnInvalidInput(final String label,
                              final List<Integer> currentValue,
                              final List<Integer> futureValue,
                              final String expectedMessageFragment) {
        final IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> Stock.returnIndicesMaxProfit(10, currentValue, futureValue));
        assertThat(ex.getMessage())
                .as("message for case '%s'", label)
                .containsIgnoringCase(expectedMessageFragment);
    }
}