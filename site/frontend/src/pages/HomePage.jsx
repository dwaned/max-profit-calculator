import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Max Profit Calculator
          </h1>
          <p className="text-xl text-slate-400">
            A learning project for exploring software testing strategies
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">The Challenge</h2>
            <p className="text-slate-300 mb-4">
              Given 2 arrays containing the current price and the forecasted future price of a set of stocks,
              when a value of savings is entered, the system should output which combination of indices from the 
              first array to choose so that with the available savings amount, the maximum profit is returned.
            </p>
          </section>

          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Example</h2>
            <div className="bg-slate-900 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Savings</div>
                  <div className="text-xl font-bold text-white">€5</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Current Prices</div>
                  <div className="text-xl font-bold text-white">[4, 1, 3]</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Future Prices</div>
                  <div className="text-xl font-bold text-white">[5, 2, 6]</div>
                </div>
              </div>
            </div>
            <p className="text-slate-300">
              <span className="text-green-400 font-bold">Result: [1, 2]</span> → Profit of €4
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Choosing indices 1 and 2 uses €4 of savings (from €5) and returns profit of €4.<br/>
              Choosing indices 0 and 1 would only return profit of €2.
            </p>
          </section>

          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Business Requirements</h2>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                System chooses the max profit with the least amount of savings used
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                If multiple combinations with same amount of savings exist, returns them all
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                If loss is only possible, return empty list and max profit 0
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                Savings is a positive Integer only (1-1000)
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                Stock prices: 1-1000, List size: 1-100
              </li>
            </ul>
          </section>

          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Testing Strategies</h2>
            <p className="text-slate-300 mb-6">
              This project demonstrates multiple testing strategies:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/testing-techniques"
                className="block p-4 bg-slate-900 hover:bg-slate-750 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-2">Testing Techniques</h3>
                <p className="text-sm text-slate-400">
                  Learn about Example-Based, Property-Based, Mutation, and BDD testing approaches
                </p>
              </Link>
              <Link
                to="/testing-pyramid"
                className="block p-4 bg-slate-900 hover:bg-slate-750 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-2">Testing Pyramid</h3>
                <p className="text-sm text-slate-400">
                  Explore the different testing layers: Unit, Controller, Integration, and UI tests
                </p>
              </Link>
            </div>
          </section>

          <section className="text-center">
            <Link
              to="/calculator"
              className="inline-block px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Try the Calculator →
            </Link>
          </section>

          <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Quick Start</h2>
            <div className="space-y-2 text-sm font-mono">
              <div><span className="text-slate-500"># Clone the repository</span></div>
              <div><span className="text-slate-500">$ git clone https://github.com/dwaned/max-profit-calculator.git</span></div>
              <div className="mt-4"><span className="text-slate-500"># Build and run</span></div>
              <div><span className="text-slate-500">$ mvn clean install</span></div>
              <div><span className="text-slate-500">$ mvn spring-boot:run</span></div>
              <div className="mt-4"><span className="text-slate-500"># API runs on http://localhost:9095/api</span></div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

export default HomePage;
