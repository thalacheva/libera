import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

// Разтворимост в грамове безводна сол на 100 g вода (таблични стойности от справочниците, закръглени).
// Между точките интерполираме линейно.
const SALTS: { name: string; color: string; data: [number, number][] }[] = [
  {
    name: 'KNO₃',
    color: '#dc2626',
    data: [[0, 13.3], [10, 20.9], [20, 31.6], [30, 45.8], [40, 63.9], [50, 85.5], [60, 110], [70, 138], [80, 169], [90, 202], [100, 246]],
  },
  { name: 'NaNO₃', color: '#7c3aed', data: [[0, 73], [10, 80], [20, 88], [30, 96], [40, 104], [50, 114], [60, 124], [80, 148], [100, 180]] },
  { name: 'CuSO₄', color: '#2563eb', data: [[0, 14.3], [20, 20.7], [40, 28.5], [60, 40], [80, 55], [100, 75.4]] },
  {
    name: 'KCl',
    color: '#16a34a',
    data: [[0, 28], [10, 31.2], [20, 34.2], [30, 37.2], [40, 40.1], [50, 42.6], [60, 45.8], [70, 48.3], [80, 51.3], [90, 53.9], [100, 56.3]],
  },
  {
    name: 'NaCl',
    color: '#64748b',
    data: [[0, 35.7], [10, 35.8], [20, 35.9], [30, 36.1], [40, 36.4], [50, 37], [60, 37.1], [70, 37.8], [80, 38.4], [90, 39], [100, 39.2]],
  },
];

const solubility = (data: [number, number][], t: number) => {
  for (let i = 1; i < data.length; i++) {
    const [t0, s0] = data[i - 1];
    const [t1, s1] = data[i];
    if (t <= t1) return s0 + ((s1 - s0) * (t - t0)) / (t1 - t0);
  }
  return data[data.length - 1][1];
};

// Графиката: t от 0 до 100 °C, разтворимост от 0 до 250 g
const L = 52;
const R = 404;
const TOP = 14;
const BOTTOM = 222;
const S_MAX = 250;
const xAt = (t: number) => L + (t / 100) * (R - L);
const yAt = (s: number) => BOTTOM - (s / S_MAX) * (BOTTOM - TOP);
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

