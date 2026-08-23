# Requirements: max-profit-calculator

**Defined:** 2026-08-22
**Core Value:** Given valid input, `Stock.returnIndicesMaxProfit` returns the index set with the maximum `Σ(sell−buy)` that fits in `savings`, preferring the combination with the smallest `Σ(buy)` on ties.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### BugFixes

- [ ] **BUG-01**: `ContainerTests` JSON keys match API contract (`savings`, `buyPrices`, `sellPrices`) — currently sends `savingsAmount`/`currentPrices`/`futurePrices`, causing 400 not 200 (ContainerTests.java:44-46)
- [ ] **BUG-02**: `ApiPerformanceTests` JSON keys match API contract — same drift (ApiPerformanceTests.java:79-82)
- [ ] **BUG-03**: README curl example uses correct JSON keys (`savings`, `buyPrices`, `sellPrices`) — currently documents the wrong contract (README.md:109)
- [ ] **BUG-04**: `CalculationRequest` enforces `@Size(max=100)` on `buyPrices`/`sellPrices` at the controller boundary — currently the 100-cap is silently enforced inside `Stock.java:94`, so 10 000-element inputs return 200 with empty indices instead of 400
- [ ] **BUG-05**: Typo fix — `shouldChoseCheapestCombination` → `shouldChooseCheapestCombination` (ExampleBasedTests.java:111)
- [ ] **BUG-06**: Typo fix — `shouldReturnEmtyListAndZeroProfitIfOnlyLossCanBeMade` → `shouldReturnEmptyListAndZeroProfitIfOnlyLossCanBeMade` (ExampleBasedTests.java:91)
- [ ] **BUG-07**: `StepDefinitions.logger` switched from `java.util.logging.Logger` to SLF4J `Logger` to match the rest of the codebase (steps/StepDefinitions.java:26)
- [ ] **BUG-08**: HashRouter footer only prints `API_BASE_URL` when it matches `window.location.origin` or is explicitly enabled — currently the footer can mislead about which API the page is using (App.jsx:311, App.jsx:25-27)
- [ ] **BUG-09**: `CalculationResult.getCompanyNames()` initialised to `Collections.emptyList()` in the four-arg constructor — currently can return `null` (CalculationResult.java:40, :62), forcing every caller to null-check
- [ ] **DRIFT-01**: `PactBrokerVerificationTest` runs on every PR and fails CI when the published frontend pact doesn't match the producer API contract — currently the broker workflow exists but doesn't gate every PR

### Algorithm

- [ ] **ALGO-01**: `Stock.returnIndicesMaxProfit` rewritten as a 1-D dynamic program over `savings ∈ [1, 1000]` using `currentValue`/`futureValue` deltas — O(n · savings) worst case (replaces the current O(2^n) permutation approach in Stock.java:79-180)
- [ ] **ALGO-02**: DP returns the full set of indices that tie for maximum profit with the smallest `Σ(buy)` — preserves the documented tie-break (Requirement section in README:152-163)
- [ ] **ALGO-03**: `Helper.java` removed — no longer needed once the algorithm uses DP
- [ ] **ALGO-04**: All existing example-based, property-based, BDD, and performance tests pass unchanged (semantic equivalence, not implementation equivalence)
- [ ] **ALGO-05**: Performance thresholds tightened: 50 items < 50 ms (down from 500 ms); 100 items < 500 ms (down from 10 s) — possible because DP is polynomial; the old thresholds were forced by the brute-force algorithm

### SecurityHardening

- [ ] **SEC-01**: Bucket4j filter or interceptor on `/api/calculate` enforces per-IP rate limit (default `10 req/sec`, `60 req/min`) — closes the anonymous-DoS vector identified in CONCERNS.md:129-134
- [ ] **SEC-02**: Rate-limited requests return HTTP 429 with a JSON `{"message": "Rate limit exceeded"}` body — consistent with the existing 400 shape from `GlobalExceptionHandler`
- [ ] **SEC-03**: Rate-limit thresholds read from `application.properties` (e.g. `app.ratelimit.capacity=10`, `app.ratelimit.refill-per-second=10`, `app.ratelimit.refill-per-minute=60`) — config-driven so they can be tuned without a redeploy of code paths
- [ ] **SEC-04**: Health endpoint (`/api/health`) is exempt from rate limiting — must always answer for Docker HEALTHCHECK and load balancers
- [ ] **SEC-05**: Property-based test (Jqwik) generates request-burst sequences and asserts that requests beyond the configured limit are rejected with 429 — proves the limit holds under fuzzed traffic patterns
- [ ] **SEC-06**: Existing example-based, BDD, controller slice, and contract tests still pass with the new filter in place

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Auth

- **AUTH-01**: API key in `X-API-Key` header for `/api/calculate` (separate from rate-limiting) — closes the residual leak vector if rate-limit thresholds are misconfigured
- **AUTH-02**: Key issuance story (single static key for v1, OAuth/device-flow later)
- **AUTH-03**: Frontend reads key from `VITE_API_KEY` env var

