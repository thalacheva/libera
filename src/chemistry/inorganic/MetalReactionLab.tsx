import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Reagent = 'water' | 'HCl' | 'CuSO4' | 'AgNO3';
type Outcome = {
  eq?: string;
  /** yes – реагира; slow – бавно или почти незабележимо; no – не реагира */
  react: 'yes' | 'slow' | 'no';
  obs: string;
  /** Молове H₂ на мол метал */
  h2?: number;
  /** Отложен метал и молове от него на мол метал */
  deposit?: { s: 'Cu' | 'Ag'; k: number };
  /** Утайка вместо отложен метал (активните метали реагират с водата) */
  precipitate?: 'blue' | 'brown';
  /** 0–3: колко бурно се отделя газ */
  fizz?: number;
};
type Metal = { s: string; name: string; M: number; out: Record<Reagent, Outcome> };

const REAGENTS: { id: Reagent; label: string; target: string }[] = [
  { id: 'water', label: 'вода', target: 'H' },
  { id: 'HCl', label: 'разредена HCl', target: 'H' },
  { id: 'CuSO4', label: 'разтвор на CuSO₄', target: 'Cu' },
  { id: 'AgNO3', label: 'разтвор на AgNO₃', target: 'Ag' },
];

/** Активните метали с разтвор на сол: реагира водата, а получената основа дава утайка. */
const viaWater = (first: string, second: string, h2: number, precipitate: 'blue' | 'brown'): Outcome => ({
  eq: `${first}, после ${second}`,
  react: 'yes',
  obs:
    precipitate === 'blue'
      ? 'Металът реагира с водата, а не с медните йони: вместо мед се получава синя утайка Cu(OH)₂.'
      : 'Пак реагира водата: основата дава кафява утайка Ag₂O, а не сребро.',
  h2,
  precipitate,
  fizz: 3,
});

const noWater: Outcome = { react: 'no', obs: 'Не реагира с вода при стайна температура.' };

