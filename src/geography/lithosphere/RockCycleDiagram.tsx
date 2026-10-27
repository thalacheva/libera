import LabSvg from '~/LabSvg';

const BOX: Record<string, { x: number; y: number; cls: string; label: string; ex: string }> = {
  magma: { x: 230, y: 238, cls: 'fill-orange-200 stroke-orange-500 dark:fill-orange-900/60', label: 'магма', ex: 'стопени скали в дълбочина' },
  igneous: { x: 110, y: 60, cls: 'fill-rose-100 stroke-rose-500 dark:fill-rose-900/50', label: 'магмени скали', ex: 'гранит, базалт' },
  sedimentary: { x: 530, y: 60, cls: 'fill-amber-100 stroke-amber-500 dark:fill-amber-900/50', label: 'седиментни скали', ex: 'пясъчник, варовик, глина' },
  metamorphic: { x: 530, y: 238, cls: 'fill-violet-100 stroke-violet-500 dark:fill-violet-900/50', label: 'метаморфни скали', ex: 'мрамор, гнайс, шисти' },
};

// [от, до, надпис, отместване на стрелката, x и y на надписа, подравняване]
const ARROWS: [string, string, string, number, number, number, 'start' | 'middle' | 'end'][] = [
  ['magma', 'igneous', 'изстиване и кристализация', 0, 160, 170, 'end'],
  ['igneous', 'sedimentary', 'изветряне, пренос, натрупване, спояване', 0, 320, 52, 'middle'],
  ['sedimentary', 'metamorphic', 'налягане и температура', 0, 520, 152, 'end'],
  ['metamorphic', 'magma', 'стопяване', 0, 380, 230, 'middle'],
  ['igneous', 'metamorphic', 'налягане и температура', 0, 300, 128, 'start'],
];

/** Кръговратът на скалите – схема. */
export default function RockCycleDiagram() {
  const W = 150;
  const H = 52;
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <marker id="rock-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10Z" className="fill-gray-600 dark:fill-gray-300" />
          </marker>
        </defs>
        {ARROWS.map(([from, to, label, off, lx, ly, anchor]) => {
          const a = BOX[from];
          const b = BOX[to];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy);
          const ux = dx / len;
          const uy = dy / len;
          // Отместване встрани, за да не се застъпват стрелките
          const nx = -uy * off;
          const ny = ux * off;
          const pad = Math.abs(ux) > Math.abs(uy) ? W / 2 + 6 : H / 2 + 6;
          const x1 = a.x + ux * pad + nx;
          const y1 = a.y + uy * pad + ny;
          const x2 = b.x - ux * pad + nx;
          const y2 = b.y - uy * pad + ny;
          return (
            <g key={from + to}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="1.8" markerEnd="url(#rock-arrow)" />
              <text x={lx} y={ly} fontSize="11" textAnchor={anchor} className="fill-gray-700 dark:fill-gray-200">
                {label}
              </text>
            </g>
          );
        })}
        {Object.entries(BOX).map(([id, b]) => (
          <g key={id}>
            <rect x={b.x - W / 2} y={b.y - H / 2} width={W} height={H} rx={10} className={b.cls} strokeWidth="1.5" />
            <text x={b.x} y={b.y - 4} fontSize="13" fontWeight="bold" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100">
              {b.label}
            </text>
            <text x={b.x} y={b.y + 13} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {b.ex}
            </text>
          </g>
        ))}
      </LabSvg>
    </div>
  );
}
