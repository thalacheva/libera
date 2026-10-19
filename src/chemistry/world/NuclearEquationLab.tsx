import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Tex } from '~/MathText';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { byZ } from '../elements';

type Mode = 'α' | 'β⁻' | 'β⁺' | 'ЕЗ' | 'γ';
type Nuclide = { s: string; A: number; Z: number; mode: Mode; half: string; use: string; meta?: boolean };

// Реалният основен вид разпадане и периодът на полуразпадане (по NUBASE/NNDC, закръглени)
const NUCLIDES: Nuclide[] = [
  { s: 'H', A: 3, Z: 1, mode: 'β⁻', half: '12,3 години', use: 'тритий – светещи стрелки, термоядрено гориво' },
  { s: 'C', A: 14, Z: 6, mode: 'β⁻', half: '5730 години', use: 'радиовъглеродно датиране' },
  { s: 'F', A: 18, Z: 9, mode: 'β⁺', half: '109,8 минути', use: 'ПЕТ скенер (FDG)' },
  { s: 'Na', A: 22, Z: 11, mode: 'β⁺', half: '2,6 години', use: 'източник на позитрони в лабораториите' },
  { s: 'P', A: 32, Z: 15, mode: 'β⁻', half: '14,3 дни', use: 'белязан фосфор в биохимията' },
  { s: 'K', A: 40, Z: 19, mode: 'β⁻', half: '1,25 · 10⁹ години', use: 'в бананите и в тялото ни; K-Ar датиране (11% – ЕЗ до ⁴⁰Ar)' },
  { s: 'Fe', A: 55, Z: 26, mode: 'ЕЗ', half: '2,7 години', use: 'източник на рентгенови лъчи' },
  { s: 'Co', A: 60, Z: 27, mode: 'β⁻', half: '5,27 години', use: 'облъчване на тумори и стерилизация' },
  { s: 'Sr', A: 90, Z: 38, mode: 'β⁻', half: '28,8 години', use: 'продукт на деленето – натрупва се в костите' },
  { s: 'Tc', A: 99, Z: 43, mode: 'γ', half: '6,01 часа', use: 'най-използваният изотоп в нуклеарната медицина', meta: true },
  { s: 'I', A: 131, Z: 53, mode: 'β⁻', half: '8,02 дни', use: 'лечение на щитовидната жлеза; изхвърлен при аварии' },
  { s: 'Cs', A: 137, Z: 55, mode: 'β⁻', half: '30,1 години', use: 'основният дълготраен замърсител след Чернобил' },
  { s: 'Po', A: 210, Z: 84, mode: 'α', half: '138 дни', use: 'открит от Мария и Пиер Кюри (1898)' },
  { s: 'Ra', A: 226, Z: 88, mode: 'α', half: '1600 години', use: 'открит от Кюри; дава радон' },
  { s: 'U', A: 238, Z: 92, mode: 'α', half: '4,47 · 10⁹ години', use: 'начало на уран-радиевия ред' },
  { s: 'Pu', A: 239, Z: 94, mode: 'α', half: '24 100 години', use: 'ядрено гориво' },
  { s: 'Am', A: 241, Z: 95, mode: 'α', half: '432 години', use: 'в димните датчици' },
];

const MODES: Mode[] = ['α', 'β⁻', 'β⁺', 'ЕЗ', 'γ'];
const MODE_NAME: Record<Mode, string> = { α: 'α-разпадане', 'β⁻': 'β⁻-разпадане', 'β⁺': 'β⁺-разпадане', ЕЗ: 'електронно захващане', γ: 'γ-излъчване' };

/** Масово число и заряд на продукта при даден вид разпадане. */
function decayProduct(A: number, Z: number, mode: Mode) {
  if (mode === 'α') return { A: A - 4, Z: Z - 2 };
  if (mode === 'β⁻') return { A, Z: Z + 1 };
  if (mode === 'β⁺' || mode === 'ЕЗ') return { A, Z: Z - 1 };
  return { A, Z };
}

