import { useState, type ReactNode } from 'react';
import { AnswerBox, BigButton, Bubble, KeyCatcher, LevelPicker, NumPad, Problem, RoundBar, RoundDone } from './kit';
import { pick, praise, randInt, tryAgain } from './kidsMath';

// „Текстови задачи“: прочети, погледни модела с ленти, избери действието и пресметни.
// Моделът с ленти (както в сингапурската методика) показва какво е цялото, кои са частите и кое се търси.

type Op = '+' | '−' | '·' | ':';
type Level = 'addsub' | 'muldiv' | 'mixed';
const LEVELS = [
  { id: 'addsub', label: '+ и −' },
  { id: 'muldiv', label: '· и :' },
  { id: 'mixed', label: 'смесено' },
] as const;
const ROUND = 6;

type Model =
  | { kind: 'parts'; whole: number; parts: [number, number]; unknown: 'whole' | 1 }
  | { kind: 'compare'; big: number; small: number; unknown: 'big' | 'small' | 'diff'; names: [string, string] }
  | { kind: 'groups'; count: number; size: number; unknown: 'whole' | 'size' | 'count'; unit: string }
  | { kind: 'times'; small: number; k: number; unknown: 'big' | 'small'; names: [string, string] };

type Task = { text: string; op: Op; a: number; b: number; answer: number; model: Model; hint: string };

const NAMES = ['Ани', 'Боби', 'Вики', 'Иво', 'Мира', 'Дани', 'Ники', 'Еми'];
const THINGS = ['ябълки', 'череши', 'картички', 'топчета', 'сливи', 'гъби', 'мъниста'];

function two() {
  const A = pick(NAMES);
  let B = A;
  while (B === A) B = pick(NAMES);
  return [A, B] as const;
}

const ADD_SUB = ['total', 'left', 'more', 'fewer', 'diff'] as const;
const MUL_DIV = ['groups', 'share', 'boxes', 'times', 'timesFewer'] as const;

function makeTask(kind: (typeof ADD_SUB)[number] | (typeof MUL_DIV)[number]): Task {
  const [A, B] = two();
  const t = pick(THINGS);
  switch (kind) {
    case 'total': {
      const a = randInt(8, 45);
      const b = randInt(5, 40);
      return { text: `${A} събра ${a} ${t}, а ${B} – ${b}. Колко ${t} събраха заедно?`, op: '+', a, b, answer: a + b, model: { kind: 'parts', whole: a + b, parts: [a, b], unknown: 'whole' }, hint: '„Заедно“ – събираме частите.' };
    }
    case 'left': {
      const n = randInt(20, 90);
      const a = randInt(5, n - 5);
      return { text: `В кошницата имаше ${n} ${t}. ${A} взе ${a}. Колко ${t} останаха в кошницата?`, op: '−', a: n, b: a, answer: n - a, model: { kind: 'parts', whole: n, parts: [a, n - a], unknown: 1 }, hint: 'Нещо се маха от цялото – изваждаме.' };
    }
    case 'more': {
      const a = randInt(10, 50);
      const d = randInt(3, 30);
      return { text: `${A} има ${a} ${t}, а ${B} – с ${d} повече. Колко ${t} има ${B}?`, op: '+', a, b: d, answer: a + d, model: { kind: 'compare', big: a + d, small: a, unknown: 'big', names: [B, A] }, hint: '„С … повече“ – към по-малкото добавяме разликата.' };
    }
    case 'fewer': {
      const a = randInt(20, 70);
      const d = randInt(3, a - 5);
      return { text: `${A} има ${a} ${t}, а ${B} – с ${d} по-малко. Колко ${t} има ${B}?`, op: '−', a, b: d, answer: a - d, model: { kind: 'compare', big: a, small: a - d, unknown: 'small', names: [A, B] }, hint: '„С … по-малко“ – от по-голямото махаме разликата.' };
    }
    case 'diff': {
      const a = randInt(20, 80);
      const b = randInt(5, a - 3);
      return { text: `${A} има ${a} ${t}, а ${B} – ${b}. С колко повече ${t} има ${A}?`, op: '−', a, b, answer: a - b, model: { kind: 'compare', big: a, small: b, unknown: 'diff', names: [A, B] }, hint: '„С колко повече“ – търсим разликата, изваждаме.' };
    }
    case 'groups': {
      const k = randInt(2, 9);
      const s = randInt(2, 9);
      return { text: `В ${k} кутии има по ${s} ${t}. Колко ${t} има общо?`, op: '·', a: k, b: s, answer: k * s, model: { kind: 'groups', count: k, size: s, unknown: 'whole', unit: 'кутии' }, hint: 'Еднакви групи – умножаваме.' };
    }
    case 'share': {
      const k = randInt(2, 6);
      const s = randInt(2, 9);
      return { text: `${A} раздели ${k * s} ${t} по равно на ${k} приятели. По колко ${t} получи всеки?`, op: ':', a: k * s, b: k, answer: s, model: { kind: 'groups', count: k, size: s, unknown: 'size', unit: 'приятели' }, hint: '„По равно“ – делим.' };
    }
    case 'boxes': {
      const k = randInt(2, 9);
      const s = randInt(2, 9);
      return { text: `${k * s} ${t} се слагат по ${s} в кутия. Колко кутии ще се напълнят?`, op: ':', a: k * s, b: s, answer: k, model: { kind: 'groups', count: k, size: s, unknown: 'count', unit: 'кутии' }, hint: '„По … в кутия“ – колко пъти се събира, делим.' };
    }
    case 'times': {
      const s = randInt(2, 9);
      const k = randInt(2, 5);
      return { text: `${A} има ${s} ${t}, а ${B} – ${k} пъти повече. Колко ${t} има ${B}?`, op: '·', a: s, b: k, answer: s * k, model: { kind: 'times', small: s, k, unknown: 'big', names: [A, B] }, hint: '„… пъти повече“ – умножаваме.' };
    }
    default: {
      const s = randInt(2, 9);
      const k = randInt(2, 5);
      return { text: `${A} има ${s * k} ${t}, а ${B} – ${k} пъти по-малко. Колко ${t} има ${B}?`, op: ':', a: s * k, b: k, answer: s, model: { kind: 'times', small: s, k, unknown: 'small', names: [B, A] }, hint: '„… пъти по-малко“ – делим.' };
    }
  }
}

