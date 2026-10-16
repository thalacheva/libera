import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

type Comp = 'sand' | 'iron' | 'salt' | 'water' | 'oil' | 'ethanol';

const NAME: Record<Comp, string> = {
  sand: 'пясък',
  iron: 'желязо',
  salt: 'сол',
  water: 'вода',
  oil: 'олио',
  ethanol: 'етанол',
};
const SOLIDS: Comp[] = ['sand', 'iron', 'salt'];
const LIQUIDS: Comp[] = ['water', 'ethanol', 'oil'];

const PRESETS: { name: string; start: Comp[] }[] = [
  { name: 'пясък + сол + желязо', start: ['sand', 'salt', 'iron'] },
  { name: 'морска вода', start: ['water', 'salt'] },
  { name: 'солена вода + олио', start: ['oil', 'water', 'salt'] },
  { name: 'вода + етанол', start: ['water', 'ethanol'] },
];

type Fraction = { comps: Comp[]; note?: string };
type State = { vessel: Comp[]; fractions: Fraction[]; steps: string[]; message: string; tone: 'emerald' | 'rose' | 'blue' };

const fresh = (start: Comp[]): State => ({
  vessel: start,
  fractions: [],
  steps: [],
  message: 'Избери първия метод.',
  tone: 'blue',
});

const has = (v: Comp[], c: Comp) => v.includes(c);
const without = (v: Comp[], cs: Comp[]) => v.filter(c => !cs.includes(c));
/** Солта е разтворена само ако в съда има вода. */
const dissolved = (v: Comp[], c: Comp) => c === 'salt' && has(v, 'water');
const liquidIn = (v: Comp[]) => LIQUIDS.some(l => has(v, l));
const list = (cs: Comp[]) => cs.map(c => NAME[c]).join(' + ');

type Method = { id: string; label: string; apply: (s: State) => Omit<State, 'steps'> | string };

const METHODS: Method[] = [
  {
    id: 'magnet',
    label: '🧲 Магнит',
    apply: s =>
      has(s.vessel, 'iron')
        ? { ...s, vessel: without(s.vessel, ['iron']), fractions: [...s.fractions, { comps: ['iron'] }], message: 'Магнитът изтегля железните стърготини – останалите вещества не се привличат.', tone: 'emerald' }
        : 'В сместа няма нищо, което магнитът да привлече.',
  },
  {
    id: 'water',
    label: '💧 Добави вода',
    apply: s => {
      if (has(s.vessel, 'water')) return 'В съда вече има вода.';
      const notes = [has(s.vessel, 'salt') && 'солта се разтваря', has(s.vessel, 'sand') && 'пясъкът не се разтваря и пада на дъното'].filter(Boolean);
      return { ...s, vessel: [...s.vessel, 'water'], message: `Добавяш вода и разбъркваш${notes.length ? ': ' + notes.join(', ') : ''}.`, tone: 'emerald' };
    },
  },
  {
    id: 'filter',
    label: '🫖 Филтруване',
    apply: s => {
      if (!liquidIn(s.vessel)) return 'Филтрува се смес с течност. Първо добави вода.';
      const solid = SOLIDS.filter(c => has(s.vessel, c) && !dissolved(s.vessel, c));
      if (!solid.length)
        return has(s.vessel, 'salt')
          ? 'Няма неразтворени частици. Разтворената сол минава през филтъра заедно с водата.'
          : 'Няма твърди частици, които филтърът да задържи.';
      return {
        ...s,
        vessel: without(s.vessel, solid),
        fractions: [...s.fractions, { comps: solid }],
        message: `На филтъра остава ${list(solid)}${has(s.vessel, 'salt') && !solid.includes('salt') ? ', а разтворената сол минава с водата във филтрата' : ''}.`,
        tone: 'emerald',
      };
    },
  },
  {
    id: 'evaporate',
    label: '🔥 Изпаряване',
    apply: s => {
      const volatile = (['water', 'ethanol'] as Comp[]).filter(c => has(s.vessel, c));
      if (!volatile.length) return has(s.vessel, 'oil') ? 'Олиото кипи над 300 °C и при загряване по-скоро ще се разложи или запали.' : 'Няма течност за изпаряване.';
      const left = without(s.vessel, volatile);
      return {
        ...s,
        vessel: left,
        message: `${list(volatile)} ${volatile.length > 1 ? 'се изпаряват' : 'се изпарява'} и ${volatile.length > 1 ? 'отиват' : 'отива'} във въздуха${has(left, 'salt') ? ' – на дъното остават кристали сол' : ''}. Ако искаш да запазиш течността, дестилирай.`,
        tone: left.length ? 'emerald' : 'rose',
      };
    },
  },
  {
    id: 'distill',
    label: '⚗️ Дестилация',
    apply: s => {
      if (has(s.vessel, 'ethanol')) {
        const ethanolOnly = !has(s.vessel, 'water');
        return {
          ...s,
          vessel: without(s.vessel, ['ethanol']),
          fractions: [...s.fractions, { comps: ['ethanol'], note: ethanolOnly ? undefined : '≈ 95%' }],
          message: ethanolOnly
            ? 'Етанолът кипи при 78 °C, изпарява се и се кондензира в хладника.'
            : 'Етанолът (78 °C) кипи по-лесно от водата (100 °C), затова в дестилата отива главно той. С фракционна колона се стига до около 95% етанол – напълно чист етанол с дестилация не се получава. В дестилационната колба остава водата.',
          tone: 'emerald',
        };
      }
      if (has(s.vessel, 'water'))
        return {
          ...s,
          vessel: without(s.vessel, ['water']),
          fractions: [...s.fractions, { comps: ['water'] }],
          message: `Водата кипи, парата се охлажда в хладника и капе като дестилирана вода${has(s.vessel, 'salt') ? ' – солта не се изпарява и остава в колбата' : ''}${has(s.vessel, 'oil') ? '; олиото кипи много по-високо и също остава' : ''}.`,
          tone: 'emerald',
        };
      return liquidIn(s.vessel) ? 'Олиото кипи над 300 °C – преди това започва да се разлага.' : 'Дестилират се течности, а в съда няма такива.';
    },
  },
  {
    id: 'funnel',
    label: '🍐 Делителна фуния',
    apply: s => {
      if (has(s.vessel, 'oil') && has(s.vessel, 'water'))
        return {
          ...s,
          vessel: without(s.vessel, ['oil']),
          fractions: [...s.fractions, { comps: ['oil'] }],
          message: 'Олиото не се смесва с водата и е по-леко – образува горен слой. Източваш долния воден слой и олиото остава във фунията.',
          tone: 'emerald',
        };
      if (has(s.vessel, 'ethanol') && has(s.vessel, 'water')) return 'Етанолът и водата се смесват напълно – няма слоеве и фунията не помага.';
      return 'Делителната фуния разделя две течности, които не се смесват – тук няма такива.';
    },
  },
];

