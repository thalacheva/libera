import {ChevronRight, Hourglass} from 'lucide-react';
import type {ReactNode} from 'react';

export type HistoryStop = {
  /** Кога: „около 1550 г. пр.н.е.“, „1489 г.“, „днес“ */
  when: string;
  emoji?: string;
  title: string;
  text: ReactNode;
};

/**
 * „Машина на времето“: сгъваема хронология с история на темата и любопитни факти.
 * Затворена по подразбиране, за да не удължава урока; съдържанието е в HTML и при prerender.
 */
export default function History({
  title = 'Машина на времето',
  subtitle,
  stops,
  facts,
  open = false,
}: {
  title?: string;
  /** Кратко изречение под заглавието – какво ще намери вътре читателят */
  subtitle?: string;
  stops: HistoryStop[];
  /** Още любопитни факти – по едно изречение-две */
  facts?: ReactNode[];
  open?: boolean;
}) {
  return (
    <details
      open={open}
      className="group bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 rounded-2xl shadow-sm mb-8"
    >
      <summary className="flex items-center gap-3 p-4 sm:px-6 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
        <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-amber-600 dark:bg-amber-500 rounded-xl flex items-center justify-center text-white">
          <Hourglass size={18} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-base sm:text-lg font-bold text-amber-900 dark:text-amber-200">{title}</span>
          {subtitle && <span className="block text-sm text-amber-800/80 dark:text-amber-200/70">{subtitle}</span>}
        </span>
        <ChevronRight
          size={20}
          className="flex-shrink-0 text-amber-600 dark:text-amber-300 transition-transform group-open:rotate-90"
        />
      </summary>
      <div className="px-4 pb-5 sm:px-6 sm:pb-6">
        <ol className="relative border-l-2 border-amber-300 dark:border-amber-600/60 ml-3 sm:ml-4 space-y-5">
          {stops.map((stop, index) => (
            <li key={index} className="relative pl-6 sm:pl-8 min-w-0">
              <span
                className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-2 border-amber-400 dark:border-amber-500 flex items-center justify-center text-xs"
                aria-hidden
              >
                {stop.emoji ?? '•'}
              </span>
              <span className="inline-block text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-500/20 rounded-full px-2.5 py-0.5 mb-1">
                {stop.when}
              </span>
              <p className="font-bold text-gray-900 dark:text-gray-100">{stop.title}</p>
              <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed [&>p+p]:mt-2">{stop.text}</div>
            </li>
          ))}
        </ol>
        {facts && facts.length > 0 && (
          <div className="mt-6 rounded-xl bg-white/70 dark:bg-gray-900/40 border border-amber-200/70 dark:border-amber-500/20 p-4">
            <p className="font-bold text-amber-900 dark:text-amber-200 mb-2">✨ Още любопитно</p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              {facts.map((fact, index) => (
                <li key={index} className="flex gap-2 leading-relaxed">
                  <span className="text-amber-500" aria-hidden>
                    ★
                  </span>
                  <span className="min-w-0">{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}
