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

| Suite | Files | Tool | CI |
|---|---|---|---|
| Example-based | `ExampleBasedTests`, `StockInvalidInputTests`, `CalculationResultTests`, `CompanyNameGeneratorTests`, `StockLoggingLevelTest` | JUnit 6 | `maven.yml` |
| Property-based | `PropertyBasedStockTests` | jqwik | `maven.yml` |
| Controller / web layer | `CalculatorControllerTest`, `CalculatorControllerHttpStatusTest` (200/400/405/415/429), `MetricsInstrumentationTest`, `WebConfigCorsTest`, `CorsPropertiesTest`, `RateLimiterServiceTests` | JUnit, MockMvc | `maven.yml` |
| Frontend | `site/frontend/tests/unit/*` (API client incl. timeouts, report links, footer) | Vitest | `frontend.yml` |

`mvn verify` also enforces a **coverage floor** with JaCoCo: 95% of lines and 80% of branches.

## 3. Mutation tests

PITest mutates the production code and checks that the test suite catches the mutants
(`mvn test -Ppitest`). The build fails below a **90% mutation score** (currently ~97%).
CI: `maven.yml`.

## 4. BDD / acceptance tests

Cucumber scenarios in `src/test/resources/com/maxprofit/calculator/MaxProfit.feature`,
with step definitions in `steps/StepDefinitions.java` and runner `RunCucumberTest`.
CI: `maven.yml` (part of `mvn verify`, plus an HTML report artifact).

## 5. Integration tests

| Suite | Files | Tool | Run locally | CI |
|---|---|---|---|---|
| API integration (real embedded Tomcat) | `ApiSecurityTest` (CORS, forwarded-IP rate limiting, input bounds, error format), `OpenApiDocsTest` | Spring Boot test, TestRestTemplate | `mvn verify` | `maven.yml` |
| Containers | `ContainerTests`, `ApiPerformanceTests` (< 500 ms for 50 stocks) | Testcontainers, REST Assured | `mvn test -Pcontainer-tests` (needs Docker) | — |

## 6. Contract tests (consumer-driven)

- **Consumer:** `site/frontend/tests/pact/calculate.api.test.js` (Pact JS) writes the contract
  to `site/frontend/pacts/` (`npm run test:pact`).
- **Provider:** `LocalContractVerificationTest` verifies the backend against that file, and
  `PactBrokerVerificationTest` against the Pact Broker (`mvn test -Pcontract-tests`, with the
  API running on :9095).
- CI: `contract-tests.yml` runs all of this in one job on a GitHub-hosted runner: the
  consumer tests publish to a Pact Broker running as a service container (SQLite, fresh for
  each run), the provider is verified against it, and `can-i-deploy` checks that this
  commit's frontend and backend are compatible.

## 7. Performance tests

`StressTests` checks the algorithm at 5–100 items: the median time per call after a JIT
warm-up, always at the maximum budget, plus bytes allocated (which, unlike heap usage, isn't
affected by GC timing). The thresholds sit 200–500× above the measured cost, so they are
reliable on shared runners while still catching a real regression. It runs in the default
suite (`mvn verify`, so in `maven.yml`) and on its own with `mvn test -Pperformance-tests`.
Thresholds are in the [README](README.md#performance-thresholds).

`ApiPerformanceTests` checks end-to-end API latency (< 500 ms for 50 stocks) through the
Docker stack; see Integration tests.

## 8. End-to-end (browser) tests

| Suite | Files | Tool | Run locally | CI |
|---|---|---|---|---|
| Java | `PlaywrightUITests` | Playwright for Java | `mvn test -Pplaywright-tests` (UI running; `PLAYWRIGHT_BASE_URL`) | `containers.yml` (against the Docker stack), `reports.yml` (against `vite preview` + local API) |
| JavaScript | `site/frontend/tests/e2e/calculator.spec.js` | Playwright Test | `npm run test:ui` | `reports.yml` (published as the Playwright HTML report) |

## Reports

`reports.yml` publishes the Maven site (test results, JaCoCo coverage, PITest mutations,
checkstyle, cross-referenced source) and the Playwright HTML report to GitHub Pages:
<https://dwaned.github.io/max-profit-calculator/reports/>.
