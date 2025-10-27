import { useEffect, useMemo, useRef, useState } from 'react';

const RANGE = { MIN: -20, MAX: 20 };
const GRID_STEP = 5;
const PADDING = 30;
const RESOLUTION = 1000;
const DEBOUNCE_DELAY = 300;

const evaluateFunction = (x: number, functionStr: string): number | null => {
  try {
    const expr = functionStr
      .toLowerCase()
      .replace(/\^/g, '**')
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\blog\b/g, 'Math.log')
      .replace(/\bexp\b/g, 'Math.exp')
      .replace(/(\d)x\b/g, '$1*x')
      .replace(/\bx\b/g, `(${x})`);

    const result = eval(expr);
    return typeof result === 'number' && isFinite(result) ? result : null;
  } catch {
    return null;
  }
};

const generateGridValues = (min: number, max: number, step: number) => {
  const values = [];
  for (let v = min; v <= max; v += step) {
    if (v !== 0) values.push(v);
  }
  return values;
};

export function InteractiveFunctionGrapher() {
  const [customFunction, setCustomFunction] = useState('2*x + 1');
  const [error, setError] = useState<string | null>(null);
  const [debouncedFunction, setDebouncedFunction] = useState(customFunction);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Make the graph responsive to container width with proper padding
        let width = Math.max(containerWidth - 24, 320);
        let height = width * 0.75;

        // Cap maximum sizes to prevent overflow
        if (width > 900) {
          width = 900;
          height = 675;
        }

        if (containerWidth < 640) {
          width = Math.max(containerWidth - 16, 300);
          height = width;
        }

        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedFunction(customFunction),
      DEBOUNCE_DELAY
    );
    return () => clearTimeout(timer);
  }, [customFunction]);

  const functionPoints = useMemo(() => {
    const points: Array<{ x: number; y: number }> = [];
    const step = (RANGE.MAX - RANGE.MIN) / RESOLUTION;
    let hasValidPoint = false;

    for (let x = RANGE.MIN; x <= RANGE.MAX; x += step) {
      const y = evaluateFunction(x, debouncedFunction);
      if (y !== null && y >= RANGE.MIN && y <= RANGE.MAX) {
        points.push({ x, y });
        hasValidPoint = true;
      }
    }

    setError(
      hasValidPoint
        ? null
        : 'Функцията не може да бъде изчислена в този диапазон.'
    );
    return points;
  }, [debouncedFunction]);

  const { width, height } = dimensions;
  const range = RANGE.MAX - RANGE.MIN;
  const available = {
    width: width - 2 * PADDING,
    height: height - 2 * PADDING,
  };
  const pixelsPerUnit = Math.min(
    available.width / range,
    available.height / range
  );
  const actualRange = pixelsPerUnit * range;
  const offset = {
    x: PADDING + (available.width - actualRange) / 2,
    y: PADDING + (available.height - actualRange) / 2,
  };

  const scaleX = (x: number) =>
    offset.x + ((x - RANGE.MIN) / range) * actualRange;
  const scaleY = (y: number) =>
    height - offset.y - ((y - RANGE.MIN) / range) * actualRange;

  const generatePath = () => {
    if (!functionPoints.length) return '';

    const maxGap = range / 100;
    return functionPoints
      .map((point, i) => {
        const x = scaleX(point.x);
        const y = scaleY(point.y);
        const isNewSegment =
          i === 0 || Math.abs(point.x - functionPoints[i - 1].x) > maxGap;
        return `${isNewSegment ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const axes = { x: scaleY(0), y: scaleX(0) };
  const gridLines = {
    x: generateGridValues(RANGE.MIN, RANGE.MAX, GRID_STEP),
    y: generateGridValues(RANGE.MIN, RANGE.MAX, GRID_STEP),
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 sm:p-4 rounded-2xl shadow-md mb-4">
      <div className="mb-3">
        <label className="block text-xs sm:text-sm font-medium mb-1">
          Въведете функция f(x):
        </label>
        <input
          type="text"
          value={customFunction}
          onChange={e => setCustomFunction(e.target.value)}
          placeholder="Например: x^2, sin(x)"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
        />
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
          Поддържани: +, -, *, /, ^, sin, cos, tan, sqrt, abs, log, exp
        </p>
      </div>

      {error && (
        <div className="mb-2 p-2 text-xs sm:text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
        <div
          ref={containerRef}
          className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-xl flex-1 min-w-0"
        >
          <svg
            width={width}
            height={height}
            className="w-full h-auto"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {gridLines.x.map(x => (
              <line
                key={`xgrid-${x}`}
                x1={scaleX(x)}
                y1={PADDING}
                x2={scaleX(x)}
                y2={height - PADDING}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.2"
              />
            ))}
            {gridLines.y.map(y => (
              <line
                key={`ygrid-${y}`}
                x1={PADDING}
                y1={scaleY(y)}
                x2={width - PADDING}
                y2={scaleY(y)}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.2"
              />
            ))}

            <line
              x1={axes.y}
              y1={PADDING}
              x2={axes.y}
              y2={height - PADDING}
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.8"
            />
            <line
              x1={PADDING}
              y1={axes.x}
              x2={width - PADDING}
              y2={axes.x}
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.8"
            />

            {gridLines.x.map(x => (
              <text
                key={`xlabel-${x}`}
                x={scaleX(x)}
                y={axes.x + 15}
                textAnchor="middle"
                fontSize="10"
                fill="currentColor"
                opacity="0.7"
              >
                {x}
              </text>
            ))}
            {gridLines.y.map(y => (
              <text
                key={`ylabel-${y}`}
                x={axes.y - 8}
                y={scaleY(y) + 3}
                textAnchor="end"
                fontSize="10"
                fill="currentColor"
                opacity="0.7"
              >
                {y}
              </text>
            ))}

            <polygon
              points={`${width - PADDING},${axes.x} ${width - PADDING - 8},${axes.x - 4} ${width - PADDING - 8},${axes.x + 4}`}
              fill="currentColor"
              opacity="0.8"
            />
            <text
              x={width - PADDING + 3}
              y={axes.x - 8}
              fontSize="12"
              fontWeight="bold"
              fill="currentColor"
            >
              x
            </text>
            <polygon
              points={`${axes.y},${PADDING} ${axes.y - 4},${PADDING + 8} ${axes.y + 4},${PADDING + 8}`}
              fill="currentColor"
              opacity="0.8"
            />
            <text
              x={axes.y + 12}
              y={PADDING + 4}
              fontSize="12"
              fontWeight="bold"
              fill="currentColor"
            >
              y
            </text>

            {functionPoints.length > 0 && (
              <path
                d={generatePath()}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
              />
            )}

            <text
              x={axes.y - 8}
              y={axes.x + 15}
              fontSize="10"
              fill="currentColor"
              opacity="0.7"
              textAnchor="end"
            >
              0
            </text>
          </svg>

          <div className="mt-1 sm:mt-2 text-center text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-mono">
            f(x) = {debouncedFunction}
          </div>
        </div>

        <div className="lg:w-44 xl:w-48 flex-shrink-0">
          <h3 className="text-xs sm:text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Готови функции:
          </h3>
          <div className="grid grid-cols-4 lg:grid-cols-1 gap-1.5 lg:gap-2">
            {[
              { label: 'x²', fn: 'x^2' },
              { label: 'x³', fn: 'x^3' },
              { label: 'sin(x)', fn: 'sin(x)' },
              { label: 'cos(x)', fn: 'cos(x)' },
              { label: '√x', fn: 'sqrt(x)' },
              { label: '1/x', fn: '1/x' },
              { label: '|x|', fn: 'abs(x)' },
              { label: 'eˣ', fn: 'exp(x)' },
            ].map(({ label, fn }) => (
              <button
                key={fn}
                onClick={() => setCustomFunction(fn)}
                className={
                  'px-2 py-2 lg:px-3 lg:py-2.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-xs sm:text-sm transition font-medium w-full'
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
