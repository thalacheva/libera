import { ArrowUpRight, BookA } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MathText } from './MathText';
import { lessonPages } from './pages';
import type { GlossaryTerm } from './reference/glossaryData';

const WIDTH = 288; // px, ширина на картичката
const lessonTitle = (path: string) => lessonPages.find(p => p.path === path)?.title.split(' — ')[0];

// Речникът е голям – зарежда се чак при първото посочване на термин
let loading: Promise<Map<string, GlossaryTerm>> | undefined;
const loadTerms = () => (loading ??= import('./reference/glossaryData').then(m => m.termById));

/**
 * Термин от речника: <Term id="momentum">импулса</Term>.
 * При посочване (или докосване на телефон) показва кратко обяснение и връзки към урока и речника.
 */
export default function Term({ id, children }: { id: string; children: ReactNode }) {
  const [t, setT] = useState<GlossaryTerm>();
  const [pos, setPos] = useState<{ left: number; top: number; above: boolean } | null>(null);
  const ref = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(undefined);
  const { pathname } = useLocation();
  const popId = useId();
  const wanted = useRef(false);

  const open = useCallback(() => {
    window.clearTimeout(timer.current);
    wanted.current = true;
    loadTerms().then(terms => {
      const r = ref.current?.getBoundingClientRect();
      // докато се зареждаше, мишката може вече да е излязла
      if (!r || !wanted.current) return;
      setT(terms.get(id));
      const left = Math.max(8, Math.min(r.left, window.innerWidth - WIDTH - 8));
      // под думата, а ако долу няма място – над нея
      const above = r.bottom + 200 > window.innerHeight && r.top > 220;
      setPos({ left, top: above ? r.top - 6 : r.bottom + 6, above });
    });
  }, [id]);
  const close = useCallback(() => {
    wanted.current = false;
    setPos(null);
  }, []);
  const closeSoon = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(close, 200);
  };

  useEffect(() => {
    if (!pos) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onDown = (e: PointerEvent) => {
      const n = e.target as Node;
      if (!ref.current?.contains(n) && !card.current?.contains(n)) close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    // картичката е fixed – при превъртане я затваряме
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [pos, close]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const hover = (e: React.PointerEvent) => e.pointerType === 'mouse';

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-expanded={!!pos}
        aria-controls={pos ? popId : undefined}
        onClick={() => (pos ? close() : open())}
        onPointerEnter={e => hover(e) && open()}
        onPointerLeave={e => hover(e) && closeSoon()}
        className="inline p-0 m-0 bg-transparent font-[inherit] text-inherit text-left cursor-help underline decoration-dotted decoration-1 underline-offset-[3px] decoration-gray-400 hover:decoration-indigo-500 dark:decoration-gray-500 dark:hover:decoration-indigo-400"
      >
        {children}
      </button>
      {pos && t && (
        <div
          ref={card}
          id={popId}
          role="tooltip"
          onPointerEnter={e => hover(e) && window.clearTimeout(timer.current)}
          onPointerLeave={e => hover(e) && closeSoon()}
          style={{ left: pos.left, top: pos.top, width: WIDTH, transform: pos.above ? 'translateY(-100%)' : undefined }}
          className="fixed z-50 max-w-[calc(100vw-16px)] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-3 text-sm leading-relaxed font-normal not-italic text-gray-700 dark:text-gray-300"
        >
          <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1 first-letter:uppercase">{t.term}</div>
          <div>
            <MathText>{t.def}</MathText>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
            {t.lesson !== pathname && (
              <Link to={t.lesson} className="inline-flex items-center gap-0.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                {lessonTitle(t.lesson) ?? 'урок'}
                <ArrowUpRight size={12} />
              </Link>
            )}
            <Link
              to={`/reference/glossary#${t.id}`}
              className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <BookA size={12} />
              речник
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
