package com.maxprofit.calculator.controller;

import com.maxprofit.calculator.CalculationResult;
import com.maxprofit.calculator.CompanyNameGenerator;
import com.maxprofit.calculator.Stock;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@SuppressWarnings({"checkstyle:JavadocPackage", "checkstyle:LineLength"})
@RestController
@CrossOrigin(origins = {"http://localhost:9095", "http://localhost:5173", "http://localhost:3000", "https://max-profit-frontend.onrender.com"})
@Tag(name = "Calculator", description = "API for calculating maximum profit from stock prices")
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
    @Operation(
            summary = "Calculate maximum profit",
            description = "Calculates the maximum profit that can be made from a given set of stock "
                    + "prices and savings amount. Returns the optimal buy and sell indices.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully calculated maximum profit",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = CalculationResult.class))),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request parameters",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\": \"Invalid input: ...\"}"))),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error")
    })
    @PostMapping(value = "/calculate", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(org.springframework.http.HttpStatus.OK)
    public CalculationResult calculate(
            @Valid @RequestBody final CalculationRequest request) {
        try {
            List<String> companyNames = request.getCompanyNames();
            if (companyNames == null || companyNames.isEmpty()) {
                companyNames = CompanyNameGenerator.generateCompanyNames(
                        Math.max(request.getBuyPrices().size(), request.getSellPrices().size()));
            }
            return Stock.returnIndicesMaxProfit(request.getSavings(),
                    request.getBuyPrices(), request.getSellPrices(), companyNames);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid input: " + e.getMessage());
        }
    }

    /**
     * @return a simple health check response
     */
    @Operation(
            summary = "Health check",
            description = "Returns the health status of the API")
    @ApiResponse(
            responseCode = "200",
            description = "API is healthy",
            content = @Content(mediaType = "text/plain",
                    examples = @ExampleObject(value = "OK")))
    @GetMapping(value = "/health", produces = MediaType.TEXT_PLAIN_VALUE)
    @ResponseStatus(org.springframework.http.HttpStatus.OK)
    public String health() {
        return "OK";
    }
}
