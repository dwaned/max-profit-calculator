package com.maxprofit.calculator.controller;

import java.util.List;

public class CalculationRequest {
    private int savingsAmount;
    private List<Integer> currentPrices;
    private List<Integer> futurePrices;

    public int getSavingsAmount() {
        return savingsAmount;
    }

    public void setSavingsAmount(int savingsAmount) {
        this.savingsAmount = savingsAmount;
    }

    public List<Integer> getCurrentPrices() {
        return currentPrices;
    }

    public void setCurrentPrices(List<Integer> currentPrices) {
        this.currentPrices = currentPrices;
    }

    public List<Integer> getFuturePrices() {
        return futurePrices;
    }

    public void setFuturePrices(List<Integer> futurePrices) {
        this.futurePrices = futurePrices;
    }
}