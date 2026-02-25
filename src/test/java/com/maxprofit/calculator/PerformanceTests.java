package com.maxprofit.calculator;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Performance Tests for the Max Profit Calculator.
 * 
 * <p>This test class verifies the algorithm's performance characteristics including:
 * <ul>
 *   <li>Algorithm execution time for various input sizes</li>
 *   <li>Memory usage under load</li>
 *   <li>No OutOfMemoryError conditions</li>
 * </ul>
 * 
 * <p><b>Test Thresholds:</b>
 * <ul>
 *   <li>5 items: &lt; 10ms</li>
 *   <li>10 items: &lt; 100ms</li>
 *   <li>50 items: &lt; 500ms</li>
 *   <li>100 items (boundary): &lt; 10s</li>
 *   <li>Memory usage: &lt; 512MB for max input</li>
 * </ul>
 * 
 * <p><b>Running these tests:</b>
 * <pre>
 * mvn test -Dtest=PerformanceTests
 * </pre>
 * 
 * @see ApiPerformanceTests for API-level performance tests
 */
@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength", "checkstyle:VisibilityModifier"})
class PerformanceTests {

    private static final int SMALL_SIZE = 5;
    private static final int MEDIUM_SIZE = 10;
    private static final int LARGE_SIZE = 50;
    private static final int BOUNDARY_SIZE = 100;

    private static final long SMALL_THRESHOLD_MS = 10;
    private static final long MEDIUM_THRESHOLD_MS = 100;
    private static final long LARGE_THRESHOLD_MS = 500;
    private static final long BOUNDARY_THRESHOLD_MS = 10000;

    private static final int MAX_MEMORY_MB = 512;

    private final MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
    private final Random random = new Random(42);

    /**
     * Cleans up heap memory before each test to ensure accurate measurements.
     */
    @BeforeEach
    void setUp() {
        System.gc();
    }

    /**
     * Cleans up after each test to maintain test isolation.
     */
    @AfterEach
    void tearDown() {
        System.gc();
    }

    /**
     * Tests that the algorithm completes in under 10ms for small input (5 items).
     * 
     * <p>This test verifies the algorithm performs efficiently for small datasets.
     * Uses 1000 iterations with 100 warmup runs to get stable measurements.
     */
    @Test
    void algorithmShouldCompleteInUnder10msFor5Items() {
        List<Integer> currentValues = generateRandomPrices(SMALL_SIZE);
        List<Integer> futureValues = generateRandomPrices(SMALL_SIZE);

        long executionTime = measureAlgorithmExecution(1000, 100, currentValues, futureValues);

        System.out.println("5 items - Avg execution time: " + executionTime + "ms");
        assertTrue(executionTime < SMALL_THRESHOLD_MS,
                "Execution time should be < " + SMALL_THRESHOLD_MS + "ms, was: " + executionTime + "ms");
    }

    /**
     * Tests that the algorithm completes in under 100ms for medium input (10 items).
     * 
     * <p>This test verifies the algorithm scales reasonably for medium-sized datasets.
     * Uses 100 iterations with 10 warmup runs.
     */
    @Test
    void algorithmShouldCompleteInUnder100msFor10Items() {
        List<Integer> currentValues = generateRandomPrices(MEDIUM_SIZE);
        List<Integer> futureValues = generateRandomPrices(MEDIUM_SIZE);

        long executionTime = measureAlgorithmExecution(100, 10, currentValues, futureValues);

        System.out.println("10 items - Avg execution time: " + executionTime + "ms");
        assertTrue(executionTime < MEDIUM_THRESHOLD_MS,
                "Execution time should be < " + MEDIUM_THRESHOLD_MS + "ms, was: " + executionTime + "ms");
    }

    /**
     * Tests that the algorithm completes in under 500ms for large input (50 items).
     * 
     * <p>This is the primary performance requirement - API must respond within 500ms
     * for 50 stocks. Uses 10 iterations with 1 warmup run.
     */
    @Test
    void algorithmShouldCompleteInUnder500msFor50Items() {
        List<Integer> currentValues = generateRandomPrices(LARGE_SIZE);
        List<Integer> futureValues = generateRandomPrices(LARGE_SIZE);

        long executionTime = measureAlgorithmExecution(10, 1, currentValues, futureValues);

        System.out.println("50 items - Avg execution time: " + executionTime + "ms");
        assertTrue(executionTime < LARGE_THRESHOLD_MS,
                "Execution time should be < " + LARGE_THRESHOLD_MS + "ms, was: " + executionTime + "ms");
    }

