import { useEffect, useState } from 'react';
import { askAdvisor, getAdvisorStatus } from '../../api/advisor';
import { API_BASE_URL } from '../../api/baseUrl';
import results from '../../data/agentEvalResults.json';

const SAMPLES = [
  'I have 5 euros. Stocks cost 4, 1 and 3 today and will be worth 5, 2 and 6. Which should I buy?',
  'Savings: 25\nToday: 12, 8, 6, 15\nLater: 18, 10, 9, 20',
  'I have 10 euros and the stocks cost 3, 4 and 5. Which should I buy?',
];

const recorded = results.tasks.filter((task) => task.judge.examples.length > 0);

function Badge({ ok, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700 text-slate-300'
      }`}
    >
      <span aria-hidden="true">{ok ? '✓' : '–'}</span>
      {children}
    </span>
  );
}

function Json({ value }) {
  return <code className="block overflow-x-auto rounded-lg bg-slate-950 px-3 py-2 text-xs text-slate-300">{JSON.stringify(value)}</code>;
}

function Conversation({ question, toolCalls, answer, footer }) {
  return (
    <div className="space-y-3">
      <div className="ml-auto max-w-[90%] whitespace-pre-line rounded-2xl rounded-br-sm bg-sky-500/15 px-4 py-3 text-slate-100">
        {question}
      </div>
      {toolCalls.map((call, i) => (
        <div
          key={i}
          className={`rounded-xl border p-3 text-sm ${call.error ? 'border-amber-500/40 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}
        >
          <p className={`text-xs font-semibold uppercase tracking-widest ${call.error ? 'text-amber-400' : 'text-emerald-400'}`}>
            Tool: calculate_max_profit
          </p>
          {call.arguments && <><p className="mt-2 text-xs text-slate-400">The model sent</p><Json value={call.arguments} /></>}
          <p className="mt-2 text-xs text-slate-400">{call.error ? 'The tool rejected it' : 'The calculator returned'}</p>
          <Json value={call.error ? { error: call.error } : call.result} />
        </div>
      ))}
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-slate-800 px-4 py-3 text-slate-100">{answer}</div>
      {footer}
    </div>
  );
}

function LiveDemo({ model }) {
  const [question, setQuestion] = useState(SAMPLES[0]);
  const [state, setState] = useState({ loading: false, answer: null, error: null, asked: null, ms: 0 });

  const ask = async (event) => {
    event.preventDefault();
    const asked = question.trim();
    if (!asked) return;
    setState({ loading: true, answer: null, error: null, asked, ms: 0 });
    const start = performance.now();
    try {
      const answer = await askAdvisor(API_BASE_URL, asked);
      setState({ loading: false, answer, error: null, asked, ms: Math.round(performance.now() - start) });
    } catch (err) {
      setState({ loading: false, answer: null, error: err.message, asked, ms: 0 });
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={ask} className="space-y-3">
        <label htmlFor="advisor-question" className="block text-sm font-medium text-slate-200">
          Ask the advisor (running on {model})
        </label>
        <textarea
          id="advisor-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 focus:border-sky-400 focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={state.loading}
            className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {state.loading ? 'Thinking…' : 'Ask'}
          </button>
          {SAMPLES.slice(1).map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => setQuestion(sample)}
              className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300 hover:border-slate-400"
            >
              Try: {sample.split('\n')[0].slice(0, 32)}…
            </button>
          ))}
        </div>
      </form>
      <div aria-live="polite">
        {state.error && <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-amber-200">{state.error}</p>}
        {state.answer && (
          <Conversation
            question={state.asked}
            toolCalls={state.answer.toolCalls}
            answer={state.answer.answer}
            footer={
              <div className="flex flex-wrap gap-2">
                <Badge ok={state.answer.verified}>{state.answer.verified ? 'Verified against the calculator' : 'Not verified'}</Badge>
                <Badge ok>{state.answer.turns} model calls · {(state.ms / 1000).toFixed(1)} s</Badge>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

function RecordedDemo() {
  const [taskId, setTaskId] = useState(recorded[0].id);
  const task = recorded.find((t) => t.id === taskId);
  const example = task.judge.examples[0];
  const toolCalls = task.kind === 'calculate' ? [{ arguments: task.input, result: task.expected }] : [];
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-400">
        <p>
          <span className="font-semibold text-slate-200">Recorded, not live.</span> The advisor runs on a local
          Ollama model, so it is off on this site. These are real answers from the agent, recorded in the latest
          evaluation run ({results.generatedAt.slice(0, 10)}, {results.advisorModel}).
        </p>
        <details className="group mt-3">
          <summary className="cursor-pointer select-none font-medium text-sky-300 hover:text-sky-200">
            Try it live on your own machine
          </summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              Install <a href="https://ollama.com" className="text-sky-300 underline-offset-4 hover:underline">Ollama</a> and
              pull the model: <code className="text-slate-200">ollama pull {results.advisorModel}</code>
            </li>
            <li>
              Start the API with the advisor on:{' '}
              <code className="text-slate-200">APP_ADVISOR_ENABLED=true mvn spring-boot:run</code>
            </li>
            <li>
              Start the site: <code className="text-slate-200">cd site/frontend && npm ci && npm run dev</code>, then open{' '}
              <code className="text-slate-200">http://localhost:5173/#/testing-ai-agents</code>
            </li>
          </ol>
          <p className="mt-3">
            Or run everything in Docker:{' '}
            <code className="text-slate-200">ADVISOR_ENABLED=true docker compose up --build</code> and open{' '}
            <code className="text-slate-200">http://localhost:3000/#/testing-ai-agents</code>. This box then becomes a
            live “Ask the advisor” form.
          </p>
        </details>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Recorded questions">
        {recorded.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={t.id === taskId}
            onClick={() => setTaskId(t.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
              t.id === taskId ? 'bg-sky-500 text-slate-950' : 'border border-slate-600 text-slate-300 hover:border-slate-400'
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>
      <Conversation
        question={task.question}
        toolCalls={toolCalls}
        answer={example.answer}
        footer={
          <p className="text-sm text-slate-400">
            Judge ({results.judgeModel}): <span className="font-semibold text-slate-200">{example.verdict}</span>{' '}
            (votes: {example.votes.join(', ')}). {example.reason}
          </p>
        }
      />
    </div>
  );
}

/**
 * Recorded answers straight away; switches to the live advisor only if the
 * backend reports it enabled (which happens when running locally with
 * APP_ADVISOR_ENABLED=true). The hosted site never waits on the check.
 */
export default function AdvisorDemo() {
  const [status, setStatus] = useState({ enabled: false, model: null });
  useEffect(() => {
    let cancelled = false;
    getAdvisorStatus(API_BASE_URL).then((s) => { if (!cancelled) setStatus(s); });
    return () => { cancelled = true; };
  }, []);

  return status.enabled ? <LiveDemo model={status.model} /> : <RecordedDemo />;
}
