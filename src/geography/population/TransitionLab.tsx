import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

const TMAX = 320;
const X0 = 50;
const X1 = 600;
const RY0 = 30; // горна графика: ‰
const RY1 = 190;
const PY0 = 225; // долна графика: население
const PY1 = 320;
const RMAX = 45;

const xOf = (t: number) => X0 + (t / TMAX) * (X1 - X0);
const rY = (v: number) => RY1 - (v / RMAX) * (RY1 - RY0);

// Стилизирани криви: смъртността пада около година 60, раждаемостта – lag години по-късно;
// накрая застаряването леко повишава смъртността.
const birth = (t: number, lag: number) => 9 + 29 / (1 + Math.exp((t - (60 + lag)) / 12));
const death = (t: number, lag: number) => 11 + 26 / (1 + Math.exp((t - 60) / 10)) + 4 / (1 + Math.exp(-(t - (60 + lag + 90)) / 15));

const STAGES = [
  { name: 'висока раждаемост и смъртност', ex: 'Европа преди XVIII век; днес почти няма такива страни' },
  { name: 'смъртността пада, раждаемостта остава висока', ex: 'Нигер, Чад, Сомалия (днес между етап 2 и 3)' },
  { name: 'раждаемостта пада', ex: 'Нигерия, Пакистан, Египет' },
  { name: 'ниска раждаемост и смъртност', ex: 'САЩ, Франция, Индия (почти), Китай (до 2021 г.)' },
  { name: 'раждаемостта под смъртността', ex: 'България, Япония, Италия, Германия' },
];

function stageOf(b: number, d: number, t: number, lag: number) {
  if (d > 34) return 0;
  if (b > 34) return 1;
  if (b < d - 0.5 && t > 60 + lag) return 4;
  if (b - d > 3) return 2;
  return 3;
}

