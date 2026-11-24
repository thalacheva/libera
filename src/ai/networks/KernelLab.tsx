import { useRef, useState } from 'react';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { conv2d, fromRows, type Grid } from './conv';

const N = 12;

const IMAGES: { label: string; grid: Grid }[] = [
  {
    label: 'квадрат',
    grid: fromRows(['000000000000', '000000000000', '000000000000', '000999999000', '000999999000', '000999999000', '000999999000', '000999999000', '000999999000', '000000000000', '000000000000', '000000000000']),
  },
  {
    label: 'буква Г',
    grid: fromRows(['000000000000', '000000000000', '009999999000', '009999999000', '009900000000', '009900000000', '009900000000', '009900000000', '009900000000', '009900000000', '000000000000', '000000000000']),
  },
  {
    label: 'диагонал',
    grid: fromRows(['990000000000', '099000000000', '009900000000', '000990000000', '000099000000', '000009900000', '000000990000', '000000099000', '000000009900', '000000000990', '000000000099', '000000000009']),
  },
  {
    label: 'плавен преход',
    grid: fromRows(Array.from({ length: N }, () => '001123456789')),
  },
  {
    label: 'точка',
    grid: fromRows(['000000000000', '000000000000', '000000000000', '000000000000', '000000000000', '000009000000', '000000000000', '000000000000', '000000000000', '000000000000', '000000000000', '000000000000']),
  },
];

const KERNELS: { label: string; cells: number[]; div: number; about: string }[] = [
  { label: 'вертикален ръб', cells: [-1, 0, 1, -1, 0, 1, -1, 0, 1], div: 1, about: 'Дясната колона минус лявата: изходът е голям само там, където яркостта се променя отляво надясно.' },
  { label: 'хоризонтален ръб', cells: [-1, -1, -1, 0, 0, 0, 1, 1, 1], div: 1, about: 'Долният ред минус горния: изходът е голям само там, където яркостта се променя отгоре надолу.' },
  { label: 'размазване', cells: [1, 1, 1, 1, 1, 1, 1, 1, 1], div: 9, about: 'Средното на деветте пиксела: резките граници се размиват.' },
  { label: 'изостряне', cells: [0, -1, 0, -1, 5, -1, 0, -1, 0], div: 1, about: 'Петкратно средният пиксел минус четирите му съседи: в равните области нищо не се променя, а разликите на границите се усилват.' },
  { label: 'нищо', cells: [0, 0, 0, 0, 1, 0, 0, 0, 0], div: 1, about: 'Единица в средата и нули наоколо: изходът повтаря входа (без най-външната рамка).' },
];

const num = (v: number, d = 2) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('bg-BG', { maximumFractionDigits: d }).replace('-', '−');
const gray = (v: number) => {
  const g = Math.round(255 * Math.min(1, Math.max(0, v)));
  return `rgb(${g},${g},${g})`;
};
/** Положителните стойности – червени, отрицателните – сини, нулата – бяла. */
const signed = (v: number, top: number) => {
  const t = Math.min(1, Math.abs(v) / top);
  const fade = Math.round(255 * (1 - t));
  return v >= 0 ? `rgb(255,${fade},${fade})` : `rgb(${fade},${fade},255)`;
};

