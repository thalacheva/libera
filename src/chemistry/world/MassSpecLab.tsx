import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

// Разпространение на изотопите (IUPAC, закръглено)
const C13 = 0.0107;
const CL = { 0: 0.7576, 2: 0.2424 };
const BR = { 0: 0.5069, 2: 0.4931 };

/** Йон: m/z с най-леките изотопи, брой C, Cl и Br в него, височина на най-лекия пик (ориентировъчна) и обяснение. */
type Ion = { mz: number; ion: string; c: number; cl?: number; br?: number; h: number; note: string; molecular?: boolean };
type Sample = { name: string; formula: string; ions: Ion[]; lesson: string };

const SAMPLES: Sample[] = [
  {
    name: 'метан',
    formula: 'CH₄',
    lesson: 'Молекулният йон е най-високият пик – малката молекула трудно се разпада. Пиковете с 1 по-малко са загуба на H.',
    ions: [
      { mz: 16, ion: 'CH₄⁺', c: 1, h: 100, note: 'молекулен йон M⁺', molecular: true },
      { mz: 15, ion: 'CH₃⁺', c: 1, h: 86, note: 'M − 1: загуба на H' },
      { mz: 14, ion: 'CH₂⁺', c: 1, h: 16, note: 'M − 2' },
      { mz: 13, ion: 'CH⁺', c: 1, h: 8, note: 'M − 3' },
    ],
  },
  {
    name: 'етанол',
    formula: 'C₂H₅OH',
    lesson: 'Молекулният йон (46) е слаб. Най-високият пик 31 е CH₂OH⁺ – след откъсване на CH₃ (46 − 15).',
    ions: [
      { mz: 46, ion: 'C₂H₅OH⁺', c: 2, h: 20, note: 'молекулен йон M⁺', molecular: true },
      { mz: 45, ion: 'C₂H₄OH⁺', c: 2, h: 50, note: 'M − 1: загуба на H' },
      { mz: 31, ion: 'CH₂OH⁺', c: 1, h: 100, note: 'M − 15: загуба на CH₃ – основен пик' },
      { mz: 29, ion: 'C₂H₅⁺', c: 2, h: 22, note: 'M − 17: загуба на OH' },
      { mz: 27, ion: 'C₂H₃⁺', c: 2, h: 22, note: 'C₂H₃⁺' },
    ],
  },
  {
    name: 'пропанон',
    formula: 'CH₃COCH₃',
    lesson: 'Основният пик 43 е ацилният йон CH₃CO⁺ (58 − 15). Пик при 43 е типичен за метилкетоните.',
    ions: [
      { mz: 58, ion: 'CH₃COCH₃⁺', c: 3, h: 62, note: 'молекулен йон M⁺', molecular: true },
      { mz: 43, ion: 'CH₃CO⁺', c: 2, h: 100, note: 'M − 15: загуба на CH₃ – основен пик' },
      { mz: 15, ion: 'CH₃⁺', c: 1, h: 25, note: 'метилов катион' },
    ],
  },
  {
    name: 'бутан',
    formula: 'C₄H₁₀',
    lesson: 'Веригата се къса на различни места: 43 = C₃H₇⁺ (M − 15), 29 = C₂H₅⁺ (M − 29). Молекулният йон 58 е слаб.',
    ions: [
      { mz: 58, ion: 'C₄H₁₀⁺', c: 4, h: 12, note: 'молекулен йон M⁺', molecular: true },
      { mz: 43, ion: 'C₃H₇⁺', c: 3, h: 100, note: 'M − 15: загуба на CH₃ – основен пик' },
      { mz: 29, ion: 'C₂H₅⁺', c: 2, h: 44, note: 'M − 29: загуба на C₂H₅' },
      { mz: 27, ion: 'C₂H₃⁺', c: 2, h: 37, note: 'C₂H₃⁺' },
      { mz: 15, ion: 'CH₃⁺', c: 1, h: 6, note: 'метилов катион' },
    ],
  },
  {
    name: 'хлороетан',
    formula: 'C₂H₅Cl',
    lesson: 'Двойка пикове 64 и 66 с височини около 3 : 1 – в молекулата има един атом хлор (³⁵Cl и ³⁷Cl).',
    ions: [
      { mz: 64, ion: 'C₂H₅³⁵Cl⁺', c: 2, cl: 1, h: 100, note: 'молекулен йон M⁺ (с ³⁵Cl)', molecular: true },
      { mz: 49, ion: 'CH₂³⁵Cl⁺', c: 1, cl: 1, h: 22, note: 'M − 15: загуба на CH₃' },
      { mz: 29, ion: 'C₂H₅⁺', c: 2, h: 80, note: 'M − 35: загуба на Cl' },
      { mz: 28, ion: 'C₂H₄⁺', c: 2, h: 75, note: 'загуба на HCl' },
      { mz: 27, ion: 'C₂H₃⁺', c: 2, h: 60, note: 'C₂H₃⁺' },
    ],
  },
  {
    name: 'бромоетан',
    formula: 'C₂H₅Br',
    lesson: 'Двойка пикове 108 и 110 с почти равни височини – един атом бром (⁷⁹Br и ⁸¹Br са почти по равно).',
    ions: [
      { mz: 108, ion: 'C₂H₅⁷⁹Br⁺', c: 2, br: 1, h: 90, note: 'молекулен йон M⁺ (с ⁷⁹Br)', molecular: true },
      { mz: 93, ion: 'CH₂⁷⁹Br⁺', c: 1, br: 1, h: 8, note: 'M − 15: загуба на CH₃' },
      { mz: 29, ion: 'C₂H₅⁺', c: 2, h: 100, note: 'M − 79: загуба на Br – основен пик' },
      { mz: 27, ion: 'C₂H₃⁺', c: 2, h: 50, note: 'C₂H₃⁺' },
    ],
  },
  {
    name: 'хлор',
    formula: 'Cl₂',
    lesson: 'С два атома хлор пиковете са три: 70, 72 и 74 в отношение около 9 : 6 : 1 (= (3 + 1)²).',
    ions: [
      { mz: 70, ion: '³⁵Cl₂⁺', c: 0, cl: 2, h: 100, note: 'молекулен йон M⁺ (³⁵Cl–³⁵Cl)', molecular: true },
      { mz: 35, ion: '³⁵Cl⁺', c: 0, cl: 1, h: 60, note: 'атомен йон Cl⁺' },
    ],
  },
  {
    name: 'бензен',
    formula: 'C₆H₆',
    lesson: 'Ароматният пръстен е устойчив: молекулният йон 78 е основен пик. Малкият пик 79 (около 6,6%) идва от ¹³C в шестте атома въглерод.',
    ions: [
      { mz: 78, ion: 'C₆H₆⁺', c: 6, h: 100, note: 'молекулен йон M⁺ – основен пик', molecular: true },
      { mz: 77, ion: 'C₆H₅⁺', c: 6, h: 18, note: 'M − 1: фенилов катион' },
      { mz: 52, ion: 'C₄H₄⁺', c: 4, h: 18, note: 'загуба на C₂H₂' },
      { mz: 51, ion: 'C₄H₃⁺', c: 4, h: 16, note: 'C₄H₃⁺' },
      { mz: 50, ion: 'C₄H₂⁺', c: 4, h: 14, note: 'C₄H₂⁺' },
    ],
  },
];

