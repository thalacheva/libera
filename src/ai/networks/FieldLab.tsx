import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { CONV3, fieldRange, type Layer, POOL2, receptiveField, sizeAfter } from './conv';

const W = 640;
const H = 310;
const N = 16;
const CELL = 16;
const X0 = 30;
const Y0 = 38;

/** Рецептивно поле: кои входни пиксели влияят на една клетка след няколко слоя 3 × 3 (със и без обединяване). */
export default function FieldLab() {
  const [depth, setDepth] = useState(1);
  const [pool, setPool] = useState(false);
  const [sel, setSel] = useState({ r: 0.5, c: 0.5 });

  const layers: Layer[] = [];
  for (let i = 0; i < depth; i++) {
    layers.push(CONV3);
    if (pool) layers.push(POOL2);
  }
  const m = sizeAfter(N, layers);
  // Избраната клетка се пази като дял от картата, за да остане на място, когато размерът се смени
  const r = Math.min(m - 1, Math.floor(sel.r * m));
  const c = Math.min(m - 1, Math.floor(sel.c * m));
  const field = receptiveField(layers);
  const clip = ([lo, hi]: [number, number]): [number, number] => [Math.max(0, lo), Math.min(N - 1, hi)];
  const [r0, r1] = clip(fieldRange(layers, r));
  const [c0, c1] = clip(fieldRange(layers, c));
  const seen = (r1 - r0 + 1) * (c1 - c0 + 1);
  const whole = seen === N * N;

  const oc = Math.min(30, 240 / m);
  const ox = 360 + (240 - oc * m) / 2;
  const oy = Y0 + (N * CELL - oc * m) / 2;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={X0 + (N * CELL) / 2} y={22} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          входна картинка {N} × {N}
        </text>
        {Array.from({ length: N * N }, (_, i) => {
          const y = Math.floor(i / N);
          const x = i % N;
          const on = y >= r0 && y <= r1 && x >= c0 && x <= c1;
          return <rect key={i} x={X0 + x * CELL} y={Y0 + y * CELL} width={CELL} height={CELL} className={on ? 'fill-fuchsia-400 stroke-fuchsia-700 dark:fill-fuchsia-600 dark:stroke-fuchsia-300' : 'fill-gray-50 stroke-gray-300 dark:fill-gray-900 dark:stroke-gray-600'} strokeWidth="0.8" />;
        })}
        <text x={325} y={Y0 + (N * CELL) / 2 + 8} fontSize="24" textAnchor="middle" className="fill-gray-500">
          →
        </text>
        <text x={480} y={22} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          карта след {depth} {depth === 1 ? 'слой' : 'слоя'}: {m} × {m} (докосни клетка)
        </text>
        {Array.from({ length: m * m }, (_, i) => {
          const y = Math.floor(i / m);
          const x = i % m;
          const on = y === r && x === c;
          return (
            <rect
              key={i}
              x={ox + x * oc}
              y={oy + y * oc}
              width={oc}
              height={oc}
              onClick={() => setSel({ r: (y + 0.5) / m, c: (x + 0.5) / m })}
              className={`cursor-pointer ${on ? 'fill-fuchsia-500 stroke-fuchsia-800' : 'fill-white stroke-gray-400 dark:fill-gray-900 dark:stroke-gray-500'}`}
              strokeWidth="1"
            />
          );
        })}
      </LabSvg>
      <Sliders>
        <Slider label="слоеве" value={depth} onChange={setDepth} min={1} max={4} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton active={!pool} onClick={() => setPool(false)}>
          само конволюции 3 × 3
        </DiagramButton>
        <DiagramButton active={pool} onClick={() => setPool(true)}>
          с обединяване 2 × 2 след всяка
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'рецептивно поле', value: `${field} × ${field}`, tone: 'violet' },
            { label: 'видими пиксели', value: `${seen} от ${N * N}`, tone: whole ? 'emerald' : undefined },
            { label: 'клетки в картата', value: m * m },
          ]}
        />
      </div>
      <Note tone={whole ? 'emerald' : 'gray'}>
        {whole
          ? 'Тази клетка вече зависи от цялата картинка – може да отговаря за цял обект, а не за отделен ръб.'
          : field > r1 - r0 + 1 || field > c1 - c0 + 1
            ? 'Клетката е до края на картинката: част от полето ѝ пада върху рамката от нули и не се вижда.'
            : pool
              ? 'Обединяването удвоява „крачката“ на следващите слоеве, затова полето расте все по-бързо: 4, 10, 22, 46.'
              : 'Без обединяване всеки нов слой 3 × 3 добавя по един пиксел от всяка страна: 3, 5, 7, 9.'}
      </Note>
    </div>
  );
}
