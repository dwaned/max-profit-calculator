package com.maxprofit.calculator.advisor;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.SerializationFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * Record and replay for the model. In record mode it passes each call to a
 * real model and saves the request and reply; in replay mode it answers from
 * the saved file and fails if the agent sends anything different from what was
 * recorded (a changed prompt, tool definition or tool result).
 */
final class RecordingChatModel implements ChatModel {

    /** A saved conversation: what the agent sent and what the model replied, call by call. */
    record Recording(String model, String question, List<Map<String, Object>> tools, List<Exchange> exchanges) {
    }

    /** One model call. */
    record Exchange(List<ChatMessage> request, ChatMessage response) {
    }

    private static final JsonMapper JSON = JsonMapper.builder().enable(SerializationFeature.INDENT_OUTPUT).build();

    private final ChatModel delegate;
    private final Path file;
    private final Recording replay;
    private final List<Exchange> recorded = new ArrayList<>();
    private List<Map<String, Object>> tools = List.of();
    private int next;

    private RecordingChatModel(final ChatModel delegate, final Path file, final Recording replay) {
        this.delegate = delegate;
        this.file = file;
        this.replay = replay;
    }

    static RecordingChatModel record(final ChatModel real, final Path file) {
        return new RecordingChatModel(real, file, null);
    }

    static RecordingChatModel replay(final Path file) {
        try {
            return new RecordingChatModel(null, file, JSON.readValue(Files.readString(file), Recording.class));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    Recording recording() {
        return replay;
    }

    @Override
    public ChatMessage chat(final List<ChatMessage> messages, final List<Map<String, Object>> toolDefinitions) {
        if (replay == null) {
            tools = toolDefinitions;
            final ChatMessage response = delegate.chat(messages, toolDefinitions);
            recorded.add(new Exchange(messages, response));
            return response;
        }
        assertThat(next).as("the agent made more model calls than were recorded").isLessThan(replay.exchanges().size());
        final Exchange exchange = replay.exchanges().get(next++);
        assertThat(tree(toolDefinitions)).as("tool definitions differ from the recording: re-record")
                .isEqualTo(tree(replay.tools()));
        assertThat(tree(messages)).as("call %d differs from the recording: re-record", next)
                .isEqualTo(tree(exchange.request()));
        return exchange.response();
    }

    /** Fails unless every recorded call was replayed. */
    void assertFullyReplayed() {
        assertThat(next).as("recorded model calls not made").isEqualTo(replay.exchanges().size());
    }

    /** Writes the recorded conversation to the file. */
    void save(final String question) {
        try {
            Files.createDirectories(file.getParent());
            Files.writeString(file, JSON.writeValueAsString(new Recording(delegate.name(), question, tools, recorded))
                    + System.lineSeparator());
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public String name() {
        return replay == null ? delegate.name() : replay.model();
    }

    private static JsonNode tree(final Object value) {
        return JSON.valueToTree(value);
    }
}
