import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { BROMOTHYMOL_BLUE, colorAt, METHYL_ORANGE, METHYL_RED, PHENOLPHTHALEIN, THYMOLPHTHALEIN } from './phColors';
import { fmt, phOf } from './ph';

// 25 mL киселина 0,1 mol/L се титрува с NaOH 0,1 mol/L
const V_ACID = 25;
const C = 0.1;
const V_EQ = 25;

const ACIDS = [
  { name: 'HCl (силна)', Ka: 1e6, pKa: null },
  { name: 'CH₃COOH (pKa 4,76)', Ka: 10 ** -4.76, pKa: 4.76 },
  { name: 'HClO (pKa 7,53)', Ka: 10 ** -7.53, pKa: 7.53 },
];
const INDICATORS = [METHYL_ORANGE, METHYL_RED, BROMOTHYMOL_BLUE, PHENOLPHTHALEIN, THYMOLPHTHALEIN];

const pHAt = (Ka: number, V: number) => {
  const total = V_ACID + V;
  return phOf((C * V_ACID) / total, Ka, (C * V) / total);
};

// Графиката: V от 0 до 50 mL, pH от 0 до 14
const L = 40;
const R = 372;
const TOP = 12;
const BOTTOM = 232;
const xAt = (V: number) => L + (V / 50) * (R - L);
const yAt = (pH: number) => BOTTOM - (pH / 14) * (BOTTOM - TOP);

/** Крива на титруване: силна или слаба киселина с NaOH, точка на еквивалентност и избор на индикатор. */
export default function TitrationLab() {
  const [ai, setAi] = useState(1);
  const [ii, setIi] = useState(3);
  const [V, setV] = useState(12.5);
  const acid = ACIDS[ai];
  const ind = INDICATORS[ii];

  const curve = useMemo(
    () =>
      Array.from({ length: 501 }, (_, i) => {
        const v = i / 10;
        return `${xAt(v).toFixed(1)},${yAt(pHAt(acid.Ka, v)).toFixed(1)}`;
      }).join(' '),
    [acid.Ka]
  );

  const pH = pHAt(acid.Ka, V);
  const pHeq = pHAt(acid.Ka, V_EQ);
  // Скокът на pH: от 0,1 mL преди до 0,1 mL след еквивалентната точка (грешка ±0,4%)
  const jump: [number, number] = [pHAt(acid.Ka, V_EQ - 0.1), pHAt(acid.Ka, V_EQ + 0.1)];
  const mid = (ind.lo + ind.hi) / 2;
  const suits = mid >= jump[0] && mid <= jump[1];
  const flask = colorAt(ind.stops, pH);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {ACIDS.map((a, i) => (
          <DiagramButton key={a.name} active={i === ai} onClick={() => setAi(i)}>
            {a.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {INDICATORS.map((x, i) => (
          <DiagramButton key={x.name} active={i === ii} onClick={() => setIi(i)}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 270" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* интервал на прехода на индикатора */}
        <rect x={L} y={yAt(ind.hi)} width={R - L} height={yAt(ind.lo) - yAt(ind.hi)} fill={colorAt(ind.stops, ind.hi)} opacity="0.25" />
        {[0, 2, 4, 6, 8, 10, 12, 14].map(p => (
          <g key={p}>
            <line x1={L} x2={R} y1={yAt(p)} y2={yAt(p)} className="stroke-gray-100 dark:stroke-gray-700" />
            <text x={L - 6} y={yAt(p) + 4} fontSize="11" textAnchor="end" fill="currentColor">
              {p}
            </text>
          </g>
        ))}
        {[0, 10, 20, 30, 40, 50].map(v => (
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
          добавен NaOH, mL
        </text>
        <text x={12} y={TOP + 4} fontSize="12" fill="currentColor" transform={`rotate(-90 12 ${TOP + 4})`} textAnchor="end">
          pH
        </text>

        {/* еквивалентна точка */}
        <line x1={xAt(V_EQ)} x2={xAt(V_EQ)} y1={TOP} y2={BOTTOM} className="stroke-gray-400" strokeDasharray="4 4" />
        <polyline points={curve} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.5" />
        <circle cx={xAt(V_EQ)} cy={yAt(pHeq)} r={4} className="fill-gray-700 dark:fill-gray-200" />
        {acid.pKa !== null && (
          <circle cx={xAt(V_EQ / 2)} cy={yAt(acid.pKa)} r={4} className="fill-emerald-600" />
        )}
        <circle cx={xAt(V)} cy={yAt(pH)} r={7} className="fill-amber-400 stroke-gray-800 dark:stroke-white" strokeWidth="2" />

        {/* колбата */}
        <path d="M 412 40 h 24 v 40 l 28 64 a 8 8 0 0 1 -7 11 h -66 a 8 8 0 0 1 -7 -11 l 28 -64 z" fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="2" />
        <path d="M 401 112 h 46 l 15 33 a 6 6 0 0 1 -6 8 h -64 a 6 6 0 0 1 -6 -8 z" fill={flask} />
        <text x={424} y={178} fontSize="12" textAnchor="middle" fill="currentColor">
          pH {fmt(pH)}
        </text>
      </LabSvg>

      <Sliders>
        <Slider label="V, mL" value={V} onChange={setV} min={0} max={50} step={0.1} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'pH сега:', value: fmt(pH), tone: 'amber' },
            { label: 'еквивалентна точка:', value: `25 mL, pH ${fmt(pHeq)}` },
            { label: 'скок (24,9 → 25,1 mL):', value: `pH ${fmt(jump[0], 1)} → ${fmt(jump[1], 1)}`, tone: 'blue' },
            { label: `${ind.name}:`, value: `${fmt(ind.lo, 1)}–${fmt(ind.hi, 1)} (${ind.from} → ${ind.to})`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={suits ? 'emerald' : 'rose'}>
        {suits
          ? `${ind.name[0].toUpperCase()}${ind.name.slice(1)} е подходящ: сменя цвета си вътре в скока на pH, така че краят на титруването съвпада с еквивалентната точка с точност по-добра от 0,1 mL.`
          : `${ind.name[0].toUpperCase()}${ind.name.slice(1)} не е подходящ: интервалът му на преход е извън скока на pH и цветът ще се смени ${mid < jump[0] ? 'твърде рано' : 'твърде късно'}.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 В колбата има 25 mL киселина с концентрация 0,1 mol/L, от бюретата капе NaOH 0,1 mol/L. Кривата е пресметната точно от
        равновесията в разтвора. Цветната ивица е интервалът на прехода на индикатора. При слаба киселина зелената точка (половината от
        еквивалентния обем) е при pH = pKa, а еквивалентната точка е над 7 – получената сол хидролизира. При HClO скокът е толкова малък,
        че от тези индикатори пасва само тимолфталеинът.
      </p>
    </div>
  );
}
