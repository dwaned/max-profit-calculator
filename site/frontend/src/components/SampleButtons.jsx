import { sampleDatasets } from '../data/samples';

export default function SampleButtons({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-slate-400 self-center mr-2">Sample:</span>
      {sampleDatasets.map((sample) => (
        <button
          key={sample.name}
          onClick={() => onSelect(sample)}
          title={sample.description}
          aria-label={`Load ${sample.name} sample — ${sample.description}`}
          className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-600 hover:border-slate-500"
        >
          {sample.name}
        </button>
      ))}
    </div>
  );
}
