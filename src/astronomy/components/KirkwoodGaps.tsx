import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 300;
const A_JUPITER = 5.203;

// Хистограмата
const HX0 = 40;
const HX1 = 620;
const HY0 = 30;
const HY1 = 170;
const A_MIN = 1.8;
const A_MAX = 4.2;
const BIN = 0.01;
const hx = (a: number) => HX0 + ((a - A_MIN) / (A_MAX - A_MIN)) * (HX1 - HX0);

type Resonance = { p: number; q: number; kind: 'gap' | 'group'; name: string; text: string };

// Астероидът прави p обиколки, докато Юпитер прави q
const RESONANCES: Resonance[] = [
  { p: 4, q: 1, kind: 'gap', name: '4 : 1', text: 'Вътрешният ръб на пояса. Заедно с вековия резонанс ν₆ (с прецесията на орбитата на Сатурн) тук орбитите стават нестабилни – оттук към Земята идват много от околоземните астероиди.' },
  { p: 3, q: 1, kind: 'gap', name: '3 : 1', text: 'Най-изчистената пролука. За ~1 млн. години Юпитер прави орбитите тук толкова издължени, че пресичат орбитите на Марс и Земята. Повечето метеорити вероятно идват оттук.' },
  { p: 5, q: 2, kind: 'gap', name: '5 : 2', text: 'Отделя средната от външната част на пояса. Астероидите тук се изхвърлят от Юпитер за по-малко от милион години.' },
  { p: 7, q: 3, kind: 'gap', name: '7 : 3', text: 'По-слаб резонанс – по-тясна и не съвсем празна пролука.' },
  { p: 2, q: 1, kind: 'gap', name: '2 : 1', text: 'Външният ръб на главния пояс. Хаотична зона: астероидите остават тук най-много за няколко десетки милиона години.' },
  { p: 3, q: 2, kind: 'group', name: '3 : 2 (Хилди)', text: 'Тук е обратното – група! Като Плутон с Нептун, Хилдите са защитени от резонанса: когато са най-далеч от Слънцето (най-близо до орбитата на Юпитер), той винаги е на 60° или 180° от тях.' },
];

const resonanceA = (r: Resonance) => A_JUPITER * (r.q / r.p) ** (2 / 3);

/** Схематична плътност на астероидите по a: три части на пояса, Хунгарии, Хилди и пролуки при резонансите. */
function density(a: number) {
  let n = 0;
  if (a > 2.06 && a < 3.28) {
    const inner = a < 2.5 ? 1 : 0;
    const middle = a >= 2.5 && a < 2.82 ? 0.95 : 0;
    const outer = a >= 2.82 ? 0.75 * Math.exp(-((a - 3.1) ** 2) / 0.08) + 0.15 : 0;
    n = inner * (0.55 + 0.45 * Math.sin(((a - 2.06) / 0.44) * Math.PI * 0.7)) + middle + outer;
    n *= Math.min(1, (a - 2.06) / 0.08) * Math.min(1, (3.28 - a) / 0.1);
  }
  n += 0.12 * Math.exp(-((a - 1.93) ** 2) / 0.002); // Хунгарии
  n += 0.1 * Math.exp(-((a - 3.97) ** 2) / 0.0012); // Хилди
  for (const r of RESONANCES.filter(x => x.kind === 'gap')) {
    const w = r.p - r.q === 1 ? 0.018 : 0.009;
    n *= 1 - 0.97 * Math.exp(-((a - resonanceA(r)) ** 2) / (2 * w * w));
  }
  // „Шум“ – за да изглежда като реална хистограма
  const noise = 1 + 0.12 * Math.sin(a * 913.7) * Math.cos(a * 271.3);
  return Math.max(0, n * noise);
}

const BINS = Array.from({ length: Math.round((A_MAX - A_MIN) / BIN) }, (_, i) => {
  const a = A_MIN + (i + 0.5) * BIN;
  return { a, n: density(a) };
});
const N_MAX = Math.max(...BINS.map(b => b.n));

// Диаграмата на съединенията (вдясно долу)
const DX = 520;
const DY = 250;
const DR = 40;

