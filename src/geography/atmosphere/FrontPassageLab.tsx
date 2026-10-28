import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { Slider, Sliders } from '~/functions/plot';
import { fmt } from '../geo';

// Фронтовата система се движи на изток (надясно) с 30 km/h и минава над неподвижна станция в x = 0.
const SPEED = 30; // km/h
const WARM0 = -1500; // km – топлият фронт при t = 0
const SECTOR = 600; // km – ширина на топлия сектор
const WARM_SLOPE = 150; // наклон 1:150
const COLD_SLOPE = 70; // наклон 1:70
const T_MAX = 84; // h
const TOP = 11; // km – тропопауза

// Разрез: x от −900 до 1500 km, височина 0–11 km
const X0 = -900;
const X1 = 1500;
const SX = 20;
const SW = 600;
const GY = 180;
const SH = 150;
const sx = (x: number) => SX + ((x - X0) / (X1 - X0)) * SW;
const sy = (h: number) => GY - (h / TOP) * SH;

// Графика във времето
const PX = 50;
const PW = 540;
const PY = 222;
const PH = 120;
const tx = (t: number) => PX + (t / T_MAX) * PW;
const T_LO = 0;
const T_HI = 20;
const P_LO = 1000;
const P_HI = 1020;
const tyT = (T: number) => PY + PH - ((T - T_LO) / (T_HI - T_LO)) * PH;
const tyP = (p: number) => PY + PH - ((p - P_LO) / (P_HI - P_LO)) * PH;

const sigma = (z: number) => 1 / (1 + Math.exp(-z));

type State = { dw: number; dc: number };
/** dw, dc – колко km е станцията пред топлия и пред студения фронт (отрицателно – фронтът вече е минал). */
const stateAt = (t: number): State => {
  const xw = WARM0 + SPEED * t;
  return { dw: -xw, dc: -(xw - SECTOR) };
};

const tempOf = ({ dw, dc }: State) => 7 + 9 * sigma(-dw / 40) - 12 * sigma(-dc / 30);
const pressOf = ({ dw, dc }: State) => {
  if (dw > 0) return 1004 + 12 * Math.min(1, dw / 1200);
  if (dc > 0) return 1002 + 2 * (dc / SECTOR);
  return 1002 + 14 * (1 - Math.exp(dc / 200));
};
/** Интензивност на валежа, mm/h */
const rainOf = ({ dw, dc }: State) => {
  if (dw > 0 && dw < 300) return 0.6 + 1.4 * (1 - dw / 300);
  if (dc <= 0 && dc > -60) return 4 + 10 * Math.sin((Math.PI * -dc) / 60);
  return 0;
};
const windOf = ({ dw, dc }: State) => (dw > 0 ? 'ЮИ, отслабва' : dc > 0 ? 'ЮЗ' : dc > -100 ? 'СЗ, на пориви' : 'СЗ');
const skyOf = ({ dw, dc }: State): [string, string] => {
  if (dw > 1350) return ['ясно', 'фронтът е още далеч'];
  if (dw > 1000) return ['перести (Ci)', 'тънки бели нишки високо горе – първият признак на топлия фронт'];
  if (dw > 600) return ['пересто-слоести (Cs)', 'белезникава пелена, ореол около Слънцето или Луната'];
  if (dw > 300) return ['високослоести (As)', 'Слънцето се вижда като през матово стъкло, после изчезва'];
  if (dw > 0) return ['слоесто-дъждовни (Ns)', 'продължителен, равномерен дъжд или сняг'];
  if (dc > 0) return ['слоесто-купести (Sc)', 'топъл сектор: по-топло и влажно, понякога ръмеж или мъгла'];
  if (dc > -80) return ['купесто-дъждовни (Cb)', 'студеният фронт: порой, гръмотевици, понякога градушка'];
  if (dc > -250) return ['купести (Cu)', 'облаците се разкъсват, въздухът е по-студен и прозрачен'];
  return ['ясно', 'студен и сух въздух, видимостта е отлична'];
};

const MOMENTS: [string, number][] = [
  ['перести облаци', 6],
  ['преди топлия фронт', 44],
  ['топъл сектор', 58],
  ['студеният фронт', 71],
  ['след фронта', 80],
];

const series = (f: (s: State) => number, y: (v: number) => number) =>
  Array.from({ length: T_MAX * 2 + 1 }, (_, i) => `${i ? 'L' : 'M'}${tx(i / 2).toFixed(1)} ${y(f(stateAt(i / 2))).toFixed(1)}`).join('');

const surface = (from: number, to: number, h: (x: number) => number) =>
  Array.from({ length: 41 }, (_, i) => {
    const x = from + ((to - from) * i) / 40;
    return `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(Math.min(TOP, h(x))).toFixed(1)}`;
  }).join('');

