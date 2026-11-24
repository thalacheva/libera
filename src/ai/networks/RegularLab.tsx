import { useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { mulberry32 } from '../history/rollouts';
import Chart from '../models/Chart';
import { AXIS, makeData, pct, type Pt } from '../models/classify';
import { Points, Regions } from '../models/Regions';
import { accuracyOf, lossOf, makeNet, type Net, probOf, type Sample, startState, type State, trainStep } from './deepNet';

const MAX_STEPS = 3000;
const EVERY = 20;
const DECAY = 0.02;
const DROP = 0.4;

const TRAIN_PTS: Pt[] = makeData('noisy', 40, 11);
const VAL_PTS: Pt[] = makeData('noisy', 200, 12);
const scale = (v: number) => (v - 5) / 2.5;
const toSamples = (pts: Pt[]): Sample[] => pts.map(p => ({ x: [scale(p.x), scale(p.y)], t: p.c }));
const TRAIN = toSamples(TRAIN_PTS);
const VAL = toSamples(VAL_PTS);

type Run = { s: State; steps: number; hist: { at: number; train: number; val: number }[]; best: { at: number; val: number; net: Net } };

function startRun(): Run {
  const net = makeNet([2, 16, 16, 1], 'relu', 2, 5);
  const val = lossOf(net, VAL, 'log');
  return { s: startState(net), steps: 0, hist: [{ at: 0, train: lossOf(net, TRAIN, 'log'), val }], best: { at: 0, val, net } };
}

/** Още `n` стъпки обучение; на всеки 20 стъпки се записват двете загуби и се помни мрежата с най-ниска валидационна загуба. */
function advance(run: Run, n: number, decay: boolean, drop: boolean): Run {
  let { s, steps, best } = run;
  const hist = [...run.hist];
  const random = mulberry32(99 + steps);
  const until = Math.min(MAX_STEPS, steps + n);
  while (steps < until) {
    s = trainStep(s, TRAIN, { rate: 0.01, kind: 'log', momentum: 0.9, decay: decay ? DECAY : 0, drop: drop ? DROP : 0, random });
    steps++;
    if (steps % EVERY === 0) {
      const val = lossOf(s.net, VAL, 'log');
      hist.push({ at: steps, train: lossOf(s.net, TRAIN, 'log'), val });
      if (val < best.val) best = { at: steps, val, net: s.net };
    }
  }
  return { s, steps, hist, best };
}

const dec = (v: number) => v.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Мрежа 2–16–16–1 върху 40 шумни точки: загуба върху обучаващите и валидационните данни, затихване на теглата, изключване на неврони, ранно спиране. */
export default function RegularLab() {
  const [decay, setDecay] = useState(false);
  const [drop, setDrop] = useState(false);
  const [run, setRun] = useState<Run>(startRun);
  const [showBest, setShowBest] = useState(false);

  const restart = (d: boolean, p: boolean) => {
    setDecay(d);
    setDrop(p);
    setRun(startRun());
    setShowBest(false);
  };
  const go = (n: number) => setRun(advance(run, n, decay, drop));

  const shown = showBest ? run.best.net : run.s.net;
  const prob = (x: number, y: number) => probOf(shown, [scale(x), scale(y)]);
  const last = run.hist[run.hist.length - 1];
  const overfit = run.steps >= 1000 && last.val > 1.25 * run.best.val;
  const line = (key: 'train' | 'val', s: { sx: (v: number) => number; sy: (v: number) => number }) => run.hist.map(h => `${s.sx(h.at)},${s.sy(Math.min(1.5, h[key]))}`).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[0, MAX_STEPS]} y={[0, 1.4]} xTicks={[0, 500, 1000, 1500, 2000, 2500, 3000]} yTicks={[0, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4]} xLabel="стъпки на обучението" yLabel="загуба" height={280}>
        {s => (
          <>
            {run.steps > 0 && (
              <>
                <line x1={s.sx(run.best.at)} y1={s.y0} x2={s.sx(run.best.at)} y2={s.y1} className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="2" strokeDasharray="6 4" />
                <text x={Math.min(s.x1 - 6, s.sx(run.best.at) + 6)} y={s.y1 + 34} fontSize="12" textAnchor={s.sx(run.best.at) + 120 > s.x1 ? 'end' : 'start'} className="fill-emerald-700 dark:fill-emerald-400">
                  ранно спиране
                </text>
              </>
            )}
            <polyline points={line('train', s)} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.5" clipPath={s.clip} />
            <polyline points={line('val', s)} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.5" clipPath={s.clip} />
            <line x1={s.x0 + 150} y1={s.y1 + 14} x2={s.x0 + 170} y2={s.y1 + 14} className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="3" />
            <text x={s.x0 + 176} y={s.y1 + 18} fontSize="12" className="fill-gray-700 dark:fill-gray-200">
              обучаващи
            </text>
            <line x1={s.x0 + 260} y1={s.y1 + 14} x2={s.x0 + 280} y2={s.y1 + 14} className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="3" />
            <text x={s.x0 + 286} y={s.y1 + 18} fontSize="12" className="fill-gray-700 dark:fill-gray-200">
              валидационни
            </text>
          </>
        )}
      </Chart>
      <Buttons>
        <DiagramButton onClick={() => go(100)}>100 стъпки</DiagramButton>
        <DiagramButton onClick={() => go(500)}>500 стъпки</DiagramButton>
        <DiagramButton onClick={() => restart(decay, drop)}>отначало</DiagramButton>
      </Buttons>
      <Buttons>
        <DiagramButton active={decay} onClick={() => restart(!decay, drop)}>
          затихване на теглата
        </DiagramButton>
        <DiagramButton active={drop} onClick={() => restart(decay, !drop)}>
          изключване на неврони
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'стъпки', value: run.steps },
            { label: 'загуба, обучаващи', value: dec(last.train), tone: 'blue' },
            { label: 'загуба, валидационни', value: dec(last.val), tone: 'rose' },
            { label: 'най-ниска валидационна', value: `${dec(run.best.val)} на стъпка ${run.best.at}`, tone: 'emerald' },
          ]}
        />
      </div>
      <div className="mt-4">
        <Chart {...AXIS} xLabel="признак 1" yLabel="признак 2" height={280}>
          {s => (
            <>
              <Regions s={s} prob={prob} soft />
              <Points s={s} data={TRAIN_PTS} prob={prob} />
            </>
          )}
        </Chart>
      </div>
      <Buttons>
        <DiagramButton active={!showBest} onClick={() => setShowBest(false)}>
          мрежата сега
        </DiagramButton>
        <DiagramButton active={showBest} onClick={() => setShowBest(true)}>
          мрежата при ранното спиране
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'точност, обучаващи', value: pct(accuracyOf(shown, TRAIN)), tone: 'blue' },
            { label: 'точност, валидационни', value: pct(accuracyOf(shown, VAL)), tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={overfit ? 'rose' : run.steps >= MAX_STEPS ? 'emerald' : 'gray'}>
        {overfit
          ? 'Преобучаване: загубата върху обучаващите точки продължава да пада, а върху валидационните расте. Границата се огъва около отделни шумни точки.'
          : run.steps >= MAX_STEPS
            ? 'Двете криви останаха близо една до друга: мрежата не успя да назубри шума и границата е гладка.'
            : 'Мрежата вижда само 40-те обучаващи точки (на долната картинка). Още 200 точки от същия източник са скрити – с тях се мери валидационната загуба.'}
      </Note>
    </div>
  );
}