type Peak = { mz: number; h: number; ion: Ion; shift: number };

/** Изотопна група на един йон: ¹³C (до +2), ³⁷Cl и ⁸¹Br. Връща отместване по маса → дял спрямо най-лекия пик. */
function cluster(ion: Ion): Map<number, number> {
  let dist = new Map<number, number>([[0, 1]]);
  const conv = (other: Map<number, number>) => {
    const out = new Map<number, number>();
    for (const [a, p] of dist) for (const [b, q] of other) out.set(a + b, (out.get(a + b) ?? 0) + p * q);
    dist = out;
  };
  // ¹³C – биномно разпределение за първите два атома ¹³C
  const n = ion.c;
  if (n) conv(new Map([[0, (1 - C13) ** n], [1, n * C13 * (1 - C13) ** (n - 1)], [2, ((n * (n - 1)) / 2) * C13 ** 2 * (1 - C13) ** (n - 2)]]));
  for (let i = 0; i < (ion.cl ?? 0); i++) conv(new Map(Object.entries(CL).map(([k, v]) => [Number(k), v])));
  for (let i = 0; i < (ion.br ?? 0); i++) conv(new Map(Object.entries(BR).map(([k, v]) => [Number(k), v])));
  const base = dist.get(0)!;
  return new Map([...dist].map(([k, v]) => [k, v / base]));
}

function spectrum(sample: Sample): Peak[] {
  const peaks = new Map<number, Peak>();
  for (const ion of sample.ions)
    for (const [shift, f] of cluster(ion)) {
      const mz = ion.mz + shift;
      const h = ion.h * f;
      const old = peaks.get(mz);
      if (old) old.h += h;
      else peaks.set(mz, { mz, h, ion, shift });
    }
  const max = Math.max(...[...peaks.values()].map(p => p.h));
  return [...peaks.values()].map(p => ({ ...p, h: (p.h / max) * 100 })).filter(p => p.h >= 0.5);
}