const nuc = (A: number, Z: number, s: string, m = '') => `{}^{${A}${m}}_{${Z}}\\mathrm{${s}}`;

function equation(n: Nuclide, mode: Mode) {
  const p = decayProduct(n.A, n.Z, mode);
  const ps = byZ(p.Z).symbol;
  const left = nuc(n.A, n.Z, n.s, n.meta ? '\\mathrm{m}' : '');
  const right = nuc(p.A, p.Z, ps);
  if (mode === 'α') return `${left} \\to ${right} + {}^{4}_{2}\\mathrm{He}`;
  if (mode === 'β⁻') return `${left} \\to ${right} + {}^{\\ \\,0}_{-1}e + \\bar{\\nu}_e`;
  if (mode === 'β⁺') return `${left} \\to ${right} + {}^{\\ \\,0}_{+1}e + \\nu_e`;
  if (mode === 'ЕЗ') return `${left} + {}^{\\ \\,0}_{-1}e \\to ${right} + \\nu_e`;
  return `${left} \\to ${right} + \\gamma`;
}

// Мини карта на нуклидите: N хоризонтално, Z вертикално (нагоре)
const CELL = 30;
const GX = 70;
const GY = 18;
const R = 3; // клетки от всяка страна на изходното ядро

export default function NuclearEquationLab() {
  const [ni, setNi] = useState(1);
  const [mode, setMode] = useState<Mode>('β⁻');
  const n = NUCLIDES[ni];
  const p = decayProduct(n.A, n.Z, mode);
  const N0 = n.A - n.Z;
  const pN = p.A - p.Z;
  const col = (N: number) => GX + (N - (N0 - R)) * CELL;
  const row = (Z: number) => GY + (n.Z + R - Z) * CELL;
  const center = (N: number, Z: number) => ({ x: col(N) + CELL / 2, y: row(Z) + CELL / 2 });
  const from = center(N0, n.Z);
  const to = center(pN, p.Z);
  // Стрелката спира до клетката на продукта, за да не закрива надписа ѝ
  const len = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const tail = { x: from.x + ((to.x - from.x) / len) * 10, y: from.y + ((to.y - from.y) / len) * 10 };
  const tip = { x: to.x - ((to.x - from.x) / len) * 13, y: to.y - ((to.y - from.y) / len) * 13 };
  const product = byZ(p.Z);
  const real = mode === n.mode;
  const range = Array.from({ length: 2 * R + 1 }, (_, i) => i - R);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="flex flex-wrap justify-center gap-1.5">
        {NUCLIDES.map((x, i) => (
          <DiagramButton key={x.s + x.A} active={i === ni} onClick={() => setNi(i)}>
            {`${x.s}-${x.A}${x.meta ? 'm' : ''}`}
          </DiagramButton>
        ))}
      </div>
      <Buttons>
        {MODES.map(m => (
          <DiagramButton key={m} active={m === mode} onClick={() => setMode(m)}>
            {MODE_NAME[m]}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 264" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <defs>
          <marker id="nuc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="fill-amber-600 dark:fill-amber-400" />
          </marker>
        </defs>
        {range.map(dz =>
          range.map(dn => {
            const N = N0 + dn;
            const Z = n.Z + dz;
            if (Z < 1 || N < 0) return null;
            const isFrom = dn === 0 && dz === 0;
            const isTo = N === pN && Z === p.Z;
            return (
              <g key={`${dn},${dz}`}>
                <rect
                  x={col(N) + 1}
                  y={row(Z) + 1}
                  width={CELL - 2}
                  height={CELL - 2}
                  rx={3}
                  className={isFrom ? 'fill-sky-200 dark:fill-sky-800' : isTo ? 'fill-amber-200 dark:fill-amber-700' : 'fill-gray-100 dark:fill-gray-700'}
                />
                <text x={col(N) + CELL / 2} y={row(Z) + CELL / 2 + 4} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-300">
                  {byZ(Z).symbol}
                  {Z + N}
                </text>
              </g>
            );
          }),
        )}
        {/* оси */}
        {range.map(d => (
          <g key={`ax${d}`}>
            <text x={col(N0 + d) + CELL / 2} y={row(n.Z - R) + CELL + 13} fontSize="10" textAnchor="middle" className="fill-gray-500">
              {N0 + d}
            </text>
            {n.Z + d >= 1 && (
              <text x={GX - 6} y={row(n.Z + d) + CELL / 2 + 4} fontSize="10" textAnchor="end" className="fill-gray-500">
                {n.Z + d}
              </text>
            )}
          </g>
        ))}
        <text x={col(N0) + CELL / 2} y={row(n.Z - R) + CELL + 27} fontSize="11" textAnchor="middle" className="fill-current">
          N (неутрони) →
        </text>
        <text x={18} y={row(n.Z) + CELL / 2} fontSize="11" textAnchor="middle" className="fill-current" transform={`rotate(-90 18 ${row(n.Z) + CELL / 2})`}>
          Z (протони) →
        </text>
        {mode !== 'γ' && <line x1={tail.x} y1={tail.y} x2={tip.x} y2={tip.y} className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="3" markerEnd="url(#nuc-arrow)" />}
        {mode === 'γ' && <circle cx={from.x} cy={from.y} r={CELL / 2 + 3} fill="none" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2.5" strokeDasharray="4 3" />}

        {/* легенда */}
        <g fontSize="11" className="fill-current">
          <text x={300} y={34} fontWeight="700">
            Посоки на картата
          </text>
          <text x={300} y={56}>α: Z − 2, N − 2 (надолу-наляво)</text>
          <text x={300} y={76}>β⁻: Z + 1, N − 1</text>
          <text x={300} y={96}>β⁺ и ЕЗ: Z − 1, N + 1</text>
          <text x={300} y={116}>γ: остава на място</text>
          <rect x={300} y={140} width={14} height={14} rx={3} className="fill-sky-200 dark:fill-sky-800" />
          <text x={320} y={151}>изходно ядро</text>
          <rect x={300} y={162} width={14} height={14} rx={3} className="fill-amber-200 dark:fill-amber-700" />
          <text x={320} y={173}>продукт</text>
          <text x={300} y={200} className="fill-gray-500 dark:fill-gray-400">
            По диагонала A = const
          </text>
          <text x={300} y={216} className="fill-gray-500 dark:fill-gray-400">
            (β-разпаданията вървят по нея)
          </text>
        </g>
      </LabSvg>

      <div className="text-center my-3 overflow-x-auto">
        <Tex block>{equation(n, mode)}</Tex>
      </div>
      <Readout
        items={[
          { label: 'продукт:', value: `${product.name} (${product.symbol}), A = ${p.A}, Z = ${p.Z}, N = ${pN}`, tone: 'amber' },
          { label: 'период на полуразпадане:', value: n.half },
        ]}
      />
      <Note tone={real ? 'emerald' : 'amber'}>
        {real
          ? `Точно така се разпада ${n.s}-${n.A}${n.meta ? 'm' : ''}: ${n.use}.`
          : `Уравнението е изравнено, но ${n.s}-${n.A}${n.meta ? 'm' : ''} всъщност се разпада чрез ${MODE_NAME[n.mode]}. ${n.use[0].toUpperCase()}${n.use.slice(1)}.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Масовото число и зарядът се запазват: горните индекси вляво и вдясно имат еднакъв сбор, долните – също. Затова продуктът
        се намира без таблици – само от Z разбираме кой е елементът. Ядра с излишък от неутрони (над стабилните) търпят β⁻, с недостиг –
        β⁺ или електронно захващане, а тежките ядра – най-често α.
      </p>
    </div>
  );
}
