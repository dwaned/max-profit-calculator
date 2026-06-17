package com.maxprofit.calculator.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@SuppressWarnings({"checkstyle:JavadocVariable", "checkstyle:DesignForExtension",
    "checkstyle:FinalParameters", "checkstyle:HiddenField", "checkstyle:MagicNumber"})
public class CalculationRequest {
    /**
     * Mirrors CalculatorForm.jsx SAVINGS_MIN/SAVINGS_MAX so the backend rejects
     * the same inputs the client-side guard blocks.
     */
    private static final int SAVINGS_MIN = 1;
    private static final int SAVINGS_MAX = 1000;

    /**
     * Mirrors CalculatorForm.jsx PRICE_MIN/PRICE_MAX — applied per list element.
     */
    private static final int PRICE_MIN = 1;
    private static final int PRICE_MAX = 1000;

    @NotNull(message = "Savings amount is required")
    @Min(value = SAVINGS_MIN, message = "Savings must be at least " + SAVINGS_MIN)
    @Max(value = SAVINGS_MAX, message = "Savings must not exceed " + SAVINGS_MAX)
    private int savings;

    @NotNull(message = "Buy prices are required")
    @NotEmpty(message = "Buy prices cannot be empty")
    @Valid
    private List<@Min(value = PRICE_MIN, message = "Buy price must be at least " + PRICE_MIN)
            @Max(value = PRICE_MAX, message = "Buy price must not exceed " + PRICE_MAX) Integer> buyPrices;

    @NotNull(message = "Sell prices are required")
    @NotEmpty(message = "Sell prices cannot be empty")
    @Valid
    private List<@Min(value = PRICE_MIN, message = "Sell price must be at least " + PRICE_MIN)
            @Max(value = PRICE_MAX, message = "Sell price must not exceed " + PRICE_MAX) Integer> sellPrices;

    private List<String> companyNames;

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

    public List<String> getCompanyNames() {
        return companyNames;
    }

    public void setCompanyNames(List<String> companyNames) {
        this.companyNames = companyNames;
    }
}
