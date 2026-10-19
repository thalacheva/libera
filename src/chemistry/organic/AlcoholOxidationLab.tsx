import { Fragment, useState } from 'react';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { Molecule } from '../StructuralFormula';

type Stage = { name: string; smiles: string; cls: 'алкохол' | 'алдехид' | 'кетон' | 'карбоксилна киселина' };
type Alcohol = { kind: 'първичен' | 'вторичен' | 'третичен'; chain: Stage[]; note: string };

const ALCOHOLS: Alcohol[] = [
  {
    kind: 'първичен',
    chain: [
      { name: 'метанол', smiles: 'CO', cls: 'алкохол' },
      { name: 'метанал', smiles: 'C=O', cls: 'алдехид' },
      { name: 'метанова киселина', smiles: 'OC=O', cls: 'карбоксилна киселина' },
    ],
    note: 'Метановата киселина се окислява още по-нататък – до CO₂ и вода. Затова метанолът е толкова отровен: в организма той се превръща в метанал и метанова киселина.',
  },
  {
    kind: 'първичен',
    chain: [
      { name: 'етанол', smiles: 'CCO', cls: 'алкохол' },
      { name: 'етанал', smiles: 'CC=O', cls: 'алдехид' },
      { name: 'етанова киселина', smiles: 'CC(=O)O', cls: 'карбоксилна киселина' },
    ],
    note: 'Така виното на въздух прокисва до оцет – там окислителят е кислородът, а катализаторите са ензими на оцетнокисели бактерии.',
  },
  {
    kind: 'първичен',
    chain: [
      { name: 'пропан-1-ол', smiles: 'CCCO', cls: 'алкохол' },
      { name: 'пропанал', smiles: 'CCC=O', cls: 'алдехид' },
      { name: 'пропанова киселина', smiles: 'CCC(=O)O', cls: 'карбоксилна киселина' },
    ],
    note: 'Ако искаме да спрем при алдехида, го дестилираме веднага щом се получи – той кипи при по-ниска температура от алкохола.',
  },
  {
    kind: 'вторичен',
    chain: [
      { name: 'пропан-2-ол', smiles: 'CC(O)C', cls: 'алкохол' },
      { name: 'пропанон (ацетон)', smiles: 'CC(=O)C', cls: 'кетон' },
    ],
    note: 'Кетонът не се окислява по-нататък при тези условия – за това трябва да се разкъса C−C връзка.',
  },
  {
    kind: 'вторичен',
    chain: [
      { name: 'бутан-2-ол', smiles: 'CCC(O)C', cls: 'алкохол' },
      { name: 'бутанон', smiles: 'CCC(=O)C', cls: 'кетон' },
    ],
    note: 'Вторичните алкохоли дават кетони.',
  },
  {
    kind: 'третичен',
    chain: [{ name: '2-метилпропан-2-ол', smiles: 'CC(C)(C)O', cls: 'алкохол' }],
    note: 'При въглерода с OH групата няма водороден атом, затова при тези условия третичният алкохол не се окислява – разтворът остава оранжев.',
  },
];

/** Епруветка: оранжев дихромат или зелени Cr³⁺ йони. */
function Tube({ green }: { green: boolean }) {
  return (
    <svg viewBox="0 0 60 120" width={48} height={96} role="img" aria-label={green ? 'зелен разтвор' : 'оранжев разтвор'}>
      <path d="M 15 8 L 15 95 A 15 15 0 0 0 45 95 L 45 8" className="fill-white/40 dark:fill-gray-700/40 stroke-gray-500" strokeWidth="2" />
      <path d="M 16 50 L 16 95 A 14 14 0 0 0 44 95 L 44 50 Z" className={green ? 'fill-emerald-500' : 'fill-orange-500'} opacity={0.85} />
    </svg>
  );
}

/** Окисление на алкохоли с подкиселен K₂Cr₂O₇: първичен → алдехид → киселина, вторичен → кетон, третичен – не. */
export default function AlcoholOxidationLab() {
  const [ai, setAi] = useState(1);
  const [step, setStep] = useState(0);
  const a = ALCOHOLS[ai];
  const maxStep = a.chain.length - 1;
  const current = a.chain[step];
  const reacted = step > 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {ALCOHOLS.map((x, i) => (
          <DiagramButton
            key={x.chain[0].name}
            active={i === ai}
            onClick={() => {
              setAi(i);
              setStep(0);
            }}
          >
            {x.chain[0].name}
          </DiagramButton>
        ))}
      </Buttons>

      <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-3 my-4">
        {a.chain.slice(0, step + 1).map((s, i) => (
          <Fragment key={s.name}>
            {i > 0 && <span className="text-2xl text-gray-400 px-1">→</span>}
            <figure className={`flex flex-col items-center px-2 py-1 rounded-lg ${i === step ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
              <Molecule smiles={s.smiles} mode="semi" bond={38} title={s.name} />
              <figcaption className="text-xs sm:text-sm text-center mt-1">
                <span className="font-semibold">{s.name}</span>
                <br />
                <span className="text-gray-500 dark:text-gray-400">{s.cls}</span>
              </figcaption>
            </figure>
          </Fragment>
        ))}
      </div>

      <div className="flex flex-wrap justify-center items-center gap-4">
        <Tube green={reacted} />
        <div className="flex flex-col gap-2">
          <DiagramButton onClick={() => setStep(s => Math.min(s + 1, maxStep))}>+ K₂Cr₂O₇ / H⁺, затопляне</DiagramButton>
          <DiagramButton onClick={() => setStep(0)}>отначало</DiagramButton>
        </div>
      </div>

      <Note tone={step < maxStep ? 'blue' : a.kind === 'третичен' ? 'rose' : 'emerald'}>
        {a.kind === 'третичен'
          ? 'Третичен алкохол – окисление не протича.'
          : step === 0
            ? `${a.kind[0].toUpperCase() + a.kind.slice(1)} алкохол. Добави окислителя.`
            : step < maxStep
              ? `Получи се ${current.cls} – ${current.name}. Той може да се окисли още.`
              : `Получи се ${current.cls} – ${current.name}. По-нататък окислението при тези условия спира.`}
      </Note>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">{step === maxStep ? a.note : ''}</p>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
        Проба за алдехид (реакция на сребърното огледало):{' '}
        <strong>{current.cls === 'алдехид' ? 'положителна – по стените се отлага сребро' : 'отрицателна'}</strong>
        {current.name === 'метанова киселина' ? ' (изключение: метановата киселина също дава огледало – тя има и алдехидна група!)' : ''}
      </p>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Окислителят откъсва водородния атом от OH групата и водороден атом от въглерода, който носи OH. Затова решаващо е колко H атома
        има при този въглерод: два (първичен) – окисление до алдехид и после до киселина; един (вторичен) – до кетон; нула (третичен) – не
        се окислява. Оранжевите дихроматни йони <span className="whitespace-nowrap">Cr₂O₇²⁻</span> се редуцират до зелени Cr³⁺ – на тази
        промяна на цвета се основаваха старите дрегери.
      </p>
    </div>
  );
}
