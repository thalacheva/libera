import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from '../models/Chart';
import { type Act, backward, forward, makeNet, normalSource, rms } from './deepNet';

const N = 64;
const LAYERS = 24;

/** Случаен вектор със среден размер точно 1. */
function unitVector(seed: number) {
  const normal = normalSource(seed);
  const v = Array.from({ length: N }, () => normal());
  const k = rms(v);
  return v.map(q => q / k);
}

const INPUT = unitVector(7);
const ERROR = unitVector(8);

/** Сигналът напред и сигналът за грешка назад през мрежа с начални тегла с дисперсия k/n. */
function initSignals(act: Act, k: number) {
  const net = makeNet(new Array<number>(LAYERS + 2).fill(N), act, k, 5);
  const trace = forward(net, INPUT);
  const ahead = trace.a.slice(1, LAYERS + 1).map(rms);
  const back = backward(net, trace, ERROR).signal.slice(0, LAYERS);
  return { ahead, back };
}

const sci = (v: number) => {
  if (v === 0) return '0';
  if (v >= 0.01 && v < 1000) return v.toLocaleString('bg-BG', { maximumSignificantDigits: 2 });
  const e = Math.floor(Math.log10(v));
  return `${(v / 10 ** e).toLocaleString('bg-BG', { maximumFractionDigits: 1 })}·10^${e}`;
};

/** 24 слоя по 64 неврона със случайни начални тегла: колко голям е сигналът на всеки слой и колко от грешката се връща до него. */
export default function InitLab() {
  const [k, setK] = useState(1);
  const [act, setAct] = useState<Act>('relu');
  const { ahead, back } = useMemo(() => initSignals(act, k), [act, k]);

  const logOf = (v: number) => Math.max(-8, Math.min(4, Math.log10(Math.max(v, 1e-12))));
  const deep = ahead[LAYERS - 1];
  const first = back[0];
  const dead = deep < 1e-2 || first < 1e-2;
  const blown = deep > 10 || first > 10;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[0.2, LAYERS + 0.8]} y={[-8, 4]} xTicks={[1, 4, 8, 12, 16, 20, 24]} yTicks={[-8, -6, -4, -2, 0, 2, 4]} xLabel="слой (1 е най-близо до входа)" yLabel="размер на сигнала" height={300} yTick={v => (v === 0 ? '1' : v === 2 ? '100' : `10^${v}`)}>
        {s => (
          <>
            <line x1={s.x0} y1={s.sy(0)} x2={s.x1} y2={s.sy(0)} className="stroke-gray-500" strokeWidth="1.5" />
            {ahead.map((v, i) => {
              const top = s.sy(logOf(v));
              const base = s.sy(0);
              return <rect key={i} x={s.sx(i + 1) - 8} y={Math.min(top, base)} width={16} height={Math.max(2, Math.abs(base - top))} className={v < 1e-2 ? 'fill-rose-400' : v > 10 ? 'fill-amber-400' : 'fill-emerald-500'} opacity="0.85" clipPath={s.clip} />;
            })}
            <polyline points={back.map((v, i) => `${s.sx(i + 1)},${s.sy(logOf(v))}`).join(' ')} fill="none" className="stroke-violet-600 dark:stroke-violet-400" strokeWidth="2" clipPath={s.clip} />
            {back.map((v, i) => (
              <circle key={i} cx={s.sx(i + 1)} cy={s.sy(logOf(v))} r={3.2} className="fill-violet-600 dark:fill-violet-400" clipPath={s.clip} />
            ))}
            <rect x={s.x0 + 10} y={s.y1 + 8} width={12} height={12} className="fill-emerald-500" />
            <text x={s.x0 + 28} y={s.y1 + 19} fontSize="12" className="fill-gray-700 dark:fill-gray-200">
              сигнал напред
            </text>
            <circle cx={s.x0 + 150} cy={s.y1 + 14} r={4} className="fill-violet-600 dark:fill-violet-400" />
            <text x={s.x0 + 160} y={s.y1 + 19} fontSize="12" className="fill-gray-700 dark:fill-gray-200">
              сигнал за грешка назад
            </text>
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="k" value={k} onChange={setK} min={0.4} max={4} step={0.1} tone="amber" />
      </Sliders>
      <Buttons>
        <DiagramButton active={act === 'relu'} onClick={() => setAct('relu')}>
          изправител
        </DiagramButton>
        <DiagramButton active={act === 'tanh'} onClick={() => setAct('tanh')}>
          tanh
        </DiagramButton>
        <DiagramButton onClick={() => setK(1)}>k = 1</DiagramButton>
        <DiagramButton onClick={() => setK(2)}>k = 2</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'дисперсия на теглата', value: `${k.toLocaleString('bg-BG')}/n`, tone: 'amber' },
            { label: 'сигнал на слой 24', value: sci(deep), tone: deep < 1e-2 ? 'rose' : deep > 10 ? 'amber' : 'emerald' },
            { label: 'грешка до слой 1', value: sci(first), tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={dead ? 'rose' : blown ? 'amber' : 'emerald'}>
        {dead
          ? 'Теглата са твърде малки: сигналът заглъхва по пътя и първите слоеве не получават почти нищо от грешката. Мрежата не може да започне да се учи.'
          : blown
            ? 'Теглата са твърде големи: сигналът или грешката се раздуват на всеки слой и първите стъпки на спускането ще са огромни.'
            : 'И двата сигнала минават през 24 слоя, без да изчезнат и без да избухнат. От такова начало мрежата може да се учи.'}
      </Note>
    </div>
  );
}
