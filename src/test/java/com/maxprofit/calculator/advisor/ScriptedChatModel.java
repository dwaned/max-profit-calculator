package com.maxprofit.calculator.advisor;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Map;

/**
 * A fake model for deterministic tests: it returns canned replies in order
 * and records every conversation it was sent.
 */
final class ScriptedChatModel implements ChatModel {

    private final Deque<ChatMessage> replies = new ArrayDeque<>();
    private final List<List<ChatMessage>> requests = new ArrayList<>();

    ScriptedChatModel reply(final String text) {
        replies.add(ChatMessage.assistant(text, List.of()));
        return this;
    }

    ScriptedChatModel callTool(final String name, final Map<String, Object> arguments) {
        replies.add(ChatMessage.assistant("", List.of(new ToolCall(name, arguments))));
        return this;
    }

    List<List<ChatMessage>> requests() {
        return requests;
    }

    @Override
    public ChatMessage chat(final List<ChatMessage> messages, final List<Map<String, Object>> tools) {
        requests.add(messages);
        if (replies.isEmpty()) {
            throw new IllegalStateException("The script has no more replies");
        }
        return replies.poll();
    }

    @Override
    public String name() {
        return "scripted";
    }
}
