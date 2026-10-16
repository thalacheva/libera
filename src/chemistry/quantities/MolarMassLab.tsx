import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Tex } from '~/MathText';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { bySymbol } from '../elements';
import { atomicMass, formulaTex, formulaText, parseFormula } from '../formula';

const PRESETS = ['H2O', 'CO2', 'H2SO4', 'CaCO3', 'C6H12O6', 'Ca(OH)2', 'Al2(SO4)3', 'CuSO4·5H2O'];
const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#db2777'];
const fmt = (v: number, d: number) => v.toLocaleString('bg-BG', { minimumFractionDigits: 0, maximumFractionDigits: d });

type Row = { symbol: string; count: number; A: number; part: number };

function analyse(input: string, exact: boolean): { rows: Row[]; M: number } | { error: string } {
  // Точката и звездичката също означават „·“ в кристалохидратите
  const f = input.trim().replace(/\./g, '·');
  if (!f) return { error: 'Напиши формула, например H2SO4.' };
  try {
    const rows = [...parseFormula(f)].map(([symbol, count]) => {
      const A = atomicMass(symbol, exact);
      return { symbol, count, A, part: count * A };
    });
    return { rows, M: rows.reduce((s, r) => s + r.part, 0) };
  } catch {
    return { error: 'Не мога да прочета формулата. Символите започват с главна буква (Na, Cl, Ca), а всяка скоба трябва да е затворена.' };
  }
}

/** Моларна маса и масови части на елементите за въведена формула. */
export default function MolarMassLab() {
  const [input, setInput] = useState('H2SO4');
  const [exact, setExact] = useState(false);
  const res = analyse(input, exact);
  const formula = input.trim().replace(/\./g, '·');
  const digits = exact ? 3 : 1;

  // Сегментите на лентата: всеки елемент – с дял, пропорционален на масата му в съединението
  let x = 20;
  const segments =
    'rows' in res
      ? res.rows.map((r, i) => {
          const w = (r.part / res.M) * 440;
          const seg = { ...r, x, w, color: COLORS[i % COLORS.length] };
          x += w;
          return seg;
        })
      : [];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="flex flex-wrap justify-center items-center gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-300" htmlFor="molar-mass-input">
          Формула:
        </label>
        <input
          id="molar-mass-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          className="w-48 px-3 py-1.5 rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800 font-mono text-lg text-center"
        />
      </div>
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p} active={p === formula} onClick={() => setInput(p)}>
            {formulaText(p)}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={!exact} onClick={() => setExact(false)}>
          закръглени маси (Cl = 35,5)
        </DiagramButton>
        <DiagramButton active={exact} onClick={() => setExact(true)}>
          точни маси от таблицата
        </DiagramButton>
      </Buttons>

      {'error' in res ? (
        <Note tone="rose">{res.error}</Note>
      ) : (
        <>
          <div className="text-center text-lg sm:text-xl mt-4 text-gray-900 dark:text-gray-100 overflow-x-auto">
            <Tex>{`M(${formulaTex(formula)}) = ${res.rows.map(r => (r.count > 1 ? `${r.count} \\cdot ${fmt(r.A, digits).replace(',', '{,}')}` : fmt(r.A, digits).replace(',', '{,}'))).join(' + ')} = ${fmt(res.M, digits).replace(',', '{,}')}\\ \\mathrm{g/mol}`}</Tex>
          </div>

          <LabSvg viewBox={`0 0 480 ${96 + Math.floor((segments.length - 1) / 5) * 18}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
            <text x={20} y={16} fontSize="12" className="fill-gray-500 dark:fill-gray-400">
              масови части на елементите
            </text>
            {segments.map(s => (
              <g key={s.symbol}>
                <rect x={s.x} y={24} width={Math.max(s.w, 1)} height={34} fill={s.color} className="stroke-white dark:stroke-gray-800" strokeWidth="1.5" />
                {s.w >= 34 && (
                  <text x={s.x + s.w / 2} y={46} fontSize="13" fontWeight="700" textAnchor="middle" fill="white">
                    {s.symbol}
                  </text>
                )}
              </g>
            ))}
            {segments.map((s, i) => (
              <g key={`l${s.symbol}`}>
                <circle cx={20 + (i % 5) * 88 + 6} cy={80 + Math.floor(i / 5) * 18} r={5} fill={s.color} />
                <text x={20 + (i % 5) * 88 + 15} y={84 + Math.floor(i / 5) * 18} fontSize="12" fill="currentColor">
                  {`${s.symbol} ${fmt((s.part / res.M) * 100, 1)}%`}
                </text>
              </g>
            ))}
          </LabSvg>

          <div className="overflow-x-auto mt-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 text-left">
                  <th className="px-3 py-2 font-semibold">елемент</th>
                  <th className="px-3 py-2 font-semibold">атоми</th>
                  <th className="px-3 py-2 font-semibold">
                    <Tex>{'A_r'}</Tex>
                  </th>
                  <th className="px-3 py-2 font-semibold">маса в 1 mol, g</th>
                  <th className="px-3 py-2 font-semibold">
                    <Tex>{'w,\\ \\%'}</Tex>
                  </th>
                </tr>
              </thead>
              <tbody>
                {res.rows.map(r => (
                  <tr key={r.symbol} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-3 py-1.5">
                      {r.symbol} – {bySymbol.get(r.symbol)?.name.toLowerCase()}
                    </td>
                    <td className="px-3 py-1.5">{r.count}</td>
                    <td className="px-3 py-1.5">{fmt(r.A, digits)}</td>
                    <td className="px-3 py-1.5">{fmt(r.part, digits)}</td>
                    <td className="px-3 py-1.5">{fmt((r.part / res.M) * 100, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Пиши символите с главна и малка буква (Ca, не CA) и индексите като обикновени цифри: Al2(SO4)3. Кристалохидратите се пишат с точка:
        CuSO4.5H2O. Сравни закръглените и точните маси – в задачите разликата обикновено е под 0,5%.
      </p>
    </div>
  );
}
