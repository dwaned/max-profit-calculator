export const testLayers = [
  {
    id: 'unit',
    name: 'Unit Tests',
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-400',
    description: 'Test individual methods and classes in isolation. Fast, focused, and cover core business logic. This layer includes both Example-Based and Property-Based testing approaches.',
    framework: 'JUnit 5 + Jqwik',
    testCount: 17,
    testClasses: ['ExampleBasedTests', 'PropertyBasedStockTests'],
    codeExample: `@Test
void shouldWorkWithThreeIndices() {
    CalculationResult result = Stock.returnIndicesMaxProfit(5,
            Arrays.asList(1, 2, 5),
            Arrays.asList(2, 3, 20));

    assertEquals(15, result.getMaxProfit());
    assertEquals(Collections.singletonList(2), result.getIndices());
}`,
    codeExamplePropertyBased: `@Property
void positiveScenarios(
    @ForAll @IntRange(min = 1, max = 1000) final int savings,
    @ForAll("stockPrices") final ArrayList<Integer> currentPrices,
    @ForAll("stockPrices") final ArrayList<Integer> futurePrices) {
    
    CalculationResult result = Stock.returnIndicesMaxProfit(savings,
            currentPrices, futurePrices);
    
    // Verify profit equals sum of (future - current) for selected indices
    if (!result.getIndices().isEmpty()) {
        int profit = 0;
        for (int idx : result.getIndices()) {
            profit += futurePrices.get(idx) - currentPrices.get(idx);
        }
        assertEquals(profit, result.getMaxProfit());
    }
}`,
    properties: [
      'Fast execution (milliseconds)',
      'No external dependencies',
      'Test one unit at a time',
      'Easy to debug',
      'Example & Property-based variants'
    ],
    subTests: [
      {
        name: 'Example-Based',
        description: 'Traditional tests with specific input/output pairs. Use when you know the expected behavior.',
        codeExample: `void shouldWorkWithThreeIndices() {
    assertEquals(15, Stock.returnIndicesMaxProfit(5,
        Arrays.asList(1, 2, 5),
        Arrays.asList(2, 3, 20)).getMaxProfit());
}`
      },
      {
        name: 'Property-Based',
        description: 'Generates random inputs to verify invariants hold for ALL possible inputs. Uses Jqwik library.',
        codeExample: `@Property
void positiveScenarios(
    @ForAll @IntRange(min = 1, max = 1000) int savings,
    @ForAll("stockPrices") ArrayList<Integer> currentPrices) {
    
    // Verify property holds for thousands of random inputs
    CalculationResult result = Stock.returnIndicesMaxProfit(...);
    assertTrue(result.getMaxProfit() >= 0);
}`
      }
    ]
  },
  {
    id: 'controller',
    name: 'Controller Tests',
    color: 'bg-blue-500',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-400',
    description: 'Test API endpoints and HTTP contracts. Verify request/response mapping and status codes.',
    framework: 'Spring Boot Test + MockMvc',
    testCount: 12,
    testClasses: ['CalculatorControllerTest', 'CalculatorControllerHttpStatusTest'],
    codeExample: `@Test
void shouldReturn200WhenValidRequest() {
    mockMvc.perform(post("/api/calculate")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{"savings":10,"buyPrices":[1,2],"sellPrices":[3,4]}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.maxProfit").value(3));
}`,
    properties: [
      'Test HTTP contracts',
      'Validate JSON structure',
      'Check HTTP status codes',
      'Fast (no real HTTP)'
    ]
  },
  {
    id: 'integration',
    name: 'Integration Tests',
    color: 'bg-orange-500',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-400',
    description: 'Test multiple services together using Docker containers. Verify full stack behavior.',
    framework: 'Testcontainers + Docker Compose',
    testCount: 2,
    testClasses: ['ContainerTests'],
    codeExample: `@Test
void shouldStartFullStack() {
    docker-compose.up();
    
    String response = RestAssured.get(
        "http://localhost:9095/api/calculate")
        .asString();
    
    assertNotNull(response);
}`,
    properties: [
      'Real containers',
      'Full stack testing',
      'Multi-service validation',
      'Production-like environment'
    ]
  },
  {
    id: 'ui',
    name: 'UI Tests',
    color: 'bg-red-500',
    borderColor: 'border-red-400',
    textColor: 'text-red-400',
    description: 'End-to-end browser automation tests. Verify user interactions and UI behavior.',
    framework: 'Playwright',
    testCount: 1,
    testClasses: ['ContainerTests (with site)'],
    codeExample: `@Test
void shouldCalculateProfit() {
    page.goto("http://localhost:3000");
    page.fill("#savings", "10");
    page.click("button[type='submit']");
    
    assertThat(page.locator(".result"))
        .containsText("Max Profit: 8");
}`,
    properties: [
      'Real browser testing',
      'User journey validation',
      'Full stack from UI to DB',
      'Slowest but most realistic'
    ]
  }
];

export const layerOrder = ['ui', 'integration', 'controller', 'unit'];

export const bddInfo = {
  name: 'BDD',
  appliesTo: ['ui', 'integration'],
  description: 'Behavior-Driven Development is an abstract layer using Gherkin syntax to describe test behavior in human-readable language. It can be applied at ANY testing level (unit, integration, or E2E) depending on what the scenarios describe. Most commonly used at E2E level, but backend-only teams can use it to make use cases and test scenarios readable for non-technical stakeholders. Step definitions abstract the technical implementation details.',
  badge: 'BDD'
};

export const propertyBasedInfo = {
  name: 'Property-Based',
  appliesTo: ['unit'],
  description: 'Property-Based Testing generates thousands of random inputs to verify that invariants (properties) hold true for ALL possible inputs, not just the examples you think of. Uses the Jqwik library. Unlike Example-Based tests that check specific values, Property-Based tests verify the fundamental rules that should always be true.',
  badge: 'Property-Based'
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
}`
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
}`
  },
  {
    id: 'mutation',
    name: 'Mutation Testing',
    icon: '✦',
    color: 'bg-yellow-500',
    description: 'Introduces small changes (mutations) to your code to verify that your tests can detect them. If a mutation survives, your test suite is insufficient.',
    whenToUse: 'To measure test effectiveness and find gaps in coverage. Ensures tests actually verify behavior, not just pass by accident.',
    example: `Original: if (a > 0)
Mutation: if (a >= 0)
If test still passes → test is weak!
Kill rate: 85% (good), 95% (excellent)`
  },
  {
    id: 'bdd',
    name: 'BDD',
    icon: '📖',
    color: 'bg-purple-500',
    description: 'Behavior-Driven Development uses human-readable syntax (Gherkin) to describe what the system should do. Bridges communication between technical and non-technical stakeholders.',
    whenToUse: 'For acceptance criteria, integration tests, and when business stakeholders need to understand or contribute to test scenarios.',
    example: `Scenario: Withdraw money
  Given account has $100
  When I withdraw $50
  Then balance should be $50`
  }
];
