// Content for the Testing Pyramid page. Each layer explains the question it
// answers, what it catches (with a real issue from this project where there is
// one), its blind spots and its trade-offs. Tool names are secondary.
//
// Every test class lists the file it lives in and how many tests it runs;
// tests/unit/testLayers.test.js checks this against the repository so the page
// cannot drift from the real tests.

const JAVA = 'src/test/java/com/maxprofit/calculator';

export const testLayers = [
  {
    id: 'unit',
    name: "Unit Tests",
    shortName: "Unit",
    hex: '#10b981',
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-400',
    question: "Does this piece of logic do the right thing?",
    summary: "Unit tests check one class or function on its own: no web server, no network, no browser. Because they are tiny and fast, you can have hundreds of them and run them on every save, and when one fails it points straight at the broken code.",
    catches: ["Wrong results from the core algorithm, including edge cases like an empty list or savings that buy nothing", "Invariants that must hold for every input (property-based): the reported profit always equals the profit of the chosen stocks", "Mistakes in small helpers: the rate limiter, configuration binding, the frontend’s API client and its timeout handling"],
    realIssue: { title: "Guards the algorithm against regressions", story: "Property-based tests check the profit and savings invariants on thousands of random inputs, and stress tests would fail if the dynamic program ever regressed to the old brute-force O(2ⁿ) approach." },
    blindSpots: ["Whether the pieces work together once wired into the application", "Configuration, HTTP, serialization and anything else outside the unit", "What the user actually sees"],
    tradeoffs: { speed: 5, realism: 1, upkeep: 1, flakiness: 1 },
    writeOneWhen: "For every piece of logic with rules worth stating, especially business rules and edge cases. This is where most tests should live.",
    inThisProject: "The knapsack engine (example-based and property-based), the rate limiter, configuration classes and the frontend’s API client and helpers.",
    tools: "JUnit 6, jqwik and Vitest",
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
      { name: 'reports.test.js', style: 'example', count: 6, file: 'site/frontend/tests/unit/reports.test.js' },
      { name: 'testLayers.test.js', style: 'example', count: 7, file: 'site/frontend/tests/unit/testLayers.test.js' },
    ],
    codeExample: `// ExampleBasedTests.java
@Test
void shouldWorkWithThreeIndices() {
    CalculationResult result = Stock.returnIndicesMaxProfit(5,
            Arrays.asList(1, 2, 5), Arrays.asList(2, 3, 20));

    assertEquals(15, result.getMaxProfit());
    assertEquals(Collections.singletonList(2), result.getIndices());
}`,
  },
  {
    id: 'web',
    name: "Web Layer Tests",
    shortName: "Web Layer",
    hex: '#3b82f6',
    color: 'bg-blue-500',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-400',
    question: "Does the HTTP layer accept, reject and answer requests correctly?",
    summary: "Web layer tests start only the part of the application that handles HTTP (routing, validation, error responses, filters), without a real server or network. They check the contract of each endpoint, such as which status code a bad request gets, in milliseconds.",
    catches: ["Wrong status codes: 400 for invalid input, 405 for the wrong method, 415 for the wrong content type, 429 when rate limited", "Validation rules that are missing or too loose, such as oversized price lists", "Request and response mapping mistakes"],
    realIssue: null,
    blindSpots: ["Problems that only appear with the whole application running, such as CORS or a real proxy in front", "Real network behaviour and server configuration"],
    tradeoffs: { speed: 4, realism: 2, upkeep: 2, flakiness: 1 },
    writeOneWhen: "Whenever an endpoint has rules about what it accepts or how it fails. They are cheaper and more precise than calling a fully started server.",
    inThisProject: "Status codes, validation limits, the rate-limit filter and the metrics each request records.",
    tools: "Spring MockMvc",
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
  },
  {
    id: 'integration',
    name: "Integration Tests",
    shortName: "Integration",
    hex: '#6366f1',
    color: 'bg-indigo-500',
    borderColor: 'border-indigo-400',
    textColor: 'text-indigo-400',
    question: "Do the pieces work together when the whole application is running?",
    summary: "Integration tests start the complete application on a real embedded web server and talk to it over HTTP. They catch problems that live in the gaps between components: configuration, filters, security rules and how they interact.",
    catches: ["Security behaviour that only exists in the assembled app: which websites may call the API (CORS) and how the client’s IP is resolved behind a proxy", "Request filters and error handling working together, such as malformed JSON, wrong JSON types and consistent error bodies", "Published documentation that actually loads"],
    realIssue: { title: "Caught real security gaps", story: "Any website could call the API, and a client could reset its own rate limit just by sending a fake X-Forwarded-For header. Both were fixed, and these tests now fail if either comes back." },
    blindSpots: ["Problems in the Docker image or the deployed infrastructure", "Anything in the frontend"],
    tradeoffs: { speed: 3, realism: 3, upkeep: 2, flakiness: 2 },
    writeOneWhen: "When behaviour depends on several components or on configuration, especially anything security-related.",
    inThisProject: "CORS, client-IP resolution and rate limiting, input limits, the error format, actuator exposure and the OpenAPI docs.",
    tools: "Spring Boot Test with a real embedded server",
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
  },
  {
    id: 'contract',
    name: "Contract Tests",
    shortName: "Contract",
    hex: '#14b8a6',
    color: 'bg-teal-500',
    borderColor: 'border-teal-400',
    textColor: 'text-teal-400',
    question: "Do the frontend and backend agree on how they talk to each other?",
    summary: "Contract tests check the agreement between two separately built parts without running both together. The frontend’s real API code runs against a stand-in that records exactly what it sends and which response fields it relies on. That record, the contract, is then replayed against the real backend.",
    catches: ["A backend change that would break the frontend, such as a renamed or removed field the UI reads", "A frontend change that sends something the backend no longer accepts", "Mismatched error formats that would leave users with a blank message"],
    realIssue: { title: "Made the contract real", story: "The contract used to be written by hand, so the frontend could change what it sent and the test would still pass. It is now generated from the frontend’s actual API code: when the request path was deliberately broken, the test failed immediately." },
    blindSpots: ["Whether the feature works end to end for a user", "Business rules inside the backend, which the contract only touches at the edges"],
    tradeoffs: { speed: 4, realism: 3, upkeep: 3, flakiness: 1 },
    writeOneWhen: "When parts of a system are built, deployed or owned separately and talk over an API. Contracts catch breaking changes early and cheaply, but they reduce rather than replace end-to-end tests.",
    inThisProject: "The calculate request and its success and error responses, verified from the contract file and through a broker that answers “can I deploy?”.",
    tools: "Pact (JavaScript consumer, JVM provider)",
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
  },
  {
    id: 'system',
    name: "System Tests",
    shortName: "System",
    hex: '#f97316',
    color: 'bg-orange-500',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-400',
    question: "Does the deployed system behave correctly from the outside?",
    summary: "System tests treat the application as a black box: they start the real Docker images, exactly as they would be deployed, and talk to them over the network. API fuzzing belongs here too: it generates hundreds of requests from the published API description and checks that every response matches what the API promises.",
    catches: ["Mistakes in the Docker images or the deployment configuration", "Responses that break the API’s published promises: undocumented status codes, wrong content types, bodies that don’t match their schema", "Inputs nobody thought to try, which crash the server or are wrongly accepted"],
    realIssue: { title: "Fuzzing found bugs nobody had tested for", story: "In minutes it found that company names could be returned for stocks that were never bought, or misaligned with the chosen stocks; that values of the wrong type were silently converted and accepted; and that some error responses used a different format than documented. All were fixed and covered by tests." },
    blindSpots: ["How the product looks and feels in a browser", "Whether the business rules are the right ones: fuzzing checks promises, not intent"],
    tradeoffs: { speed: 2, realism: 4, upkeep: 3, flakiness: 3 },
    writeOneWhen: "When you ship something deployable such as an image or a service. A few black-box checks and fuzzing against its published contract find problems no hand-written test anticipated.",
    inThisProject: "Black-box checks against the Docker images, plus fuzzing of every API operation from its OpenAPI description.",
    tools: "Testcontainers, REST Assured and Schemathesis",
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
  },
  {
    id: 'e2e',
    name: "UI / End-to-End Tests",
    shortName: "UI / E2E",
    hex: '#ef4444',
    color: 'bg-red-500',
    borderColor: 'border-red-400',
    textColor: 'text-red-400',
    question: "Can a user actually get the job done?",
    summary: "End-to-end tests drive the real application in a real browser, the way a person would: typing values, clicking buttons and reading what appears on screen. They are the slowest and most fragile tests, so keep them few and focused on what matters most to users. This is also where the BDD acceptance scenarios agreed with the business run.",
    catches: ["A broken user journey: the form submits but the result never appears", "Frontend and backend that each pass their own tests but fail together", "Acceptance criteria the business cares about, written as plain-language scenarios"],
    realIssue: { title: "Guards what the user sees", story: "The results card never showed company names: the frontend looked them up by position in a list the API had already filtered. After the fix, an end-to-end test now checks that the chosen company’s name appears on screen." },
    blindSpots: ["The exact cause of a failure, which often takes digging", "Edge cases and invalid inputs, which are far cheaper to cover lower down"],
    tradeoffs: { speed: 1, realism: 5, upkeep: 4, flakiness: 4 },
    writeOneWhen: "For the few journeys users depend on, and for acceptance criteria. Anything that can be tested lower in the pyramid should be.",
    inThisProject: "The calculator journey, the 7 BDD acceptance scenarios, form validation and navigation.",
    tools: "Playwright with Cucumber",
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
  },
  {
    id: 'performance',
    crossCutting: true,
    name: "Performance Tests",
    shortName: "Performance",
    hex: '#a855f7',
    color: 'bg-purple-500',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-400',
    question: "Is it fast and lean enough, and does it stay that way?",
    summary: "Performance checks measure speed and resource use against a requirement. Reliable ones take a robust measurement, such as the median of many runs after a warm-up, and set limits with enough margin that a busy CI machine does not cause false failures.",
    catches: ["An algorithm that silently becomes much slower", "Memory use that grows unexpectedly", "An API that misses its response-time requirement"],
    realIssue: { title: "Made reliable enough to run on every PR", story: "The original checks timed a single run in whole milliseconds and measured memory in a way garbage collection could skew, so they were too flaky to run in CI. They now use medians after a warm-up and allocated bytes, and run on every pull request." },
    blindSpots: ["Behaviour under heavy concurrent load (that needs load testing)", "Performance on real user devices and networks"],
    tradeoffs: { speed: 3, realism: 2, upkeep: 2, flakiness: 2 },
    writeOneWhen: "When there is a stated requirement, such as “under 500 ms for 50 stocks”, or a past regression you never want to see again.",
    inThisProject: "Algorithm time and memory at the maximum input, and median API latency against the Docker image.",
    tools: "JUnit and Testcontainers",
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
  },
];