export default function KirkwoodGaps() {
  const [a, setA] = useState(2.501);
  const ratio = (A_JUPITER / a) ** 1.5; // колко обиколки прави астероидът за една на Юпитер
  const near = RESONANCES.find(r => Math.abs(resonanceA(r) - a) < 0.012);

  // Съединенията с Юпитер: на всяко следващо астероидът е изминал 360°·n/(n − 1) по-далеч
  const synodicShift = (360 * ratio) / (ratio - 1); // ° на астероида между две съединения
  const conj = Array.from({ length: 40 }, (_, k) => ((k * synodicShift) % 360) * (Math.PI / 180));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-stone-300 dark:border-stone-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Пролуките на Къркууд</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Колко астероида има при всяка голяма полуос (схематично, по данни на MPC). Плъзнете маркера: при резонанс с Юпитер
        срещите с него стават все на едни и същи места и тласъците се натрупват.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Хистограма */}
        {BINS.map(b => (
          <rect
            key={b.a}
            x={hx(b.a - BIN / 2)}
            y={HY1 - (b.n / N_MAX) * (HY1 - HY0)}
            width={hx(BIN) - hx(0) + 0.3}
            height={(b.n / N_MAX) * (HY1 - HY0)}
            fill="#a8a29e"
            fillOpacity="0.8"
          />
        ))}
        <line x1={HX0} x2={HX1} y1={HY1} y2={HY1} stroke="white" strokeOpacity="0.4" />
        {[2, 2.5, 3, 3.5, 4].map(v => (
          <text key={v} x={hx(v)} y={HY1 + 14} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
            {fmt(v, 1)} AU
          </text>
        ))}
        <text x={hx(1.93)} y={HY1 - 30} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
          Хунгарии
        </text>

        {RESONANCES.map(r => {
          const x = hx(resonanceA(r));
          const isNear = near === r;
          return (
            <g key={r.name} className="cursor-pointer" onClick={() => setA(resonanceA(r))}>
              <line x1={x} x2={x} y1={HY0 - 6} y2={HY1} stroke={r.kind === 'gap' ? '#f87171' : '#4ade80'} strokeOpacity={isNear ? 1 : 0.45} strokeDasharray="3 3" />
              <text x={x} y={HY0 - 10} fontSize="9" textAnchor="middle" fill={r.kind === 'gap' ? '#fca5a5' : '#86efac'} fontWeight={isNear ? 700 : 400}>
                {r.name}
              </text>
            </g>
          );
        })}

        {/* Избраната полуос */}
        <line x1={hx(a)} x2={hx(a)} y1={HY0} y2={HY1 + 2} stroke="#fbbf24" strokeWidth="2" />
        <circle cx={hx(a)} cy={HY1 + 2} r="4" fill="#fbbf24" />

        {/* Срещи с Юпитер в неподвижна система */}
        <text x={DX} y={DY - DR - 14} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.8">
          къде са първите 40 срещи
        </text>
        <circle cx={DX} cy={DY} r={DR} fill="none" stroke="white" strokeOpacity="0.25" />
        <circle cx={DX} cy={DY} r="4" fill="#fbbf24" />
        {conj.map((c, k) => (
          <circle key={k} cx={DX + DR * Math.cos(c)} cy={DY - DR * Math.sin(c)} r="3" fill="#f87171" fillOpacity={0.25 + (0.75 * (40 - k)) / 40} />
        ))}

        {/* Числата */}
        <g fontSize="11" fill="white">
          <text x={HX0} y={210}>
            a = {fmt(a, 3)} AU
          </text>
          <text x={HX0} y={228} fillOpacity="0.8">
            период: {fmt(a ** 1.5, 2)} г. (Юпитер: 11,86 г.)
          </text>
          <text x={HX0} y={246} fillOpacity="0.8">
            за 1 обиколка на Юпитер: {fmt(ratio, 3)} обиколки
          </text>
          <text x={HX0} y={270} fill={near ? (near.kind === 'gap' ? '#fca5a5' : '#86efac') : '#94a3b8'} fontWeight="700">
            {near ? `резонанс ${near.name}` : 'не е в резонанс – срещите се разпръскват равномерно'}
          </text>
        </g>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Голяма полуос: {fmt(a, 3)} AU</label>
      <input type="range" min="1.9" max="4.1" step="0.001" value={a} onChange={e => setA(Number(e.target.value))} className="w-full" />
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {RESONANCES.map(r => (
          <button
            key={r.name}
            onClick={() => setA(resonanceA(r))}
            className={`px-2 py-1 rounded text-xs border ${
              near === r
                ? 'border-stone-500 bg-stone-100 text-stone-800 dark:bg-stone-500/20 dark:text-stone-200'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {r.name} ({fmt(resonanceA(r), 2)} AU)
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {near
          ? near.text
          : 'Извън резонансите срещите с Юпитер стават на случайни места по орбитата и тласъците му се компенсират средно. Затова тук астероидите оцеляват милиарди години.'}
      </p>
    </div>
  );
}
