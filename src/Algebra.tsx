import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function Algebra() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const checkAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setIsCorrect(answer === 'x = 3');
  };

  const answers = ['x = 2', 'x = 3', 'x = 4', 'x = 5'];

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        Решаване на линейни уравнения
      </h1>
      <p className="mb-4 leading-relaxed">
        Линейно уравнение с една променлива е уравнение, което може да се запише
        във формат <code>ax + b = 0</code>. За да се намери решението,
        променливата трябва да се изолира от едната страна.
      </p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-2">Пример</h2>
        <p>Решаване на уравнението 2x + 4 = 10</p>
        <ol className="list-decimal ml-6 mt-2 space-y-1">
          <li>Изваждане на 4 от двете страни: 2x = 6</li>
          <li>Деление на двете страни на 2: x = 3</li>
        </ol>
      </div>

      <div className="bg-cyan-50 dark:bg-cyan-900/30 p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-2">Решете уравнението</h2>
        <p className="mb-3">
          Намери x в уравнението: <code>3x + 5 = 14</code>
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
