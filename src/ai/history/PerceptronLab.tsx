import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Sample = { x1: number; x2: number; t: 0 | 1 };
type Model = { w1: number; w2: number; b: number };

const GATE = (f: (a: number, b: number) => number): Sample[] =>
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ].map(([x1, x2]) => ({ x1, x2, t: f(x1, x2) as 0 | 1 }));

const SETS: { id: string; label: string; data: Sample[] }[] = [
  {
    id: 'groups',
    label: 'две групи',
    data: [
      { x1: 0.1, x2: 0.3, t: 0 },
      { x1: 0.2, x2: 0.1, t: 0 },
      { x1: 0.3, x2: 0.45, t: 0 },
      { x1: 0.4, x2: 0.15, t: 0 },
      { x1: 0.05, x2: 0.6, t: 0 },
      { x1: 0.5, x2: 0.3, t: 0 },
      { x1: 0.6, x2: 0.8, t: 1 },
      { x1: 0.8, x2: 0.55, t: 1 },
      { x1: 0.9, x2: 0.9, t: 1 },
      { x1: 0.7, x2: 0.65, t: 1 },
      { x1: 0.45, x2: 0.95, t: 1 },
      { x1: 0.95, x2: 0.4, t: 1 },
    ],
  },
  { id: 'and', label: 'И (AND)', data: GATE((a, b) => a & b) },
  { id: 'or', label: 'ИЛИ (OR)', data: GATE((a, b) => a | b) },
  { id: 'xor', label: 'изключващо ИЛИ (XOR)', data: GATE((a, b) => a ^ b) },
];

const START: Model = { w1: -1, w2: 1, b: 0 };
const MAX_EPOCHS = 200;

const output = (m: Model, s: Sample) => (m.w1 * s.x1 + m.w2 * s.x2 + m.b > 0 ? 1 : 0);
const errorsOf = (m: Model, data: Sample[]) => data.filter(s => output(m, s) !== s.t).length;

/** Правилото на перцептрона за един пример. */
function update(m: Model, s: Sample, rate: number): Model {
  const e = s.t - output(m, s);
  return e === 0 ? m : { w1: m.w1 + rate * e * s.x1, w2: m.w2 + rate * e * s.x2, b: m.b + rate * e };
}

// ---------- Чертеж ----------

const W = 640;
const H = 360;
const BOX = { x: 60, y: 20, size: 300 };
const LO = -0.25;
const HI = 1.25;
const sx = (v: number) => BOX.x + ((v - LO) / (HI - LO)) * BOX.size;
const sy = (v: number) => BOX.y + BOX.size - ((v - LO) / (HI - LO)) * BOX.size;

/** Частта от квадрата, в която w1·x1 + w2·x2 + b > 0 (отрязване на многоъгълник с една права). */
function positiveRegion(m: Model): string {
  const corners = [
    [LO, LO],
    [HI, LO],
    [HI, HI],
    [LO, HI],
  ];
  const f = ([x, y]: number[]) => m.w1 * x + m.w2 * y + m.b;
  const out: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const p = corners[i];
    const q = corners[(i + 1) % 4];
    const fp = f(p);
    const fq = f(q);
    if (fp > 0) out.push(p);
    if (fp > 0 !== fq > 0) {
      const k = fp / (fp - fq);
      out.push([p[0] + k * (q[0] - p[0]), p[1] + k * (q[1] - p[1])]);
    }
  }
  return out.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ');
}

const num = (v: number) => (Math.round(v * 100) / 100).toLocaleString('bg-BG', { maximumFractionDigits: 2 }).replace('-', '−');

/** Събираемо със знак: „+ 0,5“ или „− 1“. */
const plus = (v: number) => `${v < 0 ? '−' : '+'} ${num(Math.abs(v))}`;

