import { useState } from 'react';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import LabSvg from '~/LabSvg';
import { formulaText, parseFormula } from '../formula';

type Equation = { left: string[]; right: string[] };

const EQUATIONS: Equation[] = [
  { left: ['H2', 'O2'], right: ['H2O'] },
  { left: ['CH4', 'O2'], right: ['CO2', 'H2O'] },
  { left: ['Na', 'H2O'], right: ['NaOH', 'H2'] },
  { left: ['Fe', 'O2'], right: ['Fe2O3'] },
  { left: ['KClO3'], right: ['KCl', 'O2'] },
  { left: ['Al', 'HCl'], right: ['AlCl3', 'H2'] },
  { left: ['Fe2O3', 'CO'], right: ['Fe', 'CO2'] },
  { left: ['C3H8', 'O2'], right: ['CO2', 'H2O'] },
  { left: ['NH3', 'O2'], right: ['NO', 'H2O'] },
  { left: ['C2H6', 'O2'], right: ['CO2', 'H2O'] },
];

const MAX = 12;
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Броят на атомите от всеки елемент от едната страна на уравнението. */
function side(formulas: string[], coefs: number[]) {
  const total = new Map<string, number>();
  formulas.forEach((f, i) => {
    for (const [el, n] of parseFormula(f)) total.set(el, (total.get(el) ?? 0) + n * coefs[i]);
  });
  return total;
}

/** Изравни уравнението: промени коефициентите, докато атомите от всеки елемент станат равни отляво и отдясно. */
export default function BalancerLab() {
  const [eq, setEq] = useState(0);
  const { left, right } = EQUATIONS[eq];
  const all = [...left, ...right];
  const [coefs, setCoefs] = useState<number[]>(() => all.map(() => 1));

  const choose = (i: number) => {
    setEq(i);
    setCoefs([...EQUATIONS[i].left, ...EQUATIONS[i].right].map(() => 1));
  };
  const change = (i: number, d: number) => setCoefs(coefs.map((c, k) => (k === i ? Math.min(MAX, Math.max(1, c + d)) : c)));

  const L = side(left, coefs.slice(0, left.length));
  const R = side(right, coefs.slice(left.length));
  const elements = [...new Set([...L.keys(), ...R.keys()])];
  const balanced = elements.every(el => L.get(el) === R.get(el));
  const common = coefs.reduce(gcd);
  const maxCount = Math.max(...elements.flatMap(el => [L.get(el) ?? 0, R.get(el) ?? 0]));
  const px = Math.min(12, 160 / maxCount);

  const term = (f: string, i: number) => `${coefs[i] > 1 ? coefs[i] : ''}${formulaText(f)}`;
  const equationText = `${left.map((f, i) => term(f, i)).join(' + ')}  →  ${right.map((f, i) => term(f, left.length + i)).join(' + ')}`;

  const ROW = 34;
  const TOP = 74;
  const height = TOP + elements.length * ROW + 6;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {EQUATIONS.map((e, i) => (
          <DiagramButton key={i} active={i === eq} onClick={() => choose(i)}>
            {`${e.left.map(formulaText).join(' + ')} → ${e.right.map(formulaText).join(' + ')}`}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox={`0 0 480 ${height}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <text x={240} y={30} fontSize="20" fontWeight="600" textAnchor="middle" fill="currentColor">
          {equationText}
        </text>
        <text x={225} y={58} fontSize="12" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          атоми отляво
        </text>
        <text x={255} y={58} fontSize="12" className="fill-gray-500 dark:fill-gray-400">
          атоми отдясно
        </text>
        {elements.map((el, r) => {
          const y = TOP + r * ROW;
          const a = L.get(el) ?? 0;
          const b = R.get(el) ?? 0;
          const ok = a === b;
          const fill = ok ? 'fill-emerald-400 dark:fill-emerald-500' : 'fill-rose-400 dark:fill-rose-500';
          return (
            <g key={el}>
              <rect x={222 - a * px} y={y} width={a * px} height={22} rx="3" className={fill} />
              <rect x={258} y={y} width={b * px} height={22} rx="3" className={fill} />
              <text x={240} y={y + 16} fontSize="15" fontWeight="700" textAnchor="middle" fill="currentColor">
                {el}
              </text>
              <text x={222 - a * px - 6} y={y + 16} fontSize="13" textAnchor="end" fill="currentColor">
                {a}
              </text>
              <text x={258 + b * px + 6} y={y + 16} fontSize="13" fill="currentColor">
                {b}
              </text>
              <text x={470} y={y + 16} fontSize="15" textAnchor="end" className={ok ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-rose-600 dark:fill-rose-400'}>
                {ok ? '✓' : '✗'}
              </text>
            </g>
          );
        })}
      </LabSvg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
        {all.map((f, i) => (
          <div key={`${eq}-${i}`} className="flex items-center gap-1">
            {i === left.length && <span className="mx-1 text-lg text-gray-500 dark:text-gray-400">→</span>}
            {i > 0 && i !== left.length && <span className="mx-1 text-gray-500 dark:text-gray-400">+</span>}
            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button onClick={() => change(i, -1)} aria-label={`намали коефициента пред ${f}`} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                −
              </button>
              <span className="w-6 text-center font-mono font-semibold text-amber-700 dark:text-amber-400">{coefs[i]}</span>
              <button onClick={() => change(i, 1)} aria-label={`увеличи коефициента пред ${f}`} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                +
              </button>
            </div>
            <span className="font-medium">{formulaText(f)}</span>
          </div>
        ))}
      </div>
      <Buttons>
        <DiagramButton onClick={() => choose(eq)}>↺ Отначало</DiagramButton>
      </Buttons>
      {balanced && common === 1 && <Note tone="emerald">✓ Уравнението е изравнено – от всеки елемент има толкова атоми отляво, колкото и отдясно.</Note>}
      {balanced && common > 1 && <Note tone="amber">Изравнено е, но всички коефициенти се делят на {common}. Пишем най-малките цели числа – раздели ги на {common}.</Note>}
      {!balanced && <Note tone="rose">Още не е изравнено: {elements.filter(el => L.get(el) !== R.get(el)).join(', ')} – различен брой атоми отляво и отдясно.</Note>}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Променяй само коефициентите пред формулите – индексите в тях определят веществото и не се пипат. Започни с елемента, който се
        среща в най-малко вещества, а водорода и кислорода остави за накрая. Коефициентът 1 не се пише.
      </p>
    </div>
  );
}
