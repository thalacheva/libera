import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Readout } from '~/geometry/diagram';
import { equirect, fmt, landPathEquirect } from '../geo';
import ClimateChart from './ClimateChart';
import { classify, isDry, koppenName, pUnits, STATIONS } from './koppen';

// Карта от 75° с.ш. до 55° ю.ш. – полюсите не ни трябват
const MW = 640;
const MH = (MW / 360) * 180;
const TOP = 75;
const BOTTOM = -55;
const CROP_Y = ((90 - TOP) / 180) * MH;
const CROP_H = ((TOP - BOTTOM) / 180) * MH;
const proj = equirect(0, 0, MW, MH);

const range = (T: number[], P: number[]) => ({
  lo: Math.min(0, Math.floor(Math.min(...T) / 10) * 10),
  hi: Math.max(30, Math.ceil(Math.max(...T, ...P.map(pUnits)) / 10) * 10),
});

/** Климатограми на станции от цял свят и автоматичен код по Кьопен с всички стъпки на проверката. */
export default function ClimatogramLab() {
  const [idx, setIdx] = useState(0);
  const s = STATIONS[idx];
  const land = useMemo(() => landPathEquirect(0, 0, MW, MH), []);
  const k = classify(s.lat, s.T, s.P);
  const { lo, hi } = range(s.T, s.P);
  const dryMonths = s.T.filter((t, m) => isDry(t, s.P[m])).length;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 ${CROP_Y} ${MW} ${CROP_H}`} className="w-full h-auto block select-none mb-2">
        <defs>
          <clipPath id="cg-map">
            <rect x={0} y={CROP_Y} width={MW} height={CROP_H} />
          </clipPath>
        </defs>
        <rect x={0} y={CROP_Y} width={MW} height={CROP_H} className="fill-sky-100 dark:fill-slate-900" />
        <path d={land} clipPath="url(#cg-map)" fillRule="evenodd" className="fill-stone-300 dark:fill-stone-600" />
        {[23.44, 0, -23.44].map(lat => (
          <line key={lat} x1={0} x2={MW} y1={proj({ lat, lon: 0 }).y} y2={proj({ lat, lon: 0 }).y} className="stroke-gray-500/50" strokeDasharray="4 4" />
        ))}
        {STATIONS.map((st, i) => {
          const p = proj(st);
          const on = i === idx;
          return (
            <g key={st.name} className="cursor-pointer" onClick={() => setIdx(i)}>
              <circle cx={p.x} cy={p.y} r={12} fill="transparent" />
              <circle cx={p.x} cy={p.y} r={on ? 6 : 4} className={on ? 'fill-rose-600 stroke-white' : 'fill-sky-700 dark:fill-sky-300 stroke-white dark:stroke-slate-900'} strokeWidth="1.5" />
            </g>
          );
        })}
      </LabSvg>
      <Buttons>
        {STATIONS.map((st, i) => (
          <DiagramButton key={st.name} active={i === idx} onClick={() => setIdx(i)}>
            {st.name}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <ClimateChart T={s.T} P={s.P} lo={lo} hi={hi} title={`${s.name} (${s.country}), ${fmt(s.h)} m`} />
      </div>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'средна год. t', value: `${fmt(k.Ta, 1)} °C`, tone: 'rose' },
            { label: 'амплитуда', value: `${fmt(k.Tw - k.Tc, 1)} °C`, tone: 'rose' },
            { label: 'валежи', value: `${fmt(k.Pa)} mm`, tone: 'blue' },
            { label: 'сухи месеци', value: String(dryMonths), tone: 'amber' },
          ]}
        />
      </div>
      <div className="mt-3 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/30 p-3 text-sm text-gray-700 dark:text-gray-300">
        <p className="font-semibold mb-1">
          По Кьопен: <span className="text-sky-700 dark:text-sky-300">{k.code}</span> – {koppenName(k.code)}
        </p>
        <ol className="list-decimal ml-5 space-y-0.5">
          {k.steps.map(st => (
            <li key={st}>{st}</li>
          ))}
        </ol>
      </div>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Избери станция на картата или от бутоните. Стойностите са закръглени многогодишни средни и са приблизителни.
      </p>
    </div>
  );
}
