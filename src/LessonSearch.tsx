import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchLessons } from './lessonIndex';

const MAX = 8;

/** Поле за търсене; ползва се и самостоятелно (на страниците на предметите). */
export function SearchInput({ value, onChange, placeholder, label, onEnter }: { value: string; onChange: (v: string) => void; placeholder: string; label: string; onEnter?: () => void }) {
  return (
    <label className="relative block">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        inputMode="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onEnter?.();
          if (e.key === 'Escape') onChange('');
        }}
        placeholder={placeholder}
        aria-label={label}
        className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-9 text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Изчисти търсенето" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <X size={16} />
        </button>
      )}
    </label>
  );
}

/** Търсачка за уроци във всички предмети: резултатите се показват под полето. */
export default function LessonSearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const results = query.trim() ? searchLessons(query) : [];
  const shown = results.slice(0, MAX);

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="Търси урок: дроби, гравитация, клетка, климат…" label="Търсене на урок" onEnter={() => shown[0] && navigate(shown[0].path)} />
      {query.trim() && (
        <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
          {shown.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              Няма урок с „{query.trim()}“. Опитай с друга дума или потърси в{' '}
              <Link to="/reference/glossary" className="text-indigo-600 hover:underline dark:text-indigo-300">
                речника на термините
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {shown.map(l => (
                <li key={l.path}>
                  <Link to={l.path} className="block px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <span className="block font-semibold">{l.name}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {l.subject} · {l.group}
                    </span>
                    {l.about && <span className="block truncate text-sm text-gray-600 first-letter:uppercase dark:text-gray-400">{l.about}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {results.length > MAX && <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">Показани са първите {MAX} от {results.length} урока – добави още една дума, за да стесниш търсенето.</p>}
        </div>
      )}
    </div>
  );
}
