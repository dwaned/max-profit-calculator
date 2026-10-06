# Automated Testing Levels and Types

Every automated check in this repository, the tools and files involved, how to run it
locally, and where CI runs it. Workflows live in `.github/workflows/`.

## 1. Static analysis

| Check | Tool / files | Run locally | CI |
|---|---|---|---|
| Java style | Checkstyle (`checkstyle.xml`, `checkstyle_suppressions.xml`) | `mvn checkstyle:check` (also part of `mvn verify`) | `maven.yml` |
| Frontend lint | ESLint 10 (`site/frontend/eslint.config.js`) | `npm run lint` | `frontend.yml` |
| Repository lint | MegaLinter (`.mega-linter.yml`), incl. zizmor, gitleaks, secretlint | — | `mega-linter.yml` (PRs) |
| Dependency vulnerabilities | OWASP dependency-check; Dependabot alerts and updates | `mvn verify -Pdependency-check` | `maven.yml` (`main`) |
| Image vulnerabilities | Docker Scout (fails on critical CVEs) | — | `containers.yml` |

## 2. Unit tests

One class or function in isolation: no Spring context, no HTTP, no browser.

| Suite | Files | Tool | CI |
|---|---|---|---|
| Example-based | `ExampleBasedTests`, `StockInvalidInputTests`, `CalculationResultTests`, `CompanyNameGeneratorTests`, `StockLoggingLevelTest`, `CorsPropertiesTest`, `WebConfigCorsTest` | JUnit 6 | `maven.yml` |
| Property-based | `PropertyBasedStockTests` (engine invariants), `RateLimiterServiceTests` (never admits more than capacity) | jqwik | `maven.yml` |
| Frontend | `site/frontend/tests/unit/*`: API client (incl. timeouts), report links, footer, and `testLayers.test.js`, which keeps the Testing Pyramid page in sync with the real tests | Vitest | `frontend.yml` |

`mvn verify` also enforces a **coverage floor** with JaCoCo: 95% of lines and 80% of branches.

## 3. Mutation tests

PITest mutates the production code and checks that the test suite catches the mutants
(`mvn test -Ppitest`). The build fails below a **90% mutation score** (currently ~97%).
CI: `maven.yml`.

## 4. Integration tests

Components of the backend working together (ISTQB: component integration testing), in two sizes:

- **Narrow**, the Spring MVC layer on its own with MockMvc (`@WebMvcTest`), no server or network:
  request mapping, validation, status codes (200/400/405/415/429), the rate-limit filter and
  metrics. `CalculatorControllerTest`, `CalculatorControllerHttpStatusTest`, `MetricsInstrumentationTest`.
- **Broad**, the whole Spring application on a real embedded Tomcat, called over HTTP
  (TestRestTemplate): `ApiSecurityTest` (CORS, forwarded-IP rate limiting, input bounds, error
  format, actuator exposure) and `OpenApiDocsTest`.

CI: `maven.yml` (part of `mvn verify`).

### The stock advisor (AI agent)

The advisor (`com.maxprofit.calculator.advisor`) is tested in layers by how much uncertainty each
tolerates, after Angie Jones's [test pyramid for AI agents](https://angiejones.tech/test-pyramid-for-ai-agents/):

- **Deterministic foundations** (unit): `ProfitToolTests` (the tool validates the model's
  arguments with the API's limits), `StockAdvisorTests` (the agent loop with a scripted fake model:
  tool results fed back, invalid arguments reported, unknown tools refused, turn limit, and a
  property-based check of the "answer quotes the calculator's profit" verifier) and
  `OllamaChatModelTest` (the Ollama client against a mock server).
- **Reproducible reality** (integration): `AdvisorReplayTests` replays real conversations with
  `qwen3.5:4b` recorded in `src/test/resources/advisor/recordings/`. It asserts the flow (which tool,
  which arguments, verified or not), not the wording, and fails if the prompt, tool definition or
  tool results change: re-record with `-Dadvisor.record=true` against a running Ollama.
- `AdvisorControllerTest` (narrow) and `ApiSecurityTest` (broad) cover the endpoint: 503 when
  disabled or the model is unreachable, validation, and rate limiting.