// Детерминирани „случайни“ точки за зрънцата (еднакви при prerender и в браузъра)
const grains = (() => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 36 }, () => ({ x: rnd(), y: rnd() }));
})();

const GRAIN: Record<'sand' | 'iron' | 'salt', string> = {
  sand: 'fill-amber-400',
  iron: 'fill-gray-700 dark:fill-gray-300',
  salt: 'fill-white stroke-gray-400',
};
const JAR_FILL: Record<Comp, string> = {
  sand: 'fill-amber-300',
  iron: 'fill-gray-600',
  salt: 'fill-gray-100 dark:fill-gray-200',
  water: 'fill-sky-300/80',
  oil: 'fill-yellow-300',
  ethanol: 'fill-violet-200',
};

/** Колба със съдържанието – течни слоеве и зрънца на дъното. */
function Vessel({ v }: { v: Comp[] }) {
  const [x0, x1, top, bottom] = [40, 200, 40, 200];
  const solids = SOLIDS.filter(c => has(v, c) && !dissolved(v, c));
  const aqueous = has(v, 'water') || has(v, 'ethanol');
  const oilLayer = has(v, 'oil');
  const solidH = solids.length ? 26 : 0;
  // Течностите: воден слой (вода/етанол) отдолу, олиото отгоре
  const aqH = aqueous ? 90 : 0;
  const oilH = oilLayer ? 34 : 0;
  const aqTop = bottom - solidH - aqH;
  const aqColor = has(v, 'ethanol') ? (has(v, 'water') ? 'fill-indigo-200/80 dark:fill-indigo-400/40' : 'fill-violet-200/80 dark:fill-violet-400/40') : 'fill-sky-200/80 dark:fill-sky-500/40';
  return (
    <g>
      {aqueous && <rect x={x0 + 2} y={aqTop} width={x1 - x0 - 4} height={aqH + solidH} className={aqColor} />}
      {oilLayer && <rect x={x0 + 2} y={(aqueous ? aqTop : bottom - solidH) - oilH} width={x1 - x0 - 4} height={oilH + (aqueous ? 0 : solidH)} className="fill-yellow-300/80 dark:fill-yellow-400/50" />}
      {solids.map((c, k) =>
        grains
          .filter((_, i) => i % solids.length === k)
          .map((g, i) => (
            <rect
              key={`${c}${i}`}
              x={x0 + 8 + g.x * (x1 - x0 - 22)}
              y={bottom - 6 - g.y * (solidH - 10)}
              width={c === 'iron' ? 9 : 6}
              height={c === 'iron' ? 3 : 6}
              rx={c === 'sand' ? 3 : 0.5}
              className={GRAIN[c as 'sand' | 'iron' | 'salt']}
            />
          )),
      )}
      {/* стъклото */}
      <path d={`M ${x0} ${top} L ${x0} ${bottom} Q ${x0} ${bottom + 8} ${x0 + 8} ${bottom + 8} L ${x1 - 8} ${bottom + 8} Q ${x1} ${bottom + 8} ${x1} ${bottom} L ${x1} ${top}`} className="fill-none stroke-gray-500 dark:stroke-gray-400" strokeWidth="3" />
      {has(v, 'salt') && dissolved(v, 'salt') && (
        <text x={(x0 + x1) / 2} y={aqTop + 22} fontSize="12" textAnchor="middle" className="fill-sky-800 dark:fill-sky-200">
          разтворена сол
        </text>
      )}
      <text x={(x0 + x1) / 2} y={228} fontSize="13" fontWeight="600" textAnchor="middle" fill="currentColor">
        {v.length ? `в колбата: ${list(v)}` : 'колбата е празна'}
      </text>
    </g>
  );
}

