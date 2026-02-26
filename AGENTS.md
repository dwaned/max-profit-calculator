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

```bash
# Generate site reports and copy to frontend
mvn site
mkdir -p site/frontend/public/reports/css site/frontend/public/reports/xref site/frontend/public/reports/xref-test site/frontend/public/reports/images
cp target/site/*.html site/frontend/public/reports/
cp -r target/site/css site/frontend/public/reports/
cp -r target/site/xref site/frontend/public/reports/
cp -r target/site/xref-test site/frontend/public/reports/
cp -r target/site/images site/frontend/public/reports/
```

Then open <http://localhost:5173/reports> in the browser.

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

# Run Playwright UI tests
mvn test -Pplaywright-tests

# Run mutation testing with PITest
mvn test -Ppitest

# Run with SonarQube analysis
mvn verify -Psonar

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
- **Java 17** is required
- Target and source compatibility is set to 17 in pom.xml

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
- Use JUnit 5 (Jupiter) for all tests
- Test classes: PascalCase ending with `Tests` or `Test`
- Test methods: descriptive camelCase starting with `should`
- Use `@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength"})` in test classes
- Property-based tests use Jqwik
- BDD tests use Cucumber

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
- Tomcat version is pinned to address CVEs

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