const X0 = 40;
const X1 = 465;
const Y0 = 25;
const Y1 = 175;
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

/** Масспектър: молекулен йон, изотопни групи и фрагменти. */
export default function MassSpecLab() {
  const [si, setSi] = useState(4);
  const [sel, setSel] = useState<number | null>(null);
  const sample = SAMPLES[si];
  const peaks = spectrum(sample);
  const mzMax = Math.ceil((Math.max(...peaks.map(p => p.mz)) + 6) / 10) * 10;
  const X = (mz: number) => X0 + (mz / mzMax) * (X1 - X0);
  const Y = (h: number) => Y1 - (h / 100) * (Y1 - Y0);
  const step = mzMax > 100 ? 20 : 10;
  const ticks = Array.from({ length: Math.floor(mzMax / step) + 1 }, (_, i) => i * step);

  const molecular = sample.ions.find(i => i.molecular)!;
  const mCluster = peaks.filter(p => p.ion === molecular).sort((a, b) => a.mz - b.mz);
  const chosen = peaks.find(p => p.mz === sel) ?? null;
  // Надписи само на по-високите пикове, без застъпване
  // – първо най-високите, после по-ниските, ако има място
  const labeled = new Set<number>();
  for (const p of [...peaks].sort((a, b) => b.h - a.h)) {
    if (p.h < 8 && !(p.ion === molecular && p.h >= 2)) continue;
    if ([...labeled].some(m => Math.abs(X(m) - X(p.mz)) < 16)) continue;
    labeled.add(p.mz);
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SAMPLES.map((s, i) => (
          <DiagramButton key={s.name} active={i === si} onClick={() => { setSi(i); setSel(null); }}>
            {s.name} {s.formula}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 205" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} className="stroke-gray-400" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} className="stroke-gray-400" />
        {ticks.map(t => (
          <g key={t}>
            <line x1={X(t)} y1={Y1} x2={X(t)} y2={Y1 + 4} className="stroke-gray-400" />
            <text x={X(t)} y={Y1 + 14} fontSize="9" textAnchor="middle" className="fill-gray-500">{t}</text>
          </g>
        ))}
        {[0, 50, 100].map(h => (
          <text key={h} x={X0 - 4} y={Y(h) + 3} fontSize="9" textAnchor="end" className="fill-gray-500">{h}</text>
        ))}
        <text x={(X0 + X1) / 2} y={Y1 + 27} fontSize="10" textAnchor="middle" className="fill-gray-500">m/z</text>
        <text x={X0 + 4} y={Y0 - 10} fontSize="9" className="fill-gray-500">относителна височина, %</text>
        {peaks.map(p => {
          const isM = p.ion === molecular;
          const active = sel === p.mz;
          return (
            <g key={p.mz} onClick={() => setSel(p.mz)} className="cursor-pointer">
              <rect x={X(p.mz) - 6} y={Y0} width={12} height={Y1 - Y0} fill="transparent" />
              <line
                x1={X(p.mz)}
                y1={Y1}
                x2={X(p.mz)}
                y2={Y(p.h)}
                strokeWidth={active ? 4 : 3}
                className={active ? 'stroke-amber-500' : isM ? 'stroke-rose-600 dark:stroke-rose-400' : 'stroke-blue-600 dark:stroke-blue-400'}
              />
              {labeled.has(p.mz) && (
                <text x={X(p.mz)} y={Y(p.h) - 4} fontSize="9.5" fontWeight={600} textAnchor="middle" className="fill-current">
                  {p.mz}
                </text>
              )}
            </g>
          );
        })}
      </LabSvg>

      <div className="mt-2">
        <Readout
          items={[
            { label: 'молекулен йон:', value: mCluster.map(p => `${p.mz} (${fmt(p.h)}%)`).join(' · '), tone: 'rose' },
            ...(chosen
              ? [{ label: `пик ${chosen.mz}:`, value: `${chosen.shift ? `изотопен пик на ${chosen.ion.ion} (+${chosen.shift})` : `${chosen.ion.ion} – ${chosen.ion.note}`}, ${fmt(chosen.h)}%`, tone: 'amber' as const }]
              : []),
          ]}
        />
      </div>
      <Note tone="emerald">{sample.lesson}</Note>
      <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Щракни върху пик, за да видиш кой йон е.</p>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Съотношенията в изотопните групи (M, M+1, M+2…) са изчислени от разпространението на изотопите в природата: ³⁵Cl : ³⁷Cl ≈ 3 : 1,
        ⁷⁹Br : ⁸¹Br ≈ 1 : 1, ¹³C – около 1,1% на всеки въглероден атом. Височините на фрагментите са ориентировъчни – истинските спектри
        зависят и от уреда.
      </p>
    </div>
  );
}
