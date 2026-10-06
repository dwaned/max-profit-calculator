package com.maxprofit.calculator.advisor;

import java.util.List;
import java.util.Map;

/**
 * A chat model that can call tools. The advisor depends only on this
 * interface, so tests can swap the real model for scripted or recorded
 * responses.
 */
public interface ChatModel {

    /**
     * Sends the conversation so far and returns the model's next message.
     *
     * @param messages the conversation, oldest first
     * @param tools    tool definitions in the JSON-schema format models expect
     * @return the assistant's reply, possibly asking for tool calls
     * @throws AdvisorUnavailableException if the model cannot be reached
     */
    ChatMessage chat(List<ChatMessage> messages, List<Map<String, Object>> tools);

    /**
     * @return the model's name, reported with each answer
     */
    String name();
}
