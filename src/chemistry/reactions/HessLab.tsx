import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { formulaText } from '../formula';

/** Уравнение като коефициенти: реагентите отрицателни, продуктите положителни. */
type Eq = { species: Record<string, number>; dH: number };

const PUZZLES: { name: string; target: Eq; given: Eq[]; hint: string }[] = [
  {
    name: 'C + ½O₂ → CO',
    target: { species: { C: -1, O2: -0.5, CO: 1 }, dH: -110.5 },
    given: [
      { species: { C: -1, O2: -1, CO2: 1 }, dH: -393.5 },
      { species: { CO: -1, O2: -0.5, CO2: 1 }, dH: -283.0 },
    ],
    hint: 'CO не може да се получи чисто от въглерод – винаги се образува и малко CO₂. Затова ΔH се намира само косвено.',
  },
  {
    name: 'C + 2H₂ → CH₄',
    target: { species: { C: -1, H2: -2, CH4: 1 }, dH: -74.8 },
    given: [
      { species: { C: -1, O2: -1, CO2: 1 }, dH: -393.5 },
      { species: { H2: -1, O2: -0.5, 'H2O(l)': 1 }, dH: -285.8 },
      { species: { CH4: -1, O2: -2, CO2: 1, 'H2O(l)': 2 }, dH: -890.3 },
    ],
    hint: 'Въглерод и водород не реагират директно до метан, но трите горения се измерват лесно в калориметрична бомба.',
  },
  {
    name: 'C₂H₄ + H₂ → C₂H₆',
    target: { species: { C2H4: -1, H2: -1, C2H6: 1 }, dH: -136.4 },
    given: [
      { species: { C2H4: -1, O2: -3, CO2: 2, 'H2O(l)': 2 }, dH: -1411.0 },
      { species: { H2: -1, O2: -0.5, 'H2O(l)': 1 }, dH: -285.8 },
      { species: { C2H6: -1, O2: -3.5, CO2: 2, 'H2O(l)': 3 }, dH: -1560.4 },
    ],
    hint: 'Хидрогенирането протича с катализатор, но топлинният му ефект пак се намира най-лесно от енталпиите на горене.',
  },
];

const FACTORS = [-2, -1, -0.5, 0, 0.5, 1, 2];
const coef = (k: number) => (k === 0.5 ? '½' : k === 1.5 ? '3/2' : k === 2.5 ? '5/2' : k === 3.5 ? '7/2' : k === 1 ? '' : String(k));
const kText = (k: number) => (k === 0.5 ? '½' : k === -0.5 ? '−½' : String(k).replace('-', '−'));
const num = (v: number) => (Math.abs(v) < 1e-9 ? '0' : `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1).replace('.', ',')}`);

function eqText(species: Record<string, number>) {
  const side = (sign: number) =>
    Object.entries(species)
      .filter(([, k]) => k * sign > 1e-9)
      .map(([f, k]) => coef(Math.abs(k)) + formulaText(f))
      .join(' + ') || '0';
  return `${side(-1)} → ${side(1)}`;
}

function combine(given: Eq[], ks: number[]): Eq {
  const species: Record<string, number> = {};
  let dH = 0;
  given.forEach((g, i) => {
    for (const [f, k] of Object.entries(g.species)) species[f] = (species[f] ?? 0) + k * ks[i];
    dH += g.dH * ks[i];
  });
  for (const f of Object.keys(species)) if (Math.abs(species[f]) < 1e-9) delete species[f];
  return { species, dH };
}

const same = (a: Record<string, number>, b: Record<string, number>) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every(f => Math.abs((a[f] ?? 0) - (b[f] ?? 0)) < 1e-9);
};

