package com.maxprofit.calculator.steps;

import com.maxprofit.calculator.CalculationResult;
import com.maxprofit.calculator.Stock;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;


public class StepDefinitions {

    static Logger logger = Logger.getLogger(Stock.class.getName());

    int savingsContext = 0;
    List<Integer> currentPricesContext;
    List<Integer> futurePricesContext;

    @Given("I have {int} Euros of savings")
    public void IHaveEurosOfSavings(int savings) {

        System.out.format("Savings: %d\n", savings);
        savingsContext = savings;
    }

    @When("Array of current stock prices are {string}")
    public void arrayOfCurrentStockPricesAre(String currentPrices) {
        System.out.format("Current prices: %s\n", currentPrices);
        currentPricesContext = Stream.of(currentPrices.split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .collect(Collectors.toList());
    }


    @Then("the best combination of indices for max profit is {string}")
    public void theBestCombinationOfIndicesForMaxProfitIs(String result) {
        List<Integer> resultIndices = Stream.of(result.split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .collect(Collectors.toList());

        CalculationResult actualResult = Stock.returnIndicesMaxProfit(savingsContext,currentPricesContext,futurePricesContext);

        if (actualResult.indices.size() == 1) {
            assertEquals(resultIndices, actualResult.indices.get(0),"Actual Result: " + actualResult.indices + " with profit of " + actualResult.maxProfit);
        } else {
            logger.log(Level.WARNING, String.format("Multiple combinations with same used savings: " + actualResult.indices));
            assertTrue(actualResult.indices.contains(resultIndices),"Actual Result: " + actualResult.indices + " with profit of " + actualResult.maxProfit);
        }
    }

    @And("Array of future stock prices are {string}")
    public void arrayOfFutureStockPricesAre(String futurePrices) {
        System.out.format("Future prices: %s\n", futurePrices);
        futurePricesContext = Stream.of(futurePrices.split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .collect(Collectors.toList());
    }

    @Then("profit is {int} Euros")
    public void profitIsEuros(int profit) {
        System.out.format("Profit: %d\n", profit);
        int actualProfit = Stock.returnIndicesMaxProfit(savingsContext, currentPricesContext, futurePricesContext).maxProfit;
        assertEquals(profit, actualProfit, "Actual Profit is %s " + actualProfit);
    }

    @Then("there is no best combination for max profit")
    public void thereIsNoBestCombinationForMaxProfit() {
        CalculationResult actualResult = Stock.returnIndicesMaxProfit(savingsContext, currentPricesContext, futurePricesContext);
        assertEquals(0, actualResult.indices.size(), "Actual Result: " + actualResult.indices);
    }

    @And("no profit is made")
    public void noProfitIsMade() {
        int actualProfit = Stock.returnIndicesMaxProfit(savingsContext, currentPricesContext, futurePricesContext).maxProfit;
        assertEquals(0, actualProfit, "Actual Profit is %s " + actualProfit);
    }

    @And("same savings and max profit is achieved with the combination {string}")
    public void sameSvingsMaxProfitIsWithCombination(String indices) {
        this.theBestCombinationOfIndicesForMaxProfitIs(indices);
    }
}
