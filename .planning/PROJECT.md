# max-profit-calculator

## What This Is

A Spring Boot 3 (Java 17) REST service + React 19 SPA that computes the maximum profit obtainable from a single buy/sell across an array of stocks given a fixed savings amount. The application is a deliberate showcase for a broad testing strategy stack — unit, property-based (Jqwik), BDD (Cucumber), mutation (PITest), contract (Pact), container (Testcontainers), performance, and UI tests — built as an SDET interview coding test and now maintained as a learning project.

## Core Value

The single trade-off that must always work: given valid input, `Stock.returnIndicesMaxProfit` returns the index set with the maximum `Σ(sell−buy)` that fits in `savings`, preferring the combination with the smallest `Σ(buy)` on ties. Everything else — UI polish, deployment ergonomics, ops hardening — is in service of making that one answer provably correct under a wide range of testing strategies.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. Inferred from .planning/codebase/ARCHITECTURE.md, STRUCTURE.md, TESTING.md, and CONCERNS.md (mapped 2026-08-22, commit 97e0098c). -->

- ✓ `POST /api/calculate` accepts `{savings, buyPrices, sellPrices, companyNames?}` and returns `{maxProfit, indices, savingsUsed, remainingSavings, companyNames}` — existing (CalculatorController:65, CalculationRequest, CalculationResult)
- ✓ `GET /api/health` returns `"OK"` with HTTP 200 — existing (CalculatorController:94, used by Dockerfile HEALTHCHECK and ContainerTests)
- ✓ Bean validation enforces `savings ∈ [1, 1000]` and non-empty `buyPrices`/`sellPrices`; failures → HTTP 400 via `GlobalExceptionHandler` — existing (CalculationRequest:3-6, GlobalExceptionHandler:15)
- ✓ Static `Stock.returnIndicesMaxProfit` computes max-profit subset with tie-break on smallest `Σ(buy)` — existing (Stock.java:51, called by controller, Cucumber steps, Jqwik properties)
- ✓ React 19 SPA renders calculator, history (10-entry cap), sample inputs, testing-strategies documentation pages — existing (site/frontend/src/App.jsx, CalculatorPage, components/*)
- ✓ `HashRouter` chosen so deep links work on Render static host without SPA rewrite rule — existing (App.jsx:320, fix committed as #158)
- ✓ Backend validation errors clear when user corrects input — existing (frontend fix #159)
- ✓ Multi-test-strategy coverage: JUnit (ExampleBasedTests), Jqwik (PropertyBasedStockTests), Cucumber (MaxProfit.feature + StepDefinitions), PITest (`pitest` profile), Pact (LocalContractVerificationTest, PactBrokerVerificationTest), Testcontainers (ContainerTests), REST Assured (ApiPerformanceTests), Spring MockMvc (controller slice tests) — existing
- ✓ Performance thresholds enforced for 5/10/50/100 items and memory < 512 MB — existing (PerformanceTests.java:46-56, README §Performance Thresholds)
- ✓ Maven profiles gate slow tests: `container-tests`, `playwright-tests`, `performance-tests`, `contract-tests`, `pitest`, `dependency-check`, `sonar` — existing (pom.xml:57-327)
- ✓ GitHub Actions CI: `maven.yml` (build + test), `containers.yml` (Testcontainers), `contract-tests.yml` (Pact broker), `mega-linter.yml`, `nextjs.yml` — existing (.github/workflows/)
- ✓ Multi-stage Dockerfile (Temurin 25 JDK builder → 25 JRE Alpine runtime) with non-root `userA` and `curl`-based HEALTHCHECK — existing (Dockerfile)
- ✓ docker-compose local dev stack (`app` 9095 + `site` 3000) and Testcontainers harness (`docker-compose-test.yml`) — existing
- ✓ SpringDoc OpenAPI 2.3.0 / Swagger UI at `/api/swagger-ui.html` — existing (OpenApiConfig.java, application.properties:7)
- ✓ SonarQube, OWASP dependency-check, JaCoCo reporting — existing (pom.xml `sonar`/`dependency-check` profiles, JaCoCo reporting-only)
- ✓ Maven site reports copied to `site/frontend/public/reports/` for the Reports page — existing (`mvn site` workflow in AGENTS.md)
- ✓ `BUG-01` Integration test JSON keys match API contract (`savings`/`buyPrices`/`sellPrices`) — Phase 1 (ContainerTests.java:43-46)
- ✓ `BUG-02` API performance test JSON keys match API contract — Phase 1 (ApiPerformanceTests.java:78-82)
- ✓ `BUG-03` README curl example uses correct JSON keys — Phase 1 (README.md:109)
- ✓ `BUG-04` `CalculationRequest` enforces `@Size(max=100)` on `buyPrices`/`sellPrices` at the controller boundary; oversized inputs return 400 — Phase 1 (CalculationRequest.java + 2 new controller slice tests)
- ✓ `BUG-05` `shouldChoseCheapestCombination` → `shouldChooseCheapestCombination` typo fixed — Phase 1 (ExampleBasedTests.java:111)
- ✓ `BUG-06` `shouldReturnEmtyListAndZeroProfitIfOnlyLossCanBeMade` → `shouldReturnEmptyListAndZeroProfitIfOnlyLossCanBeMade` typo fixed — Phase 1 (ExampleBasedTests.java:91)
- ✓ `BUG-07` `StepDefinitions.logger` switched from `java.util.logging.Logger` to SLF4J — Phase 1 (StepDefinitions.java)
- ✓ `BUG-08` HashRouter footer only shows `API_BASE_URL` when same-origin or `VITE_SHOW_API_FOOTER=true` opt-in — Phase 1 (App.jsx + new `src/utils/apiFooter.js` + 8 Vitest unit tests)
- ✓ `BUG-09` `CalculationResult.getCompanyNames()` initialised to `Collections.emptyList()` in 4-arg and no-arg constructors — Phase 1 (CalculationResult.java + 4 new CalculationResultTests cases)
- ✓ `DRIFT-01` `contract-tests.yml` runs on every PR (removed `branches: ["main"]` filter on `pull_request`) — Phase 1 (contract-tests.yml:8-12)
- ✓ `PHASE-1-INFRA` Default `mvn test` excludes `LocalContractVerificationTest` and `PactBrokerVerificationTest` (gated by `-Pcontract-tests` like other IO-dependent tests) — Phase 1 (pom.xml:539-545)
- ✓ `ALGO-01` `Stock.returnIndicesMaxProfit` rewritten as a 2-D 0/1 knapsack DP — O(n · savings) — Phase 2 (Stock.java)
- ✓ `ALGO-02` DP returns the smallest-cost subset achieving max profit (tie-break preserved) — Phase 2 (Stock.java, new `shouldPreferSmallestCostAmongProfitTies` test)
- ✓ `ALGO-03` `Helper.java` removed — no longer reachable from the new algorithm — Phase 2
- ✓ `ALGO-04` Example-based, property-based (jqwik), controller slice, performance, and contract tests all pass against the new engine — Phase 2 (two Cucumber scenarios updated: 'Max Profit with same amount of savings with multiple combinations' now expects [0,2] instead of [1,2]; 'Random Scenario' now expects profit 11 instead of 7 — the old brute-force algorithm couldn't find the profit-11 subset, the DP does)
- ✓ `ALGO-05` Performance thresholds tightened: 50 items < 50 ms (down from 500 ms); 100 items < 500 ms (down from 10 s) — verified in CI — Phase 2 (PerformanceTests.java)

### Active

<!-- Current scope being built toward in this milestone. Each maps to a roadmap phase. -->

**Phase 3 — Rate-limit `/api/calculate` with Bucket4j:**
- [ ] **SEC-01**: Bucket4j filter or interceptor on `/api/calculate` enforces per-IP rate limit (default `10 req/sec`, `60 req/min`) — closes the anonymous-DoS vector identified in CONCERNS.md:129-134
- [ ] **SEC-02**: Rate-limited requests return HTTP 429 with a JSON `{"message": "Rate limit exceeded"}` body — consistent with the existing 400 shape from `GlobalExceptionHandler`
- [ ] **SEC-03**: Rate-limit thresholds read from `application.properties` (e.g. `app.ratelimit.capacity=10`, `app.ratelimit.refill-per-second=10`, `app.ratelimit.refill-per-minute=60`) — config-driven so they can be tuned without a redeploy of code paths
- [ ] **SEC-04**: Health endpoint (`/api/health`) is exempt from rate limiting — must always answer for Docker HEALTHCHECK and load balancers
- [ ] **SEC-05**: Property-based test (Jqwik) generates request-burst sequences and asserts that requests beyond the configured limit are rejected with 429 — proves the limit holds under fuzzed traffic patterns
- [ ] **SEC-06**: Existing example-based, BDD, controller slice, and contract tests still pass with the new filter in place

**Phase 3 — Rate-limit `/api/calculate` with Bucket4j:**
- [ ] **SEC-01**: Bucket4j filter or interceptor on `/api/calculate` enforces per-IP rate limit (default `10 req/sec`, `60 req/min`) — closes the anonymous-DoS vector identified in CONCERNS.md:129-134
- [ ] **SEC-02**: Rate-limited requests return HTTP 429 with a JSON `{"message": "Rate limit exceeded"}` body — consistent with the existing 400 shape from `GlobalExceptionHandler`
- [ ] **SEC-03**: Rate-limit thresholds read from `application.properties` (e.g. `app.ratelimit.capacity=10`, `app.ratelimit.refill-per-second=10`, `app.ratelimit.refill-per-minute=60`) — config-driven so they can be tuned without a redeploy of code paths
- [ ] **SEC-04**: Health endpoint (`/api/health`) is exempt from rate limiting — must always answer for Docker HEALTHCHECK and load balancers
- [ ] **SEC-05**: Property-based test (Jqwik) generates request-burst sequences and asserts that requests beyond the configured limit are rejected with 429 — proves the limit holds under fuzzed traffic patterns
- [ ] **SEC-06**: Existing example-based, BDD, controller slice, and contract tests still pass with the new filter in place

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- **API key auth / OAuth / IP allowlist on `/api/calculate`** — the v1 hardening goal is rate-limiting only (closes DoS vector); adding auth introduces key issuance, rotation, and frontend integration work that is out of scope for this milestone
- **CORS centralisation (move `@CrossOrigin` list to `application.properties`)** — useful but already working correctly; deferred to a future hardening pass
- **Removing the wildcard CORS mapping in `WebConfig`** — overlaps with the above; deferred
- **Dockerfile pinning to JDK 17 builder/runtime** — current JDK 25 builder produces correct Java 17 bytecode; pinning is a cleanup, not a correctness issue; deferred
- **Removing the unbounded `CompanyNameGenerator.GENERATED_NAMES` cache** — slow heap leak in long-running processes but irrelevant on Render free-tier dynos that recycle frequently; deferred
- **Enabling checkstyle `JavadocMethod`/`JavadocType` on public APIs** — improves docs but churn-heavy; deferred
- **Deduplicating the pact file at `src/test/resources/pacts/` and `site/frontend/pacts/`** — drift risk is mitigated by DRIFT-01 above (broker verification on every PR); physical dedup is a separate cleanup
- **Adding new product features (multi-day trading, portfolio rebalancing, transaction costs, multi-currency)** — explicitly not selected from the v1 options; the project's stated scope is the single-trade max-profit calculator
- **Mobile app, OAuth login, real-time updates** — never on the v1 menu for this project
- **Performance benchmarking beyond what falls out of the DP rewrite** — explicitly not in scope; the tightened thresholds in ALGO-05 are the only perf-test changes
- **Updating Spring Boot 3.5.13 → newer minor** — current version works; bumping is a separate maintenance task

## Context

- **Brownfield project** with a comprehensive codebase map at `.planning/codebase/` (ARCHITECTURE, CONCERNS, CONVENTIONS, INTEGRATIONS, STACK, STRUCTURE, TESTING — mapped 2026-08-22 at commit `97e0098c`). All implementation decisions in this milestone start from the existing structure, not a greenfield design.
- **Origin story:** Created as an SDET coding interview challenge; README.md:4 explicitly calls this out. Subsequent commits have grown it into a learning/testing-strategy showcase.
- **Deployment target:** Render free tier. Backend `app` (port 9095) and frontend `site` (port 3000 mapped to nginx 80) are deployed as separate services. Free-tier dynos sleep after inactivity, producing 30-60 s cold starts on first hit — already mitigated in the SPA via a 25 s `API_REQUEST_TIMEOUT_MS` and a cold-start banner (App.jsx:20, 256-266).
- **Production URL:** `https://max-profit-frontend.onrender.com` (frontend), backend at `https://max-profit-calculator.onrender.com` (referenced as the fallback in App.jsx:25-27).
- **Frontend constraint:** `HashRouter` is mandated by the Render static-site deployment (no SPA rewrite rule available). Any new frontend feature must work under hash routing.
- **Testing-stack breadth is a feature:** the project's pitch is "look at all these testing strategies"; no phase should drop a test category unless explicitly justified.
- **Known issues (per CONCERNS.md) outside this milestone's scope** are listed in Out of Scope above.

## Constraints

- **Java 17** — `pom.xml:23-25` sets source/target compatibility; `Dockerfile` runs on Temurin JRE 25 (forward-compatible); code must remain Java 17 source.
- **Spring Boot 3.3.11 / 3.5.13** — declared in `pom.xml`; do not bump without a separate migration task.
- **Testing-strategy breadth** — every phase must keep JUnit, Jqwik, Cucumber, PITest, Pact, Testcontainers, REST Assured, and Spring MockMvc coverage intact for the touched code. Removing a test category requires explicit justification in the Key Decisions table.
- **Maven profile gating** — slow tests (Container, Playwright, API performance, Contract broker) stay behind profiles; default `mvn test` must remain < 5 min on CI.
- **Bean validation on the boundary** — input shape (`savings` range, list size, non-null/non-empty) is enforced by `jakarta.validation` annotations on `CalculationRequest`; the engine layer assumes validated input and throws `IllegalArgumentException` if it ever sees otherwise.
- **Pact broker URL and token** are CI secrets (`pactbroker.url`, `pactbroker.auth.token`); broker must work with both `pactbroker.host` (local) and `pactbrokerurl` (CI) property names per the alignment note in CONCERNS.md:175-179.
- **Render free-tier single-instance deployment pattern** — no horizontal scaling, no shared state. Adding stateful features is out of scope.
- **Backwards compatibility within the project:** the calculator is single-purpose with no external API consumers beyond the project's own SPA and contract tests; API field names can be renamed cleanly.

## Key Decisions

| Decision                                                             | Rationale                                                                                                                                                                                                            | Outcome   |
|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| Algorithm approach: DP / knapsack (1-D over `savings`)               | O(n · savings) is provably polynomial; standard interview answer; cleaner code than branch-and-bound; preserves tie-break semantics via reconstruction; enables the tightened performance thresholds in ALGO-05      | — Pending |
| Hardening scope: rate-limit only (Bucket4j), no auth                 | Closes the documented DoS vector (CONCERNS.md:129-134) with minimum surface; no frontend changes needed; no key-issuance story to invent                                                                             | — Pending |
| JSON drift prevention: Pact broker verification on every PR          | The producer-pact mismatch identified in CONCERNS.md:82-89 is exactly what `PactBrokerVerificationTest` is designed to catch; the workflow already exists (`.github/workflows/contract-tests.yml`); minimal new code | — Pending |
| Sequencing: one phase per thread (bug fixes → algorithm → security)  | Each phase has a clean verifier-checkable boundary; bug fixes unblock the broken tests so subsequent phases have a green baseline                                                                                    | — Pending |
| Tighten performance thresholds in ALGO-05 only, no broader perf work | Demonstrates the project's "performance testing" theme; doesn't expand scope into benchmarking infrastructure                                                                                                        | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-22 after Phase 2 completion*