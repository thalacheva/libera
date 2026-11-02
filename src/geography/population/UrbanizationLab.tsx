import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { URBAN_SHARE, URBAN_YEARS } from './urbanData';

const W = 640;
const H = 320;
const L = 46;
const R = 625;
const T = 16;
const B = 280;
const Y0 = 1900;
const Y1 = 2100;
const X = (y: number) => L + ((y - Y0) / (Y1 - Y0)) * (R - L);
const Y = (u: number) => B - (u / 100) * (B - T);

/** Логистичната крива на урбанизацията: дял U(t) = Uₘ / (1 + e^(−k(t − t₀))). */
const logistic = (t: number, um: number, k: number, t0: number) => um / (1 + Math.exp(-k * (t - t0)));

/** Най-добрите параметри за една държава – груба мрежа по метода на най-малките квадрати. */
function bestFit(share: number[]) {
  let best = { um: 80, k: 0.05, t0: 1990, err: Infinity };
  const top = Math.max(...share);
  for (let um = Math.max(60, Math.ceil(top)); um <= 98; um += 1)
    for (let k = 0.01; k <= 0.2; k += 0.0025)
      for (let t0 = 1900; t0 <= 2080; t0 += 1) {
        let err = 0;
        for (let i = 0; i < share.length; i++) err += (logistic(URBAN_YEARS[i], um, k, t0) - share[i]) ** 2;
        if (err < best.err) best = { um, k, t0, err };
      }
  return best;
}

const stage = (u: number) => (u < 30 ? 'начален' : u < 70 ? 'ускорен' : 'краен');