/** Демографският преход: раждаемост, смъртност и населението при различно закъснение на спада на раждаемостта. */
export default function TransitionLab() {
  const [lag, setLag] = useState(60);
  const [t, setT] = useState(90);

  const sim = useMemo(() => {
    const pts: { t: number; b: number; d: number; p: number; s: number }[] = [];
    let p = 1;
    for (let k = 0; k <= TMAX; k++) {
      const b = birth(k, lag);
      const d = death(k, lag);
      pts.push({ t: k, b, d, p, s: stageOf(b, d, k, lag) });
      p *= Math.exp((b - d) / 1000);
    }
    return pts;
  }, [lag]);

  const pMax = Math.max(...sim.map(s => s.p)) * 1.1;
  const pY = (v: number) => PY1 - (v / pMax) * (PY1 - PY0);
  const cur = sim[t];

  // Граници на етапите
  const bands: { s: number; from: number; to: number }[] = [];
  for (const s of sim) {
    const last = bands[bands.length - 1];
    if (last && last.s === s.s) last.to = s.t;
    else bands.push({ s: s.s, from: s.t, to: s.t });
  }

  const line = (f: (s: (typeof sim)[number]) => number) => sim.map(s => `${xOf(s.t).toFixed(1)},${f(s).toFixed(1)}`).join(' ');
  // Площта между двете криви – естественият прираст
  const gap = `${sim.map(s => `${xOf(s.t).toFixed(1)},${rY(s.b).toFixed(1)}`).join(' ')} ${[...sim]
    .reverse()
    .map(s => `${xOf(s.t).toFixed(1)},${rY(s.d).toFixed(1)}`)
    .join(' ')}`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 345" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {bands.map((b, i) => (
          <g key={i}>
            <rect
              x={xOf(b.from)}
              y={RY0 - 18}
              width={xOf(b.to + 1) - xOf(b.from)}
              height={PY1 - RY0 + 18}
              className={b.s % 2 ? 'fill-sky-100/60 dark:fill-sky-900/30' : 'fill-transparent'}
            />
            {b.to - b.from > 12 && (
              <text x={(xOf(b.from) + xOf(b.to)) / 2} y={RY0 - 6} fontSize="11" textAnchor="middle" fontWeight="600" className="fill-sky-700 dark:fill-sky-300">
                {b.s + 1}
              </text>
            )}
          </g>
        ))}
        {[0, 10, 20, 30, 40].map(v => (
          <g key={v}>
            <line x1={X0} y1={rY(v)} x2={X1} y2={rY(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 6} y={rY(v) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {v}
            </text>
          </g>
        ))}
        <text x={X0 - 6} y={RY0 - 6} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          ‰
        </text>
        <polygon points={gap} className="fill-emerald-400/25" />
        <polyline points={line(s => rY(s.b))} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.5" />
        <polyline points={line(s => rY(s.d))} fill="none" className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2.5" />
        <line x1={470} y1={RY0 + 6} x2={494} y2={RY0 + 6} className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.5" />
        <text x={500} y={RY0 + 10} fontSize="11" className="fill-rose-600 dark:fill-rose-400" fontWeight="600">
          раждаемост
        </text>
        <line x1={470} y1={RY0 + 24} x2={494} y2={RY0 + 24} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2.5" />
        <text x={500} y={RY0 + 28} fontSize="11" className="fill-gray-700 dark:fill-gray-200" fontWeight="600">
          смъртност
        </text>

        {/* Населението */}
        <line x1={X0} y1={PY1} x2={X1} y2={PY1} className="stroke-gray-400" />
        <polyline points={line(s => pY(s.p))} fill="none" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="2.5" />
        <text x={X0 - 6} y={pY(1) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          ×1
        </text>
        <line x1={X0} y1={pY(1)} x2={X1} y2={pY(1)} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="3 3" />
        <text x={X0 + 4} y={PY0 - 2} fontSize="11" className="fill-emerald-700 dark:fill-emerald-300" fontWeight="600">
          население (пъти спрямо началото)
        </text>
        {[0, 100, 200, 300].map(v => (
          <text key={v} x={xOf(v)} y={PY1 + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {v}
          </text>
        ))}
        <text x={X1} y={PY1 - 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          години
        </text>

        {/* Курсорът */}
        <line x1={xOf(t)} y1={RY0} x2={xOf(t)} y2={PY1} className="stroke-sky-600" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx={xOf(t)} cy={rY(cur.b)} r={4} className="fill-rose-600" />
        <circle cx={xOf(t)} cy={rY(cur.d)} r={4} className="fill-gray-700 dark:fill-gray-200" />
        <circle cx={xOf(t)} cy={pY(cur.p)} r={4} className="fill-emerald-600" />
      </LabSvg>
      <Sliders>
        <Slider label="t, г." value={t} onChange={setT} min={0} max={TMAX} step={1} tone="blue" />
        <Slider label="закъсн." value={lag} onChange={setLag} min={20} max={120} step={5} tone="rose" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        t – години от началото на прехода; „закъсн.“ – с колко години спадът на раждаемостта изостава след спада на смъртността. В Англия той е около век, в
        много развиващи се страни – няколко десетилетия.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'раждаемост', value: `${fmt(cur.b, 1)}‰`, tone: 'rose' },
            { label: 'смъртност', value: `${fmt(cur.d, 1)}‰`, tone: 'gray' },
            { label: 'прираст', value: `${cur.b >= cur.d ? '+' : '−'}${fmt(Math.abs(cur.b - cur.d), 1)}‰`, tone: 'emerald' },
            { label: 'население', value: `×${fmt(cur.p, 2)}`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone="blue">
        Етап {cur.s + 1}: {STAGES[cur.s].name}
      </Note>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">Примери: {STAGES[cur.s].ex}.</p>
      <Note tone="emerald">Най-много: ×{fmt(Math.max(...sim.map(s => s.p)), 1)} – колкото по-дълго закъснява раждаемостта, толкова повече нараства населението.</Note>
    </div>
  );
}