/** Раздели сместа: избери методите в правилния ред, така че всяко вещество да се окаже само. */
export default function SeparationLab() {
  const [preset, setPreset] = useState(0);
  const [state, setState] = useState<State>(() => fresh(PRESETS[0].start));
  const goal = PRESETS[preset].start;

  const choose = (i: number) => {
    setPreset(i);
    setState(fresh(PRESETS[i].start));
  };
  const run = (m: Method) => {
    const r = m.apply(state);
    setState(typeof r === 'string' ? { ...state, message: r, tone: 'rose', steps: state.steps } : { ...r, steps: [...state.steps, m.label.replace(/^\S+\s/, '')] });
  };

  // Кое вещество вече е само – в отделна фракция или само в колбата
  const pure = new Set<Comp>([...state.fractions.filter(f => f.comps.length === 1).map(f => f.comps[0]), ...(state.vessel.length === 1 ? state.vessel : [])]);
  const done = goal.every(c => pure.has(c));
  const lost = goal.filter(c => !pure.has(c) && !has(state.vessel, c) && !state.fractions.some(f => f.comps.includes(c)));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PRESETS.map((p, i) => (
          <DiagramButton key={p.name} active={i === preset} onClick={() => choose(i)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 240" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <Vessel v={state.vessel} />
        <text x={360} y={30} fontSize="13" fontWeight="600" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          Отделени вещества
        </text>
        {state.fractions.length === 0 && (
          <text x={360} y={110} fontSize="12" textAnchor="middle" className="fill-gray-400">
            още няма
          </text>
        )}
        {state.fractions.slice(-4).map((f, i) => {
          const x = 262 + (i % 2) * 100;
          const y = 48 + Math.floor(i / 2) * 92;
          const single = f.comps.length === 1;
          return (
            <g key={i}>
              {f.comps.map((c, k) => (
                <rect key={c} x={x + 22} y={y + 14 + (k * 46) / f.comps.length} width={52} height={46 / f.comps.length} className={JAR_FILL[c]} />
              ))}
              <path d={`M ${x + 20} ${y} L ${x + 20} ${y + 60} L ${x + 76} ${y + 60} L ${x + 76} ${y}`} className="fill-none stroke-gray-500 dark:stroke-gray-400" strokeWidth="2" />
              <text x={x + 48} y={y + 76} fontSize="12" textAnchor="middle" className={single ? 'fill-emerald-700 dark:fill-emerald-400' : 'fill-rose-600 dark:fill-rose-400'}>
                {single ? `✓ ${NAME[f.comps[0]]}${f.note ? ` ${f.note}` : ''}` : list(f.comps)}
              </text>
            </g>
          );
        })}
      </LabSvg>

      <Buttons>
        {METHODS.map(m => (
          <DiagramButton key={m.id} onClick={() => run(m)}>
            {m.label}
          </DiagramButton>
        ))}
        <DiagramButton onClick={() => setState(fresh(goal))}>↺ Отначало</DiagramButton>
      </Buttons>
      <Note tone={state.tone}>{state.message}</Note>
      {state.steps.length > 0 && <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Стъпки: {state.steps.join(' → ')}</p>}
      {done && (
        <Note tone="violet">
          🎉 Всички вещества са отделени за {state.steps.length} {state.steps.length === 1 ? 'стъпка' : 'стъпки'}: {goal.map(c => NAME[c]).join(', ')}.
        </Note>
      )}
      {!done && lost.length > 0 && <Note tone="rose">Изгуби {list(lost)} – започни отначало и пробвай друг ред.</Note>}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Целта е всяко вещество от сместа да се окаже само – в отделен съд или само в колбата. Всеки метод използва свойство, по което
        веществата се различават: магнитни свойства, разтворимост, размер на частиците, температура на кипене, плътност. Редът има
        значение!
      </p>
    </div>
  );
}
