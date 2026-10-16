import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const FLASKS = [50, 100, 250, 500];
const fmt = (v: number, d = 3) => String(Number(v.toPrecision(d))).replace('.', ',');

/** Цвят на разтвор на меден сулфат: колкото по-концентриран, толкова по-наситено син. */
const opacity = (c: number) => 0.06 + 0.9 * Math.min(1, c / 2);

/** Колба с течност: тяло (кръг), гърло и черта на мярката. */
function Flask({ x, c, label }: { x: number; c: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={176} r={44} fill="#2563eb" fillOpacity={opacity(c)} />
      <rect x={x - 8} y={86} width={16} height={46} fill="#2563eb" fillOpacity={opacity(c)} />
      <path d={`M ${x - 9} 60 L ${x - 9} 133 A 44 44 0 1 0 ${x + 9} 133 L ${x + 9} 60`} className="fill-none stroke-gray-500 dark:stroke-gray-400" strokeWidth="2.5" />
      <line x1={x - 14} x2={x + 14} y1={86} y2={86} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="1.5" />
      <text x={x} y={234} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">
        {label}
      </text>
    </g>
  );
}

/** Разреждане: пипета от изходния разтвор в мерителна колба, допълнена с вода до чертата. */
export default function DilutionLab() {
  const [c1, setC1] = useState(1);
  const [v1, setV1] = useState(25);
  const [v2, setV2] = useState(250);
  const vol = Math.min(v1, v2);
  const n = c1 * vol; // mmol
  const c2 = n / v2;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 248" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Изходният разтвор в бутилка */}
        <rect x={40} y={110} width={90} height={106} rx="8" fill="#2563eb" fillOpacity={opacity(c1)} />
        <path d="M 40 100 L 40 210 Q 40 218 48 218 L 122 218 Q 130 218 130 210 L 130 100" className="fill-none stroke-gray-500 dark:stroke-gray-400" strokeWidth="2.5" />
        <text x={85} y={234} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">
          {`изходен: ${fmt(c1)} mol/L`}
        </text>

        {/* Пипетата */}
        <rect x={208} y={30} width={12} height={150} rx="4" className="fill-white stroke-gray-500 dark:fill-gray-900 dark:stroke-gray-400" strokeWidth="2" />
        <rect x={210} y={180 - (vol / 50) * 140} width={8} height={(vol / 50) * 140} fill="#2563eb" fillOpacity={opacity(c1)} />
        <path d="M 210 180 L 214 200 L 218 180" className="fill-none stroke-gray-500 dark:stroke-gray-400" strokeWidth="2" />
        <text x={214} y={22} fontSize="12" textAnchor="middle" fill="currentColor">
          {`${vol} mL`}
        </text>
        <path d="M 150 120 L 190 120" className="stroke-gray-400" strokeWidth="2" markerEnd="url(#dil-arrow)" />
        <path d="M 238 120 L 300 120" className="stroke-gray-400" strokeWidth="2" markerEnd="url(#dil-arrow)" />
        <defs>
          <marker id="dil-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-gray-400" />
          </marker>
        </defs>

        <Flask x={380} c={c2} label={`${v2} mL: ${fmt(c2)} mol/L`} />
      </LabSvg>

      <Buttons>
        {FLASKS.map(f => (
          <DiagramButton key={f} active={f === v2} onClick={() => setV2(f)}>
            колба {f} mL
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="c₁, mol/L" value={c1} onChange={setC1} min={0.1} max={2} step={0.1} tone="blue" />
        <Slider label="V₁, mL" value={v1} onChange={setV1} min={1} max={50} step={1} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'n = c₁V₁ =', value: `${fmt(c1)} · ${vol} = ${fmt(n)} mmol`, tone: 'violet' },
            { label: 'c₂ = n / V₂ =', value: `${fmt(n)} / ${v2} = ${fmt(c2)} mol/L`, tone: 'blue' },
            { label: 'разреждане:', value: `${fmt(v2 / vol)} пъти` },
          ]}
        />
      </div>
      {v1 > v2 && <Note tone="rose">Пипетата не може да побере повече от колбата – взимаме само {v2} mL.</Note>}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 С пипетата пренасяме точно V₁ от изходния разтвор в мерителната колба и я допълваме с вода до чертата. Количеството вещество n не се
        променя – само се разпределя в по-голям обем. Затова c₁V₁ = c₂V₂. Ако работим с милилитри от двете страни, единиците се съкращават.
      </p>
    </div>
  );
}
