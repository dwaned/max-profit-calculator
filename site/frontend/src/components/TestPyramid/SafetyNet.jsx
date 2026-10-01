import { safetyNet, testLayers } from '../../data/testLayers';

const layerById = Object.fromEntries(testLayers.map((l) => [l.id, l]));

/** What runs on every pull request and after merge, in order, with rough durations. */
export default function SafetyNet() {
  return (
    <section aria-labelledby="safety-net-heading">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">The pipeline</p>
      <h2 id="safety-net-heading" className="mt-1 text-2xl sm:text-3xl font-bold text-white">
        The safety net
      </h2>
      <p className="mt-2 max-w-3xl text-slate-400 leading-relaxed">
        Tests only protect you if they run. Fast, precise checks gate every pull request; slower checks against the
        real Docker images run once a change reaches main. Times are typical CI durations.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {safetyNet.map((stage, stageIndex) => (
          <div key={stage.stage} className="rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5">
            <h3 className="flex items-center gap-3 text-lg font-semibold text-white">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-sky-500/20 text-sm text-sky-300">
                {stageIndex + 1}
              </span>
              {stage.stage}
            </h3>
            <ol className="mt-4 relative space-y-3 before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-px before:bg-slate-700">
              {stage.steps.map((step) => (
                <li key={step.name} className="relative flex gap-4">
                  <span aria-hidden="true" className="relative z-10 mt-4 flex h-[11px] w-[27px] shrink-0 justify-center">
                    <span className="h-[11px] w-[11px] rounded-full border-2 border-slate-500 bg-slate-900" />
                  </span>
                  <div className="flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="font-medium text-slate-100">{step.name}</span>
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400 tabular-nums">
                        {step.duration}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{step.detail}</p>
                    {step.layers.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1" aria-label="Layers covered">
                        {step.layers.map((id) => (
                          <li key={id} className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: layerById[id].hex }} />
                            {layerById[id].shortName}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
