package com.maxprofit.calculator.advisor;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.stream.Stream;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.web.client.RestClient;

/**
 * Reproducible reality: real conversations with the local model, recorded
 * once and replayed on every build. They check the flow (which tool was
 * called, with which arguments, and whether the answer is verified), not the
 * exact wording.
 *
 * <p>To re-record against a running Ollama (after changing the prompt, the
 * tool or the model):
 * {@code mvn test -Dtest=AdvisorReplayTests -Dadvisor.record=true}
 */
@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength"})
class AdvisorReplayTests {

    private static final Path RECORDINGS = Path.of("src/test/resources/advisor/recordings");
    private static final boolean RECORD = Boolean.getBoolean("advisor.record");

    static Stream<Arguments> conversations() {
        return Stream.of(
                Arguments.of("chooses-the-best-stocks",
                        "I have 5 euros. Stocks cost 4, 1 and 3 today and will be worth 5, 2 and 6. Which should I buy?",
                        (Consumer<AdvisorAnswer>) answer -> {
                            assertThat(answer.toolCalls()).singleElement().satisfies(call -> {
                                assertThat(call.arguments()).isEqualTo(Map.of("savings", 5,
                                        "buyPrices", List.of(4, 1, 3), "sellPrices", List.of(5, 2, 6)));
                                assertThat(call.result()).containsEntry("stocksToBuy", List.of(2, 3));
                            });
                            assertThat(answer.verified()).isTrue();
                        }),
                Arguments.of("uses-all-savings",
                        "With 10 euros, prices now 5, 5 and 1 and later 9, 9 and 4, what's the best I can do?",
                        (Consumer<AdvisorAnswer>) answer -> {
                            assertThat(answer.toolCalls()).singleElement().satisfies(call ->
                                    assertThat(call.arguments()).isEqualTo(Map.of("savings", 10,
                                            "buyPrices", List.of(5, 5, 1), "sellPrices", List.of(9, 9, 4))));
                            assertThat(answer.verified()).isTrue();
                        }),
                Arguments.of("nothing-is-profitable",
                        "I have 20 euros. Two stocks cost 8 and 9 now and will be worth 6 and 9 later. What should I buy?",
                        (Consumer<AdvisorAnswer>) answer -> {
                            assertThat(answer.toolCalls()).singleElement().satisfies(call ->
                                    assertThat(call.result()).containsEntry("maxProfit", 0));
                            assertThat(answer.verified()).isTrue();
                        }),
                Arguments.of("asks-for-missing-prices",
                        "I have 50 euros to invest in stocks. Which ones should I buy?",
                        (Consumer<AdvisorAnswer>) answer -> {
                            // Recorded: the model first called the tool with empty price lists, the tool
                            // rejected them, and the model then asked for the prices. What matters is that
                            // no calculation ever ran on prices the user did not give.
                            assertThat(answer.toolCalls()).as("must not calculate with invented prices")
                                    .allSatisfy(call -> assertThat(call.result()).isNull());
                            assertThat(answer.verified()).isFalse();
                        }),
                Arguments.of("asks-for-missing-future-prices",
                        "I have 10 euros and the stocks cost 3, 4 and 5. Which should I buy?",
                        (Consumer<AdvisorAnswer>) answer -> {
                            // The evaluation found the model copying today's prices as the future prices in
                            // 10 of 10 runs; the prompt now forbids assuming prices. Guard that here.
                            assertThat(answer.toolCalls()).as("must not calculate with invented future prices")
                                    .allSatisfy(call -> assertThat(call.result()).isNull());
                            assertThat(answer.verified()).isFalse();
                        }),
                Arguments.of("declines-off-topic-questions",
                        "What will the weather be like tomorrow?",
                        (Consumer<AdvisorAnswer>) answer -> assertThat(answer.toolCalls()).isEmpty()));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("conversations")
    void shouldFollowTheRecordedFlow(final String name, final String question, final Consumer<AdvisorAnswer> expectations) {
        final Path file = RECORDINGS.resolve(name + ".json");
        final RecordingChatModel model = RECORD
                ? RecordingChatModel.record(liveModel(), file)
                : RecordingChatModel.replay(file);

        final AdvisorAnswer answer = new StockAdvisor(model, 4).ask(question);

        if (RECORD) {
            model.save(question);
        } else {
            assertThat(model.recording().question()).isEqualTo(question);
            model.assertFullyReplayed();
        }
        assertThat(answer.completed()).isTrue();
        expectations.accept(answer);
    }

    private static ChatModel liveModel() {
        return new OllamaChatModel(RestClient.builder(), new AdvisorProperties(true,
                System.getProperty("advisor.ollama-url", "http://localhost:11434"),
                System.getProperty("advisor.model", "qwen3.5:4b"), 0.3, 120, 4));
    }
}
