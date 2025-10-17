import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

export default function Functions() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const checkAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setIsCorrect(answer === 'f(3) = 7');
  };

  const answers = ['f(3) = 5', 'f(3) = 6', 'f(3) = 7', 'f(3) = 8'];

  // Generate data points for the function f(x) = 2x + 1
  const generateFunctionData = () => {
    const data = [];
    for (let x = -3; x <= 5; x += 0.5) {
      data.push({
        x: x,
        y: 2 * x + 1,
      });
    }
    return data;
  };

  // Highlighted points from the example
  const examplePoints = [
    { x: 0, y: 1, name: 'f(0) = 1' },
    { x: 1, y: 3, name: 'f(1) = 3' },
    { x: 2, y: 5, name: 'f(2) = 5' },
  ];

  const functionData = generateFunctionData();

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Линейни функции</h1>
      <p className="mb-4 leading-relaxed">
        Линейна функция е функция от вида <code>f(x) = ax + b</code>, където a и
        b са константи. Графиката на линейната функция е права линия.
      </p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-2">Пример</h2>
        <p className="mb-4">Да разгледаме функцията f(x) = 2x + 1</p>
        <ol className="list-decimal ml-6 mt-2 space-y-1 mb-4">
          <li>За x = 0: f(0) = 2(0) + 1 = 1</li>
          <li>За x = 1: f(1) = 2(1) + 1 = 3</li>
          <li>За x = 2: f(2) = 2(2) + 1 = 5</li>
        </ol>

        <div className="mt-4">
          <h3 className="text-md font-semibold mb-3">Графика на функцията</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={functionData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[-3, 5]}
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
                          x = {payload[0].payload.x.toFixed(1)}
                        </p>
                        <p className="text-sm font-semibold text-blue-600">
                          f(x) = {payload[0].payload.y.toFixed(1)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                name="f(x) = 2x + 1"
              />
              <Scatter
                data={examplePoints}
                fill="#ef4444"
                shape="circle"
                name="Примерни точки"
              >
                <ZAxis range={[100, 100]} />
              </Scatter>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-cyan-50 dark:bg-cyan-900/30 p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-2">Изчислете стойността</h2>
        <p className="mb-3">
          Ако <code>f(x) = 2x + 1</code>, намерете <code>f(3)</code>
        </p>
        <div className="space-y-2">
          {answers.map(ans => (
            <button
              key={ans}
              onClick={() => checkAnswer(ans)}
              className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                selectedAnswer === ans
                  ? isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/40'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/40'
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {ans}
            </button>
          ))}
        </div>
        {isCorrect !== null && (
          <div
            className={`mt-3 font-medium flex items-center gap-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
          >
            <CheckCircle size={18} />
            {isCorrect ? 'Правилнен отговор! 🎉' : 'Опитай отново! 💩'}
          </div>
        )}
      </div>
    </main>
  );
}
