import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PyramidDiagram from '../components/TestPyramid/PyramidDiagram';
import { techniques } from '../data/techniques';
import { layerOrder, layerTestCount, testLayers } from '../data/testLayers';
import { usePageTitle } from '../hooks/usePageTitle';

const totalTests = testLayers.filter((l) => !l.crossCutting).reduce((sum, l) => sum + layerTestCount(l), 0);

const stats = [
  { value: totalTests, label: 'automated tests' },
  { value: layerOrder.length, label: 'layers, unit to browser' },
  { value: techniques.length, label: 'testing techniques' },
  { value: '97%', label: 'of deliberate bugs caught' },
];

// The worked example: €5 of savings, three stocks.
const SAVINGS = 5;
const exampleStocks = [
  { index: 0, buy: 4, sell: 5, chosen: false },
  { index: 1, buy: 1, sell: 2, chosen: true },
  { index: 2, buy: 3, sell: 6, chosen: true },
];

const rules = [
  'Choose the stocks that give the highest total profit; each stock can be bought once',
  'If several choices give the same profit, use the one that spends the least savings',
  'If no stock makes a profit, buy nothing and report a profit of 0',
  'Savings are whole euros from 1 to 1000; prices from 1 to 1000; 1 to 100 stocks, with a future price for each',
];

const learnCards = [
  {
    to: '/testing-pyramid',
    eyebrow: 'Where tests run',
    title: 'Testing Pyramid',
    body: 'Five layers from unit to UI / end-to-end: the question each answers, what it catches and misses, and what it costs.',
    hex: '#38bdf8',
  },
  {
    to: '/testing-techniques',
    eyebrow: 'How tests are designed',
    title: 'Testing Techniques',
    body: 'Example-based, property-based, fuzzing, mutation, BDD, contract and performance testing: when each one pays off.',
    hex: '#c084fc',
  },
  {
    to: '/reports',
    eyebrow: 'The evidence',
    title: 'Live reports',
    body: 'Test results, coverage, mutation and BDD reports, published by CI on every change to main.',
    hex: '#34d399',
  },
];

function SectionHeading({ id, eyebrow, title, children }) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">{eyebrow}</p>
      <h2 id={id} className="mt-1 text-2xl sm:text-3xl font-bold text-white">{title}</h2>
      {children && <p className="mt-2 max-w-3xl text-slate-400 leading-relaxed">{children}</p>}
    </>
  );
}

