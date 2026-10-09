import { ArrowUpRight, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tex } from '~/MathText';
import {
  ASTRONOMY,
  CONSTANTS,
  type Formula,
  type FormulaGroup,
  MATH,
} from './formulaData';

type Filter = 'all' | 'math' | 'astronomy' | 'constants';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Всичко' },
  { id: 'math', label: 'Математика' },
  { id: 'astronomy', label: 'Астрономия' },
  { id: 'constants', label: 'Константи' },
];

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ');

function matches(query: string, ...texts: (string | undefined)[]) {
  if (!query) return true;
  const hay = normalize(texts.filter(Boolean).join(' '));
  return normalize(query)
    .split(' ')
    .every(word => hay.includes(word));
}

function filterGroups(groups: FormulaGroup[], query: string) {
  return groups
    .map(g => ({
      ...g,
      formulas: matches(query, g.title)
        ? g.formulas
        : g.formulas.filter(f => matches(query, f.name, f.formula, f.note)),
    }))
    .filter(g => g.formulas.length > 0);
}

export function Formulas() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const math = useMemo(
    () =>
      filter === 'all' || filter === 'math'
        ? filterGroups(MATH.groups, query)
        : [],
    [filter, query]
  );
  const astronomy = useMemo(
    () =>
      filter === 'all' || filter === 'astronomy'
        ? filterGroups(ASTRONOMY.groups, query)
        : [],
    [filter, query]
  );
  const constants = useMemo(
    () =>
      filter === 'all' || filter === 'constants'
        ? CONSTANTS.map(c => ({
            ...c,
            items: matches(query, c.title)
              ? c.items
              : c.items.filter(i =>
                  matches(query, i.name, i.symbol, i.value, i.note)
                ),
          })).filter(c => c.items.length > 0)
        : [],
    [filter, query]
  );

  const count =
    [...math, ...astronomy].reduce((s, g) => s + g.formulas.length, 0) +
    constants.reduce((s, c) => s + c.items.length, 0);

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Справочник: формули и константи
        </h1>

        <p className="text-base sm:text-lg leading-relaxed mb-6">
          Основните формули от всички уроци на едно място – за преговор преди
          контролно или олимпиада. До всяка формула има връзка към урока, в
          който е обяснена и използвана в задачи.
        </p>

        {/* Търсене и филтър */}
        <div className="lg:sticky lg:-top-10 z-10 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 py-3 mb-6 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center">
            <label className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                inputMode="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Търсене: Кеплер, лице, sin, светимост…"
                aria-label="Търсене във формулите"
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
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Раздел"
            >
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
        </div>

        {count === 0 && (
          <p className="text-gray-600 dark:text-gray-400">
            Няма формули, които да отговарят на „{query}“.
          </p>
        )}

        {math.length > 0 && (
          <SectionBlock title="Математика" accent="blue" groups={math} />
        )}
        {astronomy.length > 0 && (
          <SectionBlock title="Астрономия" accent="purple" groups={astronomy} />
        )}

        {constants.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Константи
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {constants.map(c => (
                <div
                  key={c.title}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
                >
                  <h3 className="px-4 py-2 font-semibold bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
                    {c.title}
                  </h3>
                  <dl className="divide-y divide-gray-100 dark:divide-gray-800">
                    {c.items.map(i => (
                      <div
                        key={i.name}
                        className="px-4 py-2 flex gap-3 items-baseline"
                      >
                        <dt className="flex-1 text-sm">
                          {i.name}
                          {i.note && (
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              {i.note}
                            </span>
                          )}
                        </dt>
                        {i.symbol && (
                          <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
                            {i.symbol}
                          </span>
                        )}
                        <dd className="font-mono text-sm font-medium text-right whitespace-nowrap">
                          {i.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const accents = {
  blue: 'text-blue-700 dark:text-blue-300',
  purple: 'text-purple-700 dark:text-purple-300',
};

function SectionBlock({
  title,
  accent,
  groups,
}: {
  title: string;
  accent: keyof typeof accents;
  groups: FormulaGroup[];
}) {
  return (
    <section className="mb-10">
      <h2
        className={`text-xl sm:text-2xl font-semibold mb-4 ${accents[accent]}`}
      >
        {title}
      </h2>
      {groups.map(g => (
        <div key={g.id} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{g.title}</h3>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {g.formulas.map(f => (
              <FormulaRow key={f.name} formula={f} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function FormulaRow({ formula: f }: { formula: Formula }) {
  return (
    <div className="px-4 py-3 grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-4 gap-y-1 items-baseline">
      <div className="text-sm">
        <span className="font-medium">{f.name}</span>
        {f.lesson && (
          <Link
            to={f.lesson}
            className="inline-flex items-center ml-1.5 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            aria-label={`Урок за ${f.name}`}
          >
            урок
            <ArrowUpRight size={12} />
          </Link>
        )}
      </div>
      <div>
        {/* Частите, разделени с \qquad, се пренасят на нов ред цели */}
        <div className="flex flex-wrap gap-x-8 gap-y-1 items-center text-[17px] text-gray-900 dark:text-gray-100 py-0.5">
          {f.formula.split('\\qquad').map((part, i) => (
            <Tex key={i} className="max-w-full overflow-x-auto overflow-y-hidden">
              {'\\displaystyle ' + part.trim()}
            </Tex>
          ))}
        </div>
        {f.note && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {f.note}
          </div>
        )}
      </div>
    </div>
  );
}
