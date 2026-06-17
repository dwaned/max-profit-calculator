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
import org.springframework.test.web.servlet.ResultActions;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Validates that the backend rejects every input the CalculatorForm client-side
 * guard also blocks. Mirrors CalculatorForm.jsx constants:
 *   SAVINGS_MIN = 1, SAVINGS_MAX = 1000
 *   PRICE_MIN   = 1, PRICE_MAX   = 1000
 *   isStocksEmpty guard when buyPrices is empty
 *
 * If the frontend validation gets out of sync with the backend contract, or
 * the backend Bean Validation is regressed (e.g. Max(1000) loosened), one of
 * these tests will fail. Path A in TESTING_LEVELS.md: contract over React unit.
 */
@WebMvcTest(CalculatorController.class)
@ExtendWith(SpringExtension.class)
class CalculatorControllerValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private CalculationRequest validRequest() {
        CalculationRequest req = new CalculationRequest();
        req.setSavings(10);
        req.setBuyPrices(new ArrayList<>(List.of(5, 5, 10)));
        req.setSellPrices(new ArrayList<>(List.of(15, 10, 35)));
        return req;
    }

    private ResultActions postCalculate(CalculationRequest req) throws Exception {
        return mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)));
    }

    @Nested
    @DisplayName("Savings amount bounds (frontend SAVINGS_MIN=1, SAVINGS_MAX=1000)")
    class SavingsBounds {

        @Test
        @DisplayName("Rejects savings below minimum (0)")
        void rejectsSavingsZero() throws Exception {
            CalculationRequest req = validRequest();
            req.setSavings(0);
            postCalculate(req)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message",
                            containsString("Savings must be at least 1")));
        }

        @Test
        @DisplayName("Rejects negative savings")
        void rejectsSavingsNegative() throws Exception {
            CalculationRequest req = validRequest();
            req.setSavings(-5);
            postCalculate(req)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message",
                            containsString("Savings must be at least 1")));
        }

        @Test
        @DisplayName("Rejects savings above maximum (1001)")
        void rejectsSavingsAboveMax() throws Exception {
            CalculationRequest req = validRequest();
            req.setSavings(1001);
            postCalculate(req)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message",
                            containsString("Savings must not exceed 1000")));
        }

        @Test
        @DisplayName("Accepts savings at exact lower bound (1)")
        void acceptsSavingsMin() throws Exception {
            CalculationRequest req = validRequest();
            req.setSavings(1);
            postCalculate(req).andExpect(status().isOk());
        }

        @Test
        @DisplayName("Accepts savings at exact upper bound (1000)")
        void acceptsSavingsMax() throws Exception {
            CalculationRequest req = validRequest();
            req.setSavings(1000);
            postCalculate(req).andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Buy price bounds (frontend PRICE_MIN=1, PRICE_MAX=1000)")
    class BuyPriceBounds {

        @Test
        @DisplayName("Rejects buy price of 0")
        void rejectsBuyPriceZero() throws Exception {
            CalculationRequest req = validRequest();
            req.setBuyPrices(new ArrayList<>(List.of(0, 5, 10)));
            postCalculate(req)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message",
                            containsString("Buy price must be at least 1")));
        }

        @Test
        @DisplayName("Rejects negative buy price")
        void rejectsBuyPriceNegative() throws Exception {
            CalculationRequest req = validRequest();
            req.setBuyPrices(new ArrayList<>(List.of(-1, 5, 10)));
            postCalculate(req)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message",
                            containsString("Buy price must be at least 1")));
        }

        @Test
        @DisplayName("Rejects buy price above maximum (1001)")
        void rejectsBuyPriceAboveMax() throws Exception {
            CalculationRequest req = validRequest();
            req.setBuyPrices(new ArrayList<>(List.of(1001, 5, 10)));
            postCalculate(req)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message",
                            containsString("Buy price must not exceed 1000")));
        }
    }

    @Nested
    @DisplayName("Sell price bounds (frontend PRICE_MIN=1, PRICE_MAX=1000)")
    class SellPriceBounds {

        @Test
        @DisplayName("Rejects sell price of 0")
        void rejectsSellPriceZero() throws Exception {
            CalculationRequest req = validRequest();
            req.setSellPrices(new ArrayList<>(List.of(0, 10, 35)));
            postCalculate(req)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message",
                            containsString("Sell price must be at least 1")));
        }

        @Test
        @DisplayName("Rejects negative sell price")
        void rejectsSellPriceNegative() throws Exception {
            CalculationRequest req = validRequest();
            req.setSellPrices(new ArrayList<>(List.of(-1, 10, 35)));
            postCalculate(req)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message",
                            containsString("Sell price must be at least 1")));
        }

        @Test
        @DisplayName("Rejects sell price above maximum (1001)")
        void rejectsSellPriceAboveMax() throws Exception {
            CalculationRequest req = validRequest();
            req.setSellPrices(new ArrayList<>(List.of(1001, 10, 35)));
            postCalculate(req)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message",
                            containsString("Sell price must not exceed 1000")));
        }
    }

    @Nested
    @DisplayName("Empty-stocks guard (frontend isStocksEmpty)")
    class EmptyStocksGuard {

        @Test
        @DisplayName("Rejects empty buy prices")
        void rejectsEmptyBuyPrices() throws Exception {
            CalculationRequest req = validRequest();
            req.setBuyPrices(Collections.emptyList());
            postCalculate(req)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message",
                            containsString("Buy prices")));
        }

        @Test
        @DisplayName("Rejects empty sell prices")
        void rejectsEmptySellPrices() throws Exception {
            CalculationRequest req = validRequest();
            req.setSellPrices(Collections.emptyList());
            postCalculate(req)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message",
                            containsString("Sell prices")));
        }

        @Test
        @DisplayName("Rejects null buy prices")
        void rejectsNullBuyPrices() throws Exception {
            CalculationRequest req = validRequest();
            req.setBuyPrices(null);
            postCalculate(req).andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Rejects null sell prices")
        void rejectsNullSellPrices() throws Exception {
            CalculationRequest req = validRequest();
            req.setSellPrices(null);
            postCalculate(req).andExpect(status().isBadRequest());
        }
    }
}
