import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Item = { name: string; symbol: string; mass: number; color: string };

// Предмети: маса на един брой в грамове (приблизително)
const OBJECTS: Item[] = [
  { name: 'винтчета', symbol: '🔩', mass: 2.5, color: '#64748b' },
  { name: 'монети', symbol: '🪙', mass: 4, color: '#d97706' },
  { name: 'зърна ориз', symbol: '🍚', mass: 0.025, color: '#a3a3a3' },
];
// Атоми: моларната маса в g/mol (закръглена както в задачите)
const ATOMS: Item[] = [
  { name: 'въглерод', symbol: 'C', mass: 12, color: '#334155' },
  { name: 'магнезий', symbol: 'Mg', mass: 24, color: '#94a3b8' },
  { name: 'сяра', symbol: 'S', mass: 32, color: '#eab308' },
  { name: 'желязо', symbol: 'Fe', mass: 56, color: '#9a3412' },
  { name: 'мед', symbol: 'Cu', mass: 63.5, color: '#ea580c' },
  { name: 'злато', symbol: 'Au', mass: 197, color: '#ca8a04' },
];

const NA = 6.022e23;
const fmt = (v: number, d = 2) => v.toLocaleString('bg-BG', { maximumFractionDigits: d });
/** Голямо число в научен запис: 1,2 · 10²³. */
function sci(v: number) {
  if (v === 0) return '0';
  const e = Math.floor(Math.log10(v));
  if (e < 6) return fmt(Math.floor(v + 1e-9), 0);
  const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const exp = [...String(e)].map(c => sup[Number(c)]).join('');
  return `${fmt(v / 10 ** e, 2)} · 10${exp}`;
}

// Купчина от топчета върху везната – най-много 45 нарисувани
function pile(count: number) {
  const shown = Math.min(count, 45);
  const pts: { x: number; y: number }[] = [];
  let row = 0;
  let left = shown;
  while (left > 0) {
    const inRow = Math.min(left, 9 - row);
    for (let k = 0; k < inRow; k++) pts.push({ x: 120 + (k - (inRow - 1) / 2) * 17, y: 170 - row * 15 });
    left -= inRow;
    row++;
  }
  return pts;
}

// Стълбове: масата на 1 mol от всеки елемент
const BAR = { left: 268, bottom: 178, width: 30, gap: 4, max: 128 };

/** Броене чрез претегляне: винтчета, монети, ориз – и атоми. */
export default function CountingByWeighingLab() {
  const [mode, setMode] = useState<'objects' | 'atoms'>('objects');
  const [oi, setOi] = useState(0);
  const [ai, setAi] = useState(0);
  const [m, setM] = useState(100);

  const atoms = mode === 'atoms';
  const item = atoms ? ATOMS[ai] : OBJECTS[oi];
  const n = m / item.mass;
  const count = atoms ? n * NA : Math.floor(n + 1e-9);
  // В режим „атоми“ всяко топче е 0,1 mol
  const balls = pile(atoms ? Math.round(n * 10) : count);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={!atoms} onClick={() => setMode('objects')}>
          предмети
        </DiagramButton>
        <DiagramButton active={atoms} onClick={() => setMode('atoms')}>
          атоми
        </DiagramButton>
      </Buttons>
      <Buttons>
        {(atoms ? ATOMS : OBJECTS).map((it, i) => (
          <DiagramButton key={it.name} active={i === (atoms ? ai : oi)} onClick={() => (atoms ? setAi(i) : setOi(i))}>
            {atoms ? `${it.symbol} – ${it.name}` : `${it.symbol} ${it.name}`}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 240" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* Кантар */}
        {balls.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={7.5} fill={item.color} className="stroke-white dark:stroke-gray-800" strokeWidth="1.5" />
        ))}
        <rect x={30} y={178} width={180} height={10} rx={3} className="fill-gray-400 dark:fill-gray-500" />
        <rect x={60} y={188} width={120} height={30} rx={4} className="fill-gray-700 dark:fill-gray-900" />
        <text x={120} y={208} fontSize="15" fontFamily="ui-monospace, monospace" textAnchor="middle" className="fill-emerald-400">
          {`${fmt(m, 1)} g`}
        </text>
        <text x={120} y={234} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {atoms ? 'всяко топче ≈ 0,1 mol' : count > 45 ? `нарисувани са 45 от ${sci(count)}` : ''}
        </text>

        {/* Масата на 1 mol (или на 1 брой) от всеки вид */}
        <text x={BAR.left - 4} y={16} fontSize="12" fontWeight="600" fill="currentColor">
          {atoms ? 'Маса на 1 mol (6,02 · 10²³ атома)' : 'Маса на един брой'}
        </text>
        {(atoms ? ATOMS : OBJECTS).map((it, i) => {
          const list = atoms ? ATOMS : OBJECTS;
          const maxMass = Math.max(...list.map(x => x.mass));
          const h = Math.max(3, (it.mass / maxMass) * BAR.max);
          const w = atoms ? BAR.width : 54;
          const x = BAR.left + i * (w + (atoms ? BAR.gap : 14));
          const active = i === (atoms ? ai : oi);
          return (
            <g key={it.name}>
              <rect x={x} y={BAR.bottom - h} width={w} height={h} rx={3} fill={it.color} opacity={active ? 1 : 0.45} />
              <text x={x + w / 2} y={BAR.bottom - h - 5} fontSize="11" textAnchor="middle" fill="currentColor">
                {`${fmt(it.mass, 3)} g`}
              </text>
              <text x={x + w / 2} y={BAR.bottom + 16} fontSize="12" fontWeight={active ? 700 : 500} textAnchor="middle" fill="currentColor">
                {it.symbol}
              </text>
            </g>
          );
        })}
      </LabSvg>

      <Sliders>
        <Slider label="m, g" value={m} onChange={setM} min={0} max={atoms ? 400 : 500} step={atoms ? 1 : 5} tone="emerald" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={
            atoms
              ? [
                  { label: 'n = m / M =', value: `${fmt(m, 1)} : ${fmt(item.mass, 1)} = ${fmt(n, 3)} mol`, tone: 'emerald' },
                  { label: 'N = n · Nₐ ≈', value: `${sci(count)} атома`, tone: 'violet' },
                ]
              : [
                  { label: 'един брой:', value: `${fmt(item.mass, 3)} g` },
                  { label: 'брой =', value: `${fmt(m, 1)} : ${fmt(item.mass, 3)} ≈ ${sci(count)}`, tone: 'emerald' },
                ]
          }
        />
      </div>
      {atoms && n > 0 && Math.abs(n - Math.round(n)) < 1e-9 && (
        <Note tone="emerald">{`Точно ${fmt(n, 0)} mol – ${sci(count)} атома ${item.name}.`}</Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 В магазина никой не брои винтчетата едно по едно – претеглят ги и делят на масата на едно. Химиците правят същото с атомите: 12 g
        въглерод, 24 g магнезий и 197 g злато съдържат еднакъв брой атоми – един мол. Атомът на златото е около 16 пъти по-тежък от този на
        въглерода, затова и молът злато е 16 пъти по-тежък.
      </p>
    </div>
  );
}
