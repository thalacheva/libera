import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { MoleculeGroup } from '../StructuralFormula';
import { centered, semi } from './mechanismGeom';

type Mech = 'SN2' | 'SN1' | 'E2';
type Outcome = { mech: Mech; extra?: string; product: string; name: string; text: string };

const SUBSTRATES = [
  { smiles: 'CBr', label: 'CH₃Br', name: 'бромометан', degree: 'метилов' },
  { smiles: 'CCBr', label: 'CH₃CH₂Br', name: 'бромоетан', degree: 'първичен' },
  { smiles: 'CC(Br)C', label: '(CH₃)₂CHBr', name: '2-бромопропан', degree: 'вторичен' },
  { smiles: 'CC(C)(C)Br', label: '(CH₃)₃CBr', name: '2-бромо-2-метилпропан', degree: 'третичен' },
];

const CONDITIONS = [
  { label: 'NaOH, воден разтвор', short: ['NaOH', 'воден р-р'] },
  { label: 'само вода, затопляне', short: ['H₂O', 't°'] },
  { label: 'KOH, спиртен разтвор, нагряване', short: ['KOH', 'спирт, t°'] },
];

// [субстрат][условия]
const OUTCOMES: Outcome[][] = [
  [
    { mech: 'SN2', product: 'CO', name: 'метанол', text: 'Метиловата група е най-лесно достъпна за атака отзад – SN2 протича бързо.' },
    { mech: 'SN2', extra: 'много бавно', product: 'CO', name: 'метанол', text: 'Водата е слаб нуклеофил, а метилов карбокатион практически не се образува – реакцията е много бавна.' },
    {
      mech: 'SN2',
      product: 'COCC',
      name: 'метоксиетан (и метанол)',
      text: 'Няма съседен въглерод с водород (β-H), затова елиминиране е невъзможно – остава само заместване. В спиртен разтвор нуклеофил е и етоксидният йон, затова се получава и етер.',
    },
  ],
  [
    { mech: 'SN2', product: 'CCO', name: 'етанол', text: 'Първичният въглерод е лесно достъпен, а първичен карбокатион е твърде нестабилен – механизмът е SN2.' },
    { mech: 'SN2', extra: 'много бавно', product: 'CCO', name: 'етанол', text: 'Без силен нуклеофил първичните халогеналкани се хидролизират много бавно.' },
    {
      mech: 'E2',
      extra: '+ SN2',
      product: 'C=C',
      name: 'етен',
      text: 'Силна основа в спирт и нагряване благоприятстват елиминирането. При първичните халогеналкани обаче заместването остава сериозен конкурент – получава се и етер.',
    },
  ],
  [
    { mech: 'SN2', extra: '+ E2', product: 'CC(O)C', name: 'пропан-2-ол', text: 'Вторичният въглерод е по-трудно достъпен. Освен заместване протича и елиминиране – получава се и пропен.' },
    { mech: 'SN1', extra: 'бавно, + E1', product: 'CC(O)C', name: 'пропан-2-ол', text: 'Със слаб нуклеофил вторичният халогеналкан реагира бавно, отчасти през карбокатион.' },
    { mech: 'E2', product: 'C=CC', name: 'пропен', text: 'Силна основа + спирт + нагряване: основата отнема β-водород и се образува двойна връзка.' },
  ],
  [
    { mech: 'SN1', extra: '+ E1', product: 'CC(C)(C)O', name: '2-метилпропан-2-ол', text: 'Третичният въглерод е закрит от три метилови групи – атака отзад е невъзможна. Затова реакцията минава през стабилния третичен карбокатион.' },
    { mech: 'SN1', extra: '+ E1', product: 'CC(C)(C)O', name: '2-метилпропан-2-ол', text: 'Дори само водата хидролизира третичния халогеналкан – карбокатионът се образува лесно, а нуклеофилът участва чак след това.' },
    { mech: 'E2', product: 'C=C(C)C', name: '2-метилпропен', text: 'Със силна основа и нагряване третичните халогеналкани дават почти само алкен.' },
  ],
];

const RATE: Record<Mech, string> = { SN2: 'v = k[RBr][Nu⁻]', SN1: 'v = k[RBr]', E2: 'v = k[RBr][B⁻]' };
const STEREO: Record<Mech, string> = {
  SN2: 'обръщане на конфигурацията (атака отзад)',
  SN1: 'рацемизация – смес от двете огледални форми',
  E2: 'H и Br трябва да са в анти-положение',
};

const B = 40;
const FS = 12.5;

