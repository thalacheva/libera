import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

type Mode = 'parallel' | 'series' | 'mixed';

const MODES: { id: Mode; name: string }[] = [
  { id: 'parallel', name: 'успоредно' },
  { id: 'series', name: 'последователно' },
  { id: 'mixed', name: 'смесено' },
];

const SUB = ['₁', '₂', '₃'];
const wire = 'stroke-gray-500';

/** Кондензатор (две плочи) с център (x; y) върху хоризонтален проводник и надпис с q и U под него. */
function Cap({ x, y, i, C, q, U }: { x: number; y: number; i: number; C: number; q: number; U: number }) {
  return (
    <g>
      <line x1={x - 40} y1={y} x2={x - 5} y2={y} className={wire} strokeWidth="2" />
      <line x1={x + 5} y1={y} x2={x + 40} y2={y} className={wire} strokeWidth="2" />
      <line x1={x - 5} y1={y - 13} x2={x - 5} y2={y + 13} className="stroke-rose-500" strokeWidth="3.5" />
      <line x1={x + 5} y1={y - 13} x2={x + 5} y2={y + 13} className="stroke-sky-600" strokeWidth="3.5" />
      <Label p={{ x, y: y - 22 }} size={11} tone="blue">
        {`C${SUB[i]} = ${C} µF`}
      </Label>
      <Label p={{ x, y: y + 24 }} size={10}>
        {`q = ${fmtNum(q, 2)} µC`}
      </Label>
      <Label p={{ x, y: y + 37 }} size={10}>
        {`U = ${fmtNum(U, 2)} V`}
      </Label>
    </g>
  );
}

/** Батерия върху хоризонтален проводник. */
function Battery({ x, y, U }: { x: number; y: number; U: number }) {
  return (
    <g>
      <rect x={x - 12} y={y - 14} width={24} height={28} className="fill-white dark:fill-gray-800" />
      <line x1={x - 5} y1={y - 14} x2={x - 5} y2={y + 14} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2.5" />
      <line x1={x + 5} y1={y - 8} x2={x + 5} y2={y + 8} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="4.5" />
      <Label p={{ x, y: y + 26 }} size={11}>
        {`${U} V`}
      </Label>
    </g>
  );
}

/** Свързване на кондензатори: успоредно капацитетите се събират, последователно – реципрочните им стойности. */
export default function CapacitorNetworkLab() {
  const [mode, setMode] = useState<Mode>('series');
  const [C1, setC1] = useState(2);
  const [C2, setC2] = useState(3);
  const [C3, setC3] = useState(1);
  const [U, setU] = useState(12);

  let Ceq: number;
  let caps: { C: number; q: number; U: number }[];
  if (mode === 'parallel') {
    Ceq = C1 + C2;
    caps = [
      { C: C1, q: C1 * U, U },
      { C: C2, q: C2 * U, U },
    ];
  } else if (mode === 'series') {
    Ceq = (C1 * C2) / (C1 + C2);
    const q = Ceq * U;
    caps = [
      { C: C1, q, U: q / C1 },
      { C: C2, q, U: q / C2 },
    ];
  } else {
    const C23 = C2 + C3;
    Ceq = (C1 * C23) / (C1 + C23);
    const q = Ceq * U;
    const U23 = q / C23;
    caps = [
      { C: C1, q, U: q / C1 },
      { C: C2, q: C2 * U23, U: U23 },
      { C: C3, q: C3 * U23, U: U23 },
    ];
  }
  const W = (Ceq * U * U) / 2; // µF · V² = µJ

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MODES.map(m => (
          <DiagramButton key={m.id} active={m.id === mode} onClick={() => setMode(m.id)}>
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 212">
        {mode === 'series' && (
          <g>
            <polyline points="60,60 140,60" className={wire} fill="none" strokeWidth="2" />
            <polyline points="220,60 260,60" className={wire} fill="none" strokeWidth="2" />
            <polyline points="340,60 420,60 420,176 60,176 60,60" className={wire} fill="none" strokeWidth="2" />
            <Cap x={180} y={60} i={0} {...caps[0]} />
            <Cap x={300} y={60} i={1} {...caps[1]} />
            <Battery x={240} y={176} U={U} />
          </g>
        )}
        {mode === 'parallel' && (
          <g>
            <polyline points="160,36 200,36" className={wire} fill="none" strokeWidth="2" />
            <polyline points="280,36 320,36" className={wire} fill="none" strokeWidth="2" />
            <polyline points="160,108 200,108" className={wire} fill="none" strokeWidth="2" />
            <polyline points="280,108 320,108" className={wire} fill="none" strokeWidth="2" />
            <polyline points="160,36 160,176 320,176 320,36" className={wire} fill="none" strokeWidth="2" />
            <Cap x={240} y={36} i={0} {...caps[0]} />
            <Cap x={240} y={108} i={1} {...caps[1]} />
            <Battery x={240} y={176} U={U} />
          </g>
        )}
        {mode === 'mixed' && (
          <g>
            <polyline points="40,40 70,40" className={wire} fill="none" strokeWidth="2" />
            <polyline points="150,40 260,40" className={wire} fill="none" strokeWidth="2" />
            <polyline points="340,40 400,40 400,176 40,176 40,40" className={wire} fill="none" strokeWidth="2" />
            <polyline points="230,40 230,120 260,120" className={wire} fill="none" strokeWidth="2" />
            <polyline points="340,120 400,120" className={wire} fill="none" strokeWidth="2" />
            <circle cx={230} cy={40} r={3} className="fill-gray-600" />
            <circle cx={400} cy={40} r={3} className="fill-gray-600" />
            <circle cx={400} cy={120} r={3} className="fill-gray-600" />
            <Cap x={110} y={40} i={0} {...caps[0]} />
            <Cap x={300} y={40} i={1} {...caps[1]} />
            <Cap x={300} y={120} i={2} {...caps[2]} />
            <Battery x={220} y={176} U={U} />
          </g>
        )}
      </ZoomingSvg>

      <Sliders>
        <Slider label="C₁, µF" value={C1} onChange={setC1} min={1} max={10} step={1} tone="blue" />
        <Slider label="C₂, µF" value={C2} onChange={setC2} min={1} max={10} step={1} tone="blue" />
        {mode === 'mixed' && <Slider label="C₃, µF" value={C3} onChange={setC3} min={1} max={10} step={1} tone="blue" />}
        <Slider label="U, V" value={U} onChange={setU} min={1} max={24} step={1} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'C_екв =', value: `${fmtNum(Ceq, 3)} µF`, tone: 'blue' },
            { label: 'q от батерията =', value: `${fmtNum(Ceq * U, 2)} µC`, tone: 'rose' },
            { label: 'W =', value: `${fmtNum(W, 1)} µJ`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone="gray">
        {mode === 'parallel'
          ? 'Успоредно: напрежението е едно и също, зарядите се събират – C = C₁ + C₂. Сякаш плочите стават по-големи.'
          : mode === 'series'
            ? 'Последователно: зарядът е един и същ, напреженията се събират – 1/C = 1/C₁ + 1/C₂. Еквивалентният капацитет е по-малък от най-малкия.'
            : 'Смесено: първо заместваме успоредните C₂ и C₃ с един кондензатор C₂ + C₃, после го свързваме последователно с C₁.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Правилата са обратни на тези за резисторите. При последователно свързване по-голямо напрежение пада на по-малкия кондензатор.
        Енергията на цялата група е W = C·U²/2 с еквивалентния капацитет.
      </p>
    </div>
  );
}
