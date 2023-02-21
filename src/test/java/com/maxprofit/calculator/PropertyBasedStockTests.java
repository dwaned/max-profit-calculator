package com.maxprofit.calculator;

import net.jqwik.api.*;
import net.jqwik.api.constraints.IntRange;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Property Based Tests
 * These are property based tests ...
 */
public class PropertyBasedStockTests {

    /*
    Possible Properties
        validStockPrices
        validSavings
        lossStockPrices
        profitStockPrices
     */

    @Provide
    Arbitrary<List<Integer>> StockPrices() {
        return Arbitraries.integers().between(1,100).list().ofSize(5);
    }

    @Provide
    Arbitrary<Integer> PricesLength() {
        return Arbitraries.integers().between(1, 5);
    }

    @Property
    public void positiveScenarios(
            @ForAll @IntRange(min = 1, max = 1000) int savings,
            @ForAll("StockPrices") ArrayList<Integer> currentPrices,
            @ForAll("StockPrices") ArrayList<Integer> futurePrices)  {
//        Statistics.collect(savings,currentPrices,futurePrices);
        CalculationResult result = Stock.returnIndicesMaxProfit(savings, currentPrices, futurePrices);
        assertEquals(currentPrices.size(), futurePrices.size());
        assertFalse(currentPrices.stream().anyMatch(i -> i < 0));
        assertFalse(futurePrices.stream().anyMatch(i -> i < 0));
        assertNotNull(result);
        assertNotNull(result.getIndices());
        if (result.getIndices().size() > 0) {
            int profit;
            for (int i = 0; i < result.getIndices().size(); i++) {
                profit = 0;
                for (int j = 0; j < result.getIndices().get(i).size(); j++) {
                    profit += futurePrices.get(result.getIndices().get(i).get(j)) - currentPrices.get(result.getIndices().get(i).get(j));
                }
                assertEquals(profit, result.getMaxProfit());

                /*
                      result.getIndices() size 2
                      0 = size 1 [3]
                      1 = size 1 [4]


                      Original Sample
                        ---------------
                          arg0: 145
                          arg1: [11, 87, 7, 28, 79]
                          arg2: [2, 10, 11, 97, 6]

                          Original Error
                          --------------
                          java.lang.AssertionError:
                            expected:<69> but was:<73>

                 */
            }

        }
        else {
            assertEquals(0, result.getMaxProfit());
        }
//        assertTrue(result.getIndices().size() > 0);
    }

//    @Property
//    public void savingsLessThanAnyStockPrice(
//            @ForAll @IntRange(min = 1, max = 1000) int savings,
//            @ForAll("StockPrices") ArrayList<Integer> currentPrices,
//            @ForAll("StockPrices") ArrayList<Integer> futurePrices)  {
//        Data result = Stock.returnIndicesMaxProfit(savings, currentPrices, futurePrices);
//        assertEquals(currentPrices.size(), futurePrices.size());
//        assertFalse(currentPrices.stream().anyMatch(i -> i < 0));
//        assertFalse(futurePrices.stream().anyMatch(i -> i < 0));
//        assertNotNull(result);
//        assertNotNull(result.getIndices());
//        assertTrue(result.getIndices().size() > 0);
//    }

}
