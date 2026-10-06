import {PencilLine} from 'lucide-react';

export default function Example({
  description,
  steps,
}: {
  description: string;
  steps: string[];
}) {
  return (
    <div className="bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/30 p-4 sm:p-6 rounded-2xl shadow-sm mb-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 dark:bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">
          <PencilLine size={18} />
        </div>
        <div className="flex-1">
          <h2 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200 mb-2">
            Пример
          </h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3">
            {description}
          </p>
        </div>
      </div>
      <ol className="list-decimal marker:text-emerald-600 dark:marker:text-emerald-400 ml-10 sm:ml-12 space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {steps.map((step, index) => (
          <li key={index} className="leading-relaxed">
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