/** Пъзел със закона на Хес: умножи и обърни дадените уравнения, така че сборът им да е търсеното. */
export default function HessLab() {
  const [pi, setPi] = useState(0);
  const puzzle = PUZZLES[pi];
  const [ks, setKs] = useState<number[]>(puzzle.given.map(() => 0));
  const sum = combine(puzzle.given, ks);
  const solved = same(sum.species, puzzle.target.species);

  const choose = (i: number) => {
    setPi(i);
    setKs(PUZZLES[i].given.map(() => 0));
  };

  // Стъпаловидна диаграма: всяко уравнение мести енталпията с k·ΔH
  const steps = puzzle.given.map((g, i) => ({ label: `(${i + 1})`, d: g.dH * ks[i] }));
  let acc = 0;
  const levels = steps.map(s => {
    const from = acc;
    acc += s.d;
    return { ...s, from, to: acc };
  });
  const values = [0, puzzle.target.dH, ...levels.map(l => l.to)];
  const span = Math.max(400, Math.max(...values) - Math.min(...values));
  const top = Math.max(...values);
  const Y0 = 34;
  const H = 150;
  const y = (E: number) => Y0 + ((top - E) / span) * H;
  const colX = (i: number) => 70 + i * 95;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PUZZLES.map((p, i) => (
          <DiagramButton key={p.name} active={i === pi} onClick={() => choose(i)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>

      <div className="mt-3 space-y-2 max-w-xl mx-auto">
        {puzzle.given.map((g, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2 text-sm">
            <span className="font-mono text-gray-500 w-6">({i + 1})</span>
            <span className="flex-1 min-w-[12rem] font-mono text-gray-800 dark:text-gray-100">
              {eqText(g.species)}; ΔH = {num(g.dH)} kJ
            </span>
            <span className="flex items-center gap-1">
              <button
                className="w-7 h-7 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setKs(prev => prev.map((k, j) => (j === i ? FACTORS[Math.max(0, FACTORS.indexOf(k) - 1)] : k)))}
                aria-label="намали множителя"
              >
                −
              </button>
              <span className="w-10 text-center font-mono font-semibold text-violet-600 dark:text-violet-400">×{kText(ks[i])}</span>
              <button
                className="w-7 h-7 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setKs(prev => prev.map((k, j) => (j === i ? FACTORS[Math.min(FACTORS.length - 1, FACTORS.indexOf(k) + 1)] : k)))}
                aria-label="увеличи множителя"
              >
                +
              </button>
            </span>
          </div>
        ))}
      </div>

      <LabSvg viewBox="0 0 480 210" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* целевото ниво */}
        <line x1={30} x2={460} y1={y(puzzle.target.dH)} y2={y(puzzle.target.dH)} className="stroke-emerald-500" strokeDasharray="5 4" />
        <text x={460} y={y(puzzle.target.dH) + (puzzle.target.dH < 0 ? 15 : -6)} fontSize="11" textAnchor="end" className="fill-emerald-600 dark:fill-emerald-400">
          търсено: {num(puzzle.target.dH)}
        </text>
        <line x1={30} x2={460} y1={y(0)} y2={y(0)} className="stroke-gray-300 dark:stroke-gray-600" />
        <text x={460} y={y(0) - 6} fontSize="11" textAnchor="end" className="fill-gray-500">
          начало: 0
        </text>
        {levels.map((l, i) => {
          const x = colX(i);
          const up = l.d > 0;
          return (
            <g key={i}>
              <rect x={x} y={Math.min(y(l.from), y(l.to))} width={60} height={Math.max(1.5, Math.abs(y(l.to) - y(l.from)))} className={up ? 'fill-orange-300 dark:fill-orange-500/70' : 'fill-sky-300 dark:fill-sky-500/70'} />
              {i < levels.length - 1 && <line x1={x + 60} x2={colX(i + 1)} y1={y(l.to)} y2={y(l.to)} className="stroke-gray-400" strokeDasharray="2 2" />}
              <text x={x + 30} y={200} fontSize="12" textAnchor="middle" className="fill-gray-500">
                {l.label} ×{kText(ks[i])}
              </text>
              {Math.abs(l.d) > 1e-9 && (
                <text x={x + 30} y={(up ? y(l.to) : y(l.from)) - 5} fontSize="11" fontWeight="600" textAnchor="middle" fill="currentColor">
                  {num(l.d)}
                </text>
              )}
            </g>
          );
        })}
        <circle cx={colX(levels.length - 1) + 60} cy={y(sum.dH)} r={5} className={solved ? 'fill-emerald-500' : 'fill-violet-500'} />
      </LabSvg>

      <div className="mt-2">
        <Readout
          items={[
            { label: 'сбор:', value: Object.keys(sum.species).length ? eqText(sum.species) : '—', tone: 'violet' },
            { label: 'ΔH =', value: `${num(sum.dH)} kJ`, tone: solved ? 'emerald' : 'gray' },
          ]}
        />
      </div>
      <Note tone={solved ? 'emerald' : 'amber'}>
        {solved
          ? `Точно! ${puzzle.name}: ΔH = ${num(puzzle.target.dH)} kJ. ${puzzle.hint}`
          : `Цел: ${eqText(puzzle.target.species)}. Обърнатото уравнение (×−1) сменя знака на ΔH; веществата, които се срещат от двете страни, се съкращават.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Енталпията е функция на състоянието: колкото и стъпки да вземем по пътя, ако началото и краят са същите, сборът на ΔH е
        същият. Сините стъпки отделят топлина, оранжевите поглъщат.
      </p>
    </div>
  );
}
