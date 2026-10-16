import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import LabSvg from '~/LabSvg';
import { formulaText, molarMass } from '../formula';

type Process = {
  name: string;
  equation: string;
  raw: string;
  /** Чистото вещество в суровината и продуктът, с коефициентите си */
  pure: { f: string; nu: number; name: string };
  product: { f: string; nu: number; name: string };
  mass: number;
  unit: 'kg' | 'g';
  purity: number;
  yieldPct: number;
};

const PROCESSES: Process[] = [
  {
    name: 'негасена вар',
    equation: 'CaCO₃ → CaO + CO₂',
    raw: 'варовик',
    pure: { f: 'CaCO3', nu: 1, name: 'калциев карбонат' },
    product: { f: 'CaO', nu: 1, name: 'негасена вар' },
    mass: 1000,
    unit: 'kg',
    purity: 90,
    yieldPct: 85,
  },
  {
    name: 'желязо от руда',
    equation: 'Fe₂O₃ + 3CO → 2Fe + 3CO₂',
    raw: 'хематитова руда',
    pure: { f: 'Fe2O3', nu: 1, name: 'железен(III) оксид' },
    product: { f: 'Fe', nu: 2, name: 'желязо' },
    mass: 1000,
    unit: 'kg',
    purity: 70,
    yieldPct: 95,
  },
  {
    name: 'аспирин',
    equation: 'C₇H₆O₃ + C₄H₆O₃ → C₉H₈O₄ + C₂H₄O₂',
    raw: 'салицилова киселина (техническа)',
    pure: { f: 'C7H6O3', nu: 1, name: 'салицилова киселина' },
    product: { f: 'C9H8O4', nu: 1, name: 'аспирин' },
    mass: 100,
    unit: 'g',
    purity: 98,
    yieldPct: 75,
  },
];

const fmt = (v: number) => (Math.round(v * 10) / 10).toLocaleString('bg-BG', { maximumFractionDigits: 1 });

/** Чистота на суровината и добив: колко продукт се получава наистина. */
export default function ReactionYieldLab() {
  const [pi, setPi] = useState(0);
  const p = PROCESSES[pi];
  const [purity, setPurity] = useState(p.purity);
  const [yieldPct, setYieldPct] = useState(p.yieldPct);

  const choose = (i: number) => {
    setPi(i);
    setPurity(PROCESSES[i].purity);
    setYieldPct(PROCESSES[i].yieldPct);
  };

  const Mpure = molarMass(p.pure.f);
  const Mprod = molarMass(p.product.f);
  const pureMass = (p.mass * purity) / 100;
  const theoretical = (pureMass / Mpure) * (p.product.nu / p.pure.nu) * Mprod;
  const practical = (theoretical * yieldPct) / 100;

  // Ленти: дължината е пропорционална на масата; скалата – по най-голямата възможна стойност
  const scale = 250 / Math.max(p.mass, (p.mass / Mpure) * (p.product.nu / p.pure.nu) * Mprod);
  const X0 = 150;
  const bar = (y: number, w: number, cls: string) => <rect x={X0} y={y} width={Math.max(w, 0)} height={26} rx="4" className={cls} />;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PROCESSES.map((x, i) => (
          <DiagramButton key={x.name} active={i === pi} onClick={() => choose(i)}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 196" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <text x={240} y={22} fontSize="15" fontWeight="600" textAnchor="middle" fill="currentColor">
          {p.equation}
        </text>

        <text x={X0 - 8} y={62} fontSize="12" textAnchor="end" fill="currentColor">
          суровина
        </text>
        {bar(44, pureMass * scale, 'fill-sky-400 dark:fill-sky-500')}
        <rect x={X0 + pureMass * scale} y={44} width={(p.mass - pureMass) * scale} height={26} rx="4" className="fill-gray-300 dark:fill-gray-600" />
        <text x={X0 + p.mass * scale + 6} y={62} fontSize="12" fill="currentColor">
          {`${fmt(p.mass)} ${p.unit}`}
        </text>

        <text x={X0 - 8} y={110} fontSize="12" textAnchor="end" fill="currentColor">
          теоретично
        </text>
        {bar(92, theoretical * scale, 'fill-amber-200 dark:fill-amber-700/60')}
        <text x={X0 + theoretical * scale + 6} y={110} fontSize="12" fill="currentColor">
          {`${fmt(theoretical)} ${p.unit}`}
        </text>

        <text x={X0 - 8} y={158} fontSize="12" textAnchor="end" fill="currentColor">
          практически
        </text>
        {bar(140, practical * scale, 'fill-amber-500')}
        <text x={X0 + practical * scale + 6} y={158} fontSize="12" fontWeight="700" className="fill-amber-700 dark:fill-amber-400">
          {`${fmt(practical)} ${p.unit}`}
        </text>

        <text x={X0} y={188} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          {`синьо – ${formulaText(p.pure.f)}, сиво – примеси`}
        </text>
      </LabSvg>

      <Sliders>
        <Slider label="w, %" value={purity} onChange={setPurity} min={50} max={100} step={1} tone="blue" />
        <Slider label="η, %" value={yieldPct} onChange={setYieldPct} min={10} max={100} step={1} tone="amber" />
      </Sliders>
      <div className="mt-3 space-y-2">
        <Readout
          items={[
            { label: `${formulaText(p.pure.f)}:`, value: `${fmt(pureMass)} ${p.unit} = ${fmt(pureMass / Mpure)} ${p.unit === 'kg' ? 'kmol' : 'mol'}`, tone: 'blue' },
            { label: `M(${formulaText(p.product.f)}) =`, value: `${Mprod} g/mol` },
          ]}
        />
        <Readout
          items={[
            { label: 'теоретично:', value: `${fmt(theoretical)} ${p.unit}` },
            { label: `× ${yieldPct}% =`, value: `${fmt(practical)} ${p.unit}`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone="blue">
        {`От ${fmt(p.mass)} ${p.unit} ${p.raw} се получават ${fmt(practical)} ${p.unit} ${p.product.name} – ${fmt((practical / p.mass) * 100)}% от масата на суровината.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 По уравнението се смята само чистото вещество – примесите не дават продукт. Теоретичният добив е масата, която уравнението
        позволява; на практика част от веществото не реагира, губи се при пречистването или участва в странични реакции. Добивът е
        отношението практическа : теоретична маса.
      </p>
    </div>
  );
}
