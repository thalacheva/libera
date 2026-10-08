import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';

const W = 600;

const pascal = (rows: number) => {
  const t: number[][] = [[1]];
  for (let n = 1; n <= rows; n++) t.push(Array.from({ length: n + 1 }, (_, k) => (k === 0 || k === n ? 1 : t[n - 1][k - 1] + t[n - 1][k])));
  return t;
};

/** Триъгълникът на Паскал: C(n, k) = C(n − 1, k − 1) + C(n − 1, k). */
export default function PascalLab() {
  const [rows, setRows] = useState(7);
  const [sel, setSel] = useState<[number, number]>([5, 2]);
  const [odd, setOdd] = useState(false);
  const t = pascal(rows);
  const [n, k] = sel[0] <= rows ? sel : [rows, Math.min(sel[1], rows)];

  const dx = (W - 20) / (rows + 1);
  const dy = Math.min(40, dx * 0.9);
  const H = (rows + 1) * dy + 10;
  const pos = (r: number, c: number) => ({ x: W / 2 + (c - r / 2) * dx, y: dy / 2 + 5 + r * dy });
  const font = rows > 12 ? 9 : rows > 9 ? 11 : 14;
  const isParent = (r: number, c: number) => r === n - 1 && (c === k - 1 || c === k);
  const rowSum = 2 ** n;

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-violet-200 dark:border-violet-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🔺 Триъгълникът на Паскал</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Всяко число е сборът на двете над него. Числото в ред n и позиция k е C(n, k). Щракни върху число.
      </p>
      <Buttons>
        <DiagramButton active={!odd} onClick={() => setOdd(false)}>
          числа
        </DiagramButton>
        <DiagramButton active={odd} onClick={() => setOdd(true)}>
          оцвети нечетните
        </DiagramButton>
      </Buttons>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-3 text-gray-700 dark:text-gray-300">
        {t.map((row, r) =>
          row.map((v, c) => {
            const p = pos(r, c);
            const active = r === n && c === k;
            const parent = !odd && isParent(r, c);
            const fill = odd
              ? v % 2
                ? 'fill-violet-500'
                : 'fill-gray-100 dark:fill-gray-700'
              : active
                ? 'fill-violet-600'
                : parent
                  ? 'fill-amber-400'
                  : r === n
                    ? 'fill-violet-100 dark:fill-violet-500/20'
                    : 'fill-gray-100 dark:fill-gray-700';
            return (
              <g key={`${r}-${c}`} onClick={() => setSel([r, c])} className="cursor-pointer">
                <circle cx={p.x} cy={p.y} r={Math.min(dx, dy) * 0.46} className={fill} />
                {!(odd && rows > 12) && (
                  <text
                    x={p.x}
                    y={p.y + font * 0.35}
                    fontSize={font}
                    textAnchor="middle"
                    fontWeight="700"
                    className={active || (odd && v % 2) ? 'fill-white' : 'fill-current'}
                  >
                    {v}
                  </text>
                )}
              </g>
            );
          }),
        )}
      </svg>

      <Sliders>
        <Slider label="редове" value={rows} onChange={setRows} min={4} max={16} step={1} tone="violet" />
      </Sliders>

      {odd ? (
        <Note tone="violet">Нечетните числа образуват фрактал – триъгълника на Серпински. Увеличи броя на редовете!</Note>
      ) : (
        <>
          <Formula>
            C({n}, {k}) = {n}! / ({k}! · {n - k}!) = {t[n][k]}
            {n > 0 && k > 0 && k < n ? ` = ${t[n - 1][k - 1]} + ${t[n - 1][k]}` : ''}
          </Formula>
          <Note tone="gray">
            Сборът на ред {n} е {t[n].join(' + ')} = 2^{n} = {rowSum} – броят на всички подмножества на множество с {n} елемента.
          </Note>
        </>
      )}
    </div>
  );
}
