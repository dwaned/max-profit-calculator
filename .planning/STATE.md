# State: max-profit-calculator

**Initialized:** 2026-08-22

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-22)

**Core value:** Given valid input, `Stock.returnIndicesMaxProfit` returns the index set with the maximum `Σ(sell−buy)` that fits in `savings`, preferring the combination with the smallest `Σ(buy)` on ties.

**Current focus:** Phase 1 — BugFixes

## Phase Status

| # | Phase | Status | Plans | Progress |
|---|-------|--------|-------|----------|
| 1 | BugFixes | ○ Pending | 0/? | 0% |
| 2 | Algorithm | ○ Pending | 0/? | 0% |
| 3 | SecurityHardening | ○ Pending | 0/? | 0% |

## Decisions Log

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Initialize as `brownfield` (not greenfield) | Existing code with full codebase map; user is improving not creating | ✓ Set |
| YOLO mode | Solo developer on controlled worktree | ✓ Set |
| Coarse granularity | "One phase per thread" — 3 phases total | ✓ Set |
| Sequential execution | Phases touch shared state across files | ✓ Set |
| Skip research | Codebase map covers Stack/Features/Architecture/Pitfalls | ✓ Set |
| Verifier enabled | Most valuable of the three workflow agents for this milestone | ✓ Set |
| Inherit AI models | Use session default | ✓ Set |
| Vertical MVP mode | Each phase ships end-to-end capability | ✓ Set |
| Commit docs to git | Planning artifacts tracked alongside code | ✓ Set |
| DP / knapsack algorithm | O(n · savings), standard, preserves tie-break via reconstruction | — Pending (Phase 2) |
| Bucket4j rate limit only | Closes DoS vector with minimum surface; no frontend changes | — Pending (Phase 3) |
| Pact broker as drift guard | Already wired; minimal new code | — Pending (Phase 1 DRIFT-01) |

## Open Questions

None at project-init time. Phases are sequenced and ready to plan.

---
*State initialized: 2026-08-22*