/** Перцептрон с два входа: правата, която той чертае, и как правилото за учене я мести пример по пример. */
export default function PerceptronLab() {
  const [setId, setSetId] = useState('groups');
  const [model, setModel] = useState<Model>(START);
  const [rate, setRate] = useState(0.5);
  const [cursor, setCursor] = useState(0);
  const [epochs, setEpochs] = useState(0);
  const [updates, setUpdates] = useState(0);
  const [stuck, setStuck] = useState(false);

  const data = SETS.find(s => s.id === setId)!.data;
  const errors = errorsOf(model, data);
  const current = data[cursor];

  const reset = (id = setId) => {
    setSetId(id);
    setModel(START);
    setCursor(0);
    setEpochs(0);
    setUpdates(0);
    setStuck(false);
  };

  /** Обработва `count` примера подред. */
  const run = (count: number) => {
    let m = model;
    let c = cursor;
    let ep = epochs;
    let up = updates;
    for (let i = 0; i < count; i++) {
      const next = update(m, data[c], rate);
      if (next !== m) up++;
      m = next;
      c++;
      if (c === data.length) {
        c = 0;
        ep++;
      }
    }
    setModel(m);
    setCursor(c);
    setEpochs(ep);
    setUpdates(up);
  };

  /** Цели епохи, докато няма грешки или докато се изчерпи търпението. */
  const train = () => {
    let m = model;
    let ep = epochs;
    let up = updates;
    let left = MAX_EPOCHS;
    while (errorsOf(m, data) > 0 && left-- > 0) {
      for (const s of data) {
        const next = update(m, s, rate);
        if (next !== m) up++;
        m = next;
      }
      ep++;
    }
    setModel(m);
    setCursor(0);
    setEpochs(ep);
    setUpdates(up);
    setStuck(errorsOf(m, data) > 0);
  };

  const flat = model.w1 === 0 && model.w2 === 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={BOX.x} y={BOX.y} width={BOX.size} height={BOX.size} className="fill-blue-50 stroke-gray-300 dark:fill-blue-950/40 dark:stroke-gray-600" />
        {(flat ? model.b > 0 : true) && <polygon points={positiveRegion(model)} className="fill-rose-200/80 dark:fill-rose-900/50" />}
        {/* Оси и деления */}
        {[0, 0.5, 1].map(v => (
          <g key={v}>
            <line x1={sx(v)} y1={BOX.y} x2={sx(v)} y2={BOX.y + BOX.size} className="stroke-gray-400/40" strokeWidth="1" />
            <line x1={BOX.x} y1={sy(v)} x2={BOX.x + BOX.size} y2={sy(v)} className="stroke-gray-400/40" strokeWidth="1" />
            <text x={sx(v)} y={BOX.y + BOX.size + 16} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {num(v)}
            </text>
            <text x={BOX.x - 8} y={sy(v) + 4} fontSize="12" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              {num(v)}
            </text>
          </g>
        ))}
        <text x={BOX.x + BOX.size / 2} y={H - 6} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          x₁
        </text>
        <text x={18} y={BOX.y + BOX.size / 2} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          x₂
        </text>

        {/* Примерите */}
        {data.map((s, i) => {
          const wrong = output(model, s) !== s.t;
          return (
            <g key={i}>
              {i === cursor && <circle cx={sx(s.x1)} cy={sy(s.x2)} r={15} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2" strokeDasharray="4 3" />}
              <circle
                cx={sx(s.x1)}
                cy={sy(s.x2)}
                r={8}
                className={s.t === 1 ? 'fill-rose-600 dark:fill-rose-400' : 'fill-blue-600 dark:fill-blue-400'}
                stroke={wrong ? 'black' : 'white'}
                strokeWidth={wrong ? 3 : 1.5}
              />
              {wrong && (
                <text x={sx(s.x1) + 12} y={sy(s.x2) - 9} fontSize="14" fontWeight="bold" className="fill-gray-900 dark:fill-white">
                  ✗
                </text>
              )}
            </g>
          );
        })}

        {/* Легенда и стойности */}
        <g transform="translate(392 34)">
          <circle cx={8} cy={0} r={7} className="fill-rose-600 dark:fill-rose-400" />
          <text x={22} y={4} fontSize="13" className="fill-gray-800 dark:fill-gray-100">
            клас 1 (червена зона = изход 1)
          </text>
          <circle cx={8} cy={24} r={7} className="fill-blue-600 dark:fill-blue-400" />
          <text x={22} y={28} fontSize="13" className="fill-gray-800 dark:fill-gray-100">
            клас 0 (синя зона = изход 0)
          </text>
          <text x={0} y={56} fontSize="13" className="fill-gray-800 dark:fill-gray-100">
            ✗ – сгрешен пример
          </text>
          <text x={0} y={96} fontSize="14" fontWeight="bold" className="fill-fuchsia-700 dark:fill-fuchsia-300">
            Границата:
          </text>
          <text x={0} y={118} fontSize="14" className="fill-gray-900 dark:fill-gray-100" fontFamily="monospace">
            {num(model.w1)}·x₁ {plus(model.w2)}·x₂ {plus(model.b)} = 0
          </text>
          <text x={0} y={158} fontSize="14" fontWeight="bold" className="fill-fuchsia-700 dark:fill-fuchsia-300">
            Следващ пример:
          </text>
          <text x={0} y={180} fontSize="14" className="fill-gray-900 dark:fill-gray-100" fontFamily="monospace">
            ({num(current.x1)}; {num(current.x2)}), цел {current.t}
          </text>
          <text x={0} y={202} fontSize="14" className="fill-gray-900 dark:fill-gray-100" fontFamily="monospace">
            изход {output(model, current)} → {output(model, current) === current.t ? 'вярно, без промяна' : 'грешка, местим'}
          </text>
        </g>
      </LabSvg>

      <Buttons>
        {SETS.map(s => (
          <DiagramButton key={s.id} active={s.id === setId} onClick={() => reset(s.id)}>
            {s.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="η" value={rate} onChange={setRate} min={0.1} max={1} step={0.1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => run(1)}>един пример</DiagramButton>
        <DiagramButton onClick={() => run(data.length - cursor)}>до края на епохата</DiagramButton>
        <DiagramButton onClick={train}>обучавай докрай</DiagramButton>
        <DiagramButton onClick={() => reset()}>отначало</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'w₁', value: num(model.w1), tone: 'violet' },
            { label: 'w₂', value: num(model.w2), tone: 'violet' },
            { label: 'b', value: num(model.b), tone: 'violet' },
            { label: 'епохи', value: epochs },
            { label: 'поправки', value: updates, tone: 'amber' },
            { label: 'грешки', value: `${errors} от ${data.length}`, tone: errors ? 'rose' : 'emerald' },
          ]}
        />
      </div>
      <Note tone={errors === 0 ? 'emerald' : stuck ? 'rose' : 'gray'}>
        {errors === 0
          ? 'Всички примери са от правилната страна на границата – перцептронът се е научил.'
          : stuck
            ? `След ${MAX_EPOCHS} епохи пак има грешки: никоя права не разделя тези точки.`
            : 'η е скоростта на обучение. Натискай „един пример“ и гледай как всяка грешка завърта и измества границата.'}
      </Note>
    </div>
  );
}
