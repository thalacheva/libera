import { ArrowUpRight, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MathText } from '~/MathText';
import { lessonPages } from '~/pages';
import { type Area, type GlossaryTerm, TERMS } from './glossaryData';

type Filter = 'all' | Area;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Всичко' },
  { id: 'math', label: 'Математика' },
  { id: 'physics', label: 'Физика' },
  { id: 'astronomy', label: 'Астрономия' },
  { id: 'chemistry', label: 'Химия' },
  { id: 'biology', label: 'Биология' },
  { id: 'geography', label: 'География' },
];

const AREA: Record<Area, { label: string; className: string }> = {
  math: { label: 'математика', className: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300' },
  physics: { label: 'физика', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  chemistry: { label: 'химия', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  biology: { label: 'биология', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  geography: { label: 'география', className: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300' },
  astronomy: { label: 'астрономия', className: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300' },
};

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ');
const lessonTitle = (path: string) => lessonPages.find(p => p.path === path)?.title.split(' — ')[0];

const SORTED = [...TERMS].sort((a, b) => a.term.localeCompare(b.term, 'bg'));
const letterOf = (t: GlossaryTerm) => t.term[0].toLocaleUpperCase('bg');

export function Glossary() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const { hash } = useLocation();

  const terms = useMemo(() => {
    const words = normalize(query).split(' ').filter(Boolean);
    return SORTED.filter(t => {
      if (filter !== 'all' && t.area !== filter) return false;
      const hay = normalize(`${t.term} ${t.forms.join(' ')} ${t.def}`);
      return words.every(w => hay.includes(w));
    });
  }, [query, filter]);

  const letters = useMemo(() => {
    const groups = new Map<string, GlossaryTerm[]>();
    for (const t of terms) {
      const l = letterOf(t);
      groups.set(l, [...(groups.get(l) ?? []), t]);
    }
    return [...groups];
  }, [terms]);

  // Връзка от урок: /reference/glossary#momentum – превъртаме до термина и го осветяваме
  const target = decodeURIComponent(hash.slice(1));
  useEffect(() => {
    if (target) document.getElementById(target)?.scrollIntoView({ block: 'center' });
  }, [target]);

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Речник на термините</h1>

        <p className="text-base sm:text-lg leading-relaxed mb-6">
          Кратко обяснение на основните понятия от уроците по математика, физика, астрономия, химия, биология и география, с връзка към урока, в който са
          обяснени подробно. В текста на уроците термините са подчертани с точки – посочи ги (или ги докосни), за да видиш
          обяснението.
        </p>

        {/* Търсене и филтър */}
        <div className="lg:sticky lg:-top-10 z-10 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 py-3 mb-6 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center">
            <label className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                inputMode="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Търсене: импулс, медиана, парсек…"
                aria-label="Търсене в речника"
                className="w-full pl-10 pr-9 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Изчисти търсенето"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              )}
            </label>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Раздел">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    filter === f.id
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {letters.length > 1 && (
            <nav aria-label="Букви" className="max-w-4xl mx-auto flex flex-wrap gap-x-1 mt-2 text-sm">
              {letters.map(([l]) => (
                <a
                  key={l}
                  href={`#letter-${l}`}
                  onClick={e => {
                    e.preventDefault();
                    document.getElementById(`letter-${l}`)?.scrollIntoView({ block: 'start' });
                  }}
                  className="px-1.5 rounded font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                >
                  {l}
                </a>
              ))}
            </nav>
          )}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {terms.length === 0 ? `Няма термини, които да отговарят на „${query}“.` : `${terms.length} ${terms.length === 1 ? 'термин' : 'термина'}`}
        </p>

        {letters.map(([l, group]) => (
          <section key={l} id={`letter-${l}`} className="mb-8 scroll-mt-40">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{l}</h2>
            <dl className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {group.map(t => (
                <div
                  key={t.id}
                  id={t.id}
                  className={`px-4 py-3 scroll-mt-40 ${t.id === target ? 'bg-amber-50 dark:bg-amber-500/10' : ''}`}
                >
                  <dt className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 first-letter:uppercase">{t.term}</span>
                    <span className={`text-xs px-1.5 rounded ${AREA[t.area].className}`}>{AREA[t.area].label}</span>
                  </dt>
                  <dd className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mt-1">
                    <MathText>{t.def}</MathText>{' '}
                    <Link
                      to={t.lesson}
                      className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      {lessonTitle(t.lesson) ?? 'урок'}
                      <ArrowUpRight size={12} />
                    </Link>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </main>
  );
}
