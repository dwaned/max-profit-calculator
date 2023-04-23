@Cucumber
Feature: Cucumber Tests for the Max Profit Calculator Engine
  This feature contains Regression tests that ensure the Max Profit Calculator Engine logic is not modified unexpectedly.
  These tests do not make use of the UI or the API, but rather test the logic of the Max Profit Calculator Engine.
  The main usage for these tests is to present the expected behavior of the Max Profit Calculator in a readable format.

Scenario: Max Profit obtained without using all savings
  Given I have 6 Euros of savings
  When Array of current stock prices are "4,1,3"
  And Array of future stock prices are "5,2,6"
  Then the best combination of indices for max profit is "1,2"
  And profit is 4 Euros

Scenario: Max Profit obtained with using all savings
  Given I have 10 Euros of savings
  When Array of current stock prices are "5,5,1"
  And Array of future stock prices are "9,9,4"
  Then the best combination of indices for max profit is "0,1"
  And profit is 8 Euros

Scenario: Max Profit obtained with using 1 index
  Given I have 10 Euros of savings
  When Array of current stock prices are "2,9,3"
  And Array of future stock prices are "5,20,7"
  Then the best combination of indices for max profit is "1"
  And profit is 11 Euros

Scenario: Max Profit with same amount of savings with multiple combinations
  Given I have 10 Euros of savings
  When Array of current stock prices are "5,5,1,9"
  And Array of future stock prices are "9,9,5,5"
  Then the best combination of indices for max profit is "1,2"
  And the best combination of indices for max profit is "0,2"
  And profit is 8 Euros

Scenario: Max Profit with multiple combinations but one with less used savings
  Given I have 10 Euros of savings
  When Array of current stock prices are "6,5"
  And Array of future stock prices are "9,8"
  Then the best combination of indices for max profit is "1"
  And profit is 3 Euros

Scenario: Savings is not enough for any stock price
  Given I have 10 Euros of savings
  When Array of current stock prices are "20,12"
  And Array of future stock prices are "4,33"
  Then there is no best combination for max profit
  And no profit is made

Scenario: Random Scenario
  Given I have 9 Euros of savings
  When Array of current stock prices are "2, 2, 2, 2, 2"
  And Array of future stock prices are "5, 14, 33, 6, 5"
  Then the best combination of indices for max profit is "1, 2, 3, 4"
  And same savings and max profit is achieved with the indices "0, 1, 2, 3"
  And profit is 50 Euros
