import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Note, Readout } from '~/geometry/diagram';
import { bySymbol, type Element } from '../elements';

const SYMBOLS = ['H', 'Li', 'Na', 'K', 'Mg', 'Ca', 'Al', 'Fe', 'Cu', 'C', 'Si', 'N', 'P', 'O', 'S', 'F', 'Cl', 'Br', 'I'];
const METALS = new Set(['alkali', 'alkaline-earth', 'transition', 'post-transition', 'lanthanide', 'actinide']);
const isMetal = (e: Element) => METALS.has(e.category);
const fmt = (v: number) => v.toFixed(2).replace('.', ',');

type Kind = 'metallic' | 'nonpolar' | 'polar' | 'ionic';
const KIND: Record<Kind, { name: string; text: string; examples: string }> = {
  metallic: {
    name: 'метална връзка',
    text: 'И двата елемента са метали: атомите отдават външните си електрони в общ „електронен облак“. Така се свързват атомите в металите и сплавите.',
    examples: 'мед, желязо, месинг (Cu + Zn), бронз (Cu + Sn)',
  },
  nonpolar: {
    name: 'ковалентна неполярна връзка',
    text: 'Електроотрицателностите са еднакви или почти еднакви: общата електронна двойка е поравно между атомите.',
    examples: 'H₂, Cl₂, O₂, N₂; почти неполярна е и връзката C–H',
  },
  polar: {
    name: 'ковалентна полярна връзка',
    text: 'Общата двойка е изместена към по-електроотрицателния атом: той получава частичен отрицателен заряд δ−, а другият – δ+.',
    examples: 'H–Cl, O–H във водата, N–H в амоняка, C=O',
  },
  ionic: {
    name: 'йонна връзка',
    text: 'Разликата е голяма и единият елемент е метал: електронът практически преминава изцяло към неметала. Получават се йони, които се привличат.',
    examples: 'NaCl, KF, MgO, CaCl₂',
  },
};

function kindOf(a: Element, b: Element, d: number): Kind {
  if (isMetal(a) && isMetal(b)) return 'metallic';
  if (d < 0.4) return 'nonpolar';
  if (d >= 1.7 && (isMetal(a) || isMetal(b))) return 'ionic';
  return 'polar';
}

// Скала за разликата в електроотрицателността: 0 … 3,3
const SX = (v: number) => 40 + (Math.min(v, 3.3) / 3.3) * 400;

