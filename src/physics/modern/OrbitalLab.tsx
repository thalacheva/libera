import { useMemo, useState } from 'react';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

// Разстоянията са в радиуси на Бор a₀; точките са в равнината xz (сечение през ядрото, y = 0).
type Orbital = {
  name: string;
  n: number;
  l: number;
  m: string;
  /** Вълнова функция (без нормировка) в точката (x, z). */
  psi: (x: number, z: number) => number;
  /** Радиална функция R(r) – нормирана, за графиката на P(r) = r²R². */
  R: (r: number) => number;
};

const e = Math.exp;
const R10 = (r: number) => 2 * e(-r);
const R20 = (r: number) => ((2 - r) * e(-r / 2)) / (2 * Math.SQRT2);
const R21 = (r: number) => (r * e(-r / 2)) / (2 * Math.sqrt(6));
const R30 = (r: number) => ((2 / (81 * Math.sqrt(3))) * (27 - 18 * r + 2 * r * r)) * e(-r / 3);
const R31 = (r: number) => ((4 / (81 * Math.sqrt(6))) * (6 - r) * r) * e(-r / 3);
const R32 = (r: number) => ((4 / (81 * Math.sqrt(30))) * r * r) * e(-r / 3);
const rad = (x: number, z: number) => Math.hypot(x, z);

const ORBITALS: Orbital[] = [
  { name: '1s', n: 1, l: 0, m: '0', psi: (x, z) => e(-rad(x, z)), R: R10 },
  { name: '2s', n: 2, l: 0, m: '0', psi: (x, z) => (2 - rad(x, z)) * e(-rad(x, z) / 2), R: R20 },
  { name: '2p_z', n: 2, l: 1, m: '0', psi: (x, z) => z * e(-rad(x, z) / 2), R: R21 },
  { name: '2p_x', n: 2, l: 1, m: '±1', psi: (x, z) => x * e(-rad(x, z) / 2), R: R21 },
  { name: '3s', n: 3, l: 0, m: '0', psi: (x, z) => (27 - 18 * rad(x, z) + 2 * rad(x, z) ** 2) * e(-rad(x, z) / 3), R: R30 },
  { name: '3p_z', n: 3, l: 1, m: '0', psi: (x, z) => z * (6 - rad(x, z)) * e(-rad(x, z) / 3), R: R31 },
  { name: '3d_z²', n: 3, l: 2, m: '0', psi: (x, z) => (2 * z * z - x * x) * e(-rad(x, z) / 3), R: R32 },
  { name: '3d_xz', n: 3, l: 2, m: '±1', psi: (x, z) => x * z * e(-rad(x, z) / 3), R: R32 },
];

/** Половин ширина на картината (в a₀) за всяко n. */
const HALF = [0, 4.5, 13, 26];
const DOTS = 2600;

/** Генератор на псевдослучайни числа със зададено начало – точките са едни и същи при всяко рендериране. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Точки, разпределени според |ψ|² в сечението (метод с отхвърляне); знакът на ψ дава цвета. */
function sample(o: Orbital, seed: number) {
  const L = HALF[o.n];
  let max = 0;
  for (let i = 0; i <= 120; i++)
    for (let j = 0; j <= 120; j++) {
      const v = o.psi(-L + (2 * L * i) / 120, -L + (2 * L * j) / 120) ** 2;
      if (v > max) max = v;
    }
  const rand = mulberry32(seed);
  const pts: { x: number; z: number; plus: boolean }[] = [];
  for (let k = 0; k < 4000000 && pts.length < DOTS; k++) {
    const x = -L + 2 * L * rand();
    const z = -L + 2 * L * rand();
    const p = o.psi(x, z);
    if (rand() * max * 1.05 < p * p) pts.push({ x, z, plus: p >= 0 });
  }
  return pts;
}

// Облакът: квадрат 230 px; графиката P(r) – вдясно
const C = { x: 128, y: 135, half: 115 };
const G = { left: 290, right: 466, top: 34, bottom: 226 };

