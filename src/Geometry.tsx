import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function Geometry() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const checkAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setIsCorrect(answer === 'A = 28 cm²');
  };

  const answers = ['A = 24 cm²', 'A = 26 cm²', 'A = 28 cm²', 'A = 30 cm²'];

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        Лице на правоъгълник
      </h1>
      <p className="mb-4 leading-relaxed">
        Правоъгълник е четириъгълник с четири прави ъгъла. Лицето на
        правоъгълника се изчислява по формулата <code>A = a × b</code>, където a
        и b са дължините на страните.
      </p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-2">Пример</h2>
        <p>
          Изчисляване на лицето на правоъгълник със страни a = 5 cm и b = 3 cm
        </p>
        <ol className="list-decimal ml-6 mt-2 space-y-1">
          <li>Използваме формулата: A = a × b</li>
          <li>Заместваме стойностите: A = 5 × 3</li>
          <li>Получаваме резултат: A = 15 cm²</li>
        </ol>
      </div>

      <div className="bg-cyan-50 dark:bg-cyan-900/30 p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-2">Изчислете лицето</h2>
        <p className="mb-3">
          Правоъгълник има страни <code>a = 7 cm</code> и <code>b = 4 cm</code>.
          Колко е лицето му?
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
