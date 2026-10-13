import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const MAX_N = 80;
const R = 3.5; // радиус на молекулата, px
const BOX = { x0: 16, y0: 16, h: 190, wMax: 300 };
const SIGMA0 = 70; // разсейване на скоростите при 300 K, px/s

/** Малък генератор на псевдослучайни числа с фиксирано семе – еднакъв на сървъра и в браузъра. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Начални положения (в единичен квадрат) и скорости (нормално разпределени) за всички възможни молекули
const rand = mulberry32(20261013);
const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const SEED = Array.from({ length: MAX_N }, () => ({ ux: rand(), uy: rand(), gx: gauss(), gy: gauss() }));

type Gas = { x: number[]; y: number[]; vx: number[]; vy: number[]; imp: number; t: number };

const width = (vol: number) => BOX.wMax * vol;
const sigma = (T: number) => SIGMA0 * Math.sqrt(T / 300);

/** Начално състояние: положенията и посоките са от семето, скоростите са мащабирани точно към температурата. */
function initGas(n: number, T: number, vol: number): Gas {
  const W = width(vol);
  const s = SEED.slice(0, n);
  // Мащабираме така, че Σvx² = Σvy² = N·σ² – газът е точно при зададената температура и е изотропен
  const kx = Math.sqrt((n * sigma(T) ** 2) / s.reduce((a, p) => a + p.gx * p.gx, 0));
  const ky = Math.sqrt((n * sigma(T) ** 2) / s.reduce((a, p) => a + p.gy * p.gy, 0));
  return {
    x: s.map(p => BOX.x0 + R + p.ux * (W - 2 * R)),
    y: s.map(p => BOX.y0 + R + p.uy * (BOX.h - 2 * R)),
    vx: s.map(p => p.gx * kx),
    vy: s.map(p => p.gy * ky),
    imp: 0,
    t: 0,
  };
}

/** Налягане в относителни единици: 100 = 40 молекули при 300 K в целия обем. Ефективните размери отчитат радиуса. */
const area = (vol: number) => (width(vol) - 2 * R) * (BOX.h - 2 * R);
const perimeter = (vol: number) => 2 * (width(vol) - 2 * R) + 2 * (BOX.h - 2 * R);
const P_REF = (40 * SIGMA0 ** 2) / area(1);
const theory = (n: number, T: number, vol: number) => (100 * (n * sigma(T) ** 2)) / area(vol) / P_REF;

