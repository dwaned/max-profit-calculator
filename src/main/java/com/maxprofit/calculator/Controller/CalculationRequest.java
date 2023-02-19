package com.maxprofit.calculator.Controller;

import java.util.List;

public class CalculationRequest {
    private final int savingsAmount;
    private final List<Integer> currentPrices;
    private final List<Integer> futurePrices;

    public CalculationRequest(int savingsAmount, List<Integer> currentPrices, List<Integer> futurePrices) {
        this.savingsAmount = savingsAmount;
        this.currentPrices = currentPrices;
        this.futurePrices = futurePrices;
    }

    public int getSavingsAmount() {
        return savingsAmount;
    }

    public List<Integer> getCurrentPrices() {
        return currentPrices;
    }
    public List<Integer> getFuturePrices() {
        return futurePrices;
    }

}
