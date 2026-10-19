import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { Tex } from '~/MathText';

type State = 'yes' | 'water' | 'no';

const SUBSTANCES: { f: string; label: string; cls: string }[] = [
  { f: 'CaO', label: 'CaO', cls: 'основен оксид' },
  { f: 'CO2', label: 'CO₂', cls: 'киселинен оксид' },
  { f: 'H2O', label: 'H₂O', cls: 'вода' },
  { f: 'NaOH', label: 'NaOH', cls: 'алкална основа' },
  { f: 'Cu(OH)2', label: 'Cu(OH)₂', cls: 'неразтворима основа' },
  { f: 'HCl', label: 'HCl', cls: 'киселина' },
  { f: 'Na2CO3', label: 'Na₂CO₃', cls: 'сол' },
  { f: 'CuSO4', label: 'CuSO₄', cls: 'сол' },
];

// Ключ: двете вещества по реда в SUBSTANCES, разделени с „+“
const PAIRS: Record<string, { state: State; eq?: string; text: string }> = {
  'CaO+CO2': { state: 'yes', eq: 'CaO + CO_2 \\to CaCO_3', text: 'Основен и киселинен оксид дават сол.' },
  'CaO+H2O': { state: 'yes', eq: 'CaO + H_2O \\to Ca(OH)_2', text: 'Гасене на вар – основният оксид на активен метал с вода дава основа. Отделя се много топлина.' },
  'CaO+NaOH': { state: 'no', text: 'Основен оксид не реагира с основа – двете вещества имат основен характер.' },
  'CaO+Cu(OH)2': { state: 'no', text: 'Основен оксид и основа не реагират.' },
  'CaO+HCl': { state: 'yes', eq: 'CaO + 2HCl \\to CaCl_2 + H_2O', text: 'Основен оксид + киселина → сол + вода.' },
  'CaO+Na2CO3': { state: 'water', eq: 'Ca(OH)_2 + Na_2CO_3 \\to CaCO_3\\downarrow + 2NaOH', text: 'Сухи не реагират. Във вода CaO първо дава Ca(OH)₂, а той с содата дава утайка CaCO₃ – така някога са получавали NaOH.' },
  'CaO+CuSO4': { state: 'water', eq: 'Ca(OH)_2 + CuSO_4 \\to Cu(OH)_2\\downarrow + CaSO_4', text: 'Пряко – не. Във вода CaO дава Ca(OH)₂, който утаява синия Cu(OH)₂ (смес с гипс – бордолезовият разтвор за лозята).' },
  'CO2+H2O': { state: 'yes', eq: 'CO_2 + H_2O \\rightleftharpoons H_2CO_3', text: 'Киселинен оксид + вода → киселина. Реакцията е обратима и протича слабо – газираната вода е слабо кисела.' },
  'CO2+NaOH': { state: 'yes', eq: 'CO_2 + 2NaOH \\to Na_2CO_3 + H_2O', text: 'Киселинен оксид + основа → сол + вода. При излишък на CO₂ се получава кисела сол NaHCO₃.' },
  'CO2+Cu(OH)2': { state: 'no', text: 'В училищния курс приемаме, че неразтворимите основи практически не реагират с киселинни оксиди.' },
  'CO2+HCl': { state: 'no', text: 'Киселинен оксид не реагира с киселина.' },
  'CO2+Na2CO3': { state: 'water', eq: 'Na_2CO_3 + CO_2 + H_2O \\to 2NaHCO_3', text: 'В разтвор нормалната сол поглъща CO₂ и преминава в кисела сол.' },
  'CO2+CuSO4': { state: 'no', text: 'Киселинен оксид не реагира със сол на по-силна киселина.' },
  'H2O+NaOH': { state: 'no', text: 'NaOH се разтваря (с отделяне на топлина) и дисоциира, но не се получава ново вещество.' },
  'H2O+Cu(OH)2': { state: 'no', text: 'Cu(OH)₂ е неразтворим във вода.' },
  'H2O+HCl': { state: 'no', text: 'Газът HCl се разтваря и дисоциира – получава се солна киселина, но нов клас вещество не възниква.' },
  'H2O+Na2CO3': { state: 'no', text: 'Содата се разтваря; разтворът е основен, защото карбонатният йон взема протони от водата (хидролиза).' },
  'H2O+CuSO4': { state: 'yes', eq: 'CuSO_4 + 5H_2O \\to CuSO_4 \\cdot 5H_2O', text: 'Белият безводен CuSO₄ посинява – получава се кристалохидрат. Така се открива вода.' },
  'NaOH+Cu(OH)2': { state: 'no', text: 'Две основи не реагират. (Само в много концентриран NaOH Cu(OH)₂ слабо се разтваря.)' },
  'NaOH+HCl': { state: 'yes', eq: 'NaOH + HCl \\to NaCl + H_2O', text: 'Неутрализация: основа + киселина → сол + вода.' },
  'NaOH+Na2CO3': { state: 'no', text: 'Основа и сол с общ катион не реагират.' },
  'NaOH+CuSO4': { state: 'yes', eq: '2NaOH + CuSO_4 \\to Cu(OH)_2\\downarrow + Na_2SO_4', text: 'Алкална основа + сол → нова основа + нова сол. Пада синя утайка Cu(OH)₂.' },
  'Cu(OH)2+HCl': { state: 'yes', eq: 'Cu(OH)_2 + 2HCl \\to CuCl_2 + 2H_2O', text: 'Неразтворимите основи реагират с киселини – утайката се разтваря и разтворът става синьо-зелен.' },
  'Cu(OH)2+Na2CO3': { state: 'no', text: 'Неразтворима основа не реагира със сол.' },
  'Cu(OH)2+CuSO4': { state: 'no', text: 'Основа и сол с общ катион не реагират.' },
  'HCl+Na2CO3': { state: 'yes', eq: 'Na_2CO_3 + 2HCl \\to 2NaCl + H_2O + CO_2\\uparrow', text: 'По-силната киселина изтласква въглената, която се разпада на CO₂ и вода – разтворът „кипи“.' },
  'HCl+CuSO4': { state: 'no', text: 'Не се получава утайка, газ или вода – реакцията не протича.' },
  'Na2CO3+CuSO4': { state: 'yes', eq: '2CuSO_4 + 2Na_2CO_3 + H_2O \\to Cu_2(OH)_2CO_3\\downarrow + 2Na_2SO_4 + CO_2\\uparrow', text: 'Пада зеленикава утайка. Тя не е CuCO₃, а основната сол Cu₂(OH)₂CO₃ – същата като в малахита.' },
};

