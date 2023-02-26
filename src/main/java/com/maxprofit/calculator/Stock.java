package com.maxprofit.calculator;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@SuppressWarnings("checkstyle:LineLength")
public class Stock {
    static Logger logger = Logger.getLogger(Stock.class.getName());

    /*
    public static void main(String[] args) {
        logger.setLevel(Level.WARNING);

         List<List<Integer>> result = getAllPermutationsForListOfSize
         (currentValue.size());
           logger.log(Level.CONFIG, String.format("Permutations of %d are
           %s", currentValue.size(), result));
           logger.log(Level.CONFIG, "-------------------");

           logger.log(Level.INFO, String.format("Savings: %d", savings));
           logger.log(Level.INFO, String.format("Current Values %s",
           currentValue));
           logger.log(Level.INFO, String.format("Future Values %s",
           futureValue));
           logger.log(Level.INFO, String.format("Max profit is %d",
           returnIndicesMaxProfit(savings, currentValue, futureValue)));


    }
    */


    /**
     * This method returns the combination of indices which yields the
     * largest profit
     *
     * @param saving       - The amount of savings
     * @param currentValue - The list of current prices for stocks
     * @param futureValue  - The list of future prices for stocks
     * @return A list of indices which yields the largest profit
     */
    public static CalculationResult returnIndicesMaxProfit(int saving,
                                                           List<Integer> currentValue, List<Integer> futureValue) {
        logger.setLevel(Level.OFF);
        int maxProfit = 0;
        Helper helper = new Helper();
        List<List<Integer>> chosenIndices = new ArrayList<>();
        List<List<Integer>> permutations =
                helper.getAllPermutationsForListOfSize(currentValue.size());
        List<List<Integer>> combination = new ArrayList<>();
        int currentProfit = 0;
        int tempUsedSaving = 0;
        int usedSavings = saving;

        int futureValueItem;
        int currentValueItem;


        /*
        Business Requirement Restrictions
         */

        final int PRICE_LIST_MAX_SIZE = 100;

        if (currentValue.stream().anyMatch(o -> o <= 0) || futureValue.stream().anyMatch(o -> o <= 0)) {
            logger.log(Level.SEVERE, "Future or current value is 0 or " +
                    "negative");
            return new CalculationResult();
        }

        if (currentValue.size() != futureValue.size()) {
            logger.log(Level.SEVERE, "Future and current prices list sizes do" +
                    " not match!");
            return new CalculationResult();
        } else {
            if (currentValue.size() > PRICE_LIST_MAX_SIZE) {
                logger.log(Level.SEVERE, "Future and current prices list " +
                        "sizes are too large!");
                return new CalculationResult();
            }
        }


        /*
        Solution Logic
         */

         /*
        Current working logic
         - Getting a list of all possible permutations
         - Looping through all the possible permutations
            - Checking that savings is not exceeded in each permutation

         */

        for (int permutationsIndex = 0; permutationsIndex <= permutations.size() - 1; permutationsIndex++) {

            for (int permutationsValIndex = 0; permutationsValIndex <= permutations.get(permutationsIndex).size() - 1; permutationsValIndex++) {
                tempUsedSaving += currentValue.get(permutations.get(permutationsIndex).get(permutationsValIndex));

                if (tempUsedSaving > saving) {
                    tempUsedSaving = 0;
                    combination.clear();
                    break;
                } else {
                    combination.add(permutations.get(permutationsIndex));
                    if (permutationsValIndex == permutations.get(permutationsIndex).size() - 1) {
                        for (int profCounter = 0; profCounter <= combination.size() - 1; profCounter++) {
                            futureValueItem =
                                    futureValue.get(combination.get(profCounter).get(profCounter));
                            currentValueItem =
                                    currentValue.get(combination.get(profCounter).get(profCounter));
                            currentProfit += futureValueItem - currentValueItem;
                        }
                        if (logger.isLoggable(Level.WARNING)) {
                            logger.log(Level.WARNING, String.format(
                                    "currentProf: %d Max Prof %d",
                                    currentProfit, maxProfit));
                            logger.log(Level.WARNING, String.format("temp:%d " +
                                            "usedSavings %d", tempUsedSaving,
                                    usedSavings));
                        }
                        if (currentProfit > maxProfit) {
                            chosenIndices.clear();
                            maxProfit = currentProfit;
                            usedSavings = tempUsedSaving;
                            logger.log(Level.WARNING, "Profit is higher. " +
                                    "Storing combination");
                            chosenIndices.add(combination.get(0));
                        } else if ((currentProfit == maxProfit) && (tempUsedSaving < usedSavings)) {
                            chosenIndices.clear();
                            logger.log(Level.WARNING, "Profit is same but " +
                                    "using less savings");
                            chosenIndices.add(combination.get(0));
                            usedSavings = tempUsedSaving;
                        } else if ((currentProfit == maxProfit) && (tempUsedSaving == usedSavings)) {
                            logger.log(Level.WARNING, "Profit and savings are" +
                                    " same. Storing combination");
                            chosenIndices.add(combination.get(0));
                        }
                        currentProfit = 0;
                        tempUsedSaving = 0;
                        combination.clear();
                    }
                }
            }
        }

        logger.log(Level.FINEST, String.format("Savings used: %d",
                usedSavings));
        logger.log(Level.FINEST, String.format("Chosen Indices: %s",
                chosenIndices));

        return new CalculationResult(maxProfit, chosenIndices);
    }

}

