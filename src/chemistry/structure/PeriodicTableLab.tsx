import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Tex } from '~/MathText';
import { Buttons, DiagramButton } from '~/geometry/diagram';
import { byZ, CATEGORY_NAME, type Category, configTex, ELEMENTS, type Element, tablePosition } from '../elements';

type Mode = 'category' | 'radius' | 'ie' | 'en';

const MODES: { id: Mode; label: string }[] = [
  { id: 'category', label: 'вид елемент' },
  { id: 'radius', label: 'атомен радиус' },
  { id: 'ie', label: 'йонизационна енергия' },
  { id: 'en', label: 'електроотрицателност' },
];

const TREND: Record<Exclude<Mode, 'category'>, { get: (e: Element) => number | null; unit: string; digits: number; name: string }> = {
  radius: { get: e => e.radius, unit: 'pm', digits: 0, name: 'ковалентен радиус' },
  ie: { get: e => e.ie, unit: 'eV', digits: 1, name: 'първа йонизационна енергия' },
  en: { get: e => e.en, unit: '', digits: 2, name: 'електроотрицателност' },
};

const CATEGORY_FILL: Record<Category, string> = {
  alkali: 'fill-rose-200',
  'alkaline-earth': 'fill-orange-200',
  transition: 'fill-amber-100',
  lanthanide: 'fill-pink-100',
  actinide: 'fill-fuchsia-100',
  'post-transition': 'fill-teal-100',
  metalloid: 'fill-lime-200',
  nonmetal: 'fill-sky-100',
  halogen: 'fill-cyan-200',
  'noble-gas': 'fill-violet-200',
};
const CATEGORY_CHIP: Record<Category, string> = {
  alkali: 'bg-rose-200',
  'alkaline-earth': 'bg-orange-200',
  transition: 'bg-amber-100',
  lanthanide: 'bg-pink-100',
  actinide: 'bg-fuchsia-100',
  'post-transition': 'bg-teal-100',
  metalloid: 'bg-lime-200',
  nonmetal: 'bg-sky-100',
  halogen: 'bg-cyan-200',
  'noble-gas': 'bg-violet-200',
};

const STATE = { s: 'твърдо', l: 'течно', g: 'газ' };

/** Цвят от светложълто (малко) до тъмночервено (много). */
const scale = (t: number) => ({ fill: `hsl(${55 - 55 * t}, 90%, ${92 - 47 * t}%)`, dark: t > 0.55 });

const fmt = (v: number, d: number) => v.toFixed(d).replace('.', ',');

// Клетките: 18 колони, 7 периода и два реда за f-елементите отдолу
const X0 = 16;
const Y0 = 20;
const STEP_X = 35;
const STEP_Y = 39;
const W = 34;
const HGT = 38;
const pos = (e: Element) => {
  const { row, col } = tablePosition(e);
  return { x: X0 + (col - 1) * STEP_X, y: Y0 + (row - 1) * STEP_Y + (row > 7 ? 12 : 0) };
};
// За номерата на групите – най-горният ред във всяка колона
const TOP_ROW = Array.from({ length: 18 }, (_, c) => Math.min(...ELEMENTS.filter(e => e.group === c + 1).map(e => e.period)));

