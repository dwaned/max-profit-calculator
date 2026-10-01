import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TechniqueIcon from '../components/TechniqueIcon';
import { featuredReports, layerReports, projectReports } from '../data/reports';
import { layerOrder, layerTestCount, testLayers } from '../data/testLayers';
import { usePageTitle } from '../hooks/usePageTitle';
import { reportUrl, useReportsAvailable } from '../utils/reports';

const linkUrl = (link) => link.href ?? reportUrl(link.file, { external: link.external });

// Pyramid layers top-down, then the cross-cutting performance checks.
const layers = [...layerOrder, 'performance'].map((id) => testLayers.find((l) => l.id === id));

function Availability({ available, checking }) {
  if (checking) {
    return <p className="text-sm text-slate-400" role="status">Checking the published reports…</p>;
  }
  if (available) {
    return (
      <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300" role="status">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-400" />
        Published by CI from the latest change to main
      </p>
    );
  }
  return (
    <div role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-slate-300">
      <p className="font-semibold text-amber-300">The published reports can’t be reached right now.</p>
      <p className="mt-1">
        They live on GitHub Pages. You can generate the same reports locally; see “Generate them yourself” below.
      </p>
    </div>
  );
}

function OpenLink({ href, children, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${className}`}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function ReportsPage() {
  usePageTitle('Reports');
  const [selectedLayer, setSelectedLayer] = useState('unit');
  const { available, checking } = useReportsAvailable();
  const layer = testLayers.find((l) => l.id === selectedLayer);
  const detail = layerReports[selectedLayer];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-14">
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Reports</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-bold text-white leading-tight">The evidence</h1>
          <p className="mt-4 text-base md:text-lg text-slate-400 leading-relaxed">
            Tests are only useful if someone can see what they found. Every change to main runs the suite and
            publishes these reports. Each one answers a different question.
          </p>
          <div className="mt-5">
            <Availability available={available} checking={checking} />
          </div>
        </motion.header>

        {/* Featured reports */}
        <section aria-labelledby="featured-heading" className="mt-12">
          <h2 id="featured-heading" className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Start here
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredReports.map((report) => {
              const body = (
                <>
                  <span className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900" style={{ color: report.hex }}>
                      <TechniqueIcon name={report.icon} />
                    </span>
                    <span className="text-lg font-semibold text-white">{report.title}</span>
                  </span>
                  <span className="mt-3 block text-slate-200 leading-snug">{report.question}</span>
                  <span className="mt-3 block text-sm text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-300">Look for: </span>
                    {report.lookFor}
                  </span>
                </>
              );
              return available === false ? (
                <div key={report.id} className="flex flex-col rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5 opacity-70">
                  {body}
                </div>
              ) : (
                <OpenLink
                  key={report.id}
                  href={reportUrl(report.file, { external: report.external })}
                  className="group flex flex-col rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5 transition-colors hover:border-slate-500"
                >
                  {body}
                  <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: report.hex }}>
                    Open report <TechniqueIcon name="external" className="h-4 w-4" />
                  </span>
                </OpenLink>
              );
            })}
          </div>
        </section>

        {/* By layer */}
        <section aria-labelledby="layers-heading" className="mt-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">By layer</p>
          <h2 id="layers-heading" className="mt-1 text-2xl sm:text-3xl font-bold text-white">
            Reports for each layer of the pyramid
          </h2>
          <p className="mt-2 max-w-3xl text-slate-400 leading-relaxed">
            Not every test runs in the same place: the slowest ones run against the Docker images after a merge.
            Each layer says where its tests run and links to their results and source.
          </p>

          <div role="group" aria-label="Choose a test layer" className="mt-6 flex flex-wrap gap-2">
            {layers.map((l) => {
              const selected = l.id === selectedLayer;
              return (
                <button
                  key={l.id}
                  type="button"
                  aria-pressed={selected}
                  aria-controls="layer-panel"
                  onClick={() => setSelectedLayer(l.id)}
                  className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  style={
                    selected
                      ? { backgroundColor: l.hex, color: '#0f172a' }
                      : { boxShadow: `inset 0 0 0 1px ${l.hex}80`, color: '#e2e8f0' }
                  }
                >
                  {!selected && <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: l.hex }} />}
                  {l.shortName}
                </button>
              );
            })}
          </div>

          <motion.div
            key={selectedLayer}
            id="layer-panel"
            aria-live="polite"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-800/40"
          >
            <div className="h-1.5" style={{ backgroundColor: layer.hex }} />
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
              <div>
                <h3 className="text-xl font-semibold text-white">{layer.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{layerTestCount(layer)} tests</p>
                <p className="mt-3 text-slate-300 leading-relaxed">{layer.question}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Where it runs</p>
                <p className="mt-1 text-slate-300 leading-relaxed">{detail.whereItRuns}</p>
                <Link
                  to={`/testing-pyramid?layer=${layer.id}`}
                  className="mt-4 inline-block text-sm text-sky-300 hover:underline underline-offset-4"
                >
                  What this layer tests →
                </Link>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 content-start">
                {detail.links.map((link) => (
                  <li key={link.label}>
                    <OpenLink
                      href={linkUrl(link)}
                      className="flex h-full flex-col rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 transition-colors hover:border-slate-500"
                    >
                      <span className="flex items-center justify-between gap-2 font-medium text-slate-100">
                        {link.label}
                        <TechniqueIcon name="external" className="h-4 w-4 shrink-0 text-slate-500" />
                      </span>
                      <span className="mt-1 text-sm text-slate-400">{link.description}</span>
                    </OpenLink>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </section>

        {/* More */}
        <div className="mt-20 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5">
            <h2 className="text-lg font-semibold text-white">More project reports</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {projectReports.map((report) => (
                <li key={report.file}>
                  <OpenLink
                    href={reportUrl(report.file)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 px-3 py-1 text-sm text-slate-200 hover:border-slate-400"
                  >
                    {report.label}
                    <TechniqueIcon name="external" className="h-3.5 w-3.5 text-slate-500" />
                  </OpenLink>
                </li>
              ))}
            </ul>
          </section>

          <details className="group rounded-2xl border border-slate-700/80 bg-slate-800/40">
            <summary className="cursor-pointer select-none list-none px-5 py-4 flex items-center justify-between rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              <span>
                <span className="block text-lg font-semibold text-white">Generate them yourself</span>
                <span className="block text-sm text-slate-400">The same reports, built locally</span>
              </span>
              <span aria-hidden="true" className="text-xl text-slate-400 transition-transform group-open:rotate-90">›</span>
            </summary>
            <div className="px-5 pb-5">
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-300 leading-relaxed">
                <code>{`mvn -Ppitest test-compile     # mutation report
mvn -DskipITs -Dpitest.skip=true verify site
open target/site/index.html`}</code>
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
