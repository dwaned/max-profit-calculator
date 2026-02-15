export default function ResultsCard({ result }) {
  if (!result) return null;

  const { maxProfit, indices, savingsUsed, remainingSavings } = result;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Results</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Max Profit</div>
          <div className="text-2xl font-bold text-green-400">
            €{maxProfit}
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Stocks Bought</div>
          <div className="text-2xl font-bold text-blue-400">
            {indices?.length || 0}
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Savings Used</div>
          <div className="text-xl font-semibold text-white">
            €{savingsUsed}
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Remaining</div>
          <div className="text-xl font-semibold text-slate-300">
            €{remainingSavings}
          </div>
        </div>
      </div>

      {indices?.length > 0 && (
        <div className="mt-4 bg-slate-900 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Buy Indices</div>
          <div className="flex flex-wrap gap-2">
            {indices.map((idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium"
              >
                #{idx}
              </span>
            ))}
          </div>
        </div>
      )}

      {indices?.length === 0 && (
        <div className="mt-4 bg-slate-900 rounded-lg p-4 text-center">
          <div className="text-slate-400">No profitable stocks found</div>
        </div>
      )}
    </div>
  );
}
