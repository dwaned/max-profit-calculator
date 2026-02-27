package com.maxprofit.calculator;

import au.com.dius.pact.provider.junit5.PactVerification;
import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.model.ProviderState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.List;

public class PactProviderVerificationTest {

    @BeforeEach
    void setup() {
        System.setProperty("pact.verifier.publishResults", "true");
    }

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void verifyPact(PactVerificationContext context) {
        context.verifyInteraction();
    }

    @State("a request to calculate max profit")
    void calculateMaxProfit() {
    }

    @State("a request to the health endpoint")
    void healthEndpoint() {
    }
}
