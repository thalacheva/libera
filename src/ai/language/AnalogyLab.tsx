import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { analogy, mapWord, WORD_MAP } from './wordVectors';

const W = 640;
const H = 360;
const sx = (v: number) => 30 + v * 44;
const sy = (v: number) => H - 28 - v * 44;
const dec = (v: number) => v.toLocaleString('bg-BG', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const PRESETS: [string, string, string][] = [
  ['мъж', 'цар', 'жена'],
  ['мъж', 'жена', 'дядо'],
  ['Франция', 'Париж', 'Италия'],
  ['мъж', 'жена', 'лекар'],
  ['мъж', 'цар', 'България'],
];
const SLOTS = ['a', 'b', 'c'] as const;
const SLOT_TONE = ['fill-blue-600 dark:fill-blue-400', 'fill-rose-600 dark:fill-rose-400', 'fill-emerald-600 dark:fill-emerald-400'];
const SLOT_TEXT = ['text-blue-700 dark:text-blue-300', 'text-rose-600 dark:text-rose-400', 'text-emerald-700 dark:text-emerald-400'];

function Arrow({ from, to, className, dashed = false }: { from: { x: number; y: number }; to: { x: number; y: number }; className: string; dashed?: boolean }) {
  const a = { x: sx(from.x), y: sy(from.y) };
  const b = { x: sx(to.x), y: sy(to.y) };
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  if (len < 2) return null;
  const u = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
  const base = { x: b.x - u.x * 11, y: b.y - u.y * 11 };
  return (
    <g className={className}>
      <line x1={a.x} y1={a.y} x2={base.x} y2={base.y} strokeWidth="2.5" strokeDasharray={dashed ? '6 5' : undefined} fill="none" />
      <polygon points={`${b.x},${b.y} ${base.x - u.y * 5},${base.y + u.x * 5} ${base.x + u.y * 5},${base.y - u.x * 5}`} stroke="none" />
    </g>
  );
}

/** Опростена карта на думи в две измерения: „a е за b, както c е за ?“ като събиране на вектори. */
export default function AnalogyLab() {
  const [abc, setAbc] = useState<[string, string, string]>(['мъж', 'цар', 'жена']);
  const [slot, setSlot] = useState(0);
  const [a, b, c] = abc;
  const { target, ranked } = analogy(a, b, c);
  const best = ranked[0];
  const good = best.d < 0.6;
  const A = mapWord(a);
  const B = mapWord(b);
  const C = mapWord(c);
  const inside = target.x > -0.5 && target.x < 13.6 && target.y > -0.5 && target.y < 7.4;

  const pick = (w: string) => {
    const next = [...abc] as [string, string, string];
    next[slot] = w;
    setAbc(next);
    setSlot((slot + 1) % 3);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="flex flex-wrap justify-center items-center gap-1.5 mb-2 text-sm font-mono">
        {SLOTS.map((s, i) => (
          <button
            key={s}
            onClick={() => setSlot(i)}
            aria-pressed={slot === i}
            className={`px-2.5 py-1 rounded-lg border ${slot === i ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-500/15' : 'border-gray-200 dark:border-gray-700'} ${SLOT_TEXT[i]}`}
          >
            {s} = {abc[i]}
          </button>
        ))}
      </div>
      <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
        Избери кутийка (a, b или c) и докосни дума от картата.
      </p>
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x="1" y="1" width={W - 2} height={H - 2} rx="8" className="fill-gray-50 stroke-gray-200 dark:fill-gray-900/40 dark:stroke-gray-700" />
        <Arrow from={A} to={B} className="stroke-rose-500 fill-rose-500" />
        {inside && <Arrow from={C} to={target} className="stroke-violet-500 fill-violet-500" dashed />}
        {inside && <circle cx={sx(target.x)} cy={sy(target.y)} r={9} className="fill-none stroke-violet-600 dark:stroke-violet-400" strokeWidth="2.5" />}
        {WORD_MAP.map(m => {
          const i = abc.indexOf(m.word);
          const hit = m.word === best.word;
          return (
            <g key={m.word} onClick={() => pick(m.word)} className="cursor-pointer">
              <rect x={sx(m.x) - 38} y={sy(m.y) - 14} width={76} height={26} fill="transparent" />
              <circle cx={sx(m.x)} cy={sy(m.y)} r={i >= 0 || hit ? 5.5 : 3.5} className={i >= 0 ? SLOT_TONE[i] : hit ? 'fill-violet-600 dark:fill-violet-400' : 'fill-gray-400 dark:fill-gray-500'} />
              <text x={sx(m.x)} y={sy(m.y) - 9} fontSize="14" fontWeight={i >= 0 || hit ? 'bold' : 'normal'} textAnchor="middle" className={i >= 0 ? SLOT_TONE[i] : hit ? 'fill-violet-700 dark:fill-violet-300' : 'fill-gray-700 dark:fill-gray-300'}>
                {m.word}
              </text>
            </g>
          );
        })}
      </LabSvg>
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.join()} active={p.every((w, i) => w === abc[i])} onClick={() => setAbc(p)}>
            {p[1]} − {p[0]} + {p[2]}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'b − a + c', value: `${b} − ${a} + ${c}` },
            { label: 'най-близка дума', value: best.word, tone: 'violet' },
            { label: 'разстояние до нея', value: dec(best.d), tone: good ? 'emerald' : 'rose' },
            { label: 'втора', value: `${ranked[1].word} (${dec(ranked[1].d)})` },
          ]}
        />
      </div>
      <Note tone={good ? 'emerald' : 'rose'}>
        {good
          ? `Червената стрелка е разликата b − a. Пренесена в „${c}“, тя сочи почти точно в „${best.word}“.`
          : `Кръгчето пада на празно място. Най-близката дума е „${best.word}“, но тя е далеч – картата няма смислен отговор на тази аналогия.`}
      </Note>
    </div>
  );
}
