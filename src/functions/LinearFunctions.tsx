import Example from '~/Example';
import Quiz, { Question } from '~/Quiz';
import { InteractiveLinearGrapher } from './InteractiveLinearGrapher';

const questions: Question[] = [
  {
    question: 'Ако f(x) = 2x + 1, намерете f(3) = ?',
    answers: ['f(3) = 5', 'f(3) = 6', 'f(3) = 7', 'f(3) = 8'],
    correctAnswer: 'f(3) = 7',
  },
];

export function LinearFunctions() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-600 dark:text-blue-400">
        Линейни функции
      </h1>
      <InteractiveLinearGrapher />
      <Example
        description="Да разгледаме функцията f(x) = 2x + 1"
        steps={[
          'За x = 0: f(0) = 2(0) + 1 = 1',
          'За x = 1: f(1) = 2(1) + 1 = 3',
          'За x = 2: f(2) = 2(2) + 1 = 5',
        ]}
      />
      <Quiz questions={questions} />
    </main>
  );
}
