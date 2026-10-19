import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Method = 'water' | 'up' | 'down';
type Gas = {
  f: string;
  name: string;
  /** С определителен член: „водородът“ */
  def: string;
  M: number;
  /** Обеми газ, които се разтварят в 1 обем вода при 20 °C (приблизително) */
  sol: number;
  eq: string;
  test: string;
  color: string;
  /** Подходящи начини на събиране; „water“ – над вода */
  ok: Method[];
  note?: string;
};

const GASES: Gas[] = [
  {
    f: 'H₂',
    name: 'водород',
    def: 'водородът',
    M: 2,
    sol: 0.018,
    eq: 'Zn + 2HCl → ZnCl₂ + H₂↑',
    test: 'поднесен към пламък, малко водород в епруветка изгърмява с характерен „лай“',
    color: '#7dd3fc',
    ok: ['water', 'down'],
  },
  {
    f: 'O₂',
    name: 'кислород',
    def: 'кислородът',
    M: 32,
    sol: 0.031,
    eq: '2H₂O₂ → 2H₂O + O₂↑ (катализатор MnO₂)',
    test: 'тлееща треска се разпалва отново',
    color: '#fda4af',
    ok: ['water', 'up'],
  },
  {
    f: 'CO₂',
    name: 'въглероден диоксид',
    def: 'въглеродният диоксид',
    M: 44,
    sol: 0.88,
    eq: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑',
    test: 'варната вода Ca(OH)₂ помътнява (утайка CaCO₃)',
    color: '#86efac',
    ok: ['up'],
    note: 'Над вода също може, но част от газа се разтваря.',
  },
  {
    f: 'NH₃',
    name: 'амоняк',
    def: 'амонякът',
    M: 17,
    sol: 700,
    eq: '2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2NH₃↑ + 2H₂O (при нагряване)',
    test: 'влажна червена лакмусова хартия посинява; характерна остра миризма',
    color: '#c4b5fd',
    ok: ['down'],
  },
  {
    f: 'Cl₂',
    name: 'хлор',
    def: 'хлорът',
    M: 71,
    sol: 2.3,
    eq: 'MnO₂ + 4HCl → MnCl₂ + Cl₂↑ + 2H₂O (при нагряване)',
    test: 'жълтозелен цвят; влажна лакмусова хартия се обезцветява (хлорът е отровен – само в камина)',
    color: '#d9f99d',
    ok: ['up'],
    note: 'В камина; може и над наситен разтвор на NaCl, в който хлорът се разтваря слабо.',
  },
];

const METHODS: { m: Method; label: string }[] = [
  { m: 'water', label: 'над вода' },
  { m: 'up', label: 'съд с отвора нагоре' },
  { m: 'down', label: 'обърнат съд' },
];

const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

// Фиксирани „молекули“ в съда (x и y в части от размера му)
const DOTS = [
  [0.2, 0.15], [0.55, 0.1], [0.8, 0.25], [0.35, 0.35], [0.7, 0.45], [0.15, 0.55], [0.5, 0.6], [0.85, 0.7],
  [0.3, 0.75], [0.6, 0.85], [0.2, 0.9], [0.45, 0.22], [0.75, 0.6], [0.4, 0.48],
];

/** Колба с реактивите и отвеждаща тръба. */
function Flask({ color }: { color: string }) {
  return (
    <g>
      <path d="M 52 92 L 52 120 L 22 182 L 112 182 L 82 120 L 82 92" fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="1.8" />
      <path d="M 37 152 L 97 152 L 112 182 L 22 182 Z" fill="#cbd5e1" opacity="0.7" />
      {[0, 1, 2].map(i => (
        <circle key={i} cx={52 + i * 14} cy={140 - i * 9} r={4} fill={color} />
      ))}
      <rect x={48} y={84} width={38} height={10} rx={2} className="fill-gray-500" />
      <text x={67} y={200} fontSize="11" textAnchor="middle" fill="currentColor">
        реактиви
      </text>
    </g>
  );
}

