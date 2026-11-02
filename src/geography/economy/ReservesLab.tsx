import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

const YEARS = 200;
const X0 = 50;
const X1 = 590;
const T0 = 24;
const B0 = 290;
const PMAX = 150; // %
const RPMAX = 300; // години
const xOf = (t: number) => X0 + (t / YEARS) * (X1 - X0);
const yP = (v: number) => B0 - (Math.min(v, PMAX) / PMAX) * (B0 - T0);
const yRP = (v: number) => B0 - (Math.min(v, RPMAX) / RPMAX) * (B0 - T0);

/** Статична обезпеченост R/P (приблизително): нефт, газ и въглища – BP 2021 (към края на 2020 г.), мед и литий – USGS 2025 (за 2024 г.). */
const PRESETS = [
  { name: 'Нефт', rp: 54 },
  { name: 'Газ', rp: 49 },
  { name: 'Въглища', rp: 139 },
  { name: 'Мед', rp: 43 },
  { name: 'Литий', rp: 125 },
];

/** Обезпеченост с ресурс: колко години стигат запасите, ако добивът расте и се откриват нови находища. */
export default function ReservesLab() {
  const [rp, setRp] = useState(54);
  const [r, setR] = useState(1);
  const [disc, setDisc] = useState(0);

  const sim = useMemo(() => {
    // Добивът днес е 1 единица годишно, запасите – rp единици
    const pts: { t: number; R: number; q: number }[] = [];
    let R = rp;
    let end: number | null = null;
    for (let t = 0; t <= YEARS; t++) {
      const q = (1 + r / 100) ** t;
      pts.push({ t, R: Math.max(R, 0), q });
      if (end === null) {
        const add = disc / 100;
        if (R + add < q) {
          end = t + Math.max(0, (R + add) / q);
          R = 0;
        } else {
          R += add - q;
        }
      }
    }
    return { pts, end };
  }, [rp, r, disc]);

  const reservePts = sim.pts
    .filter(p => sim.end === null || p.t <= Math.ceil(sim.end))
    .map(p => `${xOf(p.t).toFixed(1)},${yP((p.R / rp) * 100).toFixed(1)}`);
  const rpPts = sim.pts
    .filter(p => p.R > 0 && (sim.end === null || p.t < sim.end))
    .map(p => `${xOf(p.t).toFixed(1)},${yRP(p.R / p.q).toFixed(1)}`);
  const formula = r > 0 ? Math.log(1 + (r / 100) * rp) / Math.log(1 + r / 100) : r < 0 ? null : rp;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {[0, 25, 50, 75, 100, 125, 150].map(v => (
          <g key={v}>
            <line x1={X0} y1={yP(v)} x2={X1} y2={yP(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 6} y={yP(v) + 3} fontSize="10" textAnchor="end" className="fill-sky-700 dark:fill-sky-300">
              {v}
            </text>
          </g>
        ))}
        {[0, 100, 200, 300].map(v => (
          <text key={v} x={X1 + 6} y={yRP(v) + 3} fontSize="10" className="fill-amber-700 dark:fill-amber-300">
            {v}
          </text>
        ))}
        <text x={X0 - 6} y={T0 - 10} fontSize="10" textAnchor="end" className="fill-sky-700 dark:fill-sky-300">
          запаси, %
        </text>
        <text x={X1 + 30} y={T0 - 10} fontSize="10" textAnchor="end" className="fill-amber-700 dark:fill-amber-300">
          R/P, г.
        </text>
        {[0, 25, 50, 75, 100, 125, 150, 175, 200].map(t => (
          <text key={t} x={xOf(t)} y={B0 + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {t}
          </text>
        ))}
        <text x={X1} y={B0 + 27} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          години от днес
        </text>
        {reservePts.length > 1 && (
          <polygon
            points={`${xOf(0)},${B0} ${reservePts.join(' ')} ${reservePts[reservePts.length - 1].split(',')[0]},${B0}`}
            className="fill-sky-500/20 stroke-sky-600 dark:stroke-sky-400"
            strokeWidth="2"
          />
        )}
        {rpPts.length > 1 && <polyline points={rpPts.join(' ')} fill="none" className="stroke-amber-500" strokeWidth="2.5" strokeDasharray="6 3" />}
        {/* Статичната обезпеченост днес */}
        <line x1={xOf(Math.min(rp, YEARS))} y1={T0} x2={xOf(Math.min(rp, YEARS))} y2={B0} className="stroke-gray-400" strokeDasharray="2 3" />
        <text x={xOf(Math.min(rp, YEARS)) + 4} y={T0 + 10} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          R/P днес
        </text>
        {sim.end !== null && sim.end <= YEARS && (
          <g>
            <circle cx={xOf(sim.end)} cy={B0} r={5} className="fill-rose-600" />
            <text x={xOf(sim.end)} y={B0 - 10} fontSize="11" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 font-semibold">
              изчерпване
            </text>
          </g>
        )}
      </LabSvg>
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton
            key={p.name}
            active={rp === p.rp}
            onClick={() => {
              setRp(p.rp);
            }}
          >
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="R/P, г." value={rp} onChange={setRp} min={10} max={200} step={1} tone="blue" />
        <Slider label="ръст, %" value={r} onChange={setR} min={-2} max={5} step={0.1} tone="rose" />
        <Slider label="нови, %" value={disc} onChange={setDisc} min={0} max={150} step={5} tone="emerald" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        R/P – запасите, разделени на днешния годишен добив; ръст – колко процента годишно расте добивът; нови – колко нови запаси се откриват всяка година, в
        проценти от днешния добив. Синята площ са оставащите запаси, жълтият пунктир – обезпечеността R/P във всяка следваща година.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'статично', value: `${fmt(rp)} г.`, tone: 'blue' },
            {
              label: 'стигат за',
              value: sim.end === null || sim.end > YEARS ? `над ${YEARS} г.` : `${fmt(sim.end)} г.`,
              tone: 'rose',
            },
            ...(disc === 0 && formula !== null ? [{ label: 'формула', value: `${fmt(formula)} г.`, tone: 'gray' as const }] : []),
          ]}
        />
      </div>
      <Note tone="blue">
        {disc > 0 && sim.end === null
          ? 'Новите находища покриват растящия добив – обезпечеността не намалява, макар че ресурсът е невъзобновим.'
          : r > 0 && disc === 0
            ? `При ръст ${fmt(r, 1)}% годишно запасите стигат за ${fmt(sim.end ?? 0)} години вместо за ${fmt(rp)} – растящото търсене скъсява срока.`
            : 'R/P показва колко години биха стигнали известните днес запаси при днешния добив – това не е прогноза за края на ресурса.'}
      </Note>
    </div>
  );
}
