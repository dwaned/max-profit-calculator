package com.maxprofit.calculator.advisor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

/**
 * The Ollama client against a mock server: what it sends, and how it reads
 * Ollama's replies.
 */
@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength"})
class OllamaChatModelTest {

    private static final AdvisorProperties PROPERTIES =
            new AdvisorProperties(true, "http://ollama:11434", "qwen3.5:4b", 0.3, 30, 4);

    private MockRestServiceServer server;
    private OllamaChatModel model;

    @BeforeEach
    void setUp() {
        final RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        model = new OllamaChatModel(builder, PROPERTIES);
    }

    @Test
    void shouldSendTheConversationToolsAndSettingsInOllamaFormat() {
        server.expect(requestTo("http://ollama:11434/api/chat"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().json("""
                        {"model": "qwen3.5:4b", "stream": false, "think": false, "options": {"temperature": 0.3},
                         "tools": [{"type": "function"}],
                         "messages": [
                           {"role": "user", "content": "Which?"},
                           {"role": "assistant", "content": "", "tool_calls": [
                             {"function": {"name": "calculate_max_profit", "arguments": {"savings": 5}}}]},
                           {"role": "tool", "content": "{\\"maxProfit\\":4}", "tool_name": "calculate_max_profit"}]}
                        """))
                .andRespond(withSuccess("{\"message\": {\"role\": \"assistant\", \"content\": \"Profit €4\"}}",
                        MediaType.APPLICATION_JSON));

        final ChatMessage reply = model.chat(List.of(
                ChatMessage.user("Which?"),
                ChatMessage.assistant("", List.of(new ToolCall("calculate_max_profit", Map.of("savings", 5)))),
                ChatMessage.tool("calculate_max_profit", "{\"maxProfit\":4}")),
                List.of(Map.of("type", "function")));

        assertThat(reply).isEqualTo(ChatMessage.assistant("Profit €4", List.of()));
        assertThat(model.name()).isEqualTo("qwen3.5:4b");
        server.verify();
    }

    @Test
    void shouldReadToolCalls() {
        server.expect(requestTo("http://ollama:11434/api/chat")).andRespond(withSuccess("""
                {"message": {"role": "assistant", "content": "", "tool_calls": [
                  {"function": {"name": "calculate_max_profit",
                                "arguments": {"savings": 5, "buyPrices": [4, 1], "sellPrices": [5, 2]}}}]}}
                """, MediaType.APPLICATION_JSON));

        final ChatMessage reply = model.chat(List.of(ChatMessage.user("Which?")), List.of());

        assertThat(reply.toolCalls()).containsExactly(new ToolCall("calculate_max_profit",
                Map.of("savings", 5, "buyPrices", List.of(4, 1), "sellPrices", List.of(5, 2))));
    }

    @Test
    void shouldReportAServerErrorAsUnavailable() {
        server.expect(requestTo("http://ollama:11434/api/chat")).andRespond(withServerError());

        assertThatThrownBy(() -> model.chat(List.of(ChatMessage.user("Hi")), List.of()))
                .isInstanceOf(AdvisorUnavailableException.class)
                .hasMessage("The local model could not be reached or replied unexpectedly");
    }

    @Test
    void shouldReportAReplyWithoutAMessageAsUnavailable() {
        server.expect(requestTo("http://ollama:11434/api/chat"))
                .andRespond(withSuccess("{\"error\": \"model not found\"}", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> model.chat(List.of(ChatMessage.user("Hi")), List.of()))
                .isInstanceOf(AdvisorUnavailableException.class)
                .hasMessage("The local model returned no message");
    }

    @Test
    void shouldReportMalformedJsonAsUnavailable() {
        server.expect(requestTo("http://ollama:11434/api/chat"))
                .andRespond(withSuccess("not json", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> model.chat(List.of(ChatMessage.user("Hi")), List.of()))
                .isInstanceOf(AdvisorUnavailableException.class);
    }
}