/** Съд и газ според начина на събиране. */
function Collector({ gas, method }: { gas: Gas; method: Method }) {
  const good = gas.ok.includes(method);
  const lighter = gas.M < 29;
  const tube = 'stroke-gray-500 dark:stroke-gray-300';

  if (method === 'water') {
    // Вана с вода и обърнат цилиндър, пълен с вода; газът изтиква водата
    const soluble = gas.sol > 1;
    const gasH = soluble ? 0 : 80;
    return (
      <g>
        <rect x={210} y={140} width={240} height={52} fill="#bfdbfe" opacity="0.8" />
        <path d="M 210 120 L 210 192 L 450 192 L 450 120" fill="none" className={tube} strokeWidth="1.8" />
        <rect x={310} y={40} width={50} height={130} fill="#bfdbfe" opacity="0.8" />
        {gasH > 0 && <rect x={310} y={40} width={50} height={gasH} fill="white" className="dark:fill-gray-800" />}
        {gasH > 0 && DOTS.slice(0, 9).map(([u, v], i) => <circle key={i} cx={314 + u * 42} cy={44 + v * (gasH - 8)} r={3.2} fill={gas.color} stroke="#475569" strokeWidth="0.6" />)}
        <path d="M 310 172 L 310 40 L 360 40 L 360 172" fill="none" className={tube} strokeWidth="1.8" />
        <path d="M 67 84 L 67 60 L 240 60 L 240 182 L 330 182 L 330 160" fill="none" className={tube} strokeWidth="2.5" />
        {soluble &&
          [0, 1, 2].map(i => <circle key={i} cx={334 + i * 8} cy={150 - i * 12} r={2.5} fill={gas.color} opacity={0.9 - i * 0.3} />)}
        {soluble && (
          <text x={385} y={70} fontSize="11" className="fill-rose-600 dark:fill-rose-400">
            <tspan x={372}>газът се</tspan>
            <tspan x={372} dy={14}>разтваря</tspan>
            <tspan x={372} dy={14}>във водата</tspan>
          </text>
        )}
      </g>
    );
  }

  // Буркан с отвора нагоре или надолу; тръбата стига до дъното му
  const up = method === 'up';
  const [x0, x1] = [300, 370];
  const [yTop, yBot] = up ? [80, 190] : [40, 150];
  const open = up ? yTop : yBot;
  const closed = up ? yBot : yTop;
  // Газът остава в съда, ако „дъното“ е откъм неговата посока (тежкият газ – долу, лекият – горе)
  const stays = up ? !lighter : lighter;
  const inside = stays ? DOTS : DOTS.slice(0, 4);
  const h = yBot - yTop;
  return (
    <g>
      <path
        d={up ? `M ${x0} ${yTop} L ${x0} ${yBot} L ${x1} ${yBot} L ${x1} ${yTop}` : `M ${x0} ${yBot} L ${x0} ${yTop} L ${x1} ${yTop} L ${x1} ${yBot}`}
        fill="none"
        className={tube}
        strokeWidth="1.8"
      />
      <path
        d={up ? `M 67 84 L 67 50 L 335 50 L 335 ${closed - 8}` : `M 67 84 L 67 60 L 240 60 L 240 192 L 335 192 L 335 ${closed + 8}`}
        fill="none"
        className={tube}
        strokeWidth="2.5"
      />
      {inside.map(([u, v], i) => (
        <circle key={i} cx={x0 + 6 + u * (x1 - x0 - 12)} cy={(up ? yBot - 6 - v * (h - 12) : yTop + 6 + v * (h - 12))} r={3.2} fill={gas.color} stroke="#475569" strokeWidth="0.6" />
      ))}
      {!stays &&
        [0, 1, 2, 3].map(i => (
          <circle key={i} cx={x0 + 10 + i * 16} cy={up ? open - 12 - (i % 2) * 14 : open + 14 + (i % 2) * 14} r={3.2} fill={gas.color} stroke="#475569" strokeWidth="0.6" opacity={0.7} />
        ))}
      {!stays && (
        <text fontSize="11" className="fill-rose-600 dark:fill-rose-400">
          {(up ? ['↑ лекият', 'газ излиза'] : ['↓ тежкият', 'газ изтича']).map((line, i) => (
            <tspan key={i} x={384} y={(up ? 70 : 160) + i * 14}>
              {line}
            </tspan>
          ))}
        </text>
      )}
      {good && stays && (
        <text fontSize="11" className="fill-emerald-700 dark:fill-emerald-400">
          {['✓ газът', 'изтиква', 'въздуха'].map((line, i) => (
            <tspan key={i} x={384} y={(up ? 120 : 80) + i * 14}>
              {line}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
}

/** Получаване и събиране на газ: начинът зависи от плътността и разтворимостта. */
export default function GasCollectionLab() {
  const [gi, setGi] = useState(0);
  const [method, setMethod] = useState<Method>('water');
  const gas = GASES[gi];
  const D = gas.M / 29;
  const good = gas.ok.includes(method);

  let verdict: string;
  if (method === 'water') {
    verdict = gas.sol > 1 ? `Не става: ${gas.def} се разтваря добре във вода (около ${fmt(gas.sol, gas.sol < 10 ? 1 : 0)} обема в 1 обем вода).` : `Добре: ${gas.def} почти не се разтваря във вода и я изтиква от цилиндъра.`;
    if (gas.f === 'CO₂') verdict = 'Може, но с загуби: въглеродният диоксид се разтваря умерено (около 0,9 обема в 1 обем вода).';
  } else if (method === 'up') {
    verdict = D > 1 ? `Добре: ${gas.def} е по-тежък от въздуха (D = ${fmt(D)}) и се събира на дъното.` : `Не става: ${gas.def} е по-лек от въздуха (D = ${fmt(D)}) и излиза през отвора.`;
  } else {
    verdict = D < 1 ? `Добре: ${gas.def} е по-лек от въздуха (D = ${fmt(D)}) и се събира горе в обърнатия съд.` : `Не става: ${gas.def} е по-тежък от въздуха (D = ${fmt(D)}) и изтича надолу.`;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {GASES.map((g, i) => (
          <DiagramButton key={g.f} active={i === gi} onClick={() => setGi(i)}>
            {g.f}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {METHODS.map(x => (
          <DiagramButton key={x.m} active={x.m === method} onClick={() => setMethod(x.m)}>
            {x.label}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 210" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <Flask color={gas.color} />
        <Collector gas={gas} method={method} />
      </LabSvg>

      <p className="text-center text-sm sm:text-base mt-2 text-gray-800 dark:text-gray-100">{gas.eq}</p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'M =', value: `${gas.M} g/mol`, tone: 'blue' },
            { label: 'D спрямо въздуха =', value: fmt(D), tone: D > 1 ? 'rose' : 'emerald' },
            { label: 'разтворимост:', value: `≈ ${gas.sol < 1 ? fmt(gas.sol, 2 + (gas.sol < 0.1 ? 1 : 0)) : fmt(gas.sol, gas.sol < 10 ? 1 : 0)} обема в 1 обем вода`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={good ? 'emerald' : 'amber'}>{verdict}</Note>
      <p className="mt-2 text-sm text-center text-gray-700 dark:text-gray-300">
        <strong>Как се доказва:</strong> {gas.test}.{gas.note ? ` ${gas.note}` : ''}
      </p>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Средната моларна маса на въздуха е около 29 g/mol. Газ с <i>M</i> &gt; 29 е по-тежък и се събира в съд с отвора нагоре, газ с{' '}
        <i>M</i> &lt; 29 – в обърнат съд. Над вода се събират само слабо разтворимите газове. Разтворимостите са приблизителни, при 20 °C
        и атмосферно налягане.
      </p>
    </div>
  );
}