// Top of the pyramid first.
export const layerOrder = ['e2e', 'system', 'contract', 'integration', 'web', 'unit'];

export const layerTestCount = (layer) =>
  layer.testClasses.reduce((sum, testClass) => sum + testClass.count, 0);

// How each trade-off is labelled. Scores run from 1 (low) to 5 (high).
export const tradeoffLabels = {
  speed: { label: 'Speed', hint: 'How quickly it runs' },
  realism: { label: 'Realism', hint: 'How close to real use' },
  upkeep: { label: 'Upkeep', hint: 'Effort to write and maintain' },
  flakiness: { label: 'Flakiness risk', hint: 'Chance of failing for no real reason' },
};

// Ideas that apply across layers rather than living in one band of the pyramid.
export const lenses = [
  {
    id: 'bdd',
    name: 'BDD acceptance scenarios',
    icon: 'conversation',
    idea: 'The Product Owner, QA and developers agree on concrete examples of how the product should behave, written as plain-language scenarios (Given… When… Then…).',
    value: 'Everyone shares one definition of “done”, and the examples become automated checks that keep the product honest.',
    appliesTo: ['e2e'],
    inThisProject: '7 scenarios, run through the real UI in a browser.',
  },
  {
    id: 'property-based',
    name: 'Property-based testing',
    icon: 'dice',
    idea: 'Instead of picking examples, state a rule that must hold for every input and let the computer generate thousands of inputs to try to break it.',
    value: 'Finds the edge cases nobody thought of, and shrinks a failure to the smallest input that still breaks.',
    appliesTo: ['unit', 'system'],
    inThisProject: 'Engine and rate-limiter invariants at unit level; API fuzzing at system level.',
  },
  {
    id: 'mutation',
    name: 'Mutation testing',
    icon: 'mutant',
    idea: 'Tests your tests: it makes small deliberate bugs in the code (flip a > to >=, return early) and checks that some test fails for each one.',
    value: 'High coverage can still hide tests that assert nothing. A surviving mutant points at exactly that gap.',
    appliesTo: ['unit', 'web', 'integration'],
    inThisProject: '97% of 107 deliberate bugs are caught; the build fails below 90%.',
  },
  {
    id: 'coverage',
    name: 'Coverage floor',
    icon: 'gauge',
    idea: 'Measures which lines and branches the tests execute, and fails the build if that drops below a floor.',
    value: 'Stops untested code from creeping in unnoticed. Combined with mutation testing, it shows both what runs and what is really checked.',
    appliesTo: ['unit', 'web', 'integration'],
    inThisProject: 'At least 95% of lines and 80% of branches.',
  },
  {
    id: 'performance',
    name: 'Performance checks',
    icon: 'gauge-fast',
    idea: 'Measure speed and resource use against a requirement, at whichever level the requirement lives.',
    value: 'Catches the slowdown that nobody notices until users do.',
    appliesTo: ['unit', 'system'],
    inThisProject: 'Algorithm time and memory at unit level; API latency against the Docker image.',
  },
  {
    id: 'static',
    name: 'Static & security analysis',
    icon: 'shield',
    idea: 'Checks the code, configuration and dependencies without running them: style, Dockerfiles, CI workflows, leaked secrets, known-vulnerable libraries and container images.',
    value: 'The cheapest bugs to fix are the ones caught before any test runs.',
    appliesTo: [],
    inThisProject: 'Runs on every pull request, before the tests, plus weekly dependency updates.',
  },
];

