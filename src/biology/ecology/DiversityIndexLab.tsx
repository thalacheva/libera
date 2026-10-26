import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';
import type { Tone } from '~/geometry/diagramMath';

/** Шестте вида на ливадата – цвят на точките и тон на плъзгача. */
const SPECIES: { name: string; color: string; tone: Tone }[] = [
  { name: 'детелина', color: '#e11d48', tone: 'rose' },
  { name: 'лютиче', color: '#f59e0b', tone: 'amber' },
  { name: 'метлица', color: '#10b981', tone: 'emerald' },
  { name: 'камбанка', color: '#8b5cf6', tone: 'violet' },
  { name: 'синчец', color: '#3b82f6', tone: 'blue' },
  { name: 'равнец', color: '#6b7280', tone: 'gray' },
];

const PRESETS: { name: string; a: number[]; b: number[]; msg: string }[] = [
  {
    name: 'равномерно и с доминант',
    a: [20, 20, 20, 20, 20, 20],
    b: [95, 5, 5, 5, 5, 5],
    msg: 'И в двата квадрата има по 6 вида и по 120 растения, но в Б детелината е 95 от 120. Видовото богатство е еднакво, а разнообразието – не: ако вземеш две растения наслуки от Б, най-често и двете са детелини.',
  },
  {
    name: 'богато и бедно',
    a: [20, 20, 20, 20, 20, 20],
    b: [40, 40, 40, 0, 0, 0],
    msg: 'И двата квадрата са напълно равномерни (J = 1), но в А видовете са два пъти повече – и двата индекса са по-високи.',
  },
  {
    name: 'редки видове',
    a: [40, 40, 40, 0, 0, 0],
    b: [38, 38, 38, 2, 2, 2],
    msg: 'В Б има три редки вида – по 2 растения. Видовото богатство се удвоява, Шанън расте ясно, а Симпсън – съвсем малко: индексът на Симпсън почти не „усеща“ редките видове, а Шанън е по-чувствителен към тях.',
  },
];

function stats(ns: number[]) {
  const N = ns.reduce((s, n) => s + n, 0);
  const S = ns.filter(n => n > 0).length;
  const simpson = N > 1 ? 1 - ns.reduce((s, n) => s + n * (n - 1), 0) / (N * (N - 1)) : 0;
  const shannon = N > 0 ? -ns.reduce((s, n) => (n > 0 ? s + (n / N) * Math.log(n / N) : s), 0) : 0;
  const even = S > 1 ? shannon / Math.log(S) : null;
  return { N, S, simpson, shannon, even };
}

const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

/** Детерминирани „случайни“ числа, за да не прескачат растенията при всяко прерисуване. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/** Позиции на растенията в квадрата: всеки вид има свои места, затова при промяна на броя се добавят и махат само крайните. */
const SPOTS = SPECIES.map((_, k) => {
  const r = rng(1000 + k * 7919);
  return Array.from({ length: 100 }, () => [r(), r()] as const);
});

const SIZE = 250;

function Quadrat({ x, label, ns }: { x: number; label: string; ns: number[] }) {
  return (
    <g>
      <text x={x + SIZE / 2} y={22} fontSize="15" fontWeight="700" textAnchor="middle" fill="currentColor">
        {label}
      </text>
      <rect x={x} y={34} width={SIZE} height={SIZE} rx={6} className="fill-lime-50 dark:fill-gray-900" stroke="currentColor" strokeWidth={1.5} />
      {ns.map((n, k) =>
        SPOTS[k].slice(0, n).map(([u, v], j) => <circle key={`${k}-${j}`} cx={x + 8 + u * (SIZE - 16)} cy={42 + v * (SIZE - 16)} r={4.2} fill={SPECIES[k].color} opacity={0.9} />)
      )}
    </g>
  );
}

