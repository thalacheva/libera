import Example from '~/Example';
import Quiz, { Question } from '~/Quiz';
import Theorem from '~/Theorem';
import { InteractiveFunctionGrapher } from './InteractiveFunctionGrapher';
import { BasicFunctions, TransformExplorer } from './Transformations';

const h2 = 'text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100';
const text = 'text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const card = 'bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm';

const rules = [
  ['y = f(x) + k', 'нагоре с k (надолу при k < 0)'],
  ['y = f(x − h)', 'надясно с h (наляво при h < 0)'],
  ['y = −f(x)', 'отразяване спрямо оста Ox'],
  ['y = f(−x)', 'отразяване спрямо оста Oy'],
];

const questions: Question[] = [
  {
    question: 'Как се получава графиката на y = x² + 3 от графиката на y = x²?',
    answers: ['Наляво с 3', 'Надясно с 3', 'Нагоре с 3', 'Надолу с 3'],
    correctAnswer: 'Нагоре с 3',
  },
  {
    question: 'Как се получава графиката на y = |x + 2| от графиката на y = |x|?',
    answers: ['Надясно с 2', 'Наляво с 2', 'Нагоре с 2', 'Надолу с 2'],
    correctAnswer: 'Наляво с 2',
  },
  {
    question: 'Коя е дефиниционната област на y = √(x − 1)?',
    answers: ['x ≥ 0', 'x ≥ 1', 'x ≠ 1', 'всички реални числа'],
    correctAnswer: 'x ≥ 1',
  },
  {
    question: 'Коя от линиите НЕ може да бъде графика на функция?',
    answers: ['Права y = 5', 'Парабола y = x²', 'Окръжност', 'Хипербола y = 1/x'],
    correctAnswer: 'Окръжност',
  },
];

export function FunctionGraph() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Графики на функции
        </h1>

        <section className="mb-6 sm:mb-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className={text}>
              🤔 <strong>Загадка:</strong> Как само с един поглед да разбереш дали дадена крива е
              графика на функция? Прекарай мислено вертикална линия и я плъзни отляво надясно. Ако
              някъде тя пресече кривата в две или повече точки, на едно x съответстват няколко y –
              значи това <em>не е</em> функция. Затова окръжността не е графика на функция, а
              параболата е.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Графика на функция"
            description="Графиката на функцията y = f(x) е множеството от всички точки (x; f(x)) в координатната система, където x е от дефиниционната област. Дефиниционната област D са допустимите стойности на x (например под корен не може да има отрицателно число, а знаменател не може да е 0), а множеството от стойности са всички y, които функцията приема."
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Основни функции</h2>
          <p className={`${text} mb-4`}>
            Тези шест графики са „азбуката“ – повечето функции, които ще срещнеш, се получават от
            тях с преместване, отразяване или разтягане. Струва си да ги разпознаваш от пръв поглед.
          </p>
          <BasicFunctions />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Преместване и отразяване</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {rules.map(([formula, effect]) => (
              <div key={formula} className={`${card} flex items-baseline justify-between gap-3`}>
                <p className="font-mono text-blue-700 dark:text-blue-300">{formula}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-right">{effect}</p>
              </div>
            ))}
          </div>
          <Theorem
            title="Защо „x − h“ мести надясно?"
            description="Графиката на y = f(x − h) стига до дадена височина точно h единици по-късно от графиката на f: за да е x − h = 0, трябва x = h. Затова минусът в скобите мести графиката надясно, а плюсът – наляво. Промяната извън функцията (+ k) действа направо върху y и мести графиката нагоре или надолу."
            graphic={<TransformExplorer />}
          />
          <Example
            description="Как се получава графиката на y = (x − 2)² − 3 от графиката на y = x²?"
            steps={[
              'Изходната функция е f(x) = x², а търсената е f(x − 2) − 3.',
              '„x − 2“ в скобите мести параболата надясно с 2.',
              '„− 3“ накрая я мести надолу с 3.',
              'Върхът отива от (0; 0) в (2; −3), формата не се променя.',
            ]}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Свободен чертож</h2>
          <p className={`${text} mb-4`}>
            Начертай няколко функции едновременно и сравни графиките им. Пресечните точки на две
            графики са решенията на уравнението f(x) = g(x) – опитай например с x² и 2x + 3.
          </p>
          <InteractiveFunctionGrapher />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Упражнения</h2>
          <Quiz questions={questions} />
        </section>
      </div>
    </main>
  );
}
