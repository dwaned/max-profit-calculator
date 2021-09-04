import org.junit.Test;

import java.util.ArrayList;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class StockTest {
    @Test
    public void testGetAllPermutationsForListOfSize() {
        assertEquals(7, Stock.getAllPermutationsForListOfSize(3).size());
        assertEquals(1, Stock.getAllPermutationsForListOfSize(1).size());
        assertEquals(15, Stock.getAllPermutationsForListOfSize(4).size());
    }

    @Test
    public void testReturnIndicesMaxProfit() {
        ArrayList<Integer> currentValue = new ArrayList<Integer>();
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, currentValue, new ArrayList<Integer>());
        assertTrue(actualReturnIndicesMaxProfitResult.indices.isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }

    @Test
    public void testReturnIndicesMaxProfit10() {
        ArrayList<Integer> integerList = new ArrayList<Integer>();
        integerList.add(2);
        integerList.add(2);
        integerList.add(2);
        integerList.add(2);
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, integerList, new ArrayList<Integer>());
        assertTrue(actualReturnIndicesMaxProfitResult.indices.isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }

    @Test
    public void testReturnIndicesMaxProfit11() {
        ArrayList<Integer> integerList = new ArrayList<Integer>();
        integerList.add(2);
        integerList.add(3);
        integerList.add(2);
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, integerList, new ArrayList<Integer>());
        assertTrue(actualReturnIndicesMaxProfitResult.indices.isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }

    @Test
    public void testReturnIndicesMaxProfit2() {
        ArrayList<Integer> integerList = new ArrayList<Integer>();
        integerList.add(2);
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, integerList, new ArrayList<Integer>());
        assertTrue(actualReturnIndicesMaxProfitResult.indices.isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }

    @Test
    public void testReturnIndicesMaxProfit3() {
        ArrayList<Integer> integerList = new ArrayList<Integer>();
        integerList.add(2);
        integerList.add(2);
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, integerList, new ArrayList<Integer>());
        assertTrue(actualReturnIndicesMaxProfitResult.indices.isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }

    @Test
    public void testReturnIndicesMaxProfit4() {
        ArrayList<Integer> integerList = new ArrayList<Integer>();
        integerList.add(0);
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(-1, integerList, new ArrayList<Integer>());
        assertTrue(actualReturnIndicesMaxProfitResult.indices.isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }

    @Test
    public void testReturnIndicesMaxProfit5() {
        ArrayList<Integer> integerList = new ArrayList<Integer>();
        integerList.add(0);

        ArrayList<Integer> integerList1 = new ArrayList<Integer>();
        integerList1.add(2);
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, integerList, integerList1);
        assertEquals(1, actualReturnIndicesMaxProfitResult.indices.size());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }

    @Test
    public void testReturnIndicesMaxProfit6() {
        ArrayList<Integer> integerList = new ArrayList<Integer>();
        integerList.add(2);
        integerList.add(2);
        integerList.add(2);
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, integerList, new ArrayList<Integer>());
        assertTrue(actualReturnIndicesMaxProfitResult.indices.isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }

    @Test
    public void testReturnIndicesMaxProfit7() {
        ArrayList<Integer> integerList = new ArrayList<Integer>();
        integerList.add(0);

        ArrayList<Integer> integerList1 = new ArrayList<Integer>();
        integerList1.add(0);
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, integerList, integerList1);
        assertEquals(1, actualReturnIndicesMaxProfitResult.indices.size());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }

    @Test
    public void testReturnIndicesMaxProfit8() {
        ArrayList<Integer> integerList = new ArrayList<Integer>();
        integerList.add(0);

        ArrayList<Integer> integerList1 = new ArrayList<Integer>();
        integerList1.add(-1);
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, integerList, integerList1);
        // assertTrue(actualReturnIndicesMaxProfitResult.indices.isEmpty()); -- To decide if a stock with price 0 should still be added or not
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }

    @Test
    public void testReturnIndicesMaxProfit9() {
        ArrayList<Integer> integerList = new ArrayList<Integer>();
        integerList.add(1);

        ArrayList<Integer> integerList1 = new ArrayList<Integer>();
        integerList1.add(1);
        Data actualReturnIndicesMaxProfitResult = Stock.returnIndicesMaxProfit(1, integerList, integerList1);
        assertTrue(actualReturnIndicesMaxProfitResult.indices.isEmpty());
        assertEquals(0, actualReturnIndicesMaxProfitResult.maxProfit);
    }
}

