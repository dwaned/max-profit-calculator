import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import CalculatorForm from './components/CalculatorForm';
import ResultsCard from './components/ResultsCard';
import SampleButtons from './components/SampleButtons';
import HistoryPanel from './components/HistoryPanel';
import TestingStrategies from './pages/TestingStrategies';
import TestingTechniquesPage from './pages/TestingTechniquesPage';
import HomePage from './pages/HomePage';

function Navigation() {
  const location = useLocation();
  
  const links = [
    { path: '/', label: 'Home' },
    { path: '/calculator', label: 'Calculator' },
    { path: '/testing-techniques', label: 'Testing Techniques' },
    { path: '/testing-pyramid', label: 'Testing Pyramid' },
  ];
  
  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-8">
            <span className="text-white font-bold text-lg">Max Profit</span>
            <div className="flex space-x-1">
              {links.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${location.pathname === link.path
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function CalculatorPage() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const calculate = async ({ savings, buyPrices, sellPrices }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          savings,
          buyPrices,
          sellPrices,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Something went wrong. Please check your input values and try again.';
        try {
          const text = await response.text();
          if (text) {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorMessage;
          }
        } catch {
          errorMessage = 'Unable to connect to the server. Please make sure the backend is running.';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResult(data);

      setHistory((prev) => [
        { request: { savings, buyPrices, sellPrices }, result: data },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Max Profit Calculator</h1>
        <p className="text-slate-400 mt-2">
          Find the optimal stock buy/sell combination for maximum profit
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Calculate
            </h2>

            <SampleButtons onSelect={handleSampleSelect} />

            <div className="mt-4">
              <CalculatorForm onCalculate={calculate} isLoading={isLoading} />
            </div>

            {error && (
              <div className={`mt-4 p-4 rounded-lg ${
                error.includes('not running') 
                  ? 'bg-amber-900/50 border border-amber-700 text-amber-300'
                  : 'bg-red-900/50 border border-red-700 text-red-300'
              }`}>
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
                  <button onClick={closeHistoryDetail} className="text-slate-400 hover:text-white">&times;</button>
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

      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>
          API running at <code className="bg-slate-800 px-2 py-1 rounded">/api</code>
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-200">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/testing-techniques" element={<TestingTechniquesPage />} />
          <Route path="/testing-pyramid" element={<TestingStrategies />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
