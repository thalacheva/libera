import { InteractiveQuadraticGrapher } from './InteractiveQuadraticGrapher';

export function QuadraticFunctions() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-600 dark:text-blue-400">
        Квадратни функции
      </h1>
      <InteractiveQuadraticGrapher />
    </main>
  );
}
