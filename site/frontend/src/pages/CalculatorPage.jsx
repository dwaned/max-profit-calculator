import { useState, useEffect, useRef } from 'react';
import CalculatorForm from '../components/CalculatorForm';
import ResultsCard from '../components/ResultsCard';
import SampleButtons from '../components/SampleButtons';
import HistoryPanel from '../components/HistoryPanel';
import { usePageTitle } from '../hooks/usePageTitle';
import { shouldShowApiFooter } from '../utils/apiFooter';
import { requestCalculation } from '../api/calculator';
import { API_BASE_URL } from '../api/baseUrl';

// Default to 25s — Render's free tier cold start usually completes in 30-60s
// but the user's request is much more likely to succeed after the first warm-up.
const API_REQUEST_TIMEOUT_MS = 25_000;


export default function CalculatorPage() {
  usePageTitle('Calculator');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coldStartWarningShown, setColdStartWarningShown] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const abortRef = useRef(null);

  const calculate = async ({ savings, buyPrices, sellPrices, companyNames }) => {
    setIsLoading(true);
    setError(null);

    // Cold-start hint: if we've been "Calculating..." for >5s on the very
    // first request, surface a banner explaining the wait (#7).
    const coldTimer = setTimeout(() => {
      setColdStartWarningShown(true);
    }, 5_000);

    // Lets unmount cancel the request; requestCalculation enforces the hard
    // timeout so the UI never hangs silently (#7).
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await requestCalculation(
        API_BASE_URL,
        { savings, buyPrices, sellPrices, companyNames },
        { timeoutMs: API_REQUEST_TIMEOUT_MS, signal: controller.signal },
      );
      setResult(data);
      setColdStartWarningShown(false);

      setHistory((prev) => [
        { request: { savings, buyPrices, sellPrices, companyNames }, result: data },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      // An AbortError means the component unmounted — nothing to show.
      if (err.name !== 'AbortError') {
        setError(err.message || 'An unexpected error occurred. Please try again.');
        setResult(null);
      }
    } finally {
      clearTimeout(coldTimer);
      abortRef.current = null;
      setIsLoading(false);
    }
  };

  // Cancel any in-flight request when the component unmounts.
  useEffect(() => () => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  const handleSampleSelect = (sample) => {
    setError(null);
    calculate({
      savings: sample.savings,
      buyPrices: sample.buyPrices,
      sellPrices: sample.sellPrices,
    });
  };

  const handleHistorySelect = (item) => {
    setSelectedHistoryItem(item);
  };

  const closeHistoryDetail = () => {
    setSelectedHistoryItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Max Profit Calculator</h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base">
          Find the optimal stock buy/sell combination for maximum profit
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-slate-800 rounded-xl p-4 md:p-6 border border-slate-700">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">
              Calculate
            </h2>

            <SampleButtons onSelect={handleSampleSelect} />

            <div className="mt-4">
              <CalculatorForm onCalculate={calculate} isLoading={isLoading} />
            </div>

            {coldStartWarningShown && isLoading && (
              <div
                role="status"
                className="mt-4 p-4 rounded-lg bg-amber-900/50 border border-amber-700 text-amber-300"
              >
                <strong className="block font-semibold mb-1">Backend is waking up</strong>
                <span>
                  The free-tier backend may take 30–60 seconds on its first request. Hang tight…
                </span>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className={`mt-4 p-4 rounded-lg ${
                  error.includes('not running') || error.includes('waking up') || error.includes('too long')
                    ? 'bg-amber-900/50 border border-amber-700 text-amber-300'
                    : 'bg-red-900/50 border border-red-700 text-red-300'
                }`}
              >
                {error}
              </div>
            )}
          </div>

          {result && <ResultsCard result={result} />}
        </div>

        <div className="lg:col-span-1">
          <HistoryPanel history={history} onSelect={handleHistorySelect} />
          {selectedHistoryItem && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeHistoryDetail}>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">History Details</h3>
                  <button onClick={closeHistoryDetail} aria-label="Close history details" className="text-slate-400 hover:text-white">&times;</button>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-slate-400 mb-1">Input</div>
                  <div className="bg-slate-900 rounded-lg p-3 text-sm">
                    <div>Savings: €{selectedHistoryItem.request.savings}</div>
                    <div>Buy Prices: [{selectedHistoryItem.request.buyPrices.join(', ')}]</div>
                    <div>Sell Prices: [{selectedHistoryItem.request.sellPrices.join(', ')}]</div>
                  </div>
                </div>
                <ResultsCard result={selectedHistoryItem.result} />
              </div>
            </div>
          )}
        </div>
      </div>

      {shouldShowApiFooter(API_BASE_URL, {
        forceShow: typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SHOW_API_FOOTER === 'true',
      }) && (
        <footer className="mt-8 md:mt-12 text-center text-slate-500 text-sm">
          <p className="text-xs md:text-sm">
            API: <code className="bg-slate-800 px-2 py-1 rounded text-xs break-all">{API_BASE_URL}</code>
          </p>
        </footer>
      )}
    </div>
  );
}
