import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Stage = { f: string; M: number };
type Step = { what: string; cond: string; eq: string };
type Process = {
  name: string;
  /** Суровината: формула, моларна маса и колко мола от целевия атом (S или N) има в мол от нея */
  raws: { f: string; M: number; k: number }[];
  stages: Stage[];
  steps: Step[];
  product: string;
};

const PROCESSES: Process[] = [
  {
    name: 'сярна киселина (контактен метод)',
    raws: [
      { f: 'S', M: 32, k: 1 },
      { f: 'FeS₂', M: 120, k: 2 },
    ],
    stages: [
      { f: 'SO₂', M: 64 },
      { f: 'SO₃', M: 80 },
      { f: 'H₂SO₄', M: 98 },
    ],
    steps: [
      { what: 'изгаряне', cond: 'във въздух', eq: 'S + O₂ → SO₂  или  4FeS₂ + 11O₂ → 2Fe₂O₃ + 8SO₂' },
      { what: 'окисление', cond: 'V₂O₅, 450 °C', eq: '2SO₂ + O₂ ⇌ 2SO₃' },
      { what: 'абсорбция', cond: 'в конц. H₂SO₄', eq: 'SO₃ + H₂SO₄ → H₂S₂O₇;  H₂S₂O₇ + H₂O → 2H₂SO₄' },
    ],
    product: 'H₂SO₄',
  },
  {
    name: 'азотна киселина (метод на Оствалд)',
    raws: [{ f: 'NH₃', M: 17, k: 1 }],
    stages: [
      { f: 'NO', M: 30 },
      { f: 'NO₂', M: 46 },
      { f: 'HNO₃', M: 63 },
    ],
    steps: [
      { what: 'окисление', cond: 'Pt–Rh, ~900 °C', eq: '4NH₃ + 5O₂ → 4NO + 6H₂O' },
      { what: 'окисление', cond: 'с въздух', eq: '2NO + O₂ → 2NO₂' },
      { what: 'абсорбция', cond: 'във вода', eq: '4NO₂ + O₂ + 2H₂O → 4HNO₃' },
    ],
    product: 'HNO₃',
  },
];

const fmt = (v: number) => v.toFixed(2).replace('.', ',');
const BOX_W = 80;
const BOX_X = [8, 132, 256, 380];

/** Верига от етапи на промишлен процес: добивът на всеки етап и масата на продукта. */
export default function IndustrialProcessLab() {
  const [pi, setPi] = useState(0);
  const [ri, setRi] = useState(0);
  const [mass, setMass] = useState(1);
  const [eta, setEta] = useState([98, 96, 99]);
  const p = PROCESSES[pi];
  const raw = p.raws[Math.min(ri, p.raws.length - 1)];

  // Молове от целевия атом (в тонове → киломолове, отношенията са същите)
  const n = (mass * raw.k) / raw.M;
  let factor = 1;
  const masses = p.stages.map((s, i) => {
    factor *= eta[i] / 100;
    return n * s.M * factor;
  });
  const theory = n * p.stages[2].M;
  const setEtaAt = (i: number) => (v: number) => setEta(prev => prev.map((x, j) => (j === i ? v : x)));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PROCESSES.map((x, i) => (
          <DiagramButton
            key={x.name}
            active={i === pi}
            onClick={() => {
              setPi(i);
              setRi(0);
            }}
          >
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      {p.raws.length > 1 && (
        <Buttons>
          {p.raws.map((r, i) => (
            <DiagramButton key={r.f} active={i === ri} onClick={() => setRi(i)}>
              суровина {r.f}
            </DiagramButton>
          ))}
        </Buttons>
      )}

      <LabSvg viewBox="0 0 480 170" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {[raw, ...p.stages].map((s, i) => (
          <g key={s.f}>
            <rect
              x={BOX_X[i]}
              y={70}
              width={BOX_W}
              height={44}
              rx={8}
              className={i === 3 ? 'fill-amber-100 stroke-amber-500 dark:fill-amber-900/40' : 'fill-gray-100 stroke-gray-400 dark:fill-gray-700'}
              strokeWidth="1.5"
            />
            <text x={BOX_X[i] + BOX_W / 2} y={98} fontSize="16" fontWeight="700" textAnchor="middle" fill="currentColor">
              {s.f}
            </text>
            <text x={BOX_X[i] + BOX_W / 2} y={134} fontSize="12" textAnchor="middle" fill="currentColor">
              {fmt(i === 0 ? mass : masses[i - 1])} t
            </text>
          </g>
        ))}
        {p.steps.map((st, i) => {
          const x1 = BOX_X[i] + BOX_W;
          const x2 = BOX_X[i + 1];
          const cx = (x1 + x2) / 2;
          return (
            <g key={i}>
              <line x1={x1 + 3} x2={x2 - 6} y1={92} y2={92} className="stroke-gray-500" strokeWidth="2" />
              <path d={`M ${x2 - 3} 92 L ${x2 - 10} 87 L ${x2 - 10} 97 Z`} className="fill-gray-500" />
              <text x={cx} y={30} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
                {st.what}
              </text>
              <text x={cx} y={44} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
                {st.cond}
              </text>
              <text x={cx} y={60} fontSize="11" fontWeight="600" textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">
                η = {eta[i]}%
              </text>
            </g>
          );
        })}
        <text x={240} y={160} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          под всяка кутия – масата на веществото след съответния етап
        </text>
      </LabSvg>

      <ul className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-0.5 max-w-xl mx-auto">
        {p.steps.map((st, i) => (
          <li key={i}>
            {i + 1}. {st.eq}
          </li>
        ))}
      </ul>

      <Sliders>
        <Slider label={`${raw.f}, t`} value={mass} onChange={setMass} min={0.5} max={10} step={0.5} tone="amber" />
        {p.steps.map((_, i) => (
          <Slider key={i} label={`η${i + 1}, %`} value={eta[i]} onChange={setEtaAt(i)} min={70} max={100} step={1} tone="blue" />
        ))}
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: `теоретично ${p.product}:`, value: `${fmt(theory)} t`, tone: 'gray' },
            { label: 'получено:', value: `${fmt(masses[2])} t`, tone: 'amber' },
            { label: 'общ добив:', value: `${fmt(factor * 100)}%`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone={factor > 0.9 ? 'emerald' : 'amber'}>
        {`Общият добив е произведение от добивите на етапите: ${eta.map(e => fmt(e / 100)).join(' · ')} = ${fmt(factor)}. От ${raw.k === 2 ? 'мол FeS₂ се получават 2 мола' : `мол ${raw.f} се получава 1 мол`} ${p.product}${pi === 0 ? ' – колкото атома сяра.' : ' – колкото атома азот.'}`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Масите са в тонове, но отношенията са същите като в грамове: тонът е хиляда килограма, а киломолът – хиляда мола. В съвременните
        заводи добивът на всеки етап обикновено е над 90%, а непревърнатият газ се връща обратно в процеса.
      </p>
    </div>
  );
}
