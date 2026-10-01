import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TechniqueIcon from '../components/TechniqueIcon';
import TechniqueDiagram from '../components/Techniques/TechniqueDiagram';
import { techniques } from '../data/techniques';
import { testLayers } from '../data/testLayers';
import { usePageTitle } from '../hooks/usePageTitle';

const layerById = Object.fromEntries(testLayers.map((l) => [l.id, l]));

const scrollToTechnique = (id) =>
  document.getElementById(`technique-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

function Heading({ children, color = 'text-slate-400' }) {
  return <h3 className={`text-xs font-semibold uppercase tracking-widest mb-2 ${color}`}>{children}</h3>;
}

function TechniqueSection({ technique }) {
  const { hex } = technique;
  return (
    <motion.article
      id={`technique-${technique.id}`}
      aria-labelledby={`technique-${technique.id}-name`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.3 }}
      className="scroll-mt-24 rounded-2xl border border-slate-700/80 bg-slate-800/40 overflow-hidden"
    >
      <div className="h-1.5" style={{ backgroundColor: hex }} />
      <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="space-y-6">
          <header>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900" style={{ color: hex }}>
                <TechniqueIcon name={technique.icon} />
              </span>
              <h2 id={`technique-${technique.id}-name`} className="text-2xl font-bold text-white">
                {technique.name}
              </h2>
            </div>
            <p className="mt-3 text-lg font-medium" style={{ color: hex }}>“{technique.question}”</p>
          </header>

          <section>
            <Heading>The idea</Heading>
            <p className="text-slate-300 leading-relaxed">{technique.idea}</p>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section>
              <Heading color="text-emerald-400">Why it matters</Heading>
              <p className="text-slate-300 leading-relaxed">{technique.whyItMatters}</p>
            </section>
            <section>
              <Heading color="text-sky-400">Use it when</Heading>
              <p className="text-slate-300 leading-relaxed">{technique.useWhen}</p>
            </section>
          </div>

          <section>
            <Heading color="text-amber-400">Watch out for</Heading>
            <ul className="space-y-2">
              {technique.watchOut.map((item) => (
                <li key={item} className="flex gap-2.5 text-slate-300 leading-relaxed">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 font-bold text-amber-400">!</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-4">
          <figure className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <TechniqueDiagram name={technique.diagram} hex={hex} />
          </figure>

          <section
            className="rounded-xl border p-4"
            style={{ borderColor: `${hex}66`, backgroundColor: `${hex}12` }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: hex }}>In this project</p>
            <p className="mt-1.5 text-slate-200 leading-relaxed">{technique.inThisProject}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Used at:</span>
              {technique.layers.map((id) => (
                <Link
                  key={id}
                  to={`/testing-pyramid?layer=${id}`}
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  style={{ backgroundColor: `${layerById[id].hex}40`, boxShadow: `inset 0 0 0 1px ${layerById[id].hex}` }}
                >
                  {layerById[id].shortName}
                </Link>
              ))}
            </div>
          </section>

          <details className="group rounded-xl border border-slate-700 bg-slate-900/50">
            <summary className="cursor-pointer select-none list-none px-4 py-3 text-sm font-medium text-slate-200 flex items-center justify-between rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              See it in code
              <span aria-hidden="true" className="text-slate-400 transition-transform group-open:rotate-90">›</span>
            </summary>
            <div className="px-4 pb-4">
              <p className="mb-2 font-mono text-xs text-slate-500">{technique.codeTitle}</p>
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300 leading-relaxed">
                <code>{technique.code}</code>
              </pre>
            </div>
          </details>
        </div>
      </div>
    </motion.article>
  );
}

function TestingTechniquesPage() {
  usePageTitle('Testing Techniques');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-14">
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Testing Techniques</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-bold text-white leading-tight">
            Choosing the right kind of test
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-400 leading-relaxed">
            A layer of the <Link to="/testing-pyramid" className="text-sky-300 hover:underline underline-offset-4">testing pyramid</Link> says
            where a test runs. A technique says how you choose its inputs and decide whether it passed. They combine
            freely, and the best place to start is the question you need answered.
          </p>
        </motion.header>

        <section aria-labelledby="questions-heading" className="mt-10">
          <h2 id="questions-heading" className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Start from your question
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {techniques.map((technique) => (
              <button
                key={technique.id}
                type="button"
                onClick={() => scrollToTechnique(technique.id)}
                className="group flex flex-col items-start rounded-xl border border-slate-700/80 bg-slate-800/50 p-4 text-left transition-colors hover:border-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span className="text-slate-200 leading-snug">“{technique.question}”</span>
                <span className="mt-auto pt-3 flex items-center gap-2 text-sm font-semibold" style={{ color: technique.hex }}>
                  <TechniqueIcon name={technique.icon} className="h-4 w-4" />
                  {technique.name}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </button>
            ))}
            <Link
              to="/testing-pyramid"
              className="group flex flex-col items-start rounded-xl border border-dashed border-slate-600 p-4 transition-colors hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="text-slate-200 leading-snug">“Where should this test live?”</span>
              <span className="mt-auto pt-3 flex items-center gap-2 text-sm font-semibold text-sky-300">
                The testing pyramid
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          </div>
        </section>

        <div className="mt-14 space-y-8">
          {techniques.map((technique) => (
            <TechniqueSection key={technique.id} technique={technique} />
          ))}
        </div>

        <footer className="mt-16 rounded-2xl border border-slate-700/80 bg-slate-800/40 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-lg font-semibold text-white">See where each technique fits</p>
            <p className="mt-1 text-slate-400">The testing pyramid shows every layer, what it catches and what it costs.</p>
          </div>
          <Link
            to="/testing-pyramid"
            className="mt-4 sm:mt-0 inline-flex shrink-0 items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950 hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Explore the pyramid →
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default TestingTechniquesPage;
