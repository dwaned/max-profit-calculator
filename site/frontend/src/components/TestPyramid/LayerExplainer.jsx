import { AnimatePresence, motion } from 'framer-motion';
import { layerTestCount, lenses, testLayers, tradeoffLabels } from '../../data/testLayers';

const LEVELS = ['Very low', 'Low', 'Medium', 'High', 'Very high'];

const STYLE_LABELS = {
  example: 'Example-based',
  'property-based': 'Property-based',
  bdd: 'BDD scenario',
  contract: 'Contract',
  performance: 'Performance',
  replay: 'Record & replay',
};

function scrollToLens(lensId) {
  document.getElementById(`lens-${lensId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function Meter({ name, value, hex }) {
  const { label, hint } = tradeoffLabels[name];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-slate-200 font-medium">{label}</span>
        <span className="text-slate-400 text-xs">{LEVELS[value - 1]}</span>
      </div>
      <div
        role="meter"
        aria-label={`${label}: ${hint}`}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={value}
        aria-valuetext={LEVELS[value - 1]}
        className="mt-1.5 flex gap-1"
      >
        {LEVELS.map((level, i) => (
          <span
            key={level}
            className="h-2 flex-1 rounded-full"
            style={{ backgroundColor: i < value ? hex : 'rgb(51 65 85)' }}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function List({ items, marker, markerClass }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-slate-300 leading-relaxed">
          <span aria-hidden="true" className={`mt-0.5 shrink-0 font-bold ${markerClass}`}>{marker}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Explains one layer: the question it answers, what it catches and misses, and what it costs. */
export default function LayerExplainer({ layerId }) {
  const layer = testLayers.find((l) => l.id === layerId);
  if (!layer) return null;

  const count = layerTestCount(layer);
  const relatedLenses = lenses.filter((lens) => lens.appliesTo.includes(layer.id) && lens.id !== layer.id);

  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={layer.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.22 }}
        aria-live="polite"
        className="rounded-2xl border border-slate-700/80 bg-slate-800/60 overflow-hidden"
      >
        <div className="h-1.5" style={{ backgroundColor: layer.hex }} />
        <div className="p-5 sm:p-7 space-y-7">
          <header>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: layer.hex }}>
                {layer.name}
              </h2>
              <span className="text-xs text-slate-400 rounded-full border border-slate-600 px-2 py-0.5">
                {count} tests in this project
              </span>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-bold text-white leading-tight">{layer.question}</p>
            <p className="mt-3 text-slate-300 leading-relaxed">{layer.summary}</p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">Catches</h3>
              <List items={layer.catches} marker="✓" markerClass="text-emerald-400" />
            </section>
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Can’t see</h3>
              <List items={layer.blindSpots} marker="–" markerClass="text-amber-400" />
            </section>
          </div>

          {layer.realIssue && (
            <section
              className="rounded-xl border p-4 sm:p-5"
              style={{ borderColor: `${layer.hex}66`, backgroundColor: `${layer.hex}14` }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: layer.hex }}>
                From this project
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">{layer.realIssue.title}</h3>
              <p className="mt-1.5 text-slate-300 leading-relaxed">{layer.realIssue.story}</p>
            </section>
          )}

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Trade-offs</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              {Object.keys(tradeoffLabels).map((name) => (
                <Meter key={name} name={name} value={layer.tradeoffs[name]} hex={layer.hex} />
              ))}
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Write one when…</h3>
              <p className="text-slate-300 leading-relaxed">{layer.writeOneWhen}</p>
            </section>
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">In this project</h3>
              <p className="text-slate-300 leading-relaxed">{layer.inThisProject}</p>
            </section>
          </div>

          {relatedLenses.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Techniques used here
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedLenses.map((lens) => (
                  <button
                    key={lens.id}
                    type="button"
                    onClick={() => scrollToLens(lens.id)}
                    className="rounded-full border border-slate-600 bg-slate-900/60 px-3 py-1 text-sm text-slate-200 hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {lens.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          <details className="group rounded-xl border border-slate-700 bg-slate-900/50">
            <summary className="cursor-pointer select-none list-none px-4 py-3 text-sm font-medium text-slate-200 flex items-center justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded-xl">
              See the code and test files
              <span aria-hidden="true" className="text-slate-400 transition-transform group-open:rotate-90">›</span>
            </summary>
            <div className="px-4 pb-4 space-y-4">
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <code>{layer.codeExample}</code>
              </pre>
              <ul className="flex flex-wrap gap-2">
                {layer.testClasses.map((testClass) => (
                  <li
                    key={testClass.file}
                    title={testClass.file}
                    className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300"
                  >
                    <span className="font-mono">{testClass.name}</span>
                    <span className="text-slate-500"> · {STYLE_LABELS[testClass.style] ?? testClass.style}</span>
                    {!testClass.generated && <span className="text-slate-500"> · {testClass.count}</span>}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500">Tools: {layer.tools}</p>
            </div>
          </details>
        </div>
      </motion.article>
    </AnimatePresence>
  );
}