/** Орбитали на водорода: облак на вероятността в сечение и радиално разпределение P(r). */
export default function OrbitalLab() {
  const [idx, setIdx] = useState(0);
  const o = ORBITALS[idx];
  const pts = useMemo(() => sample(ORBITALS[idx], 1234 + idx), [idx]);
  const L = HALF[o.n];
  const px = (v: number) => (v / L) * C.half;

  // Радиалното разпределение и най-вероятният радиус
  const rMax = 2 * L * 0.9;
  const curve = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i <= 240; i++) {
      const r = (rMax * i) / 240;
      out.push([r, r * r * o.R(r) ** 2]);
    }
    return out;
  }, [o, rMax]);
  const top = Math.max(...curve.map(c => c[1]));
  const peak = curve.reduce((b, c) => (c[1] > b[1] ? c : b));
  const gx = (r: number) => G.left + (r / rMax) * (G.right - G.left);
  const gy = (p: number) => G.bottom - (p / top) * (G.bottom - G.top) * 0.92;
  const bohr = o.n * o.n;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {ORBITALS.map((orb, i) => (
          <DiagramButton key={orb.name} active={i === idx} onClick={() => setIdx(i)}>
            {orb.name.replace('_', ' ')}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 270">
        {/* Облакът */}
        <rect x={C.x - C.half} y={C.y - C.half} width={2 * C.half} height={2 * C.half} className="fill-gray-50 dark:fill-gray-900" rx={6} />
        {pts.map((p, i) => (
          <circle key={i} cx={C.x + px(p.x)} cy={C.y - px(p.z)} r={1.1} className={p.plus ? 'fill-blue-500' : 'fill-rose-500'} opacity={0.75} />
        ))}
        {/* Орбитата на Бор за сравнение */}
        {px(bohr) < C.half && (
          <circle cx={C.x} cy={C.y} r={px(bohr)} fill="none" className="stroke-amber-500" strokeWidth="1.5" strokeDasharray="5 4" />
        )}
        <circle cx={C.x} cy={C.y} r={2.5} className="fill-gray-900 dark:fill-white" />
        <Label p={{ x: C.x + C.half - 8, y: C.y + C.half - 10 }} size={11} anchor="end">
          x
        </Label>
        <Label p={{ x: C.x - C.half + 10, y: C.y - C.half + 10 }} size={11} anchor="start">
          z
        </Label>
        {/* Мащаб */}
        <line x1={C.x - C.half + 10} y1={C.y + C.half + 12} x2={C.x - C.half + 10 + px(o.n === 1 ? 1 : 5)} y2={C.y + C.half + 12} className="stroke-gray-500" strokeWidth="2" />
        <Label p={{ x: C.x - C.half + 16 + px(o.n === 1 ? 1 : 5), y: C.y + C.half + 12 }} size={10} anchor="start">
          {o.n === 1 ? 'a₀' : '5a₀'}
        </Label>

        {/* Радиалното разпределение */}
        <line x1={G.left} y1={G.bottom} x2={G.right} y2={G.bottom} className="stroke-gray-400" strokeWidth="1.5" />
        <line x1={G.left} y1={G.bottom} x2={G.left} y2={G.top - 4} className="stroke-gray-400" strokeWidth="1.5" />
        <Label p={{ x: G.left + 4, y: G.top - 14 }} size={10} anchor="start">
          P(r) – вероятност на разстояние r
        </Label>
        <path
          d={curve.map(([r, p], i) => `${i ? 'L' : 'M'} ${gx(r).toFixed(1)} ${gy(p).toFixed(1)}`).join(' ')}
          fill="none"
          className="stroke-blue-500"
          strokeWidth="2.5"
        />
        {bohr <= rMax && (
          <>
            <line x1={gx(bohr)} y1={G.top} x2={gx(bohr)} y2={G.bottom} className="stroke-amber-500" strokeWidth="1.5" strokeDasharray="5 4" />
            <Label p={{ x: gx(bohr), y: G.bottom + 26 }} size={9} tone="amber">
              {`Бор: ${bohr}a₀`}
            </Label>
          </>
        )}
        <circle cx={gx(peak[0])} cy={gy(peak[1])} r={4} className="fill-blue-600" />
        {[0, Math.round(rMax / 2), Math.round(rMax)].map(v => (
          <Label key={v} p={{ x: gx(v), y: G.bottom + 12 }} size={9}>
            {`${v}`}
          </Label>
        ))}
        <Label p={{ x: G.right, y: G.bottom - 10 }} size={10} anchor="end">
          r, a₀
        </Label>
      </ZoomingSvg>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'n =', value: o.n, tone: 'blue' },
            { label: 'l =', value: `${o.l} (${'spd'[o.l]})`, tone: 'violet' },
            { label: 'm =', value: o.m, tone: 'amber' },
            { label: 'най-вероятно r ≈', value: `${fmtNum(peak[0], 1)} a₀`, tone: 'emerald' },
            { label: 'възли:', value: `${o.n - o.l - 1} радиални, ${o.l} ъглови` },
          ]}
        />
      </div>
      <Note tone="violet">
        {o.l === 0
          ? o.n === 1
            ? 'Облакът е сферичен и най-гъст до ядрото, но вероятността на разстояние r (вдясно) е най-голяма точно при r = a₀ – радиуса на Бор.'
            : `s-орбиталата е сферична, но има ${o.n - 1} сферичн${o.n === 2 ? 'а повърхнина' : 'и повърхнини'}, на които електронът никога не се намира.`
          : o.l === 1
            ? 'p-орбиталата има два дяла с противоположни знаци на ψ и равнина през ядрото, където вероятността е нула.'
            : 'd-орбиталите имат по-сложна форма – два равнинни (или конусни) възела. Най-вероятният радиус 9a₀ съвпада с орбитата на Бор за n = 3.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Всяка точка е едно възможно положение на електрона при измерване – в сечение през ядрото. Синьо и червено показват знака на
        вълновата функция ψ; вероятността зависи от |ψ|². Пунктирът е орбитата на Бор с радиус n²a₀. p_x и d_xz са комбинации на състоянията
        с m = +1 и m = −1.
      </p>
    </div>
  );
}
