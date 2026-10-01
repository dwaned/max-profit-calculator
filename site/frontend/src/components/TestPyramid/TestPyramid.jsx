import { motion } from 'framer-motion';
import { testLayers, layerOrder, layerTestCount, bddInfo, propertyBasedInfo } from '../../data/testLayers';

// Widths grow from the narrow top layer to the full-width base.
const TOP_WIDTH = 45;
const widthFor = (index) => TOP_WIDTH + (index * (100 - TOP_WIDTH)) / (layerOrder.length - 1);

function TestPyramid({ onLayerSelect, selectedLayer }) {
  return (
    <div className="relative w-full max-w-lg mx-auto px-4 sm:px-12">
      <div className="flex">
        <div className="flex flex-col justify-between py-2 pr-4 text-xs text-slate-500" style={{ height: '280px' }}>
          <span className="text-right">Few<br />Slow<br />Expensive</span>
          <span className="text-right">Many<br />Fast<br />Cheap</span>
        </div>
        
        <div className="flex-1 flex flex-col items-center">
          {layerOrder.map((layerId, index) => {
            const layer = testLayers.find(l => l.id === layerId);
            const isSelected = selectedLayer === layerId;
            const shouldDim = selectedLayer !== null && !isSelected;
            const hasBdd = bddInfo.appliesTo.includes(layerId);
            const hasPropertyBased = propertyBasedInfo.appliesTo.includes(layerId);

            return (
              <div key={layer.id} className="relative w-full flex justify-center">
                {/* BDD badge just right of its layer, arrow pointing at the layer */}
                {hasBdd && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 flex items-center"
                    style={{ left: `${50 + widthFor(index) / 2}%` }}
                  >
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" viewBox="0 0 40 40">
                      <defs>
                        <marker
                          id="arrowhead-bdd"
                          markerWidth="6"
                          markerHeight="6"
                          refX="1"
                          refY="3"
                          orient="auto"
                        >
                          <polygon points="6 0, 0 3, 6 6" fill="#a855f7" />
                        </marker>
                      </defs>
                      <line
                        x1="38"
                        y1="20"
                        x2="6"
                        y2="20"
                        stroke="#a855f7"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        markerEnd="url(#arrowhead-bdd)"
                      />
                    </svg>
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded whitespace-nowrap"
                    >
                      {bddInfo.name}
                    </motion.span>
                  </div>
                )}

                <motion.button
                  onClick={() => onLayerSelect(layerId)}
                  className={`
                    relative h-16 flex items-center justify-center rounded-lg
                    transition-all duration-300 cursor-pointer border-l-4
                    ${layer.color} ${layer.borderColor}
                    ${shouldDim ? 'opacity-30' : 'opacity-100'}
                    ${isSelected ? 'ring-2 ring-white' : ''}
                  `}
                  style={{
                    width: `${widthFor(index)}%`,
                  }}
                  whileHover={{ scale: 1.02, opacity: 1 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: shouldDim ? 0.3 : 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {/* The base layer is full width, so its technique badge sits inside it
                      (hidden on very small screens; the details panel shows it too) */}
                  {hasPropertyBased && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="absolute left-3 hidden sm:inline-block px-2 py-0.5 bg-cyan-600 text-white text-xs font-bold rounded whitespace-nowrap"
                    >
                      {propertyBasedInfo.name}
                    </motion.span>
                  )}
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {layer.shortName || layer.name}
                  </span>
                  <span className="absolute right-3 text-white/70 text-xs">
                    {layerTestCount(layer)}
                  </span>
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TestPyramid;
