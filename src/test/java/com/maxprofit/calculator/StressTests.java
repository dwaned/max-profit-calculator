package com.maxprofit.calculator;

import org.junit.jupiter.api.Test;

import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Stress tests for the {@link Stock#returnIndicesMaxProfit} algorithm.
 *
 * <p>Pure in-process tests — no Spring context, no HTTP. They check that the
 * O(n · savings) dynamic program stays fast and lean up to the maximum allowed
 * input (100 stocks, savings 1000). End-to-end latency through the API is
 * covered by {@link ApiPerformanceTests}.
 *
 * <p>To be reliable on shared CI runners, timings are the <b>median</b> of many
 * runs after a JIT warm-up, always at the maximum budget (the worst case for
 * this algorithm), and the thresholds sit orders of magnitude above the real
 * cost. Memory is measured as bytes allocated by the test thread, which, unlike
 * heap usage, does not depend on when the garbage collector runs.
 *
 * <p><b>Thresholds (median time per call):</b>
 * <ul>
 *   <li>5 items: &lt; 10ms</li>
 *   <li>10 items: &lt; 20ms</li>
 *   <li>50 items: &lt; 50ms</li>
 *   <li>100 items (maximum): &lt; 100ms</li>
 *   <li>Allocation for one maximum-size call: &lt; 64MB</li>
 * </ul>
 *
 * <p>Runs in the default suite ({@code mvn test}) and on its own with
 * {@code mvn test -Pperformance-tests}.
 */
@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength"})
class StressTests {

    private static final int MAX_SAVINGS = 1000;
    private static final int WARMUP_RUNS = 50;
    private static final int TIMED_RUNS = 51;
    private static final long MAX_ALLOCATION_BYTES = 64L * 1024 * 1024;

    private final Random random = new Random(42);

    @Test
    void medianTimeFor5ItemsShouldBeUnder10ms() {
        assertMedianUnder(5, 10);
    }

    @Test
    void medianTimeFor10ItemsShouldBeUnder20ms() {
        assertMedianUnder(10, 20);
    }

    @Test
    void medianTimeFor50ItemsShouldBeUnder50ms() {
        assertMedianUnder(50, 50);
    }

    @Test
    void medianTimeFor100ItemsShouldBeUnder100ms() {
        assertMedianUnder(100, 100);
    }

    @Test
    void maximumInputShouldAllocateLessThan64MB() {
        List<Integer> buy = generateRandomPrices(100);
        List<Integer> sell = generateRandomPrices(100);
        Stock.returnIndicesMaxProfit(MAX_SAVINGS, buy, sell); // load classes before measuring

        com.sun.management.ThreadMXBean threads =
                (com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean();
        long threadId = Thread.currentThread().threadId();
        long before = threads.getThreadAllocatedBytes(threadId);
        Stock.returnIndicesMaxProfit(MAX_SAVINGS, buy, sell);
        long allocated = threads.getThreadAllocatedBytes(threadId) - before;

        System.out.printf("100 items, savings %d - allocated: %.2f MB%n", MAX_SAVINGS, allocated / 1048576.0);
        assertTrue(allocated < MAX_ALLOCATION_BYTES,
                "One maximum-size call should allocate < 64MB, allocated " + allocated + " bytes");
    }

    @Test
    void maximumInputShouldNotRunOutOfMemory() {
        List<Integer> buy = generateRandomPrices(100);
        List<Integer> sell = generateRandomPrices(100);
        try {
            CalculationResult result = Stock.returnIndicesMaxProfit(MAX_SAVINGS, buy, sell);
            assertTrue(result.getMaxProfit() >= 0, "Profit should never be negative");
        } catch (OutOfMemoryError e) {
            throw new AssertionError("OutOfMemoryError occurred for max input size", e);
        }
    }

    private void assertMedianUnder(final int items, final long thresholdMs) {
        List<Integer> buy = generateRandomPrices(items);
        List<Integer> sell = generateRandomPrices(items);
        double medianMs = medianMillis(buy, sell);

        System.out.printf("%d items, savings %d - median: %.3f ms (threshold %d ms)%n",
                items, MAX_SAVINGS, medianMs, thresholdMs);
        assertTrue(medianMs < thresholdMs,
                "Median time for " + items + " items should be < " + thresholdMs + "ms, was " + medianMs + "ms");
    }

    /**
     * Median wall-clock time of {@link #TIMED_RUNS} calls after {@link #WARMUP_RUNS}
     * untimed warm-up calls, so JIT compilation and one-off pauses (GC, a busy
     * neighbour on a shared runner) don't decide the result.
     */
    private static double medianMillis(final List<Integer> buy, final List<Integer> sell) {
        for (int i = 0; i < WARMUP_RUNS; i++) {
            Stock.returnIndicesMaxProfit(MAX_SAVINGS, buy, sell);
        }
        long[] nanos = new long[TIMED_RUNS];
        for (int i = 0; i < TIMED_RUNS; i++) {
            long start = System.nanoTime();
            Stock.returnIndicesMaxProfit(MAX_SAVINGS, buy, sell);
            nanos[i] = System.nanoTime() - start;
        }
        Arrays.sort(nanos);
        return nanos[TIMED_RUNS / 2] / 1_000_000.0;
    }

    /** Random prices from 1 to 100, so many stocks fit in the maximum budget. */
    private List<Integer> generateRandomPrices(final int size) {
        List<Integer> prices = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            prices.add(random.nextInt(100) + 1);
        }
        return prices;
    }
}
