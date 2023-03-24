package com.maxprofit.calculator;

import net.jqwik.api.Arbitraries;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.Provide;
import net.jqwik.api.constraints.IntRange;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * This class contains property-based tests for the {@link Stock} class.
 *
 * The tests are written using the jqwik library, which is a property-based
 * testing framework for Java.
 * Property-based testing is a testing methodology that involves defining
 * properties or invariants that
 * should hold true for a given system, and then generating random inputs
 * to test those properties. This approach can help to uncover edge cases and
 * corner cases that might not be caught by traditional unit
 * tests.
 *
 * In these tests, we're using the {@code @Provide} annotation to define factory
 * methods that generate arbitrary values for the parameters of the
 * {@link Stock} methods. We're also using the {@code @ForAll}
 * annotation to generate random values for those parameters. The {@code
 * @IntRange} and {@code @Positive}
 * constraints are used to restrict the range of the generated values for the
 * {@code savings} parameter.
 *
 * The tests themselves are defined as methods annotated with the {@code
 * @Property} annotation. Each property is a statement about the behavior of
 * the system under test that should hold true for all generated inputs. The
 * {@code assert} statements within the properties are used to verify that the
 * properties hold true for the generated inputs.
 *
 * The tests in this class cover a range of scenarios, including both
 * positive and negative scenarios,
 * to ensure that the {@link Stock} class is functioning correctly in all cases.
 */
@SuppressWarnings({"checkstyle:LineLength", "checkstyle:magicnumber"})
public class PropertyBasedStockTests {

    /*
    Possible Properties
        validStockPrices
        validSavings
        lossStockPrices
        profitStockPrices
     */

    /**
     * Generates an arbitrary list of integer values between 1 and 100 (inclusive) that represents the
     * stock prices for the tests.
     *
     * This method is used to annotate a factory method for creating arbitrary values that will be used
     * as parameters in the property-based tests. The factory method is annotated with the {@code @Provide}
     * annotation and returns an {@code Arbitrary} object that generates values of the specified type.
     *
     * The {@code @Provide} annotation is used by the jqwik library to identify the factory methods that
     * provide the arbitrary values for the tests.
     *
     * The generated list has a fixed size of 5 elements, which is determined by the {@code ofSize(5)}
     * method call on the {@code list()} object.
     *
     * @return an {@code Arbitrary<List<Integer>>} object that generates lists of integer values between
     *         1 and 100 (inclusive) for the stock prices
     */
    @Provide
    Arbitrary<List<Integer>> stockPrices() {
        return Arbitraries.integers().between(1, 100).list().ofSize(5);
    }


    /**
     * Generates an arbitrary integer value between 1 and 5 (inclusive) that represents the length of the
     * lists of stock prices used in the tests.
     *
     * This method is used to annotate a factory method for creating arbitrary values that will be used
     * as parameters in the property-based tests. The factory method is annotated with the {@code @Provide}
     * annotation and returns an {@code Arbitrary} object that generates values of the specified type.
     *
     * The {@code @Provide} annotation is used by the jqwik library to identify the factory methods that
     * provide the arbitrary values for the tests.
     *
     * @return an {@code Arbitrary<Integer>} object that generates values between 1 and 5 (inclusive)
     *         for the length of the lists of stock prices
     */
    @Provide
    Arbitrary<Integer> pricesLength() {
        return Arbitraries.integers().between(1, 5);
    }

    /**
     * Property-based test that verifies the behavior of the Stock.returnIndicesMaxProfit() method
     * under positive scenarios, that is, when the input values are within the specified constraints.
     *
     * The test generates three parameters:
     * - savings: an integer between 1 and 1000 (inclusive) that represents the initial amount of money available
     *   to invest.
     * - currentPrices: an ArrayList of integers representing the current stock prices.
     * - futurePrices: an ArrayList of integers representing the future stock prices.
     *
     * The test checks that the following conditions hold:
     * - The sizes of the currentPrices and futurePrices lists are equal.
     * - All elements in the currentPrices and futurePrices lists are non-negative.
     * - The result of the Stock.returnIndicesMaxProfit() method is not null.
     * - The indices returned by the Stock.returnIndicesMaxProfit() method are valid indices into the
     *   currentPrices and futurePrices lists.
     * - The profit calculated from the indices returned by the Stock.returnIndicesMaxProfit() method
     *   equals the maximum profit returned by the method.
     * - If the Stock.returnIndicesMaxProfit() method returns an empty list of indices, the maximum profit
     *   returned by the method is zero.
     *
     * @param savings an integer between 1 and 1000 (inclusive) that represents the initial amount of money available
     *                to invest
     * @param currentPrices an ArrayList of integers representing the current stock prices
     * @param futurePrices an ArrayList of integers representing the future stock prices
     */
    @Property
    public void positiveScenarios(
            @ForAll @IntRange(min = 1, max = 1000) final int savings,
            @ForAll("stockPrices") final ArrayList<Integer> currentPrices,
            @ForAll("stockPrices") final ArrayList<Integer> futurePrices) {
//        Statistics.collect(savings,currentPrices,futurePrices);
        CalculationResult result = Stock.returnIndicesMaxProfit(savings,
                currentPrices, futurePrices);
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
                    profit += futurePrices.get(result.getIndices().get(i)
                            .get(j)) - currentPrices.get(result.getIndices()
                            .get(i).get(j));
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

        } else {
            assertEquals(0, result.getMaxProfit());
        }
//        assertTrue(result.getIndices().size() > 0);
    }

//    @Property
//    public void savingsLessThanAnyStockPrice(
//            @ForAll @IntRange(min = 1, max = 1000) int savings,
//            @ForAll("StockPrices") ArrayList<Integer> currentPrices,
//            @ForAll("StockPrices") ArrayList<Integer> futurePrices)  {
//        Data result = Stock.returnIndicesMaxProfit(savings, currentPrices,
//        futurePrices);
//        assertEquals(currentPrices.size(), futurePrices.size());
//        assertFalse(currentPrices.stream().anyMatch(i -> i < 0));
//        assertFalse(futurePrices.stream().anyMatch(i -> i < 0));
//        assertNotNull(result);
//        assertNotNull(result.getIndices());
//        assertTrue(result.getIndices().size() > 0);
//    }

}
