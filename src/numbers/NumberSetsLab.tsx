import { useState } from 'react';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { Tex } from '~/MathText';

type Kind = 'N' | 'Z' | 'Q' | 'I';

// Числата идват в един и същ ред – без случайност, за да съвпада с HTML-а от prerender.
const NUMBERS: { tex: string; text: string; kind: Kind; why: string }[] = [
  { tex: '7', text: '7', kind: 'N', why: '7 е число, с което броим – естествено.' },
  { tex: '-3', text: '−3', kind: 'Z', why: '−3 е цяло, но не е естествено – с отрицателни числа не броим.' },
  { tex: '\\frac{3}{4}', text: '3/4', kind: 'Q', why: '3/4 е частно на две цели числа, но не е цяло.' },
  { tex: '\\sqrt{2}', text: '√2', kind: 'I', why: '√2 не може да се запише като дроб – доказали са го още древните гърци.' },
  { tex: '\\sqrt{9}', text: '√9', kind: 'N', why: '√9 = 3 – коренът не прави числото ирационално.' },
  { tex: '0{,}(3)', text: '0,(3)', kind: 'Q', why: '0,(3) = 1/3 – всяка периодична дроб е рационално число.' },
  { tex: '\\pi', text: 'π', kind: 'I', why: 'π е ирационално (Ламберт, 1761). 22/7 и 3,14 са само приближения.' },
  { tex: '-\\frac{12}{4}', text: '−12/4', kind: 'Z', why: '−12/4 = −3 – изглежда като дроб, но е цяло число.' },
  { tex: '0{,}1010010001\\ldots', text: '0,10100…', kind: 'I', why: 'Броят на нулите расте всеки път – цифрите никога не се повтарят периодично.' },
  { tex: '-2{,}5', text: '−2,5', kind: 'Q', why: '−2,5 = −5/2 – крайната десетична дроб е рационално число.' },
  { tex: '\\sqrt{2} \\cdot \\sqrt{8}', text: '√2·√8', kind: 'N', why: '√2 · √8 = √16 = 4 – произведението на две ирационални числа може да е естествено.' },
  { tex: '1 + \\sqrt{3}', text: '1+√3', kind: 'I', why: 'Ако 1 + √3 = r беше рационално, и √3 = r − 1 щеше да е рационално.' },
  { tex: '\\frac{22}{7}', text: '22/7', kind: 'Q', why: '22/7 = 3,(142857) е рационално – близо е до π, но не е π.' },
];

const CHOICES: { kind: Kind; label: string }[] = [
  { kind: 'N', label: 'естествено' },
  { kind: 'Z', label: 'цяло, не естествено' },
  { kind: 'Q', label: 'рационално, не цяло' },
  { kind: 'I', label: 'ирационално' },
];

// Области в SVG: вложени правоъгълници ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ, а вдясно – ирационалните.
const BOXES = [
  { name: 'ℝ  реални', x: 4, y: 4, w: 472, h: 252, cls: 'fill-gray-50 stroke-gray-300 dark:fill-gray-900/40 dark:stroke-gray-600' },
  { name: 'ℚ  рационални', x: 14, y: 30, w: 300, h: 216, cls: 'fill-sky-50 stroke-sky-300 dark:fill-sky-900/30 dark:stroke-sky-700' },
  { name: 'ℤ  цели', x: 24, y: 56, w: 196, h: 180, cls: 'fill-amber-50 stroke-amber-300 dark:fill-amber-900/30 dark:stroke-amber-700' },
  { name: 'ℕ', x: 34, y: 82, w: 92, h: 144, cls: 'fill-emerald-50 stroke-emerald-300 dark:fill-emerald-900/30 dark:stroke-emerald-700' },
];
// Центрове на колоните за числата във всяка област.
const COLUMN: Record<Kind, number[]> = { N: [80], Z: [173], Q: [267], I: [358, 430] };
const TOP = 125;
const ROW = 30;

/** Подреди числото в най-малкото множество, на което принадлежи. */
export default function NumberSetsLab() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Kind[]>([]);
  const answered = answers.length > index;
  const done = answers.length === NUMBERS.length;
  const current = NUMBERS[Math.min(index, NUMBERS.length - 1)];
  const score = answers.filter((a, i) => a === NUMBERS[i].kind).length;

  const placed = NUMBERS.slice(0, answers.length).map((n, i) => {
    const before = NUMBERS.slice(0, i).filter(m => m.kind === n.kind).length;
    const cols = COLUMN[n.kind];
    return { ...n, ok: answers[i] === n.kind, x: cols[before % cols.length], y: TOP + Math.floor(before / cols.length) * ROW };
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <svg viewBox="0 0 480 260" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {BOXES.map(b => (
          <g key={b.name}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="12" className={b.cls} strokeWidth="2" />
            <text x={b.x + 10} y={b.y + 19} fontSize="15" fontWeight="700" fill="currentColor">
              {b.name}
            </text>
          </g>
        ))}
        <text x={395} y={56} fontSize="15" fontWeight="700" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400">
          ирационални
        </text>
        {placed.map(p => (
          <g key={p.text}>
            <rect x={p.x - 33} y={p.y - 15} width="66" height="24" rx="12" className={p.ok ? 'fill-white stroke-emerald-500 dark:fill-gray-800' : 'fill-white stroke-red-500 dark:fill-gray-800'} strokeWidth="2" />
            <text x={p.x} y={p.y + 3} fontSize="14" textAnchor="middle" fill="currentColor">
              {p.text}
            </text>
          </g>
        ))}
      </svg>

      {!done && (
        <div className="text-center mt-3">
          <div className="text-2xl mb-1 text-gray-900 dark:text-gray-100">
            <Tex>{current.tex}</Tex>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Число {index + 1} от {NUMBERS.length}. Кое е най-тясното множество, в което попада?
          </p>
        </div>
      )}
      <Buttons>
        {!done &&
          !answered &&
          CHOICES.map(c => (
            <DiagramButton key={c.kind} onClick={() => setAnswers([...answers, c.kind])}>
              {c.label}
            </DiagramButton>
          ))}
        {answered && !done && <DiagramButton onClick={() => setIndex(index + 1)}>Следващо число →</DiagramButton>}
        {done && (
          <DiagramButton
            onClick={() => {
              setIndex(0);
              setAnswers([]);
            }}
          >
            Отначало
          </DiagramButton>
        )}
      </Buttons>
      {answered && (
        <Note tone={answers[index] === current.kind ? 'emerald' : 'rose'}>
          {answers[index] === current.kind ? '✓ Вярно! ' : '✗ Не съвсем. '}
          {current.why}
        </Note>
      )}
      {done && (
        <Note tone="violet">
          Позна {score} от {NUMBERS.length}. Забележи, че всяко естествено число е и цяло, и рационално, и реално – множествата са вложени едно в
          друго.
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Числото отива в най-малкото множество, което го съдържа: 7 е и цяло, и рационално, но го слагаме в ℕ. Зелена рамка – позна, червена –
        сгреши.
      </p>
    </div>
  );
}
