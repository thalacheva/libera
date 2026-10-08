// Лента за дроби: всяко цяло е правоъгълник, разделен на d равни части.

const W = 600;
const ROW = 38;
const GAP = 10;

/** Цветни отрязъци в лентата: [брой части, цвят]. */
export type Run = { parts: number; className: string };

export function FractionBar({ d, runs, label }: { d: number; runs: Run[]; label?: string }) {
  const total = runs.reduce((s, r) => s + r.parts, 0);
  const wholes = Math.max(1, Math.ceil(total / d));
  const pw = (W - 2) / d;
  const H = wholes * ROW + (wholes - 1) * GAP + 2;

  // Номер на част → цвят
  const colorOf: string[] = [];
  runs.forEach(r => {
    for (let i = 0; i < r.parts; i++) colorOf.push(r.className);
  });

  return (
    <div className="mb-2">
      {label && <p className="text-center font-mono text-sm mb-1 text-gray-700 dark:text-gray-300">{label}</p>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {Array.from({ length: wholes }, (_, w) => (
          <g key={w} transform={`translate(1 ${1 + w * (ROW + GAP)})`}>
            {Array.from({ length: d }, (_, i) => (
              <rect
                key={i}
                x={i * pw}
                y={0}
                width={pw}
                height={ROW}
                className={`${colorOf[w * d + i] ?? 'fill-white dark:fill-gray-800'} stroke-gray-400 dark:stroke-gray-500`}
                strokeWidth={d > 24 ? 0.6 : 1.2}
              />
            ))}
            <rect x={0} y={0} width={d * pw} height={ROW} className="fill-none stroke-gray-700 dark:stroke-gray-300" strokeWidth={2} />
          </g>
        ))}
      </svg>
    </div>
  );
}
