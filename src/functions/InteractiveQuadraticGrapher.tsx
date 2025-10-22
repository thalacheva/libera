import { useState } from 'react';

export default function InteractiveQuadraticGrapher() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(-4);

  const width = 800;
  const height = 600;
  const padding = 50;
  const xMin = -20;
  const xMax = 20;
  const yMin = -20;
  const yMax = 20;

  // Scale functions to convert between coordinate systems
  const scaleX = (x: number) =>
    padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  const scaleY = (y: number) =>
    height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);

  // Calculate quadratic function value
  const f = (x: number) => a * x * x + b * x + c;

  // Calculate vertex
  const vertexX = -b / (2 * a);
  const vertexY = f(vertexX);

  // Calculate discriminant
  const discriminant = b * b - 4 * a * c;

  // Calculate roots
  let root1: number | null = null;
  let root2: number | null = null;
  if (discriminant >= 0) {
    root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
  }

  // Generate parabola path
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
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Интерактивна графика на квадратна функция
      </h3>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - SVG Canvas and Equation */}
        <div className="flex-shrink-0 space-y-4">
          <svg
            width={width}
            height={height}
            className="border border-gray-300 rounded bg-gray-50"
          >
            {/* Grid lines */}
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
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
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
              stroke="#6b7280"
              strokeWidth="2"
            />
            <line
              x1={scaleX(0)}
              y1={padding}
              x2={scaleX(0)}
              y2={height - padding}
              stroke="#6b7280"
              strokeWidth="2"
            />

            {/* Axis labels */}
            {[-20, -10, 10, 20].map(x => (
              <text
                key={`x-${x}`}
                x={scaleX(x)}
                y={scaleY(0) + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#4b5563"
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
                  fill="#4b5563"
                >
                  {y}
                </text>
              ))}

            {/* Parabola */}
            <polyline
              points={generatePath()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
            />

            {/* Roots */}
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

            {/* Vertex point (non-draggable) */}
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

          {/* Equation */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <p className="text-sm font-semibold text-purple-900 mb-2">
              Уравнение:
            </p>
            <p className="text-xl font-mono text-center">
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
        </div>

        {/* Right side - Sliders and controls */}
        <div className="flex-1 space-y-4">
          {/* Instructions */}
          <div className="mt-4 bg-blue-50 p-4 rounded">
            <p className="text-sm text-blue-900 font-semibold mb-2">
              📌 Легенда:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                •{' '}
                <span className="font-semibold text-green-600">
                  Зелена точка
                </span>{' '}
                - Връх на параболата
              </li>
              <li>
                •{' '}
                <span className="font-semibold text-red-600">
                  Червени точки
                </span>{' '}
                - Корени на уравнението (x₁ и x₂)
              </li>
              <li>• Използвайте плъзгачите за промяна на коефициентите</li>
            </ul>
          </div>
          {/* Sliders for manual adjustment */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full h-3 bg-green-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Information boxes */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column - Discriminant and Roots */}
        <div className="space-y-4">
          <div
            className={`border-l-4 p-4 rounded ${
              discriminant > 0
                ? 'bg-green-50 border-green-500'
                : discriminant === 0
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-red-50 border-red-500'
            }`}
          >
            <p
              className="text-sm font-semibold mb-2"
              style={{
                color:
                  discriminant > 0
                    ? '#065f46'
                    : discriminant === 0
                      ? '#78350f'
                      : '#991b1b',
              }}
            >
              Дискриминанта:
            </p>
            <p className="font-mono text-lg">D = {discriminant.toFixed(1)}</p>
            <p className="text-sm mt-2">
              {discriminant > 0 && '✓ Два различни реални корена'}
              {discriminant === 0 && '✓ Един двоен корен'}
              {discriminant < 0 && '✗ Няма реални корени'}
            </p>
          </div>

          {discriminant >= 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm font-semibold text-red-900 mb-2">Корени:</p>
              {root1 !== null && (
                <p className="font-mono">x₁ = {root1.toFixed(3)}</p>
              )}
              {root2 !== null && discriminant > 0 && (
                <p className="font-mono">x₂ = {root2.toFixed(3)}</p>
              )}
              {discriminant === 0 && (
                <p className="text-sm mt-2 text-red-800">(Двоен корен)</p>
              )}
            </div>
          )}
        </div>

        {/* Right column - Vertex and Vieta */}
        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-sm font-semibold text-green-900 mb-2">Връх:</p>
            <div className="mb-3 text-sm text-green-800">
              <p className="font-mono">x = -b/(2a)</p>
              <p className="font-mono">y = f(x) = -D/(4a)</p>
            </div>
            <div className="border-t border-green-200 pt-2">
              <p className="font-mono">x = {vertexX.toFixed(3)}</p>
              <p className="font-mono">y = {vertexY.toFixed(3)}</p>
            </div>
          </div>

          {discriminant >= 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <p className="text-sm font-semibold text-orange-900 mb-2">
                Виет:
              </p>
              <p className="text-sm font-mono">
                x₁ + x₂ = {(-(b / a)).toFixed(3)}
              </p>
              <p className="text-sm font-mono">
                x₁ · x₂ = {(c / a).toFixed(3)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
