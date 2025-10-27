import Example from '~/Example';
import Quiz, { Question } from '~/Quiz';

const quadraticEquationsQuiz: Question[] = [
  {
    question: 'Реши уравнението: x² - 7x + 12 = 0',
    answers: [
      'x₁ = 3, x₂ = 4',
      'x₁ = 2, x₂ = 6',
      'x₁ = 1, x₂ = 12',
      'x₁ = -3, x₂ = -4',
    ],
    correctAnswer: 'x₁ = 3, x₂ = 4',
  },
  {
    question: 'Реши уравнението: 2x² - 8x + 6 = 0',
    answers: [
      'x₁ = 1, x₂ = 3',
      'x₁ = 2, x₂ = 4',
      'x₁ = -1, x₂ = -3',
      'x₁ = 0, x₂ = 2',
    ],
    correctAnswer: 'x₁ = 1, x₂ = 3',
  },
  {
    question: 'Реши уравнението: x² + 6x + 9 = 0',
    answers: [
      'x₁ = 3, x₂ = 3 (двоен корен)',
      'x₁ = -3, x₂ = -3 (двоен корен)',
      'x₁ = 3, x₂ = -3',
      'Няма реални корени',
    ],
    correctAnswer: 'x₁ = -3, x₂ = -3 (двоен корен)',
  },
];

export function QuadraticEquations() {
  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        Решаване на квадратни уравнения
      </h1>
      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
          Квадратно уравнение
        </h2>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          Квадратното уравнение е алгебрично уравнение от вида:
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="text-base sm:text-lg font-mono text-center break-all text-gray-800 dark:text-gray-100">
            ax² + bx + c = 0, където a ≠ 0
          </p>
        </div>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
          Коефициентите <strong>a</strong>, <strong>b</strong> и{' '}
          <strong>c</strong> са реални числа, като <strong>a</strong> се нарича
          главен коефициент.
        </p>
      </section>
      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
          Дискриминанта
        </h2>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          Дискриминантата е израз, който определя броя и вида на корените на
          квадратното уравнение:
        </p>
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="text-base sm:text-lg font-mono text-center text-gray-800 dark:text-gray-100">
            D = b² - 4ac
          </p>
        </div>
        <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
            <p className="font-semibold text-green-600 dark:text-green-400">
              D &gt; 0
            </p>
            <p>Уравнението има два различни реални корена (x₁ ≠ x₂)</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
            <p className="font-semibold text-yellow-600 dark:text-yellow-400">
              D = 0
            </p>
            <p>Уравнението има един реален корен (двоен корен: x₁ = x₂)</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
            <p className="font-semibold text-red-600 dark:text-red-400">
              D &lt; 0
            </p>
            <p>
              Уравнението няма реални корени (има два комплексно-спрегнати
              корена)
            </p>
          </div>
        </div>
      </section>

      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
          Формула за корените
        </h2>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          Когато D ≥ 0, корените на квадратното уравнение се намират по
          формулата:
        </p>
        <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="text-base sm:text-lg font-mono text-center mb-2 break-all text-gray-800 dark:text-gray-100">
            x₁,₂ = (-b ± √D) / (2a)
          </p>
          <p className="text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            или
          </p>
          <p className="text-base sm:text-lg font-mono text-center mt-2 break-all text-gray-800 dark:text-gray-100">
            x₁,₂ = (-b ± √(b² - 4ac)) / (2a)
          </p>
        </div>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
          където знакът ± означава, че <span className="font-mono">x₁</span> се
          получава с +, а <span className="font-mono">x₂</span> се получава с -.
        </p>
      </section>

      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
          Формули на Виет (Viète)
        </h2>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          Формулите на Виет свързват корените на квадратното уравнение с
          неговите коефициенти:
        </p>
        <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="space-y-2 sm:space-y-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Сума на корените:
              </p>
              <p className="text-base sm:text-lg font-mono text-center text-gray-800 dark:text-gray-100">
                x₁ + x₂ = -b/a
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-3">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Произведение на корените:
              </p>
              <p className="text-base sm:text-lg font-mono text-center text-gray-800 dark:text-gray-100">
                x₁ · x₂ = c/a
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 sm:p-4 rounded">
          <p className="font-semibold mb-2 text-sm sm:text-base text-blue-900 dark:text-blue-300">
            💡 Приложение:
          </p>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Формулите на Виет са особено полезни за проверка на намерените
            корени или за намиране на един корен, когато другият е известен.
          </p>
        </div>
      </section>
      <section className="mb-8">
        <Example
          description="Да решим уравнението: x² - 5x + 6 = 0"
          steps={[
            'Идентифицираме коефициентите: a = 1, b = -5, c = 6',
            'Намираме дискриминантата: D = b² - 4ac = (-5)² - 4(1)(6) = 25 - 24 = 1',
            'Тъй като D > 0, има два различни реални корена',
            'x₁ = (-b + √D) / (2a) = (5 + 1) / 2 = 3',
            'x₂ = (-b - √D) / (2a) = (5 - 1) / 2 = 2',
            'Проверка с Виет: x₁ + x₂ = 3 + 2 = 5 = -(-5)/1 ✓',
            'Проверка с Виет: x₁ · x₂ = 3 · 2 = 6 = 6/1 ✓',
          ]}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Упражнения
        </h2>
        <Quiz questions={quadraticEquationsQuiz} />
      </section>
    </main>
  );
}
