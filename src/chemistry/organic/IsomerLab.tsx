import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Tex } from '~/MathText';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { MoleculeGroup } from '../StructuralFormula';
import { type Mol, buildMolecule, moleculeBox, parseSmiles } from '../smiles';
import { type Chain, chainSmiles, iupacName } from './hydrocarbonNames';

type Isomer = { name: string; mol: Mol; tag: string; bp: number };

const m = (pos: number) => ({ pos, kind: 1 as const });
const e = (pos: number) => ({ pos, kind: 2 as const });
const alkane = (n: number, subs: Chain['subs'], tag: string, bp: number): Isomer => {
  const c: Chain = { n, bond: 1, bondPos: 0, subs };
  return { name: iupacName(c), mol: buildMolecule(chainSmiles(c).smiles), tag, bp };
};

/** But-2-ene с ръчно зададени координати – помощникът не рисува цис-транс. */
function but2ene(cis: boolean): Mol {
  const mol = parseSmiles('CC=CC');
  const h = Math.sqrt(3) / 2;
  const pts = cis
    ? [[-0.5, h], [0, 0], [1, 0], [1.5, h]]
    : [[-0.5, h], [0, 0], [1, 0], [1.5, -h]];
  pts.forEach(([x, y], i) => Object.assign(mol.atoms[i], { x, y }));
  return mol;
}

// Температури на кипене в °C (справочни данни, закръглени до 0,1 °C)
const SETS: { formula: string; tex: string; note: string; items: Isomer[] }[] = [
  {
    formula: 'C4H10',
    tex: '\\mathrm{C_4H_{10}}',
    note: 'Два изомера – с права и с разклонена верига (верижна изомерия).',
    items: [alkane(4, [], 'права верига', -0.5), alkane(3, [m(2)], 'разклонена', -11.7)],
  },
  {
    formula: 'C5H12',
    tex: '\\mathrm{C_5H_{12}}',
    note: 'Колкото по-разклонена е молекулата, толкова по-ниска е температурата на кипене.',
    items: [alkane(5, [], 'права верига', 36.1), alkane(4, [m(2)], 'разклонена', 27.8), alkane(3, [m(2), m(2)], 'силно разклонена', 9.5)],
  },
  {
    formula: 'C6H14',
    tex: '\\mathrm{C_6H_{14}}',
    note: 'Пет изомера. 2- и 3-метилпентан се различават само по мястото на разклонението.',
    items: [
      alkane(6, [], 'права верига', 68.7),
      alkane(5, [m(2)], 'разклонена', 60.3),
      alkane(5, [m(3)], 'разклонена', 63.3),
      alkane(4, [m(2), m(3)], 'две разклонения', 58.0),
      alkane(4, [m(2), m(2)], 'две разклонения', 49.7),
    ],
  },
  {
    formula: 'C7H16',
    tex: '\\mathrm{C_7H_{16}}',
    note: 'Девет изомера. С броя на въглеродните атоми броят на изомерите расте много бързо: C₁₀H₂₂ има 75, а C₂₀H₄₂ – над 366 000.',
    items: [
      alkane(7, [], 'права верига', 98.4),
      alkane(6, [m(2)], 'разклонена', 90.0),
      alkane(6, [m(3)], 'разклонена', 92.0),
      alkane(5, [e(3)], 'разклонена', 93.5),
      alkane(5, [m(2), m(3)], 'две разклонения', 89.8),
      alkane(5, [m(3), m(3)], 'две разклонения', 86.1),
      alkane(5, [m(2), m(4)], 'две разклонения', 80.5),
      alkane(5, [m(2), m(2)], 'две разклонения', 79.2),
      alkane(4, [m(2), m(2), m(3)], 'три разклонения', 80.9),
    ],
  },
  {
    formula: 'C4H8',
    tex: '\\mathrm{C_4H_8}',
    note: 'Тук има всички видове изомерия: по мястото на двойната връзка, по веригата, цис-транс и с пръстен (циклоалканите имат същата обща формула като алкените).',
    items: [
      { name: 'бут-1-ен', mol: buildMolecule('C=CCC'), tag: 'двойна връзка при C1', bp: -6.3 },
      { name: 'цис-бут-2-ен', mol: but2ene(true), tag: 'цис', bp: 3.7 },
      { name: 'транс-бут-2-ен', mol: but2ene(false), tag: 'транс', bp: 0.9 },
      { name: '2-метилпропен', mol: buildMolecule('C=C(C)C'), tag: 'разклонена', bp: -6.9 },
      { name: 'циклобутан', mol: buildMolecule('C1CCC1', { rotate: 45 }), tag: 'пръстен', bp: 12.5 },
      { name: 'метилциклопропан', mol: buildMolecule('CC1CC1'), tag: 'пръстен', bp: 0.7 },
    ],
  },
];

