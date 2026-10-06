import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AdvisorDemo from '../components/AgentTesting/AdvisorDemo';
import AgentFlow from '../components/AgentTesting/AgentFlow';
import AgentLayerExplainer from '../components/AgentTesting/AgentLayerExplainer';
import EvalResults from '../components/AgentTesting/EvalResults';
import PyramidDiagram from '../components/TestPyramid/PyramidDiagram';
import { agentLayerOrder, agentLayers, agentSource } from '../data/agentLayers';
import { vibeTesting } from '../data/vibeTesting';
import { usePageTitle } from '../hooks/usePageTitle';

const pyramidLayers = agentLayerOrder.map((id) => agentLayers.find((l) => l.id === id));

const commands = [
  { command: 'ollama pull qwen3.5:4b && ollama pull gemma3:12b', what: 'The advisor’s model and the judge’s model' },
  { command: 'APP_ADVISOR_ENABLED=true mvn spring-boot:run', what: 'Run the API with the advisor switched on' },
  { command: 'cd site/frontend && npm ci && npm run dev', what: 'Run the site; open http://localhost:5173/#/testing-ai-agents to ask the advisor live' },
  { command: 'mvn test -Dtest=StockAdvisorTests,ProfitToolTests,AdvisorReplayTests', what: 'Deterministic and replay layers: no model needed, as in CI' },
  { command: 'mvn test -Dtest=AdvisorReplayTests -Dadvisor.record=true', what: 'Re-record the replayed conversations after changing the prompt or tool' },
  { command: 'mvn test -Pagent-evals', what: 'Repeated runs and the LLM judge (about 10 minutes); updates the results on this page' },
];

function SectionHeading({ id, eyebrow, title, children }) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">{eyebrow}</p>
      <h2 id={id} className="mt-1 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      {children && <p className="mt-2 max-w-3xl leading-relaxed text-slate-400">{children}</p>}
    </>
  );
}

function TestingAgentsPage() {
  usePageTitle('Testing AI Agents');
  const [selectedLayer, setSelectedLayer] = useState('deterministic');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-14">
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Testing AI Agents</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-white md:text-5xl">Testing an AI agent</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400 md:text-lg">
            Ordinary code gives the same answer every time; a language model does not. So the{' '}
            <Link to="/testing-pyramid" className="text-sky-300 underline-offset-4 hover:underline">classic pyramid</Link>,
            which sorts tests by type, needs a companion that sorts them by how much uncertainty each layer can
            tolerate. This page tests a real agent built into this project with that pyramid.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Inspired by{' '}
            <a href={agentSource.url} target="_blank" rel="noopener noreferrer" className="text-sky-300 underline-offset-4 hover:underline">
              {agentSource.author}, “{agentSource.title}”<span className="sr-only"> (opens in a new tab)</span>
            </a>.
          </p>
        </motion.header>

        <section aria-labelledby="agent-heading" className="mt-14">
          <SectionHeading id="agent-heading" eyebrow="The agent" title="Meet the stock advisor">
            Ask it a question in plain language. A small local model reads it and calls the calculator as a tool;
            the calculator does the maths, and the model explains the result. Because the calculator is exact, every
            answer can be checked: it is marked verified only if it quotes the calculator’s profit.
          </SectionHeading>
          <div className="mt-6 rounded-2xl border border-slate-700/80 bg-slate-800/40 p-4 sm:p-6">
            <AgentFlow />
          </div>
          <div className="mt-6 rounded-2xl border border-slate-700/80 bg-slate-800/40 p-4 sm:p-6">
            <AdvisorDemo />
          </div>
        </section>

        <section aria-labelledby="pyramid-heading" className="mt-20">
          <SectionHeading id="pyramid-heading" eyebrow="The pyramid" title="Four layers, by uncertainty">
            The bottom two layers replace the model with something predictable, so they run on every pull request
            for free. The top two use the real model, many times over, and run on demand.
          </SectionHeading>
          <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
            <div className="lg:sticky lg:top-24">
              <PyramidDiagram
                layers={pyramidLayers}
                selectedLayer={selectedLayer}
                onSelect={setSelectedLayer}
                subtitle={(layer) => layer.runs}
                axis={{
                  up: 'More uncertain, real model, on demand',
                  down: 'Predictable, fast, every pull request',
                  mobileUp: 'More uncertain',
                  mobileDown: 'Predictable, fast',
                }}
                label="Test pyramid for AI agents. Select a layer to learn what it tests."
              />
              <p className="mt-4 text-center text-sm text-slate-500">Select a layer, or use the arrow keys.</p>
            </div>
            <AgentLayerExplainer layerId={selectedLayer} />
          </div>
        </section>

        <section aria-labelledby="results-heading" className="mt-20">
          <SectionHeading id="results-heading" eyebrow="The evidence" title="The latest evaluation">
            Every task is asked ten times. The first full run failed its quality bar: given no future prices, the
            model copied today’s prices and calculated anyway in 10 of 10 runs. A clearer prompt brought that down
            to 1 in 10. These are the results after the fix.
          </SectionHeading>
          <div className="mt-6">
            <EvalResults />
          </div>
        </section>

        <section aria-labelledby="vibe-heading" className="mt-20">
          <SectionHeading id="vibe-heading" eyebrow="Vibe-testing" title="When an agent writes the code">
            {vibeTesting.intro}
          </SectionHeading>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {vibeTesting.habits.map((habit, i) => (
              <article key={habit.id} className="flex flex-col rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5">
                <p className="text-xs font-semibold tabular-nums text-sky-400">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{habit.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-300">{habit.idea}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  <span className="font-semibold text-slate-200">What happened here: </span>{habit.happened}
                </p>
                <p className="mt-auto pt-3 text-sm leading-relaxed text-emerald-300/90">
                  <span className="font-semibold">Do: </span>{habit.practice}
                </p>
              </article>
            ))}
          </div>
        </section>

        <details className="group mt-20 rounded-2xl border border-slate-700/80 bg-slate-800/40">
          <summary className="flex cursor-pointer select-none list-none items-center justify-between rounded-2xl px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
            <span>
              <span className="block text-lg font-semibold text-white">Run it yourself</span>
              <span className="block text-sm text-slate-400">Needs <a href="https://ollama.com" className="text-sky-300">Ollama</a> for the live advisor and the top two layers</span>
            </span>
            <span aria-hidden="true" className="text-xl text-slate-400 transition-transform group-open:rotate-90">›</span>
          </summary>
          <dl className="space-y-4 px-5 pb-5">
            {commands.map(({ command, what }) => (
              <div key={command}>
                <dt><code className="block overflow-x-auto rounded-lg bg-slate-950 px-3 py-2 text-sm text-slate-200">{command}</code></dt>
                <dd className="mt-1 text-sm text-slate-400">{what}</dd>
              </div>
            ))}
          </dl>
        </details>
      </div>
    </div>
  );
}

export default TestingAgentsPage;
