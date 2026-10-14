import { useState } from 'react';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { MathText } from '~/MathText';

type Decay = 'α' | 'β';
type Link = { s: string; A: number; Z: number; half: string; decay: Decay | null };

// Уран-радиевият ред (основният клон): от ²³⁸U до стабилното ²⁰⁶Pb
const CHAIN: Link[] = [
  { s: 'U', A: 238, Z: 92, half: '4,47 · 10⁹ години', decay: 'α' },
  { s: 'Th', A: 234, Z: 90, half: '24,1 дни', decay: 'β' },
  { s: 'Pa', A: 234, Z: 91, half: '1,17 минути', decay: 'β' },
  { s: 'U', A: 234, Z: 92, half: '2,46 · 10⁵ години', decay: 'α' },
  { s: 'Th', A: 230, Z: 90, half: '7,54 · 10⁴ години', decay: 'α' },
  { s: 'Ra', A: 226, Z: 88, half: '1600 години', decay: 'α' },
  { s: 'Rn', A: 222, Z: 86, half: '3,82 дни', decay: 'α' },
  { s: 'Po', A: 218, Z: 84, half: '3,1 минути', decay: 'α' },
  { s: 'Pb', A: 214, Z: 82, half: '≈ 27 минути', decay: 'β' },
  { s: 'Bi', A: 214, Z: 83, half: '19,9 минути', decay: 'β' },
  { s: 'Po', A: 214, Z: 84, half: '164 микросекунди', decay: 'α' },
  { s: 'Pb', A: 210, Z: 82, half: '22,2 години', decay: 'β' },
  { s: 'Bi', A: 210, Z: 83, half: '5,0 дни', decay: 'β' },
  { s: 'Po', A: 210, Z: 84, half: '138 дни', decay: 'α' },
  { s: 'Pb', A: 206, Z: 82, half: 'стабилно', decay: null },
];

const ELEMENTS: Record<number, string> = { 82: 'Pb', 83: 'Bi', 84: 'Po', 85: 'At', 86: 'Rn', 87: 'Fr', 88: 'Ra', 89: 'Ac', 90: 'Th', 91: 'Pa', 92: 'U' };
const N_MIN = 122;
const N_MAX = 146;
const Z_MIN = 82;
const Z_MAX = 92;
const CELL = 16;
const X0 = 56;
const Y0 = 14;
const cx = (N: number) => X0 + (N - N_MIN) * CELL + CELL / 2;
const cy = (Z: number) => Y0 + (Z_MAX - Z) * CELL + CELL / 2;

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** Масово число с горен индекс: 238 → ²³⁸. */
const sup = (A: number) => String(A).replace(/\d/g, d => SUP[Number(d)]);
const tex = (l: Link) => `{}^{${l.A}}_{${l.Z}}\\mathrm{${l.s}}`;
const equation = (a: Link, b: Link) =>
  a.decay === 'α' ? `$${tex(a)} \\to ${tex(b)} + {}^{4}_{2}\\mathrm{He}$` : `$${tex(a)} \\to ${tex(b)} + {}^{\\;\\,0}_{-1}e + \\bar{\\nu}_e$`;

