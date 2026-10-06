package com.maxprofit.calculator.advisor;

/**
 * Whether the advisor is available in this deployment.
 *
 * @param enabled true when the advisor accepts questions
 * @param model   the model it uses
 */
public record AdvisorStatus(boolean enabled, String model) {
}