/** Картинка 12 × 12, ядро 3 × 3 и получената карта на признака; докосни клетка от картата, за да видиш сметката ѝ. */
export default function KernelLab() {
  const [img, setImg] = useState<Grid>(IMAGES[0].grid);
  const [cells, setCells] = useState<number[]>(KERNELS[0].cells);
  const [div, setDiv] = useState(1);
  const [sel, setSel] = useState<{ r: number; c: number }>({ r: 4, c: 1 });
  const paint = useRef<number | null>(null);

  const kernel: Grid = [0, 1, 2].map(r => cells.slice(3 * r, 3 * r + 3).map(v => v / div));
  const out = conv2d(img, kernel);
  const top = Math.max(0.5, ...out.flat().map(Math.abs));
  const preset = KERNELS.find(k => k.div === div && k.cells.every((v, i) => v === cells[i]));
  const value = out[sel.r][sel.c];

  const setPixel = (r: number, c: number, v: number) => setImg(g => (g[r][c] === v ? g : g.map((row, i) => (i === r ? row.map((x, j) => (j === c ? v : x)) : row))));
  const bump = (i: number, d: number) => setCells(k => k.map((v, j) => (j === i ? Math.max(-9, Math.min(9, v + d)) : v)));
  const inWindow = (r: number, c: number) => r >= sel.r && r < sel.r + 3 && c >= sel.c && c < sel.c + 3;

  const caption = 'mb-1 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-4">
        <div>
          <p className={caption}>картинка 12 × 12 (докосвай, за да рисуваш)</p>
          <div
            className="grid w-60 sm:w-64 select-none border border-gray-400 dark:border-gray-500"
            style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))`, touchAction: 'manipulation' }}
            onPointerUp={() => (paint.current = null)}
            onPointerLeave={() => (paint.current = null)}
          >
            {img.map((row, r) =>
              row.map((v, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  aria-label={`пиксел на ред ${r + 1}, колона ${c + 1}`}
                  onPointerDown={e => {
                    e.currentTarget.releasePointerCapture?.(e.pointerId);
                    paint.current = v > 0.5 ? 0 : 1;
                    setPixel(r, c, paint.current);
                  }}
                  onPointerEnter={e => {
                    if (e.pointerType === 'mouse' && e.buttons === 1 && paint.current !== null) setPixel(r, c, paint.current);
                  }}
                  className="aspect-square"
                  style={{ background: gray(v), boxShadow: inWindow(r, c) ? 'inset 0 0 0 2px #c026d3' : 'inset 0 0 0 0.5px rgba(128,128,128,0.35)' }}
                />
              ))
            )}
          </div>
        </div>

        <div>
          <p className={caption}>ядро 3 × 3{div !== 1 ? ` (всичко се дели на ${div})` : ''}</p>
          <div className="grid grid-cols-3 gap-1">
            {cells.map((v, i) => (
              <div key={i} className="flex flex-col items-center rounded border border-fuchsia-300 dark:border-fuchsia-700 bg-fuchsia-50 dark:bg-fuchsia-950/30">
                <button type="button" aria-label="увеличи с 1" onClick={() => bump(i, 1)} className="w-12 text-xs leading-5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  ▲
                </button>
                <span className="font-mono text-base font-bold text-gray-900 dark:text-gray-100">{String(v).replace('-', '−')}</span>
                <button type="button" aria-label="намали с 1" onClick={() => bump(i, -1)} className="w-12 text-xs leading-5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  ▼
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className={caption}>карта на признака 10 × 10 (докосни клетка)</p>
          <div className="grid w-52 select-none border border-gray-400 dark:border-gray-500" style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}>
            {out.map((row, r) =>
              row.map((v, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  aria-label={`изход на ред ${r + 1}, колона ${c + 1}: ${num(v)}`}
                  onClick={() => setSel({ r, c })}
                  className="aspect-square"
                  style={{ background: signed(v, top), boxShadow: sel.r === r && sel.c === c ? 'inset 0 0 0 2px #c026d3' : 'inset 0 0 0 0.5px rgba(128,128,128,0.35)' }}
                />
              ))
            )}
          </div>
          <p className="mt-1 text-center text-xs text-gray-600 dark:text-gray-400">
            <span className="inline-block h-2.5 w-2.5 align-middle" style={{ background: 'rgb(255,60,60)' }} /> положително{' '}
            <span className="ml-2 inline-block h-2.5 w-2.5 align-middle" style={{ background: 'rgb(60,60,255)' }} /> отрицателно
          </p>
        </div>
      </div>

      <div className="mx-auto mt-3 max-w-md rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-2 text-center font-mono text-xs sm:text-sm text-gray-800 dark:text-gray-100">
        <p className="mb-1 font-sans text-gray-600 dark:text-gray-400">
          сметката за избраната клетка (ред {sel.r + 1}, колона {sel.c + 1}): пиксел · тегло
        </p>
        {[0, 1, 2].map(i => (
          <p key={i}>
            {[0, 1, 2].map(j => `${num(img[sel.r + i][sel.c + j], 1)}·${cells[3 * i + j] < 0 ? `(${String(cells[3 * i + j]).replace('-', '−')})` : cells[3 * i + j]}`).join(' + ')}
            {i < 2 ? ' +' : ''}
          </p>
        ))}
        <p className="mt-1 font-bold text-fuchsia-700 dark:text-fuchsia-300">
          {div !== 1 ? `сборът, делен на ${div}, е ` : '= '}
          {num(value)}
        </p>
      </div>

      <Buttons>
        {KERNELS.map(k => (
          <DiagramButton
            key={k.label}
            active={preset === k}
            onClick={() => {
              setCells(k.cells);
              setDiv(k.div);
            }}
          >
            {k.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {IMAGES.map(m => (
          <DiagramButton key={m.label} active={img === m.grid} onClick={() => setImg(m.grid)}>
            {m.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Note tone={preset ? 'emerald' : 'gray'}>{preset ? preset.about : 'Твое собствено ядро. Забележи: ако сборът на теглата е 0, равните области дават изход 0 – ядрото реагира само на промени.'}</Note>
    </div>
  );
}