function newTask(level: Level, prev: Task | null): Task {
  for (;;) {
    const kinds = level === 'addsub' ? ADD_SUB : level === 'muldiv' ? MUL_DIV : [...ADD_SUB, ...MUL_DIV];
    const t = makeTask(pick(kinds as readonly (typeof ADD_SUB)[number][]));
    if (!prev || t.text !== prev.text) return t;
  }
}

const FIRST: Task = {
  text: 'Ани събра 24 ябълки, а Боби – 18. Колко ябълки събраха заедно?',
  op: '+',
  a: 24,
  b: 18,
  answer: 42,
  model: { kind: 'parts', whole: 42, parts: [24, 18], unknown: 'whole' },
  hint: '„Заедно“ – събираме частите.',
};

// ---------- Моделът с ленти ----------

const W = 400;
const X0 = 70;
const BAR = 28;

function Bar({ x, y, w, label, tone, q }: { x: number; y: number; w: number; label: string; tone: string; q?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={Math.max(w, 18)} height={BAR} rx="5" className={tone} strokeWidth="2" />
      <text x={x + Math.max(w, 18) / 2} y={y + BAR / 2 + 6} textAnchor="middle" fontSize="16" fontWeight="700" className={q ? 'fill-rose-600 dark:fill-rose-400' : 'fill-gray-800 dark:fill-gray-100'}>
        {label}
      </text>
    </g>
  );
}

