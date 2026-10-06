import { AnimatePresence, motion } from 'framer-motion';
import { agentLayers } from '../../data/agentLayers';

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

/** One layer of the AI agent pyramid: what it asks, catches and misses, and when it runs. */
export default function AgentLayerExplainer({ layerId }) {
  const layer = agentLayers.find((l) => l.id === layerId);
  if (!layer) return null;
  const tests = layer.id === 'judgment'
    ? 'Part of AdvisorEvaluation, with the judge in OllamaJudge'
    : layer.testClasses.map((c) => c.name).join(', ');

  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={layer.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.22 }}
        aria-live="polite"
        className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-800/60"
      >
        <div className="h-1.5" style={{ backgroundColor: layer.hex }} />
        <div className="space-y-7 p-5 sm:p-7">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: layer.hex }}>{layer.name}</h2>
              <span className="rounded-full border border-slate-600 px-2 py-0.5 text-xs text-slate-400">Runs: {layer.runs}</span>
              <span className="rounded-full border border-slate-600 px-2 py-0.5 text-xs text-slate-400">Uncertainty: {layer.uncertainty}</span>
            </div>
            <p className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">{layer.question}</p>
            <p className="mt-3 leading-relaxed text-slate-300">{layer.summary}</p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-400">Catches</h3>
              <List items={layer.catches} marker="✓" markerClass="text-emerald-400" />
            </section>
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-400">Can’t see</h3>
              <List items={layer.blindSpots} marker="–" markerClass="text-amber-400" />
            </section>
          </div>

          <section className="rounded-xl border p-4 sm:p-5" style={{ borderColor: `${layer.hex}66`, backgroundColor: `${layer.hex}14` }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: layer.hex }}>From this project</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{layer.realIssue.title}</h3>
            <p className="mt-1.5 leading-relaxed text-slate-300">{layer.realIssue.story}</p>
          </section>

          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">In the classic pyramid</dt>
              <dd className="mt-1 text-slate-300">{layer.classic}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">In this project</dt>
              <dd className="mt-1 text-slate-300">{layer.inThisProject}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">Tests</dt>
              <dd className="mt-1 font-mono text-xs text-slate-300">{tests}</dd>
            </div>
          </dl>
        </div>
      </motion.article>
    </AnimatePresence>
  );
}
