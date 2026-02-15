const sampleDatasets = [
  {
    name: 'Basic',
    savings: 5,
    buyPrices: [1, 2, 5],
    sellPrices: [2, 3, 20],
  },
  {
    name: 'Multiple',
    savings: 10,
    buyPrices: [5, 5, 1, 9],
    sellPrices: [9, 9, 5, 5],
  },
  {
    name: 'Large',
    savings: 50,
    buyPrices: [1, 2, 5, 34, 22, 56, 34],
    sellPrices: [2, 3, 20, 35, 15, 101, 20],
  },
  {
    name: 'Loss Only',
    savings: 5,
    buyPrices: [5, 2, 3],
    sellPrices: [1, 0, 2],
  },
];

export default function SampleButtons({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-slate-400 self-center mr-2">Sample:</span>
      {sampleDatasets.map((sample) => (
        <button
          key={sample.name}
          onClick={() => onSelect(sample)}
          className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-600 hover:border-slate-500"
        >
          {sample.name}
        </button>
      ))}
    </div>
  );
}
