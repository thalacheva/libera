import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

const DT = 0.25;
const T_END = 48;
const RAIN_START = 2;
/** Брой линейни резервоари в модела на Наш – колко „заоблена“ е вълната. */
const NASH_N = 3;

type Cover = {
  id: string;
  name: string;
  c: number;
  lag: number;
  tone: string;
  ghost: string;
};
const COVERS: Cover[] = [
  {
    id: 'forest',
    name: 'гора',
    c: 0.15,
    lag: 1.6,
    tone: 'stroke-emerald-600 dark:stroke-emerald-400',
    ghost: 'stroke-emerald-500/60',
  },
  {
    id: 'field',
    name: 'ниви и пасища',
    c: 0.35,
    lag: 1,
    tone: 'stroke-amber-600 dark:stroke-amber-400',
    ghost: 'stroke-amber-500/60',
  },
  {
    id: 'city',
    name: 'град',
    c: 0.75,
    lag: 0.4,
    tone: 'stroke-rose-600 dark:stroke-rose-400',
    ghost: 'stroke-rose-500/60',
  },
];

/** Време на закъснение (h) – грубо емпирично: расте с площта на басейна, в града е много по-малко. */
const lagOf = (area: number, cover: Cover) => 0.75 * area ** 0.35 * cover.lag;

/** Мигновената единична хидрограма на Наш: n еднакви линейни резервоара с константа k. */
const nash = (t: number, k: number) => (t <= 0 ? 0 : ((t / k) ** (NASH_N - 1) * Math.exp(-t / k)) / (k * 2)); // Γ(3) = 2

function hydrograph(i: number, dur: number, area: number, cover: Cover, wet: boolean) {
  const c = Math.min(0.9, cover.c + (wet ? 0.25 : 0));
  const k = lagOf(area, cover) / NASH_N;
  const base = 0.01 * area; // базов отток – около 10 l/s от km²
  const steps = Math.round(T_END / DT);
  const q: number[] = [];
  for (let s = 0; s <= steps; s++) {
    const t = s * DT;
    let sum = 0;
    // интеграл по валежа: ефективен валеж C·i (mm/h) върху A km² дава C·i·A/3,6 m³/s
    for (let r = 0; r < dur / DT; r++) {
      const tau = RAIN_START + (r + 0.5) * DT;
      sum += nash(t - tau, k) * DT;
    }
    q.push(base + ((c * i * area) / 3.6) * sum);
  }
  return { q, c, base, lag: lagOf(area, cover) };
}