const METALS: Metal[] = [
  {
    s: 'K',
    name: 'калий',
    M: 39,
    out: {
      water: { eq: '2K + 2H₂O → 2KOH + H₂↑', react: 'yes', obs: 'Много бурно: калият се движи по водата, а водородът се запалва с виолетов пламък.', h2: 0.5, fizz: 3 },
      HCl: { eq: '2K + 2HCl → 2KCl + H₂↑', react: 'yes', obs: 'Експлозивно – този опит не се прави!', h2: 0.5, fizz: 3 },
      CuSO4: viaWater('2K + 2H₂O → 2KOH + H₂↑', '2KOH + CuSO₄ → Cu(OH)₂↓ + K₂SO₄', 0.5, 'blue'),
      AgNO3: viaWater('2K + 2H₂O → 2KOH + H₂↑', '2KOH + 2AgNO₃ → Ag₂O↓ + 2KNO₃ + H₂O', 0.5, 'brown'),
    },
  },
  {
    s: 'Na',
    name: 'натрий',
    M: 23,
    out: {
      water: { eq: '2Na + 2H₂O → 2NaOH + H₂↑', react: 'yes', obs: 'Бурно: натрият се стопява на сребристо топче и „тича“ по водата. С фенолфталеин разтворът става малинов – получава се основа.', h2: 0.5, fizz: 3 },
      HCl: { eq: '2Na + 2HCl → 2NaCl + H₂↑', react: 'yes', obs: 'Много бурно и опасно – не се прави в училище.', h2: 0.5, fizz: 3 },
      CuSO4: viaWater('2Na + 2H₂O → 2NaOH + H₂↑', '2NaOH + CuSO₄ → Cu(OH)₂↓ + Na₂SO₄', 0.5, 'blue'),
      AgNO3: viaWater('2Na + 2H₂O → 2NaOH + H₂↑', '2NaOH + 2AgNO₃ → Ag₂O↓ + 2NaNO₃ + H₂O', 0.5, 'brown'),
    },
  },
  {
    s: 'Ca',
    name: 'калций',
    M: 40,
    out: {
      water: { eq: 'Ca + 2H₂O → Ca(OH)₂ + H₂↑', react: 'yes', obs: 'Равномерно отделяне на мехурчета; разтворът помътнява, защото Ca(OH)₂ е слабо разтворим.', h2: 1, fizz: 2 },
      HCl: { eq: 'Ca + 2HCl → CaCl₂ + H₂↑', react: 'yes', obs: 'Бурно отделяне на водород, епруветката се затопля.', h2: 1, fizz: 3 },
      CuSO4: viaWater('Ca + 2H₂O → Ca(OH)₂ + H₂↑', 'Ca(OH)₂ + CuSO₄ → Cu(OH)₂↓ + CaSO₄', 1, 'blue'),
      AgNO3: viaWater('Ca + 2H₂O → Ca(OH)₂ + H₂↑', 'Ca(OH)₂ + 2AgNO₃ → Ag₂O↓ + Ca(NO₃)₂ + H₂O', 1, 'brown'),
    },
  },
  {
    s: 'Mg',
    name: 'магнезий',
    M: 24,
    out: {
      water: { eq: 'Mg + 2H₂O → Mg(OH)₂ + H₂↑', react: 'slow', obs: 'Със студена вода – почти незабележимо: повърхността се покрива с Mg(OH)₂. С гореща вода реакцията е бавна.', fizz: 0.5 },
      HCl: { eq: 'Mg + 2HCl → MgCl₂ + H₂↑', react: 'yes', obs: 'Бурно отделяне на водород, епруветката се затопля.', h2: 1, fizz: 3 },
      CuSO4: { eq: 'Mg + CuSO₄ → MgSO₄ + Cu', react: 'yes', obs: 'Магнезият се покрива с червеникава мед, синият цвят избледнява. Отделят се и мехурчета водород.', deposit: { s: 'Cu', k: 1 }, fizz: 1 },
      AgNO3: { eq: 'Mg + 2AgNO₃ → Mg(NO₃)₂ + 2Ag', react: 'yes', obs: 'Металът се покрива със сиво-черно сребро.', deposit: { s: 'Ag', k: 2 } },
    },
  },
  {
    s: 'Al',
    name: 'алуминий',
    M: 27,
    out: {
      water: { react: 'no', obs: 'Не реагира: тънкият, но плътен слой Al₂O₃ пази метала. Ако слоят се разруши, алуминият реагира с водата.' },
      HCl: { eq: '2Al + 6HCl → 2AlCl₃ + 3H₂↑', react: 'yes', obs: 'Отначало нищо – киселината разтваря оксидния слой. След малко започва бурно отделяне на водород.', h2: 1.5, fizz: 2 },
      CuSO4: { eq: '2Al + 3CuSO₄ → Al₂(SO₄)₃ + 3Cu', react: 'slow', obs: 'Много бавно – пречи оксидният слой. В разтвор на CuCl₂ хлоридните йони го разрушават и медта се отлага бързо.', deposit: { s: 'Cu', k: 1.5 } },
      AgNO3: { eq: 'Al + 3AgNO₃ → Al(NO₃)₃ + 3Ag', react: 'slow', obs: 'Бавно – пречи оксидният слой.', deposit: { s: 'Ag', k: 3 } },
    },
  },
  {
    s: 'Zn',
    name: 'цинк',
    M: 65,
    out: {
      water: noWater,
      HCl: { eq: 'Zn + 2HCl → ZnCl₂ + H₂↑', react: 'yes', obs: 'Равномерно отделяне на мехурчета – така се получава водород в лабораторията.', h2: 1, fizz: 2 },
      CuSO4: { eq: 'Zn + CuSO₄ → ZnSO₄ + Cu', react: 'yes', obs: 'Цинкът се покрива с червено-кафява мед, синият разтвор избледнява.', deposit: { s: 'Cu', k: 1 } },
      AgNO3: { eq: 'Zn + 2AgNO₃ → Zn(NO₃)₂ + 2Ag', react: 'yes', obs: 'Металът се покрива със сиво-черно сребро.', deposit: { s: 'Ag', k: 2 } },
    },
  },
  {
    s: 'Fe',
    name: 'желязо',
    M: 56,
    out: {
      water: { react: 'no', obs: 'Със студена вода не реагира. Във влажен въздух бавно ръждясва, а с водна пара при висока температура дава Fe₃O₄ и H₂.' },
      HCl: { eq: 'Fe + 2HCl → FeCl₂ + H₂↑', react: 'yes', obs: 'Спокойно отделяне на мехурчета; разтворът става бледозелен от йоните Fe²⁺. Получава се FeCl₂, а не FeCl₃!', h2: 1, fizz: 1 },
      CuSO4: { eq: 'Fe + CuSO₄ → FeSO₄ + Cu', react: 'yes', obs: 'Железният пирон се покрива с червеникава мед – класическият опит.', deposit: { s: 'Cu', k: 1 } },
      AgNO3: { eq: 'Fe + 2AgNO₃ → Fe(NO₃)₂ + 2Ag', react: 'yes', obs: 'Желязото се покрива със сребро.', deposit: { s: 'Ag', k: 2 } },
    },
  },
  {
    s: 'Cu',
    name: 'мед',
    M: 63.5,
    out: {
      water: noWater,
      HCl: { react: 'no', obs: 'Не реагира: медта е след водорода в реда на активност и не го измества от разредени киселини.' },
      CuSO4: { react: 'no', obs: 'Металът не реагира със собствените си йони – нищо не се променя.' },
      AgNO3: { eq: 'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag', react: 'yes', obs: 'Медната жица обраства с блестящи кристалчета сребро („сребърно дърво“), а разтворът посинява от йоните Cu²⁺.', deposit: { s: 'Ag', k: 2 } },
    },
  },
  {
    s: 'Ag',
    name: 'сребро',
    M: 108,
    out: {
      water: noWater,
      HCl: { react: 'no', obs: 'Не реагира: среброто е след водорода в реда на активност.' },
      CuSO4: { react: 'no', obs: 'Не реагира: среброто е по-малко активно от медта и не я измества.' },
      AgNO3: { react: 'no', obs: 'Металът не реагира със собствените си йони.' },
    },
  },
  {
    s: 'Au',
    name: 'злато',
    M: 197,
    out: {
      water: noWater,
      HCl: { react: 'no', obs: 'Не реагира. Златото се разтваря в „царска вода“ – смес от концентрирани азотна и солна киселина.' },
      CuSO4: { react: 'no', obs: 'Не реагира: златото е най-малко активно от всички метали тук.' },
      AgNO3: { react: 'no', obs: 'Не реагира: златото е по-малко активно от среброто.' },
    },
  },
];

