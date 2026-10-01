// Content for the Testing Techniques page. A layer of the pyramid says where a
// test runs; a technique says how its inputs are chosen and its results judged.
// Each entry explains the idea, why it matters, when to use it and what to
// watch out for, then shows how this project uses it. Tool names are secondary.

export const techniques = [
  {
    id: 'example-based',
    name: 'Example-based testing',
    hex: '#34d399',
    icon: 'check',
    diagram: 'examples',
    question: 'I know specific cases that must work.',
    idea: 'Pick concrete inputs, work out the right answer by hand, and check the code produces it. Each test is one worked example: given these prices and these savings, the best profit is 15.',
    whyItMatters: 'Examples are the easiest tests to read and the best documentation of intent. When one fails, you know exactly which case broke and what the answer should have been.',
    useWhen: 'For business rules with known answers, for every bug you fix (so it stays fixed), and for the edge cases you can name: empty input, zero, the exact limit.',
    watchOut: [
      'You only test the cases you thought of; the bugs live in the ones you didn’t',
      'Many near-identical examples add upkeep without adding confidence',
    ],
    inThisProject: 'Most unit, web and integration tests are examples, including the regression tests for the bugs found by fuzzing.',
    layers: ['unit', 'web', 'integration'],
    codeTitle: 'ExampleBasedTests.java',
    code: `@Test
void shouldWorkWithThreeIndices() {
    CalculationResult result = Stock.returnIndicesMaxProfit(5,
            Arrays.asList(1, 2, 5), Arrays.asList(2, 3, 20));

    assertEquals(15, result.getMaxProfit());
    assertEquals(Collections.singletonList(2), result.getIndices());
}`,
  },
  {
    id: 'property-based',
    name: 'Property-based testing',
    hex: '#38bdf8',
    icon: 'dice',
    diagram: 'property',
    question: 'It should hold for any input, not just my examples.',
    idea: 'Instead of choosing inputs, state a rule that must always be true, such as “the reported profit equals the profit of the stocks it chose”. The computer then generates hundreds of random inputs and tries to break the rule.',
    whyItMatters: 'It finds the edge cases nobody thought of. When it does break the rule, it shrinks the input to the smallest case that still fails, so the bug is easy to understand.',
    useWhen: 'When you can describe what “correct” looks like without computing the answer: invariants, round trips (encode then decode), or agreement with a simpler but slower implementation.',
    watchOut: [
      'A weak property (“it doesn’t crash”) passes almost anything',
      'Random inputs rarely hit narrow cases; steer the generators towards interesting values',
    ],
    inThisProject: 'Profit and savings invariants of the engine, and the rate limiter’s token rules, are checked on generated inputs.',
    layers: ['unit'],
    codeTitle: 'PropertyBasedStockTests.java',
    code: `@Property
void positiveScenarios(@ForAll @IntRange(min = 1, max = 1000) int savings,
                       @ForAll("stockPrices") List<Integer> buy,
                       @ForAll("stockPrices") List<Integer> sell) {
    CalculationResult result = Stock.returnIndicesMaxProfit(savings, buy, sell);

    // The rule: the reported profit is exactly the profit of the chosen stocks
    int profit = 0;
    for (int i : result.getIndices()) {
        profit += sell.get(i) - buy.get(i);
    }
    assertEquals(profit, result.getMaxProfit());
}`,
  },
  {
    id: 'fuzzing',
    name: 'API fuzzing',
    hex: '#fb923c',
    icon: 'spark',
    diagram: 'fuzzing',
    question: 'Does my API keep its promises, even for inputs nobody imagined?',
    idea: 'Property-based testing for a whole API. The fuzzer reads the API’s published description (OpenAPI) and sends hundreds of generated requests, valid and invalid. Every response is checked against what the description promises.',
    whyItMatters: 'It needs no hand-written test cases, yet it finds crashes, undocumented responses and invalid input that is silently accepted. These are the bugs that otherwise reach production or attackers.',
    useWhen: 'For any API with a machine-readable description, run against the deployed build (here, the Docker image) so it sees exactly what users will.',
    watchOut: [
      'Some rules can’t be written in a schema (here, “both price lists have the same length”), so expect a few false alarms to tune out',
      'It checks that the API keeps its promises, not whether those promises are the right business behaviour',
    ],
    inThisProject: 'Its first run found real bugs: company names for stocks that were never bought, values of the wrong type silently accepted, and error responses that broke the documented format. All were fixed and covered by tests.',
    layers: ['system'],
    codeTitle: 'Run against the running API',
    code: `uvx schemathesis run http://localhost:9095/api/v3/api-docs \\
    --checks all --exclude-checks positive_data_acceptance

# Generates requests for every operation and checks each response:
#  - no server errors
#  - only documented status codes and content types
#  - bodies match their schema
#  - invalid input is rejected`,
  },
  {
    id: 'mutation',
    name: 'Mutation testing',
    hex: '#facc15',
    icon: 'mutant',
    diagram: 'mutation',
    question: 'Would my tests actually notice a bug?',
    idea: 'Tests for your tests. The tool makes hundreds of small, deliberate bugs (“mutants”) in the code, such as turning < into <= or deleting a line, and runs the tests against each one. A good test suite fails, killing the mutant. A mutant that survives is a bug your tests would miss.',
    whyItMatters: 'Coverage only says code was run, not that anything was checked. A test with no meaningful assertion still counts towards coverage, but it can’t kill mutants. The mutation score measures how much your tests really protect.',
    useWhen: 'On core logic where a silent bug is expensive. Run it in CI with a minimum score, and look at the surviving mutants when you add or change tests.',
    watchOut: [
      'It is slow: every mutant means another test run, so keep it to the code that matters',
      'Some mutants don’t change behaviour (“equivalent mutants”) and can never be killed; that’s why 100% isn’t the goal',
    ],
    inThisProject: 'About 97% of mutants are killed; the build fails below 90%.',
    layers: ['unit', 'web', 'integration'],
    codeTitle: 'Illustration: one mutant',
    code: `// Original
if (cost <= remainingSavings) { buy(stock); }

// Mutant: boundary changed
if (cost <  remainingSavings) { buy(stock); }

// A test that spends exactly all the savings now fails,
// so the mutant is killed. If no test failed, it would
// survive, revealing a missing boundary test.`,
  },
  {
    id: 'bdd',
    name: 'BDD acceptance scenarios',
    hex: '#f472b6',
    icon: 'conversation',
    diagram: 'bdd',
    question: 'Do we all agree on what the product should do?',
    idea: 'Behaviour-Driven Development is a collaboration practice before it’s a testing one. The Product Owner, QA and a developer (the “Three Amigos”) agree on concrete examples of behaviour, written in plain language as Given… When… Then…. Those scenarios become automated acceptance tests that drive the real product.',
    whyItMatters: 'Everyone shares one definition of “done”, written in the language of the business. Misunderstandings are caught in a conversation instead of in a demo, and the scenarios stay true because they run against the product.',
    useWhen: 'For user-facing behaviour that the business cares about and can describe: acceptance criteria for a story. It belongs at the top of the pyramid, through the UI or the public API.',
    watchOut: [
      'Gherkin written by developers alone, for unit-level details, is ceremony without the conversation',
      'Scenarios describe behaviour, not clicks: “When I calculate” ages better than “When I click #submit”',
    ],
    inThisProject: '7 scenarios run in a real browser through the calculator page.',
    layers: ['e2e'],
    codeTitle: 'MaxProfit.feature',
    code: `Scenario: Max Profit obtained with using all savings
  Given I have 10 Euros of savings
  When Array of current stock prices are "5,5,1"
  And Array of future stock prices are "9,9,4"
  Then the best combination of indices for max profit is "0,1"
  And profit is 8 Euros`,
  },
  {
    id: 'contract',
    name: 'Contract testing',
    hex: '#2dd4bf',
    icon: 'handshake',
    diagram: 'contract',
    question: 'Will a change on one side break the other?',
    idea: 'When two parts talk over an API, write down exactly what one side (the consumer) sends and which parts of the answer it relies on. This record is the contract, generated by running the consumer’s real code against a stand-in. The other side (the provider) then proves it honours every contract.',
    whyItMatters: 'Each side is tested on its own, in seconds, yet a breaking change, such as a renamed field the UI reads, fails the build of whoever made it, before deployment. A broker can answer “is it safe to deploy this version?”',
    useWhen: 'When the parts of a system are built, deployed or owned separately. The more teams and services, the more contracts pay off.',
    watchOut: [
      'A hand-written contract proves nothing: generate it from the consumer’s real code',
      'Contracts check the shape of a conversation, not whether the feature works end to end',
    ],
    inThisProject: 'The frontend’s API client generates the contract; the backend verifies it on every pull request.',
    layers: ['contract'],
    codeTitle: 'calculate.api.test.js (consumer side)',
    code: `provider
  .uponReceiving('a request to calculate max profit')
  .withRequest({ method: 'POST', path: '/api/calculate', body: payload })
  .willRespondWith({
    status: 200,
    // Only the fields the results card reads
    body: {
      maxProfit: integer(25),
      indices: eachLike(integer(2)),
      companyNames: eachLike(string('Initech')),
    },
  });`,
  },
  {
    id: 'performance',
    name: 'Performance checks',
    hex: '#c084fc',
    icon: 'gauge-fast',
    diagram: 'performance',
    question: 'Is it fast enough, and will it stay that way?',
    idea: 'Measure speed or resource use against a stated requirement and fail when it’s missed. Reliable checks warm up first, take many measurements and compare a robust figure, such as the median, against a limit with a safety margin.',
    whyItMatters: 'Slowdowns creep in one harmless-looking change at a time, and nobody notices until users do. An automated limit catches the change that crossed the line.',
    useWhen: 'When there is a real requirement (“under 500 ms for 50 stocks”) or an algorithm whose complexity matters. Check at the level the requirement lives: algorithm time in a unit test, response time against the deployed service.',
    watchOut: [
      'One timing is noise: shared CI machines vary a lot from run to run',
      'Tight limits cause flaky failures that teach people to ignore the test',
    ],
    inThisProject: 'Median algorithm time and memory at the maximum input on every pull request; median API latency against the Docker image.',
    layers: ['unit', 'system'],
    codeTitle: 'StressTests.java',
    code: `@Test
void medianTimeFor50ItemsShouldBeUnder50ms() {
    assertMedianUnder(50, 50);
}

// Warms up, times many runs, compares the median:
double medianMs = medianMillis(buy, sell);
assertTrue(medianMs < thresholdMs,
        "Median time for " + items + " items should be < " + thresholdMs + "ms");`,
  },
];
