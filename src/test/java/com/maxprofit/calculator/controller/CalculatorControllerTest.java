package com.maxprofit.calculator.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.maxprofit.calculator.Controller.CalculationRequest;
import com.maxprofit.calculator.Controller.CalculatorController;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * This class contains unit tests for the {@link CalculatorController} class.
 */
@SuppressWarnings({"checkstyle:LineLength", "checkstyle:magicnumber"})
@ExtendWith(SpringExtension.class)
@WebMvcTest(CalculatorController.class)
public class CalculatorControllerTest {
    /**
     * The {@link MockMvc} instance that is used to perform HTTP requests against.
     */
    @Autowired
    private MockMvc mockMvc;

    /**
     * The {@link ObjectMapper} instance that is used to serialize and deserialize.
     */
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * @throws Exception if an error occurs during the test
     */
    @Test
    public void testCalculate() throws Exception {
        CalculationRequest request = new CalculationRequest();
        request.setSavingsAmount(10);
        request.setCurrentPrices(Arrays.asList(5, 5, 10));
        request.setFuturePrices(Arrays.asList(15, 10, 35));
        String jsonRequest = objectMapper.writeValueAsString(request);



        mockMvc.perform(post("/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.maxProfit").value(25));
    }
}