// Ред на активност с водорода между желязото и медта
const SERIES = ['K', 'Na', 'Ca', 'Mg', 'Al', 'Zn', 'Fe', 'H', 'Cu', 'Ag', 'Au'];
const sx = (s: string) => 30 + SERIES.indexOf(s) * 42;

const SOLUTION: Record<Reagent, string> = {
  water: 'fill-sky-100 dark:fill-sky-200',
  HCl: 'fill-gray-100 dark:fill-gray-300',
  CuSO4: 'fill-sky-400',
  AgNO3: 'fill-gray-50 dark:fill-gray-200',
};
const METAL_FILL: Record<string, string> = {
  K: 'fill-gray-300',
  Na: 'fill-gray-300',
  Ca: 'fill-gray-400',
  Mg: 'fill-gray-300',
  Al: 'fill-gray-300',
  Zn: 'fill-slate-400',
  Fe: 'fill-stone-500',
  Cu: 'fill-orange-500',
  Ag: 'fill-gray-200',
  Au: 'fill-yellow-400',
};
// Мехурчетата са с фиксирани позиции – картината не трепти при всяко прерисуване
const BUBBLES = [
  [228, 112, 4],
  [250, 98, 3],
  [236, 84, 5],
  [246, 66, 3],
  [230, 52, 4],
  [252, 40, 3],
  [238, 28, 4],
  [224, 70, 3],
  [254, 80, 4],
  [242, 120, 3],
  [226, 36, 3],
  [250, 56, 5],
];

const fmt = (v: number, d = 2) => (Math.round(v * 10 ** d) / 10 ** d).toString().replace('.', ',');

