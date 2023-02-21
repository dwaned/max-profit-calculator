package com.maxprofit.calculator;

import java.util.Collections;
import java.util.List;

/**
 * This class is used to contain the amount of
 * maximum profit yielded with the chosen list of indices.
 */
public class CalculationResult {
    public int maxProfit;
    public List<List<Integer>> indices;

    public CalculationResult(final int profit, final List<List<Integer>> combination) {
        this.maxProfit = profit;
        this.indices = combination;
    }

    public CalculationResult() {
        this.maxProfit = 0;
        this.indices = Collections.emptyList();
    }
}
