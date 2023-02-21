package com.maxprofit.calculator;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Example Based Tests
 * These are unit tests covering the Stock class in preparation for refactoring the functions of the class.
 */
class ExampleBasedTests {
    @Test
    void shouldReturnSizeOfAllPossiblePermutationsForGivenStockPriceSize() {
        Helper helper = new Helper();
        assertEquals(7, helper.getAllPermutationsForListOfSize(3).size());
        assertEquals(1, helper.getAllPermutationsForListOfSize(1).size());
        assertEquals(15, helper.getAllPermutationsForListOfSize(4).size());
    }

    @Test
    void shouldWorkWithOneIndex() {
        int result = Stock.returnIndicesMaxProfit(1, Collections.singletonList(1), Collections.singletonList(3))
                .getMaxProfit();
        assertEquals(2, result);
    }

    @Test
    void shouldWorkWithTwoIndices() {
        int result = Stock.returnIndicesMaxProfit(1, Arrays.asList(1, 1), Arrays.asList(3, 4)).getMaxProfit();
        assertEquals(3, result);
    }

    @Test
    void shouldWorkWithThreeIndices() {
        CalculationResult result = Stock.returnIndicesMaxProfit(5, Arrays.asList(1, 2, 5), Arrays.asList(2, 3,
                20));

        assertEquals(15, result.getMaxProfit());
        assertEquals(Collections.singletonList(2), result.getIndices().get(0));

    }

    @Test
    void shouldWorkWithLargerSet() {
        CalculationResult result = Stock.returnIndicesMaxProfit(50, Arrays.asList(1, 2, 5, 34, 22, 56, 34),
                Arrays.asList(2, 3, 20, 35, 15, 101, 20));

        assertEquals(18, result.getMaxProfit());
        assertEquals(Arrays.asList(0, 1, 2, 3), result.getIndices().get(0));

    }

    @Test
    void shouldUseAllSavings() {
        CalculationResult result = Stock.returnIndicesMaxProfit(6, Arrays.asList(1, 2, 5),
                Arrays.asList(2, 3, 20));

        assertEquals(16, result.getMaxProfit());
        assertEquals(Arrays.asList(0, 2), result.getIndices().get(0));

    }

    @Test
    void shouldWorkWithLowerFuturePrice() {
        CalculationResult result = Stock.returnIndicesMaxProfit(16, Arrays.asList(1, 2, 5, 8),
                Arrays.asList(2, 3, 6, 1));

        assertEquals(3, result.getMaxProfit());
        assertEquals(Arrays.asList(0, 1, 2), result.getIndices().get(0));

    }

    @Test
    void shouldReturnEmtyListAndZeroProfitIfOnlyLossCanBeMade() {
        CalculationResult result = Stock.returnIndicesMaxProfit(5, Arrays.asList(5, 2, 3),
                Arrays.asList(1, 0, 2));

        assertEquals(0, result.getMaxProfit());
        assertTrue(result.getIndices().isEmpty());
    }

    @Test
    void shouldUseAllSavingsIfAllFuturePricesAreGreaterThanCurrentPrices() {
        CalculationResult result = Stock.returnIndicesMaxProfit(16, Arrays.asList(1, 2, 5, 8),
                Arrays.asList(2, 3, 6, 9));

        assertEquals(4, result.getMaxProfit());
        assertEquals(Arrays.asList(0, 1, 2, 3), result.getIndices().get(0));
    }

    @Test
    void shouldChoseCheapestCombination() {
        CalculationResult result = Stock.returnIndicesMaxProfit(7, Arrays.asList(1, 2, 5),
                Arrays.asList(2, 3, 20));

        assertEquals(16, result.getMaxProfit());
        assertEquals(Arrays.asList(0, 2), result.getIndices().get(0));

    }

    @Test
    void shouldReturnZeroProfitAndResultIndicesIfCurrentPricesAreEmpty() {
        ArrayList<Integer> currentValue = new ArrayList<>();
        CalculationResult actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, currentValue,
                new ArrayList<>());
        assertTrue(actualReturnIndicesMaxProfitResult.getIndices().isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.getMaxProfit());
    }

    @Test
    void shouldReturnZeroProfitAndResultIndicesIfFuturePricesAreEmpty() {
        CalculationResult actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, Collections.singletonList(2),
                new ArrayList<>());
        assertTrue(actualReturnIndicesMaxProfitResult.getIndices().isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.getMaxProfit());
    }

    @Test
    void shouldReturnZeroProfitAndEmptyIndicesIfSavingsNotEnoughForAnyStockPrice() {
        ArrayList<Integer> currentPrices = new ArrayList<>(Arrays.asList(2, 3, 4));
        ArrayList<Integer> futurePrices = new ArrayList<>(Arrays.asList(0, 20, 30));
        CalculationResult actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, currentPrices,
                futurePrices);
        assertTrue(actualReturnIndicesMaxProfitResult.getIndices().isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.getMaxProfit());
    }

    @Test
    void shouldReturnEmptyIndicesAndZeroProfitIfStockPriceIsNegative() {
        CalculationResult actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1,
                Collections.singletonList(0), Collections.singletonList(-1));
        assertTrue(actualReturnIndicesMaxProfitResult.getIndices().isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.getMaxProfit());
    }
}

