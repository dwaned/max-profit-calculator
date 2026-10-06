package com.maxprofit.calculator.advisor;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Body of {@code POST /api/advisor}.
 *
 * @param question the question in plain language
 */
@Schema(description = "A question for the stock advisor")
public record AdvisorRequest(
        @Schema(description = "Question in plain language, including savings and prices",
                example = "I have 5 euros. Stocks cost 4, 1 and 3 today and will be worth 5, 2 and 6. "
                        + "Which should I buy?")
        @NotBlank(message = "Question is required")
        @Size(max = 500, message = "Question must not exceed 500 characters")
        String question) {
}
