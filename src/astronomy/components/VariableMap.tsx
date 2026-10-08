import { useState } from 'react';
import { hrAxes, msLuminosity, msTemperature } from './hrData';
import { fmt } from './terrestrialData';

const W = 640;
const H = 330;
const X0 = 50;
const X1 = 330;
const Y0 = 24;
const Y1 = 300;
const { x: hx, y: hy } = hrAxes(X0, X1, Y0, Y1);
// Кривата на блясъка вдясно
const CX0 = 370;
const CX1 = 620;
const CY0 = 70;
const CY1 = 230;

type Shape = 'cepheid' | 'rrlyr' | 'mira' | 'dscuti' | 'zzceti' | 'semireg' | 'lbv';

type VarClass = {
  id: Shape;
  name: string;
  T: [number, number];
  L: [number, number];
  color: string;
  period: string;
  amplitude: number; // звездни величини
  example: string;
  text: string;
};

const CLASSES: VarClass[] = [
  { id: 'cepheid', name: 'Класически цефеиди', T: [5300, 6600], L: [800, 4e4], color: '#fbbf24', period: '1–100 дни', amplitude: 1, example: 'δ Цефей, Полярната', text: 'Млади жълти свръхгиганти с маса 4–20 M☉, които пресичат ивицата на нестабилност при „синята примка“ (Лекция 20). Колкото по-ярки, толкова по-бавно пулсират – стандартни свещи за разстояния до 40 Mpc.' },
  { id: 'rrlyr', name: 'RR Лира', T: [6200, 7400], L: [30, 70], color: '#f472b6', period: '0,2–1 ден', amplitude: 1, example: 'RR Лира', text: 'Стари звезди с маса ~0,7 M☉, които горят хелий в ядрото (хоризонталния клон). Всички имат почти една и съща светимост, M_V ≈ +0,6 – идеални за разстояния до кълбовидните купове и в Галактиката.' },
  { id: 'dscuti', name: 'δ Щит', T: [6800, 8600], L: [4, 60], color: '#a78bfa', period: '0,02–0,25 дни', amplitude: 0.15, example: 'δ Щит, Алтаир', text: 'Звезди от главната последователност в ивицата на нестабилност. Пулсират едновременно с няколко периода – като камбана с няколко тона. От тях се изучава вътрешността на звездите (астросеизмология).' },
  { id: 'mira', name: 'Мириди', T: [2500, 3400], L: [2000, 1.2e4], color: '#f87171', period: '100–1000 дни', amplitude: 6, example: 'Мира (о Кит)', text: 'Червени гиганти от асимптотичния клон, пулсиращи с огромна амплитуда – до 8 величини във видимата светлина. Мира се вижда с просто око около месец, а после изчезва за месеци. Тези звезди изхвърлят прах и маса преди планетарната мъглявина.' },
  { id: 'semireg', name: 'Полуправилни свръхгиганти', T: [3300, 4000], L: [3e4, 2.5e5], color: '#fb923c', period: 'стотици дни, неправилно', amplitude: 0.8, example: 'Бетелгейзе, Антарес', text: 'Огромни червени свръхгиганти, чиито конвективни клетки са колкото Слънчевата система. Блясъкът им се мени неправилно. Голямото отслабване на Бетелгейзе през 2019–2020 г. беше от облак прах, изхвърлен от звездата.' },
  { id: 'lbv', name: 'Ярки сини променливи', T: [12000, 30000], L: [3e5, 3e6], color: '#60a5fa', period: 'години – векове', amplitude: 2, example: 'η Кил, P Лебед', text: 'Най-масивните звезди, на ръба на нестабилността. През 1843 г. η Кил избухва и за кратко става втората по яркост звезда на небето, изхвърляйки ~10 M☉ – без да загине.' },
  { id: 'zzceti', name: 'Пулсиращи бели джуджета (ZZ Кит)', T: [10800, 12500], L: [0.0015, 0.006], color: '#e2e8f0', period: '2–20 минути', amplitude: 0.1, example: 'ZZ Кит', text: 'Бели джуджета, които докато изстиват, преминават през продължението на ивицата на нестабилност. Пулсациите им разкриват масата, въртенето и дебелината на атмосферата им.' },
];

/** Форма на кривата на блясъка за една фаза (0–1); връща отклонение в единици амплитуда (+ = по-ярко). */
function shape(id: Shape, phi: number) {
  // Несиметрична крива: бързо покачване, бавно спадане – хармоници с бързо намаляващи амплитуди
  const s = (coef: number[]) => coef.reduce((v, c, k) => v + c * Math.sin(2 * Math.PI * (k + 1) * phi), 0) / 1.3;
  switch (id) {
    case 'cepheid':
      return s([1, 0.45, 0.2, 0.08]);
    case 'rrlyr':
      return s([1, 0.55, 0.32, 0.18, 0.1, 0.05]);
    case 'mira':
      return Math.cos(2 * Math.PI * phi) * 0.5 + 0.1 * Math.cos(4 * Math.PI * phi);
    case 'dscuti':
      return 0.5 * Math.sin(2 * Math.PI * phi * 3) + 0.3 * Math.sin(2 * Math.PI * phi * 4.3);
    case 'zzceti':
      return 0.4 * Math.sin(2 * Math.PI * phi * 5) + 0.35 * Math.sin(2 * Math.PI * phi * 7.7) + 0.2 * Math.sin(2 * Math.PI * phi * 11.1);
    case 'semireg':
      return 0.3 * Math.sin(2 * Math.PI * phi * 1.3) + 0.25 * Math.sin(2 * Math.PI * phi * 2.9 + 1) + 0.2 * Math.sin(2 * Math.PI * phi * 0.4);
    case 'lbv':
      return phi < 0.15 ? phi / 0.15 : Math.exp(-(phi - 0.15) * 4);
  }
}

