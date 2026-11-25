import { useRef, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';
import {
  ARROWS,
  bestActions,
  chooseAction,
  COLS,
  GOAL,
  GOAL_REWARD,
  greedyPath,
  isEnd,
  MAX_STEPS,
  mulberry32,
  newQ,
  PIT,
  qStep,
  type QTable,
  ROWS,
  runEpisode,
  SNACK,
  SNACK_REWARD,
  START,
  type Update,
  WALLS,
} from './rlMath';

const SEED = 5;
const SIZE = 100;
const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');
const short = (v: number) => (Number.isInteger(v) ? String(v).replace('-', '−') : dec(v, Math.abs(v) < 0.1 && v !== 0 ? 3 : 2));

type Counts = { goal: number; snack: number; pit: number; none: number };
type State = { q: QTable; pos: number; steps: number; over: boolean; episodes: number; counts: Counts; last: Update | null; lastSteps: number | null };

const fresh = (): State => ({ q: newQ(), pos: START, steps: 0, over: false, episodes: 0, counts: { goal: 0, snack: 0, pit: 0, none: 0 }, last: null, lastSteps: null });
const tally = (c: Counts, end: number): Counts => ({
  goal: c.goal + (end === GOAL ? 1 : 0),
  snack: c.snack + (end === SNACK ? 1 : 0),
  pit: c.pit + (end === PIT ? 1 : 0),
  none: c.none + (isEnd(end) ? 0 : 1),
});

/** Q-учене в свят от 5 × 4 клетки: голяма награда далече, бисквитка близо до старта, яма и стена. */
export default function GridLab() {
  const random = useRef(mulberry32(SEED));
  const [st, setSt] = useState<State>(fresh);
  const [alpha, setAlpha] = useState(0.5);
  const [gamma, setGamma] = useState(0.9);
  const [eps, setEps] = useState(0.1);

  const step = () => {
    const q = st.q.map(r => [...r]);
    const from = st.over ? START : st.pos;
    const steps = st.over ? 0 : st.steps;
    const u = qStep(q, from, chooseAction(q, from, eps, random.current), alpha, gamma);
    const over = u.done || steps + 1 >= MAX_STEPS;
    setSt({ q, pos: u.next, steps: steps + 1, over, episodes: st.episodes + (over ? 1 : 0), counts: over ? tally(st.counts, u.next) : st.counts, last: u, lastSteps: over ? steps + 1 : st.lastSteps });
  };

  const episodes = (n: number) => {
    const q = st.q.map(r => [...r]);
    let counts = st.counts;
    let pos = st.pos;
    let last = st.last;
    let lastSteps = st.lastSteps;
    for (let i = 0; i < n; i++) {
      const resume = i === 0 && !st.over && st.steps > 0;
      const e = runEpisode(q, resume ? st.pos : START, alpha, gamma, eps, random.current, resume ? st.steps : 0);
      counts = tally(counts, e.end);
      pos = e.end;
      last = e.last ?? last;
      lastSteps = e.steps;
    }
    setSt({ q, pos, steps: 0, over: true, episodes: st.episodes + n, counts, last, lastSteps });
  };

  const reset = () => {
    random.current = mulberry32(SEED);
    setSt(fresh());
  };

  const { q, last } = st;
  const path = greedyPath(q);
  const startValue = Math.max(...q[START]);
  const snackBest = SNACK_REWARD * gamma > GOAL_REWARD * gamma ** 6;
  const agent = st.over ? START : st.pos;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <svg viewBox={`0 0 ${COLS * SIZE} ${ROWS * SIZE}`} className="block w-full max-w-lg mx-auto h-auto select-none">
        {Array.from({ length: COLS * ROWS }, (_, s) => {
          const x = (s % COLS) * SIZE;
          const y = Math.floor(s / COLS) * SIZE;
          const wall = WALLS.includes(s);
          const max = Math.max(...q[s]);
          const min = Math.min(...q[s]);
          const trained = max !== 0 || min !== 0;
          const shade = max > 0 ? Math.min(1, max / GOAL_REWARD) : 0;
          const best = bestActions(q, s);
          return (
            <g key={s}>
              <rect x={x + 2} y={y + 2} width={SIZE - 4} height={SIZE - 4} rx="8" className={wall ? 'fill-gray-400 dark:fill-gray-600' : 'fill-gray-50 dark:fill-gray-900/60'} />
              {!wall && !isEnd(s) && shade > 0 && <rect x={x + 2} y={y + 2} width={SIZE - 4} height={SIZE - 4} rx="8" className="fill-fuchsia-500" opacity={0.12 + 0.6 * shade} />}
              {!wall && !isEnd(s) && max <= 0 && min < 0 && <rect x={x + 2} y={y + 2} width={SIZE - 4} height={SIZE - 4} rx="8" className="fill-rose-500" opacity={0.12} />}
              <rect x={x + 2} y={y + 2} width={SIZE - 4} height={SIZE - 4} rx="8" fill="none" className={s === last?.s ? 'stroke-amber-500' : 'stroke-gray-300 dark:stroke-gray-600'} strokeWidth={s === last?.s ? 4 : 1} />
              {s === GOAL && (
                <text x={x + SIZE / 2} y={y + 62} fontSize="26" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300" fontWeight="bold">
                  🏆 +10
                </text>
              )}
              {s === PIT && (
                <text x={x + SIZE / 2} y={y + 62} fontSize="26" textAnchor="middle" className="fill-rose-700 dark:fill-rose-300" fontWeight="bold">
                  🕳 −10
                </text>
              )}
              {s === SNACK && (
                <text x={x + SIZE / 2} y={y + 62} fontSize="26" textAnchor="middle" className="fill-amber-700 dark:fill-amber-300" fontWeight="bold">
                  🍪 +1
                </text>
              )}
              {s === START && (
                <text x={x + 8} y={y + 22} fontSize="16" className="fill-gray-500 dark:fill-gray-400">
                  старт
                </text>
              )}
              {!wall && !isEnd(s) && trained && (
                <>
                  <text x={x + SIZE / 2} y={y + 58} fontSize="38" textAnchor="middle" className="fill-gray-900 dark:fill-white" fontWeight="bold">
                    {best.length === 1 ? ARROWS[best[0]] : '·'}
                  </text>
                  <text x={x + SIZE / 2} y={y + 88} fontSize="20" textAnchor="middle" className="fill-gray-800 dark:fill-gray-100" fontFamily="monospace">
                    {dec(max)}
                  </text>
                </>
              )}
              {s === agent && <circle cx={x + SIZE - 22} cy={y + 22} r="13" className="fill-fuchsia-600 stroke-white" strokeWidth="3" />}
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-center text-xs text-gray-600 dark:text-gray-400">
        Кръгчето е агентът. Стрелката е най-доброто действие според таблицата, числото – неговата стойност Q. Сивите клетки са стена.
      </p>
      <Sliders>
        <Slider label="α" value={alpha} onChange={setAlpha} min={0.1} max={1} step={0.1} tone="blue" />
        <Slider label="γ" value={gamma} onChange={setGamma} min={0.3} max={0.95} step={0.05} tone="violet" />
        <Slider label="ε" value={eps} onChange={setEps} min={0} max={1} step={0.1} tone="amber" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={step}>1 стъпка</DiagramButton>
        <DiagramButton onClick={() => episodes(1)}>1 епизод</DiagramButton>
        <DiagramButton onClick={() => episodes(100)}>100 епизода</DiagramButton>
        <DiagramButton onClick={reset}>отначало</DiagramButton>
      </Buttons>
      {last && (
        <Formula>
          Q({ARROWS[last.a]}) ← {short(last.old)} + {short(alpha)} · ({short(last.reward)} + {short(gamma)} · {short(last.nextMax)} − {short(last.old)}) = {short(last.value)}
        </Formula>
      )}
      <div className="mt-3">
        <Readout
          items={[
            { label: 'епизоди', value: st.episodes, tone: 'gray' },
            { label: '🏆', value: st.counts.goal, tone: 'emerald' },
            { label: '🍪', value: st.counts.snack, tone: 'amber' },
            { label: '🕳', value: st.counts.pit, tone: 'rose' },
            { label: 'стъпки в последния', value: st.lastSteps ?? '—', tone: 'gray' },
            { label: 'стойност на старта', value: dec(startValue), tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={!path ? 'gray' : path.end === GOAL ? 'emerald' : path.end === SNACK && !snackBest ? 'amber' : 'gray'}>
        {!path
          ? st.episodes === 0
            ? 'Таблицата е празна: всички стойности са 0 и агентът се лута наслуки.'
            : 'Стрелките още не водят от старта до награда. Пусни още епизоди.'
          : path.end === GOAL
            ? `Стрелките водят от старта до голямата награда за ${path.steps} стъпки.`
            : path.end === SNACK
              ? snackBest
                ? `Стрелките водят към бисквитката за ${path.steps} стъпки – при толкова малка γ това наистина е по-изгодно.`
                : `Стрелките водят към бисквитката за ${path.steps} стъпки. Агентът не знае, че има по-голяма награда – изследва твърде малко.`
              : 'Стрелките водят към ямата – пусни още епизоди.'}
      </Note>
    </div>
  );
}
