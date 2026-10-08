import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 300;
const SCALE = 140; // px за едно разстояние a между звездите
const OX = 230; // центърът на масите на екрана
const OY = 150;
const STEP = 4; // px – стъпка на мрежата

/** Радиус на полето на Рош (в единици a) по Егълтън; q = маса на звездата / маса на другата. */
const eggleton = (q: number) => (0.49 * q ** (2 / 3)) / (0.6 * q ** (2 / 3) + Math.log(1 + q ** (1 / 3)));

function setup(q: number) {
  const mu = q / (1 + q); // дял на масата на звезда 2
  const x1 = -mu;
  const x2 = 1 - mu;
  const phi = (x: number, y: number) => {
    const r1 = Math.hypot(x - x1, y) + 1e-6;
    const r2 = Math.hypot(x - x2, y) + 1e-6;
    return -(1 - mu) / r1 - mu / r2 - 0.5 * (x * x + y * y);
  };
  // L1: там, където силите по оста се уравновесяват
  const force = (x: number) => ((1 - mu) * (x - x1)) / Math.abs(x - x1) ** 3 + (mu * (x - x2)) / Math.abs(x - x2) ** 3 - x;
  let lo = x1 + 1e-3;
  let hi = x2 - 1e-3;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    // ∂Φ/∂x е положителна близо до M₁ и отрицателна близо до M₂
    if (force(mid) > 0) lo = mid;
    else hi = mid;
  }
  const xL1 = (lo + hi) / 2;
  return { mu, x1, x2, phi, xL1, phiL1: phi(xL1, 0) };
}

/** Изолиния на Φ = level с „марширащи квадрати“; връща SVG път. */
function contour(phi: (x: number, y: number) => number, level: number) {
  const nx = Math.ceil(W / STEP);
  const ny = Math.ceil(H / STEP);
  const val: number[][] = [];
  for (let j = 0; j <= ny; j++) {
    val.push([]);
    for (let i = 0; i <= nx; i++) val[j].push(phi((i * STEP - OX) / SCALE, (OY - j * STEP) / SCALE) - level);
  }
  let d = '';
  const lerp = (a: number, b: number) => a / (a - b);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const v = [val[j][i], val[j][i + 1], val[j + 1][i + 1], val[j + 1][i]];
      const x = i * STEP;
      const y = j * STEP;
      // Далечният клон на еквипотенциалата (където доминира центробежният член) не ни интересува
      if (Math.hypot((x - OX) / SCALE, (OY - y) / SCALE) > 1.3) continue;
      const pts: [number, number][] = [];
      if (v[0] * v[1] < 0) pts.push([x + STEP * lerp(v[0], v[1]), y]);
      if (v[1] * v[2] < 0) pts.push([x + STEP, y + STEP * lerp(v[1], v[2])]);
      if (v[3] * v[2] < 0) pts.push([x + STEP * lerp(v[3], v[2]), y + STEP]);
      if (v[0] * v[3] < 0) pts.push([x, y + STEP * lerp(v[0], v[3])]);
      for (let k = 0; k + 1 < pts.length; k += 2) d += `M${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)}L${pts[k + 1][0].toFixed(1)} ${pts[k + 1][1].toFixed(1)}`;
    }
  }
  return d;
}

