import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { fracText } from '~/algebra/fractionMath';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';

type Kind = 'sum' | 'atLeast' | 'double' | 'six';
const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

/** Два зара: благоприятни изходи в таблицата 6 × 6. */
export default function TwoDiceLab() {
  const [kind, setKind] = useState<Kind>('sum');
  const [s, setS] = useState(7);

  const ok = (a: number, b: number) =>
    kind === 'sum' ? a + b === s : kind === 'atLeast' ? a + b >= s : kind === 'double' ? a === b : a === 6 || b === 6;
  const all = Array.from({ length: 36 }, (_, i) => [Math.floor(i / 6) + 1, (i % 6) + 1]);
  const good = all.filter(([a, b]) => ok(a, b)).length;
  const counts = Array.from({ length: 11 }, (_, i) => all.filter(([a, b]) => a + b === i + 2).length);
  const label = { sum: `сборът е ${s}`, atLeast: `сборът е поне ${s}`, double: 'двата зара са еднакви', six: 'поне една шестица' }[kind];

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-violet-200 dark:border-violet-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🎲🎲 Два зара</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        36-те наредени двойки (първи зар; втори зар) са равновероятни. Броим кои от тях са благоприятни за събитието.
      </p>
      <Buttons>
        <DiagramButton active={kind === 'sum'} onClick={() => setKind('sum')}>
          сбор = s
        </DiagramButton>
        <DiagramButton active={kind === 'atLeast'} onClick={() => setKind('atLeast')}>
          сбор ≥ s
        </DiagramButton>
        <DiagramButton active={kind === 'double'} onClick={() => setKind('double')}>
          дубъл
        </DiagramButton>
        <DiagramButton active={kind === 'six'} onClick={() => setKind('six')}>
          поне една 6
        </DiagramButton>
      </Buttons>
      {(kind === 'sum' || kind === 'atLeast') && (
        <Sliders>
          <Slider label="s" value={s} onChange={setS} min={2} max={12} step={1} tone="violet" />
        </Sliders>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mt-4 items-start">
        <div className="grid grid-cols-7 gap-1 max-w-xs mx-auto text-center">
          <span />
          {FACES.map(f => (
            <span key={`h${f}`} className="text-xl text-gray-500">
              {f}
            </span>
          ))}
          {FACES.map((f, i) => (
            <div key={f} className="contents">
              <span className="text-xl text-gray-500">{f}</span>
              {FACES.map((_, j) => (
                <span
                  key={j}
                  className={`aspect-square flex items-center justify-center rounded text-xs sm:text-sm font-mono ${
                    ok(i + 1, j + 1) ? 'bg-violet-500 text-white font-bold' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {i + j + 2}
                </span>
              ))}
            </div>
          ))}
        </div>

        <svg viewBox="0 0 330 190" className="w-full h-auto text-gray-700 dark:text-gray-300">
          {counts.map((c, i) => {
            const sum = i + 2;
            const hit = kind === 'sum' ? sum === s : kind === 'atLeast' ? sum >= s : false;
            const x = 10 + i * 28;
            const h = c * 24;
            return (
              <g key={sum}>
                <rect x={x} y={160 - h} width={22} height={h} rx={3} className={hit ? 'fill-violet-500' : 'fill-gray-300 dark:fill-gray-600'} />
                <text x={x + 11} y={154 - h} fontSize="11" textAnchor="middle" fill="currentColor">
                  {c}
                </text>
                <text x={x + 11} y={178} fontSize="12" textAnchor="middle" fill="currentColor" opacity="0.7">
                  {sum}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <Formula>
        P({label}) = {good}/36 = {fracText(good, 36)} ≈ {((good / 36) * 100).toFixed(1).replace('.', ',')}%
      </Formula>
      <Note tone="gray">Сборът 7 е най-вероятен – получава се по 6 начина. А 2 и 12 – само по един. Сборовете не са равновероятни!</Note>
    </div>
  );
}
