# max-profit-calculator
[![MegaLinter](https://github.com/dwaned/max-profit-calculator/actions/workflows/mega-linter.yml/badge.svg)](https://github.com/dwaned/max-profit-calculator/actions/workflows/mega-linter.yml)

_This was a coding test for an SDET interview process._

```
TLDR: The aim is to use this repo as a playground for applying
various testing tools/techniques in different levels, on top of a simple application.
```

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

