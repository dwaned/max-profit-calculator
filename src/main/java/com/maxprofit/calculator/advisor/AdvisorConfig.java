package com.maxprofit.calculator.advisor;

import java.time.Duration;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * Wires the advisor to the Ollama model named in {@link AdvisorProperties}.
 */
@Configuration
@EnableConfigurationProperties(AdvisorProperties.class)
@SuppressWarnings("checkstyle:DesignForExtension")
public class AdvisorConfig {

    @Bean
    public ChatModel chatModel(final AdvisorProperties properties) {
        final SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(2));
        requestFactory.setReadTimeout(Duration.ofSeconds(properties.timeoutSeconds()));
        return new OllamaChatModel(RestClient.builder().requestFactory(requestFactory), properties);
    }

    @Bean
    public StockAdvisor stockAdvisor(final ChatModel chatModel, final AdvisorProperties properties) {
        return new StockAdvisor(chatModel, properties.maxTurns());
    }
}