/** Скоба над/под отсечката [x1, x2] с надпис. */
function Brace({ x1, x2, y, label, up, q }: { x1: number; x2: number; y: number; label: string; up?: boolean; q?: boolean }) {
  const d = up ? -8 : 8;
  return (
    <g>
      <path d={`M ${x1} ${y} v ${d} H ${x2} v ${-d}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x={(x1 + x2) / 2} y={y + d + (up ? -6 : 17)} textAnchor="middle" fontSize="16" fontWeight="700" className={q ? 'fill-rose-600 dark:fill-rose-400' : 'fill-gray-700 dark:fill-gray-200'}>
        {label}
      </text>
    </g>
  );
}

const SKY = 'fill-sky-200 stroke-sky-500 dark:fill-sky-900 dark:stroke-sky-500';
const PINK = 'fill-pink-200 stroke-pink-500 dark:fill-pink-900 dark:stroke-pink-500';
const AMBER = 'fill-amber-200 stroke-amber-500 dark:fill-amber-900 dark:stroke-amber-500';

function BarModel({ m }: { m: Model }) {
  const span = W - X0 - 10;
  let body: ReactNode;
  let h = 110;
  if (m.kind === 'parts') {
    const sc = span / m.whole;
    const w1 = m.parts[0] * sc;
    body = (
      <>
        <Brace x1={X0} x2={X0 + span} y={30} up label={m.unknown === 'whole' ? '?' : String(m.whole)} q={m.unknown === 'whole'} />
        <Bar x={X0} y={34} w={w1} label={String(m.parts[0])} tone={SKY} />
        <Bar x={X0 + w1} y={34} w={span - w1} label={m.unknown === 1 ? '?' : String(m.parts[1])} tone={PINK} q={m.unknown === 1} />
      </>
    );
    h = 80;
  } else if (m.kind === 'compare') {
    const sc = span / m.big;
    const ws = m.small * sc;
    body = (
      <>
        <text x={X0 - 8} y={30 + BAR / 2 + 5} textAnchor="end" fontSize="15" fill="currentColor">
          {m.names[0]}
        </text>
        <Bar x={X0} y={30} w={span} label={m.unknown === 'big' ? '?' : String(m.big)} tone={SKY} q={m.unknown === 'big'} />
        <text x={X0 - 8} y={70 + BAR / 2 + 5} textAnchor="end" fontSize="15" fill="currentColor">
          {m.names[1]}
        </text>
        <Bar x={X0} y={70} w={ws} label={m.unknown === 'small' ? '?' : String(m.small)} tone={PINK} q={m.unknown === 'small'} />
        <line x1={X0 + ws} x2={X0 + ws} y1={30 + BAR} y2={70 + BAR} stroke="currentColor" strokeDasharray="4 3" />
        <Brace x1={X0 + ws} x2={X0 + span} y={70 + BAR + 2} label={m.unknown === 'diff' ? '?' : String(m.big - m.small)} q={m.unknown === 'diff'} />
      </>
    );
    h = 135;
  } else if (m.kind === 'groups') {
    const seg = span / m.count;
    body = (
      <>
        <Brace x1={X0} x2={X0 + span} y={30} up label={m.unknown === 'whole' ? '?' : String(m.count * m.size)} q={m.unknown === 'whole'} />
        {Array.from({ length: m.count }, (_, i) => (
          <Bar key={i} x={X0 + i * seg} y={34} w={seg} label={m.unknown === 'size' ? (i === 0 ? '?' : '') : String(m.size)} tone={AMBER} q={m.unknown === 'size'} />
        ))}
        <Brace x1={X0} x2={X0 + span} y={34 + BAR + 2} label={m.unknown === 'count' ? `? ${m.unit}` : `${m.count} ${m.unit}`} q={m.unknown === 'count'} />
      </>
    );
    h = 100;
  } else {
    const big = m.small * m.k;
    const sc = span / big;
    body = (
      <>
        <text x={X0 - 8} y={30 + BAR / 2 + 5} textAnchor="end" fontSize="15" fill="currentColor">
          {m.names[0]}
        </text>
        <Bar x={X0} y={30} w={m.small * sc} label={m.unknown === 'small' ? '?' : String(m.small)} tone={PINK} q={m.unknown === 'small'} />
        <text x={X0 - 8} y={70 + BAR / 2 + 5} textAnchor="end" fontSize="15" fill="currentColor">
          {m.names[1]}
        </text>
        {Array.from({ length: m.k }, (_, i) => (
          <Bar key={i} x={X0 + i * m.small * sc} y={70} w={m.small * sc} label={m.unknown === 'small' ? '' : String(m.small)} tone={SKY} />
        ))}
        <Brace x1={X0} x2={X0 + span} y={70 + BAR + 2} label={m.unknown === 'big' ? '?' : `${big} (${m.k} пъти)`} q={m.unknown === 'big'} />
      </>
    );
    h = 135;
  }
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="w-full max-w-lg mx-auto block h-auto text-gray-700 dark:text-gray-200" role="img" aria-label="модел с ленти">
      {body}
    </svg>
  );
}

// ---------- Играта ----------

export default function WordGame() {
  const [level, setLevel] = useState<Level>('addsub');
  const [task, setTask] = useState<Task>(FIRST);
  const [phase, setPhase] = useState<'op' | 'num' | 'done'>('op');
  const [wrongOp, setWrongOp] = useState<Op | null>(null);
  const [value, setValue] = useState('');
  const [state, setState] = useState<'good' | 'bad' | undefined>();
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'info'; text: string } | null>(null);
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const reset = (t: Task) => {
    setTask(t);
    setPhase('op');
    setWrongOp(null);
    setValue('');
    setState(undefined);
    setMsg(null);
  };
  const changeLevel = (l: Level) => {
    setLevel(l);
    setDone(0);
    setMistakes(0);
    reset(newTask(l, task));
  };
  const again = () => {
    setDone(0);
    setMistakes(0);
    reset(newTask(level, task));
  };
  const chooseOp = (o: Op) => {
    if (phase !== 'op') return;
    if (o === task.op) {
      setPhase('num');
      setWrongOp(null);
      setMsg({ tone: 'info', text: `${task.hint} Сега пресметни.` });
    } else {
      setWrongOp(o);
      setMistakes(n => n + 1);
      setMsg({ tone: 'bad', text: `Не е ${o}. Погледни модела: какво търсим – цялото, част или разликата?` });
    }
  };
  const submit = () => {
    if (phase !== 'num' || value === '') return;
    if (Number(value) === task.answer) {
      setPhase('done');
      setState('good');
      setMsg({ tone: 'good', text: `${praise()} ${task.a} ${task.op} ${task.b} = ${task.answer}` });
    } else {
      setState('bad');
      setMistakes(n => n + 1);
      setMsg({ tone: 'bad', text: tryAgain() });
    }
  };
  const next = () => {
    setDone(d => d + 1);
    reset(newTask(level, task));
  };
  const type = (v: string) => {
    setValue(v);
    setState(undefined);
  };

  if (done >= ROUND)
    return (
      <>
        <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
        <RoundDone mistakes={mistakes} onAgain={again} />
      </>
    );

  return (
    <>
      <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
      <RoundBar done={done} total={ROUND} mistakes={mistakes} />
      <p className="text-center text-lg sm:text-xl font-medium text-gray-800 dark:text-gray-100 max-w-2xl mx-auto mb-2">{task.text}</p>
      <BarModel m={task.model} />
      {phase === 'op' && (
        <>
          <p className="text-center text-base text-gray-600 dark:text-gray-300 mt-2">Кое действие ще направиш?</p>
          <div className="flex justify-center gap-2 sm:gap-3 mt-2">
            {(['+', '−', '·', ':'] as Op[]).map(o => (
              <button
                key={o}
                onClick={() => chooseOp(o)}
                className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl ${o === '·' ? 'text-5xl leading-none' : 'text-3xl'} font-extrabold border-b-4 transition-all ${
                  wrongOp === o
                    ? 'bg-rose-200 border-rose-400 text-rose-800 motion-safe:animate-shake'
                    : 'bg-violet-100 border-violet-300 text-violet-800 hover:bg-violet-200 dark:bg-violet-900/40 dark:border-violet-700 dark:text-violet-200'
                }`}
                aria-label={`действие ${o}`}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}
      {msg && <Bubble tone={msg.tone}>{msg.text}</Bubble>}
      {phase === 'num' && (
        <KeyCatcher value={value} onChange={type} onSubmit={submit} maxLength={3}>
          <Problem>
            {task.a} {task.op} {task.b} = <AnswerBox value={value} state={state} />
          </Problem>
          <NumPad value={value} onChange={type} onSubmit={submit} maxLength={3} />
        </KeyCatcher>
      )}
      {phase === 'done' && (
        <div className="text-center mt-4">
          <BigButton onClick={next} tone="emerald">
            Следваща задача →
          </BigButton>
        </div>
      )}
    </>
  );
}
