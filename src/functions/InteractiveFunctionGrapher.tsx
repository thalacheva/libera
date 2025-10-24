import { TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [debouncedFunction, setDebouncedFunction] = useState(customFunction);
  const [debouncedXMin, setDebouncedXMin] = useState(xMin);
  const [debouncedXMax, setDebouncedXMax] = useState(xMax);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFunction(customFunction);
    }, 300);
    return () => clearTimeout(timer);
  }, [customFunction]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedXMin(xMin);
    }, 500);
    return () => clearTimeout(timer);
  }, [xMin]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedXMax(xMax);
    }, 500);
    return () => clearTimeout(timer);
  }, [xMax]);

  const functionData = useMemo(() => {
    const data = [];
    const step = (debouncedXMax - debouncedXMin) / 500;
    let hasError = false;

    for (let x = debouncedXMin; x <= debouncedXMax; x += step) {
      const y = evaluateFunction(x, debouncedFunction);
      if (y === null) {
        hasError = true;
        break;
      }
      data.push({ x, y });
    }

    if (hasError) {
      setError('Невалидна функция. Използвайте x като променлива.');
      return [];
    } else {
      setError(null);
      return data;
    }
  }, [debouncedFunction, debouncedXMin, debouncedXMax]);

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

      {/* Range controls - compact on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        <div>
          <label className="block text-xs font-medium mb-1">От x =</label>
          <input
            type="number"
            value={xMin}
            onChange={e => setXMin(Number(e.target.value))}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">До x =</label>
          <input
            type="number"
            value={xMax}
            onChange={e => setXMax(Number(e.target.value))}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
          />
        </div>
        <div className="hidden sm:flex items-end">
          <button
            onClick={() => {
              setCustomFunction('2*x + 1');
              setXMin(-10);
              setXMax(10);
            }}
            className="w-full px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
          >
            Нулиране
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-2 p-2 text-xs sm:text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Graph - larger on mobile */}
      <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-xl mb-3">
        <ResponsiveContainer width="100%" height={300} className="sm:hidden">
          <ComposedChart
            data={functionData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[debouncedXMin, debouncedXMax]}
              tick={{ fontSize: 11 }}
              label={{
                value: 'x',
                position: 'insideBottomRight',
                offset: -5,
                style: { fontSize: 12 },
              }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              label={{
                value: 'f(x)',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12 },
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-gray-700 p-1.5 border border-gray-300 dark:border-gray-600 rounded shadow text-xs">
                      <p>x = {payload[0].payload.x.toFixed(2)}</p>
                      <p className="font-semibold text-blue-600">
                        f(x) = {payload[0].payload.y.toFixed(2)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="natural"
              dataKey="y"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <ResponsiveContainer
          width="100%"
          height={350}
          className="hidden sm:block"
        >
          <ComposedChart
            data={functionData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[debouncedXMin, debouncedXMax]}
              label={{
                value: 'x',
                position: 'insideBottomRight',
                offset: -5,
              }}
            />
            <YAxis
              label={{ value: 'f(x)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-gray-700 p-2 border border-gray-300 dark:border-gray-600 rounded shadow">
                      <p className="text-sm">
                        x = {payload[0].payload.x.toFixed(2)}
                      </p>
                      <p className="text-sm font-semibold text-blue-600">
                        f(x) = {payload[0].payload.y.toFixed(2)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              type="natural"
              dataKey="y"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              name={`f(x) = ${debouncedFunction}`}
            />
          </ComposedChart>
        </ResponsiveContainer>
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
          onClick={() => {
            setCustomFunction('sqrt(x)');
            setXMin(0);
            setXMax(10);
          }}
          className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-xs sm:text-sm transition"
        >
          √x
        </button>
        <button
          onClick={() => {
            setCustomFunction('1/x');
            setXMin(0.1);
          }}
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
