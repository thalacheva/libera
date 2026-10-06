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
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
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
      </div>
    </main>
  );
}