/** Кутия с газ: налягането е сумата от ударите на молекулите в стените. */
export default function GasBoxLab() {
  const [n, setN] = useState(40);
  const [T, setT] = useState(300);
  const [vol, setVol] = useState(1);
  const W = width(vol);

  const step = (s: Gas, dt: number): Gas => {
    let imp = s.imp;
    const [left, right, top, bottom] = [BOX.x0 + R, BOX.x0 + W - R, BOX.y0 + R, BOX.y0 + BOX.h - R];
    for (let i = 0; i < s.x.length; i++) {
      s.x[i] += s.vx[i] * dt;
      s.y[i] += s.vy[i] * dt;
      // Еластичен удар в стена: скоростта се обръща, стената получава импулс 2m|v| (m = 1)
      if (s.x[i] < left || s.x[i] > right) {
        s.x[i] = s.x[i] < left ? 2 * left - s.x[i] : 2 * right - s.x[i];
        s.vx[i] = -s.vx[i];
        imp += 2 * Math.abs(s.vx[i]);
      }
      if (s.y[i] < top || s.y[i] > bottom) {
        s.y[i] = s.y[i] < top ? 2 * top - s.y[i] : 2 * bottom - s.y[i];
        s.vy[i] = -s.vy[i];
        imp += 2 * Math.abs(s.vy[i]);
      }
    }
    return { ...s, imp, t: s.t + dt };
  };
  const sim = useSimulation<Gas>(() => initGas(n, T, vol), step, { dt: 1 / 240, speed: 1.5 });
  const g = sim.state;

  const change = (set: (v: number) => void, which: 'n' | 'T' | 'V') => (v: number) => {
    set(v);
    const was = sim.running;
    sim.reset(initGas(which === 'n' ? v : n, which === 'T' ? v : T, which === 'V' ? v : vol));
    if (was) sim.play();
  };

  // Налягане = сила на единица дължина от стените (в 2D) – средно от началото на опита
  const measured = g.t > 0.5 ? (100 * g.imp) / g.t / perimeter(vol) / P_REF : null;
  const formula = theory(n, T, vol);
  const top = Math.max(200, Math.ceil((formula * 1.4) / 100) * 100);
  const barY = (p: number) => 206 - (Math.min(p, top) / top) * 180;
  const near = measured !== null && Math.abs(measured / formula - 1) < 0.1;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 236">
        <rect x={BOX.x0} y={BOX.y0} width={W} height={BOX.h} className="fill-sky-50 stroke-gray-500 dark:fill-sky-950/40" strokeWidth="2" />
        {/* Буталото – вдясно */}
        <rect x={BOX.x0 + W} y={BOX.y0 - 4} width={8} height={BOX.h + 8} className="fill-gray-500" />
        <line x1={BOX.x0 + W + 8} y1={BOX.y0 + BOX.h / 2} x2={BOX.x0 + BOX.wMax + 22} y2={BOX.y0 + BOX.h / 2} className="stroke-gray-500" strokeWidth="4" />
        {g.x.map((x, i) => {
          const v = Math.hypot(g.vx[i], g.vy[i]) / (sigma(300) * Math.SQRT2);
          const fill = i === 0 ? 'fill-amber-500' : v < 0.7 ? 'fill-sky-500' : v < 1.4 ? 'fill-violet-500' : 'fill-rose-500';
          return <circle key={i} cx={x} cy={g.y[i]} r={i === 0 ? R + 1.5 : R} className={fill} />;
        })}
        <Label p={{ x: BOX.x0 + 6, y: BOX.y0 + BOX.h + 14 }} size={11} anchor="start">
          {`V = ${fmtNum(vol, 1)} от целия обем`}
        </Label>

        {/* Налягането: измерено и по формулата */}
        <line x1={356} y1={206} x2={472} y2={206} className="stroke-gray-400 dark:stroke-gray-500" />
        <rect x={364} y={barY(formula)} width={44} height={206 - barY(formula)} fill="none" className="stroke-gray-500" strokeWidth="2" strokeDasharray="5 4" />
        {measured !== null && <rect x={420} y={barY(measured)} width={44} height={206 - barY(measured)} className="fill-blue-500/80" />}
        <Label p={{ x: 386, y: 220 }} size={11}>
          формула
        </Label>
        <Label p={{ x: 442, y: 220 }} size={11} tone="blue">
          измерено
        </Label>
        <Label p={{ x: 414, y: 14 }} size={12}>
          налягане p
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset(initGas(n, T, vol))} />
      <Sliders>
        <Slider label="N" value={n} onChange={change(setN, 'n')} min={10} max={MAX_N} step={10} tone="violet" />
        <Slider label="T, K" value={T} onChange={change(setT, 'T')} min={100} max={600} step={50} tone="rose" />
        <Slider label="V" value={vol} onChange={change(setVol, 'V')} min={0.4} max={1} step={0.1} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'p по формулата', value: fmtNum(formula, 0) },
            { label: 'p измерено', value: measured === null ? '…' : fmtNum(measured, 0), tone: 'blue' },
            { label: 'време', value: `${fmtNum(g.t, 0)} s` },
          ]}
        />
      </div>
      <Note tone={near ? 'emerald' : 'gray'}>
        {measured === null
          ? 'Пусни симулацията и изчакай няколко секунди – ударите се натрупват.'
          : near
            ? 'Измереното налягане съвпада с p ∝ NT/V с точност до 10%.'
            : 'Ударите са случайни – колкото по-дълго мериш, толкова по-точно е средното.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Налягането е в относителни единици: 100 = 40 молекули при 300 K в целия обем. Удвои броя на молекулите или абсолютната
        температура – налягането се удвоява; намали обема наполовина – пак се удвоява. Цветът показва скоростта (синьо – бавни, червено –
        бързи), а жълтата молекула е една и съща през цялото време. Моделът е двумерен и молекулите не се удрят една в друга.
      </p>
    </div>
  );
}
