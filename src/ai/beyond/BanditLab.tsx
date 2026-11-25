import { useRef, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { ARM_NAMES, ARMS, type Bandit, estimate, greedyArm, mulberry32, newBandit, pull, regret, runBandit, totalPulls, totalWins } from './rlMath';

const SEED = 1;
const pct = (v: number) => `${Math.round(v * 100)}%`;
const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Многоръкият бандит: четири ръчки със скрити вероятности. Ученикът дърпа сам или пуска ε-алчна стратегия. */
export default function BanditLab() {
  const random = useRef(mulberry32(SEED));
  const [bandit, setBandit] = useState<Bandit>(newBandit);
  const [eps, setEps] = useState(0.1);
  const [shown, setShown] = useState(false);
  const [last, setLast] = useState<{ arm: number; win: boolean } | null>(null);

  const n = totalPulls(bandit);
  const wins = totalWins(bandit);
  const best = greedyArm(bandit);
  const top = ARMS.indexOf(Math.max(...ARMS));

  const manual = (arm: number) => {
    const next = pull(bandit, arm, random.current);
    setLast({ arm, win: next.wins[arm] > bandit.wins[arm] });
    setBandit(next);
  };
  const auto = (count: number) => {
    setBandit(runBandit(bandit, eps, count, random.current));
    setLast(null);
  };
  const reset = () => {
    random.current = mulberry32(SEED);
    setBandit(newBandit());
    setLast(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3 max-w-xl mx-auto">
        {ARMS.map((p, i) => {
          const est = estimate(bandit, i);
          const lead = n > 0 && i === best && bandit.counts[i] > 0;
          return (
            <div key={i} className={`min-w-0 rounded-lg border p-1.5 sm:p-2 text-center ${lead ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/30' : 'border-gray-200 dark:border-gray-700'}`}>
              <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100">ръчка {ARM_NAMES[i]}</p>
              <div className="mx-auto mt-1 flex h-20 w-6 items-end rounded bg-gray-100 dark:bg-gray-900/60 overflow-hidden">
                <div className="w-full bg-fuchsia-500" style={{ height: `${est * 100}%` }} />
              </div>
              <p className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-100">{bandit.counts[i] ? pct(est) : '?'}</p>
              <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                {bandit.wins[i]} от {bandit.counts[i]}
              </p>
              <p className={`text-[11px] sm:text-xs font-mono ${shown ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>{shown ? `скрито: ${pct(p)}` : 'скрито: ??'}</p>
              <button
                onClick={() => manual(i)}
                className="mt-1 w-full rounded bg-fuchsia-600 px-1 py-1 text-xs sm:text-sm font-medium text-white hover:bg-fuchsia-700 active:bg-fuchsia-800 cursor-pointer"
              >
                дръпни
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 min-h-5">
        {last ? `Ръчка ${ARM_NAMES[last.arm]}: ${last.win ? 'печалба (+1)' : 'нищо (0)'}` : 'Стълбчето е оценката – делът на печалбите от дърпанията на тази ръчка досега.'}
      </p>
      <Sliders>
        <Slider label="ε" value={eps} onChange={setEps} min={0} max={1} step={0.05} tone="amber" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => auto(10)}>10 дърпания по стратегията</DiagramButton>
        <DiagramButton onClick={() => auto(100)}>100 дърпания</DiagramButton>
        <DiagramButton onClick={reset}>отначало</DiagramButton>
        <DiagramButton active={shown} onClick={() => setShown(!shown)}>
          {shown ? 'скрий вероятностите' : 'покажи вероятностите'}
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'дърпания', value: n, tone: 'gray' },
            { label: 'печалби', value: wins, tone: 'violet' },
            { label: 'средно на дърпане', value: n ? dec(wins / n) : '—', tone: 'rose' },
            ...(shown ? [{ label: 'изпуснато спрямо най-добрата', value: dec(regret(bandit), 1), tone: 'amber' as const }] : []),
          ]}
        />
      </div>
      <Note tone={n === 0 ? 'gray' : eps === 0 && bandit.counts[top] === 0 ? 'rose' : eps >= 0.95 ? 'amber' : 'gray'}>
        {n === 0
          ? 'Всяка ръчка печели с различна, неизвестна вероятност. Намери най-добрата с възможно най-малко загубени дърпания.'
          : eps === 0 && bandit.counts[top] === 0
            ? 'При ε = 0 стратегията дърпа само ръчката с най-висока оценка – и никога не научава, че има по-добра.'
            : eps >= 0.95
              ? 'При ε = 1 стратегията само изследва: оценките са точни, но наученото не се използва.'
              : `С вероятност ${pct(eps)} стратегията дърпа случайна ръчка (изследва), в останалите случаи – тази с най-висока оценка (използва).`}
      </Note>
    </div>
  );
}
