import { useEffect, useRef, useState } from 'react';

export function InteractiveLinearGrapher() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const width = dimensions.width;
  const height = dimensions.height;
  const padding = 50;
  const xMin = -10;
  const xMax = 10;
  const yMin = -10;
  const yMax = 10;

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

  const f = (x: number) => a * x + b;

  // Calculate x-intercept (root): when y = 0, x = -b/a
  const xIntercept = a !== 0 ? -b / a : null;
  const yIntercept = b;

  const generatePath = () => {
    const points: string[] = [];
    const numPoints = 100;
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
        Интерактивна графика на линейна функция{' '}
        <span className="font-mono">f(x) = ax + b</span>
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Коефициентът <strong>a</strong> е наклонът на функцията, а{' '}
        <strong>b</strong> е пресечната точка с Y-оста.
      </p>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-shrink-0 space-y-4 w-full lg:w-auto flex flex-col items-center lg:items-start">
          <svg
            width={width}
            height={height}
            className="border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 max-w-full"
          >
            <defs>
              <pattern
                id="grid-linear"
                width={width / 10}
                height={height / 10}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${width / 10} 0 L 0 0 0 ${height / 10}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.1"
                />
              </pattern>
            </defs>
            <rect width={width} height={height} fill="url(#grid-linear)" />

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
            {[-10, -5, 5, 10].map(x => (
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
            {[-10, -5, 5, 10]
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
            {/* X-intercept (root) */}
            {xIntercept !== null &&
              xIntercept >= xMin &&
              xIntercept <= xMax && (
                <>
                  <circle
                    cx={scaleX(xIntercept)}
                    cy={scaleY(0)}
                    r="6"
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={scaleX(xIntercept)}
                    y={scaleY(0) - 15}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#ef4444"
                  >
                    x₀
                  </text>
                </>
              )}
            {/* Y-intercept */}
            {yIntercept >= yMin && yIntercept <= yMax && (
              <>
                <circle
                  cx={scaleX(0)}
                  cy={scaleY(yIntercept)}
                  r="6"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={scaleX(0) + 20}
                  y={scaleY(yIntercept) + 5}
                  fontSize="14"
                  fontWeight="bold"
                  fill="#10b981"
                >
                  y₀
                </text>
              </>
            )}
          </svg>
        </div>
        <div className="flex-1 space-y-4 w-full">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Коефициент <strong>a</strong> (наклон):{' '}
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
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {a > 0 && '↗ Растяща функция'}
                {a < 0 && '↘ Намаляваща функция'}
                {a === 0 && '→ Константна функция'}
              </p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Коефициент <strong>b</strong> (пресичане с Y-ос):{' '}
                <span className="font-bold">{b.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={b}
                onChange={e => setB(Number(e.target.value))}
                className="w-full h-2 sm:h-3 bg-green-200 rounded-lg appearance-none cursor-pointer touch-none"
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
          x{b >= 0 ? ' + ' : ' - '}
          <span className="font-bold">{Math.abs(b).toFixed(1)}</span>
        </p>
      </div>
      <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 sm:p-4 rounded">
            <p className="text-xs sm:text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
              Y-сечение (пресичане с Y-ос):
            </p>
            <p className="text-xs sm:text-sm mb-2 text-green-800 dark:text-green-300">
              Когато x = 0:
            </p>
            <p className="font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100">
              y₀ = {yIntercept.toFixed(3)}
            </p>
          </div>

          {a !== 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 sm:p-4 rounded">
              <p className="text-xs sm:text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                X-сечение (корен):
              </p>
              <p className="text-xs sm:text-sm mb-2 text-red-800 dark:text-red-300">
                Когато y = 0:
              </p>
              <p className="font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100">
                x₀ = {xIntercept !== null ? xIntercept.toFixed(3) : 'N/A'}
              </p>
            </div>
          )}

          {a === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-3 sm:p-4 rounded">
              <p className="text-xs sm:text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                Константна функция:
              </p>
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                {b === 0
                  ? 'Функцията съвпада с X-оста'
                  : 'Хоризонтална линия, паралелна на X-оста'}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 sm:p-4 rounded">
            <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Наклон (ъгъл):
            </p>
            <p className="font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100 mb-2">
              a = {a.toFixed(3)}
            </p>
            {a !== 0 && (
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                α = {((Math.atan(a) * 180) / Math.PI).toFixed(1)}°
              </p>
            )}
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 sm:p-4 rounded">
            <p className="text-xs sm:text-sm font-semibold text-orange-900 dark:text-orange-300 mb-2">
              Свойства:
            </p>
            <ul className="text-xs sm:text-sm space-y-1 text-orange-800 dark:text-orange-300">
              <li>
                • Дефиниционна област: <span className="font-mono">ℝ</span>
              </li>
              <li>
                • Стойностна област: <span className="font-mono">ℝ</span>
              </li>
              {a !== 0 && (
                <>
                  <li>• Функцията е {a > 0 ? 'растяща' : 'намаляваща'}</li>
                  <li>• Функцията е биективна</li>
                </>
              )}
              {a === 0 && <li>• Функцията е константна</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
