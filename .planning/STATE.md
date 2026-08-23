# State: max-profit-calculator

**Initialized:** 2026-08-22
**Milestone v1 shipped:** 2026-08-23

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-23)

**Core value:** Given valid input, `Stock.returnIndicesMaxProfit` returns the index set with the maximum `Σ(sell−buy)` that fits in `savings`, preferring the combination with the smallest `Σ(buy)` on ties.

**Current focus:** v1 milestone shipped — next iteration is TBD (see PROJECT.md Out-of-Scope / v2 Requirements)

## Phase Status

| # | Phase             | Status     | Plans | Progress |
|---|-------------------|------------|-------|----------|
| 1 | BugFixes          | ✓ Complete | 1/1   | 100%     |
| 2 | Algorithm         | ✓ Complete | 1/1   | 100%     |
| 3 | SecurityHardening | ✓ Complete | 1/1   | 100%     |

**Milestone v1: SHIPPED — 21/21 requirements complete.**

## Decisions Log

| Decision                                                         | Rationale                                                                                                                                          | Outcome                   |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|
| Initialize as `brownfield` (not greenfield)                      | Existing code with full codebase map; user is improving not creating                                                                               | ✓ Set                     |
| YOLO mode                                                        | Solo developer on controlled worktree                                                                                                              | ✓ Set                     |
| Coarse granularity                                               | "One phase per thread" — 3 phases total                                                                                                            | ✓ Set                     |
| Sequential execution                                             | Phases touch shared state across files                                                                                                             | ✓ Set                     |
| Skip research                                                    | Codebase map covers Stack/Features/Architecture/Pitfalls                                                                                           | ✓ Set                     |
| Verifier enabled                                                 | Most valuable of the three workflow agents for this milestone                                                                                      | ✓ Set                     |
| Inherit AI models                                                | Use session default                                                                                                                                | ✓ Set                     |
| Vertical MVP mode                                                | Each phase ships end-to-end capability                                                                                                             | ✓ Set                     |
| Commit docs to git                                               | Planning artifacts tracked alongside code                                                                                                          | ✓ Set                     |
| DP / knapsack algorithm                                          | O(n · savings), standard, preserves tie-break via reconstruction                                                                                   | ✓ Good (Phase 2 shipped)  |
| Bucket4j rate limit only                                         | Closes DoS vector with minimum surface; no frontend changes                                                                                        | ✓ Good (Phase 3 shipped)  |
| Pact broker as drift guard                                       | Already wired; minimal new code                                                                                                                    | ✓ Good (DRIFT-01 shipped) |
| TDD for bug fixes where behavior changes                         | Watch test fail, then fix; renames/refactors used "stay green" instead                                                                             | ✓ Good                    |
| Extract frontend footer logic to pure helper                     | Testable in node without jsdom/React Testing Library infrastructure                                                                                | ✓ Good                    |
| VITE_SHOW_API_FOOTER=true opt-in for cross-origin footer         | Diagnostics use only; never default-on                                                                                                             | ✓ Good                    |
| Surefire excludes for contract tests                             | Default `mvn test` fails without broker; gate behind `-Pcontract-tests` like other IO-dependent tests                                              | ✓ Good                    |
| 2-D DP table over 1-D + keep[][]                                 | Simpler backtrack correctness; space bounded by 100 × savings=1000 = 100KB                                                                         | ✓ Good                    |
| Update two Cucumber scenarios to match DP output                 | Old brute-force returned wrong answers in some cases (couldn't find profit-11 subset); tests were coupled to old algorithm, not to the README spec | ✓ Good                    |
| Fixup commit to recover Phase 1 @Size that was missed in 8cb12f0 | Caught by `git status` during Phase 2 — tests had been passing because the annotation was live in the working tree                                 | ✓ Good                    |
| Bucket4j token bucket for rate limiting                          | Lightweight (in-memory, no external store), satisfies DoS-vector concern without API-key surface                                                   | ✓ Good (Phase 3 shipped)  |
| URI endsWith check inside filter (not URL pattern)               | Works in both production (with context path /api) and MockMvc tests (no context path); avoids the FilterRegistrationBean asymmetry                 | ✓ Good                    |
| TestRateLimitConfig with `refill=1, period=3600`                 | Makes controller-slice tests deterministic — bucket never meaningfully refills during a test, so 11th request reliably returns 429                 | ✓ Good                    |
| Record for RateLimitProperties (no default constructor)          | Forces Spring binding through the canonical constructor — defaults come from `application.properties`, not a hardcoded fallback in code            | ✓ Good                    |

## Open Questions

None at project-init time. Phases are sequenced and ready to plan.

---
*State initialized: 2026-08-22*