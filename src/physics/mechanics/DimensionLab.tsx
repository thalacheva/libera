import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, ZoomingSvg } from '~/geometry/diagram';
import { Tex } from '~/MathText';

/** Размерност като степени на [M, L, T] – маса, дължина, време. */
type Dim = [number, number, number];
type Quantity = { symbol: string; name: string; dim: Dim };
type Problem = { title: string; target: Quantity; given: [Quantity, Quantity, Quantity]; formula: string; note: string };

const m: Quantity = { symbol: 'm', name: 'маса', dim: [1, 0, 0] };
const g: Quantity = { symbol: 'g', name: 'земно ускорение', dim: [0, 1, -2] };

const PROBLEMS: Problem[] = [
  {
    title: 'Махало',
    target: { symbol: 'T', name: 'период', dim: [0, 0, 1] },
    given: [m, { symbol: 'l', name: 'дължина на нишката', dim: [0, 1, 0] }, g],
    formula: 'T = 2\\pi\\sqrt{\\frac{l}{g}}',
    note: 'Периодът не зависи от масата – това е открил още Галилей.',
  },
  {
    title: 'Свободно падане',
    target: { symbol: 't', name: 'време за падане', dim: [0, 0, 1] },
    given: [{ symbol: 'h', name: 'височина', dim: [0, 1, 0] }, g, m],
    formula: 't = \\sqrt{\\frac{2h}{g}}',
    note: 'Без въздух тежкото и лекото тяло падат еднакво бързо.',
  },
  {
    title: 'Пружина',
    target: { symbol: 'T', name: 'период', dim: [0, 0, 1] },
    given: [m, { symbol: 'k', name: 'коефициент на еластичност (N/m)', dim: [1, 0, -2] }, { symbol: 'A', name: 'амплитуда', dim: [0, 1, 0] }],
    formula: 'T = 2\\pi\\sqrt{\\frac{m}{k}}',
    note: 'Периодът не зависи от амплитудата – затова пружините и махалата стават за часовници.',
  },
  {
    title: 'Вълни в морето',
    target: { symbol: 'v', name: 'скорост на вълната', dim: [0, 1, -1] },
    given: [g, { symbol: 'λ', name: 'дължина на вълната', dim: [0, 1, 0] }, { symbol: 'ρ', name: 'плътност на водата', dim: [1, -3, 0] }],
    formula: 'v = \\sqrt{\\frac{g\\lambda}{2\\pi}}',
    note: 'Дългите вълни в дълбока вода бягат по-бързо от късите.',
  },
  {
    title: 'Орбита',
    target: { symbol: 'v', name: 'орбитална скорост', dim: [0, 1, -1] },
    given: [{ symbol: 'G', name: 'гравитационна константа', dim: [-1, 3, -2] }, { symbol: 'M', name: 'маса на планетата', dim: [1, 0, 0] }, { symbol: 'r', name: 'радиус на орбитата', dim: [0, 1, 0] }],
    formula: 'v = \\sqrt{\\frac{GM}{r}}',
    note: 'Тук константата е точно 1 – виж лекцията „Орбити и скорости“.',
  },
];

const BASE = ['M', 'L', 'T'];
const BASE_NAME = ['маса (kg)', 'дължина (m)', 'време (s)'];

/** Степен като LaTeX: 0,5 → \frac{1}{2}. */
const expTex = (e: number) => (Number.isInteger(e) ? String(e) : `${e < 0 ? '-' : ''}\\frac{${Math.abs(e * 2)}}{2}`);

/** Размерност като LaTeX: [1, 1, −2] → M L T^{-2}. */
function dimTex(d: Dim) {
  const parts = d.map((e, i) => (e === 0 ? '' : e === 1 ? BASE[i] : `${BASE[i]}^{${expTex(e)}}`)).filter(Boolean);
  return parts.length ? parts.join('\\,') : '1';
}

