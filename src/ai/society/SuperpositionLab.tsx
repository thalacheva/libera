import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { dedicatedError, directions, encode, readAll, superpositionError } from './featureMath';

const NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLORS = ['#c026d3', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2', '#7c3aed', '#65a30d'];
const dec = (v: number, d = 2) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');

const SIZE = 240;
const UNIT = 52;
const at = (x: number, y: number) => [SIZE / 2 + x * UNIT, SIZE / 2 - y * UNIT] as const;

/** N признака като посоки в две измерения: кои са включени, какво се прочита обратно и колко е смущението. */
export default function SuperpositionLab() {
  const [n, setN] = useState(2);
  const [on, setOn] = useState<boolean[]>([true, false, false, false, false, false, false, false]);
  const [relu, setRelu] = useState(false);
  const [p, setP] = useState(0.1);

  const dirs = directions(n);
  const active = on.slice(0, n);
  const h = encode(dirs, active);
  const read = readAll(dirs, h, relu);
  const worst = Math.max(...read.map((v, i) => Math.abs(v - (active[i] ? 1 : 0))));
  const errSuper = superpositionError(n, p, relu);
  const errTwo = dedicatedError(n, p);
  const [hx, hy] = at(h[0], h[1]);
  const [ox, oy] = at(0, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="grid sm:grid-cols-2 gap-3 items-center">
        <div className="min-w-0">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[280px] mx-auto block" role="img" aria-label="Посоките на признаците и векторът на активациите">
            <line x1={0} y1={oy} x2={SIZE} y2={oy} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1" />
            <line x1={ox} y1={0} x2={ox} y2={SIZE} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1" />
            <circle cx={ox} cy={oy} r={UNIT} className="fill-none stroke-gray-200 dark:stroke-gray-700" strokeDasharray="3 4" />
            <text x={SIZE - 4} y={oy - 5} textAnchor="end" fontSize="10" className="fill-gray-500 dark:fill-gray-400">
              неврон 1
            </text>
            <text x={ox + 5} y={11} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
              неврон 2
            </text>
            {dirs.map((d, i) => {
              const [x, y] = at(d[0], d[1]);
              const [lx, ly] = at(d[0] * 1.25, d[1] * 1.25);
              return (
                <g key={i} opacity={active[i] ? 1 : 0.35}>
                  <line x1={ox} y1={oy} x2={x} y2={y} stroke={COLORS[i]} strokeWidth={active[i] ? 3 : 2} strokeLinecap="round" />
                  <circle cx={x} cy={y} r={active[i] ? 4 : 3} fill={COLORS[i]} />
                  <text x={lx} y={ly + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS[i]}>
                    {NAMES[i]}
                  </text>
                </g>
              );
            })}
            <line x1={ox} y1={oy} x2={hx} y2={hy} className="stroke-gray-900 dark:stroke-white" strokeWidth="2" strokeDasharray="5 3" />
            <circle cx={hx} cy={hy} r="6" className="fill-gray-900 dark:fill-white" />
          </svg>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Черната точка е векторът на активациите: ({dec(h[0])}; {dec(h[1])})
          </p>
        </div>
        <div className="min-w-0">
          <table className="w-full text-xs sm:text-sm text-center border-collapse">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400">
                <th className="py-1 font-medium">признак</th>
                <th className="py-1 font-medium">истина</th>
                <th className="py-1 font-medium">прочетено</th>
                <th className="py-1 font-medium">смущение</th>
              </tr>
            </thead>
            <tbody>
              {read.map((v, i) => {
                const truth = active[i] ? 1 : 0;
                const off = v - truth;
                const bad = Math.abs(off) > 0.005;
                return (
                  <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="py-1 font-bold" style={{ color: COLORS[i] }}>
                      {NAMES[i]}
                    </td>
                    <td className="py-1 font-mono text-gray-800 dark:text-gray-100">{truth}</td>
                    <td className="py-1 font-mono text-gray-800 dark:text-gray-100">{dec(v)}</td>
                    <td className={`py-1 font-mono ${bad ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>{bad ? dec(off) : '0'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs font-semibold mt-3 text-center text-gray-600 dark:text-gray-300">Включени признаци:</p>
      <Buttons>
        {dirs.map((_, i) => (
          <DiagramButton key={i} active={active[i]} onClick={() => setOn(on.map((v, j) => (j === i ? !v : v)))}>
            {NAMES[i]}
          </DiagramButton>
        ))}
        <DiagramButton active={relu} onClick={() => setRelu(v => !v)}>
          четене с изправител
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="признаци" value={n} onChange={setN} min={2} max={8} step={1} tone="violet" />
        <Slider label="честота p" value={p} onChange={setP} min={0.05} max={0.5} step={0.05} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'най-голямо смущение сега', value: dec(worst), tone: 'rose' },
            { label: `средна грешка, всички ${n} признака`, value: dec(errSuper, 3), tone: 'violet' },
            { label: 'средна грешка, само 2 признака', value: dec(errTwo, 3), tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={n === 2 ? 'emerald' : errSuper < errTwo ? 'violet' : 'amber'}>
        {n === 2
          ? 'Два признака в две измерения: посоките са перпендикулярни и нищо не си пречи.'
          : errSuper < errTwo
            ? `Ако всеки признак е включен в ${Math.round(p * 100)}% от случаите, по-изгодно е да се натъпчат всичките ${n} – смущенията са по-малка беда от това ${n - 2} признака да липсват изобщо.`
            : `При тази честота признаците твърде често са включени заедно. По-малко се греши, ако се пазят чисто само два, а другите ${n - 2} се пожертват.`}
      </Note>
    </div>
  );
}
