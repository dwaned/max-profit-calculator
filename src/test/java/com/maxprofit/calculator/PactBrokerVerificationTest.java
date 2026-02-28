package com.maxprofit.calculator;

import au.com.dius.pact.provider.junit5.HttpTestTarget;
import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.junitsupport.Consumer;
import au.com.dius.pact.provider.junitsupport.Provider;
import au.com.dius.pact.provider.junitsupport.loader.PactBroker;
import au.com.dius.pact.provider.juntosupport.loader.PactBrokerAuth;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.Optional;

import static org.junit.jupiter.api.Assumptions.assumeTrue;

@Provider("max-profit-calculator-backend")
@Consumer("frontend")
@PactBroker(
    url = "${pact.broker.url:}",
    authentication = @PactBrokerAuth(token = "${pact.broker.auth.token:}")
)
public class PactBrokerVerificationTest {

    @BeforeEach
    void setup(PactVerificationContext context) {
        String brokerUrl = Optional.ofNullable(System.getProperty("pact.broker.url"))
            .orElse(System.getenv("PACT_BROKER_URL"));
        String brokerToken = Optional.ofNullable(System.getProperty("pact.broker.auth.token"))
            .orElse(System.getenv("PACT_BROKER_TOKEN"));
        
        assumeTrue(brokerUrl != null && !brokerUrl.isEmpty() 
            && brokerToken != null && !brokerToken.isEmpty(),
            "Pact broker URL or token not configured, skipping broker verification test");
        
        context.setTarget(new HttpTestTarget("localhost", 9095));
    }

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void verifyPact(PactVerificationContext context) {
        context.verifyInteraction();
    }
}
