package com.maxprofit.calculator;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Example Based Tests
 * These are unit tests covering the Stock class in preparation for
 * refactoring the functions of the class.
 */

@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength"})
class ExampleBasedTests {
    @Test
    void shouldWorkWithOneIndex() {
        int result = Stock.returnIndicesMaxProfit(1,
                        Collections.singletonList(1),
                        Collections.singletonList(3))
                .getMaxProfit();
        assertEquals(2, result);
    }

    @Test
    void shouldWorkWithTwoIndices() {
        int result = Stock.returnIndicesMaxProfit(1, Arrays.asList(1, 1),
                Arrays.asList(3, 4)).getMaxProfit();
        assertEquals(3, result);
    }

    @Test
    void shouldWorkWithThreeIndices() {
        CalculationResult result = Stock.returnIndicesMaxProfit(5,
                Arrays.asList(1, 2, 5), Arrays.asList(2, 3,
                20));

        assertEquals(15, result.getMaxProfit());
        assertEquals(Collections.singletonList(2), result.getIndices());

    }

    @Test
    void shouldWorkWithLargerSet() {
        CalculationResult result = Stock.returnIndicesMaxProfit(50,
                Arrays.asList(1, 2, 5, 34, 22, 56, 34),
                Arrays.asList(2, 3, 20, 35, 15, 101, 20));

        assertEquals(18, result.getMaxProfit());
        assertEquals(Arrays.asList(0, 1, 2, 3), result.getIndices());

    }

    @Test
    void shouldUseAllSavings() {
        CalculationResult result = Stock.returnIndicesMaxProfit(6,
                Arrays.asList(1, 2, 5),
                Arrays.asList(2, 3, 20));

        assertEquals(16, result.getMaxProfit());
        assertEquals(Arrays.asList(0, 2), result.getIndices());
        assertEquals(6, result.getSavingsUsed());
        assertEquals(0, result.getRemainingSavings());

    }

    @Test
    void shouldWorkWithLowerFuturePrice() {
        CalculationResult result = Stock.returnIndicesMaxProfit(16,
                Arrays.asList(1, 2, 5, 8),
                Arrays.asList(2, 3, 6, 1));

        assertEquals(3, result.getMaxProfit());
        assertEquals(Arrays.asList(0, 1, 2), result.getIndices());

    }

    @Test
    void shouldReturnEmptyListAndZeroProfitIfOnlyLossCanBeMade() {
        // Every future price is below the current price at the same index — only a
        // loss is possible. Note: we use values >= 1 in both lists because the
        // engine now rejects 0/negative prices (HYG-04); we just can't make
        // a profit with these inputs.
        CalculationResult result = Stock.returnIndicesMaxProfit(5,
                Arrays.asList(5, 2, 3),
                Arrays.asList(1, 1, 1));

        assertEquals(0, result.getMaxProfit());
        assertTrue(result.getIndices().isEmpty());
    }

    @Test
    void shouldUseAllSavingsIfAllFuturePricesAreGreaterThanCurrentPrices() {
        CalculationResult result = Stock.returnIndicesMaxProfit(16,
                Arrays.asList(1, 2, 5, 8),
                Arrays.asList(2, 3, 6, 9));

        assertEquals(4, result.getMaxProfit());
        assertEquals(Arrays.asList(0, 1, 2, 3), result.getIndices());
    }

    @Test
    void shouldChooseCheapestCombination() {
        CalculationResult result = Stock.returnIndicesMaxProfit(7,
                Arrays.asList(1, 2, 5),
                Arrays.asList(2, 3, 20));

        assertEquals(16, result.getMaxProfit());
        assertEquals(Arrays.asList(0, 2), result.getIndices());

    }

    /**
     * Explicit tie-break test for Phase 2 criterion #5:
     * two distinct subsets achieving the same max profit, where the
     * smaller-cost one must win.
     *
     * <p>buy  = [2, 3, 4]
     * <br>sell = [6, 7, 8]
     * <br>profits = [4, 4, 4]
     * <br>savings = 6
     *
     * <p>Subsets with profit 8:
     * <ul>
     *   <li>{@code {0, 1}} → cost 5, profit 8 ← must be chosen (smaller cost)</li>
     *   <li>{@code {0, 2}} → cost 6, profit 8</li>
     * </ul>
     * {@code {1, 2}} (cost 7) and {@code {0, 1, 2}} (cost 9) exceed savings.
     */
    @Test
    void shouldPreferSmallestCostAmongProfitTies() {
        CalculationResult result = Stock.returnIndicesMaxProfit(6,
                Arrays.asList(2, 3, 4),
                Arrays.asList(6, 7, 8));

        assertEquals(8, result.getMaxProfit());
        assertEquals(5, result.getSavingsUsed());
        assertEquals(1, result.getRemainingSavings());
        assertEquals(Arrays.asList(0, 1), result.getIndices());
    }

    @Test
    void shouldReturnZeroProfitAndResultIndicesIfCurrentPricesAreEmpty() {
        ArrayList<Integer> currentValue = new ArrayList<>();
        CalculationResult actualReturnIndicesMaxProfitResult =
                Stock.returnIndicesMaxProfit(1, currentValue,
                new ArrayList<>());
        assertTrue(actualReturnIndicesMaxProfitResult.getIndices().isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.getMaxProfit());
    }

    @Test
    void shouldThrowWhenFuturePricesAreEmptyButCurrentIsNot() {
        assertThrows(IllegalArgumentException.class,
                () -> Stock.returnIndicesMaxProfit(1, Collections.singletonList(2),
                        new ArrayList<>()));
    }

    @Test
    void shouldThrowWhenAnyPriceIsNonPositive() {
        ArrayList<Integer> currentPrices = new ArrayList<>(Arrays.asList(2, 3, 4));
        ArrayList<Integer> futurePrices = new ArrayList<>(Arrays.asList(0, 20, 30));
        assertThrows(IllegalArgumentException.class,
                () -> Stock.returnIndicesMaxProfit(1, currentPrices, futurePrices));
    }

    @Test
    void shouldThrowWhenAnyPriceIsNegative() {
        assertThrows(IllegalArgumentException.class,
                () -> Stock.returnIndicesMaxProfit(1,
                        Collections.singletonList(0), Collections.singletonList(-1)));
    }

    @Test
    void shouldThrowWhenCurrentAndFutureSizesDiffer() {
        assertThrows(IllegalArgumentException.class,
                () -> Stock.returnIndicesMaxProfit(1,
                        Collections.singletonList(1), Arrays.asList(1, 2)));
    }
}