/** Анализ на размерностите: търсим степените, при които двете страни имат една и съща размерност. */
export default function DimensionLab() {
  const [k, setK] = useState(0);
  const [exps, setExps] = useState<Dim>([0, 0, 0]);
  const P = PROBLEMS[k];

  const right: Dim = [0, 1, 2].map(i => P.given.reduce((s, q, j) => s + q.dim[i] * exps[j], 0)) as Dim;
  const ok = right.every((e, i) => e === P.target.dim[i]);

  const choose = (i: number) => {
    setK(i);
    setExps([0, 0, 0]);
  };
  const setExp = (j: number) => (v: number) => setExps(exps.map((e, i) => (i === j ? v : e)) as Dim);

  // Стълбчета: целевата степен (контур) и получената (запълнено) за M, L, T
  const unit = 22;
  const zero = 110;
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PROBLEMS.map((p, i) => (
          <DiagramButton key={p.title} active={i === k} onClick={() => choose(i)}>
            {p.title}
          </DiagramButton>
        ))}
      </Buttons>

      <p className="text-center text-lg mt-4 text-gray-800 dark:text-gray-100">
        <Tex>{`${P.target.symbol} = C \\cdot ${P.given.map((q, j) => `${q.symbol}^{${exps[j] === 0 ? '\\,0' : expTex(exps[j])}}`).join(' \\cdot ')}`}</Tex>
      </p>
      <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
        {P.target.symbol} – {P.target.name}; {P.given.map(q => `${q.symbol} – ${q.name}`).join('; ')}
      </p>

      <ZoomingSvg viewBox="0 0 480 220">
        <line x1={40} y1={zero} x2={460} y2={zero} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {[-4, -3, -2, -1, 1, 2, 3, 4].map(v => (
          <line key={v} x1={40} y1={zero - v * unit} x2={460} y2={zero - v * unit} className="stroke-gray-100 dark:stroke-gray-700/50" />
        ))}
        {[-4, -2, 2, 4].map(v => (
          <Label key={v} p={{ x: 30, y: zero - v * unit }} size={10} anchor="end">
            {String(v).replace('-', '−')}
          </Label>
        ))}
        {BASE.map((b, i) => {
          const cx = 110 + i * 140;
          const want = P.target.dim[i];
          const got = Math.max(-4.8, Math.min(4.8, right[i]));
          const same = right[i] === want;
          return (
            <g key={b}>
              <rect
                x={cx - 36}
                y={zero - Math.max(want, 0) * unit}
                width={72}
                height={Math.max(Math.abs(want) * unit, 2)}
                fill="none"
                className="stroke-gray-500 dark:stroke-gray-400"
                strokeWidth="2"
                strokeDasharray="5 4"
              />
              <rect
                x={cx - 24}
                y={zero - Math.max(got, 0) * unit}
                width={48}
                height={Math.max(Math.abs(got) * unit, 2)}
                className={same ? 'fill-emerald-500/70' : 'fill-rose-500/60'}
              />
              <Label p={{ x: cx, y: 12 }} size={15} tone={same ? 'emerald' : 'rose'}>
                {`${b}: ${same ? '✓' : '✗'}`}
              </Label>
              <Label p={{ x: cx, y: 208 }} size={11}>
                {BASE_NAME[i]}
              </Label>
            </g>
          );
        })}
      </ZoomingSvg>

      <Sliders>
        {P.given.map((q, j) => (
          <Slider key={q.symbol + j} label={`${q.symbol}`} value={exps[j]} onChange={setExp(j)} min={-2} max={2} step={0.5} tone={(['blue', 'violet', 'amber'] as const)[j]} />
        ))}
      </Sliders>

      <p className="text-center mt-3 text-gray-800 dark:text-gray-100">
        <Tex>{`[\\text{лява страна}] = ${dimTex(P.target.dim)} \\qquad [\\text{дясна страна}] = ${dimTex(right)}`}</Tex>
      </p>
      {ok ? (
        <div className="mt-3 text-center text-sm sm:text-base text-emerald-700 dark:text-emerald-400">
          ✓ Размерностите съвпадат! Точната формула е <Tex>{P.formula}</Tex>. {P.note}
        </div>
      ) : (
        <Note tone="gray">Нагласи степените, докато стълбчетата запълнят пунктирните рамки.</Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Пунктирът показва размерността на лявата страна, а цветното стълбче – на дясната при избраните степени. Анализът намира формулата с
        точност до безразмерна константа C – числа като 2π и 2 той не „вижда“.
      </p>
    </div>
  );
}