All of these run in CI without a model.

## 5. Contract tests (consumer-driven)

- **Consumer:** `site/frontend/tests/pact/calculate.api.test.js` runs the frontend's real API
  client (`requestCalculation`) against Pact's mock provider (Pact JS, `PactV3`). Pact records
  the requests the client sends and the response fields the UI relies on (matched by type) into
  `site/frontend/pacts/` (`npm run test:pact`). If the client changes what it sends, the test fails.
- **Provider:** Pact's verifier checks the running backend against that contract, from the local
  file (`LocalContractVerificationTest`, `@PactFolder`) and from the Pact Broker
  (`PactBrokerVerificationTest`): `mvn test -Pcontract-tests`, with the API running on :9095.
- CI: `contract-tests.yml` runs all of this in one job on a GitHub-hosted runner: the
  consumer tests publish to a Pact Broker running as a service container (SQLite, fresh for
  each run), the provider is verified against it, and `can-i-deploy` checks that this
  commit's frontend and backend are compatible.

## 6. System tests

Black-box tests against the Docker images: Testcontainers starts `docker-compose-test.yml`
(API + nginx frontend) and the tests call it over HTTP. `ContainerTests`, plus
`ApiPerformanceTests` (see Performance). Run with `mvn test -Pcontainer-tests` (needs Docker); CI runs
them in `containers.yml`, after the BDD scenarios.

**API fuzzing (Schemathesis)** is property-based testing for the whole API: it generates hundreds
of requests from the published OpenAPI spec (`/api/v3/api-docs`) and checks every response: no
5xx, only documented status codes and content types, bodies that match their schema, invalid
input rejected, `Allow` on 405. Settings are in `schemathesis.toml`; run locally against a running
API with `uvx schemathesis run http://localhost:9095/api/v3/api-docs --checks all --exclude-checks positive_data_acceptance`.
CI runs it against the Docker image in `containers.yml`.

## 7. Performance tests

`StressTests` checks the algorithm at 5–100 items: the median time per call after a JIT
warm-up, always at the maximum budget, plus bytes allocated (which, unlike heap usage, isn't
affected by GC timing). The thresholds sit 200–500× above the measured cost, so they are
reliable on shared runners while still catching a real regression. It runs in the default
suite (`mvn verify`, so in `maven.yml`) and on its own with `mvn test -Pperformance-tests`.
Thresholds are in the [README](README.md#performance-thresholds).

`ApiPerformanceTests` checks end-to-end API latency through the Docker stack: the median of 15
requests after a warm-up (paced to stay within the rate limit), 50 stocks at savings 1000, must
be under 500 ms. It runs in CI in `containers.yml`; see System tests.

## 8. UI / end-to-end tests and BDD acceptance scenarios

**BDD** is a collaboration practice: the Product Owner, QA and developers agree on concrete
examples of business behaviour, written in Gherkin as acceptance criteria. The scenarios in
`src/test/resources/com/maxprofit/calculator/MaxProfit.feature` are therefore automated at
the top of the pyramid: the step definitions (`steps/StepDefinitions.java`, runner
`RunCucumberTest`) drive the real UI with Playwright, entering savings and prices, submitting
and reading the result on screen.

| Suite | Files | Tool | Run locally | CI |
|---|---|---|---|---|
| BDD acceptance scenarios | `MaxProfit.feature` (7 scenarios) | Cucumber + Playwright for Java | `mvn test -Pplaywright-tests` (UI running; `PLAYWRIGHT_BASE_URL`, default `http://localhost:3000`) | `containers.yml` (Docker stack), `reports.yml` (published as the Cucumber report) |
| JavaScript e2e | `site/frontend/tests/e2e/calculator.spec.js` | Playwright Test | `npm run test:ui` | `reports.yml` (published as the Playwright HTML report) |

## Reports

`reports.yml` publishes the Maven site (test results, JaCoCo coverage, PITest mutations,
checkstyle, cross-referenced source), the Cucumber report and the Playwright HTML report to
GitHub Pages:
<https://dwaned.github.io/max-profit-calculator/reports/>.
