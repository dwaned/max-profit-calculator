import { useRef } from 'react';
import { layerOrder, layerTestCount, testLayers } from '../../data/testLayers';

// Geometry of the drawn pyramid (SVG user units).
const WIDTH = 520;
const TOP = 12;
const BAND_HEIGHT = 58;
const GAP = 5;
const APEX_HALF = 34; // half-width at the very top
const BASE_HALF = 250; // half-width at the base
const CX = WIDTH / 2;
const HEIGHT = TOP + layerOrder.length * BAND_HEIGHT + 8;

const halfWidthAt = (y) => {
  const t = (y - TOP) / (layerOrder.length * BAND_HEIGHT);
  return APEX_HALF + t * (BASE_HALF - APEX_HALF);
};

function bandPoints(index) {
  const y0 = TOP + index * BAND_HEIGHT;
  const y1 = y0 + BAND_HEIGHT - GAP;
  const w0 = halfWidthAt(y0);
  const w1 = halfWidthAt(y1);
  return { y0, y1, points: `${CX - w0},${y0} ${CX + w0},${y0} ${CX + w1},${y1} ${CX - w1},${y1}` };
}

/**
 * The testing pyramid as a drawing: each band is a focusable button. Up/down
 * arrow keys move between layers; Enter or Space selects. Without a
 * selectedLayer (e.g. on the home page) every band is a plain link-like button
 * and arrow keys only move focus.
 */
export default function PyramidDiagram({ selectedLayer, onSelect }) {
  const selectable = selectedLayer !== undefined;
  const bandRefs = useRef([]);

  const handleKeyDown = (event, index, layerId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(layerId);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const next = event.key === 'ArrowUp' ? index - 1 : index + 1;
      if (next >= 0 && next < layerOrder.length) {
        if (selectable) onSelect(layerOrder[next]);
        bandRefs.current[next]?.focus();
      }
    }
  };

  return (
    <div>
      <div className="flex items-stretch gap-2 sm:gap-4">
        {/* Left axis: realism grows towards the top */}
        <Axis direction="up" label="More realistic, slower, costlier" />

        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto"
          role="group"
          aria-label="Testing pyramid. Select a layer to learn what it tests."
        >
          {layerOrder.map((layerId, index) => {
            const layer = testLayers.find((l) => l.id === layerId);
            const { y0, y1, points } = bandPoints(index);
            const selected = selectedLayer === layerId;
            const count = layerTestCount(layer);
            const label = layer.shortName || layer.name;
            const midY = (y0 + y1) / 2;
            // Narrow top bands get a smaller name.
            const roomy = halfWidthAt(y0) > 110;

            return (
              <g
                key={layerId}
                ref={(el) => { bandRefs.current[index] = el; }}
                role="button"
                tabIndex={0}
                aria-pressed={selectable ? selected : undefined}
                aria-label={`${layer.name}: ${layer.question} ${count} tests.`}
                onClick={() => onSelect(layerId)}
                onKeyDown={(event) => handleKeyDown(event, index, layerId)}
                className="cursor-pointer outline-none group"
              >
                <polygon
                  points={points}
                  fill={layer.hex}
                  fillOpacity={selected || !selectable ? 0.9 : 0.42}
                  stroke={selected ? '#ffffff' : 'transparent'}
                  strokeWidth={selected ? 2.5 : 0}
                  className="transition-[fill-opacity] duration-200 group-hover:[fill-opacity:0.8] group-focus-visible:stroke-white group-focus-visible:[stroke-width:2.5] group-focus-visible:[stroke-dasharray:6_4]"
                />
                <text
                  x={CX}
                  y={midY - 2}
                  textAnchor="middle"
                  className="fill-white font-semibold pointer-events-none"
                  style={{ fontSize: roomy ? 19 : 15 }}
                >
                  {label}
                </text>
                <text
                  x={CX}
                  y={midY + 15}
                  textAnchor="middle"
                  className="fill-white/80 pointer-events-none"
                  style={{ fontSize: 13 }}
                >
                  {count} tests
                </text>
              </g>
            );
          })}
        </svg>

        {/* Right axis: speed and precision grow towards the base */}
        <Axis direction="down" label="Faster, cheaper, more precise" />
      </div>
      {/* The side axes don't fit on phones */}
      <div className="sm:hidden mt-3 flex justify-between gap-4 text-[11px] uppercase tracking-wide text-slate-400">
        <span>▲ More realistic, slower</span>
        <span className="text-right">▼ Faster, more precise</span>
      </div>
    </div>
  );
}

function Axis({ direction, label }) {
  const up = direction === 'up';
  return (
    <div className="hidden sm:flex flex-col items-center justify-between py-1 w-7 shrink-0 text-slate-400">
      <span aria-hidden="true" className="text-lg leading-none">{up ? '▲' : ''}</span>
      <span
        className="text-[11px] tracking-wide uppercase whitespace-nowrap"
        style={{ writingMode: 'vertical-rl', transform: up ? 'rotate(180deg)' : 'none' }}
      >
        {label}
      </span>
      <span aria-hidden="true" className="text-lg leading-none">{up ? '' : '▼'}</span>
    </div>
  );
}
