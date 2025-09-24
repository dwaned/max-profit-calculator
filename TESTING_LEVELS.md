# Automated Testing Levels and Types

This document describes the actual automated tests and static analysis present in this project, along with the tools and files used at each level.

## 1. Static Tests

**Linting (Checkstyle)**
- Java code style and quality are enforced using Checkstyle.
- Configuration: `checkstyle.xml`, `checkstyle_suppressions.xml`
- Run via Maven or IDE integration.

## 2. Unit Tests

Unit tests focus on individual components or functions in isolation.

- **Property-based Tests**: Implemented in `PropertyBasedStockTests.java` using the jqwik library. These tests generate random inputs to verify properties of the `Stock` class.
- **Example-based Tests**: Implemented in `ExampleBasedTests.java` and `CalculatorControllerTest.java` using JUnit. These tests use specific input values and check expected outputs.
- **Mutation Tests**: Configured via PIT (pitest) in `pom.xml`. Mutation testing checks the effectiveness of the test suite by introducing code mutations and verifying that tests fail as expected.

## 3. Integration Tests

Integration tests verify the interaction between multiple components or systems.

- **Container-Tests**: Implemented in `ContainerTests.java` using Testcontainers and RestAssured. These tests run services in Docker containers to simulate real-world environments and test API endpoints.

## 4. End-to-End (E2E) Tests

E2E tests simulate real user scenarios to validate the entire application stack, from the user interface to the backend and database.

- **UI Tests**: Implemented in `PlaywrightUITests.java` using Microsoft Playwright. These tests automate browser interactions to verify the application's UI and user flows.

---

Each testing level is implemented with specific tools and files in this project, providing comprehensive coverage and confidence in the software's correctness.
