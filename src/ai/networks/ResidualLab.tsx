import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from '../models/Chart';
import { forward, gradOf, lossOf, makeNet, type Net, type Sample, startState, type State, trainStep } from './deepNet';

const WIDTH = 8;
const MAX_STEPS = 2000;

/** 24 точки от кривата y = sin 3x – задача, която мрежа с три слоя решава лесно. */
const WAVE: Sample[] = Array.from({ length: 24 }, (_, i) => {
  const u = -1 + (2 * i) / 23;
  return { x: [u], t: Math.sin(3 * u) };
});

/**
 * Две мрежи с еднакъв брой блокове и еднакви начални случайни числа: обикновена и с преки връзки.
 * В остатъчната мрежа началните тегла на блоковете са намалени √depth пъти, за да не се натрупва сигналът.
 */
function makePair(depth: number, seed: number): { plain: Net; skip: Net } {
  const sizes = [1, ...new Array<number>(depth + 1).fill(WIDTH), 1];
  const plain = makeNet(sizes, 'tanh', 1, seed, false);
  const skip = makeNet(sizes, 'tanh', 1, seed, true);
  const k = 1 / Math.sqrt(depth);
  skip.W = skip.W.map((w, l) => (l > 0 && l < skip.W.length - 1 ? w.map(r => r.map(v => v * k)) : w));
  return { plain, skip };
}

/** Каква част от сигнала за грешка на последния блок стига до първия. */
function reach(net: Net) {
  const g = gradOf(net, WAVE, 'mse').signal;
  return g[1] / g[g.length - 2];
}

const trainWave = (s: State, steps: number) => {
  let out = s;
  for (let i = 0; i < steps; i++) out = trainStep(out, WAVE, { rate: 0.005, kind: 'mse', momentum: 0.9 });
  return out;
};

const dec = (v: number, d = 3) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });
const XS = Array.from({ length: 81 }, (_, i) => -1 + i / 40);

type Pair = { plain: State; skip: State; steps: number; reachPlain: number; reachSkip: number };

const start = (depth: number, seed: number): Pair => {
  const { plain, skip } = makePair(depth, seed);
  return { plain: startState(plain), skip: startState(skip), steps: 0, reachPlain: reach(plain), reachSkip: reach(skip) };
};

/** Обикновена и остатъчна мрежа с избрана дълбочина се учат на една и съща крива. */
export default function ResidualLab() {
  const [depth, setDepth] = useState(24);
  const [seed, setSeed] = useState(2);
  const [pair, setPair] = useState<Pair>(() => start(24, 2));

  const reset = (d: number, s: number) => {
    setDepth(d);
    setSeed(s);
    setPair(start(d, s));
  };
  const run = (n: number) => {
    const steps = Math.min(n, MAX_STEPS - pair.steps);
    if (steps <= 0) return;
    setPair({ ...pair, plain: trainWave(pair.plain, steps), skip: trainWave(pair.skip, steps), steps: pair.steps + steps });
  };

  const lossPlain = lossOf(pair.plain.net, WAVE, 'mse');
  const lossSkip = lossOf(pair.skip.net, WAVE, 'mse');
  const out = (net: Net, x: number) => forward(net, [x]).a[net.W.length][0];
  const curve = (net: Net, s: { sx: (v: number) => number; sy: (v: number) => number }) => XS.map(x => `${s.sx(x)},${s.sy(Math.max(-3, Math.min(3, out(net, x))))}`).join(' ');
  const done = pair.steps >= MAX_STEPS;
  const gap = pair.steps >= 500 && lossPlain > 5 * lossSkip && lossPlain > 0.02;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[-1.05, 1.05]} y={[-1.6, 1.6]} xTicks={[-1, -0.5, 0, 0.5, 1]} yTicks={[-1, 0, 1]} xLabel="вход x" yLabel="изход" height={300}>
        {s => (
          <>
            <polyline points={curve(pair.plain.net, s)} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.5" clipPath={s.clip} />
            <polyline points={curve(pair.skip.net, s)} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2.5" clipPath={s.clip} />
            {WAVE.map((p, i) => (
              <circle key={i} cx={s.sx(p.x[0])} cy={s.sy(p.t)} r={3.6} className="fill-gray-800 dark:fill-gray-100" />
            ))}
            <line x1={s.x0 + 10} y1={s.y1 + 14} x2={s.x0 + 30} y2={s.y1 + 14} className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="3" />
            <text x={s.x0 + 36} y={s.y1 + 18} fontSize="12" className="fill-gray-700 dark:fill-gray-200">
              обикновена
            </text>
            <line x1={s.x0 + 122} y1={s.y1 + 14} x2={s.x0 + 142} y2={s.y1 + 14} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="3" />
            <text x={s.x0 + 148} y={s.y1 + 18} fontSize="12" className="fill-gray-700 dark:fill-gray-200">
              с преки връзки
            </text>
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="блокове" value={depth} onChange={d => reset(d, seed)} min={2} max={24} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => run(50)}>50 стъпки</DiagramButton>
        <DiagramButton onClick={() => run(250)}>250 стъпки</DiagramButton>
        <DiagramButton onClick={() => reset(depth, seed + 1)}>нови случайни тегла</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'стъпки', value: pair.steps },
            { label: 'загуба, обикновена', value: dec(lossPlain), tone: 'blue' },
            { label: 'загуба, с преки връзки', value: dec(lossSkip), tone: 'rose' },
          ]}
        />
      </div>
      <div className="mt-2">
        <Readout
          items={[
            { label: 'грешка до блок 1: обикновена', value: dec(pair.reachPlain, 2), tone: 'blue' },
            { label: 'с преки връзки', value: dec(pair.reachSkip, 2), tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={gap ? 'rose' : done ? 'emerald' : 'gray'}>
        {gap
          ? 'Обикновената мрежа тъпче на място: рисува едно стъпало и загубата ѝ почти не помръдва, макар да има същия брой тегла. Мрежата с преки връзки следва кривата.'
          : done
            ? 'И двете мрежи се справят. При малка дълбочина преките връзки не са нужни – разликата се появява, когато блоковете станат много.'
            : 'Точките са обучаващите примери. Двете мрежи имат еднакъв брой блокове по 8 неврона и се учат с еднакви стъпки. Натискай и сравнявай.'}
      </Note>
    </div>
  );
}
