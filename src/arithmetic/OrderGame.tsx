import { useState } from 'react';
import { type ExprLevel, nextOps, randomExpr, reduceAt, type Tok, toText, valueAt } from './exprMath';
import { AnswerBox, BigButton, Bubble, KeyCatcher, LevelPicker, NumPad, RoundBar, RoundDone } from './kit';
import { praise, tryAgain } from './kidsMath';

// „Ред на действията“: детето докосва знака на действието, което се прави първо, и го пресмята.
// Изразът се „свива“ стъпка по стъпка, а отдолу се пише веригата: 3 + 4 · 2 = 3 + 8 = 11.

const LEVELS = [
  { id: 'two', label: 'без скоби' },
  { id: 'paren', label: 'със скоби' },
  { id: 'three', label: 'три действия' },
] as const;
const ROUND = 5;

const num = (v: number): Tok => ({ t: 'n', v });
const op = (v: '+' | '−' | '·' | ':'): Tok => ({ t: 'op', v });
// Първият израз е фиксиран (prerender): 3 + 4 · 2
const FIRST: Tok[] = [num(3), op('+'), num(4), op('·'), num(2)];

export default function OrderGame() {
  const [level, setLevel] = useState<ExprLevel>('two');
  const [toks, setToks] = useState<Tok[]>(FIRST);
  const [history, setHistory] = useState<string[]>([toText(FIRST)]);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongOp, setWrongOp] = useState<number | null>(null);
  const [value, setValue] = useState('');
  const [state, setState] = useState<'good' | 'bad' | undefined>();
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'info'; text: string } | null>(null);
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const finished = toks.length === 1;

  const load = (l: ExprLevel) => {
    const e = randomExpr(l);
    setToks(e.toks);
    setHistory([toText(e.toks)]);
    setPicked(null);
    setWrongOp(null);
    setValue('');
    setState(undefined);
    setMsg(null);
  };
  const changeLevel = (l: ExprLevel) => {
    setLevel(l);
    setDone(0);
    setMistakes(0);
    load(l);
  };
  const again = () => {
    setDone(0);
    setMistakes(0);
    load(level);
  };

  const tapOp = (i: number) => {
    if (finished || picked !== null) return;
    const ok = nextOps(toks);
    if (ok.includes(i)) {
      setPicked(i);
      setWrongOp(null);
      setMsg(null);
      return;
    }
    setWrongOp(i);
    setMistakes(n => n + 1);
    const inParens = (() => {
      let depth = 0;
      for (let j = 0; j < i; j++) depth += toks[j].t === '(' ? 1 : toks[j].t === ')' ? -1 : 0;
      return depth > 0;
    })();
    const hasParens = toks.some(t => t.t === '(');
    const v = (toks[i] as { v: string }).v;
    const text =
      hasParens && !inParens
        ? 'Първо се смята в скобите!'
        : (v === '+' || v === '−') && ok.some(j => ['·', ':'].includes((toks[j] as { v: string }).v))
          ? 'Умножението и делението са преди събирането и изваждането.'
          : 'Когато действията са равни по сила, вървим отляво надясно.';
    setMsg({ tone: 'bad', text });
  };

  const submit = () => {
    if (picked === null || value === '') return;
    const right = valueAt(toks, picked);
    if (Number(value) === right) {
      const nt = reduceAt(toks, picked);
      setToks(nt);
      setHistory(h => [...h, toText(nt)]);
      setPicked(null);
      setValue('');
      setState(undefined);
      setMsg(nt.length === 1 ? { tone: 'good', text: praise() } : null);
    } else {
      setState('bad');
      setMistakes(n => n + 1);
      setMsg({ tone: 'bad', text: tryAgain() });
    }
  };
  const next = () => {
    setDone(d => d + 1);
    load(level);
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
      <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 my-3 text-3xl sm:text-4xl font-bold tabular-nums text-gray-900 dark:text-white">
        {toks.map((t, i) => {
          if (t.t === 'op') {
            const sel = picked === i;
            return (
              <button
                key={i}
                onClick={() => tapOp(i)}
                aria-label={`действие ${t.v}`}
                className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full border-b-4 transition-all ${t.v === '·' ? 'text-5xl leading-none' : ''} ${
                  sel
                    ? 'bg-amber-400 border-amber-600 text-amber-950'
                    : wrongOp === i
                      ? 'bg-rose-200 border-rose-400 text-rose-800 motion-safe:animate-shake'
                      : 'bg-sky-100 border-sky-300 text-sky-800 hover:bg-sky-200 dark:bg-sky-900/40 dark:border-sky-700 dark:text-sky-200'
                }`}
              >
                {t.v}
              </button>
            );
          }
          const near = picked !== null && (i === picked - 1 || i === picked + 1);
          return (
            <span key={i} className={`px-0.5 rounded-lg ${near ? 'bg-amber-100 dark:bg-amber-900/40' : ''} ${t.t !== 'n' ? 'text-gray-400' : ''}`}>
              {t.t === 'n' ? t.v : t.t}
            </span>
          );
        })}
      </div>
      {/* веригата досега */}
      <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-300 tabular-nums">{history.join(' = ')}</p>
      {!finished && picked === null && !msg && <Bubble tone="info">Докосни знака на действието, което правим първо.</Bubble>}
      {msg && <Bubble tone={msg.tone}>{msg.text}</Bubble>}
      {picked !== null && (
        <KeyCatcher value={value} onChange={type} onSubmit={submit} maxLength={3}>
          <div className="text-center text-3xl sm:text-4xl font-bold my-3 tabular-nums text-gray-900 dark:text-white">
            {(toks[picked - 1] as { v: number }).v} {(toks[picked] as { v: string }).v} {(toks[picked + 1] as { v: number }).v} = <AnswerBox value={value} state={state} />
          </div>
          <NumPad value={value} onChange={type} onSubmit={submit} maxLength={3} />
        </KeyCatcher>
      )}
      {finished && (
        <div className="text-center mt-4">
          <BigButton onClick={next} tone="emerald">
            Следващ израз →
          </BigButton>
        </div>
      )}
    </>
  );
}
