import { TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
      .replace(/(\d)x\b/g, '$1*x') // 2x -> 2*x (use word boundary)
      .replace(/\bx\b/g, `(${x})`); // Replace x with the value (use word boundaries, do this LAST)

    const result = eval(expr);

    if (typeof result !== 'number' || !isFinite(result)) return null;

    return result;
  } catch {
    return null;
  }
};

export default function InteractiveFunctionGrapher() {
  const [customFunction, setCustomFunction] = useState('2*x + 1');
  const [error, setError] = useState<string | null>(null);
  const [debouncedFunction, setDebouncedFunction] = useState(customFunction);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Fixed range for both axes
  const xMin = -20;
  const xMax = 20;
  const yMin = -20;
  const yMax = 20;

  // Update dimensions on resize (square for equal axes)
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        let size = 600;
        if (containerWidth < 640) {
          size = Math.max(Math.min(containerWidth - 16, 400), 320);
        } else if (containerWidth < 1024) {
          size = 500;
        } else {
          size = 600;
        }
        setDimensions({ width: size, height: size });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFunction(customFunction);
    }, 300);
    return () => clearTimeout(timer);
  }, [customFunction]);

  // Calculate function points (skip undefined values)
  const functionPoints = useMemo(() => {
    const points: Array<{ x: number; y: number }> = [];
    const step = (xMax - xMin) / 1000; // More points for better resolution
    let hasValidPoint = false;

    for (let x = xMin; x <= xMax; x += step) {
      const y = evaluateFunction(x, debouncedFunction);
      // Skip null/undefined values (e.g., sqrt of negative, division by zero)
      if (y !== null && isFinite(y) && y >= yMin && y <= yMax) {
        points.push({ x, y });
        hasValidPoint = true;
      }
    }

    if (!hasValidPoint) {
      setError('Функцията не може да бъде изчислена в този диапазон.');
    } else {
      setError(null);
    }

    return points;
  }, [debouncedFunction, xMin, xMax, yMin, yMax]);

  // SVG coordinate conversion with equal scale for X and Y axes
  const { width, height } = dimensions;
  const padding = 30; // Reduced padding for more graph space

  // Calculate the scale to make both axes use the same unit length
  const xRange = xMax - xMin; // 100 units
  const yRange = yMax - yMin; // 100 units
  const availableWidth = width - 2 * padding;
  const availableHeight = height - 2 * padding;

  // Since we have square dimensions and equal ranges, scale should be the same
  const pixelsPerUnit = Math.min(
    availableWidth / xRange,
    availableHeight / yRange
  );

  // Center both dimensions
  const actualXRange = pixelsPerUnit * xRange;
  const actualYRange = pixelsPerUnit * yRange;
  const xOffset = padding + (availableWidth - actualXRange) / 2;
  const yOffset = padding + (availableHeight - actualYRange) / 2;

  const scaleX = (x: number) => xOffset + ((x - xMin) / xRange) * actualXRange;

  const scaleY = (y: number) =>
    height - yOffset - ((y - yMin) / yRange) * actualYRange;

  // Generate function path (handle discontinuities)
  const generatePath = () => {
    if (functionPoints.length === 0) return '';

    const pathCommands: string[] = [];
    const maxGap = (xMax - xMin) / 100; // If gap is > 1% of range, start new path

    for (let i = 0; i < functionPoints.length; i++) {
      const point = functionPoints[i];
      const x = scaleX(point.x);
      const y = scaleY(point.y);

      // Start new path if this is first point or there's a gap
      if (i === 0 || Math.abs(point.x - functionPoints[i - 1].x) > maxGap) {
        pathCommands.push(`M ${x} ${y}`);
      } else {
        pathCommands.push(`L ${x} ${y}`);
      }
    }

    return pathCommands.join(' ');
  };

  // Calculate axis positions
  const xAxisY = scaleY(0);
  const yAxisX = scaleX(0);

  // Generate grid lines and labels (every 5 units)
  const xStep = 5;
  const yStep = 5;

  const xGridLines = [];
  for (let x = xMin; x <= xMax; x += xStep) {
    if (x !== 0) {
      xGridLines.push(x);
    }
  }

  const yGridLines = [];
  for (let y = yMin; y <= yMax; y += yStep) {
    if (y !== 0) {
      yGridLines.push(y);
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 sm:p-6 rounded-2xl shadow-md mb-4 sm:mb-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <TrendingUp className="text-blue-600" size={20} />
        <h2 className="text-base sm:text-lg font-semibold">
          Интерактивна графика на функции
        </h2>
      </div>

      {/* Function input - always visible */}
      <div className="mb-3">
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
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

      {/* Custom SVG Graph */}
      <div
        ref={containerRef}
        className="bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-xl mb-3"
      >
        <svg
          width={width}
          height={height}
          className="w-full"
          style={{ maxWidth: '100%' }}
        >
          {/* Grid lines */}
          {xGridLines.map(x => (
            <line
              key={`xgrid-${x}`}
              x1={scaleX(x)}
              y1={padding}
              x2={scaleX(x)}
              y2={height - padding}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.2"
            />
          ))}
          {yGridLines.map(y => (
            <line
              key={`ygrid-${y}`}
              x1={padding}
              y1={scaleY(y)}
              x2={width - padding}
              y2={scaleY(y)}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.2"
            />
          ))}

          {/* Main axes (in the center) - always visible with -50 to 50 range */}
          <line
            x1={yAxisX}
            y1={padding}
            x2={yAxisX}
            y2={height - padding}
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.8"
          />
          <line
            x1={padding}
            y1={xAxisY}
            x2={width - padding}
            y2={xAxisY}
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.8"
          />

          {/* X-axis labels */}
          {xGridLines.map(x => (
            <text
              key={`xlabel-${x}`}
              x={scaleX(x)}
              y={xAxisY + 15}
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
              opacity="0.7"
            >
              {x}
            </text>
          ))}

          {/* Y-axis labels */}
          {yGridLines.map(y => (
            <text
              key={`ylabel-${y}`}
              x={yAxisX - 8}
              y={scaleY(y) + 3}
              textAnchor="end"
              fontSize="10"
              fill="currentColor"
              opacity="0.7"
            >
              {y}
            </text>
          ))}

          {/* Axis arrows - always visible */}
          <>
            <polygon
              points={`${width - padding},${xAxisY} ${width - padding - 8},${xAxisY - 4} ${width - padding - 8},${xAxisY + 4}`}
              fill="currentColor"
              opacity="0.8"
            />
            <text
              x={width - padding + 3}
              y={xAxisY - 8}
              fontSize="12"
              fontWeight="bold"
              fill="currentColor"
            >
              x
            </text>
          </>
          <>
            <polygon
              points={`${yAxisX},${padding} ${yAxisX - 4},${padding + 8} ${yAxisX + 4},${padding + 8}`}
              fill="currentColor"
              opacity="0.8"
            />
            <text
              x={yAxisX + 12}
              y={padding + 4}
              fontSize="12"
              fontWeight="bold"
              fill="currentColor"
            >
              y
            </text>
          </>

          {/* Function curve */}
          {functionPoints.length > 0 && (
            <path
              d={generatePath()}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
            />
          )}

          {/* Origin label - always visible */}
          <text
            x={yAxisX - 8}
            y={xAxisY + 15}
            fontSize="10"
            fill="currentColor"
            opacity="0.7"
            textAnchor="end"
          >
            0
          </text>
        </svg>

        {/* Function label */}
        <div className="mt-2 text-center text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-mono">
          f(x) = {debouncedFunction}
        </div>
      </div>

      {/* Preset buttons - more compact on mobile */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-1.5 sm:gap-2">
        <button
          onClick={() => setCustomFunction('x^2')}
          className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-xs sm:text-sm transition"
        >
          x²
        </button>
        <button
          onClick={() => setCustomFunction('x^3')}
          className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-xs sm:text-sm transition"
        >
          x³
        </button>
        <button
          onClick={() => setCustomFunction('sin(x)')}
          className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-xs sm:text-sm transition"
        >
          sin(x)
        </button>
        <button
          onClick={() => setCustomFunction('cos(x)')}
          className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-xs sm:text-sm transition"
        >
          cos(x)
        </button>
        <button
          onClick={() => setCustomFunction('sqrt(x)')}
          className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-xs sm:text-sm transition"
        >
          √x
        </button>
        <button
          onClick={() => setCustomFunction('1/x')}
          className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-xs sm:text-sm transition"
        >
          1/x
        </button>
        <button
          onClick={() => setCustomFunction('abs(x)')}
          className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-xs sm:text-sm transition"
        >
          |x|
        </button>
        <button
          onClick={() => setCustomFunction('exp(x)')}
          className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-xs sm:text-sm transition"
        >
          eˣ
        </button>
      </div>
    </div>
  );
}
