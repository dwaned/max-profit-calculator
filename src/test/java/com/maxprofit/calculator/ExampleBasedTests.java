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
public class ExampleBasedTests {
    @Test
    public void shouldReturnSizeOfAllPossiblePermutationsForGivenStockPriceSize() {
        Helper helper = new Helper();
        assertEquals(7, helper.getAllPermutationsForListOfSize(3).size());
        assertEquals(1, helper.getAllPermutationsForListOfSize(1).size());
        assertEquals(15, helper.getAllPermutationsForListOfSize(4).size());
    }

    @Test
    public void shouldWorkWithOneIndex() {
        int result = Stock.returnIndicesMaxProfit(1, Collections.singletonList(1), Collections.singletonList(3)).maxProfit;
        assertEquals(2, result);
    }

    @Test
    public void shouldWorkWithTwoIndices() {
        int result = Stock.returnIndicesMaxProfit(1, Arrays.asList(1, 1), Arrays.asList(3, 4)).maxProfit;
        assertEquals(3, result);
    }

    @Test
    public void shouldWorkWithThreeIndices() {
        Data result = Stock.returnIndicesMaxProfit(5, Arrays.asList(1, 2, 5), Arrays.asList(2, 3, 20));

        assertEquals(15, result.maxProfit);
        assertEquals(Collections.singletonList(2), result.indices.get(0));

    }

    @Test
    public void shouldWorkWithLargerSet() {
        Data result = Stock.returnIndicesMaxProfit(50, Arrays.asList(1, 2, 5, 34, 22, 56, 34), Arrays.asList(2, 3, 20, 35, 15, 101, 20));

        assertEquals(18, result.maxProfit);
        assertEquals(Arrays.asList(0, 1, 2, 3), result.indices.get(0));

    }

    @Test
    public void shouldUseAllSavings() {
        Data result = Stock.returnIndicesMaxProfit(6, Arrays.asList(1, 2, 5), Arrays.asList(2, 3, 20));

        assertEquals(16, result.maxProfit);
        assertEquals(Arrays.asList(0, 2), result.indices.get(0));

    }

    @Test
    public void shouldWorkWithLowerFuturePrice() {
        Data result = Stock.returnIndicesMaxProfit(16, Arrays.asList(1, 2, 5, 8), Arrays.asList(2, 3, 6, 1));

        assertEquals(3, result.maxProfit);
        assertEquals(Arrays.asList(0, 1, 2), result.indices.get(0));

    }

    @Test
    public void shouldReturnEmtyListAndZeroProfitIfOnlyLossCanBeMade() {
        Data result = Stock.returnIndicesMaxProfit(5, Arrays.asList(5, 2, 3), Arrays.asList(1, 0, 2));

        assertEquals(0, result.maxProfit);
        assertTrue(result.indices.isEmpty());
    }

    @Test
    public void shouldUseAllSavingsIfAllFuturePricesAreGreaterThanCurrentPrices() {
        Data result = Stock.returnIndicesMaxProfit(16, Arrays.asList(1, 2, 5, 8), Arrays.asList(2, 3, 6, 9));

        assertEquals(4, result.maxProfit);
        assertEquals(Arrays.asList(0, 1, 2, 3), result.indices.get(0));
    }

    @Test
    public void shouldChoseCheapestCombination() {
        Data result = Stock.returnIndicesMaxProfit(7, Arrays.asList(1, 2, 5), Arrays.asList(2, 3, 20));

        assertEquals(16, result.maxProfit);
        assertEquals(Arrays.asList(0, 2), result.indices.get(0));

    }

    @Test
    public void shouldReturnZeroProfitAndResultIndicesIfCurrentPricesAreEmpty() {
        ArrayList<Integer> currentValue = new ArrayList<>();
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, currentValue, new ArrayList<>());
        assertTrue(actualReturnIndicesMaxProfitResult.indices.isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }

    @Test
    public void shouldReturnZeroProfitAndResultIndicesIfFuturePricesAreEmpty() {
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, Collections.singletonList(2), new ArrayList<>());
        assertTrue(actualReturnIndicesMaxProfitResult.indices.isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }

    @Test
    public void shouldReturnZeroProfitAndEmptyIndicesIfSavingsNotEnoughForAnyStockPrice() {
        ArrayList<Integer> currentPrices = new ArrayList<>(Arrays.asList(2, 3, 4));
        ArrayList<Integer> futurePrices = new ArrayList<>(Arrays.asList(0, 20, 30));
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, currentPrices, futurePrices);
        assertTrue(actualReturnIndicesMaxProfitResult.indices.isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }

    @Test
    public void shouldReturnEmptyIndicesAndZeroProfitIfStockPriceIsNegative() {
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, Collections.singletonList(0), Collections.singletonList(-1));
        assertTrue(actualReturnIndicesMaxProfitResult.indices.isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }
}

