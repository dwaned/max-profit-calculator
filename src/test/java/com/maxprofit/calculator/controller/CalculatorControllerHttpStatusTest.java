package com.maxprofit.calculator.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

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
    @DisplayName("/calculate endpoint HTTP status tests")
    class CalculateEndpoint {
        @Test
        @DisplayName("Returns 405 for GET request")
        void getMethodNotAllowed() throws Exception {
            mockMvc.perform(get("/calculate"))
                    .andExpect(status().isMethodNotAllowed());
        }

        @Test
        @DisplayName("Returns 415 for POST with no content type")
        void postNoContentType() throws Exception {
            mockMvc.perform(post("/calculate"))
                    .andExpect(status().isUnsupportedMediaType());
        }

        @Test
        @DisplayName("Returns 400 for POST with invalid JSON")
        void postInvalidJson() throws Exception {
            mockMvc.perform(post("/calculate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{invalid}"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Returns 200 for valid POST request")
        void postValidRequest() throws Exception {
            CalculationRequest request = new CalculationRequest();
            request.setSavings(10);
            request.setBuyPrices(Arrays.asList(5, 5, 10));
            request.setSellPrices(Arrays.asList(15, 10, 35));
            String jsonRequest = objectMapper.writeValueAsString(request);
            mockMvc.perform(post("/calculate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonRequest))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON));
        }

        @Test
        @DisplayName("Returns 400 when buyPrices exceeds maximum size of 100")
        void postBuyPricesExceedsMaxSize() throws Exception {
            CalculationRequest request = new CalculationRequest();
            request.setSavings(10);
            List<Integer> oversized = IntStream.rangeClosed(1, 101).boxed().collect(Collectors.toList());
            request.setBuyPrices(oversized);
            request.setSellPrices(oversized);
            String jsonRequest = objectMapper.writeValueAsString(request);
            mockMvc.perform(post("/calculate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonRequest))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Returns 400 when sellPrices exceeds maximum size of 100")
        void postSellPricesExceedsMaxSize() throws Exception {
            CalculationRequest request = new CalculationRequest();
            request.setSavings(10);
            List<Integer> matching = IntStream.rangeClosed(1, 50).boxed().collect(Collectors.toList());
            List<Integer> oversized = IntStream.rangeClosed(1, 101).boxed().collect(Collectors.toList());
            request.setBuyPrices(matching);
            request.setSellPrices(oversized);
            String jsonRequest = objectMapper.writeValueAsString(request);
            mockMvc.perform(post("/calculate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonRequest))
                    .andExpect(status().isBadRequest());
        }
    }
}
