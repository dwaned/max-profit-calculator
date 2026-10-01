// The testing pyramid shown on the Testing Pyramid page. Every test class lists
// the file it lives in and how many tests it runs; tests/unit/testLayers.test.js
// checks this against the repository so the page cannot drift from the tests.
//
// Layers are ordered by scope, i.e. how much of the system a test exercises.
// Techniques (property-based, BDD) are badges on the layer where this project
// applies them; performance is cross-cutting.

const JAVA = 'src/test/java/com/maxprofit/calculator';

export const testLayers = [
  {
    id: 'unit',
    name: 'Unit Tests',
    shortName: 'Unit',
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-400',
    description:
      'Test one class or function in isolation: the knapsack engine, the rate limiter, configuration binding and the frontend API client. No Spring context, no HTTP, no browser. Both example-based and property-based tests live here.',
    framework: 'JUnit 6 + jqwik · Vitest',
    testClasses: [
      { name: 'ExampleBasedTests', style: 'example', count: 18, file: `${JAVA}/ExampleBasedTests.java` },
      { name: 'StockInvalidInputTests', style: 'example', count: 6, file: `${JAVA}/StockInvalidInputTests.java` },
      { name: 'CalculationResultTests', style: 'example', count: 4, file: `${JAVA}/CalculationResultTests.java` },
      { name: 'CompanyNameGeneratorTests', style: 'example', count: 3, file: `${JAVA}/CompanyNameGeneratorTests.java` },
      { name: 'StockLoggingLevelTest', style: 'example', count: 1, file: `${JAVA}/StockLoggingLevelTest.java` },
      { name: 'PropertyBasedStockTests', style: 'property-based', count: 1, file: `${JAVA}/PropertyBasedStockTests.java` },
      { name: 'RateLimiterServiceTests', style: 'property-based', count: 4, file: `${JAVA}/controller/RateLimiterServiceTests.java` },
      { name: 'CorsPropertiesTest', style: 'example', count: 1, file: `${JAVA}/controller/CorsPropertiesTest.java` },
      { name: 'WebConfigCorsTest', style: 'example', count: 2, file: `${JAVA}/WebConfigCorsTest.java` },
      { name: 'apiFooter.test.js', style: 'example', count: 8, file: 'site/frontend/tests/unit/apiFooter.test.js' },
      { name: 'calculatorApi.test.js', style: 'example', count: 7, file: 'site/frontend/tests/unit/calculatorApi.test.js' },
      { name: 'reports.test.js', style: 'example', count: 4, file: 'site/frontend/tests/unit/reports.test.js' },
      { name: 'testLayers.test.js', style: 'example', count: 4, file: 'site/frontend/tests/unit/testLayers.test.js' },
    ],
    codeExample: `// ExampleBasedTests.java
@Test
void shouldWorkWithThreeIndices() {
    CalculationResult result = Stock.returnIndicesMaxProfit(5,
            Arrays.asList(1, 2, 5), Arrays.asList(2, 3, 20));

    assertEquals(15, result.getMaxProfit());
    assertEquals(Collections.singletonList(2), result.getIndices());
}`,
    properties: [
      'Milliseconds per test',
      'No framework, network or browser',
      'Pinpoints the failing class',
      'Example & property-based',
    ],
    subTests: [
      {
        name: 'Example-Based',
        description: 'Specific inputs with known expected outputs, including edge cases and invalid input.',
        codeExample: `// ExampleBasedTests.java — savings 5, buy [1,2,5], sell [2,3,20]
// Buying stock 2 (cost 5, profit 15) beats stocks 0+1 (cost 3, profit 2)
assertEquals(15, result.getMaxProfit());
assertEquals(Collections.singletonList(2), result.getIndices());`,
      },
      {
        name: 'Property-Based',
        description: 'jqwik generates random savings and price lists and checks invariants that must hold for every input.',
        codeExample: `// PropertyBasedStockTests.java
@Property
public void positiveScenarios(
        @ForAll @IntRange(min = 1, max = 1000) final int savings,
        @ForAll("stockPrices") final ArrayList<Integer> currentPrices,
        @ForAll("stockPrices") final ArrayList<Integer> futurePrices) {
    CalculationResult result = Stock.returnIndicesMaxProfit(savings,
            currentPrices, futurePrices);
    // The reported profit is exactly the profit of the chosen stocks,
    // and the reported savings used is exactly what they cost
    int profit = 0;
    for (int idx : result.getIndices()) {
        profit += futurePrices.get(idx) - currentPrices.get(idx);
    }
    assertEquals(profit, result.getMaxProfit());
}`,
      },
    ],
  },
  {
    id: 'web',
    name: 'Web Layer Tests',
    shortName: 'Web Layer',
    color: 'bg-blue-500',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-400',
    description:
      'Test the Spring MVC layer on its own with MockMvc (@WebMvcTest): request mapping, validation, HTTP status codes, the rate-limit filter and metrics. No real server and no network.',
    framework: 'Spring Boot Test + MockMvc',
    testClasses: [
      { name: 'CalculatorControllerTest', style: 'example', count: 1, file: `${JAVA}/controller/CalculatorControllerTest.java` },
      { name: 'CalculatorControllerHttpStatusTest', style: 'example', count: 9, file: `${JAVA}/controller/CalculatorControllerHttpStatusTest.java` },
      { name: 'MetricsInstrumentationTest', style: 'example', count: 1, file: `${JAVA}/controller/MetricsInstrumentationTest.java` },
    ],
    codeExample: `// CalculatorControllerHttpStatusTest.java
@Test
@DisplayName("Returns 400 when buyPrices exceeds maximum size of 100")
void postBuyPricesExceedsMaxSize() throws Exception {
    CalculationRequest request = new CalculationRequest();
    request.setSavings(10);
    List<Integer> oversized = IntStream.rangeClosed(1, 101).boxed().toList();
    request.setBuyPrices(oversized);
    request.setSellPrices(oversized);
    mockMvc.perform(post("/calculate")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
}`,
    properties: [
      'HTTP status codes and validation',
      'Request/response mapping',
      'Spring MVC slice only',
      'No real server',
    ],
  },
  {
    id: 'integration',
    name: 'Integration Tests',
    shortName: 'Integration',
    color: 'bg-indigo-500',
    borderColor: 'border-indigo-400',
    textColor: 'text-indigo-400',
    description:
      'Start the whole Spring application on a real embedded Tomcat and call it over HTTP. Checks what only the assembled application can show: CORS, client-IP resolution behind a proxy, the rate limiter, input limits, the error format and the OpenAPI docs.',
    framework: 'Spring Boot Test + TestRestTemplate',
    testClasses: [
      { name: 'ApiSecurityTest', style: 'example', count: 15, file: `${JAVA}/controller/ApiSecurityTest.java` },
      { name: 'OpenApiDocsTest', style: 'example', count: 2, file: `${JAVA}/controller/OpenApiDocsTest.java` },
    ],
    codeExample: `// ApiSecurityTest.java
@Test
@DisplayName("Forged X-Forwarded-For entries do not give a client a fresh bucket")
void forgedForwardedForDoesNotBypassRateLimit() {
    for (int i = 0; i < 3; i++) {
        assertThat(postCalculate(VALID_BODY, client("198.51.100.7", "203.0.113." + i))
                .getStatusCode()).isEqualTo(HttpStatus.OK);
    }
    assertThat(postCalculate(VALID_BODY, client("198.51.100.7", "203.0.113.200"))
            .getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
}`,
    properties: [
      'Real embedded Tomcat',
      'Full Spring context',
      'Filters, CORS, proxy headers',
      'Seconds, not milliseconds',
    ],
  },
  {
    id: 'contract',
    name: 'Contract Tests',
    shortName: 'Contract',
    color: 'bg-teal-500',
    borderColor: 'border-teal-400',
    textColor: 'text-teal-400',
    description:
      'Consumer-driven contracts with Pact: the frontend’s real API client runs against Pact’s mock provider, which records the requests it sends and the response fields it relies on; the backend (provider) is verified against them, from the file and through a Pact Broker, and can-i-deploy confirms this commit’s frontend and backend are compatible. Contracts catch API changes that break the frontend without starting both together, which reduces, but does not replace, end-to-end testing.',
    framework: 'Pact (consumer-driven)',
    testClasses: [
      { name: 'calculate.api.test.js', style: 'contract', count: 2, file: 'site/frontend/tests/pact/calculate.api.test.js' },
      { name: 'LocalContractVerificationTest', style: 'contract', count: 2, file: `${JAVA}/LocalContractVerificationTest.java` },
      { name: 'PactBrokerVerificationTest', style: 'contract', count: 2, file: `${JAVA}/PactBrokerVerificationTest.java` },
    ],
    codeExample: `// calculate.api.test.js — the frontend's real client against Pact's mock provider
provider
  .uponReceiving('a request to calculate max profit')
  .withRequest({ method: 'POST', path: '/api/calculate', headers: JSON_HEADERS, body: payload })
  .willRespondWith({
    status: 200,
    headers: JSON_HEADERS,
    // Only the fields ResultsCard reads, matched by type
    body: {
      maxProfit: integer(25),
      indices: eachLike(integer(2)),
      savingsUsed: integer(10),
      remainingSavings: integer(0),
      companyNames: eachLike(string('Initech')),
    },
  });

await provider.executeTest(async (mockServer) => {
  const result = await requestCalculation(\`\${mockServer.url}/api\`, payload, TIMEOUT);
  expect(result.maxProfit).toBe(25);
});

// LocalContractVerificationTest.java / PactBrokerVerificationTest.java — the provider side
@Provider("max-profit-calculator-backend")
@PactFolder("pacts")   // or @PactBroker(url = "\${pactbroker.host}")
public class LocalContractVerificationTest { ... }`,
    properties: [
      'Consumer defines the contract',
      'Provider verifies it',
      'Pact Broker + can-i-deploy',
      'No end-to-end environment needed',
    ],
  },
  {
    id: 'system',
    name: 'System Tests',
    shortName: 'System',
    color: 'bg-orange-500',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-400',
    description:
      'Black-box tests against the deployed stack: Testcontainers starts both Docker images (API and nginx frontend) with Docker Compose and the test talks to them over HTTP, as a client would. API fuzzing (Schemathesis) generates hundreds of requests from the published OpenAPI spec and checks every response against it: no server errors, documented status codes, bodies matching their schema, invalid input rejected. Both run in CI in the container workflow.',
    framework: 'Testcontainers + REST Assured',
    testClasses: [
      { name: 'ContainerTests', style: 'example', count: 1, file: `${JAVA}/ContainerTests.java` },
      // Config-driven: the count is the number of API operations fuzzed, not test methods.
      { name: 'Schemathesis (API fuzzing)', style: 'property-based', count: 2, file: 'schemathesis.toml', generated: true },
    ],
    codeExample: `// ContainerTests.java
@Container
private final ComposeContainer environment = new ComposeContainer(
        new File("docker-compose-test.yml"))
    .withExposedService("app", 9095, Wait.forListeningPort())
    .withExposedService("frontend", 80, Wait.forListeningPort());

@Test
public void testAppAndSite() {
    given().baseUri("http://localhost:" + appPort).basePath("/api")
        .contentType("application/json").body(request.toString())
    .when().post("/calculate")
    .then().statusCode(200);
}`,
    properties: [
      'Real Docker images',
      'Black-box over HTTP',
      'API fuzzing from the OpenAPI spec',
      'Deployment configuration included',
      'Minutes to start',
    ],
  },
  {
    id: 'e2e',
    name: 'UI / End-to-End Tests',
    shortName: 'UI / E2E',
    color: 'bg-red-500',
    borderColor: 'border-red-400',
    textColor: 'text-red-400',
    description:
      'Drive the real application in a browser, as a user would. This is where the BDD acceptance scenarios run: each Gherkin step fills in the form, submits it and reads the result on screen.',
    framework: 'Cucumber + Playwright (Java) · Playwright Test (JS)',
    testClasses: [
      { name: 'MaxProfit.feature', style: 'bdd', count: 7, file: 'src/test/resources/com/maxprofit/calculator/MaxProfit.feature' },
      { name: 'calculator.spec.js', style: 'example', count: 3, file: 'site/frontend/tests/e2e/calculator.spec.js' },
    ],
    codeExample: `// steps/StepDefinitions.java — a Gherkin step, automated through the UI
@Then("profit is {int} Euros")
public void profitIsEuros(final int profit) {
    submitOnce();
    assertEquals("€" + profit,
            page.getByTestId("max-profit").textContent().trim());
}`,
    properties: [
      'Real browser',
      'User journeys and acceptance criteria',
      'Frontend + API together',
      'Slowest, most realistic',
    ],
  },
  {
    id: 'performance',
    name: 'Performance Tests',
    color: 'bg-purple-500',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-400',
    crossCutting: true,
    description:
      'Performance is checked at the level where each requirement lives. StressTests runs at unit level: the median time per call after a JIT warm-up, at the maximum budget, plus bytes allocated (unaffected by GC timing), with limits 200–500× above the measured cost so they are reliable in CI. ApiPerformanceTests runs at system level: the median end-to-end API latency through the Docker stack after a warm-up.',
    framework: 'JUnit 6 · Testcontainers + REST Assured',
    testClasses: [
      { name: 'StressTests', style: 'performance', count: 6, file: `${JAVA}/StressTests.java` },
      { name: 'ApiPerformanceTests', style: 'performance', count: 1, file: `${JAVA}/ApiPerformanceTests.java` },
    ],
    codeExample: `// StressTests.java
@Test
void medianTimeFor100ItemsShouldBeUnder100ms() {
    assertMedianUnder(100, 100);   // measured: ~0.2–0.5 ms
}

/** Median of 51 calls after 50 warm-up calls, at savings 1000. */
private static double medianMillis(List<Integer> buy, List<Integer> sell) { ... }`,
    properties: [
      'Median after warm-up',
      'Worst-case input (max budget)',
      'Allocation, not heap delta',
      'Unit and system level',
    ],
    subTests: [
      {
        name: 'Algorithm (unit level)',
        description: 'Median time per call for 5, 10, 50 and 100 stocks at savings 1000.',
        codeExample: `// 5 items   < 10 ms   (measured ~0.03 ms)
// 10 items  < 20 ms   (measured ~0.05 ms)
// 50 items  < 50 ms   (measured ~0.2 ms)
// 100 items < 100 ms  (measured ~0.2 ms)`,
      },
      {
        name: 'Memory (unit level)',
        description: 'Bytes allocated by one maximum-size call, measured per thread so GC timing cannot skew it.',
        codeExample: `long before = threads.getThreadAllocatedBytes(threadId);
Stock.returnIndicesMaxProfit(MAX_SAVINGS, buy, sell);
long allocated = threads.getThreadAllocatedBytes(threadId) - before;
assertTrue(allocated < 64L * 1024 * 1024);   // measured: 0.39 MB`,
      },
      {
        name: 'API latency (system level)',
        description: 'Median end-to-end response time for 50 stocks through the Docker stack, after a warm-up. Runs in CI (containers.yml).',
        codeExample: `// ApiPerformanceTests.java — 5 warm-up requests, then 15 timed ones,
// paced to stay within the rate limit (burst 10, refill 10/s)
for (int i = 0; i < TIMED_REQUESTS; i++) {
    Response response = post(baseUri, body);   // 50 stocks, savings 1000
    assertEquals(200, response.statusCode());
    millis[i] = response.time();
    Thread.sleep(PACING_MS);
}
Arrays.sort(millis);
assertTrue(millis[TIMED_REQUESTS / 2] < 500);  // median`,
      },
    ],
  },
];