function WorkedExample() {
  const spent = exampleStocks.filter((s) => s.chosen).reduce((sum, s) => sum + s.buy, 0);
  const profit = exampleStocks.filter((s) => s.chosen).reduce((sum, s) => sum + s.sell - s.buy, 0);
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-semibold text-slate-200">Worked example</p>
        <p className="text-sm text-slate-400">
          Savings <span className="font-semibold text-white">€{SAVINGS}</span>
        </p>
      </div>
      <ul className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {exampleStocks.map((stock) => (
          <li
            key={stock.index}
            className={`rounded-xl border p-3 text-center ${
              stock.chosen ? 'border-emerald-400 bg-emerald-400/10' : 'border-slate-700 bg-slate-900/60'
            }`}
          >
            <p className="text-xs text-slate-400">Stock {stock.index}</p>
            <p className="mt-2 text-sm text-slate-300">
              €{stock.buy} <span aria-hidden="true">→</span><span className="sr-only">rises to</span> €{stock.sell}
            </p>
            <p className={`mt-1 text-lg font-bold ${stock.chosen ? 'text-emerald-300' : 'text-slate-400'}`}>
              +€{stock.sell - stock.buy}
            </p>
            <p className={`mt-1 text-[11px] uppercase tracking-wide ${stock.chosen ? 'text-emerald-400' : 'text-transparent'}`}>
              {stock.chosen ? 'Buy' : 'Skip'}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-slate-200">
        Buy stocks <span className="font-semibold text-emerald-300">1 and 2</span>: spend €{spent} of €{SAVINGS} for
        a profit of <span className="font-semibold text-emerald-300">€{profit}</span>.
      </p>
      <p className="mt-1 text-sm text-slate-400">
        Spending all €5 on stocks 0 and 1 would earn only €2. More money spent is not more profit.
      </p>
    </div>
  );
}

function HomePage() {
  usePageTitle(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {/* Hero */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">A learning project</p>
            <h1 className="mt-2 text-4xl md:text-6xl font-bold text-white leading-tight">Max Profit Calculator</h1>
            <p className="mt-5 text-lg md:text-xl text-slate-300 leading-relaxed">
              A small problem, tested thoroughly. See how each kind of test protects a real application, from a
              single function to a user in the browser, and what each one is worth.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Try the calculator →
              </Link>
              <Link
                to="/testing-pyramid"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-5 py-3 font-semibold text-slate-100 hover:border-slate-400 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                How it’s tested
              </Link>
            </div>
          </motion.header>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <PyramidDiagram onSelect={(id) => navigate(`/testing-pyramid?layer=${id}`)} />
            <p className="mt-3 text-center text-sm text-slate-500">Select a layer to explore it</p>
          </motion.div>
        </div>

        {/* Stats */}
        <dl className="mt-14 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-3xl md:text-4xl font-bold text-white tabular-nums">{stat.value}</span>
                <span className="mt-1 block text-sm text-slate-400">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        {/* The problem */}
        <section aria-labelledby="problem-heading" className="mt-20 grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">The problem</p>
            <h2 id="problem-heading" className="mt-1 text-2xl sm:text-3xl font-bold text-white">
              Which stocks should you buy?
            </h2>
            <p className="mt-3 text-slate-300 leading-relaxed">
              You have some savings, today’s price of each stock, and a forecast of its future price. Pick the
              stocks to buy so the profit is as high as possible without spending more than you have.
            </p>
            <h3 className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-400">The rules</h3>
            <ul className="mt-3 space-y-2.5">
              {rules.map((rule) => (
                <li key={rule} className="flex gap-2.5 text-slate-300 leading-relaxed">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 font-bold text-emerald-400">✓</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-400">
              Each rule is an acceptance scenario, written in plain language and run through this UI in a real
              browser.{' '}
              <Link to="/testing-techniques" className="text-sky-300 hover:underline underline-offset-4">
                How BDD works
              </Link>
            </p>
          </div>
          <WorkedExample />
        </section>

        {/* Learn */}
        <section aria-labelledby="learn-heading" className="mt-20">
          <SectionHeading id="learn-heading" eyebrow="Learn" title="Explore the testing">
            Start with the pyramid to see where tests live, then the techniques to see how they are designed.
          </SectionHeading>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {learnCards.map((card) => (
              <Link
                key={card.to}
                to={card.to}
                className="group flex flex-col rounded-2xl border border-slate-700/80 bg-slate-800/40 p-6 transition-colors hover:border-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: card.hex }}>
                  {card.eyebrow}
                </span>
                <span className="mt-2 text-xl font-semibold text-white">{card.title}</span>
                <span className="mt-2 text-slate-400 leading-relaxed">{card.body}</span>
                <span className="mt-auto pt-4 text-sm font-semibold" style={{ color: card.hex }}>
                  Open <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Run it */}
        <details className="group mt-20 rounded-2xl border border-slate-700/80 bg-slate-800/40">
          <summary className="cursor-pointer select-none list-none px-5 py-4 flex items-center justify-between rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
            <span>
              <span className="block text-lg font-semibold text-white">Run it locally</span>
              <span className="block text-sm text-slate-400">With Docker, or the backend and frontend separately</span>
            </span>
            <span aria-hidden="true" className="text-xl text-slate-400 transition-transform group-open:rotate-90">›</span>
          </summary>
          <pre className="mx-5 mb-5 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-300 leading-relaxed">
            <code>{`git clone https://github.com/dwaned/max-profit-calculator.git
cd max-profit-calculator

# Everything in Docker: UI on http://localhost:3000
docker compose up --build

# Or separately: API on http://localhost:9095/api, then the UI
mvn spring-boot:run
cd site/frontend && npm ci && npm run dev`}</code>
          </pre>
        </details>
      </div>
    </div>
  );
}

export default HomePage;
