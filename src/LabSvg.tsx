import { Minimize2, ZoomIn } from 'lucide-react';
import { type ComponentProps, useEffect, useRef, useState } from 'react';

/** Колко пъти се уголемява чертежът спрямо viewBox, когато е „увеличен“ (шрифт 10 → 12,5 px). */
const ZOOMED_SCALE = 1.25;
/** Под този мащаб надписите стават твърде дребни (шрифт 10 → под 7,5 px) и показваме бутона. */
const MIN_SCALE = 0.75;

/**
 * SVG на лаборатория, чертана за широк екран (обикновено 640 единици).
 * На телефон целият чертеж се смалява и надписите стават нечетливи – тогава под него
 * има бутон „Увеличи“: чертежът се показва в истински размер и се плъзга настрани.
 * Всички свойства (viewBox, ref, обработчици на влачене) отиват направо към <svg>.
 */
export default function LabSvg({ className, style, children, ...props }: ComponentProps<'svg'>) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [small, setSmall] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const vbWidth = Number(String(props.viewBox ?? '').split(/[\s,]+/)[2]) || 0;

  // Размерът на екрана се знае чак в браузъра – при предварителното рендериране бутон няма
  useEffect(() => {
    const box = boxRef.current;
    if (!box || !vbWidth) return;
    const observer = new ResizeObserver(([entry]) => setSmall(entry.contentRect.width / vbWidth < MIN_SCALE));
    observer.observe(box);
    return () => observer.disconnect();
  }, [vbWidth]);

  const big = small && zoomed;

  return (
    <div ref={boxRef} className="min-w-0 [contain:inline-size]">
      <div className={big ? 'overflow-x-auto overscroll-x-contain rounded-lg' : undefined}>
        <svg
          {...props}
          className={className}
          style={big ? { ...style, width: vbWidth * ZOOMED_SCALE, maxWidth: 'none', maxHeight: 'none' } : style}
        >
          {children}
        </svg>
      </div>
      {small && (
        <button
          type="button"
          onClick={() => setZoomed(!zoomed)}
          className="mx-auto mt-2 flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          {zoomed ? <Minimize2 size={15} /> : <ZoomIn size={15} />}
          {zoomed ? 'Смали' : 'Увеличи (плъзга се настрани)'}
        </button>
      )}
    </div>
  );
}
