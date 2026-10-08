import { useState } from 'react';
import { planck } from './light';

const W = 640;
const H = 290;
// Отразена светлина (видимо и близко инфрачервено)
const AX0 = 30;
const AX1 = 270;
// Топлинно излъчване
const BX0 = 300;
const BX1 = 620;
const Y0 = 40;
const Y1 = 200;
const T_STRAT = 215; // температура на горните слоеве, K

type Gas = 'H2O' | 'CO2' | 'O2' | 'O3' | 'CH4' | 'veg';
const GASES: { k: Gas; name: string }[] = [
  { k: 'H2O', name: 'вода H₂O' },
  { k: 'CO2', name: 'въглероден диоксид CO₂' },
  { k: 'O2', name: 'кислород O₂' },
  { k: 'O3', name: 'озон O₃' },
  { k: 'CH4', name: 'метан CH₄' },
  { k: 'veg', name: 'растителност' },
];

// [център μm, ширина μm, дълбочина]
const IR_BANDS: Record<Gas, [number, number, number][]> = {
  H2O: [
    [6.3, 0.6, 0.75],
    [19, 1.6, 0.55],
  ],
  CO2: [
    [15, 0.9, 0.9],
    [4.3, 0.12, 0.8],
  ],
  O3: [[9.6, 0.22, 0.65]],
  CH4: [[7.66, 0.18, 0.55]],
  O2: [],
  veg: [],
};
const VIS_BANDS: Record<Gas, [number, number, number][]> = {
  H2O: [
    [0.72, 0.008, 0.25],
    [0.82, 0.01, 0.3],
    [0.94, 0.015, 0.55],
  ],
  O2: [
    [0.762, 0.004, 0.7],
    [0.688, 0.003, 0.3],
  ],
  O3: [[0.6, 0.06, 0.12]],
  CH4: [[0.89, 0.01, 0.4]],
  CO2: [],
  veg: [],
};
const LABELS: { gas: Gas; lam: number; ir: boolean; text: string }[] = [
  { gas: 'O2', lam: 0.762, ir: false, text: 'O₂' },
  { gas: 'H2O', lam: 0.94, ir: false, text: 'H₂O' },
  { gas: 'CH4', lam: 0.89, ir: false, text: 'CH₄' },
  { gas: 'H2O', lam: 6.3, ir: true, text: 'H₂O' },
  { gas: 'CH4', lam: 7.66, ir: true, text: 'CH₄' },
  { gas: 'O3', lam: 9.6, ir: true, text: 'O₃' },
  { gas: 'CO2', lam: 15, ir: true, text: 'CO₂' },
];

type Surface = 'earth' | 'venus' | 'mars';
const PLANETS: { name: string; T: number; surface: Surface; gases: Gas[] }[] = [
  { name: 'Земята днес', T: 288, surface: 'earth', gases: ['H2O', 'CO2', 'O2', 'O3', 'CH4', 'veg'] },
  { name: 'Ранната Земя (3,5 млрд. г.)', T: 290, surface: 'earth', gases: ['H2O', 'CO2', 'CH4'] },
  { name: 'Венера', T: 235, surface: 'venus', gases: ['CO2'] },
  { name: 'Марс', T: 215, surface: 'mars', gases: ['CO2'] },
];

const g = (x: number, c: number, w: number) => Math.exp(-0.5 * ((x - c) / w) ** 2);

function albedoBase(lam: number, s: Surface) {
  if (s === 'venus') return 0.72 - 0.3 * g(lam, 0.4, 0.06);
  if (s === 'mars') return 0.08 + 0.22 / (1 + Math.exp(-(lam - 0.6) / 0.04));
  return 0.22 + 0.25 * (0.4 / lam) ** 4;
}