/** S с долен индекс N: „SN2“ → Sₙ2 в SVG. */
function MechText({ mech, x, y }: { mech: Mech; x: number; y: number }) {
  const [a, b] = mech === 'E2' ? ['E', ''] : ['S', 'N'];
  return (
    <text x={x} y={y} fontSize={20} fontWeight={700} textAnchor="middle" className="fill-amber-600 dark:fill-amber-400">
      {a}
      {b && (
        <tspan fontSize={13} dy={5}>
          {b}
        </tspan>
      )}
      <tspan dy={b ? -5 : 0}>{mech.slice(-1)}</tspan>
    </text>
  );
}

function Meter({ x, y, label, level, tone }: { x: number; y: number; label: string; level: number; tone: string }) {
  return (
    <g>
      <text x={x} y={y - 6} fontSize={11} className="fill-gray-600 dark:fill-gray-300">
        {label}
      </text>
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={x + i * 50} y={y} width={46} height={10} rx={3} className={i <= level ? tone : 'fill-gray-200 dark:fill-gray-700'} />
      ))}
    </g>
  );
}

/** Заместване или елиминиране: според вида на халогеналкана и условията – кой механизъм преобладава и какъв е продуктът. */
export default function SubstitutionLab() {
  const [si, setSi] = useState(1);
  const [ci, setCi] = useState(0);
  const sub = SUBSTRATES[si];
  const out = OUTCOMES[si][ci];
  const cond = CONDITIONS[ci];
  const left = centered(semi(sub.smiles), 90, 68, { bond: B, fs: FS, hl: [semi(sub.smiles).atoms.findIndex(a => a.el === 'Br')] });
  const prodMol = semi(out.product);
  const highlight = out.mech === 'E2' ? [] : [prodMol.atoms.findIndex(a => a.el === 'O')];
  const right = centered(prodMol, 390, 68, { bond: B, fs: FS, hl: highlight });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SUBSTRATES.map((s, i) => (
          <DiagramButton key={s.smiles} active={i === si} onClick={() => setSi(i)}>
            {s.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {CONDITIONS.map((c, i) => (
          <DiagramButton key={c.label} active={i === ci} onClick={() => setCi(i)}>
            {c.label}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 210" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <MoleculeGroup mol={left.mol} mode="semi" x={left.x} y={left.y} bond={B} fontSize={FS} highlightAtoms={left.hl} />
        <MoleculeGroup mol={right.mol} mode="semi" x={right.x} y={right.y} bond={B} fontSize={FS} highlightAtoms={right.hl} />
        <g className="stroke-gray-500" strokeWidth={1.6} fill="none">
          <line x1={190} y1={68} x2={290} y2={68} />
          <path d="M 283 63 L 290 68 L 283 73" />
        </g>
        <text x={240} y={44} fontSize={12} textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          {cond.short[0]}
        </text>
        <text x={240} y={60} fontSize={11} textAnchor="middle" className="fill-gray-500">
          {cond.short[1]}
        </text>
        <MechText mech={out.mech} x={240} y={94} />
        {out.extra && (
          <text x={240} y={112} fontSize={11} textAnchor="middle" className="fill-gray-500">
            {out.extra}
          </text>
        )}
        <text x={90} y={137} fontSize={11} textAnchor="middle" className="fill-gray-500">
          {sub.name}
        </text>
        <text x={390} y={137} fontSize={11} textAnchor="middle" className="fill-gray-500">
          {out.name}
        </text>
        <Meter x={20} y={172} label="пречка за атака отзад (↓ SN2)" level={si} tone="fill-rose-400" />
        <Meter x={262} y={172} label="стабилност на карбокатиона (↑ SN1)" level={si} tone="fill-emerald-500" />
        <text x={240} y={202} fontSize={10.5} textAnchor="middle" className="fill-gray-500">
          {sub.degree} халогеналкан
        </text>
      </LabSvg>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'механизъм:', value: `${out.mech}${out.extra ? ` (${out.extra})` : ''}`, tone: 'amber' },
            { label: 'скорост:', value: RATE[out.mech] },
            { label: 'стереохимия:', value: STEREO[out.mech] },
          ]}
        />
      </div>
      <Note tone="amber">{out.text}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Това са преобладаващите пътища при типичните училищни условия – в действителност механизмите често се конкурират и
        съотношението на продуктите зависи от температурата, разтворителя и концентрациите. Правило за запомняне: обемист субстрат и силна
        основа с нагряване → елиминиране; достъпен въглерод и добър нуклеофил → SN2; стабилен карбокатион и слаб нуклеофил → SN1.
      </p>
    </div>
  );
}
