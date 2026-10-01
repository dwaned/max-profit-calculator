package com.maxprofit.calculator.controller;

import com.maxprofit.calculator.CalculationResult;
import com.maxprofit.calculator.CompanyNameGenerator;
import com.maxprofit.calculator.Stock;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

/**
 * REST controller exposing the {@code /api/calculate} and
 * {@code /api/health} endpoints. {@code /api/calculate} is rate-limited
 * via {@link com.maxprofit.calculator.controller.RateLimitFilter}; the
 * filter is registered in {@code RateLimitFilterConfig} for the
 * {@code /api/calculate} URL pattern only.
 *
 * <p>Instruments Micrometer counters/timer (invocation count, execution
 * time, 429-rejection count). They are recorded in the meter registry; the
 * Prometheus endpoint is not exposed over HTTP by default (see
 * {@code management.endpoints.web.exposure.include}).
 *
 * @author dwaned
 */
@SuppressWarnings({"checkstyle:JavadocPackage", "checkstyle:LineLength"})
@RestController
@Tag(name = "Calculator", description = "API for calculating maximum profit from stock prices")
public class CalculatorController {

    private final Counter invocationsCounter;
    private final Timer executionTimer;

    public CalculatorController(final MeterRegistry meterRegistry) {
        this.invocationsCounter = meterRegistry.counter("calculate_invocations_total");
        this.executionTimer = meterRegistry.timer("calculate_execution_seconds");
    }

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
            description = "Chooses which stocks to buy so that the total profit (sell price minus buy price) "
                    + "is as large as possible without spending more than the savings. buyPrices and "
                    + "sellPrices must have the same length; a request where they differ is rejected with 400. "
                    + "Rate limited per client IP (burst 10, refilling 10 per second).")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully calculated maximum profit",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = CalculationResult.class))),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid input (validation failure, malformed JSON, or buyPrices and "
                            + "sellPrices of different lengths)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"message\": \"Invalid input: Savings must be at least 1\"}"))),
            @ApiResponse(
                    responseCode = "415",
                    description = "The request body is not application/json",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(
                    responseCode = "429",
                    description = "Rate limit exceeded for this client",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error")
    })
    @PostMapping(value = "/calculate", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(org.springframework.http.HttpStatus.OK)
    public CalculationResult calculate(
            @Valid @RequestBody final CalculationRequest request) {
        invocationsCounter.increment();
        Timer.Sample sample = Timer.start();
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
        } finally {
            sample.stop(executionTimer);
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
