// Small explanatory drawings, one per technique. Each shows the idea, not the tool.

const MUTED = '#475569';
const TEXT = '#cbd5e1';
const DIM = '#94a3b8';
const PANEL = '#0f172a';

function Box({ x, y, w, h, stroke = MUTED, fill = PANEL, rx = 8, ...rest }) {
  return <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth="1.5" {...rest} />;
}

function Label({ x, y, children, size = 12, fill = TEXT, anchor = 'middle', weight }) {
  return (
    <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontWeight={weight}>
      {children}
    </text>
  );
}

function Arrow({ x1, y1, x2, y2, color = DIM, id }) {
  return (
    <>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={color} />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" markerEnd={`url(#${id})`} />
    </>
  );
}

function Examples({ hex }) {
  const rows = [
    ['savings 5 · buy 1,2,5', 'profit 15'],
    ['savings 0 · buy 1,2', 'profit 0'],
    ['empty lists', 'nothing bought'],
  ];
  return rows.map(([input, output], i) => {
    const y = 18 + i * 46;
    return (
      <g key={input}>
        <Box x={8} y={y} w={150} h={32} />
        <Label x={83} y={y + 20} size={11}>{input}</Label>
        <Arrow x1={162} y1={y + 16} x2={190} y2={y + 16} id={`ex-arrow-${i}`} />
        <Box x={194} y={y} w={92} h={32} stroke={hex} />
        <Label x={240} y={y + 20} size={11}>{output}</Label>
        <circle cx={304} cy={y + 16} r={9} fill={hex} />
        <path d={`M299 ${y + 16} l3 3 l6 -6`} stroke={PANEL} strokeWidth="2" fill="none" />
      </g>
    );
  });
}

// Deterministic "random" dots so the drawing is stable between renders.
const DOTS = Array.from({ length: 34 }, (_, i) => ({
  x: 14 + ((i * 37) % 96),
  y: 16 + ((i * 53) % 124),
}));

function Property({ hex }) {
  return (
    <>
      {DOTS.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={3.5} fill={i === 21 ? '#f87171' : hex} opacity={i === 21 ? 1 : 0.55} />
      ))}
      <Label x={8} y={156} size={10} fill={DIM} anchor="start">generated inputs</Label>
      <Arrow x1={120} y1={78} x2={150} y2={78} id="prop-arrow" />
      <Box x={154} y={46} w={158} h={64} stroke={hex} />
      <Label x={233} y={66} size={10} fill={DIM}>rule that must always hold</Label>
      <Label x={233} y={86} size={12} weight="600">profit =</Label>
      <Label x={233} y={101} size={11}>Σ (sell − buy) of chosen</Label>
      <circle cx={162} cy={132} r={4} fill="#f87171" />
      <Label x={172} y={136} size={10} fill={DIM} anchor="start">a failure shrinks to</Label>
      <Label x={172} y={150} size={10} fill={DIM} anchor="start">the smallest case</Label>
    </>
  );
}

function Fuzzing({ hex }) {
  const fan = [-48, -24, 0, 24, 48];
  return (
    <>
      <Box x={8} y={46} w={70} h={64} />
      <Label x={43} y={72} size={11} weight="600">OpenAPI</Label>
      <Label x={43} y={88} size={10} fill={DIM}>the promises</Label>
      {fan.map((dy, i) => (
        <Arrow key={dy} x1={82} y1={78} x2={196} y2={78 + dy} color={hex} id={`fuzz-arrow-${i}`} />
      ))}
      <Label x={138} y={22} size={10} fill={DIM}>generated requests</Label>
      <Box x={200} y={22} w={112} h={112} stroke={hex} />
      <Label x={256} y={56} size={12} weight="600">API</Label>
      <Label x={256} y={78} size={10} fill={DIM}>every response</Label>
      <Label x={256} y={92} size={10} fill={DIM}>checked against</Label>
      <Label x={256} y={106} size={10} fill={DIM}>the promises</Label>
    </>
  );
}

function Mutation({ hex }) {
  const mutants = [
    { code: 'a < b  →  a <= b', killed: true },
    { code: 'return x  →  return 0', killed: true },
    { code: 'delete a line', killed: true },
    { code: 'x + 1  →  x − 1', killed: false },
  ];
  return (
    <>
      {mutants.map((m, i) => {
        const y = 10 + i * 36;
        return (
          <g key={m.code}>
            <Box x={8} y={y} w={196} h={28} stroke={m.killed ? MUTED : hex} />
            <Label x={18} y={y + 18} size={11} anchor="start">{m.code}</Label>
            <Label x={214} y={y + 18} size={11} anchor="start" fill={m.killed ? DIM : hex} weight="600">
              {m.killed ? '✕ killed' : '! survived'}
            </Label>
          </g>
        );
      })}
      <Label x={8} y={156} size={10} fill={DIM} anchor="start">A survivor marks a bug no test would catch</Label>
    </>
  );
}

