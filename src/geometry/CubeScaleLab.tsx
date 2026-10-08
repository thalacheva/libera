import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from './diagram';

const W = 320;
const H = 280;

/** Куб от n × n × n кубчета: повърхнина 6n², обем n³ и боядисаните кубчета. */
export function CubeScaleLab() {
  const [n, setN] = useState(3);
  const u = Math.min(36, 125 / n); // ръб на кубче в пиксели; целият куб е висок 2nu
  // Изометрични единични вектори
  const ex = { x: u * 0.87, y: u * 0.5 };
  const ey = { x: -u * 0.87, y: u * 0.5 };
  const ez = { x: 0, y: -u };
  const O = { x: W / 2, y: (H - 2 * n * u) / 2 }; // горният заден връх
  const P = (a: number, b: number, c: number) => ({ x: O.x + a * ex.x + b * ey.x + c * ez.x, y: O.y + a * ex.y + b * ey.y + c * ez.y + n * u });
  const quad = (p: { x: number; y: number }[]) => p.map(q => `${q.x},${q.y}`).join(' ');

  // Видимите стени: горна (c = n), предна дясна (b = n), предна лява (a = n)
  const faces: { pts: string; cls: string }[] = [];
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      faces.push({ pts: quad([P(i, j, n), P(i + 1, j, n), P(i + 1, j + 1, n), P(i, j + 1, n)]), cls: 'fill-amber-300 dark:fill-amber-500' });
      faces.push({ pts: quad([P(i, n, j), P(i + 1, n, j), P(i + 1, n, j + 1), P(i, n, j + 1)]), cls: 'fill-amber-500 dark:fill-amber-700' });
      faces.push({ pts: quad([P(n, i, j), P(n, i + 1, j), P(n, i + 1, j + 1), P(n, i, j + 1)]), cls: 'fill-amber-400 dark:fill-amber-600' });
    }

  const m = Math.max(n - 2, 0);
  const painted = n === 1 ? [0, 0, 0, 0] : [m ** 3, 6 * m * m, 12 * m, 8];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs mx-auto h-auto block">
        {faces.map((f, i) => (
          <polygon key={i} points={f.pts} className={`${f.cls} stroke-white dark:stroke-gray-900`} strokeWidth="1.2" strokeLinejoin="round" />
        ))}
      </svg>
      <Sliders>
        <Slider label="n" value={n} onChange={setN} min={1} max={6} step={1} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'повърхнина 6n² =', value: 6 * n * n, tone: 'amber' },
            { label: 'обем n³ =', value: n ** 3, tone: 'blue' },
            { label: 'S : V =', value: num((6 * n * n) / n ** 3, 2) },
          ]}
        />
      </div>
      {n === 1 ? (
        <Note tone="gray">Едно кубче – всичките му 6 стени са боядисани.</Note>
      ) : (
        <p className="text-center text-sm mt-2 text-gray-700 dark:text-gray-300">
          Ако боядисаме големия куб и го разрежем: <strong>{painted[3]}</strong> кубчета с 3 боядисани стени (върховете),{' '}
          <strong>{painted[2]}</strong> с 2 (по ръбовете), <strong>{painted[1]}</strong> с 1 (по стените) и <strong>{painted[0]}</strong> без боя
          (отвътре).
        </p>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 При увеличаване n пъти повърхнината расте n² пъти, а обемът – n³ пъти. Затова голямото тяло има относително по-малка повърхнина: големите
        ледени кубчета се топят по-бавно, а слонът има нужда от големи уши, за да се охлажда.
      </p>
    </div>
  );
}