/** Криви на разтворимост: наситен, ненаситен и пренаситен разтвор и колко сол кристализира при охлаждане. */
export default function SolubilityCurveLab() {
  const [salt, setSalt] = useState(0);
  const [t, setT] = useState(60);
  const [mass, setMass] = useState(80);
  const [cool, setCool] = useState(20);

  const { name, color, data } = SALTS[salt];
  const sNow = solubility(data, t);
  const diff = mass - sNow;
  const state = Math.abs(diff) <= 0.5 ? 'saturated' : diff < 0 ? 'unsaturated' : 'supersaturated';
  const tCool = Math.min(cool, t);
  const sCool = solubility(data, tCool);
  const crystals = Math.max(0, Math.min(mass, sNow) - sCool);

  // Щракване по графиката премества точката
  const place = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const m = svg.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    if (p.x < L || p.x > R || p.y < TOP || p.y > BOTTOM) return;
    setT(Math.round(((p.x - L) / (R - L)) * 100));
    setMass(Math.round(((BOTTOM - p.y) / (BOTTOM - TOP)) * S_MAX));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SALTS.map((s, i) => (
          <DiagramButton key={s.name} active={i === salt} onClick={() => setSalt(i)}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 262" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-2 cursor-crosshair" onClick={place}>
        {[0, 50, 100, 150, 200, 250].map(s => (
          <g key={s}>
            <line x1={L} x2={R} y1={yAt(s)} y2={yAt(s)} className="stroke-gray-100 dark:stroke-gray-700" />
            <text x={L - 6} y={yAt(s) + 4} fontSize="11" textAnchor="end" fill="currentColor">
              {s}
            </text>
          </g>
        ))}
        {[0, 20, 40, 60, 80, 100].map(v => (
          <g key={v}>
            <line x1={xAt(v)} x2={xAt(v)} y1={TOP} y2={BOTTOM} className="stroke-gray-100 dark:stroke-gray-700" />
            <text x={xAt(v)} y={BOTTOM + 16} fontSize="11" textAnchor="middle" fill="currentColor">
              {v}
            </text>
          </g>
        ))}
        <line x1={L} x2={R} y1={BOTTOM} y2={BOTTOM} className="stroke-gray-400" strokeWidth="1.5" />
        <line x1={L} x2={L} y1={TOP} y2={BOTTOM} className="stroke-gray-400" strokeWidth="1.5" />
        <text x={(L + R) / 2} y={BOTTOM + 34} fontSize="12" textAnchor="middle" fill="currentColor">
          температура, °C
        </text>
        <text x={8} y={TOP + 4} fontSize="11" fill="currentColor" transform={`rotate(-90 8 ${TOP + 4})`} textAnchor="end">
          g сол в 100 g вода
        </text>

        {SALTS.map((s, i) => {
          const end = s.data[s.data.length - 1][1];
          return (
            <g key={s.name} opacity={i === salt ? 1 : 0.35}>
              <polyline points={s.data.map(([tt, ss]) => `${xAt(tt)},${yAt(ss)}`).join(' ')} fill="none" stroke={s.color} strokeWidth={i === salt ? 3 : 2} />
              <text x={R + 6} y={yAt(end) + 4} fontSize="12" fontWeight="600" fill={s.color}>
                {s.name}
              </text>
            </g>
          );
        })}

        {/* Охлаждане: хоризонтално наляво до новата температура, после надолу до кривата */}
        {tCool < t && crystals > 0 && (
          <g>
            <line x1={xAt(t)} y1={yAt(Math.min(mass, sNow))} x2={xAt(tCool)} y2={yAt(Math.min(mass, sNow))} stroke={color} strokeWidth="2" strokeDasharray="5 4" />
            <line x1={xAt(tCool)} y1={yAt(Math.min(mass, sNow))} x2={xAt(tCool)} y2={yAt(sCool)} stroke={color} strokeWidth="3" />
            <circle cx={xAt(tCool)} cy={yAt(sCool)} r={4} fill={color} />
          </g>
        )}
        <circle cx={xAt(t)} cy={yAt(mass)} r={7} className="fill-amber-400 stroke-gray-800 dark:stroke-white" strokeWidth="2" />
      </LabSvg>

      <Sliders>
        <Slider label="t, °C" value={t} onChange={setT} min={0} max={100} step={1} tone="rose" />
        <Slider label="сол, g" value={mass} onChange={setMass} min={0} max={250} step={1} tone="amber" />
        <Slider label="охлади до" value={cool} onChange={setCool} min={0} max={100} step={1} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: `разтворимост на ${name} при ${t} °C:`, value: `${fmt(sNow)} g` },
            { label: 'в разтвора:', value: `${mass} g`, tone: 'amber' },
            ...(tCool < t ? [{ label: `кристализират при ${tCool} °C:`, value: `${fmt(crystals)} g`, tone: 'blue' as const }] : []),
          ]}
        />
      </div>
      <Note tone={state === 'unsaturated' ? 'emerald' : state === 'saturated' ? 'blue' : 'rose'}>
        {state === 'unsaturated'
          ? `Ненаситен разтвор – могат да се разтворят още ${fmt(-diff)} g.`
          : state === 'saturated'
            ? 'Наситен разтвор – точката е върху кривата.'
            : `Над кривата: ${fmt(diff)} g повече от разтворимостта. Обикновено излишъкът остава неразтворен; пренаситен разтвор се получава само при много внимателно охлаждане.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Щракни по графиката или мести плъзгачите. Точката показва колко грама сол има на 100 g вода при дадена температура. Под кривата
        разтворът е ненаситен, върху нея – наситен. При охлаждане излишъкът над кривата кристализира. Сравни стръмната крива на KNO₃ с почти
        плоската на NaCl – затова селитрата се пречиства с прекристализация, а солта – не.
      </p>
    </div>
  );
}
