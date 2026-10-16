import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { Tex } from '~/MathText';

type Ion = { id: string; tex: string; label: string; charge: number; name: string; poly?: boolean };

// Имената на катионите са в прилагателна форма – за името на съединението
const CATIONS: Ion[] = [
  { id: 'Na', tex: 'Na', label: 'Na⁺', charge: 1, name: 'натриев' },
  { id: 'K', tex: 'K', label: 'K⁺', charge: 1, name: 'калиев' },
  { id: 'NH4', tex: 'NH_4', label: 'NH₄⁺', charge: 1, name: 'амониев', poly: true },
  { id: 'Mg', tex: 'Mg', label: 'Mg²⁺', charge: 2, name: 'магнезиев' },
  { id: 'Ca', tex: 'Ca', label: 'Ca²⁺', charge: 2, name: 'калциев' },
  { id: 'Fe2', tex: 'Fe', label: 'Fe²⁺', charge: 2, name: 'железен(II)' },
  { id: 'Cu', tex: 'Cu', label: 'Cu²⁺', charge: 2, name: 'меден(II)' },
  { id: 'Fe3', tex: 'Fe', label: 'Fe³⁺', charge: 3, name: 'железен(III)' },
  { id: 'Al', tex: 'Al', label: 'Al³⁺', charge: 3, name: 'алуминиев' },
];
const ANIONS: Ion[] = [
  { id: 'Cl', tex: 'Cl', label: 'Cl⁻', charge: -1, name: 'хлорид' },
  { id: 'OH', tex: 'OH', label: 'OH⁻', charge: -1, name: 'хидроксид', poly: true },
  { id: 'NO3', tex: 'NO_3', label: 'NO₃⁻', charge: -1, name: 'нитрат', poly: true },
  { id: 'O', tex: 'O', label: 'O²⁻', charge: -2, name: 'оксид' },
  { id: 'S', tex: 'S', label: 'S²⁻', charge: -2, name: 'сулфид' },
  { id: 'SO4', tex: 'SO_4', label: 'SO₄²⁻', charge: -2, name: 'сулфат', poly: true },
  { id: 'CO3', tex: 'CO_3', label: 'CO₃²⁻', charge: -2, name: 'карбонат', poly: true },
  { id: 'N', tex: 'N', label: 'N³⁻', charge: -3, name: 'нитрид' },
  { id: 'PO4', tex: 'PO_4', label: 'PO₄³⁻', charge: -3, name: 'фосфат', poly: true },
];

