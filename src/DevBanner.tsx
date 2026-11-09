import { useEffect, useState } from 'react';
import { Construction, X } from 'lucide-react';

const STORAGE_KEY = 'libera-dev-banner-dismissed';

/** Лента най-горе на всяка страница: сайтът още се разработва. Може да се затвори. */
export default function DevBanner() {
  // Страниците се пререндерират, затова localStorage се чете след монтиране,
  // иначе хидратацията няма да съвпадне.
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === '1') setDismissed(true);
    } catch {
      /* localStorage недостъпен – лентата остава */
    }
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* без запомняне */
    }
  };

  return (
    <div
      role="note"
      className="flex-shrink-0 flex items-center gap-2 min-h-[3.5rem] lg:min-h-0 py-2 pl-16 pr-2 lg:pl-6 lg:pr-3 text-xs sm:text-sm leading-snug bg-amber-50 text-amber-900 border-b border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30"
    >
      <Construction size={16} className="flex-shrink-0" aria-hidden />
      <p className="flex-1">
        Сайтът все още се разработва и може да има грешки и неточности. Ако забележиш такава, пиши ни на{' '}
        <a href="mailto:info@libera-edu.bg" className="font-medium underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-100">
          info@libera-edu.bg
        </a>
        .
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Затвори съобщението"
        title="Затвори"
        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-500/20 dark:hover:text-amber-100"
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}
