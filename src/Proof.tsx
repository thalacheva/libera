import {ChevronRight, ScrollText} from 'lucide-react';
import {MathText} from './MathText';

/**
 * Сгъваемо доказателство: заглавие + стъпки (по един <li> на стъпка, $…$ и $$…$$ за формули).
 * Затворено по подразбиране, за да не прекъсва хода на урока; съдържанието е в HTML и при prerender.
 */
export default function Proof({
  title = 'Доказателство',
  intro,
  steps,
  open = false,
}: {
  title?: string;
  intro?: string;
  steps: string[];
  open?: boolean;
}) {
  return (
    <details
      open={open}
      className="group bg-violet-50/70 dark:bg-violet-500/10 border border-violet-200/80 dark:border-violet-500/30 rounded-2xl shadow-sm mb-6"
    >
      <summary className="flex items-center gap-3 p-4 sm:px-6 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
        <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-violet-600 dark:bg-violet-500 rounded-xl flex items-center justify-center text-white">
          <ScrollText size={18} />
        </span>
        <span className="flex-1 text-base sm:text-lg font-bold text-violet-900 dark:text-violet-200">
          <MathText>{title}</MathText>
        </span>
        <ChevronRight
          size={20}
          className="flex-shrink-0 text-violet-600 dark:text-violet-300 transition-transform group-open:rotate-90"
        />
      </summary>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        {intro && (
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
            <MathText>{intro}</MathText>
          </p>
        )}
        <ol className="list-decimal marker:text-violet-600 dark:marker:text-violet-400 ml-6 sm:ml-8 space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          {steps.map((step, index) => (
            <li key={index} className="leading-relaxed min-w-0">
              <MathText>{step}</MathText>
            </li>
          ))}
        </ol>
        <p className="text-right text-violet-700 dark:text-violet-300 mt-2">∎</p>
      </div>
    </details>
  );
}