// Top of the pyramid first.
export const layerOrder = ['e2e', 'system', 'contract', 'integration', 'web', 'unit'];

export const layerTestCount = (layer) =>
  layer.testClasses.reduce((sum, testClass) => sum + testClass.count, 0);

export const bddInfo = {
  name: 'BDD',
  appliesTo: ['e2e'],
  description:
    'Behaviour-Driven Development is a collaboration practice: the Product Owner, QA and developers (the “Three Amigos”) agree on concrete examples of business behaviour, written in Gherkin as acceptance criteria. Those are conversations about what a user can do with the product, so the scenarios are automated at the top of the pyramid: in this project the 7 scenarios in MaxProfit.feature drive the real UI with Playwright.',
};

export const propertyBasedInfo = {
  name: 'Property-Based',
  appliesTo: ['unit'],
  description:
    'Property-based testing states invariants that must hold for every valid input and lets the framework (jqwik) generate thousands of inputs to try to break them. Here: the reported profit always equals the profit of the chosen stocks (PropertyBasedStockTests), and the rate limiter never admits more requests than its capacity under random burst patterns (RateLimiterServiceTests). At system level, Schemathesis applies the same idea to the whole API: it generates requests from the OpenAPI spec and checks every response.',
};

export const testingTechniques = [
  {
    id: 'example-based',
    name: 'Example-Based Testing',
    icon: '✓',
    color: 'bg-emerald-500',
    description: 'Traditional testing approach where you provide specific input values and verify expected outputs. Also known as "test cases" or "example testing".',
    whenToUse: 'When you know specific input/output pairs, edge cases, and can enumerate expected behaviors. Great for business logic with known outcomes.',
    example: `void testAddition() {
    assertEquals(5, calculator.add(2, 3));
    assertEquals(0, calculator.add(-1, 1));
    assertEquals(10, calculator.add(5, 5));
}`,
  },
  {
    id: 'property-based',
    name: 'Property-Based Testing',
    icon: '⟳',
    color: 'bg-cyan-500',
    description: 'Instead of testing specific examples, you define properties (invariants) that should always be true. The framework generates thousands of random inputs to verify these properties hold.',
    whenToUse: 'When behavior should work for ANY valid input, not just the examples you think of. Reveals edge cases you never imagined.',
    example: `@Property
void additionIsCommutative(
    @ForAll int a, @ForAll int b) {
    assertEquals(calc.add(a, b), calc.add(b, a));
}`,
  },
  {
    id: 'mutation',
    name: 'Mutation Testing',
    icon: '✦',
    color: 'bg-yellow-500',
    description: 'Introduces small changes (mutations) to your code to verify that your tests can detect them. If a mutation survives, your test suite is insufficient.',
    whenToUse: 'To measure test effectiveness and find gaps in coverage. Ensures tests actually verify behavior, not just pass by accident. This project fails the build below a 90% mutation score.',
    example: `Original: if (a > 0)
Mutation: if (a >= 0)
If test still passes → test is weak!
Kill rate: 85% (good), 95% (excellent)`,
  },
  {
    id: 'bdd',
    name: 'BDD',
    icon: '📖',
    color: 'bg-purple-500',
    description: 'Behaviour-Driven Development is a collaboration practice: the Product Owner, QA and developers agree on concrete examples of how the product should behave, written in human-readable Gherkin.',
    whenToUse: 'For acceptance criteria that business stakeholders write, read and agree on. Automate the scenarios end-to-end against the real product, as this project does through the UI.',
    example: `Scenario: Max Profit obtained with using all savings
  Given I have 10 Euros of savings
  When Array of current stock prices are "5,5,1"
  And Array of future stock prices are "9,9,4"
  Then the best combination of indices for max profit is "0,1"
  And profit is 8 Euros`,
  },
  {
    id: 'performance',
    name: 'Performance Testing',
    icon: '⚡',
    color: 'bg-violet-500',
    description: 'Verifies performance characteristics such as execution time, throughput and resource usage. Reliable checks compare a robust statistic (such as the median after a warm-up) against a limit with a generous margin.',
    whenToUse: 'When there are performance requirements (response time, memory, CPU). Essential for identifying bottlenecks and ensuring scalability.',
    example: `long[] nanos = new long[51];
for (int i = 0; i < 51; i++) {
    long start = System.nanoTime();
    algorithm.run(input);
    nanos[i] = System.nanoTime() - start;
}
Arrays.sort(nanos);
assertTrue(nanos[25] < LIMIT_NANOS);   // median`,
  },
  {
    id: 'contract',
    name: 'Contract Testing',
    icon: '🤝',
    color: 'bg-teal-500',
    description: 'Consumer-Driven Contract Testing lets services evolve independently. The consumer (frontend) defines the requests it makes and the responses it relies on; the provider (backend) verifies it satisfies every consumer contract before deployment.',
    whenToUse: 'When separate teams or deployables depend on an API. Contracts catch breaking API changes early and cheaply; they reduce, but do not remove, the need for end-to-end tests.',
    example: `// Frontend defines contract
const interaction = {
  uponReceiving: 'calculate request',
  withRequest: { path: '/api/calculate', body: {...} },
  willRespondWith: { status: 200, body: {...} }
};

// Backend verifies contract
@Provider("backend")
@Consumer("frontend")
@PactBroker(url = "...")
void verifyContract() {
  context.verifyInteraction();
}`,
  },
];
