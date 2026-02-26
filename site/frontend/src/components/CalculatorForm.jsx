import { useState, useEffect } from 'react';

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

export default function CalculatorForm({ onCalculate, isLoading }) {
  const [savings, setSavings] = useState(10);
  const [buyPrices, setBuyPrices] = useState([5, 5, 10]);
  const [sellPrices, setSellPrices] = useState([15, 10, 35]);
  const [companyNames, setCompanyNames] = useState([]);

  useEffect(() => {
    setCompanyNames(SAMPLE_COMPANIES.slice(0, buyPrices.length));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate({ savings, buyPrices, sellPrices, companyNames });
  };

  const updatePrice = (index, type, value) => {
    const prices = type === 'buy' ? [...buyPrices] : [...sellPrices];
    prices[index] = parseInt(value) || 0;
    if (type === 'buy') setBuyPrices(prices);
    else setSellPrices(prices);
  };

  const addRow = () => {
    const newCompanies = [...companyNames, SAMPLE_COMPANIES[companyNames.length] || `Company ${companyNames.length + 1}`];
    setCompanyNames(newCompanies);
    setBuyPrices([...buyPrices, 0]);
    setSellPrices([...sellPrices, 0]);
  };

  const removeRow = (index) => {
    if (buyPrices.length > 1) {
      setBuyPrices(buyPrices.filter((_, i) => i !== index));
      setSellPrices(sellPrices.filter((_, i) => i !== index));
      setCompanyNames(companyNames.filter((_, i) => i !== index));
    }
  };

  const maxIndex = Math.max(buyPrices.length, sellPrices.length);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Savings Amount
        </label>
        <input
          type="number"
          min="1"
          max="1000"
          value={savings}
          onChange={(e) => setSavings(parseInt(e.target.value) || 0)}
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

        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
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
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {Array.from({ length: maxIndex }).map((_, index) => (
                <tr key={index} className="hover:bg-slate-750 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-mono">{index}</td>
                  <td className="px-4 py-3 text-purple-400 text-sm">{companyNames[index] || '-'}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      value={buyPrices[index] || ''}
                      onChange={(e) => updatePrice(index, 'buy', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      value={sellPrices[index] || ''}
                      onChange={(e) => updatePrice(index, 'sell', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      disabled={maxIndex <= 1}
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
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        {isLoading ? 'Calculating...' : 'Calculate Profit'}
      </button>
    </form>
  );
}