// What runs when, and roughly how long it takes (measured from CI runs).
export const safetyNet = [
  {
    stage: 'Every pull request',
    steps: [
      { name: 'Static & security analysis', detail: 'Style, Dockerfiles, workflows, secrets', duration: '~3 min', layers: [] },
      { name: 'Unit, web & integration tests', detail: 'Plus performance checks and the coverage floor', duration: '~45 s', layers: ['unit', 'web', 'integration'] },
      { name: 'Mutation testing', detail: 'Do the tests catch deliberate bugs?', duration: '~2.5 min', layers: ['unit', 'web', 'integration'] },
      { name: 'Frontend checks', detail: 'Lint, unit tests and production build', duration: '~25 s', layers: ['unit'] },
      { name: 'Contract tests', detail: 'Frontend ↔ backend agreement, then “can I deploy?”', duration: '~1.5 min', layers: ['contract'] },
    ],
  },
  {
    stage: 'After merge to main',
    steps: [
      { name: 'Docker images', detail: 'Built, started and scanned for known vulnerabilities', duration: '~3 min', layers: ['system'] },
      { name: 'API fuzzing', detail: 'Hundreds of generated requests against the image', duration: '~1 min', layers: ['system'] },
      { name: 'BDD acceptance & UI tests', detail: 'Real browser against the running stack', duration: '~30 s', layers: ['e2e'] },
      { name: 'System & API performance tests', detail: 'Black-box against fresh containers', duration: '~1 min', layers: ['system'] },
      { name: 'Reports published', detail: 'Test, coverage, mutation and BDD reports on GitHub Pages', duration: '~1 min', layers: [] },
    ],
  },
];
