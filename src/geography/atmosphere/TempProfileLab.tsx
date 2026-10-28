import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

// Стандартна атмосфера (приблизително): височина, km → температура, °C
const STANDARD: [number, number][] = [
  [0, 15],
  [11, -56.5],
  [20, -56.5],
  [32, -44.5],
  [47, -2.5],
  [51, -2.5],
  [71, -58.5],
  [86, -86],
  [100, -78],
  [110, -33],
];
const LAYERS = [
  { name: 'тропосфера', from: 0, to: 11, cls: 'fill-sky-200/70 dark:fill-sky-900/60' },
  { name: 'стратосфера', left: true, from: 11, to: 50, cls: 'fill-indigo-100/70 dark:fill-indigo-950/60' },
  { name: 'мезосфера', from: 50, to: 85, cls: 'fill-violet-100/70 dark:fill-violet-950/60' },
  { name: 'термосфера', from: 85, to: 110, cls: 'fill-rose-100/70 dark:fill-rose-950/60' },
];

// Ляв чертеж: 0–110 km, −100…+40 °C
const LX = 50;
const LW = 230;
const LY = 20;
const LH = 240;
const lx = (t: number) => LX + ((t + 100) / 140) * LW;
const ly = (z: number) => LY + LH - (z / 110) * LH;

// Десен чертеж: 0–4 km над морето, −30…+35 °C
const RX = 360;
const RW = 260;
const rx = (t: number) => RX + ((t + 30) / 65) * RW;
const ry = (z: number) => LY + LH - (z / 4) * LH;

const BASE = 0.55; // София, km над морето
const PLACES = [
  { name: 'София', z: 0.55 },
  { name: 'Черни връх', z: 2.29 },
  { name: 'Мусала', z: 2.925 },
];

const PRESETS = [
  { name: 'обикновен ден', t0: 12, lapse: 6.5, inv: 0, dt: 0 },
  { name: 'горещ летен ден', t0: 32, lapse: 8, inv: 0, dt: 0 },
  { name: 'зимна нощ в котловината', t0: -8, lapse: 5.5, inv: 400, dt: 8 },
];

