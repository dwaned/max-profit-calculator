package com.maxprofit.calculator.advisor;

import com.maxprofit.calculator.controller.ErrorResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * REST endpoints for the stock advisor. The advisor needs a local Ollama
 * server, so in deployments where it is disabled questions get 503.
 */
@RestController
@Tag(name = "Advisor", description = "AI agent that answers stock questions using the calculator as a tool")
@SuppressWarnings({"checkstyle:DesignForExtension", "checkstyle:LineLength"})
public class AdvisorController {

    private static final String DISABLED =
            "The advisor runs on a local Ollama model and is turned off in this deployment";

    private final StockAdvisor advisor;
    private final AdvisorProperties properties;

    /**
     * @param advisor    the agent
     * @param properties advisor settings
     */
    public AdvisorController(final StockAdvisor advisor, final AdvisorProperties properties) {
        this.advisor = advisor;
        this.properties = properties;
    }

    /**
     * @return whether the advisor is available, and its model
     */
    @Operation(summary = "Advisor status", description = "Whether the advisor is enabled in this deployment")
    @ApiResponse(responseCode = "200", description = "Status",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AdvisorStatus.class)))
    @GetMapping(value = "/advisor/status", produces = MediaType.APPLICATION_JSON_VALUE)
    public AdvisorStatus status() {
        return new AdvisorStatus(properties.enabled(), properties.model());
    }

    /**
     * @param request the question
     * @return the agent's answer, the tool calls behind it and whether it is verified
     */
    @Operation(summary = "Ask the advisor",
            description = "An AI agent reads the question, calls the max-profit calculator as a tool and explains "
                    + "the result. 'verified' is true only when the answer quotes the profit the calculator returned. "
                    + "Rate limited per client IP like /calculate.")
    @ApiResponse(responseCode = "200", description = "The advisor's answer",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AdvisorAnswer.class)))
    @ApiResponse(responseCode = "400", description = "Missing, blank or too long question, or malformed JSON",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "415", description = "The request body is not application/json",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "429", description = "Rate limit exceeded for this client",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "503", description = "The advisor is disabled here, or its model cannot be reached",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    @PostMapping(value = "/advisor", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public AdvisorAnswer ask(@Valid @RequestBody final AdvisorRequest request) {
        if (!properties.enabled()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, DISABLED);
        }
        try {
            return advisor.ask(request.question());
        } catch (AdvisorUnavailableException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage(), e);
        }
    }
}
