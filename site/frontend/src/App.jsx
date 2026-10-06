// HashRouter instead of BrowserRouter so deep links work without any
// server-side SPA rewrite. The deployed frontend is a Render static site
// without a configured rewrite rule, so BrowserRouter would 404 on direct
// navigation to /calculator, /reports, etc. HashRouter keeps the server
// path at "/" (which always 200s) and stores the route in the URL hash.
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { lazy, Suspense } from 'react';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';

// Pages load on demand, so the first visit only downloads what it shows.
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const TestingAgentsPage = lazy(() => import('./pages/TestingAgentsPage'));
const TestingStrategies = lazy(() => import('./pages/TestingStrategies'));
const TestingTechniquesPage = lazy(() => import('./pages/TestingTechniquesPage'));

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <div className="min-h-screen bg-slate-900 text-slate-200">
          <Navigation />
          <Suspense fallback={<p className="p-8 text-center text-slate-500">Loading…</p>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/testing-techniques" element={<TestingTechniquesPage />} />
              <Route path="/testing-pyramid" element={<TestingStrategies />} />
              <Route path="/testing-ai-agents" element={<TestingAgentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </Suspense>
        </div>
      </HashRouter>
    </MotionConfig>
  );
}

export default App;
