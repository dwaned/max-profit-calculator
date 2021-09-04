import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

public class Stock {
    static Logger logger = Logger.getLogger(Stock.class.getName());


    public static void main(String[] args) {
        logger.setLevel(Level.WARNING);

        /* List<List<Integer>> result = getAllPermutationsForListOfSize(currentValue.size());
           logger.log(Level.CONFIG, String.format("Permutations of %d are %s", currentValue.size(), result));
           logger.log(Level.CONFIG, "-------------------");

           logger.log(Level.INFO, String.format("Savings: %d", savings));
           logger.log(Level.INFO, String.format("Current Values %s", currentValue));
           logger.log(Level.INFO, String.format("Future Values %s", futureValue));
           logger.log(Level.INFO, String.format("Max profit is %d", returnIndicesMaxProfit(savings, currentValue, futureValue)));
        */


    }

    public static List<List<Integer>> getAllPermutationsForListOfSize(int sizeOfList) {
        List<List<Integer>> perm = new ArrayList();
        List<Integer> temp = new ArrayList();
        List<Integer> allValues = new ArrayList();
        List<Integer> single = new ArrayList();
        int current;

        for (int i = 0; i < sizeOfList; i++) {

            temp.clear();

            // creating a combination of all integers to add in the end
            allValues.add(i);

            // adding the permutation of the single integer
            single.add(i);

            perm.add(new ArrayList<>(single));
            single.clear();


            //looping and excluding each integer to create the rest of the combinations
            for (int j = 0; j <= sizeOfList - 1; j++) {

                if (j != i) {
                    temp.add(j);
                    current = 0;

                    while (current != sizeOfList) {


                        if (j <= sizeOfList - 1) {
                            if (temp.size() > 1 && !perm.contains(new ArrayList<>(temp.stream().sorted().collect(Collectors.toList())))) {

                                perm.add(new ArrayList<>(temp.stream().sorted().collect(Collectors.toList())));
                                temp.remove(temp.size() - 1);
                            }
                        }
                        current++;
                    }
                }
            }

            temp.clear();

            for (int k = sizeOfList - 1; k >= 0; k--) {

                if (k != i) {
                    temp.add(k);
                }

                if (temp.size() > 1 && !perm.contains(temp.stream().sorted().collect(Collectors.toList()))) {
                    perm.add(new ArrayList<>(temp.stream().sorted().collect(Collectors.toList())));
                }
            }
        }

        //  adding the combination containing all integers
        if (!perm.contains(new ArrayList<>(allValues)))
            perm.add(new ArrayList<>(allValues));

        return perm;
    }

    public static Data returnIndicesMaxProfit(int saving, List<Integer> currentValue, List<Integer> futureValue) {
        logger.setLevel(Level.WARNING);

        int maxProfit = 0;
        List<List<Integer>> chosenIndices = new ArrayList<>();
        List<List<Integer>> permutations = getAllPermutationsForListOfSize(currentValue.size());
        List<List<Integer>> combination = new ArrayList<>();
        int currentProfit = 0;
        int tempUsedSaving = 0;
        int usedSavings = saving;

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

                            if (currentValue.get(combination.get(profCounter).get(profCounter)) != 0) {
                                currentProfit += futureValue.get(combination.get(profCounter).get(profCounter)) - currentValue.get(combination.get(profCounter).get(profCounter));
                            } else {
                                logger.log(Level.SEVERE, "Price of stock cannot be 0!!!");
                                // System.exit(1);
                                break;
                            }
                        }

                        if (logger.isLoggable(Level.FINEST)) {
                            logger.log(Level.FINEST, String.format("currentProf: %d Max Prof %d", currentProfit, maxProfit));
                            logger.log(Level.FINEST, String.format("temp:%d usedSavings %d", tempUsedSaving, usedSavings));
                        }

                        if (currentProfit > maxProfit) {
                            chosenIndices.clear();
                            chosenIndices.add(combination.get(0));
                            maxProfit = currentProfit;
                            usedSavings = tempUsedSaving;
                        } else if ((currentProfit == maxProfit) && (tempUsedSaving < usedSavings)) {
                            logger.log(Level.FINEST, "Profit is same but less used savings");
                            chosenIndices.clear();
                            chosenIndices.add(combination.get(0));
                            usedSavings = tempUsedSaving;
                        }

                        currentProfit = 0;
                        tempUsedSaving = 0;
                        combination.clear();
                    }
                }
            }
        }
        logger.log(Level.INFO, String.format("Savings used: %d", usedSavings));
        logger.log(Level.INFO, String.format("Chosen Indices: %s", chosenIndices));
        return new

                Data(maxProfit, chosenIndices);

    }

}

class Data {
    int maxProfit;
    List<List<Integer>> indices;

    public Data(int maxProfit, List<List<Integer>> combination) {
        this.maxProfit = maxProfit;
        this.indices = combination;
    }
}
