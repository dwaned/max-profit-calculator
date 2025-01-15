package com.maxprofit.calculator.controller;

import com.maxprofit.calculator.CalculationResult;
import com.maxprofit.calculator.Stock;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@SuppressWarnings("checkstyle:LineLength")
@RestController
@CrossOrigin(origins = "http://localhost:9095")
public class CalculatorController {

    /**
     * Calculates the maximum profit that can be made from a given set of stock
     * prices and savings amount.
     *
     * @param request the calculation request containing the savings amount,
     *                current prices, and future prices
     * @return the calculation result containing the maximum profit and the
     * indices of the stock prices that should be bought and sold
     * @throws IllegalArgumentException if the request is invalid (e.g., savings
     *                                  amount is negative, prices are not in the correct range)
     */
    @PostMapping(value = "/calculate", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(org.springframework.http.HttpStatus.OK)
    @CrossOrigin(origins = "http://localhost:3000, http://site:3000")
    public CalculationResult calculate(
            @RequestBody final CalculationRequest request) {
        try {
            return Stock.returnIndicesMaxProfit(request.getSavingsAmount(),
                    request.getCurrentPrices(), request.getFuturePrices());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid input: " + e.getMessage());
        }
    }

    /**
     * @return a simple health check response
     */
    @GetMapping(value = "/health", produces = MediaType.TEXT_PLAIN_VALUE)
    @ResponseStatus(org.springframework.http.HttpStatus.OK)
    public String health() {
        return "OK";
    }
}