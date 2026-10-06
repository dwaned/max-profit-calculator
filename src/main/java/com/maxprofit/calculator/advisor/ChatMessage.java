package com.maxprofit.calculator.advisor;

import java.util.List;

/**
 * One message in a conversation with the model.
 *
 * @param role      {@code system}, {@code user}, {@code assistant} or {@code tool}
 * @param content   text of the message (may be empty when the model only calls tools)
 * @param toolCalls tool calls requested by an assistant message, otherwise empty
 * @param toolName  for a {@code tool} message, the tool whose result it carries
 */
public record ChatMessage(String role, String content, List<ToolCall> toolCalls, String toolName) {

    /**
     * Normalises missing parts so callers never see null lists or content.
     *
     * @param role      see {@link #role}
     * @param content   see {@link #content}
     * @param toolCalls see {@link #toolCalls}
     * @param toolName  see {@link #toolName}
     */
    public ChatMessage {
        content = content == null ? "" : content;
        toolCalls = toolCalls == null ? List.of() : List.copyOf(toolCalls);
    }

    /**
     * @param content the system prompt
     * @return a system message
     */
    public static ChatMessage system(final String content) {
        return new ChatMessage("system", content, null, null);
    }

    /**
     * @param content the user's question
     * @return a user message
     */
    public static ChatMessage user(final String content) {
        return new ChatMessage("user", content, null, null);
    }

    /**
     * @param content   the model's text
     * @param toolCalls tools the model asked to call
     * @return an assistant message
     */
    public static ChatMessage assistant(final String content, final List<ToolCall> toolCalls) {
        return new ChatMessage("assistant", content, toolCalls, null);
    }

    /**
     * @param toolName name of the tool that ran
     * @param content  the tool's result, as JSON
     * @return a tool-result message
     */
    public static ChatMessage tool(final String toolName, final String content) {
        return new ChatMessage("tool", content, null, toolName);
    }
}
