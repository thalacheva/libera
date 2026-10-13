import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '../sim';

// Приблизително най-голямо забавяне при спиране с гуми в добро състояние
const ROADS = [
  { name: 'сух асфалт', a: 7 },
  { name: 'мокър асфалт', a: 4.5 },
  { name: 'сняг', a: 2.5 },
  { name: 'лед', a: 1 },
];

const L = 40;
const R = 460;

/** Опасният път: път на реакцията (с постоянна скорост) плюс спирачен път (равнозакъснително). */
export default function BrakingLab() {
  const [kmh, setKmh] = useState(50);
  const [tr, setTr] = useState(1);
  const [road, setRoad] = useState(0);
  const [D, setD] = useState(30);
  const a = ROADS[road].a;
  const v = kmh / 3.6;
  const sr = v * tr;
  const sb = (v * v) / (2 * a);
  const total = sr + sb;
  const tStop = tr + v / a;
  // Скорост при препятствието: още не е спирал, спира или вече е спрял
  const vHit = total <= D ? 0 : sr >= D ? v : Math.sqrt(v * v - 2 * a * (D - sr));

  // Мащаб на пътя – да се побират и препятствието, и спирането
  const span = Math.max(D, total) * 1.1;
  const step = span > 400 ? 100 : span > 150 ? 50 : span > 60 ? 20 : 10;
  const px = (s: number) => L + (s / span) * (R - L);

  // Графика v(t): лицето под нея е изминатият път
  const tMax = Math.max(tStop * 1.1, 2);
  const gt = (t: number) => L + (t / tMax) * (R - L);
  const gv = (u: number) => 236 - (u / (130 / 3.6)) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {ROADS.map((r, i) => (
          <DiagramButton key={r.name} active={i === road} onClick={() => setRoad(i)}>
            {r.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 270">
        {/* Пътят отгоре */}
        <rect x={L} y={22} width={R - L} height={36} className="fill-gray-200 dark:fill-gray-700" />
        <rect x={px(0)} y={34} width={Math.min(px(sr), R) - px(0)} height={12} className="fill-amber-400" />
        <rect x={Math.min(px(sr), R)} y={34} width={Math.max(0, Math.min(px(total), R) - Math.min(px(sr), R))} height={12} className="fill-rose-500" />
        <text x={px(0) - 14} y={40} fontSize={22} textAnchor="middle" dominantBaseline="central" transform={`translate(${2 * (px(0) - 14)} 0) scale(-1 1)`}>
          🚗
        </text>
        <text x={px(D)} y={40} fontSize={22} textAnchor="middle" dominantBaseline="central">
          🚸
        </text>
        <line x1={px(D)} y1={18} x2={px(D)} y2={62} className="stroke-emerald-600" strokeWidth="2" strokeDasharray="4 3" />
        {Array.from({ length: Math.floor(span / step) + 1 }, (_, i) => i * step).map(s => (
          <g key={s}>
            <line x1={px(s)} y1={58} x2={px(s)} y2={64} className="stroke-gray-400 dark:stroke-gray-500" />
            <Label p={{ x: px(s), y: 76 }} size={10} weight={500}>
              {String(s)}
            </Label>
          </g>
        ))}
        <Label p={{ x: R, y: 90 }} size={10} anchor="end">
          s, m
        </Label>

        {/* Графика на скоростта */}
        <line x1={L} y1={236} x2={R} y2={236} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={L} y1={236} x2={L} y2={124} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <polygon points={`${gt(0)},236 ${gt(0)},${gv(v)} ${gt(tr)},${gv(v)} ${gt(tr)},236`} className="fill-amber-400/50" />
        <polygon points={`${gt(tr)},236 ${gt(tr)},${gv(v)} ${gt(tStop)},236`} className="fill-rose-500/40" />
        <polyline points={`${gt(0)},${gv(v)} ${gt(tr)},${gv(v)} ${gt(tStop)},236`} fill="none" className="stroke-blue-500" strokeWidth="3" />
        <Label p={{ x: L - 6, y: gv(v) }} size={10} anchor="end" tone="blue">
          {fmtNum(v, 1)}
        </Label>
        <Label p={{ x: L + 4, y: 120 }} size={10} anchor="start">
          v, m/s
        </Label>
        {Array.from({ length: Math.floor(tMax) + 1 }, (_, i) => i)
          .filter(t => tMax <= 12 || t % 5 === 0)
          .map(t => (
            <Label key={t} p={{ x: gt(t), y: 250 }} size={10} weight={500}>
              {String(t)}
            </Label>
          ))}
        <Label p={{ x: R, y: 264 }} size={10} anchor="end">
          t, s
        </Label>
        <Label p={{ x: (gt(0) + gt(tr)) / 2, y: 222 }} size={11} tone="amber">
          реакция
        </Label>
        <Label p={{ x: (gt(tr) * 2 + gt(tStop)) / 3, y: 222 }} size={11} tone="rose">
          спиране
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="v, km/h" value={kmh} onChange={setKmh} min={20} max={130} step={5} tone="blue" />
        <Slider label="tᵣ, s" value={tr} onChange={setTr} min={0.5} max={3} step={0.1} tone="amber" />
        <Slider label="🚸, m" value={D} onChange={setD} min={10} max={100} step={1} tone="emerald" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'реакция', value: `${fmtNum(sr, 1)} m`, tone: 'amber' },
            { label: 'спиране', value: `${fmtNum(sb, 1)} m`, tone: 'rose' },
            { label: 'общо', value: `${fmtNum(total, 1)} m` },
            { label: 'време', value: `${fmtNum(tStop, 1)} s` },
          ]}
        />
      </div>
      <Note tone={vHit === 0 ? 'emerald' : 'rose'}>
        {vHit === 0
          ? `Колата спира ${fmtNum(D - total, 1)} m преди препятствието.`
          : sr >= D
            ? `Шофьорът не успява дори да натисне спирачката – удар с ${fmtNum(kmh)} km/h!`
            : `Удар със скорост ${fmtNum(vHit * 3.6, 0)} km/h!`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Докато шофьорът реагира (около 1 s, а с телефон в ръка – много повече), колата се движи с постоянна скорост. После спира с
        постоянно забавяне, което зависи от пътя. Лицето под графиката на скоростта е изминатият път. Пробвай 50 и 60 km/h при препятствие на
        28 m.
      </p>
    </div>
  );
}
