import { motion } from 'framer-motion';
import { testLayers } from '../../data/testLayers';

const STYLE_LABELS = {
  example: { label: 'Example', classes: 'bg-emerald-700/40 text-emerald-300 border-emerald-700' },
  'property-based': { label: 'Property-Based', classes: 'bg-cyan-700/40 text-cyan-300 border-cyan-700' },
  bdd: { label: 'BDD', classes: 'bg-purple-700/40 text-purple-300 border-purple-700' },
  contract: { label: 'Contract', classes: 'bg-teal-700/40 text-teal-300 border-teal-700' },
  performance: { label: 'Performance', classes: 'bg-violet-700/40 text-violet-300 border-violet-700' }
};

function StyleBadge({ style }) {
  const meta = STYLE_LABELS[style];
  if (!meta) return null;
  return (
    <span
      className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${meta.classes}`}
    >
      {meta.label}
    </span>
  );
}

function CrossCuttingConcerns() {
  const performance = testLayers.find(l => l.id === 'performance');

  if (!performance) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700"
    >
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        Cross-Cutting Concerns
      </h2>
      <p className="text-slate-400 text-center mb-8 max-w-2xl mx-auto">
        Some testing concerns apply across multiple pyramid layers rather than
        living in one specific band. Performance is the canonical example — you
        measure response time, memory, and throughput wherever it matters.
      </p>

      <div
        className={`
          bg-slate-800 rounded-xl border border-slate-700 overflow-hidden
          ${performance.borderColor} border-l-4
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h3 className={`text-2xl font-bold ${performance.textColor}`}>
                {performance.name}
              </h3>
              <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded">
                Cross-Cutting
              </span>
            </div>
            <span className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300">
              {performance.framework}
            </span>
          </div>

          <p className="text-slate-300 mb-6">
            {performance.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <div className="text-xs uppercase text-slate-500 mb-1">Test Count</div>
              <div className="text-2xl font-bold text-purple-400">{performance.testCount}</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 md:col-span-2">
              <div className="text-xs uppercase text-slate-500 mb-2">Test Classes</div>
              <div className="flex flex-wrap gap-2">
                {performance.testClasses.map((cls, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950 rounded text-sm text-slate-300 font-mono"
                  >
                    {cls.name}
                    <StyleBadge style={cls.style} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {performance.subTests && performance.subTests.length > 0 && (
            <div className="mb-6 space-y-4">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Sub-Suites
              </h4>
              {performance.subTests.map((sub, idx) => (
                <div key={idx} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded">
                      {sub.name}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{sub.description}</p>
                  <pre className="bg-slate-950 rounded-lg p-3 overflow-x-auto text-xs">
                    <code className="text-emerald-300 font-mono">
                      {sub.codeExample}
                    </code>
                  </pre>
                </div>
              ))}
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Code Example
            </h4>
            <pre className="bg-slate-950 rounded-lg p-4 overflow-x-auto text-sm">
              <code className="text-emerald-300 font-mono">
                {performance.codeExample}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CrossCuttingConcerns;