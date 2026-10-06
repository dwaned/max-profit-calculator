package com.maxprofit.calculator.advisor;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * {@link ChatModel} backed by Ollama's {@code /api/chat} endpoint.
 */
public class OllamaChatModel implements ChatModel {

    private final RestClient client;
    private final String model;
    private final double temperature;
    private final JsonMapper json = JsonMapper.builder().build();

    /**
     * @param builder    a RestClient builder, with timeouts set (tests bind a mock server to it)
     * @param properties advisor settings: URL, model and temperature
     */
    public OllamaChatModel(final RestClient.Builder builder, final AdvisorProperties properties) {
        this.client = builder.baseUrl(properties.ollamaUrl()).build();
        this.model = properties.model();
        this.temperature = properties.temperature();
    }

    @Override
    public ChatMessage chat(final List<ChatMessage> messages, final List<Map<String, Object>> tools) {
        final Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("messages", messages.stream().map(OllamaChatModel::toOllama).toList());
        body.put("tools", tools);
        body.put("stream", false);
        body.put("think", false);
        body.put("options", Map.of("temperature", temperature));
        try {
            final String response = client.post().uri("/api/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(json.writeValueAsString(body))
                    .retrieve()
                    .body(String.class);
            return fromOllama(json.readTree(response == null ? "" : response).path("message"));
        } catch (RestClientException | JacksonException e) {
            throw new AdvisorUnavailableException("The local model could not be reached or replied unexpectedly", e);
        }
    }

    @Override
    public String name() {
        return model;
    }

    private static Map<String, Object> toOllama(final ChatMessage message) {
        final Map<String, Object> out = new LinkedHashMap<>();
        out.put("role", message.role());
        out.put("content", message.content());
        if (!message.toolCalls().isEmpty()) {
            out.put("tool_calls", message.toolCalls().stream()
                    .map(call -> Map.of("function", Map.of("name", call.name(), "arguments", call.arguments())))
                    .toList());
        }
        if (message.toolName() != null) {
            out.put("tool_name", message.toolName());
        }
        return out;
    }

    @SuppressWarnings("unchecked")
    private ChatMessage fromOllama(final JsonNode message) {
        if (message.isMissingNode()) {
            throw new AdvisorUnavailableException("The local model returned no message", null);
        }
        final List<ToolCall> calls = new ArrayList<>();
        for (final JsonNode call : message.path("tool_calls")) {
            final JsonNode function = call.path("function");
            calls.add(new ToolCall(function.path("name").asString(),
                    json.convertValue(function.path("arguments"), Map.class)));
        }
        return ChatMessage.assistant(message.path("content").asString(""), calls);
    }
}