/** Периодичната система: оцвети я по вид на елементите или по някоя периодична тенденция. */
export default function PeriodicTableLab() {
  const [mode, setMode] = useState<Mode>('category');
  const [z, setZ] = useState(17);
  const sel = byZ(z);

  const trend = mode === 'category' ? null : TREND[mode];
  const values = trend ? ELEMENTS.map(trend.get).filter((v): v is number => v !== null) : [];
  const [min, max] = [Math.min(...values), Math.max(...values)];
  const selValue = trend ? trend.get(sel) : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MODES.map(m => (
          <DiagramButton key={m.id} active={m.id === mode} onClick={() => setMode(m.id)}>
            {m.label}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 650 392" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {TOP_ROW.map((row, c) => (
          <text key={c} x={X0 + c * STEP_X + W / 2} y={Y0 + (row - 1) * STEP_Y - 5} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {c + 1}
          </text>
        ))}
        {Array.from({ length: 7 }, (_, r) => (
          <text key={r} x={X0 - 5} y={Y0 + r * STEP_Y + HGT / 2 + 3} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
            {r + 1}
          </text>
        ))}
        <text x={X0 + 3 * STEP_X - 6} y={Y0 + 7 * STEP_Y + 12 + HGT / 2 + 3} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          Ce–Lu
        </text>
        <text x={X0 + 3 * STEP_X - 6} y={Y0 + 8 * STEP_Y + 12 + HGT / 2 + 3} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          Th–Lr
        </text>

        {ELEMENTS.map(e => {
          const { x, y } = pos(e);
          const v = trend?.get(e) ?? null;
          const c = trend && v !== null ? scale((v - min) / (max - min)) : null;
          const textCls = c?.dark ? 'fill-white' : 'fill-gray-900';
          return (
            <g key={e.z} onClick={() => setZ(e.z)} style={{ cursor: 'pointer' }}>
              <rect
                x={x}
                y={y}
                width={W}
                height={HGT}
                rx="3"
                className={`${trend ? (c ? '' : 'fill-gray-200 dark:fill-gray-600') : CATEGORY_FILL[e.category]} ${e.z === z ? 'stroke-gray-900 dark:stroke-white' : 'stroke-white dark:stroke-gray-800'}`}
                style={c ? { fill: c.fill } : undefined}
                strokeWidth={e.z === z ? 2.5 : 1}
              />
              <text x={x + 3} y={y + 9} fontSize="7.5" className={textCls}>
                {e.z}
              </text>
              <text x={x + W / 2} y={y + 25} fontSize="13" fontWeight="700" textAnchor="middle" className={textCls}>
                {e.symbol}
              </text>
              {trend && (
                <text x={x + W / 2} y={y + 35} fontSize="7" textAnchor="middle" className={textCls}>
                  {v === null ? '–' : fmt(v, trend.digits)}
                </text>
              )}
            </g>
          );
        })}

        {/* Избраният елемент – в празното място над преходните метали */}
        <rect x={X0 + 2 * STEP_X + 8} y={Y0 + 2} width={9 * STEP_X - 10} height={2 * STEP_Y + 22} rx="10" className="fill-gray-50 stroke-gray-200 dark:fill-gray-900/60 dark:stroke-gray-700" />
        <text x={X0 + 2 * STEP_X + 24} y={Y0 + 58} fontSize="44" fontWeight="700" className="fill-amber-700 dark:fill-amber-400">
          {sel.symbol}
        </text>
        <text x={X0 + 2 * STEP_X + 110} y={Y0 + 30} fontSize="16" fontWeight="700" fill="currentColor">
          {sel.name}
        </text>
        <text x={X0 + 2 * STEP_X + 110} y={Y0 + 50} fontSize="12" fill="currentColor">
          {`Z = ${sel.z},  Ar = ${sel.radioactive ? `[${sel.mass}]` : fmt(sel.mass, sel.mass < 100 ? 3 : 2)}`}
        </text>
        <text x={X0 + 2 * STEP_X + 110} y={Y0 + 68} fontSize="12" className="fill-gray-600 dark:fill-gray-300">
          {CATEGORY_NAME[sel.category]}
        </text>
        <text x={X0 + 2 * STEP_X + 24} y={Y0 + 80} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          {sel.group ? `група ${sel.group}, период ${sel.period}` : `период ${sel.period} (f-елемент)`}
        </text>
        {trend && (
          <text x={X0 + 2 * STEP_X + 24} y={Y0 + 95} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
            {`${trend.name}: ${selValue === null ? 'няма данни' : `${fmt(selValue, trend.digits)} ${trend.unit}`}`}
          </text>
        )}
      </LabSvg>

      {trend ? (
        <div className="max-w-md mx-auto mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          <div className="h-3 rounded" style={{ background: `linear-gradient(to right, ${[0, 0.25, 0.5, 0.75, 1].map(t => scale(t).fill).join(', ')})` }} />
          <div className="flex justify-between mt-1">
            <span>
              {fmt(min, trend.digits)} {trend.unit}
            </span>
            <span>{trend.name}</span>
            <span>
              {fmt(max, trend.digits)} {trend.unit}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          {(Object.keys(CATEGORY_NAME) as Category[]).map(c => (
            <span key={c} className="inline-flex items-center gap-1">
              <span className={`inline-block w-3 h-3 rounded-sm ${CATEGORY_CHIP[c]}`} />
              {CATEGORY_NAME[c]}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-1 max-w-xl mx-auto text-sm text-gray-700 dark:text-gray-300">
        <p>
          <span className="text-gray-500 dark:text-gray-400">Електронна конфигурация: </span>
          <Tex>{configTex(sel.config)}</Tex>
        </p>
        <p>
          <span className="text-gray-500 dark:text-gray-400">Агрегатно състояние: </span>
          {sel.state ? STATE[sel.state] : 'неизвестно'}
        </p>
        <p>
          <span className="text-gray-500 dark:text-gray-400">Електроотрицателност: </span>
          {sel.en === null ? 'няма стойност' : fmt(sel.en, 2)}
        </p>
        <p>
          <span className="text-gray-500 dark:text-gray-400">Йонизационна енергия: </span>
          {sel.ie === null ? 'не е измерена' : `${fmt(sel.ie, 2)} eV (${fmt(sel.ie * 96.485, 0)} kJ/mol)`}
        </p>
        <p>
          <span className="text-gray-500 dark:text-gray-400">Ковалентен радиус: </span>
          {sel.radius} pm
        </p>
        {sel.radioactive && <p className="text-rose-600 dark:text-rose-400">Няма стабилни изотопи – в скоби е масовото число на най-дълго живеещия.</p>}
      </div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Докосни елемент, за да видиш данните му. Смени оцветяването и проследи тенденциите: радиусът расте надолу и наляво,
        йонизационната енергия и електроотрицателността – нагоре и надясно. За благородните газове ковалентният радиус е условна стойност, а
        електроотрицателност по Полинг повечето от тях нямат.
      </p>
    </div>
  );
}
