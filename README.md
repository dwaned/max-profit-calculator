# max-profit-calculator
[![MegaLinter](https://github.com/dwaned/max-profit-calculator/actions/workflows/mega-linter.yml/badge.svg)](https://github.com/dwaned/max-profit-calculator/actions/workflows/mega-linter.yml)

_This was a coding test for an SDET interview process._

```
TLDR: This repository serves as a learning project and a testing ground for exploring and implementing various software testing strategies.
It features a simple "Max Profit Calculator" application as the subject of these tests.
The goal is to demonstrate different testing approaches and their effectiveness in ensuring code quality and correctness.
```

## Project Description

The Max Profit Calculator determines the maximum profit that can be obtained by buying and selling a stock once, given an array of stock prices where each index represents a point in time.

## Testing Strategies

This project showcases a range of testing strategies, including:

* **Unit Testing:** Using JUnit to test individual units (classes and methods) of the application in isolation.
* **Integration Testing:**  Verifying the interaction between different components of the application.
* **End-to-End Testing:** Employing Cucumber to test the application's behavior from start to finish, simulating user interactions.
* **Property-Based Testing:** Utilizing Jqwik to generate test cases based on properties and constraints, enabling broader test coverage.
* **Mutation Testing:** Applying PITest to assess the effectiveness of the test suite by introducing small changes to the code and checking if tests can detect them.

## Tools and Technologies

* **Java:** The primary programming language for the application.
* **JUnit:**  Framework for unit testing.
* **Cucumber:** Framework for behavior-driven development and end-to-end testing.
* **Jqwik:**  Library for property-based testing.
* **PITest:**  Mutation testing tool.
* **Gradle:** Build automation tool.
* **GitHub Actions:**  Continuous integration and continuous delivery (CI/CD) platform for automating the build, test, and deployment pipeline.

## Getting Started

1. **Clone the repository:** `git clone https://github.com/dwaned/max-profit-calculator.git`
2. **Build the project:**  `mvn clean install`
3. **Run the tests:** `mvn test -Pcontainertest`

-----

**Challenge:**
- Given 2 Arrays containing the current price and the forecasted future price of a set of stocks,
- When a value of savings is entered
- Then the system should output which combination of indices from the first Array to choose so that with the available savings amount, the maximum profit is returned.

**The inputs are:**
- Savings: An Integer representing a monetary value
- Current Prices: A list of 1 or more stock prices, only identified by the index in the list
- Future Prices: Yeah... in this fictitious world, the system knows the future expected prices of the stock
    corresponding by index to the current prices list.

**The outputs are:**
- A list of 0 or more indices corresponding to the combination of current prices stocks that would give the
    maximum profit based on the available savings
- An integer value of the maximum profit returned with the combination of indices

**Example:**

- Savings value: 5
- Current prices Array [4,1,3]
- Future prices Array [5,2,6]

Result should be [1,2] (Remember that starting index is 0)
Choosing indices at 1 and 2 will return profit of 4, even if total used amount is 4 (from the savings of 5)
Choosing indices at 0 and 1 would give return profit of 2.
Choosing only index 4 would give return profit of 1.
No other combinations is possible.


## **"Business Requirements"**


To be able to better solve the challenge, I have decided to come up with these requirements to help me define the
code and tests better.

- System chooses the max profit with the least amount of savings used.
- If multiple combinations with same amount of savings exist, it returns them all.
- If loss is only possible, return empty list and max profit 0.
- Savings is a positive Integer only.
- Min/Max Stock Price - 1 to 1000
- Min/Max Savings - 1 to 1000
- Min/Max Stocks in list - 1 to 100

