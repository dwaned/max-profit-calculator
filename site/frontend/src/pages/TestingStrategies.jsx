import { useState } from 'react';
import { motion } from 'framer-motion';
import TestPyramid from '../components/TestPyramid/TestPyramid';
import LayerDetail from '../components/TestPyramid/LayerDetail';
import { testLayers } from '../data/testLayers';

function TestingStrategies() {
  const [selectedLayer, setSelectedLayer] = useState('unit');

  const handleLayerSelect = (layerId) => {
    setSelectedLayer(layerId);
  };

  const selectedLayerData = testLayers.find(l => l.id === selectedLayer);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-12"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
            Testing Pyramid
          </h1>
          <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto">
            Explore the different testing layers in this project.
            Click on each layer to understand what each level covers.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TestPyramid
              onLayerSelect={handleLayerSelect}
              selectedLayer={selectedLayer}
            />
            <p className="text-center text-sm text-slate-500 mt-4">
              Click on layers to explore details • Purple = BDD • Cyan = Property-Based
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-white mb-6">
              {selectedLayerData?.name} Details
            </h2>
            <LayerDetail layerId={selectedLayer} />
          </motion.div>
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

export default TestingStrategies;
