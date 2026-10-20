import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

type Phase = 'inter' | 'pro' | 'meta' | 'ana' | 'telo';

const PHASES: { id: Phase; name: string; short: string }[] = [
  { id: 'inter', name: 'интерфаза', short: 'И' },
  { id: 'pro', name: 'профаза', short: 'П' },
  { id: 'meta', name: 'метафаза', short: 'М' },
  { id: 'ana', name: 'анафаза', short: 'А' },
  { id: 'telo', name: 'телофаза', short: 'Т' },
];
const CYCLE = 20; // h – приемаме продължителност на клетъчния цикъл в корена на лука

const COLS = 8;
const ROWS = 6;
const W = 57;
const H = 38;
const X0 = 12;
const Y0 = 8;
// Фазата на всяка клетка (48 клетки: 38 в интерфаза, 5 в профаза, 2 в метафаза, 1 в анафаза, 2 в телофаза)
const LAYOUT: Phase[] = (() => {
  const cells: Phase[] = Array(COLS * ROWS).fill('inter');
  const place: [number, Phase][] = [
    [3, 'pro'],
    [10, 'meta'],
    [14, 'pro'],
    [19, 'telo'],
    [22, 'pro'],
    [27, 'ana'],
    [31, 'pro'],
    [36, 'meta'],
    [41, 'telo'],
    [45, 'pro'],
  ];
  for (const [i, p] of place) cells[i] = p;
  return cells;
})();

/** Ядрото/хромозомите на клетка в дадена фаза, в правоъгълник с център (x, y). */
function Inside({ phase, x, y }: { phase: Phase; x: number; y: number }) {
  const ink = '#7c2d12';
  if (phase === 'inter')
    return (
      <g>
        <circle cx={x} cy={y} r={9} fill="#fed7aa" stroke={ink} strokeWidth="1" />
        <circle cx={x + 2} cy={y - 1} r={2.5} fill={ink} />
      </g>
    );
  if (phase === 'pro')
    return (
      <g>
        <circle cx={x} cy={y} r={10} fill="#fed7aa" stroke={ink} strokeWidth="0.8" strokeDasharray="2 2" />
        <path d={`M${x - 6} ${y - 4} q3 6 6 0 t6 2 M${x - 5} ${y + 4} q4 -5 8 1 M${x - 2} ${y - 7} q2 5 4 10`} fill="none" stroke={ink} strokeWidth="1.8" />
      </g>
    );
  if (phase === 'meta') return <rect x={x - 2} y={y - 11} width={4} height={22} rx={2} fill={ink} />;
  if (phase === 'ana')
    return (
      <g>
        <path d={`M${x - 12} ${y - 9} l6 9 l-6 9 M${x - 8} ${y - 9} l6 9 l-6 9`} fill="none" stroke={ink} strokeWidth="2" />
        <path d={`M${x + 12} ${y - 9} l-6 9 l6 9 M${x + 8} ${y - 9} l-6 9 l6 9`} fill="none" stroke={ink} strokeWidth="2" />
      </g>
    );
  return (
    <g>
      <ellipse cx={x - 13} cy={y} rx={6} ry={8} fill="#fed7aa" stroke={ink} strokeWidth="1" />
      <ellipse cx={x + 13} cy={y} rx={6} ry={8} fill="#fed7aa" stroke={ink} strokeWidth="1" />
      <line x1={x} x2={x} y1={y - 15} y2={y + 15} stroke={ink} strokeWidth="1" strokeDasharray="2 2" />
    </g>
  );
}

const fmt = (v: number, d = 1) => String(Number(v.toFixed(d))).replace('.', ',');

