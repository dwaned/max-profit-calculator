import { lenses, testLayers } from '../../data/testLayers';

const ICON_PATHS = {
  conversation: (
    <>
      <path d="M4 5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M19 9h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-4-3h-3" />
    </>
  ),
  dice: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="16" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="16" r="1.2" fill="currentColor" />
    </>
  ),
  mutant: (
    <>
      <path d="M8 3c0 6 8 6 8 12s-8 6-8 6" />
      <path d="M16 3c0 6-8 6-8 12" />
      <path d="M9 7h6M9 17h6" />
    </>
  ),
  gauge: (
    <>
      <path d="M3 17a9 9 0 1 1 18 0" />
      <path d="M12 17 8 11" />
      <path d="M7 21h10" />
    </>
  ),
  'gauge-fast': (
    <>
      <path d="M3 17a9 9 0 1 1 18 0" />
      <path d="M12 17l5-6" />
      <path d="M7 21h10" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};

function LensIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/**
 * Techniques that are not layers of their own: they apply at one or more
 * layers (or before any test runs) and are shown with where they apply.
 */
export default function LensesSection({ onSelectLayer }) {
  return (
    <section aria-labelledby="lenses-heading">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Techniques</p>
      <h2 id="lenses-heading" className="mt-1 text-2xl sm:text-3xl font-bold text-white">
        Lenses across the layers
      </h2>
      <p className="mt-2 max-w-3xl text-slate-400 leading-relaxed">
        Some practices aren’t a layer of the pyramid: they are ways of writing or judging tests, and each one is
        used where it gives the most value. The coloured tags show where.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {lenses.map((lens) => {
          const layers = lens.appliesTo.map((id) => testLayers.find((l) => l.id === id));
          return (
            <article
              key={lens.id}
              id={`lens-${lens.id}`}
              className="scroll-mt-24 flex flex-col rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-sky-300">
                  <LensIcon name={lens.icon} />
                </span>
                <h3 className="text-lg font-semibold text-white">{lens.name}</h3>
              </div>
              <p className="mt-3 text-slate-300 leading-relaxed">{lens.idea}</p>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-200">Why it matters: </span>
                {lens.value}
              </p>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-200">Here: </span>
                {lens.inThisProject}
              </p>
              <div className="mt-auto pt-4 flex flex-wrap items-center gap-2">
                {layers.length === 0 ? (
                  <span className="rounded-full border border-slate-600 px-2.5 py-0.5 text-xs text-slate-300">
                    Before any test runs
                  </span>
                ) : (
                  layers.map((layer) => (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => onSelectLayer(layer.id)}
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      style={{ backgroundColor: `${layer.hex}40`, boxShadow: `inset 0 0 0 1px ${layer.hex}` }}
                    >
                      {layer.shortName}
                    </button>
                  ))
                )}
                {lens.id === 'performance' && (
                  <button
                    type="button"
                    onClick={() => onSelectLayer('performance')}
                    className="ml-auto text-sm text-sky-300 hover:text-sky-200 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded"
                  >
                    Details ›
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
