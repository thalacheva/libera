import { Construction } from 'lucide-react';

/** Лента най-горе на всяка страница: сайтът още се разработва. */
export default function DevBanner() {
  return (
    <div
      role="note"
      className="flex-shrink-0 flex items-center gap-2 min-h-[3.5rem] lg:min-h-0 py-2 pl-16 pr-4 lg:px-6 text-xs sm:text-sm leading-snug bg-amber-50 text-amber-900 border-b border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30"
    >
      <Construction size={16} className="flex-shrink-0" aria-hidden />
      <p>
        Сайтът все още се разработва и може да има грешки и неточности. Ако забележиш такава, пиши ни на{' '}
        <a href="mailto:ninelibera@gmail.com" className="font-medium underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-100">
          ninelibera@gmail.com
        </a>
        .
      </p>
    </div>
  );
}
