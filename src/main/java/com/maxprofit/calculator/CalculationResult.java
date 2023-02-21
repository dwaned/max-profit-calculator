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

public class CalculationResult {

  /**
   * The maximum profit obtained.
   */
  public int maxProfit;

  /**
   * A list of lists of indices representing the best combination of indices to
   * obtain the maximum profit.
   */
  public List<List<Integer>> indices;

  /**
   * Constructs a new CalculationResult object with the given maximum profit and
   * list of indices.
   *
   * @param profit      the maximum profit obtained
   * @param combination a list of lists of indices representing the best
   *                    combination of indices to obtain the maximum profit
   */
  public CalculationResult(
    final int profit,
    final List<List<Integer>> combination
  ) {
    this.maxProfit = profit;
    this.indices = combination;
  }

  /**
   * Constructs a new CalculationResult object with a maximum profit of 0 and an
   * empty list of indices.
   */
  public CalculationResult() {
    this.maxProfit = 0;
    this.indices = Collections.emptyList();
  }
}