/** Преброй клетките от върха на корен на лук във всяка фаза и намери митотичния индекс и колко трае всяка фаза. */
export default function RootTipLab() {
  const [tool, setTool] = useState<Phase>('pro');
  const [labels, setLabels] = useState<(Phase | null)[]>(() => LAYOUT.map(() => null));
  const [checked, setChecked] = useState(false);

  const label = (i: number) => {
    if (checked) return;
    setLabels(l => l.map((v, k) => (k === i ? (v === tool ? null : tool) : v)));
  };
  // Неотбелязаните клетки се смятат за интерфаза
  const given = labels.map(l => l ?? 'inter');
  const right = given.filter((p, i) => p === LAYOUT[i]).length;
  const count = (arr: Phase[], p: Phase) => arr.filter(x => x === p).length;
  const N = LAYOUT.length;
  const dividing = N - count(LAYOUT, 'inter');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 245" className="w-full h-auto max-w-xl mx-auto block select-none">
        <rect x={4} y={2} width={472} height={240} rx={10} fill="#fff7ed" />
        {LAYOUT.map((phase, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const x = X0 + col * W;
          const y = Y0 + row * H;
          const mark = labels[i];
          const wrong = checked && given[i] !== phase;
          return (
            <g key={i} onClick={() => label(i)} className="cursor-pointer">
              <rect
                x={x}
                y={y}
                width={W - 3}
                height={H - 3}
                rx={4}
                fill="#ffedd5"
                stroke={checked ? (wrong ? '#dc2626' : '#16a34a') : '#c2410c'}
                strokeWidth={checked ? 2.5 : 1}
              />
              <Inside phase={phase} x={x + (W - 3) / 2} y={y + (H - 3) / 2} />
              {mark && (
                <text x={x + 5} y={y + 12} fontSize="11" fontWeight="700" fill="#1d4ed8">
                  {PHASES.find(p => p.id === mark)!.short}
                </text>
              )}
            </g>
          );
        })}
      </LabSvg>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">Избери фаза и посочи клетките в нея (неотбелязаните се броят за интерфаза):</p>
      <Buttons>
        {PHASES.filter(p => p.id !== 'inter').map(p => (
          <DiagramButton key={p.id} active={tool === p.id} onClick={() => setTool(p.id)}>
            {p.short} – {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={checked} onClick={() => setChecked(!checked)}>
          {checked ? 'Скрий проверката' : '✓ Провери'}
        </DiagramButton>
        <DiagramButton
          onClick={() => {
            setLabels(LAYOUT.map(() => null));
            setChecked(false);
          }}
        >
          Отначало
        </DiagramButton>
      </Buttons>

      {checked && (
        <>
          <div className="overflow-x-auto mt-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs sm:text-sm border-collapse tabular-nums">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60">
                  <th className="px-3 py-1.5 text-left">фаза</th>
                  <th className="px-3 py-1.5 text-left">твоят брой</th>
                  <th className="px-3 py-1.5 text-left">верен брой</th>
                  <th className="px-3 py-1.5 text-left">дял</th>
                  <th className="px-3 py-1.5 text-left">трае ≈</th>
                </tr>
              </thead>
              <tbody>
                {PHASES.map(p => {
                  const n = count(LAYOUT, p.id);
                  return (
                    <tr key={p.id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-1">{p.name}</td>
                      <td className="px-3 py-1">{count(given, p.id)}</td>
                      <td className="px-3 py-1">{n}</td>
                      <td className="px-3 py-1">{fmt((n / N) * 100)}%</td>
                      <td className="px-3 py-1">{(n / N) * CYCLE >= 1 ? `${fmt((n / N) * CYCLE)} h` : `${Math.round((n / N) * CYCLE * 60)} min`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Note tone={right === N ? 'emerald' : 'amber'}>
            Позна {right} от {N} клетки. Митотичен индекс = {dividing} / {N} ≈ {fmt((dividing / N) * 100)}%. Колкото по-често срещаме
            една фаза, толкова по-дълго трае тя: продължителност ≈ дял × {CYCLE} h.
          </Note>
        </>
      )}
      {!checked && <Note tone="violet">Профаза – видими нишки; метафаза – линия в средата; анафаза – две групи в краищата; телофаза – две ядра и преграда.</Note>}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Препарат от връхчето на корен на лук, оцветен, за да се виждат хромозомите. Приемаме, че клетъчният цикъл трае {CYCLE} h и че
        клетките са в произволен момент от него. Посочи отново клетката със същата фаза, за да махнеш отметката.
      </p>
    </div>
  );
}
