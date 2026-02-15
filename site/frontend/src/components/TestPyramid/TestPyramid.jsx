import { motion } from 'framer-motion';
import { testLayers, layerOrder, bddInfo, propertyBasedInfo } from '../../data/testLayers';

function TestPyramid({ onLayerSelect, selectedLayer }) {
  return (
    <div className="relative w-full max-w-lg mx-auto">
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
                {/* BDD badge on the right */}
                {hasBdd && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pr-2 flex items-center">
                    <svg 
                      className="w-8 h-8 text-purple-400" 
                      viewBox="0 0 40 40"
                    >
                      <defs>
                        <marker
                          id="arrowhead-bdd"
                          markerWidth="6"
                          markerHeight="6"
                          refX="5"
                          refY="3"
                          orient="auto"
                        >
                          <polygon 
                            points="0 0, 6 3, 0 6" 
                            fill="#a855f7" 
                          />
                        </marker>
                      </defs>
                      <line
                        x1="0"
                        y1="20"
                        x2="32"
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
                      className="ml-1 px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded whitespace-nowrap"
                    >
                      {bddInfo.name}
                    </motion.span>
                  </div>
                )}

                {/* Property-Based badge on the left */}
                {hasPropertyBased && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pl-2 flex items-center">
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="mr-1 px-2 py-1 bg-cyan-600 text-white text-xs font-bold rounded whitespace-nowrap"
                    >
                      {propertyBasedInfo.name}
                    </motion.span>
                    <svg 
                      className="w-8 h-8 text-cyan-400" 
                      viewBox="0 0 40 40"
                    >
                      <defs>
                        <marker
                          id="arrowhead-pb"
                          markerWidth="6"
                          markerHeight="6"
                          refX="1"
                          refY="3"
                          orient="auto"
                        >
                          <polygon 
                            points="6 0, 0 3, 6 6" 
                            fill="#06b6d4" 
                          />
                        </marker>
                      </defs>
                      <line
                        x1="32"
                        y1="20"
                        x2="0"
                        y2="20"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        markerEnd="url(#arrowhead-pb)"
                      />
                    </svg>
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
                    width: `${60 + (index * 10)}%`,
                  }}
                  whileHover={{ scale: 1.02, opacity: 1 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: shouldDim ? 0.3 : 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <span className="text-white font-semibold">
                    {layer.name}
                  </span>
                  <span className="absolute right-3 text-white/70 text-xs">
                    {layer.testCount}
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
