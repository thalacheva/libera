import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { parseNum } from '~/drill';
import { formulaText, molarMass } from '../formula';

// Веществото, което претегляме, и разтвореното вещество в получения разтвор
const SUBSTANCES: { weigh: string; dissolved: string; name: string; note?: string }[] = [
  { weigh: 'NaCl', dissolved: 'NaCl', name: 'готварска сол' },
  { weigh: 'NaOH', dissolved: 'NaOH', name: 'натриева основа', note: 'NaOH поглъща влага и CO₂ от въздуха, затова в лабораторията концентрацията после се уточнява с титруване.' },
  { weigh: 'C6H12O6', dissolved: 'C6H12O6', name: 'глюкоза' },
  { weigh: 'CuSO4·5H2O', dissolved: 'CuSO4', name: 'син камък', note: 'Претегляме кристалохидрата CuSO₄·5H₂O, а 1 mol от него дава 1 mol CuSO₄ в разтвора.' },
];
const CONC = [0.1, 0.2, 0.5, 1];
const VOLUMES = [100, 250, 500, 1000];
const STEPS = [
  'Пресмятаме масата и я претегляме на везна.',
  'Разтваряме веществото в чаша с малко дестилирана вода.',
  'Преливаме разтвора в мерителната колба; изплакваме чашата и добавяме и тази вода.',
  'Допълваме с вода до чертата на гърлото (долният край на менискуса) и разклащаме.',
];
const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

/** Приготви разтвор с дадена моларна концентрация: колко грама да претеглиш. */
export default function PrepareSolutionLab() {
  const [sub, setSub] = useState(0);
  const [c, setC] = useState(0.1);
  const [v, setV] = useState(250);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState<number | null>(null);

  const s = SUBSTANCES[sub];
  const M = molarMass(s.weigh);
  const n = (c * v) / 1000;
  const m = n * M;
  const ok = checked !== null && Math.abs(checked - m) <= 0.01 * m;

  const reset = () => {
    setInput('');
    setChecked(null);
  };
  const check = () => setChecked(parseNum(input));

  // Подсказка според типичната грешка
  let hint = 'Провери: n = c · V (с V в литри), после m = n · M.';
  if (checked !== null && !ok) {
    if (Math.abs(checked - m * 1000) <= 0.01 * m * 1000) hint = 'Получи 1000 пъти повече – обемът трябва да е в литри: 250 mL = 0,250 L.';
    else if (s.weigh !== s.dissolved && Math.abs(checked - n * molarMass(s.dissolved)) <= 0.01 * m)
      hint = `Използва моларната маса на безводния ${formulaText(s.dissolved)}. Но претегляш кристалохидрата – с водата в него M = ${fmt(M, 1)} g/mol.`;
    else if (Math.abs(checked - c * M) <= 0.01 * c * M) hint = 'Това е масата за 1 L разтвор. Умножи по обема на колбата в литри.';
  }

  const shown = checked !== null && !Number.isNaN(checked) ? checked : 0;
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SUBSTANCES.map((x, i) => (
          <DiagramButton
            key={x.weigh}
            active={i === sub}
            onClick={() => {
              setSub(i);
              reset();
            }}
          >
            {formulaText(x.weigh)}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {CONC.map(x => (
          <DiagramButton
            key={x}
            active={x === c}
            onClick={() => {
              setC(x);
              reset();
            }}
          >
            {fmt(x, 1)} mol/L
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {VOLUMES.map(x => (
          <DiagramButton
            key={x}
            active={x === v}
            onClick={() => {
              setV(x);
              reset();
            }}
          >
            {x} mL
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 200" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* Везна */}
        <rect x={40} y={130} width={160} height={50} rx="8" className="fill-gray-200 stroke-gray-400 dark:fill-gray-700" strokeWidth="1.5" />
        <rect x={70} y={142} width={100} height={28} rx="4" className="fill-gray-900" />
        <text x={120} y={162} fontSize="16" fontFamily="ui-monospace, monospace" textAnchor="middle" className={ok ? 'fill-emerald-400' : 'fill-gray-300'}>
          {`${fmt(shown, 3)} g`}
        </text>
        <rect x={60} y={118} width={120} height={8} rx="3" className="fill-gray-400" />
        {shown > 0 && <path d="M 95 118 Q 120 96 145 118 Z" className={s.weigh.includes('Cu') ? 'fill-sky-500' : 'fill-gray-100 stroke-gray-400'} />}
        <text x={120} y={196} fontSize="12" textAnchor="middle" fill="currentColor">
          {formulaText(s.weigh)}
        </text>

        {/* Мерителна колба */}
        <path d="M 351 20 L 351 98 A 50 50 0 1 0 369 98 L 369 20" className="fill-none stroke-gray-500 dark:stroke-gray-400" strokeWidth="2.5" />
        {ok && <circle cx={360} cy={147} r={48} className={s.dissolved === 'CuSO4' ? 'fill-sky-400/60' : 'fill-sky-100/80 dark:fill-sky-300/30'} />}
        {ok && <rect x={352} y={50} width={16} height={50} className={s.dissolved === 'CuSO4' ? 'fill-sky-400/60' : 'fill-sky-100/80 dark:fill-sky-300/30'} />}
        <line x1={344} x2={376} y1={50} y2={50} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="1.5" />
        <text x={386} y={54} fontSize="12" fill="currentColor">
          {`${v} mL`}
        </text>
      </LabSvg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3 text-sm text-gray-700 dark:text-gray-300">
        <span>
          {`${fmt(c, 1)} mol/L ${s.name}, ${v} mL → претегли`}
        </span>
        <input
          type="text"
          inputMode="decimal"
          aria-label="Маса в грамове"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setChecked(null);
          }}
          onKeyDown={e => e.key === 'Enter' && check()}
          className="w-24 px-2 py-1 rounded-lg border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 text-center font-mono"
        />
        <span>g</span>
        <button onClick={check} className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition">
          Претегли
        </button>
      </div>

      {checked !== null && (
        <Note tone={ok ? 'emerald' : 'rose'}>{ok ? `✓ Точно така: m = ${fmt(m, 3)} g.` : `✗ ${hint}`}</Note>
      )}
      {ok && (
        <>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'n = c · V =', value: `${fmt(c, 1)} · ${fmt(v / 1000, 3)} = ${fmt(n, 4)} mol`, tone: 'violet' },
                { label: 'm = n · M =', value: `${fmt(n, 4)} · ${fmt(M, 1)} = ${fmt(m, 3)} g`, tone: 'blue' },
              ]}
            />
          </div>
          <ol className="mt-3 max-w-xl mx-auto list-decimal pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {STEPS.map(st => (
              <li key={st}>{st}</li>
            ))}
          </ol>
          {s.note && <Note tone="blue">{s.note}</Note>}
        </>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Избери вещество, концентрация и колба, пресметни масата и я въведи (до 1% грешка се приема). Моларните маси са с училищно закръглени
        атомни маси: M(NaCl) = 58,5 g/mol, M(CuSO₄·5H₂O) = 249,5 g/mol.
      </p>
    </div>
  );
}
