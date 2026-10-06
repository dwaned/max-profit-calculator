// How the stock advisor works, drawn as a loop: the model decides, the
// calculator computes, and a deterministic check verifies the answer.

const STEPS = [
  { x: 10, label: 'Question', sub: 'plain language', hex: '#94a3b8' },
  { x: 140, label: 'Model', sub: 'chooses a tool', hex: '#a855f7' },
  { x: 270, label: 'Calculator', sub: 'exact answer', hex: '#10b981' },
  { x: 400, label: 'Model', sub: 'explains it', hex: '#a855f7' },
  { x: 530, label: 'Verifier', sub: 'quotes the profit?', hex: '#f97316' },
];

export default function AgentFlow() {
  return (
    <svg
      viewBox="0 0 640 130"
      className="w-full h-auto"
      role="img"
      aria-label="The question goes to the model, which calls the calculator. The calculator's exact result goes back to the model, which writes the answer. A verifier checks that the answer quotes the calculator's profit."
    >
      <defs>
        <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#64748b" />
        </marker>
      </defs>
      {STEPS.map((step, i) => (
        <g key={`${step.label}-${step.x}`}>
          <rect x={step.x} y={30} width={100} height={56} rx={10} fill="#0f172a" stroke={step.hex} strokeWidth="1.5" />
          <text x={step.x + 50} y={54} textAnchor="middle" fontSize="13" fontWeight="600" fill="#e2e8f0">{step.label}</text>
          <text x={step.x + 50} y={72} textAnchor="middle" fontSize="10.5" fill="#94a3b8">{step.sub}</text>
          {i < STEPS.length - 1 && (
            <line x1={step.x + 102} y1={58} x2={step.x + 136} y2={58} stroke="#64748b" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />
          )}
        </g>
      ))}
      <text x={205} y={20} textAnchor="middle" fontSize="10" fill="#94a3b8">tool call</text>
      <text x={335} y={110} textAnchor="middle" fontSize="10" fill="#94a3b8">the numbers come from here, never from the model</text>
      <text x={580} y={110} textAnchor="middle" fontSize="10" fill="#fdba74">deterministic check</text>
    </svg>
  );
}