/** Как се мени температурата с височината: стандартната атмосфера и приземният слой над София с инверсия. */
export default function TempProfileLab() {
  const [t0, setT0] = useState(12);
  const [lapse, setLapse] = useState(6.5);
  const [inv, setInv] = useState(0);
  const [dt, setDt] = useState(0);

  const invTop = BASE + inv / 1000;
  const hasInv = inv > 0 && dt > 0;
  /** Температура на височина z (km над морето). */
  const temp = (z: number) => {
    if (z <= BASE) return t0 + (BASE - z) * lapse;
    if (hasInv && z <= invTop) return t0 + (dt * (z - BASE)) / (invTop - BASE);
    const top = hasInv ? invTop : BASE;
    return t0 + (hasInv ? dt : 0) - (z - top) * lapse;
  };
  const profile = Array.from({ length: 81 }, (_, i) => {
    const z = BASE + (i / 80) * (4 - BASE);
    return `${i ? 'L' : 'M'}${rx(temp(z)).toFixed(1)} ${ry(z).toFixed(1)}`;
  }).join('');
  const zero = (() => {
    for (let z = BASE; z <= 4; z += 0.005) if (temp(z) <= 0 && temp(z + 0.005) < temp(z)) return z;
    return null;
  })();

  const preset = PRESETS.find(p => p.t0 === t0 && p.lapse === lapse && p.inv === inv && p.dt === dt);
  const std = STANDARD.map(([z, t], i) => `${i ? 'L' : 'M'}${lx(t)} ${ly(z)}`).join('');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="tp-right">
            <rect x={RX} y={LY} width={RW} height={LH} />
          </clipPath>
        </defs>
        {/* Ляво: целият строеж */}
        {LAYERS.map(l => (
          <g key={l.name}>
            <rect x={LX} y={ly(l.to)} width={LW} height={ly(l.from) - ly(l.to)} className={l.cls} />
            <text x={'left' in l ? LX + 4 : LX + LW - 4} y={ly(l.to) + 13} fontSize="10" textAnchor={'left' in l ? 'start' : 'end'} className="fill-gray-700 dark:fill-gray-200">
              {l.name}
            </text>
          </g>
        ))}
        <rect x={lx(-100)} y={ly(35)} width={18} height={ly(15) - ly(35)} className="fill-emerald-400/50" />
        <text x={lx(-100) + 22} y={ly(25) + 3} fontSize="9" className="fill-emerald-800 dark:fill-emerald-200">
          озонов слой
        </text>
        <path d={std} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.2" />
        {[0, 20, 40, 60, 80, 100].map(z => (
          <text key={z} x={LX - 5} y={ly(z) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
            {z}
          </text>
        ))}
        {[-80, -40, 0, 40].map(t => (
          <text key={t} x={lx(t)} y={LY + LH + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {t}
          </text>
        ))}
        <rect x={LX} y={LY} width={LW} height={LH} fill="none" className="stroke-gray-400" />
        <text x={14} y={LY + LH / 2} fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${LY + LH / 2})`} className="fill-gray-600 dark:fill-gray-300">
          височина, km
        </text>
        <text x={LX + LW / 2} y={LY + LH + 30} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          температура, °C
        </text>
        {/* Връзка към увеличения долен слой */}
        <rect x={LX} y={ly(4)} width={LW} height={ly(0) - ly(4)} fill="none" className="stroke-sky-600" strokeDasharray="3 2" />
        <line x1={LX + LW} y1={ly(4)} x2={RX} y2={LY} className="stroke-sky-600/60" strokeDasharray="3 2" />
        <line x1={LX + LW} y1={ly(0)} x2={RX} y2={LY + LH} className="stroke-sky-600/60" strokeDasharray="3 2" />

        {/* Дясно: долните 4 km */}
        <rect x={RX} y={LY} width={RW} height={LH} className="fill-sky-50 dark:fill-slate-900" />
        <g clipPath="url(#tp-right)">
          {hasInv && <rect x={RX} y={ry(invTop)} width={RW} height={ry(BASE) - ry(invTop)} className="fill-stone-400/40 dark:fill-stone-500/40" />}
          <rect x={RX} y={ry(BASE)} width={RW} height={LY + LH - ry(BASE)} className="fill-lime-800/60 dark:fill-lime-900" />
          <line x1={rx(0)} y1={LY} x2={rx(0)} y2={LY + LH} className="stroke-sky-500" strokeDasharray="4 3" />
          <path d={profile} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.5" />
          {PLACES.map(p => (
            <g key={p.name}>
              <line x1={RX} y1={ry(p.z)} x2={rx(temp(p.z))} y2={ry(p.z)} className="stroke-gray-400" strokeDasharray="2 3" />
              <circle cx={rx(temp(p.z))} cy={ry(p.z)} r={4} className="fill-rose-600 stroke-white" />
              <text x={RX + 4} y={p.z === BASE ? ry(p.z) + 13 : ry(p.z) - 4} fontSize="10" className={p.z === BASE ? 'fill-white' : 'fill-gray-700 dark:fill-gray-200 stroke-sky-50 dark:stroke-slate-900'} strokeWidth={p.z === BASE ? 0 : 3} paintOrder="stroke">
                {p.name} {fmt(temp(p.z), 1)} °C
              </text>
            </g>
          ))}
          {hasInv && (
            <text x={RX + RW - 4} y={ry(invTop) + 13} fontSize="10" textAnchor="end" className="fill-stone-800 dark:fill-stone-200">
              смог под инверсията
            </text>
          )}
        </g>
        {[0, 1, 2, 3, 4].map(z => (
          <text key={z} x={RX - 5} y={ry(z) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
            {z}
          </text>
        ))}
        {[-30, -15, 0, 15, 30].map(t => (
          <text key={t} x={rx(t)} y={LY + LH + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {t}
          </text>
        ))}
        <rect x={RX} y={LY} width={RW} height={LH} fill="none" className="stroke-gray-400" />
        <text x={RX + RW / 2} y={LY + LH + 30} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          долните 4 km над морето, °C
        </text>
      </LabSvg>
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton
            key={p.name}
            active={preset === p}
            onClick={() => {
              setT0(p.t0);
              setLapse(p.lapse);
              setInv(p.inv);
              setDt(p.dt);
            }}
          >
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="T₀, °C" value={t0} onChange={setT0} min={-15} max={35} step={1} tone="rose" />
        <Slider label="Γ" value={lapse} onChange={setLapse} min={3} max={10} step={0.5} tone="blue" />
        <Slider label="инв., m" value={inv} onChange={setInv} min={0} max={800} step={50} tone="gray" />
        <Slider label="ΔT, °C" value={dt} onChange={setDt} min={0} max={12} step={1} tone="amber" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        T₀ – температурата в София (550 m); Γ – с колко °C спада температурата на всеки km; инв. – дебелина на инверсионния слой; ΔT – с колко се затопля въздухът в него нагоре.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'Мусала − София', value: `${fmt(temp(2.925) - temp(BASE), 1)} °C`, tone: 'blue' },
            { label: '0 °C на', value: zero === null ? 'над 4 km' : zero < BASE + 0.003 ? 'под София' : `${fmt(zero * 1000, 0)} m`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={hasInv ? 'amber' : 'emerald'}>
        {hasInv
          ? 'Инверсия: отгоре въздухът е по-топъл, студеният приземен въздух е тежък и не се издига – димът и праховите частици остават в котловината.'
          : 'В тропосферата въздухът се нагрява отдолу – от повърхността, затова нагоре става по-студено.'}
      </Note>
    </div>
  );
}