/** Радиоактивен ред: познай вида на всяко разпадане и проследи пътя по картата N–Z. */
export default function DecayChainLab() {
  const [at, setAt] = useState(0);
  const [miss, setMiss] = useState<Decay | null>(null);
  const [wrong, setWrong] = useState(0);
  const cur = CHAIN[at];
  const done = cur.decay === null;

  const guess = (d: Decay) => {
    if (done) return;
    if (d === cur.decay) {
      setAt(at + 1);
      setMiss(null);
    } else {
      setMiss(d);
      setWrong(wrong + 1);
    }
  };
  const restart = () => {
    setAt(0);
    setMiss(null);
    setWrong(0);
  };

  const path = CHAIN.slice(0, at + 1);
  const alphas = path.slice(0, -1).filter(l => l.decay === 'α').length;
  const betas = path.slice(0, -1).filter(l => l.decay === 'β').length;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 226">
        {/* Мрежата: всяка клетка е едно възможно ядро с Z протона и N неутрона */}
        {Array.from({ length: Z_MAX - Z_MIN + 1 }, (_, i) => Z_MIN + i).map(Z => (
          <g key={Z}>
            {Array.from({ length: N_MAX - N_MIN + 1 }, (_, j) => N_MIN + j).map(N => (
              <rect
                key={N}
                x={cx(N) - CELL / 2}
                y={cy(Z) - CELL / 2}
                width={CELL}
                height={CELL}
                className="fill-transparent stroke-gray-200 dark:stroke-gray-700"
              />
            ))}
            <Label p={{ x: X0 - 6, y: cy(Z) }} size={10} weight={500} anchor="end">
              {`${ELEMENTS[Z]} ${Z}`}
            </Label>
          </g>
        ))}
        {[122, 126, 130, 134, 138, 142, 146].map(N => (
          <Label key={N} p={{ x: cx(N), y: cy(Z_MIN) + 18 }} size={10} weight={500}>
            {String(N)}
          </Label>
        ))}
        <Label p={{ x: cx(N_MAX), y: cy(Z_MIN) + 36 }} size={11} anchor="end">
          брой неутрони N →
        </Label>

        {/* Целта: стабилното олово-206 */}
        <rect x={cx(124) - CELL / 2} y={cy(82) - CELL / 2} width={CELL} height={CELL} className="fill-emerald-500/30 stroke-emerald-500" strokeWidth="2" />
        {/* Изминатият път */}
        {path.slice(1).map((l, i) => {
          const p = path[i];
          return (
            <line
              key={i}
              x1={cx(p.A - p.Z)}
              y1={cy(p.Z)}
              x2={cx(l.A - l.Z)}
              y2={cy(l.Z)}
              className={p.decay === 'α' ? 'stroke-rose-500' : 'stroke-blue-500'}
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
        {path.map((l, i) => (
          <circle key={i} cx={cx(l.A - l.Z)} cy={cy(l.Z)} r={i === at ? 6.5 : 4} className={i === at ? 'fill-amber-500' : 'fill-gray-500 dark:fill-gray-300'} />
        ))}
        <Label p={{ x: cx(cur.A - cur.Z) + (cur.A - cur.Z > 140 ? -10 : 10), y: cy(cur.Z) - 12 }} size={12} tone="amber" anchor={cur.A - cur.Z > 140 ? 'end' : 'start'}>
          {`${sup(cur.A)}${cur.s}`}
        </Label>

        {/* Легенда */}
        <line x1={X0 + 6} y1={cy(92)} x2={X0 + 24} y2={cy(92)} className="stroke-rose-500" strokeWidth="3" />
        <Label p={{ x: X0 + 28, y: cy(92) }} size={10} anchor="start">
          α: N − 2, Z − 2
        </Label>
        <line x1={X0 + 6} y1={cy(91)} x2={X0 + 24} y2={cy(91)} className="stroke-blue-500" strokeWidth="3" />
        <Label p={{ x: X0 + 28, y: cy(91) }} size={10} anchor="start">
          β⁻: N − 1, Z + 1
        </Label>
      </ZoomingSvg>

      <Buttons>
        <DiagramButton onClick={() => guess('α')}>α-разпадане</DiagramButton>
        <DiagramButton onClick={() => guess('β')}>β⁻-разпадане</DiagramButton>
        <DiagramButton onClick={restart}>отначало</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'ядро', value: `${sup(cur.A)}${cur.s} (Z = ${cur.Z}, N = ${cur.A - cur.Z})`, tone: 'amber' },
            { label: 'T½ =', value: cur.half },
            { label: 'α:', value: String(alphas), tone: 'rose' },
            { label: 'β⁻:', value: String(betas), tone: 'blue' },
            { label: 'грешки:', value: String(wrong) },
          ]}
        />
      </div>
      {at > 0 && (
        <p className="mt-2 text-center text-sm sm:text-base text-gray-800 dark:text-gray-100">
          <MathText>{equation(CHAIN[at - 1], cur)}</MathText>
        </p>
      )}
      <Note tone={done ? 'emerald' : miss ? 'rose' : 'amber'}>
        {done
          ? `Стабилно олово! Общо ${alphas} α- и ${betas} β⁻-разпадания: масовото число падна с 32 = 8 · 4.`
          : miss
            ? `Не – ${sup(cur.A)}${cur.s} не се разпада с ${miss === 'α' ? 'α' : 'β⁻'}. ${
                cur.decay === 'β' ? 'Има излишък от неутрони спрямо стабилните ядра.' : 'Тежко ядро е – изхвърля хелиево ядро.'
              }`
            : 'Как се разпада това ядро? Подсказка: след α ядрото често има твърде много неутрони и следват β⁻.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Всяка клетка е ядро с Z протона и N неутрона. При α-разпадане ядрото губи 2 протона и 2 неутрона – отива по диагонал надолу
        и наляво. При β⁻-разпадане един неутрон става протон – ядрото се качва с ред и отстъпва с колона. Уранът-238 стига до стабилното
        олово-206 след 14 разпадания; най-бавното е първото, затова в рудите на уран винаги има и радий, и радон. Показан е основният
        клон – някои ядра в реда рядко се разпадат и по другия начин.
      </p>
    </div>
  );
}
