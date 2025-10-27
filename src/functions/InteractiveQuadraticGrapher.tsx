import { useEffect, useRef, useState } from 'react';

export function InteractiveQuadraticGrapher() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(-4);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const width = dimensions.width;
  const height = dimensions.height;
  const padding = 50;
  const xMin = -20;
  const xMax = 20;
  const yMin = -20;
  const yMax = 20;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        if (containerWidth < 640) {
          setDimensions({
            width: Math.min(containerWidth - 32, 400),
            height: 400,
          });
        } else if (containerWidth < 1024) {
          setDimensions({ width: 600, height: 500 });
        } else {
          setDimensions({ width: 800, height: 600 });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const scaleX = (x: number) =>
    padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  const scaleY = (y: number) =>
    height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);

  const f = (x: number) => a * x * x + b * x + c;

  const vertexX = -b / (2 * a);
  const vertexY = f(vertexX);

  const discriminant = b * b - 4 * a * c;

  let root1: number | null = null;
  let root2: number | null = null;
  if (discriminant >= 0) {
    root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
  }

  const generatePath = () => {
    const points: string[] = [];
    const numPoints = 200;
    for (let i = 0; i <= numPoints; i++) {
      const x = xMin + (i / numPoints) * (xMax - xMin);
      const y = f(x);
      if (y >= yMin && y <= yMax) {
        points.push(`${scaleX(x)},${scaleY(y)}`);
      }
    }
    return points.join(' ');
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-8"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Интерактивна графика на квадратна функция
      </h3>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-shrink-0 space-y-4 w-full lg:w-auto flex flex-col items-center lg:items-start">
          <svg
            width={width}
            height={height}
            className="border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 max-w-full"
          >
            <defs>
              <pattern
                id="grid"
                width={width / 20}
                height={height / 20}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${width / 20} 0 L 0 0 0 ${height / 20}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.1"
                />
              </pattern>
            </defs>
            <rect width={width} height={height} fill="url(#grid)" />

            {/* Axes */}
            <line
              x1={padding}
              y1={scaleY(0)}
              x2={width - padding}
              y2={scaleY(0)}
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.5"
            />
            <line
              x1={scaleX(0)}
              y1={padding}
              x2={scaleX(0)}
              y2={height - padding}
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.5"
            />
            {[-20, -10, 10, 20].map(x => (
              <text
                key={`x-${x}`}
                x={scaleX(x)}
                y={scaleY(0) + 20}
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                opacity="0.7"
              >
                {x}
              </text>
            ))}
            {[-20, -10, 10, 20]
              .filter(y => y !== 0)
              .map(y => (
                <text
                  key={`y-${y}`}
                  x={scaleX(0) - 20}
                  y={scaleY(y) + 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="currentColor"
                  opacity="0.7"
                >
                  {y}
                </text>
              ))}
            <polyline
              points={generatePath()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
            />
            {root1 !== null && root1 >= xMin && root1 <= xMax && (
              <>
                <circle
                  cx={scaleX(root1)}
                  cy={scaleY(0)}
                  r="6"
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={scaleX(root1)}
                  y={scaleY(0) - 15}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#ef4444"
                >
                  x₁
                </text>
              </>
            )}
            {root2 !== null &&
              root2 >= xMin &&
              root2 <= xMax &&
              root2 !== root1 && (
                <>
                  <circle
                    cx={scaleX(root2)}
                    cy={scaleY(0)}
                    r="6"
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={scaleX(root2)}
                    y={scaleY(0) - 15}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#ef4444"
                  >
                    x₂
                  </text>
                </>
              )}
            {vertexX >= xMin &&
              vertexX <= xMax &&
              vertexY >= yMin &&
              vertexY <= yMax && (
                <>
                  <circle
                    cx={scaleX(vertexX)}
                    cy={scaleY(vertexY)}
                    r="6"
                    fill="#10b981"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={scaleX(vertexX) + 15}
                    y={scaleY(vertexY) - 10}
                    fontSize="14"
                    fontWeight="bold"
                    fill="#10b981"
                  >
                    Връх
                  </text>
                </>
              )}
          </svg>
        </div>
        <div className="flex-1 space-y-4 w-full">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Коефициент <strong>a</strong> (форма на параболата):{' '}
                <span className="font-bold">{a.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={a}
                onChange={e => setA(Number(e.target.value))}
                className="w-full h-2 sm:h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer touch-none"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Коефициент <strong>b</strong>:{' '}
                <span className="font-bold">{b.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="-20"
                max="20"
                step="0.1"
                value={b}
                onChange={e => setB(Number(e.target.value))}
                className="w-full h-2 sm:h-3 bg-green-200 rounded-lg appearance-none cursor-pointer touch-none"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Коефициент <strong>c</strong> (пресичане с Y-ос):{' '}
                <span className="font-bold">{c.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="-20"
                max="20"
                step="0.1"
                value={c}
                onChange={e => setC(Number(e.target.value))}
                className="w-full h-2 sm:h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer touch-none"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 sm:mt-6 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-3 sm:p-4 rounded w-full">
        <p className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
          Уравнение:
        </p>
        <p className="text-base sm:text-xl font-mono text-center break-all text-gray-800 dark:text-gray-100">
          f(x) ={' '}
          <span className="font-bold">
            {a >= 0 ? '' : ''}
            {a.toFixed(1)}
          </span>
          x²
          {b >= 0 ? ' + ' : ' - '}
          <span className="font-bold">{Math.abs(b).toFixed(1)}</span>x
          {c >= 0 ? ' + ' : ' - '}
          <span className="font-bold">{Math.abs(c).toFixed(1)}</span>
        </p>
      </div>
      <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-3 sm:space-y-4">
          <div
            className={`border-l-4 p-3 sm:p-4 rounded ${
              discriminant > 0
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                : discriminant === 0
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-500'
            }`}
          >
            <p className="text-xs sm:text-sm font-semibold mb-2 text-green-800 dark:text-green-300">
              Дискриминанта:
            </p>
            <p className="font-mono text-base sm:text-lg text-gray-800 dark:text-gray-100">
              D = {discriminant.toFixed(1)}
            </p>
            <p className="text-xs sm:text-sm mt-2 text-gray-700 dark:text-gray-300">
              {discriminant > 0 && '✓ Два различни реални корена'}
              {discriminant === 0 && '✓ Един двоен корен'}
              {discriminant < 0 && '✗ Няма реални корени'}
            </p>
          </div>

          {discriminant >= 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 sm:p-4 rounded">
              <p className="text-xs sm:text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                Корени:
              </p>
              {root1 !== null && (
                <p className="font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100">
                  x₁ = {root1.toFixed(3)}
                </p>
              )}
              {root2 !== null && discriminant > 0 && (
                <p className="font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100">
                  x₂ = {root2.toFixed(3)}
                </p>
              )}
              {discriminant === 0 && (
                <p className="text-xs sm:text-sm mt-2 text-red-800 dark:text-red-300">
                  (Двоен корен)
                </p>
              )}
            </div>
          )}
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 sm:p-4 rounded">
            <p className="text-xs sm:text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
              Връх:
            </p>
            <div className="mb-3 text-xs sm:text-sm text-green-800 dark:text-green-300">
              <p className="font-mono">x = -b/(2a)</p>
              <p className="font-mono">y = f(x) = -D/(4a)</p>
            </div>
            <div className="border-t border-green-200 dark:border-green-700 pt-2">
              <p className="font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100">
                x = {vertexX.toFixed(3)}
              </p>
              <p className="font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100">
                y = {vertexY.toFixed(3)}
              </p>
            </div>
          </div>

          {discriminant >= 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 sm:p-4 rounded">
              <p className="text-xs sm:text-sm font-semibold text-orange-900 dark:text-orange-300 mb-2">
                Виет:
              </p>
              <p className="text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-100">
                x₁ + x₂ = {(-(b / a)).toFixed(3)}
              </p>
              <p className="text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-100">
                x₁ · x₂ = {(c / a).toFixed(3)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
