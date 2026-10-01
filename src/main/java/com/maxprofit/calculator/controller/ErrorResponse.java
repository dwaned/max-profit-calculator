package com.maxprofit.calculator.controller;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Body of every error response from the API ({@code {"message": "..."}}), which
 * the frontend shows to the user and the Pact contract verifies.
 *
 * @param message human-readable description of the error
 */
@Schema(description = "Error returned by the API")
public record ErrorResponse(
        @Schema(description = "Human-readable description of the error",
                example = "Invalid input: Savings must be at least 1")
        String message) {
}
