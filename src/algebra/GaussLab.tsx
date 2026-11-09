import { useMemo, useState } from 'react';
import { num } from '~/functions/functionMath';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

type Row = number[]; // 3 коефициента + дясна страна
type Step = { m: Row[]; text: string; changed: number | null; found?: string };

const SYSTEMS: { id: string; name: string; m: Row[] }[] = [
  { id: 'one', name: 'едно решение', m: [[1, 1, 1, 6], [2, 3, 1, 11], [1, -1, 2, 5]] },
  { id: 'many', name: 'безброй решения', m: [[1, 1, 1, 3], [1, 2, 3, 6], [2, 3, 4, 9]] },
  { id: 'none', name: 'няма решение', m: [[1, 1, 1, 3], [1, 2, 3, 6], [2, 3, 4, 10]] },
];
const VARS = ['x', 'y', 'z'];
const ORD = ['първия', 'втория', 'третия'];

const clean = (v: number) => (Math.abs(v) < 1e-9 ? 0 : v);
const signed = (v: number) => (v < 0 ? `−${num(-v)}` : num(v));

/** Уравнението, което съответства на ред: [2, 0, −1, 3] → „2x − z = 3“. */
function equation(r: Row) {
  const parts: string[] = [];
  r.slice(0, 3).forEach((v, k) => {
    if (v === 0) return;
    const abs = Math.abs(v);
    const coef = abs === 1 ? '' : num(abs);
    if (parts.length === 0) parts.push(`${v < 0 ? '−' : ''}${coef}${VARS[k]}`);
    else parts.push(`${v < 0 ? '−' : '+'} ${coef}${VARS[k]}`);
  });
  return `${parts.length ? parts.join(' ') : '0'} = ${signed(r[3])}`;
}

/** Прав ход (нули под диагонала) и обратен ход (заместване отдолу нагоре) – всяко действие е отделна стъпка. */
function solve(start: Row[]): Step[] {
  const m = start.map(r => [...r]);
  const steps: Step[] = [{ m: m.map(r => [...r]), text: 'Разширената матрица: всеки ред е едно уравнение, а след чертата са десните страни.', changed: null }];
  for (let k = 0; k < 2; k++) {
    for (let i = k + 1; i < 3; i++) {
      if (m[k][k] === 0 || m[i][k] === 0) continue;
      const f = m[i][k] / m[k][k];
      m[i] = m[i].map((v, j) => clean(v - f * m[k][j]));
      const how = f > 0 ? `изваждаме ${ORD[k]} ред${f === 1 ? '' : `, умножен по ${num(f)}`}` : `прибавяме ${ORD[k]} ред${f === -1 ? '' : `, умножен по ${num(-f)}`}`;
      const verb = f > 0 ? `От ${ORD[i]} ред` : `Към ${ORD[i]} ред`;
      steps.push({ m: m.map(r => [...r]), text: `${verb} ${how} – така ${VARS[k]} изчезва от ${ORD[i]} ред.`, changed: i });
    }
  }

  const contradiction = m.findIndex(r => r[0] === 0 && r[1] === 0 && r[2] === 0 && r[3] !== 0);
  if (contradiction >= 0) {
    steps.push({ m, text: `Последният ред гласи ${equation(m[contradiction])} – това е невъзможно. Системата няма решение.`, changed: contradiction });
    return steps;
  }
  const zero = m.findIndex(r => r.every(v => v === 0));
  if (zero >= 0) {
    steps.push({
      m,
      text: 'Последният ред гласи 0 = 0 – той не носи нова информация: третото уравнение следва от първите две. Остават две уравнения за три неизвестни, затова z може да е произволно число, а x и y се изразяват чрез него – решенията са безброй много.',
      changed: zero,
    });
    return steps;
  }

  // обратен ход
  const val: number[] = [0, 0, 0];
  const found: string[] = [];
  for (let i = 2; i >= 0; i--) {
    let rest = m[i][3];
    for (let j = i + 1; j < 3; j++) rest -= m[i][j] * val[j];
    val[i] = clean(rest / m[i][i]);
    found.unshift(`${VARS[i]} = ${signed(val[i])}`);
    const known = [i + 1, i + 2].filter(j => j < 3).map(j => `${VARS[j]} = ${signed(val[j])}`);
    steps.push({
      m,
      text: `Обратен ход: от ${ORD[i]} ред, ${equation(m[i])}${known.length ? `, като заместим ${known.join(' и ')}` : ''}, получаваме ${VARS[i]} = ${signed(val[i])}.`,
      changed: i,
      found: found.join(', '),
    });
  }
  return steps;
}

/** Метод на Гаус стъпка по стъпка: разширената матрица, уравненията до нея и действието на всяка стъпка. */
export default function GaussLab() {
  const [id, setId] = useState(SYSTEMS[0].id);
  const [step, setStep] = useState(0);
  const steps = useMemo(() => solve(SYSTEMS.find(s => s.id === id)!.m), [id]);
  const cur = steps[step];
  const last = step === steps.length - 1;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SYSTEMS.map(s => (
          <DiagramButton
            key={s.id}
            active={s.id === id}
            onClick={() => {
              setId(s.id);
              setStep(0);
            }}
          >
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>

      <div className="mt-4 flex justify-center">
        <table className="font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100 border-separate border-spacing-y-1">
          <tbody>
            {cur.m.map((r, i) => (
              <tr key={i} className={i === cur.changed ? 'bg-amber-100 dark:bg-amber-500/20' : ''}>
                {r.map((v, j) => (
                  <td
                    key={j}
                    className={`px-2 sm:px-3 py-1 text-right ${j === 3 ? 'border-l-2 border-gray-400 dark:border-gray-500' : ''} ${
                      j < 3 && j < i && v === 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
                    } ${i === cur.changed && j === 0 ? 'rounded-l-md' : ''}`}
                  >
                    {signed(v)}
                  </td>
                ))}
                <td className={`pl-3 sm:pl-5 pr-2 py-1 text-gray-500 dark:text-gray-400 whitespace-nowrap ${i === cur.changed ? 'rounded-r-md' : ''}`}>
                  {equation(r)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-center text-sm sm:text-base text-gray-700 dark:text-gray-200 min-h-[3rem]">
        <span className="font-semibold">
          Стъпка {step + 1} от {steps.length}.
        </span>{' '}
        {cur.text}
      </p>
      {cur.found && <Note tone="emerald">Намерено: {cur.found}</Note>}

      <div className="flex flex-wrap justify-center gap-2 mt-3">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-40"
        >
          Назад
        </button>
        <button
          onClick={() => setStep(last ? 0 : step + 1)}
          className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition"
        >
          {last ? 'Отначало' : 'Следваща стъпка'}
        </button>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Вдясно е уравнението, което съответства на всеки ред. Жълтият ред е този, който се променя в стъпката, а зелените нули – тези,
        които вече сме получили под диагонала.
      </p>
    </div>
  );
}
