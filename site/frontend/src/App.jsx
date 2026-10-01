// HashRouter instead of BrowserRouter so deep links work without any
// server-side SPA rewrite. The deployed frontend is a Render static site
// without a configured rewrite rule, so BrowserRouter would 404 on direct
// navigation to /calculator, /reports, etc. HashRouter keeps the server
// path at "/" (which always 200s) and stores the route in the URL hash.
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import CalculatorPage from './pages/CalculatorPage';
import HomePage from './pages/HomePage';
import ReportsPage from './pages/ReportsPage';
import TestingStrategies from './pages/TestingStrategies';
import TestingTechniquesPage from './pages/TestingTechniquesPage';

function App() {
  return (
    <HashRouter>
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
    </HashRouter>
  );
}

export default App;
