import { useRef, useState } from 'react';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

const COLS = 5;
const ROWS = 7;

/** Цифрите от 0 до 9 с точки 5 × 7 – като на старите светещи табла. */
const TEMPLATES = [
  '01110 10001 10011 10101 11001 10001 01110',
  '00100 01100 00100 00100 00100 00100 01110',
  '01110 10001 00001 00010 00100 01000 11111',
  '11111 00010 00100 00010 00001 10001 01110',
  '00010 00110 01010 10010 11111 00010 00010',
  '11111 10000 11110 00001 00001 10001 01110',
  '00110 01000 10000 11110 10001 10001 01110',
  '11111 00001 00010 00100 01000 01000 01000',
  '01110 10001 10001 01110 10001 10001 01110',
  '01110 10001 10001 01111 00001 00010 01100',
].map(t => t.replace(/ /g, '').split('').map(Number));

/** Брой различни точки – за вектори от нули и единици това е и манхатънското разстояние, и квадратът на евклидовото. */
const differ = (a: number[], b: number[]) => a.reduce((s, v, i) => s + (v !== b[i] ? 1 : 0), 0);

/** Картинка 5 × 7 като вектор от 35 числа: рисуваш цифра и виждаш на кой образец е най-близо. */
export default function DigitLab() {
  const [pixels, setPixels] = useState<number[]>(TEMPLATES[3]);
  // При влачене с мишката всички точки стават като първата докосната
  const paint = useRef<number | null>(null);

  const set = (i: number, v: number) => setPixels(p => (p[i] === v ? p : p.map((x, k) => (k === i ? v : x))));

  const noise = () => {
    const next = pixels.slice();
    const picked = new Set<number>();
    while (picked.size < 3) picked.add(Math.floor(Math.random() * next.length));
    for (const i of picked) next[i] = 1 - next[i];
    setPixels(next);
  };

  const ranked = TEMPLATES.map((t, digit) => ({ digit, d: differ(pixels, t) })).sort((a, b) => a.d - b.d);
  const best = ranked[0];
  const tie = ranked[1].d === best.d;
  const maxD = Math.max(...ranked.map(r => r.d), 1);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="flex flex-wrap items-start justify-center gap-6">
        <div>
          <p className="mb-1 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">картинката (докосвай точките)</p>
          <div
            className="grid gap-1 select-none"
            style={{ gridTemplateColumns: `repeat(${COLS}, 2.25rem)`, touchAction: 'manipulation' }}
            onPointerUp={() => (paint.current = null)}
            onPointerLeave={() => (paint.current = null)}
          >
            {pixels.map((v, i) => (
              <button
                key={i}
                type="button"
                aria-label={`точка ${i + 1}: ${v ? 'включена' : 'изключена'}`}
                aria-pressed={v === 1}
                onPointerDown={e => {
                  e.currentTarget.releasePointerCapture?.(e.pointerId);
                  paint.current = 1 - v;
                  set(i, 1 - v);
                }}
                onPointerEnter={e => {
                  if (e.pointerType === 'mouse' && e.buttons === 1 && paint.current !== null) set(i, paint.current);
                }}
                className={`h-9 w-9 rounded border ${v ? 'bg-gray-900 border-gray-900 dark:bg-gray-100 dark:border-gray-100' : 'bg-gray-100 border-gray-300 dark:bg-gray-900/50 dark:border-gray-600'}`}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">същото като вектор от {COLS * ROWS} числа</p>
          <div className="grid gap-x-1.5 font-mono text-sm leading-9 text-gray-900 dark:text-gray-100" style={{ gridTemplateColumns: `repeat(${COLS}, 1rem)` }}>
            {pixels.map((v, i) => (
              <span key={i} className={`text-center ${v ? 'font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                {v}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[16rem]">
          <p className="mb-1 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">разстояние до всеки образец (брой различни точки)</p>
          <ul className="space-y-1">
            {ranked.map(r => (
              <li key={r.digit} className="flex items-center gap-2 text-sm">
                <span className={`w-4 text-center font-mono font-bold ${r.d === best.d ? 'text-fuchsia-700 dark:text-fuchsia-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.digit}</span>
                <span className="h-3 flex-1 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                  <span className={`block h-full ${r.d === best.d ? 'bg-fuchsia-500' : 'bg-gray-400 dark:bg-gray-500'}`} style={{ width: `${(r.d / maxD) * 100}%` }} />
                </span>
                <span className="w-6 text-right font-mono text-gray-900 dark:text-gray-100">{r.d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Buttons>
        {TEMPLATES.map((t, digit) => (
          <DiagramButton key={digit} onClick={() => setPixels(t)}>
            {digit}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton onClick={noise}>обърни 3 случайни точки</DiagramButton>
        <DiagramButton onClick={() => setPixels(pixels.map(() => 0))}>изчисти</DiagramButton>
      </Buttons>
      <Note tone={tie ? 'amber' : 'emerald'}>
        {tie
          ? `Картинката е еднакво далеч от ${ranked.filter(r => r.d === best.d).map(r => r.digit).join(' и ')} – ${best.d} различни точки.`
          : best.d === 0
            ? `Картинката съвпада точно с образеца на ${best.digit}.`
            : `Най-близкият образец е ${best.digit} – различават се само ${best.d} от 35 точки.`}
      </Note>
    </div>
  );
}