/** Вълната на пълноводието: как един и същ дъжд дава различни наводнения в гора, ниви и град. */
export default function HydrographLab() {
  const [i, setI] = useState(20);
  const [dur, setDur] = useState(4);
  const [area, setArea] = useState(100);
  const [cover, setCover] = useState('field');
  const [wet, setWet] = useState(false);

  const all = COVERS.map(cv => ({ cv, ...hydrograph(i, dur, area, cv, wet) }));
  const cur = all.find(a => a.cv.id === cover)!;
  const qMaxAll = Math.max(...all.flatMap(a => a.q));
  const peakIdx = cur.q.indexOf(Math.max(...cur.q));
  const peak = cur.q[peakIdx];
  const tPeak = peakIdx * DT;
  const rainMid = RAIN_START + dur / 2;
  const volume = (cur.c * i * dur * area) / 1000; // mln m³: mm × km² = 1000 m³
  const rational = (cur.c * i * area) / 3.6;

  // Графиката
  const X0 = 52;
  const XW = 570;
  const YT = 18;
  const RAIN_H = 60;
  const Y0 = 285;
  const QH = 175;
  const sx = (t: number) => X0 + (t / T_END) * XW;
  const niceMax = (() => {
    const raw = qMaxAll * 1.1;
    const p = 10 ** Math.floor(Math.log10(raw));
    return [1, 2, 2.5, 5, 10].map(m => m * p).find(m => m >= raw)!;
  })();
  const sy = (q: number) => Y0 - (q / niceMax) * QH;
  const path = (q: number[]) => q.map((v, s) => `${s ? 'L' : 'M'}${sx(s * DT).toFixed(1)} ${sy(v).toFixed(1)}`).join('');
  const rainScale = RAIN_H / 60;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        {COVERS.map(cv => (
          <button
            key={cv.id}
            onClick={() => setCover(cv.id)}
            className={`px-3 py-1.5 rounded-full text-sm border ${cover === cv.id ? 'bg-sky-600 text-white border-sky-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {cv.name}
          </button>
        ))}
        <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200 px-2">
          <input type="checkbox" checked={wet} onChange={e => setWet(e.target.checked)} className="accent-sky-600" />
          напоена почва
        </label>
      </div>
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Валежът – стълбчета, висящи отгоре */}
        <line x1={X0} y1={YT} x2={X0 + XW} y2={YT} className="stroke-gray-400" />
        <rect x={sx(RAIN_START)} y={YT} width={sx(RAIN_START + dur) - sx(RAIN_START)} height={i * rainScale} className="fill-sky-400/70 dark:fill-sky-500/60" />
        <rect x={sx(RAIN_START)} y={YT} width={sx(RAIN_START + dur) - sx(RAIN_START)} height={cur.c * i * rainScale} className="fill-blue-700/80" />
        <text x={X0 - 6} y={YT + 10} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          mm/h
        </text>
        <text x={X0 + XW} y={YT + 14} fontSize="10" textAnchor="end" className="fill-sky-700 dark:fill-sky-300">
          валеж; по-тъмното – оттичащата се част ({fmt(cur.c * 100)} %)
        </text>

        {/* Оси на хидрограмата */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <g key={f}>
            <line x1={X0} y1={sy(f * niceMax)} x2={X0 + XW} y2={sy(f * niceMax)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 6} y={sy(f * niceMax) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {fmt(f * niceMax)}
            </text>
          </g>
        ))}
        {[0, 6, 12, 18, 24, 30, 36, 42, 48].map(t => (
          <text key={t} x={sx(t)} y={Y0 + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {t}
          </text>
        ))}
        <text x={X0 + XW} y={Y0 + 28} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          часове
        </text>
        <text x={X0 - 6} y={sy(niceMax) - 8} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          Q, m³/s
        </text>
        <line x1={X0} y1={Y0} x2={X0 + XW} y2={Y0} className="stroke-gray-500" />
        <line x1={X0} y1={sy(cur.base)} x2={X0 + XW} y2={sy(cur.base)} className="stroke-gray-400" strokeDasharray="2 3" />

        {all
          .filter(a => a.cv.id !== cover)
          .map(a => (
            <path key={a.cv.id} d={path(a.q)} fill="none" className={a.cv.ghost} strokeWidth="1.5" strokeDasharray="5 4" />
          ))}
        <path d={`${path(cur.q)}L${sx(T_END)} ${Y0}L${sx(0)} ${Y0}Z`} className="fill-sky-200/40 dark:fill-sky-800/30" />
        <path d={path(cur.q)} fill="none" className={cur.cv.tone} strokeWidth="2.8" />
        {/* Закъснението: от средата на дъжда до върха */}
        <line x1={sx(rainMid)} y1={YT + RAIN_H + 4} x2={sx(rainMid)} y2={Y0} className="stroke-gray-400" strokeDasharray="3 3" />
        <line x1={sx(tPeak)} y1={sy(peak)} x2={sx(tPeak)} y2={Y0} className="stroke-gray-400" strokeDasharray="3 3" />
        <circle cx={sx(tPeak)} cy={sy(peak)} r={4} className="fill-white stroke-gray-800 dark:stroke-gray-100" strokeWidth="2" />
        <text
          x={Math.min(sx(tPeak) + 8, X0 + XW - 4)}
          y={sy(peak) - 6}
          fontSize="11"
          fontWeight="bold"
          textAnchor={sx(tPeak) + 120 > X0 + XW ? 'end' : 'start'}
          className="fill-gray-800 dark:fill-gray-100"
        >
          връх {fmt(peak)} m³/s
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Пунктирните криви – същият дъжд над другите видове повърхност; хоризонталният пунктир – базовият (подземният) отток. Опростен модел (единична хидрограма
        на Наш), не прогноза за истинска река.
      </p>
      <Sliders>
        <Slider label="i, mm/h" value={i} onChange={setI} min={2} max={60} step={1} tone="blue" />
        <Slider label="t, h" value={dur} onChange={setDur} min={1} max={24} step={1} tone="violet" />
        <Slider label="A, km²" value={area} onChange={setArea} min={10} max={500} step={10} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'валеж общо', value: `${fmt(i * dur)} mm` },
            { label: 'коеф. на оттока', value: fmt(cur.c, 2), tone: 'blue' },
            { label: 'връх', value: `${fmt(peak)} m³/s`, tone: 'rose' },
            {
              label: 'закъснение',
              value: `${fmt(tPeak - rainMid, 1)} h`,
              tone: 'violet',
            },
            { label: 'обем на вълната', value: `${fmt(volume, 2)} млн. m³` },
            {
              label: 'C·i·A/3,6',
              value: `${fmt(rational)} m³/s`,
              tone: 'amber',
            },
          ]}
        />
      </div>
      <Note tone={cover === 'city' ? 'rose' : 'emerald'}>
        {cover === 'city'
          ? `В града водата не попива и бързо стига до реката: върхът е ${fmt(peak / Math.max(...all[0].q), 1)} пъти по-висок, отколкото при гора, и идва по-рано.`
          : cover === 'forest'
            ? 'Гората задържа и попива по-голямата част от дъжда: вълната е ниска, плоска и закъснява.'
            : 'Сравни с гората и града. Ако дъждът продължи по-дълго от времето за стичане, върхът доближава C·i·A/3,6.'}
      </Note>
    </div>
  );
}
