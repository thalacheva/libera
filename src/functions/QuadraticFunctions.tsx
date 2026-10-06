import { InteractiveQuadraticGrapher } from './InteractiveQuadraticGrapher';

export function QuadraticFunctions() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Квадратни функции
        </h1>
        <InteractiveQuadraticGrapher />
      </div>
    </main>
  );
}
