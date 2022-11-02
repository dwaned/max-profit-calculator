# max-profit-calculator
This was a coding test for an interview process.


Challenge:
Given 2 Arrays containing the current price and the forecasted future price of a set of stocks,
When a value of savings is entered
Then the system should choose which combination of indices to choose so that from the given value of savings.
the maximum profit is returned.

Example:

Savings value: 5
Current prices Array [4,1,3]
Future prices Array [5,2,6]

Result should be [1,2] (Remember that starting index is 0)
Choosing indices at 1 and 2 will return profit of 4, even if total used amount is 4 (from the savings of 5)
Choosing indices at 0 and 1 would give return profit of 2.
Choosing only index 4 would give return profit of 1.
No other combinations is possible.

System chooses the max profit with the least used savings.
If multiple combinations with same amount of savings exist, it returns them all.
Savings is a positive Integer
