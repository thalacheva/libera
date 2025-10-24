import Example from '~/Example';
import InteractiveQuadraticGrapher from './InteractiveQuadraticGrapher';

export default function QuadraticFunctions() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-600">
        Квадратни функции
      </h1>
      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800">
          Квадратно уравнение
        </h2>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700">
          Квадратното уравнение е алгебрично уравнение от вида:
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="text-base sm:text-lg font-mono text-center break-all">
            ax² + bx + c = 0, където a ≠ 0
          </p>
        </div>
        <p className="text-sm sm:text-base text-gray-700">
          Коефициентите a, b и c са реални числа, като a се нарича главен
          коефициент.
        </p>
      </section>
      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800">
          Дискриминанта
        </h2>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700">
          Дискриминантата е израз, който определя броя и вида на корените на
          квадратното уравнение:
        </p>
        <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="text-base sm:text-lg font-mono text-center">
            D = b² - 4ac
          </p>
        </div>
        <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700">
          <div className="bg-white p-3 sm:p-4 rounded shadow-sm">
            <p className="font-semibold text-green-600">D &gt; 0</p>
            <p>Уравнението има два различни реални корена (x₁ ≠ x₂)</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded shadow-sm">
            <p className="font-semibold text-yellow-600">D = 0</p>
            <p>Уравнението има един реален корен (двоен корен: x₁ = x₂)</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded shadow-sm">
            <p className="font-semibold text-red-600">D &lt; 0</p>
            <p>
              Уравнението няма реални корени (има два комплексно-спрегнати
              корена)
            </p>
          </div>
        </div>
      </section>

      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800">
          Формула за корените
        </h2>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700">
          Когато D ≥ 0, корените на квадратното уравнение се намират по
          формулата:
        </p>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="text-base sm:text-lg font-mono text-center mb-2 break-all">
            x₁,₂ = (-b ± √D) / (2a)
          </p>
          <p className="text-center text-gray-600 text-xs sm:text-sm">или</p>
          <p className="text-base sm:text-lg font-mono text-center mt-2 break-all">
            x₁,₂ = (-b ± √(b² - 4ac)) / (2a)
          </p>
        </div>
        <p className="text-sm sm:text-base text-gray-700">
          където знакът ± означава, че <span className="font-mono">x₁</span> се
          получава с +, а <span className="font-mono">x₂</span> се получава с -.
        </p>
      </section>

      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800">
          Формули на Виет (Viète)
        </h2>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700">
          Формулите на Виет свързват корените на квадратното уравнение с
          неговите коефициенти:
        </p>
        <div className="bg-orange-50 border-l-4 border-orange-500 p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="space-y-2 sm:space-y-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Сума на корените:
              </p>
              <p className="text-base sm:text-lg font-mono text-center">
                x₁ + x₂ = -b/a
              </p>
            </div>
            <div className="border-t pt-2 sm:pt-3">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Произведение на корените:
              </p>
              <p className="text-base sm:text-lg font-mono text-center">
                x₁ · x₂ = c/a
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-100 p-3 sm:p-4 rounded">
          <p className="font-semibold mb-2 text-sm sm:text-base text-blue-900">
            💡 Приложение:
          </p>
          <p className="text-sm sm:text-base text-gray-700">
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

      <InteractiveQuadraticGrapher />
    </main>
  );
}
