import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from '../models/Chart';
import { AXIS } from '../models/classify';
import { Regions } from '../models/Regions';

type Act = 'step' | 'sigmoid' | 'tanh';
const ACTS: { id: Act; label: string }[] = [
  { id: 'step', label: 'стъпка' },
  { id: 'sigmoid', label: 'сигмоида' },
  { id: 'tanh', label: 'tanh' },
];
const PROBES = [
  { name: 'A', x: 2, y: 3 },
  { name: 'B', x: 5, y: 5 },
  { name: 'C', x: 8, y: 7 },
];
const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');

/** Един неврон с два входа: претеглена сума, активираща функция и правата, по която сумата е нула. */
export default function NeuronLab() {
  const [w1, setW1] = useState(1);
  const [w2, setW2] = useState(1);
  const [b, setB] = useState(-10);
  const [act, setAct] = useState<Act>('step');

  const sum = (x: number, y: number) => w1 * x + w2 * y + b;
  const out = (z: number) => (act === 'step' ? (z > 0 ? 1 : 0) : act === 'sigmoid' ? 1 / (1 + Math.exp(-z)) : Math.tanh(z));
  // За оцветяването: изходът, преведен в [0; 1] (tanh е между −1 и 1)
  const shade = (x: number, y: number) => {
    const a = out(sum(x, y));
    return act === 'tanh' ? (a + 1) / 2 : a;
  };
  const flat = w1 === 0 && w2 === 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart {...AXIS} xLabel="вход x₁" yLabel="вход x₂">
        {s => (
          <>
            <Regions s={s} prob={shade} soft={act !== 'step'} />
            {!flat &&
              (Math.abs(w2) > 1e-9 ? (
                <line x1={s.sx(-2)} y1={s.sy((-b + 2 * w1) / w2)} x2={s.sx(12)} y2={s.sy((-b - 12 * w1) / w2)} className="stroke-gray-900 dark:stroke-white" strokeWidth="2.5" clipPath={s.clip} />
              ) : (
                <line x1={s.sx(-b / w1)} y1={s.y0} x2={s.sx(-b / w1)} y2={s.y1} className="stroke-gray-900 dark:stroke-white" strokeWidth="2.5" clipPath={s.clip} />
              ))}
            {PROBES.map(p => (
              <g key={p.name}>
                <circle cx={s.sx(p.x)} cy={s.sy(p.y)} r={6} className="fill-amber-400 stroke-gray-900" strokeWidth="1.5" />
                <text x={s.sx(p.x) + 10} y={s.sy(p.y) + 5} fontSize="14" fontWeight="bold" className="fill-gray-900 dark:fill-white">
                  {p.name}
                </text>
              </g>
            ))}
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="w₁" value={w1} onChange={setW1} min={-2} max={2} step={0.1} tone="violet" />
        <Slider label="w₂" value={w2} onChange={setW2} min={-2} max={2} step={0.1} tone="violet" />
        <Slider label="b" value={b} onChange={setB} min={-20} max={20} step={0.5} tone="amber" />
      </Sliders>
      <Buttons>
        {ACTS.map(a => (
          <DiagramButton key={a.id} active={a.id === act} onClick={() => setAct(a.id)}>
            {a.label}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={PROBES.map(p => {
            const z = sum(p.x, p.y);
            return { label: `${p.name} (${p.x}; ${p.y})`, value: `z = ${dec(z, 1)} → ${dec(out(z))}`, tone: z > 0 ? ('rose' as const) : ('blue' as const) };
          })}
        />
      </div>
      <Note tone={flat ? 'amber' : 'gray'}>
        {flat
          ? 'И двете тегла са нула: невронът не гледа входовете си и дава един и същ изход навсякъде.'
          : act === 'step'
            ? 'Черната права е там, където сумата z е точно нула. От едната ѝ страна невронът дава 1, от другата – 0. Теглата я завъртат, отместването я премества.'
            : 'Границата е същата права – активиращата функция не я мести. Променя се само колко плавно изходът преминава от едната страна към другата. Намали теглата и преходът ще се размие.'}
      </Note>
    </div>
  );
}