export default function BiosignatureLab() {
  const [pi, setPi] = useState(0);
  const [on, setOn] = useState<Set<Gas>>(new Set(PLANETS[0].gases));
  const p = PLANETS[pi];

  const absorb = (lam: number, bands: Record<Gas, [number, number, number][]>) => {
    let tr = 1;
    on.forEach(k => bands[k].forEach(([c, w, d]) => (tr *= 1 - d * g(lam, c, w))));
    return 1 - tr;
  };

  // Отразена светлина
  const visPts: string[] = [];
  for (let i = 0; i <= 300; i++) {
    const lam = 0.4 + (i / 300) * 0.6;
    let A = albedoBase(lam, p.surface);
    if (on.has('veg')) A += 0.12 / (1 + Math.exp(-(lam - 0.71) / 0.012));
    A *= 1 - absorb(lam, VIS_BANDS);
    visPts.push(`${AX0 + (i / 300) * (AX1 - AX0)},${Y1 - (A / 0.8) * (Y1 - Y0)}`);
  }
  // Топлинно излъчване
  const lx = (lam: number) => BX0 + ((lam - 4) / 16) * (BX1 - BX0);
  const bMax = planck(2.898e-3 / p.T, p.T);
  const irPts: string[] = [];
  const bbPts: string[] = [];
  for (let i = 0; i <= 400; i++) {
    const lam = 4 + (i / 400) * 16;
    const D = absorb(lam, IR_BANDS);
    const tStrat = Math.min(T_STRAT, p.T);
    const F = planck(lam * 1e-6, p.T) * (1 - D) + planck(lam * 1e-6, tStrat) * D;
    irPts.push(`${lx(lam)},${Y1 - (F / bMax) * 0.9 * (Y1 - Y0)}`);
    bbPts.push(`${lx(lam)},${Y1 - (planck(lam * 1e-6, p.T) / bMax) * 0.9 * (Y1 - Y0)}`);
  }

  const oxy = on.has('O2') || on.has('O3');
  const verdict =
    oxy && on.has('CH4')
      ? { c: '#86efac', t: 'Силна биосигнатура: кислород и метан заедно!', d: 'Двата газа се унищожават взаимно за години до десетилетия. Щом ги има едновременно, нещо постоянно ги попълва – на Земята това е животът. Това е химично неравновесие.' }
      : oxy
        ? { c: '#fde68a', t: 'Възможна биосигнатура – но внимание', d: 'Кислородът може да се натрупа и без живот: ултравиолетовите лъчи разпадат водата, а лекият водород избягва в космоса. Нужни са още улики.' }
        : on.has('CH4')
          ? { c: '#fde68a', t: 'Метан без кислород', d: 'Така е изглеждала ранната Земя – метанът е бил от микроби. Но той се отделя и от вулкани и реакции на водата със скалите. Сам по себе си не е доказателство.' }
          : { c: '#fca5a5', t: 'Няма биосигнатури', d: 'Атмосфера в химично равновесие – обяснима с геология и фотохимия, без живот.' };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-teal-300 dark:border-teal-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Спектърът на една бледа точка</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        От светлинни години планетата е само точка. Но спектърът ѝ разказва кои газове има в атмосферата. Изберете планета или
        „построете“ своя атмосфера.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <rect x={AX0} y={Y0} width={AX1 - AX0} height={Y1 - Y0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <rect x={BX0} y={Y0} width={BX1 - BX0} height={Y1 - Y0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <text x={AX0} y={Y0 - 10} fontSize="10" fill="white" fillOpacity="0.75">
          отразена звездна светлина
        </text>
        <text x={BX0} y={Y0 - 10} fontSize="10" fill="white" fillOpacity="0.75">
          собствено топлинно излъчване
        </text>
        <polyline points={visPts.join(' ')} fill="none" stroke="#7dd3fc" strokeWidth="1.8" />
        <polyline points={bbPts.join(' ')} fill="none" stroke="white" strokeOpacity="0.3" strokeDasharray="4 3" />
        <polyline points={irPts.join(' ')} fill="none" stroke="#fb923c" strokeWidth="1.8" />
        {LABELS.filter(l => on.has(l.gas)).map(l => {
          const x = l.ir ? lx(l.lam) : AX0 + ((l.lam - 0.4) / 0.6) * (AX1 - AX0);
          return (
            <text key={`${l.text}${l.lam}`} x={x} y={Y0 + 12} fontSize="9" textAnchor="middle" fill="#fde68a">
              {l.text}
            </text>
          );
        })}
        {on.has('veg') && (
          <text x={AX0 + ((0.66 - 0.4) / 0.6) * (AX1 - AX0)} y={Y0 + 26} fontSize="8" textAnchor="middle" fill="#86efac">
            „червен ръб“
          </text>
        )}
        {[0.4, 0.6, 0.8, 1].map(l => (
          <text key={l} x={AX0 + ((l - 0.4) / 0.6) * (AX1 - AX0)} y={Y1 + 12} fontSize="8" textAnchor="middle" fill="white" fillOpacity="0.5">
            {String(l).replace('.', ',')}
          </text>
        ))}
        {[4, 8, 12, 16, 20].map(l => (
          <text key={l} x={lx(l)} y={Y1 + 12} fontSize="8" textAnchor="middle" fill="white" fillOpacity="0.5">
            {l}
          </text>
        ))}
        <text x={(AX0 + AX1) / 2} y={Y1 + 24} fontSize="8" textAnchor="middle" fill="white" fillOpacity="0.5">
          дължина на вълната, μm
        </text>
        <text x={(BX0 + BX1) / 2} y={Y1 + 24} fontSize="8" textAnchor="middle" fill="white" fillOpacity="0.5">
          дължина на вълната, μm (пунктир – черно тяло {p.T} K)
        </text>
        <text x={30} y={H - 38} fontSize="12" fontWeight="700" fill={verdict.c}>
          {verdict.t}
        </text>
        <text x={30} y={H - 20} fontSize="9" fill="white" fillOpacity="0.6">
          Дълбоките „ями“ са ивици на поглъщане: газът поглъща светлината и излъчва от по-високи и по-студени слоеве.
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {PLANETS.map((q, i) => (
          <button
            key={q.name}
            onClick={() => {
              setPi(i);
              setOn(new Set(q.gases));
            }}
            className={`px-2 py-1 rounded text-xs border ${
              i === pi ? 'border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {q.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {GASES.map(q => (
          <button
            key={q.k}
            onClick={() =>
              setOn(prev => {
                const n = new Set(prev);
                if (n.has(q.k)) n.delete(q.k);
                else n.add(q.k);
                return n;
              })
            }
            className={`px-2 py-1 rounded text-xs border ${on.has(q.k) ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' : 'border-gray-300 dark:border-gray-600 opacity-60'}`}
          >
            {on.has(q.k) ? '✓ ' : ''}
            {q.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {verdict.d}
        {on.has('veg') && ' Растенията отразяват силно близкото инфрачервено (над 0,7 μm) – „червеният ръб“ е още една улика, която сондата Галилео видя при прелитането покрай Земята през 1990 г.'}
      </p>
    </div>
  );
}