/** Всеки член на уравнението в свой \\mathrm – така KaTeX може да пренесе реда след „+“ и „→“. */
const eqTex = (eq: string) =>
  eq
    .split(/( \+ | \\to | \\rightleftharpoons )/)
    .map((part, i) => (i % 2 ? part : `\\mathrm{${part}}`))
    .join('');

const N = SUBSTANCES.length;
const LEFT = 70;
const TOP = 34;
const CELL = 50;

const key = (i: number, j: number) => (i < j ? `${SUBSTANCES[i].f}+${SUBSTANCES[j].f}` : `${SUBSTANCES[j].f}+${SUBSTANCES[i].f}`);

const FILL: Record<State, string> = {
  yes: 'fill-emerald-200 dark:fill-emerald-700/70',
  water: 'fill-amber-200 dark:fill-amber-700/70',
  no: 'fill-gray-200 dark:fill-gray-600',
};
const MARK: Record<State, string> = { yes: '✓', water: '≈', no: '✗' };

/** Таблица „кое с кое реагира“: щракни клетка, за да видиш уравнението. */
export default function ReactionMatrixLab() {
  const [sel, setSel] = useState<[number, number]>([1, 3]);
  const [shown, setShown] = useState<Set<string>>(() => new Set([key(1, 3)]));
  const [all, setAll] = useState(false);
  const pair = PAIRS[key(sel[0], sel[1])];
  const choose = (i: number, j: number) => {
    setSel([i, j]);
    setShown(prev => new Set(prev).add(key(i, j)));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 480 ${TOP + N * CELL + 6}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {SUBSTANCES.map((s, j) => (
          <text key={`c${s.f}`} x={LEFT + j * CELL + CELL / 2} y={TOP - 10} fontSize="11" fontWeight="600" textAnchor="middle" fill="currentColor">
            {s.label}
          </text>
        ))}
        {SUBSTANCES.map((s, i) => (
          <text key={`r${s.f}`} x={LEFT - 8} y={TOP + i * CELL + CELL / 2 + 4} fontSize="12" fontWeight="600" textAnchor="end" fill="currentColor">
            {s.label}
          </text>
        ))}
        {SUBSTANCES.map((_, i) =>
          SUBSTANCES.map((__, j) => {
            const x = LEFT + j * CELL;
            const y = TOP + i * CELL;
            if (i === j) return <rect key={`${i}-${j}`} x={x + 1} y={y + 1} width={CELL - 2} height={CELL - 2} rx="6" className="fill-gray-50 dark:fill-gray-900/40" />;
            const k = key(i, j);
            const p = PAIRS[k];
            const open = all || shown.has(k);
            const active = (sel[0] === i && sel[1] === j) || (sel[0] === j && sel[1] === i);
            return (
              <g key={`${i}-${j}`} onClick={() => choose(i, j)} className="cursor-pointer">
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={CELL - 2}
                  height={CELL - 2}
                  rx="6"
                  className={`${open ? FILL[p.state] : 'fill-white dark:fill-gray-800'} ${active ? 'stroke-blue-500' : 'stroke-gray-300 dark:stroke-gray-600'}`}
                  strokeWidth={active ? 3 : 1}
                />
                <text x={x + CELL / 2} y={y + CELL / 2 + 6} fontSize="17" fontWeight="700" textAnchor="middle" className={open ? 'fill-gray-800 dark:fill-gray-100' : 'fill-gray-300 dark:fill-gray-500'}>
                  {open ? MARK[p.state] : '?'}
                </text>
              </g>
            );
          })
        )}
      </LabSvg>

      <div className="mt-3 text-center">
        <p className="font-semibold text-gray-900 dark:text-gray-100">
          {SUBSTANCES[sel[0]].label} ({SUBSTANCES[sel[0]].cls}) + {SUBSTANCES[sel[1]].label} ({SUBSTANCES[sel[1]].cls})
        </p>
        {pair.eq && (
          <div className="mt-2">
            <Tex>{eqTex(pair.eq)}</Tex>
          </div>
        )}
      </div>
      <Note tone={pair.state === 'yes' ? 'emerald' : pair.state === 'water' ? 'amber' : 'gray'}>
        {pair.state === 'yes' ? '✓ Реагират. ' : pair.state === 'water' ? '≈ Само във воден разтвор. ' : '✗ Не реагират. '}
        {pair.text}
      </Note>
      <Buttons>
        <DiagramButton active={all} onClick={() => setAll(!all)}>
          {all ? 'Скрий неотворените' : 'Покажи всички'}
        </DiagramButton>
        <DiagramButton
          onClick={() => {
            setAll(false);
            setShown(new Set());
          }}
        >
          Отначало
        </DiagramButton>
      </Buttons>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Първо предположи, после щракни клетката: ✓ – реагират, ≈ – реагират само във воден разтвор (с участието на водата), ✗ – не
        реагират. Правилото на палеца: реагират вещества с противоположен характер (основен с киселинен), а реакциите между соли и основи
        или между две соли протичат, ако се получава утайка, газ или вода.
      </p>
    </div>
  );
}
