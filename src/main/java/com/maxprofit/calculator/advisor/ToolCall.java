package com.maxprofit.calculator.advisor;

import java.util.Map;

/**
 * A tool call requested by the model.
 *
 * @param name      name of the tool
 * @param arguments arguments as the model produced them (not yet validated)
 */
public record ToolCall(String name, Map<String, Object> arguments) {
}
