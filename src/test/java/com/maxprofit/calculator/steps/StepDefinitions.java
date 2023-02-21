/**

This class defines the step definitions for Cucumber scenarios related to
stock market calculations.
*/
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

  /*
   * Integer storing the amount of savings.
   */
  private int savingsContext = 0;

  /*
   * List storing the current prices.
   */
  private List<Integer> currentPricesContext;

  /*
   * List storing the future prices.
   */
  private List<Integer> futurePricesContext;

  /**
   * Sets the value of savingsContext to the given savings.
   *
   * @param savings an integer representing the amount of savings.
   */
  @Given("I have {int} Euros of savings")
  public void iHaveEurosOfSavings(int savings) {
    System.out.format("Savings: %d\n", savings);
    savingsContext = savings;
  }

  /**
   * Sets the value of currentPricesContext to a List of integers parsed
   * from the given string.
   *
   * @param currentPrices a string representing a comma-separated list
   *                      of current stock prices.
   */
  @When("Array of current stock prices are {string}")
  public void arrayOfCurrentStockPricesAre(final String currentPrices) {
    System.out.format("Current prices: %s\n", currentPrices);
    currentPricesContext =
      Stream
        .of(currentPrices.split(","))
        .map(String::trim)
        .map(Integer::parseInt)
        .collect(Collectors.toList());
  }

  /**
   * Compares the expected result to the actual result of the
   * calculation for the
   * best combination of indices for maximum profit.
   *
   * @param result a string representing the expected result.
   */
  @Then("the best combination of indices for max profit is {string}")
  public void theBestCombinationOfIndicesForMaxProfitIs(final String result) {
    final List<Integer> resultIndices = Stream
      .of(result.split(","))
      .map(String::trim)
      .map(Integer::parseInt)
      .collect(Collectors.toList());

    final CalculationResult actualResult = Stock.returnIndicesMaxProfit(
      savingsContext,
      currentPricesContext,
      futurePricesContext
    );

    if (actualResult.getIndices().size() == 1) {
      assertEquals(
        resultIndices,
              actualResult.getIndices().get(0),
        "Actual Result: "
        + actualResult.getIndices()
        + " with profit of "
        + actualResult.getMaxProfit()
      );
    } else {
      logger.log(
        Level.WARNING,
        String.format(
          "Multiple combinations with same used savings: "
          + actualResult.getIndices()
        )
      );
      assertTrue(
              actualResult.getIndices().contains(resultIndices),
        "Actual Result: "
        + actualResult.getIndices()
        + " with profit of "
        + actualResult.getMaxProfit()
      );
    }
  }

  /**
   * Sets the value of futurePricesContext to a List of integers parsed from the
   * given string.
   *
   * @param futurePrices a string representing a comma-separated list of
   *                     future stock prices.
   */
  @And("Array of future stock prices are {string}")
  public void arrayOfFutureStockPricesAre(final String futurePrices) {
    System.out.format("Future prices: %s\n", futurePrices);
    futurePricesContext =
      Stream
        .of(futurePrices.split(","))
        .map(String::trim)
        .map(Integer::parseInt)
        .collect(Collectors.toList());
  }

  /**
   * Compares the expected profit to the actual profit of the calculation.
   *
   * @param profit an integer representing the expected profit.
   */
  @Then("profit is {int} Euros")
  public void profitIsEuros(final int profit) {
    System.out.format("Profit: %d\n", profit);
    int actualProfit = Stock.returnIndicesMaxProfit(
      savingsContext,
      currentPricesContext,
      futurePricesContext
    )
      .getMaxProfit();
    assertEquals(profit, actualProfit, "Actual Profit is %s " + actualProfit);
  }

  /**
   * Asserts that there is no set of indices with a profit.
   *
   */
  @Then("there is no best combination for max profit")
  public void thereIsNoBestCombinationForMaxProfit() {
    final CalculationResult actualResult = Stock.returnIndicesMaxProfit(
      savingsContext,
      currentPricesContext,
      futurePricesContext
    );
    assertEquals(
      0,
            actualResult.getIndices().size(),
      "Actual Result: " + actualResult.getIndices()
    );
  }

  /**
   * Asserts that profit is 0.
   *
   */
  @And("no profit is made")
  public void noProfitIsMade() {
    final int actualProfit = Stock.returnIndicesMaxProfit(
      savingsContext,
      currentPricesContext,
      futurePricesContext
    )
      .getMaxProfit();
    assertEquals(0, actualProfit, "Actual Profit is %s " + actualProfit);
  }

  /**
   * Asserts that with the given indices, same profit is achieved as
   * previously stored.
   *
   * @param indices combination representing the indices of stocks.
   */
  @And("same savings and max profit is achieved with the indices {string}")
  public void sameSavingsMaxProfitIsWithCombination(final String indices) {
    this.theBestCombinationOfIndicesForMaxProfitIs(indices);
  }
}
