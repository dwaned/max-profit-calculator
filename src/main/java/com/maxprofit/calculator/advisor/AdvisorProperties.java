package com.maxprofit.calculator.advisor;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Settings for the stock advisor, bound to {@code app.advisor.*}. The advisor
 * talks to a local Ollama server, so it is off unless explicitly enabled.
 *
 * @param enabled        master switch; when false the endpoint answers 503
 * @param ollamaUrl      base URL of the Ollama server
 * @param model          Ollama model that drives the agent
 * @param temperature    sampling temperature passed to the model
 * @param timeoutSeconds read timeout for one model call
 * @param maxTurns       model calls allowed per question before giving up
 */
@ConfigurationProperties(prefix = "app.advisor")
public record AdvisorProperties(
        boolean enabled,
        String ollamaUrl,
        String model,
        double temperature,
        int timeoutSeconds,
        int maxTurns) {
}
