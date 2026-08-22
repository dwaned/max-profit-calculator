# Roadmap: max-profit-calculator

**Defined:** 2026-08-22
**Project mode:** MVP (Vertical)

## Overview

Three phases, sequenced one-per-thread as decided in questioning. Each phase ships an end-to-end capability: CI green → polynomial algorithm → DoS protection.

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|-------------------|
| 1 | BugFixes | Restore CI green and tighten the API contract | BUG-01 → BUG-09, DRIFT-01 | 4 |
| 2 | Algorithm | Replace brute-force engine with polynomial DP, preserve tie-break semantics | ALGO-01 → ALGO-05 | 4 |
| 3 | SecurityHardening | Rate-limit `/api/calculate` with Bucket4j; close anonymous-DoS vector | SEC-01 → SEC-06 | 4 |

**Coverage:** 21/21 v1 requirements mapped · 0 unmapped ✓

---

### Phase 1: BugFixes
**Goal:** Restore CI green and tighten the API contract so all integration and contract tests pass against the actual producer API.
**Mode:** mvp
**UI hint:** yes (BUG-08 touches `site/frontend/src/App.jsx`)

**Requirements:** BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, BUG-06, BUG-07, BUG-08, BUG-09, DRIFT-01

**Success Criteria:**
1. `mvn test -Pcontainer-tests` passes (currently fails due to JSON key mismatch in ContainerTests.java:44-46)
2. `mvn test -Pcontract-tests` passes locally against the running provider with the published frontend pact
3. `mvn test` (default profile) passes with no test failures from any of the 10 bug/drift items
4. The README curl example executes successfully against a running backend (returns 200, not 400)
5. GitHub Actions CI for `maven.yml` and `contract-tests.yml` is green on a PR that touches any of the touched files

**Out of Scope (Phase 1 specific):**
- Any new feature, refactor, or perf work — strictly bug/drift fixes
- Pushing the broker pact on every PR by default — only verify locally + the workflow change in DRIFT-01

---

### Phase 2: Algorithm
**Goal:** Replace the brute-force permutation engine with a 1-D dynamic program that preserves the documented tie-break semantics.
**Mode:** mvp
**UI hint:** no (backend-only — `Stock.java`, `Helper.java`, `PerformanceTests.java`)

**Requirements:** ALGO-01, ALGO-02, ALGO-03, ALGO-04, ALGO-05

**Success Criteria:**
1. `Stock.returnIndicesMaxProfit` runs in O(n · savings) — verifiable via timing on inputs where n=100, savings=1000 (currently O(2^n) ≈ 10 s; should drop below 500 ms)
2. All existing example-based, property-based, BDD tests pass unchanged (semantic equivalence, not implementation equivalence)
3. New performance thresholds hold in CI: 50 items < 50 ms, 100 items < 500 ms (tightened from 500 ms / 10 s)
4. `Helper.java` is removed from the source tree
5. The maximum-profit tie-break (prefer smallest `Σ(buy)`) is verified by a new test that constructs two distinct subset-ties and asserts the smaller-cost one is returned

**Out of Scope (Phase 2 specific):**
- Branch-and-bound or any non-DP variant
- Changing the input validation rules (`savings ∈ [1, 1000]`, price ∈ [1, 1000], list size ≤ 100) — those stay where they are
- Touching `CalculatorController` or the frontend — algorithm change is internal

---

### Phase 3: SecurityHardening
**Goal:** Rate-limit `/api/calculate` with Bucket4j per IP so an anonymous caller cannot drive expensive calculations; keep `/api/health` and the legitimate client path unaffected.
**Mode:** mvp
**UI hint:** no (backend-only — Spring filter/interceptor + tests)

**Requirements:** SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06

**Success Criteria:**
1. A burst of >10 requests/sec from a single IP returns HTTP 429 with the documented JSON body shape `{"message": "Rate limit exceeded"}`
2. `GET /api/health` is not rate-limited — Docker HEALTHCHECK and load-balancer probes always succeed
3. Rate-limit thresholds are configurable via `application.properties` (`app.ratelimit.capacity`, `app.ratelimit.refill-per-second`, `app.ratelimit.refill-per-minute`)
4. Jqwik property-based test generates request-burst sequences and asserts that requests beyond the configured limit are rejected with 429
5. Existing example-based, BDD, controller-slice, and contract tests pass with the new filter in place

**Out of Scope (Phase 3 specific):**
- API key, OAuth, IP allowlist, or any auth scheme (deferred to v2 AUTH-01..03)
- Rate limiting on `/api/health` (must remain open)
- Distributed rate limiting across multiple instances (Render free tier is single-instance anyway)
- Metrics/observability infrastructure (deferred to v2 OBS-01..02)

---

## Phase Ordering Rationale

Sequenced in the order decided during questioning: bug fixes first because two integration tests currently fail on first run and CI is therefore not a clean baseline for the other phases; algorithm second because it's the deepest technical change and benefits from a green CI; security third because rate-limiting is additive — it doesn't require any other change to be in place.

## Risks

- **Phase 1 — JSON key rename could break users of the deployed API.** Mitigated by the project's single-purpose nature (the only consumer is the project's own SPA, which is updated in lock-step). No external API consumers documented.
- **Phase 2 — DP must preserve tie-break semantics exactly.** Mitigated by ALGO-04 (existing tests must pass unchanged) and the explicit tie-break test added in success criterion #5.
- **Phase 3 — Bucket4j is a new dependency, so build cache and OWASP dependency-check must stay clean.** Mitigated by including `dependency-check` in the success criteria verification.

---
*Roadmap defined: 2026-08-22*
*Project mode: MVP (Vertical)*