/** Индекси на разнообразие: два квадрата от ливада с шест вида растения. */
export default function DiversityIndexLab() {
  const [a, setA] = useState(PRESETS[0].a);
  const [b, setB] = useState(PRESETS[0].b);
  const [edit, setEdit] = useState<'a' | 'b'>('b');
  const [preset, setPreset] = useState<number | null>(0);

  const sa = useMemo(() => stats(a), [a]);
  const sb = useMemo(() => stats(b), [b]);
  const cur = edit === 'a' ? a : b;
  const setCur = edit === 'a' ? setA : setB;

  const rows: [string, (s: ReturnType<typeof stats>) => string][] = [
    ['видове S', s => String(s.S)],
    ['растения N', s => String(s.N)],
    ['Симпсън D', s => fmt(s.simpson)],
    ['Шанън H′', s => fmt(s.shannon)],
    ['изравненост J', s => (s.even === null ? '–' : fmt(s.even))],
  ];

  let msg: string;
  if (preset !== null) msg = PRESETS[preset].msg;
  else if (sa.S === sb.S && Math.abs(sa.shannon - sb.shannon) > 0.05)
    msg = `Еднакъв брой видове (${sa.S}), но различно разнообразие – по-изравненият квадрат (${sa.shannon > sb.shannon ? 'А' : 'Б'}) е по-разнообразен.`;
  else if (sa.N < 2 || sb.N < 2) msg = 'Нужни са поне две растения във всеки квадрат, за да има смисъл индексът на Симпсън.';
  else msg = `По Шанън по-разнообразен е квадрат ${sa.shannon >= sb.shannon ? 'А' : 'Б'}, по Симпсън – ${sa.simpson >= sb.simpson ? 'А' : 'Б'}. Двата индекса обикновено подреждат съобществата еднакво, но не винаги.`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 430" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <Quadrat x={40} label="Квадрат А" ns={a} />
        <Quadrat x={350} label="Квадрат Б" ns={b} />

        {/* таблица с индексите */}
        <g fontSize="13" fill="currentColor">
          {rows.map(([name, f], k) => (
            <g key={name}>
              <text x={165} y={318 + k * 22} textAnchor="middle" fontWeight="700">
                {f(sa)}
              </text>
              <text x={320} y={318 + k * 22} textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                {name}
              </text>
              <text x={475} y={318 + k * 22} textAnchor="middle" fontWeight="700">
                {f(sb)}
              </text>
            </g>
          ))}
        </g>
      </LabSvg>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-2">
        {SPECIES.map(s => (
          <span key={s.name} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: s.color }} /> {s.name}
          </span>
        ))}
      </div>

      <Buttons>
        {PRESETS.map((p, k) => (
          <DiagramButton
            key={p.name}
            active={preset === k}
            onClick={() => {
              setA(p.a);
              setB(p.b);
              setPreset(k);
            }}
          >
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={edit === 'a'} onClick={() => setEdit('a')}>
          променяй А
        </DiagramButton>
        <DiagramButton active={edit === 'b'} onClick={() => setEdit('b')}>
          променяй Б
        </DiagramButton>
      </Buttons>
      <Sliders>
        {SPECIES.map((s, k) => (
          <Slider
            key={s.name}
            label={`вид ${k + 1}`}
            value={cur[k]}
            onChange={v => {
              setCur(ns => ns.map((n, j) => (j === k ? v : n)));
              setPreset(null);
            }}
            min={0}
            max={100}
            step={1}
            tone={s.tone}
          />
        ))}
      </Sliders>

      <Readout
        items={[
          { label: 'Σn(n−1) в Б', value: String(b.reduce((s, n) => s + n * (n - 1), 0)), tone: 'violet' },
          { label: 'N(N−1) в Б', value: String(sb.N * (sb.N - 1)), tone: 'violet' },
          { label: 'D в Б', value: fmt(sb.simpson, 3), tone: 'rose' },
          { label: 'H′ макс. (ln S)', value: sb.S > 0 ? fmt(Math.log(sb.S)) : '–', tone: 'amber' },
        ]}
      />
      <Formula>
        D = 1 − Σ n(n − 1) / (N(N − 1)) &nbsp;·&nbsp; H′ = −Σ p · ln p &nbsp;·&nbsp; J = H′ / ln S
      </Formula>
      <Note tone="emerald">{msg}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Индексът на Симпсън D е вероятността две растения, взети наслуки (без връщане), да са от различни видове – от 0 (един вид) до
        почти 1. Индексът на Шанън H′ расте и с броя на видовете, и с изравнеността; при S еднакво честите вида е най-голям: ln S.
        Изравнеността J = H′ / ln S е 1, когато всички видове са еднакво чести. Плъзгачите са подредени като цветовете в легендата.
      </p>
    </div>
  );
}
