package com.maxprofit.calculator.controller;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Inbound request body for {@code POST /api/calculate}. Carries the savings
 * budget, the buy-price and sell-price lists, and an optional list of
 * company names to display in the response.
 *
 * <p>Bean-validation constraints are enforced by the controller's
 * {@code @Valid} annotation; see {@code application.properties} for the
 * corresponding error messages.
 *
 * @author dwaned
 */
@SuppressWarnings({"checkstyle:JavadocVariable", "checkstyle:DesignForExtension",
    "checkstyle:FinalParameters", "checkstyle:HiddenField", "checkstyle:MagicNumber"})
public class CalculationRequest {
    private static final int MAX_PRICE_LIST_SIZE = 100;

    @NotNull(message = "Savings amount is required")
    @Min(value = 1, message = "Savings must be at least 1")
    @Max(value = 1000, message = "Savings must not exceed 1000")
    private int savings;

    @NotNull(message = "Buy prices are required")
    @NotEmpty(message = "Buy prices cannot be empty")
    @Size(max = MAX_PRICE_LIST_SIZE, message = "Buy prices must not exceed 100 entries")
    private List<Integer> buyPrices;

    @NotNull(message = "Sell prices are required")
    @NotEmpty(message = "Sell prices cannot be empty")
    @Size(max = MAX_PRICE_LIST_SIZE, message = "Sell prices must not exceed 100 entries")
    private List<Integer> sellPrices;

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