const fmt = (v: number) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(1).replace('.', ',');

/** Малка карта със скелетната формула. */
function MolCard({ item, active, onClick }: { item: Isomer; active: boolean; onClick: () => void }) {
  const bond = 26;
  const box = moleculeBox(item.mol);
  const w = (box.maxX - box.minX) * bond;
  const h = (box.maxY - box.minY) * bond;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center justify-between rounded-lg border p-2 transition-colors ${
        active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/15' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60'
      }`}
    >
      <svg viewBox={`0 0 ${w.toFixed(1)} ${h.toFixed(1)}`} width={w} height={h} className="max-w-full h-auto text-gray-800 dark:text-gray-100" role="img" aria-label={item.name}>
        <MoleculeGroup mol={item.mol} x={-box.minX * bond} y={-box.minY * bond} bond={bond} />
      </svg>
      <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 mt-1">{item.name}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{item.tag}</span>
    </button>
  );
}

/** Всички структурни изомери на няколко формули и температурите им на кипене. */
export default function IsomerLab() {
  const [si, setSi] = useState(1);
  const [sel, setSel] = useState(0);
  const set = SETS[si];
  const items = set.items;
  const cur = items[Math.min(sel, items.length - 1)];

  // Стълбчеста диаграма на температурите на кипене
  const lo = Math.min(0, ...items.map(i => i.bp));
  const hi = Math.max(0, ...items.map(i => i.bp));
  const span = hi - lo || 1;
  const X0 = 150;
  const X1 = 418;
  const sx = (v: number) => X0 + ((v - lo) / span) * (X1 - X0);
  const rowH = 22;
  const H = items.length * rowH + 30;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SETS.map((s, i) => (
          <DiagramButton
            key={s.formula}
            active={i === si}
            onClick={() => {
              setSi(i);
              setSel(0);
            }}
          >
            <Tex>{s.tex}</Tex>
          </DiagramButton>
        ))}
      </Buttons>

      <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-3">
        Изомери: <strong>{items.length}</strong>. Избери изомер, за да го видиш на диаграмата.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
        {items.map((it, i) => (
          <MolCard key={it.name} item={it} active={it === cur} onClick={() => setSel(i)} />
        ))}
      </div>

      <LabSvg viewBox={`0 0 480 ${H}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-4">
        <text x={240} y={14} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">
          Температура на кипене, °C
        </text>
        <line x1={sx(0)} x2={sx(0)} y1={22} y2={H - 4} className="stroke-gray-400" strokeDasharray="3 3" />
        {items.map((it, i) => {
          const y = 26 + i * rowH;
          const a = sx(Math.min(0, it.bp));
          const b = sx(Math.max(0, it.bp));
          const active = it === cur;
          return (
            <g key={it.name} onClick={() => setSel(i)} className="cursor-pointer">
              <text x={X0 - 8} y={y + 14} fontSize="11" textAnchor="end" className={active ? 'fill-blue-600 dark:fill-blue-400' : 'fill-gray-600 dark:fill-gray-300'} fontWeight={active ? 700 : 400}>
                {it.name}
              </text>
              <rect x={a} y={y + 2} width={Math.max(b - a, 1)} height={rowH - 6} rx={3} className={active ? 'fill-blue-500' : 'fill-amber-300 dark:fill-amber-600'} />
              <text x={476} y={y + 14} fontSize="11" textAnchor="end" className="fill-gray-700 dark:fill-gray-200" fontWeight={active ? 700 : 400}>
                {fmt(it.bp)}
              </text>
            </g>
          );
        })}
      </LabSvg>

      <Note tone="blue">
        {cur.name}: кипи при {fmt(cur.bp)} °C.
      </Note>
      <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">{set.note}</p>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Изомерите имат една и съща молекулна формула, но различен строеж – и затова различни свойства. Разклонените молекули са
        по-компактни, допират се по-малка площ и силите на Ван дер Ваалс между тях са по-слаби – кипят по-ниско.
      </p>
    </div>
  );
}