/** Топъл и студен фронт минават над метеорологична станция: разрез на фронтовете и ходът на времето в станцията. */
export default function FrontPassageLab() {
  const [t, setT] = useState(44);
  const st = stateAt(t);
  const xw = WARM0 + SPEED * t;
  const xc = xw - SECTOR;
  const [sky, skyNote] = skyOf(st);
  const rain = rainOf(st);

  const warmH = (x: number) => (x - xw) / WARM_SLOPE;
  const coldH = (x: number) => (xc - x) / COLD_SLOPE;
  const warmEnd = xw + TOP * WARM_SLOPE;
  const coldEnd = xc - TOP * COLD_SLOPE;
  // Студеният въздух пред топлия фронт и зад студения
  const aheadPoly = `${surface(xw, warmEnd, warmH)}L${sx(Math.max(warmEnd, X1 + 50))} ${sy(TOP)}L${sx(X1 + 50)} ${GY}Z`;
  const behindPoly = `${surface(xc, coldEnd, coldH)}L${sx(Math.min(coldEnd, X0 - 50))} ${sy(TOP)}L${sx(X0 - 50)} ${GY}Z`;
  // Облачната система над топлия фронт: дебелина от около 4 km до 1 km
  const cloudTop = (x: number) => warmH(x) + 4 - (3 * (x - xw)) / (1350 * 1);
  const cloudFar = xw + 1350;
  const cloudPoly =
    surface(xw, cloudFar, warmH) +
    Array.from({ length: 41 }, (_, i) => {
      const x = cloudFar - ((cloudFar - xw) * i) / 40;
      return `L${sx(x).toFixed(1)} ${sy(Math.min(TOP, cloudTop(x))).toFixed(1)}`;
    }).join('') +
    'Z';
  const cbX = xc + 30;
  const label = (x: number, h: number, s: string) =>
    x > X0 + 20 && x < X1 - 20 ? (
      <text x={sx(x)} y={sy(h)} fontSize="11" fontWeight="bold" textAnchor="middle" className="fill-slate-600 dark:fill-slate-200">
        {s}
      </text>
    ) : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 380" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="fp-sec">
            <rect x={SX} y={sy(TOP)} width={SW} height={SH} />
          </clipPath>
        </defs>
        {/* Разрез */}
        <rect x={SX} y={sy(TOP)} width={SW} height={SH} className="fill-rose-100 dark:fill-rose-950/60" />
        <g clipPath="url(#fp-sec)">
          <path d={aheadPoly} className="fill-sky-200 dark:fill-sky-900/70" />
          <path d={behindPoly} className="fill-sky-300 dark:fill-sky-800/70" />
          <path d={cloudPoly} className="fill-slate-400/50 dark:fill-slate-300/30" />
          {/* дъжд пред топлия фронт */}
          {Array.from({ length: 12 }, (_, i) => xw + 15 + i * 24).map(x => (
            <line key={`r${x}`} x1={sx(x)} y1={sy(warmH(x))} x2={sx(x) - 3} y2={GY} className="stroke-blue-500/70" strokeWidth="1" strokeDasharray="3 3" />
          ))}
          {/* купесто-дъждовен облак на студения фронт */}
          <path
            d={`M${sx(cbX - 60)} ${sy(1)}Q${sx(cbX - 70)} ${sy(6)} ${sx(cbX - 40)} ${sy(9)}L${sx(cbX - 120)} ${sy(10.3)}L${sx(cbX + 150)} ${sy(10.3)}L${sx(cbX + 50)} ${sy(9)}Q${sx(cbX + 70)} ${sy(5)} ${sx(cbX + 50)} ${sy(1)}Z`}
            className="fill-slate-500/60 dark:fill-slate-300/40"
          />
          {Array.from({ length: 6 }, (_, i) => cbX - 50 + i * 18).map(x => (
            <line key={`s${x}`} x1={sx(x)} y1={sy(1)} x2={sx(x) - 4} y2={GY} className="stroke-blue-600" strokeWidth="1.5" />
          ))}
          {/* топлият въздух се плъзга нагоре по фронталната повърхност */}
          <path d={`M${sx(xw + 150)} ${sy(2.5)}L${sx(xw + 700)} ${sy(6.3)}`} className="stroke-rose-600" strokeWidth="2" markerEnd="url(#fp-arrow)" fill="none" />
          <path d={`M${sx(xc - 330)} ${sy(1.2)}L${sx(xc - 80)} ${sy(0.5)}`} className="stroke-sky-700 dark:stroke-sky-300" strokeWidth="2" markerEnd="url(#fp-arrow2)" fill="none" />
        </g>
        <defs>
          <marker id="fp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0L10 5L0 10Z" className="fill-rose-600" />
          </marker>
          <marker id="fp-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0L10 5L0 10Z" className="fill-sky-700 dark:fill-sky-300" />
          </marker>
        </defs>
        {label(xw + 1150, 8.7, 'Ci')}
        {label(xw + 800, 6.4, 'Cs')}
        {label(xw + 470, 4.3, 'As')}
        {label(xw + 160, 2.7, 'Ns')}
        {label(cbX - 5, 5.5, 'Cb')}
        {label(xw - 300, 9, 'топъл въздух')}
        {label(xw + 700, 1.3, 'студен въздух')}
        {label(xc - 450, 4, 'студен въздух')}
        {/* символи на фронтовете на земята */}
        {xw > X0 && xw < X1 && <path d={`M${sx(xw) - 7} ${GY}A7 7 0 0 1 ${sx(xw) + 7} ${GY}Z`} className="fill-red-600" />}
        {xc > X0 && xc < X1 && <path d={`M${sx(xc) - 7} ${GY}L${sx(xc)} ${GY - 10}L${sx(xc) + 7} ${GY}Z`} className="fill-blue-600" />}
        <line x1={SX} y1={GY} x2={SX + SW} y2={GY} className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="1.5" />
        <rect x={SX} y={sy(TOP)} width={SW} height={SH} fill="none" className="stroke-gray-400" />
        {/* станцията */}
        <line x1={sx(0)} y1={GY} x2={sx(0)} y2={GY - 14} className="stroke-gray-900 dark:stroke-white" strokeWidth="2" />
        <path d={`M${sx(0)} ${GY - 14}l8 3l-8 3Z`} className="fill-gray-900 dark:fill-white" />
        <text x={sx(0)} y={GY + 13} fontSize="10" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          станция
        </text>
        <text x={SX + SW - 4} y={GY + 13} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          изток →  · вертикалът е разтеглен около 100 пъти
        </text>
        <text x={SX + 4} y={sy(TOP) + 12} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          11 km
        </text>

        {/* Ходът на времето в станцията */}
        <rect x={PX} y={PY} width={PW} height={PH} className="fill-gray-50 dark:fill-slate-900" />
        {Array.from({ length: T_MAX * 2 }, (_, i) => {
          const r = rainOf(stateAt(i / 2));
          if (!r) return null;
          const h = Math.min(PH, r * 6);
          return <rect key={i} x={tx(i / 2)} y={PY + PH - h} width={PW / (T_MAX * 2)} height={h} className="fill-blue-400/60" />;
        })}
        <path d={series(tempOf, tyT)} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2" />
        <path d={series(pressOf, tyP)} fill="none" className="stroke-indigo-700 dark:stroke-indigo-300" strokeWidth="2" strokeDasharray="6 3" />
        <rect x={PX} y={PY} width={PW} height={PH} fill="none" className="stroke-gray-400" />
        {[0, 12, 24, 36, 48, 60, 72, 84].map(h => (
          <text key={h} x={tx(h)} y={PY + PH + 13} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {h}
          </text>
        ))}
        <text x={PX + PW / 2} y={PY + PH + 27} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          часове
        </text>
        {[0, 5, 10, 15].map(T => (
          <text key={T} x={PX - 5} y={tyT(T) + 3} fontSize="10" textAnchor="end" className="fill-rose-700 dark:fill-rose-300">
            {T}°
          </text>
        ))}
        {[1000, 1005, 1010, 1015].map(p => (
          <text key={p} x={PX + PW + 4} y={tyP(p) + 3} fontSize="10" className="fill-indigo-700 dark:fill-indigo-300">
            {p}
          </text>
        ))}
        <text x={PX - 5} y={PY - 5} fontSize="10" textAnchor="end" className="fill-rose-700 dark:fill-rose-300">
          T, °C
        </text>
        <text x={PX + PW + 4} y={PY - 5} fontSize="10" className="fill-indigo-700 dark:fill-indigo-300">
          p, hPa
        </text>
        <text x={PX + 4} y={PY + 12} fontSize="10" className="fill-blue-600 dark:fill-blue-300">
          ▮ валеж
        </text>
        <line x1={tx(t)} y1={PY} x2={tx(t)} y2={PY + PH} className="stroke-fuchsia-600" strokeWidth="2" />
        <circle cx={tx(t)} cy={tyT(tempOf(st))} r={4} className="fill-rose-600" />
        <circle cx={tx(t)} cy={tyP(pressOf(st))} r={4} className="fill-indigo-700 dark:fill-indigo-300" />
      </LabSvg>
      <Sliders>
        <Slider label="t, h" value={t} onChange={setT} min={0} max={T_MAX} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        {MOMENTS.map(([name, h]) => (
          <DiagramButton key={name} active={t === h} onClick={() => setT(h)}>
            {name}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'T', value: `${fmt(tempOf(st), 1)} °C`, tone: 'rose' },
            { label: 'p', value: `${fmt(pressOf(st), 1)} hPa`, tone: 'blue' },
            { label: 'вятър', value: windOf(st) },
            { label: 'облаци', value: sky },
            { label: 'валеж', value: rain ? `${fmt(rain, 1)} mm/h` : 'няма' },
          ]}
        />
      </div>
      <Note tone="violet">{skyNote}</Note>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Фронтовете се движат на изток с 30 km/h; топлият сектор е широк 600 km. Наклонът на топлия фронт е 1:150, на студения –
        1:70. Числата са опростен модел.
      </p>
    </div>
  );
}
