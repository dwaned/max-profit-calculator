import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import PyramidDiagram from '../components/TestPyramid/PyramidDiagram';
import LayerExplainer from '../components/TestPyramid/LayerExplainer';
import LensesSection from '../components/TestPyramid/LensesSection';
import SafetyNet from '../components/TestPyramid/SafetyNet';
import { layerTestCount, testLayers } from '../data/testLayers';
import { usePageTitle } from '../hooks/usePageTitle';

const commands = [
  { command: 'mvn verify', what: 'Unit, integration and performance tests, plus checkstyle and the coverage floor' },
  { command: 'mvn test -Ppitest', what: 'Mutation testing (fails below a 90% mutation score)' },
  { command: 'mvn test -Pcontract-tests', what: 'Contract verification against the backend (needs the API running on :9095)' },
  { command: 'mvn test -Pcontainer-tests', what: 'System and API performance tests against the Docker images (needs Docker)' },
  { command: 'mvn test -Pplaywright-tests', what: 'BDD acceptance scenarios through the UI (needs the UI running; PLAYWRIGHT_BASE_URL)' },
  { command: 'cd site/frontend && npm run test:run && npm run test:pact', what: 'Frontend unit tests and contract (consumer) tests' },
  { command: 'cd site/frontend && npm run test:ui', what: 'End-to-end browser tests' },
];

const totalTests = testLayers.filter((l) => !l.crossCutting).reduce((sum, l) => sum + layerTestCount(l), 0);

function TestingStrategies() {
  usePageTitle('Testing Pyramid');
  // Other pages link to a layer with ?layer=<id>.
  const [searchParams] = useSearchParams();
  const linkedLayer = searchParams.get('layer');
  const [selectedLayer, setSelectedLayer] = useState(
    testLayers.some((l) => l.id === linkedLayer) ? linkedLayer : 'unit',
  );
  const explainerRef = useRef(null);

  // Selecting from further down the page brings the explanation into view.
  const selectAndShow = (layerId) => {
    setSelectedLayer(layerId);
    explainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-14">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Testing Pyramid</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-bold text-white leading-tight">
            How this project is tested
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-400 leading-relaxed">
            Every kind of test answers a different question. Low in the pyramid, tests are fast, cheap and point at
            the exact problem, so there are many of them. Higher up, they are slower but closer to what a real user
            does, so there are a few, aimed at what matters most. Together, {totalTests} tests give confidence
            without a slow, fragile suite.
          </p>
        </motion.header>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:sticky lg:top-24"
          >
            <PyramidDiagram selectedLayer={selectedLayer} onSelect={setSelectedLayer} />
            <p className="mt-4 text-center text-sm text-slate-500">
              Select a layer, or use the arrow keys, to see what it tests.
            </p>
          </motion.div>

          <div ref={explainerRef} className="scroll-mt-24">
            <LayerExplainer layerId={selectedLayer} />
          </div>
        </div>

        <div className="mt-20">
          <LensesSection onSelectLayer={selectAndShow} />
        </div>

        <div className="mt-20">
          <SafetyNet />
        </div>

        <details className="group mt-20 rounded-2xl border border-slate-700/80 bg-slate-800/40">
          <summary className="cursor-pointer select-none list-none px-5 py-4 flex items-center justify-between rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
            <span>
              <span className="block text-lg font-semibold text-white">Run it yourself</span>
              <span className="block text-sm text-slate-400">The commands behind each part of the safety net</span>
            </span>
            <span aria-hidden="true" className="text-xl text-slate-400 transition-transform group-open:rotate-90">›</span>
          </summary>
          <dl className="px-5 pb-5 space-y-4">
            {commands.map(({ command, what }) => (
              <div key={command}>
                <dt>
                  <code className="block overflow-x-auto rounded-lg bg-slate-950 px-3 py-2 text-sm text-slate-200">
                    {command}
                  </code>
                </dt>
                <dd className="mt-1 text-sm text-slate-400">{what}</dd>
              </div>
            ))}
          </dl>
        </details>
      </div>
    </div>
  );
}

export default TestingStrategies;
