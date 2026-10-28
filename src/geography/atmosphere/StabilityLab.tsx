import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { DEW_RATE, DRY_RATE, LCL_PER_DEGREE, moistRate, pressureAt } from './humidity';

// Вертикален профил: температура −60…40 °C, височина 0…12 km
const PX = 50;
const PW = 330;
const PY = 14;
const PH = 280;
const T_MIN = -60;
const T_MAX = 40;
const Z_MAX = 12;
const xOf = (t: number) => PX + ((t - T_MIN) / (T_MAX - T_MIN)) * PW;
const yOf = (z: number) => PY + PH - (z / Z_MAX) * PH;
/** Тропопауза – над нея температурата на околния въздух не пада. */
const TROPOPAUSE = 11;
/** Задържащ слой (инверсия): от 2,0 до 2,3 km температурата расте с 4 °C, а над него пада с 5 °C/km. */
const INV_BASE = 2;
const INV_TOP = 2.3;
const INV_RISE = 4;
/** Градиент над задържащия слой, °C/km. */
const ABOVE_INV = 5;
const STEP = 0.02;

const PRESETS = [
  { name: 'зимна утрин', t: 2, td: 0, g: 4, inv: false },
  { name: 'хубаво време', t: 24, td: 16, g: 9.5, inv: true },
  { name: 'летен следобед', t: 30, td: 18, g: 7.5, inv: false },
  { name: 'влажен ден', t: 20, td: 15, g: 6, inv: false },
];

type Profile = { env: number[]; parcel: number[]; lcl: number; lfc: number | null; top: number | null };

function profile(t0: number, td0: number, g: number, inv: boolean): Profile {
  const envAt = (z: number) => {
    const zz = Math.min(z, TROPOPAUSE);
    if (!inv || zz <= INV_BASE) return t0 - g * zz;
    if (zz <= INV_TOP) return t0 - g * INV_BASE + (INV_RISE * (zz - INV_BASE)) / (INV_TOP - INV_BASE);
    // Над задържащия слой въздухът е устойчив
    return t0 - g * INV_BASE + INV_RISE - ABOVE_INV * (zz - INV_TOP);
  };
  const lcl = (LCL_PER_DEGREE * (t0 - td0)) / 1000;
  const n = Math.round(Z_MAX / STEP);
  const env: number[] = [];
  const parcel: number[] = [];
  let tp = t0;
  let lfc: number | null = null;
  let top: number | null = null;
  for (let i = 0; i <= n; i++) {
    const z = i * STEP;
    if (i > 0) tp -= (z <= lcl ? DRY_RATE : moistRate(tp, pressureAt(z * 1000))) * STEP;
    env.push(envAt(z));
    parcel.push(tp);
    if (z >= lcl) {
      if (lfc === null && tp >= envAt(z)) lfc = z;
      else if (lfc !== null && top === null && tp < envAt(z)) top = z;
    }
  }
  return { env, parcel, lcl, lfc, top: lfc === null ? null : (top ?? Z_MAX) };
}

const line = (ts: number[], from = 0, to = Z_MAX) =>
  ts
    .map((t, i) => [t, i * STEP] as const)
    .filter(([, z]) => z >= from - 1e-9 && z <= to + 1e-9)
    .map(([t, z], i) => `${i ? 'L' : 'M'}${xOf(t).toFixed(1)} ${yOf(z).toFixed(1)}`)
    .join('');

