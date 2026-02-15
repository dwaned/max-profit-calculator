package com.maxprofit.calculator.controller;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@SuppressWarnings({"checkstyle:JavadocVariable", "checkstyle:DesignForExtension", 
    "checkstyle:FinalParameters", "checkstyle:HiddenField", "checkstyle:MagicNumber"})
public class CalculationRequest {
    @NotNull(message = "Savings amount is required")
    @Min(value = 1, message = "Savings must be at least 1")
    @Max(value = 1000, message = "Savings must not exceed 1000")
    private int savings;

    @NotNull(message = "Buy prices are required")
    @NotEmpty(message = "Buy prices cannot be empty")
    private List<Integer> buyPrices;

    @NotNull(message = "Sell prices are required")
    @NotEmpty(message = "Sell prices cannot be empty")
    private List<Integer> sellPrices;

    public int getSavings() {
        return savings;
    }

    public void setSavings(int savings) {
        this.savings = savings;
    }

    public List<Integer> getBuyPrices() {
        return buyPrices;
    }

    public void setBuyPrices(List<Integer> buyPrices) {
        this.buyPrices = buyPrices;
    }

    public List<Integer> getSellPrices() {
        return sellPrices;
    }

    public void setSellPrices(List<Integer> sellPrices) {
        this.sellPrices = sellPrices;
    }
}
