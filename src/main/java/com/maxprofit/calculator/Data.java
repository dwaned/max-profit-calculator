package com.maxprofit.calculator;

import java.util.Collections;
import java.util.List;

/**
 * This class is used to contain the amount of maximum profit yielded with the chosen list of indices.
 */
public class Data {
    public int maxProfit;
    public List<List<Integer>> indices;

    public Data(int maxProfit, List<List<Integer>> combination) {
        this.maxProfit = maxProfit;
        this.indices = combination;
    }

    public Data() {
        this.maxProfit = 0;
        this.indices = Collections.emptyList();
    }
}