    /**
     * Tests that the algorithm completes in under 10 seconds for maximum input (100 items).
     * 
     * <p>100 items is the maximum allowed input size (defined by priceListMaxSize in Stock.java).
     * This is a boundary test to ensure the algorithm doesn't hang or take excessive time.
     * Only runs once due to the long execution time.
     */
    @Test
    void algorithmShouldCompleteInUnder10sFor100Items() {
        List<Integer> currentValues = generateRandomPrices(BOUNDARY_SIZE);
        List<Integer> futureValues = generateRandomPrices(BOUNDARY_SIZE);

        long executionTime = measureAlgorithmExecution(1, 1, currentValues, futureValues);

        System.out.println("100 items - Execution time: " + executionTime + "ms");
        assertTrue(executionTime < BOUNDARY_THRESHOLD_MS,
                "Execution time should be < " + BOUNDARY_THRESHOLD_MS + "ms, was: " + executionTime + "ms");
    }

    /**
     * Tests that memory usage doesn't exceed 512MB when processing max input.
     * 
     * <p>This test measures heap memory delta before and after algorithm execution
     * with the maximum allowed input size (100 items).
     */
    @Test
    void memoryUsageShouldNotExceed512MBFor100Items() {
        MemoryUsage heapBefore = memoryBean.getHeapMemoryUsage();
        long usedBefore = heapBefore.getUsed() / (1024 * 1024);

        List<Integer> currentValues = generateRandomPrices(BOUNDARY_SIZE);
        List<Integer> futureValues = generateRandomPrices(BOUNDARY_SIZE);

        Stock.returnIndicesMaxProfit(1000, currentValues, futureValues);

        MemoryUsage heapAfter = memoryBean.getHeapMemoryUsage();
        long usedAfter = heapAfter.getUsed() / (1024 * 1024);
        long usedDelta = usedAfter - usedBefore;

        System.out.println("Memory before: " + usedBefore + "MB, after: " + usedAfter + "MB, delta: " + usedDelta + "MB");

        assertTrue(usedDelta < MAX_MEMORY_MB,
                "Memory usage should increase by < " + MAX_MEMORY_MB + "MB, was: " + usedDelta + "MB");
    }

    /**
     * Tests that the algorithm doesn't throw OutOfMemoryError for max input.
     * 
     * <p>This is a safety test to ensure the algorithm is robust and can handle
     * the maximum allowed input size without crashing.
     */
    @Test
    void noOutOfMemoryErrorForMaxInput() {
        List<Integer> currentValues = generateRandomPrices(BOUNDARY_SIZE);
        List<Integer> futureValues = generateRandomPrices(BOUNDARY_SIZE);

        try {
            CalculationResult result = Stock.returnIndicesMaxProfit(1000, currentValues, futureValues);
            System.out.println("Max input test completed successfully. Profit: " + result.getMaxProfit());
        } catch (OutOfMemoryError e) {
            throw new AssertionError("OutOfMemoryError occurred for max input size", e);
        }
    }

    /**
     * Measures algorithm execution time with warmup and averaging.
     * 
     * @param totalRuns   Number of timing iterations to average
     * @param warmupRuns  Number of warmup iterations (not timed)
     * @param currentValues Current stock prices
     * @param futureValues  Future stock prices
     * @return Average execution time in milliseconds
     */
    private long measureAlgorithmExecution(int totalRuns, int warmupRuns, 
            List<Integer> currentValues, List<Integer> futureValues) {
        AtomicLong totalTime = new AtomicLong(0);

        for (int i = 0; i < warmupRuns; i++) {
            Stock.returnIndicesMaxProfit(100, currentValues, futureValues);
        }

        for (int i = 0; i < totalRuns; i++) {
            long startTime = System.nanoTime();
            Stock.returnIndicesMaxProfit(100, currentValues, futureValues);
            long endTime = System.nanoTime();
            totalTime.addAndGet(endTime - startTime);
        }

        return totalTime.get() / (1_000_000 * totalRuns);
    }

    /**
     * Generates a list of random stock prices.
     * 
     * @param size Number of prices to generate
     * @return List of random prices between 1 and 100
     */
    private List<Integer> generateRandomPrices(int size) {
        List<Integer> prices = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            prices.add(random.nextInt(100) + 1);
        }
        return prices;
    }
}
