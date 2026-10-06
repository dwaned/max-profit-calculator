package com.maxprofit.calculator.advisor;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength"})
class ProfitToolTests {

    private static Map<String, Object> args(final Object savings, final Object buy, final Object sell) {
        final Map<String, Object> args = new HashMap<>();
        args.put("savings", savings);
        args.put("buyPrices", buy);
        args.put("sellPrices", sell);
        return args;
    }

    @Test
    void shouldReturnTheCalculatorResultWithStocksNumberedFromOne() {
        final ToolInvocation invocation = ProfitTool.run(args(5, List.of(4, 1, 3), List.of(5, 2, 6)));

        assertThat(invocation.error()).isNull();
        assertThat(invocation.result()).containsEntry("maxProfit", 4)
                .containsEntry("stocksToBuy", List.of(2, 3))
                .containsEntry("savingsUsed", 4)
                .containsEntry("remainingSavings", 1);
    }

    @Test
    void shouldAcceptWholeNumbersSentAsDecimals() {
        assertThat(ProfitTool.run(args(5.0, List.of(4.0, 1L, 3), List.of(5, 2, 6))).result())
                .containsEntry("maxProfit", 4);
    }

    @Test
    void shouldRejectFractionsAndText() {
        assertThat(ProfitTool.run(args(5.5, List.of(4), List.of(5))).error()).isEqualTo("savings must contain whole numbers");
        assertThat(ProfitTool.run(args("5", List.of(4), List.of(5))).error()).isEqualTo("savings must contain whole numbers");
        assertThat(ProfitTool.run(args(5, List.of("4"), List.of(5))).error()).isEqualTo("buyPrices must contain whole numbers");
        assertThat(ProfitTool.run(args(5, List.of(4), List.of(1e12))).error()).isEqualTo("sellPrices must contain whole numbers");
        // The largest int is still a whole number: it fails the range check instead
        assertThat(ProfitTool.run(args((double) Integer.MAX_VALUE, List.of(4), List.of(5))).error())
                .isEqualTo("savings must be between 1 and 1000");
    }

    @Test
    void shouldRejectMissingArguments() {
        assertThat(ProfitTool.run(null).error()).isEqualTo("savings must contain whole numbers");
        assertThat(ProfitTool.run(args(5, null, List.of(5))).error())
                .isEqualTo("buyPrices must be a list of 1 to 100 whole numbers");
    }

    @Test
    void shouldEnforceTheSameLimitsAsTheApi() {
        assertThat(ProfitTool.run(args(0, List.of(4), List.of(5))).error()).isEqualTo("savings must be between 1 and 1000");
        assertThat(ProfitTool.run(args(1001, List.of(4), List.of(5))).error()).isEqualTo("savings must be between 1 and 1000");
        assertThat(ProfitTool.run(args(1000, List.of(4), List.of(5))).error()).isNull();
        assertThat(ProfitTool.run(args(1, List.of(4), List.of(5))).error()).isNull();
        assertThat(ProfitTool.run(args(5, List.of(), List.of())).error())
                .isEqualTo("buyPrices must be a list of 1 to 100 whole numbers");
        assertThat(ProfitTool.run(args(5, Collections.nCopies(101, 1), Collections.nCopies(101, 2))).error())
                .isEqualTo("buyPrices must be a list of 1 to 100 whole numbers");
        assertThat(ProfitTool.run(args(5, Collections.nCopies(100, 1), Collections.nCopies(100, 2))).error()).isNull();
        assertThat(ProfitTool.run(args(5, List.of(0), List.of(5))).error())
                .isEqualTo("buyPrices must contain prices between 1 and 1000");
        assertThat(ProfitTool.run(args(5, List.of(4), List.of(1001))).error())
                .isEqualTo("sellPrices must contain prices between 1 and 1000");
        assertThat(ProfitTool.run(args(5, List.of(1000), List.of(1))).error()).isNull();
        assertThat(ProfitTool.run(args(5, List.of(4, 1), List.of(5))).error())
                .isEqualTo("buyPrices and sellPrices must have the same number of entries");
    }

    @Test
    @SuppressWarnings("unchecked")
    void shouldDescribeItselfWithAJsonSchema() {
        final Map<String, Object> function = (Map<String, Object>) ProfitTool.definition().get("function");
        final Map<String, Object> parameters = (Map<String, Object>) function.get("parameters");

        assertThat(ProfitTool.definition()).containsEntry("type", "function");
        assertThat(function).containsEntry("name", "calculate_max_profit");
        assertThat(parameters.get("required")).isEqualTo(List.of("savings", "buyPrices", "sellPrices"));
        assertThat((Map<String, Object>) parameters.get("properties")).containsOnlyKeys("savings", "buyPrices", "sellPrices");
    }
}
