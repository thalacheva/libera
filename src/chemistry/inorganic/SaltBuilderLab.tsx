import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { Tex } from '~/MathText';

type Acid = { id: string; n: number; residue: string; name: string; anions: string[] };
type Base = { id: string; metal: string; m: number; name: string; adj: string };

// anions[k] – името на аниона, когато са заместени k + 1 водородни атома (от киселинната сол към нормалната)
const ACIDS: Acid[] = [
  { id: 'HCl', n: 1, residue: 'Cl', name: 'солна киселина', anions: ['хлорид'] },
  { id: 'HNO3', n: 1, residue: 'NO3', name: 'азотна киселина', anions: ['нитрат'] },
  { id: 'H2S', n: 2, residue: 'S', name: 'сероводородна киселина', anions: ['хидрогенсулфид', 'сулфид'] },
  { id: 'H2CO3', n: 2, residue: 'CO3', name: 'въглена киселина', anions: ['хидрогенкарбонат', 'карбонат'] },
  { id: 'H2SO4', n: 2, residue: 'SO4', name: 'сярна киселина', anions: ['хидрогенсулфат', 'сулфат'] },
  { id: 'H3PO4', n: 3, residue: 'PO4', name: 'фосфорна киселина', anions: ['дихидрогенфосфат', 'хидрогенфосфат', 'фосфат'] },
];
const BASES: Base[] = [
  { id: 'NaOH', metal: 'Na', m: 1, name: 'натриев хидроксид', adj: 'натриев' },
  { id: 'KOH', metal: 'K', m: 1, name: 'калиев хидроксид', adj: 'калиев' },
  { id: 'Ca(OH)2', metal: 'Ca', m: 2, name: 'калциев хидроксид', adj: 'калциев' },
  { id: 'Ba(OH)2', metal: 'Ba', m: 2, name: 'бариев хидроксид', adj: 'бариев' },
];

/** Бележки за конкретни соли – къде се срещат и какво е особеното. */
const NOTES: Record<string, string> = {
  NaCl: 'Готварската сол.',
  'NaHCO3': 'Сода бикарбонат – в бакпулвера и срещу киселини в стомаха.',
  Na2CO3: 'Калцинирана сода – за производството на стъкло и в препаратите за пране.',
  'Ca(HCO3)2': 'Съществува само в разтвор – тя прави водата „твърда“. При кипене се разлага и по съдовете се отлага котлен камък CaCO₃.',
  'Ba(HCO3)2': 'Съществува само в разтвор.',
  CaCO3: 'Варовик, мрамор, тебешир, черупки – неразтворим във вода.',
  BaCO3: 'Неразтворим във вода.',
  CaSO4: 'Слабо разтворим – като дихидрат CaSO₄·2H₂O е гипсът.',
  BaSO4: 'Практически неразтворим – бялата утайка, по която се открива сулфатният йон.',
  'Ca(H2PO4)2': 'Главната съставка на суперфосфата – най-известния фосфорен тор.',
  CaHPO4: 'Слабо разтворим; използва се като добавка към фуражите и в пастите за зъби.',
  'Ca3(PO4)2': 'Неразтворим. Подобни калциеви фосфати изграждат костите и фосфоритите.',
  'Ba3(PO4)2': 'Неразтворим във вода.',
  CaS: 'Във вода се хидролизира – разтворът мирише на сероводород.',
  KNO3: 'Калиева селитра – тор и съставка на черния барут.',
  'Ca(NO3)2': 'Калциева селитра – азотен тор.',
  NaHSO4: 'Разтворът ѝ е кисел – използва се в някои препарати за почистване.',
  Na3PO4: 'Разтворът е силно основен – използва се за почистване и омекотяване на водата.',
};

const sub = (k: number) => (k === 1 ? '' : String(k));
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const ucSub = (s: string) => s.replace(/(\d+)/g, d => [...d].map(c => '₀₁₂₃₄₅₆₇₈₉'[Number(c)]).join(''));

