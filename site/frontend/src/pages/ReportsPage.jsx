import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';
import { reportUrl, useReportsAvailable } from '../utils/reports';

function ReportsPage() {
  usePageTitle('Reports');
  const [selectedReport, setSelectedReport] = useState('unit');
  const { available, checking } = useReportsAvailable();

  const reportCategories = [
    {
      id: 'unit',
      name: 'Unit Tests',
      color: 'bg-emerald-500',
      icon: '🧪',
      description: 'Classes in isolation: example-based and property-based tests of the engine, the rate limiter and configuration.',
      reports: [
        {
          id: 'surefire-unit',
          name: 'Test Results',
          description: 'JUnit results for every Java test in the report run',
          file: 'surefire-report.html',
        },
        {
          id: 'jacoco-unit',
          name: 'Code Coverage',
          description: 'JaCoCo coverage (the build fails below 95% lines / 80% branches)',
          file: 'jacoco/index.html',
        },
        {
          id: 'xref-unit',
          name: 'Source Code',
          description: 'Production source, cross-referenced',
          file: 'xref/index.html',
        },
      ],
    },
    {
      id: 'web',
      name: 'Web Layer Tests',
      color: 'bg-blue-500',
      icon: '🌐',
      description: 'Spring MVC on its own with MockMvc: request mapping, validation, status codes, the rate-limit filter and metrics.',
      reports: [
        {
          id: 'surefire-web',
          name: 'Test Results',
          description: 'HTTP status tests (200/400/405/415/429)',
          file: 'surefire-report.html#com.maxprofit.calculator.controller.CalculatorControllerHttpStatusTest',
        },
        {
          id: 'xref-web',
          name: 'Test Source Code',
          description: 'CalculatorControllerHttpStatusTest source',
          file: 'xref-test/com/maxprofit/calculator/controller/CalculatorControllerHttpStatusTest.html',
        },
      ],
    },
    {
      id: 'integration',
      name: 'Integration Tests',
      color: 'bg-indigo-500',
      icon: '🔗',
      description: 'The whole Spring application on a real embedded Tomcat: CORS, client-IP resolution behind a proxy, rate limiting, input limits, error format and OpenAPI docs.',
      reports: [
        {
          id: 'surefire-integration',
          name: 'Test Results',
          description: 'ApiSecurityTest results',
          file: 'surefire-report.html#com.maxprofit.calculator.controller.ApiSecurityTest',
        },
        {
          id: 'xref-integration',
          name: 'Test Source Code',
          description: 'ApiSecurityTest source',
          file: 'xref-test/com/maxprofit/calculator/controller/ApiSecurityTest.html',
        },
      ],
    },
    {
      id: 'system',
      name: 'System Tests',
      color: 'bg-orange-500',
      icon: '🐳',
      description: 'Black-box tests against the Docker images, started by Testcontainers. They run in the container workflow (and locally with -Pcontainer-tests), not in the report run.',
      reports: [
        {
          id: 'xref-system',
          name: 'Test Source Code',
          description: 'ContainerTests source',
          file: 'xref-test/com/maxprofit/calculator/ContainerTests.html',
        },
      ],
    },
    {
      id: 'e2e',
      name: 'UI / E2E & BDD',
      color: 'bg-red-500',
      icon: '🎭',
      description: 'The real app in a browser. Includes the BDD acceptance scenarios agreed with the Product Owner, QA and developers, automated through the UI with Cucumber and Playwright.',
      reports: [
        {
          id: 'cucumber',
          name: 'BDD Acceptance Scenarios',
          description: 'Cucumber report for MaxProfit.feature: every scenario and step, run against the UI',
          file: 'cucumber-report/index.html',
          external: true,
        },
        {
          id: 'playwright-html',
          name: 'Playwright HTML Report',
          description: 'JavaScript end-to-end tests: interactive timeline, traces, screenshots',
          file: 'playwright-report/index.html',
          external: true,
        },
        {
          id: 'surefire-ui',
          name: 'Scenario results (JUnit)',
          description: 'JUnit view of the BDD scenarios',
          file: 'surefire-report.html#com.maxprofit.calculator.RunCucumberTest',
        },
      ],
    },
    {
      id: 'performance',
      name: 'Performance Tests',
      color: 'bg-purple-500',
      icon: '⚡',
      description: 'StressTests: median time per call after a warm-up at the maximum budget, and bytes allocated, with limits far above the measured cost. ApiPerformanceTests (median end-to-end latency) runs in the container workflow.',
      reports: [
        {
          id: 'surefire-stress',
          name: 'Stress Test Results',
          description: 'StressTests results',
          file: 'surefire-report.html#com.maxprofit.calculator.StressTests',
        },
        {
          id: 'xref-stress',
          name: 'Stress Test Source',
          description: 'StressTests source',
          file: 'xref-test/com/maxprofit/calculator/StressTests.html',
        },
        {
          id: 'xref-api-performance',
          name: 'API Performance Test Source',
          description: 'ApiPerformanceTests source',
          file: 'xref-test/com/maxprofit/calculator/ApiPerformanceTests.html',
        },
      ],
    },
    {
      id: 'mutation',
      name: 'Mutation Testing',
      color: 'bg-yellow-500',
      icon: '✦',
      description: 'PITest mutation testing. It runs in the main CI workflow (the build fails below a 90% score); the published site shows a placeholder because the report run skips it.',
      reports: [
        {
          id: 'pitest',
          name: 'Mutation Test Report',
          description: 'PITest results',
          file: 'pit-reports/index.html',
        },
      ],
    },
    {
      id: 'quality',
      name: 'Code Quality',
      color: 'bg-slate-500',
      icon: '🔍',
      description: 'Static analysis and project reports.',
      reports: [
        {
          id: 'checkstyle',
          name: 'Checkstyle',
          description: 'Code style enforcement',
          file: 'checkstyle.html',
        },
        {
          id: 'dependencies',
          name: 'Dependencies',
          description: 'Dependency analysis',
          file: 'dependencies.html',
        },
        {
          id: 'project-info',
          name: 'Project Information',
          description: 'Project details',
          file: 'project-info.html',
        },
      ],
    },
  ];

  const activeCategory = reportCategories.find(cat => cat.id === selectedReport) || reportCategories[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-12"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
            Test Reports
          </h1>
          <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto">
            View detailed test reports organized by testing layer.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Test Layers</h2>
              <div className="space-y-2">
                {reportCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedReport(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedReport === category.id
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mt-4">
              <h3 className="text-sm font-semibold text-white mb-2">Generate All Reports</h3>
              <code className="block bg-slate-900 p-2 rounded text-xs text-cyan-400">
                mvn site
              </code>
              <p className="text-xs text-slate-400 mt-2">
                Output lands in <code className="text-cyan-400">target/site/</code>. CI publishes it to
                GitHub Pages on every change to <code className="text-cyan-400">main</code>.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-3"
          >
            <div className="bg-slate-800 rounded-xl border border-slate-700 mb-4">
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${activeCategory.color}`}>{activeCategory.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{activeCategory.name}</h3>
                    <p className="text-sm text-slate-400">{activeCategory.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h4 className="text-sm font-medium text-white mb-3">Available Reports</h4>
                {checking ? (
                  <p className="text-sm text-slate-400">Checking report availability…</p>
                ) : available === false ? (
                  <div
                    role="status"
                    className="p-4 bg-slate-900 rounded-lg border border-slate-700 text-sm text-slate-400"
                  >
                    <p className="text-amber-300 font-semibold mb-2">
                      Reports are not available in this deployment.
                    </p>
                    <p>
                      Reports are published to GitHub Pages by CI and could not be reached. Run{' '}
                      <code className="text-cyan-400">mvn site</code> to generate them locally in{' '}
                      <code className="text-cyan-400">target/site/</code>.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeCategory.reports.map(report => (
                      <a
                        key={report.id}
                        // The Playwright HTML report sits at the Pages root
                        // (`external: true`) so its relative ./data and ./trace
                        // links resolve; everything else is under /reports/.
                        href={reportUrl(report.file, { external: report.external })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <span className="text-cyan-400">📄</span>
                        <div>
                          <div className="text-sm font-medium text-white">{report.name}</div>
                          <div className="text-xs text-slate-500">{report.description}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center text-slate-500"
        >
          <p>
            Reports are served from the local build directory.
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default ReportsPage;
