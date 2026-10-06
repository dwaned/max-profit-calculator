package com.maxprofit.calculator.advisor;

/**
 * Thrown when the model behind the advisor cannot be reached or returns
 * something unusable.
 */
public class AdvisorUnavailableException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * @param message what went wrong
     * @param cause   the underlying error, if any
     */
    public AdvisorUnavailableException(final String message, final Throwable cause) {
        super(message, cause);
    }
}