/** Сол от киселина и основа: избираш колко водородни атома от всяка молекула киселина да се заместят с метал. */
export default function SaltBuilderLab() {
  const [ai, setAi] = useState(5);
  const [bi, setBi] = useState(0);
  const [kRaw, setK] = useState(3);
  const acid = ACIDS[ai];
  const base = BASES[bi];
  const k = Math.min(kRaw, acid.n);

  // Анион H_{n-k}A^{k-} и катион M^{m+}: a · m = b · k
  const g = gcd(base.m, k);
  const a = k / g; // брой катиони във формулата
  const b = base.m / g; // брой аниони
  const h = acid.n - k;
  const anionPlain = `${h > 0 ? `H${sub(h)}` : ''}${acid.residue}`;
  const multiAtom = !/^[A-Z][a-z]?$/.test(anionPlain.replace(/\d/g, ''));
  const anionPart = b === 1 ? anionPlain : multiAtom ? `(${anionPlain})${b}` : `${anionPlain}${b}`;
  const salt = `${base.metal}${sub(a)}${anionPart}`;
  const water = a * base.m;
  const saltName = `${base.adj} ${acid.anions[k - 1]}`;
  const normal = k === acid.n;

  const tex = (f: string) => `\\mathrm{${f.replace(/(\d+)/g, '_{$1}')}}`;
  const coef = (c: number, f: string) => `${c === 1 ? '' : c}${tex(f)}`;
  const equation = `${coef(b, acid.id)} + ${coef(a, base.id)} \\to ${tex(salt)} + ${coef(water, 'H2O')}`;

  // Чертеж: b молекули киселина, всяка с n водородни атома; заместените са изсивени
  const AW = 140;
  const startX = 240 - (b * AW + (b - 1) * 16) / 2;
  const molecules = Array.from({ length: b }, (_, j) => startX + j * (AW + 16));
  const metals = Array.from({ length: a }, (_, j) => 240 - ((a - 1) * 60) / 2 + j * 60);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-1">Киселина</p>
      <Buttons>
        {ACIDS.map((x, i) => (
          <DiagramButton key={x.id} active={i === ai} onClick={() => setAi(i)}>
            {ucSub(x.id)}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3 mb-1">Основа</p>
      <Buttons>
        {BASES.map((x, i) => (
          <DiagramButton key={x.id} active={i === bi} onClick={() => setBi(i)}>
            {ucSub(x.id)}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3 mb-1">Колко водородни атома от всяка молекула киселина се заместват?</p>
      <Buttons>
        {Array.from({ length: acid.n }, (_, i) => i + 1).map(x => (
          <DiagramButton key={x} active={x === k} onClick={() => setK(x)}>
            {x === acid.n ? `${x} (всички)` : x}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 222" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <text x={240} y={20} fontSize="14" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {b === 1 ? '1 молекула' : `${b} молекули`} {ucSub(acid.id)}
        </text>
        {molecules.map(x => (
          <g key={x}>
            <rect x={x} y={32} width={AW} height={62} rx="12" className="fill-amber-50 stroke-amber-400 dark:fill-amber-900/30 dark:stroke-amber-600" strokeWidth="1.5" />
            <text x={x + AW / 2} y={86} fontSize="16" fontWeight="700" textAnchor="middle" fill="currentColor">
              {ucSub(acid.residue)}
            </text>
            {Array.from({ length: acid.n }, (_, i) => {
              const cx = x + AW / 2 + (i - (acid.n - 1) / 2) * 34;
              const gone = i < k;
              return (
                <g key={i}>
                  <circle cx={cx} cy={52} r={13} className={gone ? 'fill-gray-200 stroke-gray-400 dark:fill-gray-700' : 'fill-sky-200 stroke-sky-500'} strokeDasharray={gone ? '3 2' : undefined} />
                  <text x={cx} y={57} fontSize="14" fontWeight="700" textAnchor="middle" className={gone ? 'fill-gray-400' : 'fill-gray-900'}>
                    H
                  </text>
                </g>
              );
            })}
          </g>
        ))}
        <text x={240} y={122} fontSize="14" textAnchor="middle" className="fill-gray-500">
          ↓ сивите H⁺ + OH⁻ от основата → {water} H₂O
        </text>
        <text x={240} y={150} fontSize="14" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {a === 1 ? '1 катион' : `${a} катиона`} {base.metal}
          {base.m === 1 ? '⁺' : '²⁺'} {a === 1 ? 'влиза' : 'влизат'} на мястото им
        </text>
        {metals.map(x => (
          <g key={x}>
            <circle cx={x} cy={190} r={22} className="fill-violet-200 stroke-violet-500" strokeWidth="1.5" />
            <text x={x} y={196} fontSize="16" fontWeight="700" textAnchor="middle" className="fill-gray-900">
              {base.metal}
            </text>
          </g>
        ))}
      </LabSvg>

      <div className="mt-2 text-center overflow-x-auto">
        <Tex>{equation}</Tex>
      </div>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'сол:', value: `${ucSub(salt)} – ${saltName}`, tone: 'violet' },
            { label: 'вид:', value: normal ? 'нормална сол' : 'кисела сол' },
            { label: 'заряди:', value: `${a} · (${base.m === 1 ? '+1' : '+2'}) + ${b} · (−${k}) = 0` },
          ]}
        />
      </div>
      <Note tone={normal ? 'emerald' : 'amber'}>
        {normal
          ? `Всички ${acid.n === 1 ? '' : acid.n + ' '}водородни атома са заместени – получава се нормална сол.`
          : `Остават ${h} водородни атома в аниона – получава се кисела сол (частична неутрализация).`}
        {NOTES[salt] ? ` ${NOTES[salt]}` : ''}
      </Note>
      {acid.id === 'H2CO3' && (
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Въглената киселина е неустойчива и съществува само в разреден разтвор – на практика карбонатите се получават, като CO₂ се пропуска
          през разтвор на основата.
        </p>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 При неутрализация водородните атоми на киселината се заместват с метал, а от H⁺ и OH⁻ се получава вода. Едноосновните киселини
        дават само нормални соли; дву- и триосновните – и кисели соли с „хидроген“ в името. Индексите във формулата подбираме така, че сборът
        от зарядите да е нула.
      </p>
    </div>
  );
}
