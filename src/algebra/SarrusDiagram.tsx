/** Схема на правилото на Сарус: първите два стълба се преписват вдясно, трите диагонала надолу са с плюс, трите нагоре – с минус. */
const SUB = ['₁', '₂', '₃'];
const CW = 56; // ширина на клетка
const RH = 44; // височина на ред
const X0 = 30;
const Y0 = 34;

const cell = (r: number, c: number) => ({ x: X0 + c * CW + CW / 2, y: Y0 + r * RH });

export default function SarrusDiagram() {
  const width = X0 * 2 + 5 * CW;
  const height = Y0 + 2 * RH + 40;
  // диагонал от (r, c) с 3 клетки, надолу (dir = 1) или нагоре (dir = −1)
  const diag = (r: number, c: number, dir: 1 | -1) => {
    const p = cell(r, c);
    const q = cell(r + 2 * dir, c + 2);
    return { x1: p.x - 14, y1: p.y - 5 - 10 * dir, x2: q.x + 14, y2: q.y - 5 + 10 * dir };
  };

  return (
    <figure className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md mx-auto block" role="img" aria-label="Схема на правилото на Сарус">
        {/* вертикалните черти на детерминантата */}
        <g className="stroke-gray-700 dark:stroke-gray-200" strokeWidth={2}>
          <line x1={X0 - 2} y1={Y0 - 26} x2={X0 - 2} y2={Y0 + 2 * RH + 12} />
          <line x1={X0 + 3 * CW + 2} y1={Y0 - 26} x2={X0 + 3 * CW + 2} y2={Y0 + 2 * RH + 12} />
        </g>
        {[0, 1, 2].map(c => (
          <g key={`p${c}`} className="stroke-blue-500" strokeWidth={9} strokeLinecap="round" opacity={0.25}>
            <line {...diag(0, c, 1)} />
          </g>
        ))}
        {[0, 1, 2].map(c => (
          <g key={`m${c}`} className="stroke-rose-500" strokeWidth={3} strokeLinecap="round" strokeDasharray="6 5" opacity={0.8}>
            <line {...diag(2, c, -1)} />
          </g>
        ))}
        {[0, 1, 2].map(r =>
          [0, 1, 2, 3, 4].map(c => {
            const p = cell(r, c);
            return (
              <text
                key={`${r}${c}`}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                fontSize={17}
                fontStyle="italic"
                className={c < 3 ? 'fill-gray-900 dark:fill-gray-100' : 'fill-gray-400 dark:fill-gray-500'}
              >
                a{SUB[r]}{SUB[c % 3]}
              </text>
            );
          })
        )}
        <text x={X0 + 4 * CW} y={height - 6} textAnchor="middle" fontSize={12} className="fill-gray-400 dark:fill-gray-500">
          преписани
        </text>
      </svg>
      <figcaption className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center">
        Преписваме първите два стълба вдясно. Произведенията по <span className="text-blue-600 dark:text-blue-400 font-semibold">трите сини диагонала надолу</span> са с
        плюс, а по <span className="text-rose-600 dark:text-rose-400 font-semibold">трите червени диагонала нагоре</span> – с минус. Правилото важи само за матрици 3 × 3.
      </figcaption>
    </figure>
  );
}
