package com.maxprofit.calculator.controller;

import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.assertj.core.api.Assertions.assertThat;

@WebMvcTest(CalculatorController.class)
@Import({RateLimitFilterConfig.class, MetricsInstrumentationTest.TestConfig.class})
class MetricsInstrumentationTest {

    @TestConfiguration
    static class TestConfig {
        @Bean
        public MeterRegistry meterRegistry() {
            return new io.micrometer.core.instrument.simple.SimpleMeterRegistry();
        }
    }

    @Autowired
    private MeterRegistry meterRegistry;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void calculateInvocationsCounterIncrementsAfterPost() throws Exception {
        double before = meterRegistry.counter("calculate_invocations_total").count();
        String body = "{\"savings\":10,\"buyPrices\":[5,5,10],\"sellPrices\":[15,10,35]}";
        mockMvc.perform(post("/calculate")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isOk());
        double after = meterRegistry.counter("calculate_invocations_total").count();
        assertThat(after).isEqualTo(before + 1.0);
    }

    @Test
    void rejectionsCounterRegisteredOnStartup() {
        assertThat(meterRegistry.find("rate_limit_rejections_total").counter()).isNotNull();
    }
}