/** Устойчивост на въздуха: издигаща се частица срещу околния въздух – и какъв облак расте. */
export default function StabilityLab() {
  const [t0, setT0] = useState(30);
  const [td0, setTd0] = useState(18);
  const [g, setG] = useState(7.5);
  const [inv, setInv] = useState(false);
  const td = Math.min(td0, t0);
  const p = useMemo(() => profile(t0, td, g, inv), [t0, td, g, inv]);

  const lclT = t0 - DRY_RATE * p.lcl;
  const gm = moistRate(lclT, pressureAt(p.lcl * 1000));
  const stability = g > DRY_RATE ? 'абсолютно неустойчив' : g > gm ? 'условно неустойчив' : 'абсолютно устойчив';
  const depth = p.top === null ? 0 : p.top - p.lcl;
  const kind =
    p.top === null
      ? p.lcl < Z_MAX
        ? 'Издигането не продължава само – облак има само ако въздухът бъде повдигнат насила, и той е слоест (St, Ns).'
        : 'Въздухът е твърде сух за облак.'
      : depth < 2
        ? 'Купест облак на хубаво време (Cumulus humilis) – задържащият слой спира растежа.'
        : depth < 6
          ? 'Мощен купест облак (Cumulus congestus) – може да даде кратки превалявания.'
          : 'Купесто-дъждовен облак (Cumulonimbus) с наковалня – гръмотевици, порой, възможна градушка.';

  // Облакът вдясно
  const CX = 520;
  const cloudTop = p.top ?? p.lcl + 0.3;
  const half = (z: number) => {
    if (p.top === null) return 90;
    const s = (z - p.lcl) / Math.max(0.01, cloudTop - p.lcl);
    return 22 + 18 * Math.sin(Math.PI * Math.min(1, s * 1.2)) + (depth >= 6 && s > 0.88 ? 55 * ((s - 0.88) / 0.12) : 0);
  };
  const zs = Array.from({ length: 41 }, (_, i) => p.lcl + ((cloudTop - p.lcl) * i) / 40);
  const bumps = (side: 1 | -1) =>
    zs.map(z => `${(CX + side * (half(z) + 4 * Math.sin(z * 9))).toFixed(1)} ${yOf(Math.min(z, Z_MAX)).toFixed(1)}`);
  const cloud = `M${bumps(1).join('L')}L${bumps(-1).reverse().join('L')}Z`;
  const showCloud = p.lcl < Z_MAX;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="stab-plot">
            <rect x={PX} y={PY} width={PW} height={PH} />
          </clipPath>
        </defs>
        <rect x={PX} y={PY} width={PW} height={PH} className="fill-sky-50 dark:fill-slate-900" />
        <g clipPath="url(#stab-plot)">
          {[-40, -20, 0, 20].map(v => (
            <line key={v} x1={xOf(v)} y1={PY} x2={xOf(v)} y2={PY + PH} className="stroke-gray-200 dark:stroke-gray-700" />
          ))}
          {[2, 4, 6, 8, 10].map(v => (
            <line key={v} x1={PX} y1={yOf(v)} x2={PX + PW} y2={yOf(v)} className="stroke-gray-200 dark:stroke-gray-700" />
          ))}
          {p.top !== null && p.lfc !== null && (
            <path
              d={`${line(p.parcel, p.lfc, p.top)}L${line(p.env, p.lfc, p.top).slice(1).split('L').reverse().join('L')}Z`}
              className="fill-rose-300/50 dark:fill-rose-800/50"
            />
          )}
          <path d={line(p.env)} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.4" />
          <path d={line(p.parcel, 0, p.lcl)} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.2" strokeDasharray="6 4" />
          <path d={line(p.parcel, p.lcl)} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.2" />
          <line
            x1={xOf(td)}
            y1={yOf(0)}
            x2={xOf(td - DEW_RATE * p.lcl)}
            y2={yOf(p.lcl)}
            className="stroke-emerald-600 dark:stroke-emerald-400"
            strokeWidth="1.8"
            strokeDasharray="3 3"
          />
          <line x1={PX} y1={yOf(p.lcl)} x2={PX + PW} y2={yOf(p.lcl)} className="stroke-gray-500" strokeDasharray="2 4" />
          <line x1={PX} y1={yOf(TROPOPAUSE)} x2={PX + PW} y2={yOf(TROPOPAUSE)} className="stroke-gray-400" strokeDasharray="5 4" />
          <text x={PX + PW - 4} y={yOf(TROPOPAUSE) - 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
            тропопауза
          </text>
        </g>
        {[-60, -40, -20, 0, 20, 40].map(v => (
          <text key={v} x={xOf(v)} y={PY + PH + 14} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {v}
          </text>
        ))}
        {[0, 2, 4, 6, 8, 10, 12].map(v => (
          <text key={v} x={PX - 6} y={yOf(v) + 3} fontSize="10" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
            {v}
          </text>
        ))}
        <rect x={PX} y={PY} width={PW} height={PH} fill="none" className="stroke-gray-500" />
        <text x={PX + PW / 2} y={PY + PH + 30} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          температура, °C
        </text>
        <text x={14} y={PY + PH / 2} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300" transform={`rotate(-90 14 ${PY + PH / 2})`}>
          височина, km
        </text>
        {/* Легенда */}
        <g transform={`translate(${PX + 8} ${PY + 14})`}>
          <rect x={-4} y={-11} width={150} height={52} rx={4} className="fill-white/85 dark:fill-gray-800/85" />
          <line x1={0} y1={0} x2={20} y2={0} className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.4" />
          <text x={26} y={4} fontSize="10" className="fill-gray-700 dark:fill-gray-200">
            околният въздух
          </text>
          <line x1={0} y1={15} x2={20} y2={15} className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.2" />
          <text x={26} y={19} fontSize="10" className="fill-gray-700 dark:fill-gray-200">
            издигащата се частица
          </text>
          <line x1={0} y1={30} x2={20} y2={30} className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.8" strokeDasharray="3 3" />
          <text x={26} y={34} fontSize="10" className="fill-gray-700 dark:fill-gray-200">
            точка на оросяване
          </text>
        </g>
        {/* Облакът */}
        <line x1={420} y1={yOf(0)} x2={620} y2={yOf(0)} className="stroke-emerald-700 dark:stroke-emerald-500" strokeWidth="3" />
        <line x1={420} y1={yOf(TROPOPAUSE)} x2={620} y2={yOf(TROPOPAUSE)} className="stroke-gray-400" strokeDasharray="5 4" />
        {inv && (
          <g>
            <rect x={420} y={yOf(INV_TOP)} width={200} height={yOf(INV_BASE) - yOf(INV_TOP)} className="fill-amber-200/60 dark:fill-amber-800/40" />
            <text x={620} y={yOf(INV_TOP) - 3} fontSize="10" textAnchor="end" className="fill-amber-700 dark:fill-amber-300">
              задържащ слой
            </text>
          </g>
        )}
        {showCloud && <path d={cloud} className="fill-gray-100 stroke-gray-400 dark:fill-gray-300 dark:stroke-gray-500" strokeWidth="1.5" />}
        {showCloud && (
          <text x={CX} y={p.top === null ? yOf(cloudTop) - 8 : yOf(p.lcl) + 14} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            основа {fmt(p.lcl, 1)} km
          </text>
        )}
        {p.top !== null && depth >= 6 && (
          <g className="stroke-sky-500" strokeWidth="1.2">
            {[-30, -15, 0, 15, 30].map(dx => (
              <line key={dx} x1={CX + dx} y1={yOf(p.lcl) + 20} x2={CX + dx - 6} y2={yOf(0) - 4} strokeDasharray="5 5" />
            ))}
          </g>
        )}
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Γ е температурният градиент на околния въздух (°C/km). Частицата се издига сухоадиабатно (пунктир) до кондензационното ниво, после – влажноадиабатно.
        Розовото поле е там, където тя е по-топла от околния въздух и се издига сама.
      </p>
      <Buttons>
        {PRESETS.map(x => (
          <DiagramButton
            key={x.name}
            active={t0 === x.t && td0 === x.td && g === x.g && inv === x.inv}
            onClick={() => {
              setT0(x.t);
              setTd0(x.td);
              setG(x.g);
              setInv(x.inv);
            }}
          >
            {x.name}
          </DiagramButton>
        ))}
        <DiagramButton active={inv} onClick={() => setInv(v => !v)}>
          задържащ слой
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="T, °C" value={t0} onChange={setT0} min={-5} max={38} step={1} tone="rose" />
        <Slider label="Td, °C" value={td} onChange={setTd0} min={-15} max={t0} step={1} tone="emerald" />
        <Slider label="Γ" value={g} onChange={setG} min={3} max={9.5} step={0.5} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'кондензационно ниво', value: `${fmt(p.lcl * 1000)} m`, tone: 'blue' },
            { label: 'влажен градиент там', value: `${fmt(gm, 1)} °C/km` },
            { label: 'въздухът е', value: stability, tone: 'amber' },
            { label: 'свободна конвекция от', value: p.lfc === null ? '—' : `${fmt(p.lfc, 1)} km` },
            { label: 'връх на облака', value: p.top === null ? '—' : `${fmt(p.top, 1)} km`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={p.top === null ? 'blue' : depth >= 6 ? 'rose' : 'emerald'}>{kind}</Note>
    </div>
  );
}
