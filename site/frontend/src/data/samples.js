export const sampleDatasets = [
  {
    name: 'Basic',
    savings: 5,
    buyPrices: [1, 2, 5],
    sellPrices: [2, 3, 20],
    description: 'Three stocks, single optimal buy — the simplest possible scenario.',
  },
  {
    name: 'Multiple',
    savings: 10,
    buyPrices: [5, 5, 1, 9],
    sellPrices: [9, 9, 5, 5],
    description: 'Two optimal combinations exist with the same spend — tests tie-breaking.',
  },
  {
    name: 'Large',
    savings: 50,
    buyPrices: [1, 2, 5, 34, 22, 56, 34],
    sellPrices: [2, 3, 20, 35, 15, 101, 20],
    description: 'Seven stocks with a wide price range — exercises the knapsack search.',
  },
  {
    name: 'Loss Only',
    savings: 5,
    buyPrices: [5, 2, 3],
    sellPrices: [1, 0, 2],
    description: 'Every stock loses value — result should be empty indices and profit 0.',
  },
];
