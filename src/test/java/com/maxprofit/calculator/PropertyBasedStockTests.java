package com.maxprofit.calculator;

import net.jqwik.api.*;
import net.jqwik.api.constraints.IntRange;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

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
        Data result = Stock.returnIndicesMaxProfit(savings, currentPrices, futurePrices);
        assertEquals(currentPrices.size(), futurePrices.size());
        assertFalse(currentPrices.stream().anyMatch(i -> i < 0));
        assertFalse(futurePrices.stream().anyMatch(i -> i < 0));
        assertNotNull(result);
        assertNotNull(result.indices);
        if (result.indices.size() > 0) {
            int profit;
            for (int i = 0; i < result.indices.size(); i++) {
                profit = 0;
                for (int j = 0; j < result.indices.get(i).size(); j++) {
                    profit += futurePrices.get(result.indices.get(i).get(j)) - currentPrices.get(result.indices.get(i).get(j));
                }
                assertEquals(profit, result.maxProfit);

                /*
                      result.indices size 2
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
            assertEquals(0, result.maxProfit);
        }
//        assertTrue(result.indices.size() > 0);
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
//        assertNotNull(result.indices);
//        assertTrue(result.indices.size() > 0);
//    }

}
