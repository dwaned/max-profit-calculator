# AGENTS.md - Agentic Coding Guidelines

## Build Commands

```bash
# Build the project
mvn clean compile

# Package the application
mvn clean package

# Run the application
mvn spring-boot:run
```

## Report Commands

CI publishes the reports to GitHub Pages on every relevant push to `main`
(`.github/workflows/reports.yml`):

- Maven site: `https://dwaned.github.io/max-profit-calculator/reports/`
- Playwright HTML report: `https://dwaned.github.io/max-profit-calculator/playwright-report/`

The frontend's Reports page links there (override with `VITE_REPORTS_URL`).
Generated reports are never committed.

For a manual local run:

```bash
# Generate all reports (skipping integration tests + slow pitest mutation run)
mkdir -p target/pit-reports && \
  printf '<!DOCTYPE html><html><body><p>skipped</p></body></html>' \
    > target/pit-reports/index.html
mvn -DskipITs -Dpitest.skip=true verify site
```

Then open `target/site/index.html` in the browser.

## Test Commands

```bash
# Run all tests (excludes container and playwright tests)
mvn test

# Run a specific test class
mvn test -Dtest=ExampleBasedTests
mvn test -Dtest=PropertyBasedStockTests
mvn test -Dtest=CalculatorControllerTest

# Run a specific test method
mvn test -Dtest=ExampleBasedTests#shouldWorkWithOneIndex

# Run container tests (requires Docker)
mvn test -Pcontainer-tests

# Run Playwright UI tests and the BDD acceptance scenarios (UI must be running)
mvn test -Pplaywright-tests

# Run contract tests (Pact) - Backend provider verification
mvn test -Pcontract-tests

# Run contract tests with Pact Broker publishing
mvn test -Pcontract-tests -Dpactbroker.url=https://your-broker-url -Dpactbroker.auth.token=your-token

# Run frontend contract tests (Pact consumer)
cd site/frontend && npm run test:pact

# Publish frontend contracts to broker
cd site/frontend && npx pact-broker publish pacts/ --broker-base-url=https://no-company-399294d1.pactflow.io --broker-token=your-token

# Run mutation testing with PITest
mvn test -Ppitest

# Run OWASP dependency check
mvn verify -Pdependency-check
```

## Lint Commands

```bash
# Run checkstyle
mvn checkstyle:check

# Run checkstyle with reporting
mvn checkstyle:checkstyle

# Generate project site with reports
mvn site
```

## Code Style Guidelines

### Java Version
- **Java 25** (LTS) is required; Spring Boot 4.1
- `java.version` in pom.xml sets the compiler release

### Imports
- Use explicit imports (no wildcard imports)
- Group imports: java.*, then javax.*, then third-party libraries, then project imports
- SLF4J for logging: `import org.slf4j.Logger; import org.slf4j.LoggerFactory;`

### Formatting
- Indentation: 4 spaces (no tabs)
- Line length: 120 characters (checkstyle enforces this)
- Braces: Opening brace on same line (K&R style)
- Use `@SuppressWarnings("checkstyle:LineLength")` when necessary for long strings

### Naming Conventions
- Classes: PascalCase (e.g., `CalculationResult`, `Stock`)
- Methods: camelCase (e.g., `getMaxProfit`, `returnIndicesMaxProfit`)
- Variables: camelCase (e.g., `maxProfit`, `currentValue`)
- Constants: UPPER_SNAKE_CASE (e.g., `LOGGER`, `priceListMaxSize`)
- Private static final logger: `LOGGER`

### Types
- Use `final` keyword for method parameters and local variables where possible
- Use `final` class for utility classes with private constructor
- Prefer interfaces in declarations: `List<Integer>` instead of `ArrayList<Integer>`
- Use generics properly with type safety

### Error Handling
- Use Spring's `ResponseStatusException` for HTTP status codes in controllers
- Return empty result objects instead of null for business logic errors
- Use `IllegalArgumentException` for invalid input validation
- Log errors appropriately with SLF4J at appropriate levels

### Testing
- Use JUnit Jupiter (JUnit 6) for all tests
- Test classes: PascalCase ending with `Tests` or `Test`
- Test methods: descriptive camelCase starting with `should`
- Use `@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength"})` in test classes
- Property-based tests use Jqwik
- BDD acceptance scenarios use Cucumber, automated end-to-end through the UI with Playwright

### Documentation
- Javadoc for public classes and methods
- Use `{@link}` for referencing other classes
- Document parameters with `@param`
- Document return values with `@return`

### Spring Boot Conventions
- Use constructor injection (not field injection)
- Use `@RestController` for REST endpoints
- Use `@RequestMapping` at class level for base path
- Use specific HTTP method annotations (`@GetMapping`, `@PostMapping`)
- Return `ResponseEntity` for full control over HTTP responses when needed

### Checkstyle
- Configuration in `checkstyle.xml` and `checkstyle_suppressions.xml`
- Run `mvn checkstyle:check` before committing
- Some rules are suppressed via annotations when necessary

### Build Tools
- Maven is the build tool (not Gradle as mentioned in old README)
- Use Maven wrapper if available: `./mvnw` or `mvnw.cmd`
- Minimum Maven version: 3.2.5

### GitHub Actions
- MegaLinter runs on pull requests
- Maven build and test on push/PR
- Container tests run separately

### Docker
- Dockerfile present for containerization
- docker-compose.yml for local development
- docker-compose-test.yml for testing

### Security
- Use OWASP dependency check to scan for vulnerabilities
- Keep dependencies updated
- Dependabot opens weekly update PRs; transitive versions with CVEs are pinned in pom.xml

### Project Structure
```
src/
  main/
    java/com/maxprofit/calculator/
      controller/    # REST controllers
      *.java         # Business logic classes
    resources/
  test/
    java/com/maxprofit/calculator/
      steps/         # Cucumber step definitions
      *Tests.java    # Test classes
    resources/
      com/maxprofit/calculator/
        *.feature    # Cucumber feature files
```
