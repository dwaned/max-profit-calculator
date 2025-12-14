package com.maxprofit.calculator.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CalculatorController.class)
@ExtendWith(SpringExtension.class)
class CalculatorControllerHttpStatusTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Nested
    @DisplayName("/api/calculate endpoint HTTP status tests")
    class CalculateEndpoint {
        @Test
        @DisplayName("Returns 405 for GET request")
        void getMethodNotAllowed() throws Exception {
            mockMvc.perform(get("/api/calculate"))
                    .andExpect(status().isMethodNotAllowed());
        }

        @Test
        @DisplayName("Returns 415 for POST with no content type")
        void postNoContentType() throws Exception {
            mockMvc.perform(post("/api/calculate"))
                    .andExpect(status().isUnsupportedMediaType());
        }

        @Test
        @DisplayName("Returns 400 for POST with invalid JSON")
        void postInvalidJson() throws Exception {
            mockMvc.perform(post("/api/calculate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{invalid}"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Returns 200 for valid POST request")
        void postValidRequest() throws Exception {
            CalculationRequest request = new CalculationRequest();
            request.setSavingsAmount(10);
            request.setCurrentPrices(Arrays.asList(5, 5, 10));
            request.setFuturePrices(Arrays.asList(15, 10, 35));
            String jsonRequest = objectMapper.writeValueAsString(request);
            mockMvc.perform(post("/api/calculate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonRequest))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON));
        }
    }
}
