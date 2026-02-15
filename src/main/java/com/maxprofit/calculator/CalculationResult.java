/**
 *
 * The {@code CalculationResult} class represents the result of a calculation
 * made by the {@link com.maxprofit.calculator.Stock} class.
 * It contains the amount of maximum profit yielded with the chosen list of
 * indices.
 */

package com.maxprofit.calculator;

import java.util.Collections;
import java.util.List;

@SuppressWarnings({"checkstyle:JavadocVariable", "checkstyle:DesignForExtension", 
    "checkstyle:HiddenField", "checkstyle:MissingJavadocMethod"})
public class CalculationResult {

    private final int maxProfit;
    private final List<Integer> indices;
    private final int savingsUsed;
    private final int remainingSavings;

    public int getMaxProfit() {
        return maxProfit;
    }

    public List<Integer> getIndices() {
        return indices;
    }

    public int getSavingsUsed() {
        return savingsUsed;
    }

    public int getRemainingSavings() {
        return remainingSavings;
    }

    public CalculationResult(
            final int profit,
            final List<Integer> combination,
            final int savingsUsed,
            final int remainingSavings) {
        this.maxProfit = profit;
        this.indices = combination;
        this.savingsUsed = savingsUsed;
        this.remainingSavings = remainingSavings;
    }

    public CalculationResult() {
        this.maxProfit = 0;
        this.indices = Collections.emptyList();
        this.savingsUsed = 0;
        this.remainingSavings = 0;
    }
}
