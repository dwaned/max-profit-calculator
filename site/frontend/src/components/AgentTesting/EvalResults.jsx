import results from '../../data/agentEvalResults.json';

const pct = (rate) => `${Math.round(rate * 100)}%`;

const TILES = [
  { key: 'correctArguments', label: 'Correct tool arguments', hint: 'Sent the user’s exact numbers to the calculator' },
  { key: 'verified', label: 'Verified answers', hint: 'Quoted the profit the calculator returned' },
  { key: 'safeRefusals', label: 'Safe refusals', hint: 'Did not calculate with data it was never given' },
  { key: 'judgedPassOrPartial', label: 'Judge: pass or partial', hint: 'Graded against the rubric, three votes each' },
];

function Bar({ rate, floor }) {
  const ok = rate >= floor;
  return (
    <div className="flex items-center gap-2">
      <div
        className="relative h-2 w-20 overflow-hidden rounded-full bg-slate-700 sm:w-28"
        role="img"
        aria-label={`${pct(rate)}, floor ${pct(floor)}`}
      >
        <div className={`h-full rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`} style={{ width: pct(rate) }} />
        <div className="absolute inset-y-0 w-px bg-white/60" style={{ left: pct(floor) }} />
      </div>
      <span className={`tabular-nums text-sm ${ok ? 'text-slate-200' : 'text-red-300'}`}>{pct(rate)}</span>
    </div>
  );
}

/** The latest local evaluation run: overall rates against their floors, then each task. */
export default function EvalResults() {
  const { overall, floors } = results;
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Run on {results.generatedAt.slice(0, 10)} · advisor {results.advisorModel} · judge {results.judgeModel} ·{' '}
        {results.runsPerTask} runs per task · median answer {(overall.medianLatencyMs / 1000).toFixed(1)} s
      </p>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {TILES.map((tile) => (
          <div key={tile.key} className="rounded-2xl border border-slate-700/80 bg-slate-800/40 p-4">
            <dt className="text-sm font-medium text-slate-300">{tile.label}</dt>
            <dd className="mt-1">
              <span className="block text-3xl font-bold tabular-nums text-white">{pct(overall[tile.key])}</span>
              <span className="mt-1 block text-xs text-slate-500">{tile.hint}. Floor {pct(floors[tile.key])}.</span>
            </dd>
          </div>
        ))}
      </dl>
      <div className="overflow-x-auto rounded-2xl border border-slate-700/80">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">Results for each evaluation task</caption>
          <thead className="bg-slate-800/60 text-xs uppercase tracking-widest text-slate-400">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Task</th>
              <th scope="col" className="px-4 py-3 font-semibold">Right arguments / safe refusal</th>
              <th scope="col" className="px-4 py-3 font-semibold">Verified</th>
              <th scope="col" className="px-4 py-3 font-semibold">Judge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {results.tasks.map((task) => {
              const v = task.judge.verdicts;
              return (
                <tr key={task.id} className="align-top">
                  <th scope="row" className="px-4 py-3 font-medium text-slate-200">
                    {task.title}
                    <span className="mt-0.5 block text-xs font-normal text-slate-500">{task.kind === 'calculate' ? 'should calculate' : 'should not calculate'}</span>
                  </th>
                  <td className="px-4 py-3">
                    <Bar rate={task.kind === 'calculate' ? task.correctArguments : task.safeRefusals}
                      floor={task.kind === 'calculate' ? floors.correctArguments : floors.safeRefusals} />
                  </td>
                  <td className="px-4 py-3">
                    {task.kind === 'calculate' ? <Bar rate={task.verified} floor={floors.verified} /> : <span className="text-slate-600">n/a</span>}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-300">
                    {v.pass} pass{v.partial ? ` · ${v.partial} partial` : ''}{v.fail ? ` · ${v.fail} fail` : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
