import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.Assert.assertEquals;

public class Tests {
    @Test
    public void shouldWorkWithOneIndex() {
        int result = Stock.returnIndicesMaxProfit(1, Collections.singletonList(1), Collections.singletonList(3)).maxProfit;
        assertEquals(2, result);
    }

    @Test
    public void shouldWorkWithTwoIndices() {
        int result = Stock.returnIndicesMaxProfit(1, Arrays.asList(1, 1), Arrays.asList(3, 4)).maxProfit;
        assertEquals(3, result);
    }

    @Test
    public void shouldWorkWithThreeIndices() {
        Data result = Stock.returnIndicesMaxProfit(5, Arrays.asList(1, 2, 5), Arrays.asList(2, 3, 20));

        assertEquals(15, result.maxProfit);
        assertEquals(Collections.singletonList(2), result.indices.get(0));

    }

    @Test
    public void shouldUseAllSavings() {
        Data result = Stock.returnIndicesMaxProfit(6, Arrays.asList(1, 2, 5), Arrays.asList(2, 3, 20));

        assertEquals(16, result.maxProfit);
        assertEquals(Arrays.asList(0, 2), result.indices.get(0));

    }

    @Test
    public void shouldChoseCheaperCombination() {
        Data result = Stock.returnIndicesMaxProfit(7, Arrays.asList(1, 2, 5), Arrays.asList(2, 3, 20));

        assertEquals(16, result.maxProfit);
        assertEquals(Arrays.asList(0, 2), result.indices.get(0));

    }

    @Test
    public void shouldGetAllProfits() {
        Data result = Stock.returnIndicesMaxProfit(16, Arrays.asList(1, 2, 5, 8), Arrays.asList(2, 3, 6, 9));

        assertEquals(4, result.maxProfit);
        assertEquals(Arrays.asList(0, 1, 2, 3), result.indices.get(0));

    }

    @Test
    public void shouldWorkWithLargerSet() {
        Data result = Stock.returnIndicesMaxProfit(50, Arrays.asList(1, 2, 5, 34, 22, 56, 34), Arrays.asList(2, 3, 20, 35, 15, 101, 20));

        assertEquals(18, result.maxProfit);
        assertEquals(Arrays.asList(0, 1, 2, 3), result.indices.get(0));

    }

    @Test
    public void shouldWorkWithLowerFuturePrice() {
        Data result = Stock.returnIndicesMaxProfit(16, Arrays.asList(1, 2, 5, 8), Arrays.asList(2, 3, 6, 1));

        assertEquals(3, result.maxProfit);
        assertEquals(Arrays.asList(0, 1, 2), result.indices.get(0));

    }

    @Test
    public void shouldChooseLeastLoss() {
        Data result = Stock.returnIndicesMaxProfit(5, Arrays.asList(5, 2, 3), Arrays.asList(1, 0, 2));

        assertEquals(0, result.maxProfit);
        assertEquals(0, result.indices.size());

    }

    @Test
    public void shouldReturnEmptyListIfSavingsLessThanPrices() {
        Data result = Stock.returnIndicesMaxProfit(5, Arrays.asList(6, 9), Arrays.asList(4, 11));

        assertEquals(0, result.maxProfit);
        assertEquals(Collections.emptyList(),result.indices);

    }
}