/** Каква връзка образуват два елемента? Разлика в електроотрицателността и изместване на електронната двойка. */
export default function BondTypeLab() {
  const [left, setLeft] = useState('H');
  const [right, setRight] = useState('Cl');
  const a = bySymbol.get(left)!;
  const b = bySymbol.get(right)!;
  const d = Math.abs((a.en ?? 0) - (b.en ?? 0));
  const kind = kindOf(a, b, d);
  const toRight = (b.en ?? 0) > (a.en ?? 0);

  // Изместване на облака към по-електроотрицателния атом
  const [xa, xb, y] = [165, 315, 80];
  const shift = kind === 'metallic' || kind === 'nonpolar' ? 0 : Math.min(d / 2.2, 1) * 60 * (toRight ? 1 : -1);
  const ionic = kind === 'ionic';

  const select = (value: string, onChange: (s: string) => void, label: string) => (
    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
      {label}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1 text-sm"
      >
        {SYMBOLS.map(s => (
          <option key={s} value={s}>
            {s} – {bySymbol.get(s)!.name}
          </option>
        ))}
      </select>
    </label>
  );

  const charge = (left: boolean) => {
    const more = left ? !toRight : toRight;
    if (kind === 'nonpolar' || kind === 'metallic') return '';
    if (ionic) return more ? '−' : '+';
    return more ? 'δ−' : 'δ+';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="flex flex-wrap justify-center gap-4">
        {select(left, setLeft, 'Елемент 1:')}
        {select(right, setRight, 'Елемент 2:')}
      </div>

      <LabSvg viewBox="0 0 480 230" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* Електронен облак */}
        {kind === 'metallic' ? (
          <rect x={95} y={35} width={290} height={90} rx={40} className="fill-sky-300/40 dark:fill-sky-500/30" />
        ) : ionic ? (
          <circle cx={toRight ? xb : xa} cy={y} r={46} className="fill-sky-300/50 dark:fill-sky-500/40" />
        ) : (
          <ellipse cx={(xa + xb) / 2 + shift} cy={y} rx={110 - Math.abs(shift) * 0.5} ry={40} className="fill-sky-300/50 dark:fill-sky-500/40" />
        )}
        {[
          { e: a, x: ionic ? xa - 15 : xa, l: true },
          { e: b, x: ionic ? xb + 15 : xb, l: false },
        ].map(({ e, x, l }) => (
          <g key={l ? 'l' : 'r'}>
            <circle cx={x} cy={y} r={28} className="fill-white stroke-gray-500 dark:fill-gray-900 dark:stroke-gray-400" strokeWidth="2" />
            <text x={x} y={y + 7} fontSize="20" fontWeight="700" textAnchor="middle" fill="currentColor">
              {e.symbol}
            </text>
            <text x={x} y={y - 48} fontSize="16" fontWeight="700" textAnchor="middle" className={charge(l).includes('−') ? 'fill-sky-700 dark:fill-sky-300' : 'fill-rose-600 dark:fill-rose-400'}>
              {charge(l)}
            </text>
            <text x={x} y={y + 50} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {`ЕО = ${e.en === null ? '—' : fmt(e.en)}`}
            </text>
          </g>
        ))}

        {/* Скала */}
        <defs>
          <linearGradient id="bond-scale" x1="0" x2="1">
            <stop offset="0" stopColor="#9ca3af" />
            <stop offset={0.4 / 3.3} stopColor="#9ca3af" />
            <stop offset={0.6 / 3.3} stopColor="#38bdf8" />
            <stop offset={1.5 / 3.3} stopColor="#38bdf8" />
            <stop offset={1.9 / 3.3} stopColor="#f59e0b" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <rect x={40} y={165} width={400} height={12} rx={6} fill="url(#bond-scale)" />
        {[0, 0.5, 1, 1.5, 2, 2.5, 3].map(v => (
          <text key={v} x={SX(v)} y={192} fontSize="11" textAnchor="middle" fill="currentColor">
            {String(v).replace('.', ',')}
          </text>
        ))}
        <text x={SX(0.2)} y={158} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          неполярна
        </text>
        <text x={SX(1.05)} y={158} fontSize="11" textAnchor="middle" className="fill-sky-700 dark:fill-sky-300">
          ковалентна полярна
        </text>
        <text x={SX(2.6)} y={158} fontSize="11" textAnchor="middle" className="fill-amber-700 dark:fill-amber-400">
          йонна
        </text>
        <path d={`M ${SX(d)} 181 l -7 -12 h 14 z`} transform="translate(0 0)" className="fill-gray-900 dark:fill-white" />
        <text x={440} y={212} fontSize="12" textAnchor="end" fill="currentColor">
          ΔЕО
        </text>
      </LabSvg>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'ΔЕО =', value: `|${fmt(b.en ?? 0)} − ${fmt(a.en ?? 0)}| = ${fmt(d)}`, tone: 'blue' },
            { label: 'връзка:', value: KIND[kind].name, tone: kind === 'ionic' ? 'amber' : kind === 'polar' ? 'violet' : 'gray' },
          ]}
        />
      </div>
      <Note tone="blue">{KIND[kind].text}</Note>
      <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Примери: {KIND[kind].examples}</p>
      {kind === 'polar' && d >= 1.7 && <Note tone="amber">Разликата е голяма, но и двата елемента са неметали – връзката е силно полярна, но ковалентна (например H–F), а не йонна.</Note>}
      {kind === 'polar' && d >= 1.2 && d < 1.7 && (isMetal(a) || isMetal(b)) && (
        <Note tone="amber">Метал и неметал, но разликата е умерена – връзката има и ковалентен, и йонен характер (например в AlCl₃ тя е по-скоро ковалентна).</Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Избери два елемента. Синият облак е общата електронна двойка – тя се измества към атома с по-голяма електроотрицателност (ЕО, по
        Полинг). Границите 0,4 и 1,7 на скалата са само ориентир: преходът от ковалентна към йонна връзка е постепенен.
      </p>
    </div>
  );
}
