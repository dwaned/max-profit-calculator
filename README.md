# max-profit-calculator

[![Build & tests](https://github.com/dwaned/max-profit-calculator/actions/workflows/maven.yml/badge.svg)](https://github.com/dwaned/max-profit-calculator/actions/workflows/maven.yml)
[![Frontend CI](https://github.com/dwaned/max-profit-calculator/actions/workflows/frontend.yml/badge.svg)](https://github.com/dwaned/max-profit-calculator/actions/workflows/frontend.yml)
[![Contract tests](https://github.com/dwaned/max-profit-calculator/actions/workflows/contract-tests.yml/badge.svg)](https://github.com/dwaned/max-profit-calculator/actions/workflows/contract-tests.yml)
[![Containers](https://github.com/dwaned/max-profit-calculator/actions/workflows/containers.yml/badge.svg)](https://github.com/dwaned/max-profit-calculator/actions/workflows/containers.yml)

_This started as a coding test for an SDET interview process._

It is now a learning project and testing ground for software testing strategies.
A small "Max Profit Calculator" (Spring Boot API + React UI) is the system under test,
and the repository demonstrates many testing levels around it, from property-based
and mutation testing to consumer-driven contracts and browser tests.

- **App:** <https://max-profit-frontend.onrender.com>
- **API:** <https://max-profit-calculator.onrender.com/api> ([Swagger UI](https://max-profit-calculator.onrender.com/api/swagger-ui.html))
- **Test reports:** <https://dwaned.github.io/max-profit-calculator/reports/> (Maven site: tests, coverage, mutation, checkstyle) and the [Playwright report](https://dwaned.github.io/max-profit-calculator/playwright-report/)

The Render free tier sleeps when idle, so the first request can take ~30 s.

## The problem

Given the current price and a (fictitiously known) future price for a list of stocks,
and an amount of savings, choose which stocks to buy so that the total profit is as
large as possible without spending more than the savings. Each stock can be bought at
most once, so this is a **0/1 knapsack** problem, solved with dynamic programming in
O(n · savings) (`Stock.java`).

**Inputs**
- `savings`: the budget (integer)
- `buyPrices`: current prices, one per stock, identified by index
- `sellPrices`: future prices, matched to `buyPrices` by index
- `companyNames` (optional): display names; random ones are generated when omitted

**Outputs**
- `indices`: the chosen stocks (0-based)
- `maxProfit`, `savingsUsed`, `remainingSavings`, `companyNames`

**Example:** savings `5`, buy `[4,1,3]`, sell `[5,2,6]` → indices `[1,2]`, profit `4`
(spending 4 of the 5). Indices `0` and `1` would give a profit of 2; index `0` alone, 1.

### Business rules

- Among combinations with the maximum profit, the one using the **least savings** is returned.
- If no combination makes a profit, the result is an empty list with profit `0`.
- Savings: 1–1000. Prices: 1–1000. Stocks per request: 1–100. Company names: up to 100, each up to 100 characters.

## Architecture

| Part | Stack | Where it runs |
|---|---|---|
| Backend API | Java 25, Spring Boot 4.1 (Spring MVC, validation, actuator, springdoc), Bucket4j | Render web service (`Dockerfile`), behind Cloudflare |
| Frontend | React 19, Vite, Tailwind CSS, framer-motion | Render static site (`site/frontend`) |
| Test reports | Maven site + Playwright HTML report | GitHub Pages (`.github/workflows/reports.yml`) |

The API is served under the `/api` context path on port 9095:

- `POST /api/calculate`: the calculation. Invalid input returns `400` with `{"message": "Invalid input: …"}`.
- `GET /api/health`: returns `OK`.
- `GET /api/swagger-ui.html` and `/api/v3/api-docs`: OpenAPI docs.
- `GET /api/actuator/health` and `/api/actuator/prometheus`: health and metrics.

`/api/calculate` is rate limited per client IP (10 requests, refilling 10 per second).
Behind Cloudflare the client IP comes from `CF-Connecting-IP`. CORS allows the
production frontend and the local development origins (`app.cors.allowed-origins`).

## Running locally

Requirements: Java 25, Maven 3.9+, Node.js 24 (for the frontend), Docker (optional).

```bash
# Backend on http://localhost:9095/api
mvn spring-boot:run

# Frontend dev server on http://localhost:5173 (proxies /api to :9095)
cd site/frontend && npm ci && npm run dev

# Or everything in Docker: API on :9095, UI on http://localhost:3000
docker compose up --build
```

```bash
curl -X POST http://localhost:9095/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"savings":5,"buyPrices":[4,1,3],"sellPrices":[5,2,6]}'
```

## Testing

See [TESTING_LEVELS.md](TESTING_LEVELS.md) for every test suite, the tools it uses, how to
run it and where CI runs it. In short:

```bash
mvn verify                    # checkstyle, unit, property-based, API/security and BDD tests + coverage gate
mvn test -Ppitest             # mutation testing (fails below a 90% mutation score)
mvn test -Pperformance-tests  # algorithm stress tests
mvn test -Pcontract-tests     # Pact provider verification (needs the API running on :9095)
mvn test -Pplaywright-tests   # browser test (needs the UI running; PLAYWRIGHT_BASE_URL)
mvn test -Pcontainer-tests    # Testcontainers + API performance (needs Docker)

cd site/frontend
npm run lint && npm run test:run   # ESLint + Vitest unit tests
npm run test:pact                  # Pact consumer tests
npm run test:ui                    # Playwright end-to-end tests (needs the UI running)
```

### Performance thresholds

| Input size | Threshold | Test |
|---|---|---|
| 5 items | < 10 ms | `StressTests` |
| 10 items | < 100 ms | `StressTests` |
| 50 items | < 500 ms | `StressTests`, `ApiPerformanceTests` (end-to-end through the API) |
| 100 items | < 10 s | `StressTests` |
| Memory, 100 items | < 512 MB | `StressTests` |

## CI/CD

| Workflow | When | What |
|---|---|---|
| `maven.yml` | PRs, `main` | `mvn verify`, mutation testing, Cucumber report; OWASP dependency check and dependency-graph submission on `main` |
| `frontend.yml` | PRs, `main` | ESLint, Vitest, production build |
| `contract-tests.yml` | same-repo PRs, `main` | Pact consumer tests → Pact Broker → provider verification → `can-i-deploy` (self-hosted runner) |
| `containers.yml` | `main` | Builds both images, Docker Scout (fails on critical CVEs), Playwright against the running stack |
| `reports.yml` | `main` | Builds the Maven site and Playwright report and deploys them to GitHub Pages |
| `mega-linter.yml` | PRs | MegaLinter, including zizmor for GitHub Actions security |

Dependabot opens weekly update PRs for Maven, npm, GitHub Actions and Docker images.
All actions are pinned to commit SHAs.
