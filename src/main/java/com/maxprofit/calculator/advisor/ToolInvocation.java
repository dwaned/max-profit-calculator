package com.maxprofit.calculator.advisor;

import java.util.Map;

/**
 * A tool call the agent made while answering, and what came back.
 *
 * @param tool      name of the tool
 * @param arguments arguments the model supplied
 * @param result    the tool's result, or null if the call was rejected
 * @param error     why the call was rejected, or null if it succeeded
 */
public record ToolInvocation(String tool, Map<String, Object> arguments, Map<String, Object> result, String error) {
}