/** Съчетания, които не съществуват като устойчиви вещества – зарядите пак се изравняват, но в природата ги няма. */
const UNSTABLE: Record<string, string> = {
  'NH4-O': 'Амониев оксид не съществува – амониевият йон и оксидният йон веднага дават амоняк и вода.',
  'NH4-N': 'Амониев нитрид не е получен.',
  'NH4-OH': 'Амониев хидроксид като чисто вещество не е изолиран – „амонячната вода“ е разтвор на амоняк във вода.',
  'Fe3-S': 'Железен(III) сулфид е неустойчив и лесно се разлага.',
  'Fe3-CO3': 'Железен(III) карбонат не е известен като устойчиво вещество – във вода се хидролизира.',
  'Al-CO3': 'Алуминиев карбонат не е известен като устойчиво вещество – във вода се хидролизира до Al(OH)₃ и CO₂.',
  'Na-N': 'Натриевият нитрид е много неустойчив.',
  'K-N': 'Калиевият нитрид е много неустойчив.',
  'Fe2-N': 'Нитридите на желязото имат друг, по-сложен състав.',
  'Fe3-N': 'Нитридите на желязото имат друг, по-сложен състав.',
  'Cu-N': 'Меден(II) нитрид не е известен – известен е меден(I) нитрид Cu₃N.',
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Формулата в LaTeX: Ca_3(PO_4)_2; многоатомните йони са в скоби, ако са повече от един. */
function formulaTex(c: Ion, n: number, a: Ion, m: number) {
  const part = (ion: Ion, k: number) => (k === 1 ? ion.tex : ion.poly ? `(${ion.tex})_${k}` : `${ion.tex}_${k}`);
  return `\\mathrm{${part(c, n)}${part(a, m)}}`;
}

const MAX = 6;

/** Състави йонно съединение: добавяй катиони и аниони, докато сборът от зарядите стане нула. */
export default function IonicFormulaLab() {
  const [cat, setCat] = useState(CATIONS[8]);
  const [an, setAn] = useState(ANIONS[3]);
  const [n, setN] = useState(1);
  const [m, setM] = useState(1);

  const total = n * cat.charge + m * an.charge;
  const g = gcd(n, m);
  const neutral = total === 0;
  const pickCat = (c: Ion) => {
    setCat(c);
    setN(1);
    setM(1);
  };
  const pickAn = (a: Ion) => {
    setAn(a);
    setN(1);
    setM(1);
  };
  const key = `${cat.id}-${an.id}`;

  // Йоните – кръгчета: катиони отгоре, аниони отдолу
  const ionCircle = (ion: Ion, i: number, count: number, y: number, cation: boolean) => {
    const x = 240 + (i - (count - 1) / 2) * 68;
    return (
      <g key={`${cation ? 'c' : 'a'}${i}`}>
        <circle cx={x} cy={y} r={cation ? 24 : 29} className={cation ? 'fill-rose-100 stroke-rose-400 dark:fill-rose-900/40' : 'fill-sky-100 stroke-sky-500 dark:fill-sky-900/40'} strokeWidth="2" />
        <text x={x} y={y + 5} fontSize="14" fontWeight="700" textAnchor="middle" fill="currentColor">
          {ion.label}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">Катион</p>
      <Buttons>
        {CATIONS.map(c => (
          <DiagramButton key={c.id} active={c.id === cat.id} onClick={() => pickCat(c)}>
            {c.label}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="mt-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Анион</p>
      <Buttons>
        {ANIONS.map(a => (
          <DiagramButton key={a.id} active={a.id === an.id} onClick={() => pickAn(a)}>
            {a.label}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 200" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {Array.from({ length: n }, (_, i) => ionCircle(cat, i, n, 50, true))}
        {Array.from({ length: m }, (_, i) => ionCircle(an, i, m, 140, false))}
        <text x={470} y={98} fontSize="13" textAnchor="end" className={neutral ? 'fill-emerald-700 dark:fill-emerald-400' : 'fill-rose-600 dark:fill-rose-400'}>
          {`сбор: ${total > 0 ? '+' : total < 0 ? '−' : ''}${Math.abs(total)}`}
        </text>
      </LabSvg>

      <Buttons>
        <DiagramButton onClick={() => n < MAX && setN(n + 1)}>+ {cat.label}</DiagramButton>
        <DiagramButton onClick={() => n > 1 && setN(n - 1)}>− {cat.label}</DiagramButton>
        <DiagramButton onClick={() => m < MAX && setM(m + 1)}>+ {an.label}</DiagramButton>
        <DiagramButton onClick={() => m > 1 && setM(m - 1)}>− {an.label}</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'положителни:', value: `+${n * cat.charge}`, tone: 'rose' },
            { label: 'отрицателни:', value: `−${m * -an.charge}`, tone: 'blue' },
          ]}
        />
      </div>
      {!neutral && <Note tone="rose">Сборът от зарядите не е нула – добави {total > 0 ? 'аниони' : 'катиони'}.</Note>}
      {neutral && g > 1 && <Note tone="amber">Зарядите са изравнени, но формулата се пише с най-малките цели числа – махни по равен брой йони.</Note>}
      {neutral && g === 1 && (
        <div className="mt-3 text-center">
          <div className="text-2xl text-gray-900 dark:text-gray-100">
            <Tex>{formulaTex(cat, n, an, m)}</Tex>
          </div>
          <p className="text-emerald-700 dark:text-emerald-400 font-medium mt-1">
            ✓ {cat.name} {an.name}
          </p>
          {UNSTABLE[key] && <Note tone="amber">{UNSTABLE[key]}</Note>}
        </div>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Йонното съединение като цяло е електронеутрално: сборът от положителните и отрицателните заряди е нула. Затова броят на йоните се
        намира от зарядите – най-малкото общо кратно на 3 и 2 е 6, откъдето Al₂O₃. Многоатомните йони (NH₄⁺, SO₄²⁻, PO₄³⁻…) се пишат в скоби,
        когато са повече от един.
      </p>
    </div>
  );
}
