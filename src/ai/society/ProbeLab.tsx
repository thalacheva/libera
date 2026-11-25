import { useMemo, useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { HIDDEN, NET_STEPS, netAccuracy, PROBE_TEST, PROPERTIES, type PropertyId, runProbe, type Site } from './featureMath';

const pct = (v: number) => `${(v * 100).toLocaleString('bg-BG', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
const SIZE = 260;
const sx = (x: number) => (x / 10) * SIZE;
const sy = (y: number) => SIZE - (y / 10) * SIZE;

/** Линейна сонда: логистична регресия, която се опитва да прочете дадено свойство от входа или от скрития слой на мрежа 2 → 8 → 1. */
export default function ProbeLab() {
  const [property, setProperty] = useState<PropertyId>('target');
  const [site, setSite] = useState<Site>('input');
  const [steps, setSteps] = useState(1000);

  const result = useMemo(() => runProbe(site, steps, property), [site, steps, property]);
  const netAcc = useMemo(() => netAccuracy(steps), [steps]);
  const info = PROPERTIES.find(x => x.id === property)!;
  const dims = site === 'input' ? 2 : HIDDEN;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-xs font-semibold text-center text-gray-600 dark:text-gray-300">Какво търси сондата:</p>
      <Buttons>
        {PROPERTIES.map(x => (
          <DiagramButton key={x.id} active={x.id === property} onClick={() => setProperty(x.id)}>
            {x.label}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">{info.note}</p>
      <div className="min-w-0 mt-3">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[300px] mx-auto block rounded border border-gray-200 dark:border-gray-700" role="img" aria-label="Новите точки, оцветени по свойството; грешките на сондата са оградени">
          {PROBE_TEST.map((pt, i) => {
            const label = result.labels[i];
            const wrong = result.guesses[i] !== label;
            return (
              <g key={i}>
                <circle cx={sx(pt.x)} cy={sy(pt.y)} r="3.2" className={label ? 'fill-fuchsia-500' : 'fill-sky-500'} />
                {wrong && <circle cx={sx(pt.x)} cy={sy(pt.y)} r="6" className="fill-none stroke-gray-900 dark:stroke-white" strokeWidth="1.5" />}
              </g>
            );
          })}
        </svg>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
          200 нови точки: <span className="text-fuchsia-600 dark:text-fuchsia-400 font-semibold">има</span> свойството /{' '}
          <span className="text-sky-600 dark:text-sky-400 font-semibold">няма</span>; оградените сондата е сбъркала
        </p>
      </div>
      <p className="text-xs font-semibold text-center text-gray-600 dark:text-gray-300 mt-3">Откъде чете сондата:</p>
      <Buttons>
        <DiagramButton active={site === 'input'} onClick={() => setSite('input')}>
          от входа (2 числа)
        </DiagramButton>
        <DiagramButton active={site === 'hidden'} onClick={() => setSite('hidden')}>
          от скрития слой (8 числа)
        </DiagramButton>
      </Buttons>
      <p className="text-xs font-semibold text-center text-gray-600 dark:text-gray-300 mt-3">Колко стъпки е обучавана мрежата:</p>
      <Buttons>
        {NET_STEPS.map(s => (
          <DiagramButton key={s} active={s === steps} onClick={() => setSteps(s)}>
            {s === 0 ? 'необучена' : s}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'мрежата на своята задача', value: pct(netAcc), tone: 'blue' },
            { label: `сонда върху ${dims} числа, познати точки`, value: pct(result.train), tone: 'amber' },
            { label: 'сондата на нови точки', value: pct(result.test), tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={property === 'random' ? 'amber' : result.test >= 0.9 ? 'emerald' : 'gray'}>
        {property === 'random'
          ? 'Случайните етикети не могат да се „прочетат“ отникъде: на новите точки сондата е около 50%. Над 50% на познатите точки значи, че самата сонда е назубрила нещо.'
          : result.test >= 0.9
            ? site === 'input'
              ? 'Свойството се чете с права линия направо от входа – сондата не казва нищо за мрежата.'
              : 'Свойството може да се прочете от активациите с проста линейна сонда. Това още не значи, че мрежата го използва.'
            : 'Сондата не успява да прочете свойството оттук с права линия.'}
      </Note>
    </div>
  );
}
