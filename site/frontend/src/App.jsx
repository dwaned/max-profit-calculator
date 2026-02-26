import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import CalculatorForm from './components/CalculatorForm';
import ResultsCard from './components/ResultsCard';
import SampleButtons from './components/SampleButtons';
import HistoryPanel from './components/HistoryPanel';
import TestingStrategies from './pages/TestingStrategies';
import TestingTechniquesPage from './pages/TestingTechniquesPage';
import HomePage from './pages/HomePage';
import ReportsPage from './pages/ReportsPage';

function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const links = [
    { path: '/', label: 'Home' },
    { path: '/calculator', label: 'Calculator' },
    { path: '/testing-techniques', label: 'Testing Techniques' },
    { path: '/testing-pyramid', label: 'Testing Pyramid' },
    { path: '/reports', label: 'Reports' },
  ];
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  
  return (
    <>
      <nav className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-8">
              <span className="text-white font-bold text-lg">Max Profit</span>
              <div className="hidden md:flex space-x-1">
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
            
            <button
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={closeMobileMenu}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-slate-800 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <span className="text-white font-bold">Menu</span>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-slate-400 hover:text-white"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 py-4">
              {links.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`
                    block px-4 py-3 text-base font-medium transition-colors
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
      )}
    </>
  );
}

function CalculatorPage() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const calculate = async ({ savings, buyPrices, sellPrices, companyNames }) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://max-profit-calculator.onrender.com/api';
      const response = await fetch(`${apiUrl}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          savings,
          buyPrices,
          sellPrices,
          companyNames,
        }),
      });

      if (!response.ok) {
        let errorMessage;
        if (response.status === 500) {
          errorMessage = 'Service is currently unavailable. Please ensure the backend is running.';
        } else {
          errorMessage = 'Something went wrong. Please check your input values and try again.';
          try {
            const text = await response.text();
            if (text) {
              const errorData = JSON.parse(text);
              errorMessage = errorData.message || errorMessage;
            }
          } catch {
            errorMessage = 'Unable to connect to the server. Please make sure the backend is running.';
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResult(data);

      setHistory((prev) => [
        { request: { savings, buyPrices, sellPrices, companyNames }, result: data },
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
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
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

      <footer className="mt-8 md:mt-12 text-center text-slate-500 text-sm">
        <p className="text-xs md:text-sm">
          API running at <code className="bg-slate-800 px-2 py-1 rounded text-xs">/api</code>
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
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