### CORS

- **CORS-01**: Move `@CrossOrigin` origins list to `application.properties` as `app.cors.allowed-origins`
- **CORS-02**: Remove wildcard `allowedOrigins("*")` from `WebConfig`; restrict to `/api/health` or the configured origins

### Container

- **CONT-01**: Pin Dockerfile builder/runtime to `eclipse-temurin:17-jdk-alpine` / `eclipse-temurin:17-jre-alpine` (currently uses 25)
- **CONT-02**: Remove obsolete `version: "3.7"` from `docker-compose.yml`

### Code Hygiene

- **HYG-01**: Remove unbounded `CompanyNameGenerator.GENERATED_NAMES` cache (slow heap leak)
- **HYG-02**: Enable checkstyle `JavadocMethod`/`JavadocType` on public API classes (`CalculationRequest`, `CalculatorController`, `CalculationResult`)
- **HYG-03**: Deduplicate pact file at `src/test/resources/pacts/` vs `site/frontend/pacts/` — single canonical location
- **HYG-04**: Fix `Stock.returnIndicesMaxProfit` silent-failure pattern — collapse 5 error modes into one `CalculationResult(0, [], ...)`; should throw `IllegalArgumentException` for invalid input
- **HYG-05**: Demote `LOGGER.warn` inside the engine hot path to `LOGGER.debug` (Stock.java:147)

### Product Features

- **FEAT-01**: Multi-day trading (sequence of buy/sell decisions across time)
- **FEAT-02**: Portfolio rebalancing (multiple stocks, target allocation)
- **FEAT-03**: Transaction costs / fees per trade
- **FEAT-04**: Multi-currency support

### Infrastructure

- **INFRA-01**: Move off Render free tier (sleeps after 15 min idle, 30-60 s cold start) to a stateless compute (Cloud Run, Fly.io) — unblocks adding any stateful feature
- **INFRA-02**: Horizontal scaling with shared state store

### Observability

- **OBS-01**: Structured (JSON) logging
- **OBS-02**: Metrics: counter for `calculate` invocations, histogram for execution time, counter for 429 responses

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature                                            | Reason                                                                                                                |
|----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| API key / OAuth / IP allowlist on `/api/calculate` | Rate-limiting is sufficient for v1; auth adds key issuance + frontend integration that is out of scope this milestone |
| CORS centralization                                | Already working correctly; cleanup deferred to a hardening pass                                                       |
| Dockerfile JDK 17 pinning                          | Current JDK 25 builder produces correct Java 17 bytecode; pinning is a cleanup, not a correctness issue               |
| `CompanyNameGenerator` cache removal               | Slow heap leak but irrelevant on Render free-tier dynos that recycle frequently                                       |
| Checkstyle Javadoc enforcement                     | Improves docs but churn-heavy                                                                                         |
| Pact file deduplication                            | Drift risk is mitigated by DRIFT-01 (broker verification on every PR)                                                 |
| Mobile app                                         | Web-first, mobile never on the v1 menu for this project                                                               |
| Real-time updates / WebSocket                      | Not in product scope                                                                                                  |
| New testing strategy (chaos, fuzz, k6)             | Existing strategy stack already covers the project's stated goal; new strategy is a separate decision                 |
| Tightening performance thresholds beyond ALGO-05   | The DP-driven tightening is the only perf-test change in scope                                                        |
| Spring Boot minor version bump                     | Current 3.3.11 / 3.5.13 works; bumping is a separate maintenance task                                                 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 1 | Complete |
| BUG-02 | Phase 1 | Complete |
| BUG-03 | Phase 1 | Complete |
| BUG-04 | Phase 1 | Complete |
| BUG-05 | Phase 1 | Complete |
| BUG-06 | Phase 1 | Complete |
| BUG-07 | Phase 1 | Complete |
| BUG-08 | Phase 1 | Complete |
| BUG-09 | Phase 1 | Complete |
| DRIFT-01 | Phase 1 | Complete |
| ALGO-01 | Phase 2 | Complete |
| ALGO-02 | Phase 2 | Complete |
| ALGO-03 | Phase 2 | Complete |
| ALGO-04 | Phase 2 | Complete |
| ALGO-05 | Phase 2 | Complete |
| SEC-01 | Phase 3 | Complete |
| SEC-02 | Phase 3 | Complete |
| SEC-03 | Phase 3 | Complete |
| SEC-04 | Phase 3 | Complete |
| SEC-05 | Phase 3 | Complete |
| SEC-06 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

**Status as of 2026-08-23 (after Phase 3 completion):**
- Phase 1 (BugFixes): 10/10 Complete
- Phase 2 (Algorithm): 5/5 Complete
- Phase 3 (SecurityHardening): 6/6 Complete

**Milestone v1 complete.**

---
*Requirements defined: 2026-08-22*
*Last updated: 2026-08-22 after initial definition*