// Ивицата на нестабилност в HR диаграмата
const STRIP: [number, number][] = [
  [7600, 20],
  [6700, 1e5],
  [5200, 1e5],
  [6300, 20],
];

const MS = Array.from({ length: 40 }, (_, i) => {
  const M = 0.1 * 600 ** (i / 39);
  return `${hx(Math.min(45000, msTemperature(M)))},${hy(msLuminosity(M))}`;
}).join(' ');

export default function VariableMap() {
  const [id, setId] = useState<Shape>('cepheid');
  const cls = CLASSES.find(c => c.id === id)!;

  const cycles = id === 'lbv' ? 1 : 2.5;
  const pts = Array.from({ length: 301 }, (_, i) => {
    const phi = (i / 300) * cycles;
    const v = shape(id, phi);
    return `${CX0 + (i / 300) * (CX1 - CX0)},${(CY0 + CY1) / 2 - v * ((CY1 - CY0) / 2) * 0.9}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-amber-300 dark:border-amber-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Къде живеят променливите звезди</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Повечето пулсиращи звезди са в една тясна диагонална ивица на HR диаграмата – ивицата на нестабилност. Щракнете върху клас,
        за да видите типичната му крива на блясъка.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="#0b1120" stroke="white" strokeOpacity="0.25" />
        <defs>
          <clipPath id="vm-plot">
            <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
          </clipPath>
        </defs>
        <g clipPath="url(#vm-plot)">
          <polyline points={MS} fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="8" strokeLinecap="round" />
          <polygon points={STRIP.map(([T, L]) => `${hx(T)},${hy(L)}`).join(' ')} fill="#fde68a" fillOpacity="0.12" stroke="#fde68a" strokeOpacity="0.4" strokeDasharray="4 3" />
          {CLASSES.map(c => {
            const x0 = hx(c.T[1]);
            const x1 = hx(c.T[0]);
            const y0 = hy(c.L[1]);
            const y1 = hy(c.L[0]);
            const sel = c.id === id;
            return (
              <ellipse
                key={c.id}
                cx={(x0 + x1) / 2}
                cy={(y0 + y1) / 2}
                rx={Math.max(6, (x1 - x0) / 2)}
                ry={Math.max(5, (y1 - y0) / 2)}
                fill={c.color}
                fillOpacity={sel ? 0.7 : 0.35}
                stroke={sel ? 'white' : c.color}
                strokeWidth={sel ? 2 : 1}
                className="cursor-pointer"
                onClick={() => setId(c.id)}
              />
            );
          })}
        </g>
        <text x={hx(6400)} y={hy(3e5)} fontSize="9" textAnchor="middle" fill="#fde68a" fillOpacity="0.8">
          ивица на нестабилност
        </text>
        {[30000, 10000, 5000, 3000].map(T => (
          <text key={T} x={hx(T)} y={Y1 + 13} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {fmt(T, 0)} K
          </text>
        ))}
        {[
          [-2, '10⁻²'],
          [0, '1'],
          [2, '10²'],
          [4, '10⁴'],
          [6, '10⁶'],
        ].map(([q, label]) => (
          <text key={q} x={X0 - 4} y={hy(10 ** Number(q)) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
            {label}
          </text>
        ))}

        {/* Крива на блясъка */}
        <text x={CX0} y={CY0 - 30} fontSize="13" fontWeight="700" fill={cls.color}>
          {cls.name}
        </text>
        <text x={CX0} y={CY0 - 13} fontSize="10" fill="white" fillOpacity="0.7">
          период: {cls.period} · амплитуда ~{fmt(cls.amplitude, 2)} mag
        </text>
        <rect x={CX0} y={CY0} width={CX1 - CX0} height={CY1 - CY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <polyline points={pts} fill="none" stroke={cls.color} strokeWidth="2" />
        <text x={CX0 + 4} y={CY0 + 12} fontSize="9" fill="white" fillOpacity="0.5">
          по-ярко ↑
        </text>
        <text x={CX1} y={CY1 + 14} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.5">
          време →
        </text>
        <text x={CX0} y={CY1 + 34} fontSize="10" fill="white" fillOpacity="0.7">
          пример: {cls.example}
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {CLASSES.map(c => (
          <button
            key={c.id}
            onClick={() => setId(c.id)}
            className={`px-2 py-1 rounded text-xs border ${
              c.id === id ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: c.color }} />
            {c.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{cls.text}</p>
    </div>
  );
}
