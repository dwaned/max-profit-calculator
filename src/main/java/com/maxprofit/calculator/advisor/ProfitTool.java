package com.maxprofit.calculator.advisor;

import com.maxprofit.calculator.CalculationResult;
import com.maxprofit.calculator.Stock;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The advisor's only tool: the deterministic max-profit calculator. The model
 * decides what to pass; this class checks it with the same limits as the
 * {@code /api/calculate} endpoint before running the calculation. Invalid
 * arguments are reported back to the model so it can correct itself.
 */
public final class ProfitTool {

    /** Name the model uses to call the tool. */
    public static final String NAME = "calculate_max_profit";

    private static final int MAX_VALUE = 1000;
    private static final int MAX_STOCKS = 100;

    private ProfitTool() {
    }

    /**
     * @return the tool definition sent to the model (JSON-schema parameters)
     */
    public static Map<String, Object> definition() {
        final Map<String, Object> integerList = Map.of("type", "array", "items", Map.of("type", "integer"));
        final Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("savings", Map.of("type", "integer", "description", "Savings in whole euros (1 to 1000)"));
        properties.put("buyPrices", withDescription(integerList, "Today's price of each stock, in euros"));
        properties.put("sellPrices", withDescription(integerList,
                "Forecast future price of each stock, in the same order as buyPrices"));
        return Map.of("type", "function", "function", Map.of(
                "name", NAME,
                "description", "Chooses which stocks to buy for the highest total profit without spending more "
                        + "than the savings. Returns the profit, the stocks to buy (numbered from 1 in the order "
                        + "given) and the savings used.",
                "parameters", Map.of(
                        "type", "object",
                        "properties", properties,
                        "required", List.of("savings", "buyPrices", "sellPrices"))));
    }

    /**
     * Validates the model's arguments and runs the calculator.
     *
     * @param arguments arguments from the model's tool call
     * @return the result, or an error the model can act on
     */
    public static ToolInvocation run(final Map<String, Object> arguments) {
        final Map<String, Object> args = arguments == null ? Map.of() : arguments;
        try {
            final int savings = wholeNumber(args.get("savings"), "savings");
            final List<Integer> buy = prices(args.get("buyPrices"), "buyPrices");
            final List<Integer> sell = prices(args.get("sellPrices"), "sellPrices");
            if (savings < 1 || savings > MAX_VALUE) {
                throw new IllegalArgumentException("savings must be between 1 and " + MAX_VALUE);
            }
            if (buy.size() != sell.size()) {
                throw new IllegalArgumentException("buyPrices and sellPrices must have the same number of entries");
            }
            final CalculationResult result = Stock.returnIndicesMaxProfit(savings, buy, sell);
            final List<Integer> stocks = new ArrayList<>();
            result.getIndices().forEach(index -> stocks.add(index + 1));
            final Map<String, Object> output = new LinkedHashMap<>();
            output.put("maxProfit", result.getMaxProfit());
            output.put("stocksToBuy", stocks);
            output.put("savingsUsed", result.getSavingsUsed());
            output.put("remainingSavings", result.getRemainingSavings());
            return new ToolInvocation(NAME, args, output, null);
        } catch (IllegalArgumentException e) {
            return new ToolInvocation(NAME, args, null, e.getMessage());
        }
    }

    private static Map<String, Object> withDescription(final Map<String, Object> schema, final String description) {
        final Map<String, Object> copy = new LinkedHashMap<>(schema);
        copy.put("description", description);
        return copy;
    }

    private static List<Integer> prices(final Object value, final String field) {
        if (!(value instanceof List<?> list) || list.isEmpty() || list.size() > MAX_STOCKS) {
            throw new IllegalArgumentException(field + " must be a list of 1 to " + MAX_STOCKS + " whole numbers");
        }
        final List<Integer> prices = new ArrayList<>();
        for (final Object item : list) {
            final int price = wholeNumber(item, field);
            if (price < 1 || price > MAX_VALUE) {
                throw new IllegalArgumentException(field + " must contain prices between 1 and " + MAX_VALUE);
            }
            prices.add(price);
        }
        return prices;
    }

    // Models sometimes send 5.0 for 5; accept that, but not 5.5 or "5".
    private static int wholeNumber(final Object value, final String field) {
        if (value instanceof Number number && number.doubleValue() == Math.rint(number.doubleValue())
                && Math.abs(number.doubleValue()) <= Integer.MAX_VALUE) {
            return number.intValue();
        }
        throw new IllegalArgumentException(field + " must contain whole numbers");
    }
}
