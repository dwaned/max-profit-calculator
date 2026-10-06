package com.maxprofit.calculator.advisor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;

import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.constraints.IntRange;

import org.junit.jupiter.api.Test;

/**
 * Deterministic foundations: the agent loop with a scripted model, so every
 * failure is a bug in our code, never the model's mood.
 */
@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength"})
class StockAdvisorTests {

    private static final Map<String, Object> VALID = Map.of("savings", 5, "buyPrices", List.of(4, 1, 3),
            "sellPrices", List.of(5, 2, 6));

    @Test
    void shouldRunTheToolAndVerifyAnAnswerThatQuotesItsProfit() {
        final ScriptedChatModel model = new ScriptedChatModel()
                .callTool("calculate_max_profit", VALID)
                .reply("Buy stocks 2 and 3 for a profit of €4.");

        final AdvisorAnswer answer = new StockAdvisor(model, 4).ask("Which should I buy?");

        assertThat(answer.answer()).isEqualTo("Buy stocks 2 and 3 for a profit of €4.");
        assertThat(answer.verified()).isTrue();
        assertThat(answer.completed()).isTrue();
        assertThat(answer.turns()).isEqualTo(2);
        assertThat(answer.model()).isEqualTo("scripted");
        assertThat(answer.toolCalls()).singleElement().satisfies(call -> {
            assertThat(call.arguments()).isEqualTo(VALID);
            assertThat(call.result()).containsEntry("maxProfit", 4);
        });
    }

    @Test
    void shouldSendTheSystemPromptQuestionAndToolResultToTheModel() {
        final ScriptedChatModel model = new ScriptedChatModel()
                .callTool("calculate_max_profit", VALID)
                .reply("Profit €4.");

        new StockAdvisor(model, 4).ask("Which should I buy?");

        assertThat(model.requests().get(0)).containsExactly(
                ChatMessage.system(StockAdvisor.SYSTEM_PROMPT), ChatMessage.user("Which should I buy?"));
        final ChatMessage toolResult = model.requests().get(1).get(3);
        assertThat(toolResult.role()).isEqualTo("tool");
        assertThat(toolResult.toolName()).isEqualTo("calculate_max_profit");
        assertThat(toolResult.content())
                .isEqualTo("{\"maxProfit\":4,\"stocksToBuy\":[2,3],\"savingsUsed\":4,\"remainingSavings\":1}");
    }

    @Test
    void shouldNotVerifyAnAnswerWithTheWrongProfit() {
        final ScriptedChatModel model = new ScriptedChatModel()
                .callTool("calculate_max_profit", VALID)
                .reply("Buy stocks 2 and 3 for a profit of €14.");

        assertThat(new StockAdvisor(model, 4).ask("Which?").verified()).isFalse();
    }

    @Test
    void shouldNotVerifyAnAnswerGivenWithoutCallingTheTool() {
        final AdvisorAnswer answer = new StockAdvisor(new ScriptedChatModel().reply("Buy stock 3, profit €4."), 4)
                .ask("Which?");

        assertThat(answer.verified()).isFalse();
        assertThat(answer.completed()).isTrue();
        assertThat(answer.toolCalls()).isEmpty();
    }

    @Test
    void shouldReportInvalidArgumentsSoTheModelCanCorrectThem() {
        final ScriptedChatModel model = new ScriptedChatModel()
                .callTool("calculate_max_profit", Map.of("savings", 5, "buyPrices", List.of(4, 1), "sellPrices", List.of(5)))
                .callTool("calculate_max_profit", VALID)
                .reply("Profit €4.");

        final AdvisorAnswer answer = new StockAdvisor(model, 4).ask("Which?");

        assertThat(model.requests().get(1).get(3).content())
                .isEqualTo("{\"error\":\"buyPrices and sellPrices must have the same number of entries\"}");
        assertThat(answer.toolCalls()).extracting(ToolInvocation::error)
                .containsExactly("buyPrices and sellPrices must have the same number of entries", null);
        assertThat(answer.verified()).isTrue();
        assertThat(answer.turns()).isEqualTo(3);
    }

    @Test
    void shouldRefuseToolsItDoesNotHave() {
        final ScriptedChatModel model = new ScriptedChatModel()
                .callTool("get_weather", Map.of())
                .reply("Sorry.");

        final AdvisorAnswer answer = new StockAdvisor(model, 4).ask("Weather?");

        assertThat(answer.toolCalls()).singleElement()
                .satisfies(call -> assertThat(call.error()).isEqualTo("Unknown tool get_weather; the only tool is calculate_max_profit"));
        assertThat(answer.verified()).isFalse();
    }

    @Test
    void shouldStopAtTheTurnLimit() {
        final ScriptedChatModel model = new ScriptedChatModel()
                .callTool("calculate_max_profit", VALID)
                .callTool("calculate_max_profit", VALID);

        final AdvisorAnswer answer = new StockAdvisor(model, 2).ask("Which?");

        assertThat(answer.completed()).isFalse();
        assertThat(answer.verified()).isFalse();
        assertThat(answer.turns()).isEqualTo(2);
        assertThat(answer.toolCalls()).hasSize(2);
        assertThat(answer.answer()).startsWith("Sorry, I couldn't work that out");
        assertThat(model.requests()).hasSize(2);
    }

    @Test
    void shouldAllowASingleTurn() {
        assertThat(new StockAdvisor(new ScriptedChatModel().reply("Hi"), 1).ask("Hi").completed()).isTrue();
    }

    @Test
    void shouldRequireAtLeastOneTurn() {
        assertThatThrownBy(() -> new StockAdvisor(new ScriptedChatModel(), 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("maxTurns must be at least 1");
    }

    @Test
    void shouldCheckTheProfitOfTheLatestSuccessfulCalculation() {
        final List<ToolInvocation> calls = List.of(
                new ToolInvocation("calculate_max_profit", Map.of(), Map.of("maxProfit", 4), null),
                new ToolInvocation("calculate_max_profit", Map.of(), Map.of("maxProfit", 9), null),
                new ToolInvocation("calculate_max_profit", Map.of(), null, "bad"));

        assertThat(StockAdvisor.quotesProfit("Profit €9", calls)).isTrue();
        assertThat(StockAdvisor.quotesProfit("Profit €4", calls)).isFalse();
        assertThat(StockAdvisor.quotesProfit("Profit €9", List.of())).isFalse();
    }

    @Property
    void shouldVerifyAnyAnswerThatQuotesTheExactProfit(@ForAll @IntRange(min = 0, max = 100_000) final int profit) {
        final List<ToolInvocation> calls = List.of(
                new ToolInvocation("calculate_max_profit", Map.of(), Map.of("maxProfit", profit), null));

        assertThat(StockAdvisor.quotesProfit("Total profit: €" + profit + ".", calls)).isTrue();
        assertThat(StockAdvisor.quotesProfit("Total profit: " + profit + " euros", calls)).isTrue();
        assertThat(StockAdvisor.quotesProfit("Total profit: €1" + profit, calls)).isFalse();
        assertThat(StockAdvisor.quotesProfit("Total profit: €" + profit + "5", calls)).isFalse();
        assertThat(StockAdvisor.quotesProfit("Total profit: €" + profit + ".5", calls)).isFalse();
        assertThat(StockAdvisor.quotesProfit("Total profit: €2." + profit, calls)).isFalse();
    }
}
