import { motion } from 'framer-motion';
import { testingTechniques } from '../data/testLayers';

function TestingTechniquesPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Testing Techniques
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            These techniques can be applied at different testing levels. They are not mutually exclusive -
            you can use multiple techniques together to get better coverage.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testingTechniques.map((technique, index) => (
            <motion.div
              key={technique.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span 
                    className={`w-10 h-10 rounded-lg ${technique.color} flex items-center justify-center text-white text-lg font-bold`}
                  >
                    {technique.icon}
                  </span>
                  <h3 className="text-lg font-semibold text-white">
                    {technique.name}
                  </h3>
                </div>

                <p className="text-slate-300 text-sm mb-4">
                  {technique.description}
                </p>

                <div className="bg-slate-900 rounded-lg p-3 mb-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">
                    When to use
                  </h4>
                  <p className="text-sm text-slate-300">
                    {technique.whenToUse}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">
                    Example
                  </h4>
                  <pre className="bg-slate-950 rounded-lg p-3 overflow-x-auto text-xs">
                    <code className="text-emerald-300 font-mono">
                      {technique.example}
                    </code>
                  </pre>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center text-slate-500"
        >
          <p>
            Run tests: <code className="bg-slate-800 px-2 py-1 rounded">mvn test</code>
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default TestingTechniquesPage;
