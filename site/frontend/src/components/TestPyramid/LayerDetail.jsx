import { motion, AnimatePresence } from 'framer-motion';
import { testLayers, bddInfo, propertyBasedInfo } from '../../data/testLayers';

const bddCodeExample = `Scenario: Max Profit with using all savings
  Given I have 10 Euros of savings
  When Array of current stock prices are "5,5,1"
  And Array of future stock prices are "9,9,4"
  Then the best combination is "0,1"
  And profit is 8 Euros`;

function LayerDetail({ layerId }) {
  const layer = testLayers.find(l => l.id === layerId);

  if (!layer) return null;

  const showBdd = bddInfo.appliesTo.includes(layerId);
  const showPropertyBased = propertyBasedInfo.appliesTo.includes(layerId);
  const showSubTests = layer.subTests && layer.subTests.length > 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={layer.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`
          bg-slate-800 rounded-xl border border-slate-700 overflow-hidden
          ${layer.borderColor} border-l-4
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className={`text-2xl font-bold ${layer.textColor}`}>
                {layer.name}
              </h3>
              {showBdd && (
                <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded">
                  {bddInfo.name}
                </span>
              )}
              {showPropertyBased && (
                <span className="px-2 py-1 bg-cyan-600 text-white text-xs font-medium rounded">
                  {propertyBasedInfo.name}
                </span>
              )}
            </div>
            <span className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300">
              {layer.framework}
            </span>
          </div>

          <p className="text-slate-300 mb-6">
            {layer.description}
          </p>

          {/* Show sub-tests for Unit layer */}
          {showSubTests && (
            <div className="mb-6 space-y-4">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Testing Approaches
              </h4>
              {layer.subTests.map((subTest, idx) => (
                <div key={idx} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 ${idx === 0 ? 'bg-emerald-600' : 'bg-cyan-600'} text-white text-xs font-medium rounded`}>
                      {subTest.name}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    {subTest.description}
                  </p>
                  <pre className="bg-slate-950 rounded-lg p-3 overflow-x-auto text-xs">
                    <code className="text-emerald-300 font-mono">
                      {subTest.codeExample}
                    </code>
                  </pre>
                </div>
              ))}
            </div>
          )}

          {showBdd && (
            <div className="mb-6 p-4 bg-purple-900/30 border border-purple-700/50 rounded-lg">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">
                About BDD
              </h4>
              <p className="text-sm text-slate-300">
                {bddInfo.description}
              </p>
              <div className="mt-3">
                <h5 className="text-xs font-semibold text-purple-400 uppercase mb-1">
                  BDD Example (Gherkin)
                </h5>
                <pre className="bg-slate-950 rounded-lg p-3 overflow-x-auto text-xs">
                  <code className="text-purple-300 font-mono">
                    {bddCodeExample}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {showPropertyBased && (
            <div className="mb-6 p-4 bg-cyan-900/30 border border-cyan-700/50 rounded-lg">
              <h4 className="text-sm font-semibold text-cyan-400 mb-2">
                About Property-Based Testing
              </h4>
              <p className="text-sm text-slate-300">
                {propertyBasedInfo.description}
              </p>
            </div>
          )}

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Test Classes
            </h4>
            <div className="flex flex-wrap gap-2">
              {layer.testClasses.map((cls, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-900 rounded text-sm text-slate-300 font-mono"
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Characteristics
            </h4>
            <ul className="grid grid-cols-2 gap-2">
              {layer.properties.map((prop, i) => (
                <li key={i} className="flex items-center text-slate-300 text-sm">
                  <span className={`w-2 h-2 rounded-full ${layer.color} mr-2`} />
                  {prop}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Code Example
            </h4>
            <pre className="bg-slate-950 rounded-lg p-4 overflow-x-auto text-sm">
              <code className="text-emerald-300 font-mono">
                {layer.codeExample}
              </code>
            </pre>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default LayerDetail;