/** Урбанизацията като S-крива: реални данни и логистичен модел. */
export default function UrbanizationLab() {
  const [ci, setCi] = useState(1);
  const [all, setAll] = useState(false);
  const [um, setUm] = useState(78);
  const [k, setK] = useState(0.07);
  const [t0, setT0] = useState(1962);

  const c = URBAN_SHARE[ci];
  const last = c.share[c.share.length - 1];
  const i2010 = URBAN_YEARS.indexOf(2010);
  const ppYear = (last - c.share[i2010]) / (2024 - 2010);

  const path = (share: number[]) => share.map((u, i) => `${i ? 'L' : 'M'}${X(URBAN_YEARS[i]).toFixed(1)} ${Y(u).toFixed(1)}`).join(' ');
  const model = Array.from({ length: 101 }, (_, i) => {
    const t = Y0 + i * 2;
    return `${i ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(logistic(t, um, k, t0)).toFixed(1)}`;
  }).join(' ');
  const rms = Math.sqrt(c.share.reduce((s, u, i) => s + (logistic(URBAN_YEARS[i], um, k, t0) - u) ** 2, 0) / c.share.length);
  const fastest = (k * um) / 4; // наклонът в средата на кривата, процентни пункта годишно

  const fitNow = () => {
    const f = bestFit(c.share);
    setUm(f.um);
    setK(Math.round(f.k * 1000) / 1000);
    setT0(f.t0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Етапи */}
        <rect x={L} y={Y(30)} width={R - L} height={Y(0) - Y(30)} className="fill-amber-100/60 dark:fill-amber-900/20" />
        <rect x={L} y={Y(70)} width={R - L} height={Y(30) - Y(70)} className="fill-sky-100/60 dark:fill-sky-900/20" />
        <rect x={L} y={Y(100)} width={R - L} height={Y(70) - Y(100)} className="fill-violet-100/60 dark:fill-violet-900/20" />
        {[
          ['начален етап', 15],
          ['ускорен етап', 50],
          ['краен етап', 85],
        ].map(([t, u]) => (
          <text key={t} x={L + 8} y={Y(Number(u)) + 4} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
            {t}
          </text>
        ))}
        {[0, 20, 40, 60, 80, 100].map(u => (
          <g key={u}>
            <line x1={L} y1={Y(u)} x2={R} y2={Y(u)} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="0.5" />
            <text x={L - 6} y={Y(u) + 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {u}%
            </text>
          </g>
        ))}
        {[1900, 1925, 1950, 1975, 2000, 2025, 2050, 2075, 2100].map(y => (
          <g key={y}>
            <line x1={X(y)} y1={T} x2={X(y)} y2={B} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="0.5" />
            <text x={X(y)} y={B + 15} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              {y}
            </text>
          </g>
        ))}
        <line x1={X(2024)} y1={T} x2={X(2024)} y2={B} className="stroke-gray-400" strokeDasharray="3 3" />

        {all &&
          URBAN_SHARE.map((s, i) =>
            i === ci ? null : <path key={s.name} d={path(s.share)} fill="none" stroke={s.color} strokeWidth="1.2" opacity="0.45" />
          )}
        {ci !== 0 && !all && <path d={path(URBAN_SHARE[0].share)} fill="none" stroke={URBAN_SHARE[0].color} className="dark:opacity-70" strokeWidth="1.2" strokeDasharray="4 3" />}

        <path d={model} fill="none" className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="1.5" strokeDasharray="7 4" />
        <circle cx={X(t0)} cy={Y(um / 2)} r={4} className="fill-gray-700 dark:fill-gray-200" opacity={t0 > Y0 && t0 < Y1 ? 1 : 0} />

        <path d={path(c.share)} fill="none" stroke={c.color} strokeWidth="3" />
        {c.share.map((u, i) => (
          <circle key={i} cx={X(URBAN_YEARS[i])} cy={Y(u)} r={3} fill={c.color} />
        ))}
        <text x={X(2024) + 6} y={Y(last) + 4} fontSize="12" fill={c.color} className="font-semibold">
          {c.name} {fmt(last, 1)}%
        </text>
      </LabSvg>
      <Buttons>
        {URBAN_SHARE.map((s, i) => (
          <DiagramButton key={s.name} active={i === ci} onClick={() => setCi(i)}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={all} onClick={() => setAll(!all)}>
          покажи всички
        </DiagramButton>
        <DiagramButton onClick={fitNow}>подбери кривата</DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="Uₘ, %" value={um} onChange={setUm} min={50} max={98} step={1} tone="violet" />
        <Slider label="k" value={k} onChange={setK} min={0.01} max={0.2} step={0.005} tone="amber" />
        <Slider label="t₀" value={t0} onChange={setT0} min={1880} max={2080} step={1} tone="blue" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Плътната линия – данни на Световната банка по дефинициите на всяка държава (1960–2024). Пунктирът – логистичният модел: Uₘ – таванът, k – колко
        стръмна е кривата, t₀ – годината, в която делът е половината от тавана (точката). Подбери параметрите сам или с бутона.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'етап', value: stage(last), tone: 'blue' },
            { label: '2010–2024', value: `${fmt(ppYear, 2)} п.п./год.`, tone: 'emerald' },
            { label: 'модел 2050', value: `${fmt(logistic(2050, um, k, t0), 0)}%`, tone: 'violet' },
            { label: 'най-бързо', value: `${fmt(fastest, 2)} п.п./год.`, tone: 'amber' },
            { label: 'отклонение', value: `${fmt(rms, 1)} п.п.`, tone: 'gray' },
          ]}
        />
      </div>
      <Note tone={rms < 2 ? 'emerald' : 'amber'}>
        {rms < 2
          ? `Моделът описва ${c.name === 'Свят' ? 'света' : c.name} добре (средно отклонение ${fmt(rms, 1)} процентни пункта).`
          : 'Кривата не пасва добре – промени Uₘ, k и t₀ или натисни „подбери кривата“. Ако и тогава не пасва, урбанизацията в тази държава не е съвсем логистична (като в Китай през 60-те и 70-те години).'}
      </Note>
    </div>
  );
}