function Bdd({ hex }) {
  const people = ['PO', 'QA', 'Dev'];
  return (
    <>
      {people.map((p, i) => (
        <g key={p}>
          <circle cx={30} cy={28 + i * 48} r={18} fill={PANEL} stroke={hex} strokeWidth="1.5" />
          <Label x={30} y={32 + i * 48} size={11} weight="600">{p}</Label>
        </g>
      ))}
      <Arrow x1={54} y1={76} x2={86} y2={76} id="bdd-arrow-1" />
      <Box x={90} y={30} w={128} h={92} stroke={hex} />
      <Label x={100} y={52} size={11} anchor="start">Given…</Label>
      <Label x={100} y={74} size={11} anchor="start">When…</Label>
      <Label x={100} y={96} size={11} anchor="start">Then…</Label>
      <Arrow x1={222} y1={76} x2={246} y2={76} id="bdd-arrow-2" />
      <Box x={250} y={44} w={62} h={64} />
      <rect x={250} y={44} width={62} height={12} rx={6} fill={MUTED} />
      <Label x={281} y={88} size={10} fill={DIM}>real UI</Label>
      <Label x={154} y={150} size={10} fill={DIM}>agreed examples become acceptance tests</Label>
    </>
  );
}

function Contract({ hex }) {
  return (
    <>
      <Box x={8} y={50} w={82} h={56} />
      <Label x={49} y={74} size={12} weight="600">Frontend</Label>
      <Label x={49} y={90} size={10} fill={DIM}>consumer</Label>
      <Arrow x1={94} y1={78} x2={120} y2={78} id="contract-arrow-1" />
      <Box x={124} y={38} w={72} h={80} stroke={hex} rx={4} />
      <Label x={160} y={66} size={11} weight="600">contract</Label>
      <line x1={136} y1={78} x2={184} y2={78} stroke={MUTED} strokeWidth="1.5" />
      <line x1={136} y1={90} x2={176} y2={90} stroke={MUTED} strokeWidth="1.5" />
      <line x1={136} y1={102} x2={180} y2={102} stroke={MUTED} strokeWidth="1.5" />
      <Arrow x1={226} y1={78} x2={200} y2={78} id="contract-arrow-2" />
      <Box x={230} y={50} w={82} h={56} />
      <Label x={271} y={74} size={12} weight="600">Backend</Label>
      <Label x={271} y={90} size={10} fill={DIM}>verifies</Label>
      <Label x={160} y={144} size={10} fill={DIM}>each side tested alone, against the same record</Label>
    </>
  );
}

const TIMINGS = [44, 52, 58, 61, 63, 64, 66, 67, 69, 72, 78, 96, 120];

function Performance({ hex }) {
  const limitY = 26;
  const median = TIMINGS[Math.floor(TIMINGS.length / 2)];
  return (
    <>
      {TIMINGS.map((t, i) => (
        <rect key={i} x={20 + i * 20} y={140 - t} width={14} height={t} rx={2} fill={hex} opacity={0.45} />
      ))}
      <line x1={12} x2={300} y1={140 - median} y2={140 - median} stroke={hex} strokeWidth="2" />
      <Label x={300} y={136 - median} size={10} anchor="end" fill={TEXT}>median</Label>
      <line x1={12} x2={300} y1={limitY} y2={limitY} stroke="#f87171" strokeWidth="1.5" strokeDasharray="5 4" />
      <Label x={300} y={limitY - 5} size={10} anchor="end" fill="#fca5a5">limit</Label>
      <line x1={12} x2={308} y1={140} y2={140} stroke={MUTED} strokeWidth="1.5" />
      <Label x={12} y={155} size={10} anchor="start" fill={DIM}>many timed runs; outliers don’t fail the build</Label>
    </>
  );
}

const DIAGRAMS = {
  examples: { Component: Examples, label: 'Three fixed inputs, each with the answer worked out by hand and checked.' },
  property: { Component: Property, label: 'Many generated inputs checked against one rule; a failing input is shrunk to the smallest case.' },
  fuzzing: { Component: Fuzzing, label: 'Requests generated from the OpenAPI description; every API response is checked against it.' },
  mutation: { Component: Mutation, label: 'Small deliberate bugs: three are caught by the tests, one survives.' },
  bdd: { Component: Bdd, label: 'Product Owner, QA and developer agree Given/When/Then examples that run against the real UI.' },
  contract: { Component: Contract, label: 'The frontend records a contract that the backend verifies, each tested alone.' },
  performance: { Component: Performance, label: 'Many timed runs: the median is compared against a limit, so outliers do not fail the build.' },
};

export default function TechniqueDiagram({ name, hex }) {
  const { Component, label } = DIAGRAMS[name];
  return (
    <svg viewBox="0 0 320 160" className="w-full h-auto" role="img" aria-label={label}>
      <Component hex={hex} />
    </svg>
  );
}
