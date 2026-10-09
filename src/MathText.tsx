import 'katex/dist/katex.min.css';
import katex from 'katex';
import {Fragment, useMemo} from 'react';

const cache = new Map<string, string>();

// Означенията от българските учебници
const MACROS = {
  '\\tg': '\\operatorname{tg}',
  '\\cotg': '\\operatorname{cotg}',
};

function render(tex: string, display: boolean) {
  const key = (display ? 'D' : 'I') + tex;
  let html = cache.get(key);
  if (html === undefined) {
    html = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      output: 'htmlAndMathml',
      macros: {...MACROS},
    });
    cache.set(key, html);
  }
  return html;
}

/** Формула в LaTeX: <Tex>{'\\frac{a}{b}'}</Tex>; block – на отделен ред, центрирана. */
export function Tex({children, block = false, className}: {children: string; block?: boolean; className?: string}) {
  const html = useMemo(() => render(children, block), [children, block]);
  const Tag = block ? 'div' : 'span';
  return <Tag className={className} dangerouslySetInnerHTML={{__html: html}} />;
}

/**
 * Текст с формули: $…$ – формула в реда, $$…$$ – на отделен ред.
 * Текст без $ се показва непроменен. displayStyle – дробите в реда са в пълен размер (за малки карти).
 */
export function MathText({children, displayStyle = false}: {children: string; displayStyle?: boolean}) {
  if (!children.includes('$')) return <>{children}</>;
  const parts = children.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
          return <Tex key={i} block className="my-2 overflow-x-auto overflow-y-hidden">{part.slice(2, -2)}</Tex>;
        }
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const tex = part.slice(1, -1);
          // дробите в пълен размер са по-високи от реда – малко въздух горе и долу, за да не се допират редовете
          return displayStyle ? (
            <Tex key={i} className="inline-block py-1">{`\\displaystyle ${tex}`}</Tex>
          ) : (
            <Tex key={i}>{tex}</Tex>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
