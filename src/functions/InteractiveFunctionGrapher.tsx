import { Eye, EyeOff, Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Buttons, DiagramButton } from '~/geometry/diagram';
import { Curve, Plot } from './plot';

const MAX_FUNCTIONS = 6;

const COLORS = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const FUNCTIONS = ['sin', 'cos', 'tan', 'sqrt', 'abs', 'log', 'exp'];

const ZOOMS = [5, 10, 20];

const PRESETS = [
  { label: 'x²', fn: 'x^2' },
  { label: 'x³', fn: 'x^3' },
  { label: '√x', fn: 'sqrt(x)' },
  { label: '1/x', fn: '1/x' },
  { label: '|x|', fn: 'abs(x)' },
  { label: 'sin x', fn: 'sin(x)' },
  { label: 'cos x', fn: 'cos(x)' },
  { label: 'eˣ', fn: 'exp(x)' },
];

interface FunctionItem {
  id: number;
  expression: string;
  color: string;
  visible: boolean;
}

const TOKEN = /\s*(\d+(?:[.,]\d+)?|sqrt|sin|cos|tan|abs|log|exp|pi|π|x|e|\*\*|[-−+*/^()])/y;

/**
 * Превръща израз като „2x^2 − 3(x + 1)“ във функция.
 * Изразът се разбива на познати части (числа, x, аритметика, изброените функции),
 * така че нищо друго не може да бъде изпълнено.
 */
function compile(source: string): ((x: number) => number) | null {
  const input = source.toLowerCase().trim();
  if (!input) return null;

  const tokens: string[] = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < input.length) {
    const m = TOKEN.exec(input);
    if (!m) return null;
    tokens.push(m[1]);
    if (/^\s*$/.test(input.slice(TOKEN.lastIndex))) break;
  }

  const isValue = (t: string) => /^[\d.,]|^(x|e|pi|π)$/.test(t);
  const isFunction = (t: string) => FUNCTIONS.includes(t);
  let js = '';
  tokens.forEach((t, i) => {
    const prev = tokens[i - 1];
    // Неявно умножение: 2x, 2(x + 1), (x + 1)(x − 1), 3sin(x)
    if (prev && (isValue(prev) || prev === ')') && (isValue(t) || isFunction(t) || t === '(')) js += '*';
    if (isFunction(t)) js += `Math.${t}`;
    else if (t === 'pi' || t === 'π') js += 'Math.PI';
    else if (t === 'e') js += 'Math.E';
    else if (t === '^') js += '**';
    else if (t === '-' || t === '−') {
      // В JavaScript -x**2 е синтактична грешка, затова унарният минус става (−1)·
      js += !prev || prev === '(' || /^[-−+*/^]/.test(prev) ? '(-1)*' : '-';
    } else js += t.replace(',', '.');
  });

  try {
    const fn = new Function('x', `return (${js});`) as (x: number) => number;
    fn(1);
    return fn;
  } catch {
    return null;
  }
}

/** Свободен чертож на няколко функции едновременно. */
export function InteractiveFunctionGrapher() {
  const [functions, setFunctions] = useState<FunctionItem[]>([
    { id: 1, expression: 'x^2 - 3', color: COLORS[0], visible: true },
    { id: 2, expression: '2x + 1', color: COLORS[1], visible: true },
  ]);
  const [zoom, setZoom] = useState(10);

  const compiled = useMemo(() => functions.map(f => compile(f.expression)), [functions]);

  const update = (id: number, change: Partial<FunctionItem>) =>
    setFunctions(functions.map(f => (f.id === id ? { ...f, ...change } : f)));

  const add = (expression = '') => {
    if (functions.length >= MAX_FUNCTIONS) return;
    const used = new Set(functions.map(f => f.color));
    const color = COLORS.find(c => !used.has(c)) ?? COLORS[0];
    setFunctions([...functions, { id: Date.now(), expression, color, visible: true }]);
  };

  // Готовата функция заема първия празен ред, а ако няма такъв – добавя нов
  const applyPreset = (fn: string) => {
    const empty = functions.find(f => !f.expression.trim());
    if (empty) update(empty.id, { expression: fn });
    else add(fn);
  };

  return (
    <div className="space-y-3">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 space-y-2">
        {functions.map((func, i) => {
          const invalid = func.expression.trim() !== '' && !compiled[i];
          return (
            <div key={func.id} className="flex items-center gap-2">
              <button
                onClick={() => update(func.id, { visible: !func.visible })}
                className="flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                style={{ color: func.color }}
                title={func.visible ? 'Скрий' : 'Покажи'}
              >
                {func.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <span className="font-mono text-sm flex-shrink-0" style={{ color: func.color }}>
                y =
              </span>
              <input
                type="text"
                value={func.expression}
                onChange={e => update(func.id, { expression: e.target.value })}
                placeholder="напр. x^2 - 2x, sin(x), 1/x"
                spellCheck={false}
                className={`flex-1 min-w-0 px-2.5 py-1.5 font-mono text-sm rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
                  invalid
                    ? 'border-rose-400 focus:ring-rose-400/40'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/40'
                }`}
              />
              {functions.length > 1 && (
                <button
                  onClick={() => setFunctions(functions.filter(f => f.id !== func.id))}
                  className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  title="Изтрий"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          );
        })}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {functions.length < MAX_FUNCTIONS ? (
            <button
              onClick={() => add()}
              className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Plus size={14} /> Добави функция
            </button>
          ) : (
            <span />
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Може: + − * / ^ ( ), sin, cos, tan, sqrt, abs, log, exp, pi
          </p>
        </div>
      </div>

      <Plot
        x={[-zoom, zoom]}
        y={[-zoom * 0.75, zoom * 0.75]}
        hint="Пиши формули в полетата или избери готова функция. Окото скрива графиката, без да я изтрива."
        readout={
          <>
            <Buttons>
              {ZOOMS.map(z => (
                <DiagramButton key={z} onClick={() => setZoom(z)} active={z === zoom}>
                  ±{z}
                </DiagramButton>
              ))}
            </Buttons>
            <Buttons>
              {PRESETS.map(p => (
                <DiagramButton key={p.fn} onClick={() => applyPreset(p.fn)}>
                  <span className="font-mono">{p.label}</span>
                </DiagramButton>
              ))}
            </Buttons>
          </>
        }
      >
        {functions.map(
          (func, i) => func.visible && compiled[i] && <Curve key={func.id} f={compiled[i]} color={func.color} width={2.5} />
        )}
      </Plot>
    </div>
  );
}
