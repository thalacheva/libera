export default function Theorem({
  title,
  description,
  graphic,
  type = 'theorem',
}: {
  title: string;
  description: string;
  graphic?: React.ReactNode;
  type?: 'theorem' | 'definition';
}) {
  const isDefinition = type === 'definition';

  const bgColor = isDefinition
    ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50'
    : 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50';

  const borderColor = isDefinition
    ? 'border-blue-200 dark:border-blue-800'
    : 'border-indigo-200 dark:border-indigo-800';

  const iconBgColor = isDefinition
    ? 'bg-blue-600 dark:bg-blue-500'
    : 'bg-indigo-600 dark:bg-indigo-500';

  const textColor = isDefinition
    ? 'text-blue-900 dark:text-blue-200'
    : 'text-indigo-900 dark:text-indigo-200';

  const borderTopColor = isDefinition
    ? 'border-blue-200 dark:border-blue-800'
    : 'border-indigo-200 dark:border-indigo-800';

  const icon = isDefinition ? 'О' : 'Т';

  return (
    <div
      className={`${bgColor} border ${borderColor} p-4 sm:p-6 rounded-2xl shadow-lg mb-6`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 ${iconBgColor} rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h2 className={`text-base sm:text-lg font-bold ${textColor} mb-2`}>
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      {graphic && (
        <div className={`mt-4 pt-4 border-t ${borderTopColor}`}>{graphic}</div>
      )}
    </div>
  );
}