/** Метал + реактив: реагира ли, какво се наблюдава и колко водород или метал се получава. */
export default function MetalReactionLab() {
  const [mi, setMi] = useState(5); // Zn
  const [ri, setRi] = useState<Reagent>('HCl');
  const [m, setM] = useState(6.5);
  const metal = METALS[mi];
  const reagent = REAGENTS.find(r => r.id === ri)!;
  const o = metal.out[ri];
  const n = m / metal.M;
  const full = o.react === 'yes';
  const bubbles = full || o.react === 'slow' ? Math.round((o.fizz ?? 0) * 4) : 0;
  const coated = o.deposit && o.react !== 'no';
  const before = sx(metal.s) < sx(reagent.target);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {METALS.map((x, i) => (
          <DiagramButton key={x.s} active={i === mi} onClick={() => setMi(i)}>
            {x.s}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {REAGENTS.map(r => (
          <DiagramButton key={r.id} active={r.id === ri} onClick={() => setRi(r.id)}>
            {r.label}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 220" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* епруветката */}
        <path d="M 210 50 L 210 132 Q 210 150 240 150 Q 270 150 270 132 L 270 50 Z" className={SOLUTION[ri]} />
        <path d="M 210 10 L 210 132 Q 210 150 240 150 Q 270 150 270 132 L 270 10" fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="2" />
        <rect x={226} y={112} width={28} height={24} rx={3} className={`${METAL_FILL[metal.s]} stroke-gray-600`} strokeWidth="1" />
        {coated && <rect x={224} y={110} width={32} height={28} rx={4} fill="none" className={o.deposit!.s === 'Cu' ? 'stroke-orange-700' : 'stroke-gray-600'} strokeWidth={o.react === 'slow' ? 1.5 : 4} strokeDasharray={o.react === 'slow' ? '3 3' : undefined} />}
        {o.precipitate && (
          <g className={o.precipitate === 'blue' ? 'fill-blue-600' : 'fill-amber-800'}>
            {[214, 222, 260, 266, 218, 262].map((x, i) => (
              <circle key={i} cx={x} cy={136 + (i % 3) * 3} r={2.5} />
            ))}
          </g>
        )}
        {BUBBLES.slice(0, bubbles).map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y + 10} r={r} className="fill-white/80 stroke-gray-500" strokeWidth="1" />
        ))}
        <text x={290} y={60} fontSize="13" fontWeight="700" fill="currentColor">
          {metal.name}
        </text>
        <text x={290} y={78} fontSize="12" className="fill-gray-600 dark:fill-gray-300">
          + {reagent.label}
        </text>
        <text x={290} y={100} fontSize="13" fontWeight="700" className={full ? 'fill-emerald-600 dark:fill-emerald-400' : o.react === 'slow' ? 'fill-amber-600 dark:fill-amber-400' : 'fill-rose-600 dark:fill-rose-400'}>
          {full ? 'реагира' : o.react === 'slow' ? 'бавно / едва' : 'не реагира'}
        </text>

        {/* редът на активност */}
        <text x={30} y={172} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          ред на активност: ← по-активни
        </text>
        {SERIES.map(s => {
          const isMetal = s === metal.s;
          const isTarget = s === reagent.target;
          return (
            <g key={s}>
              <rect x={sx(s) - 17} y={180} width={34} height={26} rx={5} className={isMetal ? 'fill-amber-300' : isTarget ? 'fill-sky-300' : s === 'H' ? 'fill-gray-200 dark:fill-gray-600' : 'fill-gray-100 dark:fill-gray-700'} />
              <text x={sx(s)} y={198} fontSize="13" fontWeight={isMetal || isTarget ? 700 : 400} textAnchor="middle" className={isMetal || isTarget ? 'fill-gray-900' : 'fill-gray-700 dark:fill-gray-200'}>
                {s}
              </text>
            </g>
          );
        })}
      </LabSvg>

      <Sliders>
        <Slider label={`маса на метала, g`} value={m} onChange={setM} min={0.5} max={20} step={0.5} tone="amber" />
      </Sliders>

      {o.eq && <p className="mt-3 text-center font-medium text-gray-800 dark:text-gray-100">{o.eq}</p>}
      <div className="mt-3">
        <Readout
          items={[
            { label: `n(${metal.s}) =`, value: `${fmt(n, 3)} mol`, tone: 'amber' },
            ...(o.h2 && full ? [{ label: 'V(H₂) н.у. =', value: `${fmt(n * o.h2 * 22.4)} L`, tone: 'blue' as const }] : []),
            ...(o.deposit && full ? [{ label: `m(${o.deposit.s}) =`, value: `${fmt(n * o.deposit.k * (o.deposit.s === 'Cu' ? 63.5 : 108))} g`, tone: 'emerald' as const }] : []),
          ]}
        />
      </div>
      <Note tone={full ? 'emerald' : o.react === 'slow' ? 'amber' : 'rose'}>{o.obs}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 {metal.s} е {before ? 'преди' : 'след'} {reagent.target === 'H' ? 'водорода' : reagent.target} в реда на активност
        {reagent.target === 'H'
          ? before
            ? ', затова може да измести водорода от киселините. С вода при стайна температура реагират само най-активните метали – до калция, а магнезият едва.'
            : ', затова не измества водорода.'
          : !before
            ? ', затова не може да го измести.'
            : metal.out.water.react === 'yes'
              ? ', но е толкова активен, че реагира първо с водата от разтвора.'
              : ', затова го измества от разтвора на солта му.'}{' '}
        Количествата са пресметнати, ако металът реагира напълно.
      </p>
    </div>
  );
}
