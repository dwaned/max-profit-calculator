import { useState } from 'react';
import { motion } from 'framer-motion';

function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('unit');

  const reportCategories = [
    {
      id: 'unit',
      name: 'Unit Tests',
      color: 'bg-emerald-500',
      icon: '🧪',
      description: 'Example-based and property-based tests that verify core business logic',
      reports: [
        {
          id: 'surefire-unit',
          name: 'Test Results',
          description: 'JUnit test results for unit tests',
          file: 'surefire-report.html',
        },
        {
          id: 'jacoco-unit',
          name: 'Code Coverage',
          description: 'JaCoCo code coverage report',
          file: 'jacoco/index.html',
        },
        {
          id: 'xref-unit',
          name: 'Source Code',
          description: 'Source code cross-reference',
          file: 'xref/index.html',
        },
      ],
    },
    {
      id: 'controller',
      name: 'Controller Tests',
      color: 'bg-blue-500',
      icon: '🎮',
      description: 'API endpoint tests verifying HTTP contracts',
      reports: [
        {
          id: 'surefire-controller',
          name: 'Test Results',
          description: 'Controller test results',
          file: 'surefire-report.html',
        },
        {
          id: 'xref-controller',
          name: 'Source Code',
          description: 'Controller source code',
          file: 'xref/index.html',
        },
      ],
    },
    {
      id: 'performance',
      name: 'Performance Tests',
      color: 'bg-purple-500',
      icon: '⚡',
      description: 'Algorithm execution time and memory profiling tests',
      reports: [
        {
          id: 'surefire-performance',
          name: 'Test Results',
          description: 'Performance test results',
          file: 'surefire-report.html',
        },
        {
          id: 'xref-performance',
          name: 'Source Code',
          description: 'Performance test source code',
          file: 'xref-test/index.html',
        },
      ],
    },
    {
      id: 'mutation',
      name: 'Mutation Testing',
      color: 'bg-yellow-500',
      icon: '✦',
      description: 'PITest mutation testing to verify test effectiveness',
      reports: [
        {
          id: 'pitest',
          name: 'Mutation Test Report',
          description: 'PITest mutation testing results',
          file: 'pitest/index.html',
        },
      ],
    },
    {
      id: 'integration',
      name: 'Integration Tests',
      color: 'bg-orange-500',
      icon: '🔗',
      description: 'Container-based integration tests',
      reports: [
        {
          id: 'surefire-integration',
          name: 'Test Results',
          description: 'Integration test results',
          file: 'surefire-report.html',
        },
      ],
    },
    {
      id: 'quality',
      name: 'Code Quality',
      color: 'bg-slate-500',
      icon: '🔍',
      description: 'Static analysis and code quality reports',
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
          description: 'Project details and team',
          file: 'project-info.html',
        },
      ],
    },
  ];

  const activeCategory = reportCategories.find(cat => cat.id === selectedReport) || reportCategories[0];
  const activeReport = activeCategory.reports[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Test Reports
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            View detailed test reports organized by testing layer.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                Then copy to: <code className="text-cyan-400">site/frontend/public/reports/</code>
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
              
              <div className="p-4 border-b border-slate-700">
                <h4 className="text-sm font-medium text-white mb-3">Available Reports</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCategory.reports.map(report => (
                    <a
                      key={report.id}
                      href={report.file}
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
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-3"
          >
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {activeCategory.name} Reports
                </h3>
              </div>
              
              <p className="text-slate-400 mb-4">
                Click on a report below to view it in a new tab.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeCategory.reports.map(report => (
                  <a
                    key={report.id}
                    href={report.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">📄</span>
                    <div>
                      <div className="font-medium text-white">{report.name}</div>
                      <div className="text-xs text-slate-400">{report.description}</div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-6 p-4 bg-slate-900 rounded-lg">
                <p className="text-sm text-slate-400">
                  <strong className="text-white">Note:</strong> Reports are static HTML files served from the public folder. 
                  If reports don't appear, run text-cyan-<code className="400">mvn site</code> and copy to <code className="text-cyan-400">public/reports/</code>
                </p>
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
