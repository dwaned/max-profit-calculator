import { useState, useRef } from 'react';

const SAMPLE_COMPANIES = [
  'Acme Corp',
  'Globex Inc',
  'Initech',
  'Umbrella Corp',
  'Stark Industries',
  'Wayne Enterprises',
  'Cyberdyne',
  'Soylent Corp',
  'Tyrell Corp',
  'Weyland-Yutani'
];

const SAVINGS_MIN = 1;
const SAVINGS_MAX = 1000;
const PRICE_MIN = 1;
const PRICE_MAX = 1000;

export default function CalculatorForm({ onCalculate, isLoading }) {
  const [savings, setSavings] = useState(10);
  const [buyPrices, setBuyPrices] = useState([5, 5, 10]);
  const [sellPrices, setSellPrices] = useState([15, 10, 35]);
  // Initialise lazily from the buyPrices length so the first render matches
  // state without a setState-in-effect cascade.
  const [companyNames, setCompanyNames] = useState(() =>
    SAMPLE_COMPANIES.slice(0, 3)
  );
  const [validationError, setValidationError] = useState(null);

  // Refs for the price inputs of each row, keyed by index. Lets us move
  // keyboard focus to the new row's first input after Add Stock (#19).
  const buyInputRefs = useRef([]);
  const savingsRef = useRef(null);

  const validate = (nextSavings = savings, nextBuy = buyPrices, nextSell = sellPrices) => {
    if (nextSavings < SAVINGS_MIN || nextSavings > SAVINGS_MAX) {
      return `Savings must be between ${SAVINGS_MIN} and ${SAVINGS_MAX}.`;
    }
    for (let i = 0; i < nextBuy.length; i++) {
      const buy = nextBuy[i];
      const sell = nextSell[i];
      if (buy === undefined || buy === null || buy === '' || Number(buy) < PRICE_MIN || Number(buy) > PRICE_MAX) {
        return `Row ${i + 1}: buy price must be between ${PRICE_MIN} and ${PRICE_MAX}.`;
      }
      if (sell === undefined || sell === null || sell === '' || Number(sell) < PRICE_MIN || Number(sell) > PRICE_MAX) {
        return `Row ${i + 1}: sell price must be between ${PRICE_MIN} and ${PRICE_MAX}.`;
      }
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validate();
    setValidationError(error);
    if (error) {
      return;
    }
    onCalculate({ savings, buyPrices, sellPrices, companyNames });
  };

  const handleSavingsChange = (value) => {
    setSavings(value);
    // Clear the validation error when savings is corrected into range,
    // so the banner doesn't keep shouting after the user fixes the input.
    if (value >= SAVINGS_MIN && value <= SAVINGS_MAX) {
      setValidationError(null);
    }
  };

  const updatePrice = (index, type, value) => {
    const parsed = value === '' ? '' : parseInt(value, 10);
    if (type === 'buy') {
      const next = [...buyPrices];
      next[index] = Number.isNaN(parsed) ? '' : parsed;
      setBuyPrices(next);
    } else {
      const next = [...sellPrices];
      next[index] = Number.isNaN(parsed) ? '' : parsed;
      setSellPrices(next);
    }
    // Same correction-clears-error behavior as savings: if the resulting
    // price is in range, drop any stale validation banner.
    const numeric = Number(parsed);
    if (!Number.isNaN(numeric) && numeric >= PRICE_MIN && numeric <= PRICE_MAX) {
      setValidationError(null);
    }
  };

  const addRow = () => {
    const newIndex = buyPrices.length;
    const newCompanies = [
      ...companyNames,
      SAMPLE_COMPANIES[companyNames.length] || `Company ${companyNames.length + 1}`,
    ];
    setCompanyNames(newCompanies);
    setBuyPrices([...buyPrices, 0]);
    setSellPrices([...sellPrices, 0]);
    // Move keyboard focus to the new row's buy-price input.
    // requestAnimationFrame ensures the new <input> is mounted before focus().
    requestAnimationFrame(() => {
      const el = buyInputRefs.current[newIndex];
      if (el) el.focus();
    });
  };

  const removeRow = (index) => {
    if (buyPrices.length <= 1) return;
    setBuyPrices(buyPrices.filter((_, i) => i !== index));
    setSellPrices(sellPrices.filter((_, i) => i !== index));
    setCompanyNames(companyNames.filter((_, i) => i !== index));
    // Clear the ref slot so it doesn't hold onto a removed DOM node.
    buyInputRefs.current = buyInputRefs.current.filter((_, i) => i !== index);
  };

  const isStocksEmpty = buyPrices.length === 0;
  const maxIndex = Math.max(buyPrices.length, sellPrices.length);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label
          htmlFor="savings-amount"
          className="block text-sm font-medium text-slate-400 mb-2"
        >
          Savings Amount
        </label>
        <input
          ref={savingsRef}
          id="savings-amount"
          name="savings"
          type="number"
          inputMode="numeric"
          min={SAVINGS_MIN}
          max={SAVINGS_MAX}
          value={savings}
          onChange={(e) => handleSavingsChange(parseInt(e.target.value, 10) || 0)}
          aria-invalid={savings < SAVINGS_MIN || savings > SAVINGS_MAX}
          aria-describedby={validationError ? 'savings-error' : undefined}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-400">
            Stock Prices
          </label>
          <button
            type="button"
            onClick={addRow}
            className="text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          >
            + Add Stock
          </button>
        </div>

        {isStocksEmpty ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 text-sm text-slate-400">
            No stocks yet. Click <span className="text-slate-200">+ Add Stock</span> to get started.
          </div>
        ) : (
          <>
            {/* Desktop / tablet: table layout */}
            <div className="hidden md:block bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-750 border-b border-slate-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-16">
                      Index
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Buy Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Sell Price
                    </th>
                    <th className="px-4 py-3 w-16"><span className="sr-only">Remove</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {Array.from({ length: maxIndex }).map((_, index) => (
                    <tr key={index} className="hover:bg-slate-750 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-mono">{index}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">
                        {companyNames[index] || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          ref={(el) => (buyInputRefs.current[index] = el)}
                          type="number"
                          inputMode="numeric"
                          min={PRICE_MIN}
                          max={PRICE_MAX}
                          value={buyPrices[index] === 0 ? 0 : buyPrices[index] || ''}
                          onChange={(e) => updatePrice(index, 'buy', e.target.value)}
                          placeholder="0"
                          aria-label={`Buy price for ${companyNames[index] || `stock ${index + 1}`}`}
                          className="w-full min-w-[6rem] px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={PRICE_MIN}
                          max={PRICE_MAX}
                          value={sellPrices[index] === 0 ? 0 : sellPrices[index] || ''}
                          onChange={(e) => updatePrice(index, 'sell', e.target.value)}
                          placeholder="0"
                          aria-label={`Sell price for ${companyNames[index] || `stock ${index + 1}`}`}
                          className="w-full min-w-[6rem] px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          disabled={maxIndex <= 1}
                          aria-label={`Remove ${companyNames[index] || `stock ${index + 1}`}`}
                          className="text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile (<md): card-per-row layout — fixes the 390px input collapse bug */}
            <div className="md:hidden space-y-3">
              {Array.from({ length: maxIndex }).map((_, index) => (
                <div
                  key={index}
                  className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">Index {index}</div>
                      <div className="text-sm text-slate-300">{companyNames[index] || '-'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      disabled={maxIndex <= 1}
                      aria-label={`Remove ${companyNames[index] || `stock ${index + 1}`}`}
                      className="text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="block text-xs text-slate-400 mb-1">Buy</span>
                      <input
                        ref={(el) => (buyInputRefs.current[index] = el)}
                        type="number"
                        inputMode="numeric"
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        value={buyPrices[index] === 0 ? 0 : buyPrices[index] || ''}
                        onChange={(e) => updatePrice(index, 'buy', e.target.value)}
                        placeholder="0"
                        aria-label={`Buy price for ${companyNames[index] || `stock ${index + 1}`}`}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs text-slate-400 mb-1">Sell</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        value={sellPrices[index] === 0 ? 0 : sellPrices[index] || ''}
                        onChange={(e) => updatePrice(index, 'sell', e.target.value)}
                        placeholder="0"
                        aria-label={`Sell price for ${companyNames[index] || `stock ${index + 1}`}`}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {validationError && (
        <div
          id="savings-error"
          role="alert"
          className="p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-300 text-sm"
        >
          {validationError}
        </div>
      )}

      {isStocksEmpty && (
        <p className="text-sm text-amber-300" role="status">
          Add at least one stock to calculate.
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || isStocksEmpty}
        aria-disabled={isLoading || isStocksEmpty}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        {isLoading ? 'Calculating...' : 'Calculate Profit'}
      </button>
    </form>
  );
}
