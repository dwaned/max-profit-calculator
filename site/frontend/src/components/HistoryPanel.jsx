export default function HistoryPanel({ history, onSelect }) {
  if (history.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">History</h3>
        <p className="text-slate-500 text-center py-4">No calculations yet</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">History</h3>
        <span className="text-xs text-slate-500">{history.length} items</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.map((item, index) => {
          const indices = item.result.indices || [];
          const indicesLabel = indices.length > 0 ? `[${indices.join(', ')}]` : '—';
          return (
            <button
              key={index}
              onClick={() => onSelect(item)}
              className="w-full text-left p-3 bg-slate-900 hover:bg-slate-750 rounded-lg transition-colors group"
            >
              <div className="flex justify-between items-center">
                <span className="text-green-400 font-semibold">€{item.result.maxProfit}</span>
                <span className="text-xs text-slate-500">
                  {indices.length || 0} stock{indices.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                <div>
                  <span className="text-slate-400">Indices: </span>
                  <span className="font-mono">{indicesLabel}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-400">Buy prices: </span>
                  <span className="font-mono">[{item.request.buyPrices.join(', ')}]</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
