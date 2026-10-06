package com.maxprofit.calculator.advisor;

import java.util.List;

/**
 * The advisor's answer to one question.
 *
 * @param answer    the model's final reply
 * @param toolCalls every tool call made along the way, in order
 * @param verified  true when the reply quotes the profit the calculator returned
 * @param completed false when the agent hit its turn limit without a final reply
 * @param turns     number of model calls used
 * @param model     the model that produced the answer
 */
public record AdvisorAnswer(String answer, List<ToolInvocation> toolCalls, boolean verified, boolean completed,
                            int turns, String model) {
}
