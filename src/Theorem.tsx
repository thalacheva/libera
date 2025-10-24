export default function Theorem({
  title,
  description,
  graphic,
}: {
  title: string;
  description: string;
  graphic?: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
          T
        </div>
        <div className="flex-1">
          <h2 className="text-base sm:text-lg font-bold text-indigo-900 dark:text-indigo-200 mb-2">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      {graphic && (
        <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800">
          {graphic}
        </div>
      )}
    </div>
  );
}
