package com.maxprofit.calculator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Engine for the Max Profit Calculator.
 *
 * <p>{@link #returnIndicesMaxProfit(int, List, List)} solves the bounded
 * knapsack problem: given a budget ({@code savings}) and two equal-length
 * lists of buy/sell prices, return the subset of indices with the maximum
 * {@code Σ(sell − buy)} that fits in the budget. Ties on profit are broken
 * by preferring the subset with the smallest {@code Σ(buy)}, which
 * corresponds to the project requirement "System chooses the max profit
 * with the least amount of savings used."
 *
 * <p>Complexity is O(n · savings) — a 1-D dynamic program over the savings
 * axis with one forward pass per item and a linear backtrack. The previous
 * brute-force permutation approach was O(2^n) and only fit within
 * performance budgets because the input cap of {@value #MAX_PRICE_LIST_SIZE}
 * keeps 2^100 impractical.
 */
@SuppressWarnings({"checkstyle:LineLength", "checkstyle:OperatorWrap"})
public final class Stock {

    @SuppressWarnings({"checkstyle:VisibilityModifier", "checkstyle:JavadocVariable"})
    private static final Logger LOGGER = LoggerFactory.getLogger(Stock.class);

    @SuppressWarnings({"checkstyle:VisibilityModifier", "checkstyle:JavadocVariable"})
    private static final int MAX_PRICE_LIST_SIZE = 100;

    private Stock() {
    }

    /**
     * Returns the combination of indices which yields the largest profit.
     *
     * @param saving       the amount of savings (budget)
     * @param currentValue list of current prices for stocks
     * @param futureValue  list of future prices for stocks
     * @return the {@link CalculationResult} describing the chosen subset
     */
    public static CalculationResult returnIndicesMaxProfit(final int saving,
                                                           final List<Integer> currentValue,
                                                           final List<Integer> futureValue) {
        return returnIndicesMaxProfit(saving, currentValue, futureValue, null);
    }

    /**
     * Returns the combination of indices which yields the largest profit.
     *
     * @param saving       the amount of savings (budget)
     * @param currentValue list of current prices for stocks
     * @param futureValue  list of future prices for stocks
     * @param companyNames optional list of company names for each stock (filtered to the chosen indices)
     * @return the {@link CalculationResult} describing the chosen subset
     */
    public static CalculationResult returnIndicesMaxProfit(final int saving,
                                                           final List<Integer> currentValue,
                                                           final List<Integer> futureValue,
                                                           final List<String> companyNames) {
        if (currentValue == null) {
            throw new IllegalArgumentException("currentValue must not be null");
        }
        if (futureValue == null) {
            throw new IllegalArgumentException("futureValue must not be null");
        }

        final int n = currentValue.size();

        if (currentValue.stream().anyMatch(o -> o <= 0)
                || futureValue.stream().anyMatch(o -> o <= 0)) {
            throw new IllegalArgumentException("prices must be positive integers");
        }

        if (n != futureValue.size()) {
            throw new IllegalArgumentException(
                    "currentValue and futureValue must have the same size (got "
                            + n + " and " + futureValue.size() + ")");
        }

        if (n > MAX_PRICE_LIST_SIZE) {
            throw new IllegalArgumentException(
                    "price lists must not exceed " + MAX_PRICE_LIST_SIZE + " entries (got " + n + ")");
        }

        if (n == 0) {
            return new CalculationResult(0, new ArrayList<>(), 0, saving, companyNames);
        }

        // dp[i][c] = maximum profit achievable with the first i items (items 0..i-1)
// using exactly c savings. Standard 0/1 knapsack 2-D table — easier to reason
// about for backtracking than the 1-D optimised form, and bounded by
// {@code priceListMaxSize=100} × savings ≤ 1000.
        final int[][] dp = new int[n + 1][saving + 1];
        for (int i = 0; i <= n; i++) {
            Arrays.fill(dp[i], Integer.MIN_VALUE);
        }
        dp[0][0] = 0;

        for (int i = 1; i <= n; i++) {
            final int cost = currentValue.get(i - 1);
            final int profit = futureValue.get(i - 1) - currentValue.get(i - 1);
            for (int c = 0; c <= saving; c++) {
                // Option A: skip item i-1.
                dp[i][c] = dp[i - 1][c];
                // Option B: include item i-1 if it fits.
                if (c >= cost && dp[i - 1][c - cost] != Integer.MIN_VALUE) {
                    final int included = dp[i - 1][c - cost] + profit;
                    if (included > dp[i][c]) {
                        dp[i][c] = included;
                    }
                }
            }
        }

        // Find the maximum profit, and the smallest cost achieving it (tie-break).
        int bestProfit = Integer.MIN_VALUE;
        int minCost = -1;
        for (int c = 0; c <= saving; c++) {
            if (dp[n][c] > bestProfit) {
                bestProfit = dp[n][c];
                minCost = c;
            }
        }

        if (bestProfit <= 0) {
            // No profitable combination — the empty set has profit 0 by construction.
            return new CalculationResult(0, new ArrayList<>(), 0, saving, companyNames);
        }

        // Backtrack from dp[n][minCost]. Item i-1 is in the chosen subset iff the
        // state differs from the previous row (i.e. including item i-1 strictly
        // improved the dp value at this state).
        final List<Integer> selected = new ArrayList<>();
        int c = minCost;
        for (int i = n; i > 0 && c > 0; i--) {
            if (dp[i][c] != dp[i - 1][c]) {
                selected.add(i - 1);
                c -= currentValue.get(i - 1);
            }
        }
        Collections.sort(selected);

        final int remaining = saving - minCost;

        List<String> filteredCompanyNames = null;
        if (companyNames != null && !selected.isEmpty()) {
            filteredCompanyNames = new ArrayList<>(selected.size());
            for (Integer index : selected) {
                if (index >= 0 && index < companyNames.size()) {
                    filteredCompanyNames.add(companyNames.get(index));
                }
            }
        }

        return new CalculationResult(bestProfit, selected, minCost, remaining, filteredCompanyNames);
    }
}