export default function RocheLobeLab() {
  const [q, setQ] = useState(0.5);
  const [fill1, setFill1] = useState(0.7);
  const [fill2, setFill2] = useState(0.5);
  const s = setup(q);
  const rl1 = eggleton(1 / q); // звезда 1 – по-масивната
  const rl2 = eggleton(q);
  const full1 = fill1 >= 0.995;
  const full2 = fill2 >= 0.995;

  const critical = contour(s.phi, s.phiL1);
  const outer = contour(s.phi, s.phiL1 + 0.12);

  // Запълнено поле на Рош: клетки с Φ < Φ_L1 от съответната страна на L1
  const filledCells = (side: 1 | 2) => {
    const cells: string[] = [];
    const F = 2; // по-ситна мрежа за запълването
    for (let py = 0; py < H; py += F) {
      for (let px = 0; px < W * 0.7; px += F) {
        const x = (px + F / 2 - OX) / SCALE;
        const y = (OY - py - F / 2) / SCALE;
        // Най-далечната точка на полето от звездата е самата L1 – така изключваме външните области с ниско Φ
        const inside = side === 1 ? Math.hypot(x - s.x1, y) < s.xL1 - s.x1 : Math.hypot(x - s.x2, y) < s.x2 - s.xL1;
        if (inside && s.phi(x, y) < s.phiL1) cells.push(`M${px} ${py}h${F}v${F}h-${F}z`);
      }
    }
    return cells.join('');
  };

  const sx = (x: number) => OX + x * SCALE;
  const type = full1 && full2 ? 'contact' : full1 || full2 ? 'semi' : 'detached';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-rose-300 dark:border-rose-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Полетата на Рош и обменът на вещество</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Във въртящата се заедно с двойката система всяка звезда „владее“ капковидна област – своето поле на Рош. Двете полета се
        допират в точката L1. Ако звезда набъбне и запълни полето си, газът ѝ започва да прелива към другата.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <path d={outer} stroke="white" strokeOpacity="0.15" strokeWidth="1" fill="none" />
        {full1 && <path d={filledCells(1)} fill="#fbbf24" fillOpacity="0.85" />}
        {full2 && <path d={filledCells(2)} fill="#60a5fa" fillOpacity="0.85" />}
        <path d={critical} stroke="#f472b6" strokeWidth="1.5" fill="none" />

        {!full1 && <circle cx={sx(s.x1)} cy={OY} r={fill1 * rl1 * SCALE} fill="#fbbf24" />}
        {!full2 && <circle cx={sx(s.x2)} cy={OY} r={fill2 * rl2 * SCALE} fill="#60a5fa" />}

        {/* Поток през L1 и диск около приемащата звезда */}
        {type === 'semi' && (
          <g>
            {full1 ? (
              <>
                <path
                  d={`M ${sx(s.xL1)} ${OY} Q ${sx((s.xL1 + s.x2) / 2)} ${OY + 10} ${sx(s.x2) - 8} ${OY + 22}`}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="4"
                  strokeOpacity="0.8"
                  strokeLinecap="round"
                />
                <ellipse cx={sx(s.x2)} cy={OY} rx={rl2 * SCALE * 0.7} ry={rl2 * SCALE * 0.22} fill="none" stroke="#fde68a" strokeWidth="3" strokeOpacity="0.6" />
              </>
            ) : (
              <path
                d={`M ${sx(s.xL1)} ${OY} Q ${sx((s.xL1 + s.x1) / 2)} ${OY - 10} ${sx(s.x1) + 8} ${OY - 22}`}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="4"
                strokeOpacity="0.8"
                strokeLinecap="round"
              />
            )}
          </g>
        )}

        <path d={`M ${sx(0) - 5} ${OY} h 10 M ${sx(0)} ${OY - 5} v 10`} stroke="white" strokeOpacity="0.7" />
        <circle cx={sx(s.xL1)} cy={OY} r="3" fill="#f472b6" />
        <text x={sx(s.xL1)} y={OY - 8} fontSize="10" textAnchor="middle" fill="#f9a8d4">
          L1
        </text>
        <text x={sx(s.x1)} y={OY + rl1 * SCALE + 18} fontSize="10" textAnchor="middle" fill="#fde68a">
          M₁
        </text>
        <text x={sx(s.x2)} y={OY + rl2 * SCALE + 18} fontSize="10" textAnchor="middle" fill="#93c5fd">
          M₂ = {fmt(q, 2)} M₁
        </text>

        <g fontSize="11" fill="white" transform="translate(470, 30)">
          <text x={0} y={0} fontWeight="700" fontSize="13" fill={type === 'detached' ? '#86efac' : type === 'semi' ? '#fde68a' : '#f9a8d4'}>
            {type === 'detached' ? 'разделена двойка' : type === 'semi' ? 'полуразделена' : 'контактна двойка'}
          </text>
          <text x={0} y={22} fillOpacity="0.8">
            поле на M₁: {fmt(rl1, 3)} a
          </text>
          <text x={0} y={40} fillOpacity="0.8">
            поле на M₂: {fmt(rl2, 3)} a
          </text>
          <text x={0} y={58} fillOpacity="0.8">
            L1 на {fmt(s.xL1 - s.x1, 3)} a от M₁
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-3 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Отношение на масите M₂ / M₁ = {fmt(q, 2)}</label>
          <input type="range" min="0.1" max="1" step="0.01" value={q} onChange={e => setQ(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1 text-amber-600 dark:text-amber-400">M₁ запълва {fmt(fill1 * 100, 0)}% от полето си</label>
          <input type="range" min="0.2" max="1" step="0.005" value={fill1} onChange={e => setFill1(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1 text-blue-600 dark:text-blue-400">M₂ запълва {fmt(fill2 * 100, 0)}% от полето си</label>
          <input type="range" min="0.2" max="1" step="0.005" value={fill2} onChange={e => setFill2(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {type === 'detached'
          ? 'Двете звезди са по-малки от полетата си и еволюират поотделно, като единични звезди. Плъзнете запълването до 100% – това става, когато звездата се превърне в гигант.'
          : type === 'semi'
            ? 'Газът се стича през L1. Заради въртенето на системата той не пада направо върху другата звезда, а се завърта около нея в акреционен диск. Ако приемащата звезда е бяло джудже, неутронна звезда или черна дупка, дискът се нагрява до милиони градуси и свети в рентгеновия диапазон.'
            : 'И двете звезди преливат полетата си и споделят обща обвивка – като „фъстък“. Такива са звездите от типа W Голяма мечка: периодите им са под ден и блясъкът им се променя непрекъснато. Много от тях накрая се сливат.'}
      </p>
    </div>
  );
}
