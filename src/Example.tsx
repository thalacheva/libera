export default function Example({
  description,
  steps,
}: {
  description: string;
  steps: string[];
}) {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200 dark:border-emerald-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 dark:bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
          📝
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
      <ol className="list-decimal ml-10 sm:ml-12 space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {steps.map((step, index) => (
          <li key={index} className="leading-relaxed">
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
