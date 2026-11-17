import {ArrowRight, Atom, BookA, BookMarked, FlaskConical, Globe, Home, Leaf, Sigma, Telescope} from 'lucide-react';
import {Link} from 'react-router-dom';

const LINKS = [
  {to: '/math', label: 'Математика', icon: Sigma},
  {to: '/physics', label: 'Физика', icon: Atom},
  {to: '/astronomy', label: 'Астрономия', icon: Telescope},
  {to: '/chemistry', label: 'Химия', icon: FlaskConical},
  {to: '/biology', label: 'Биология', icon: Leaf},
  {to: '/geography', label: 'География', icon: Globe},
  {to: '/reference/formulas', label: 'Формули', icon: BookMarked},
  {to: '/reference/glossary', label: 'Речник', icon: BookA},
];

// Показва се за адреси, които не съществуват. При build се записва като dist/404.html –
// Vercel го връща с код 404, за да не индексира Google грешни адреси като копия на началната страница.
export function NotFound() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-6 sm:p-10 rounded-2xl mb-8 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-100 mb-2">Грешка 404</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Няма такава страница</h1>
          <p className="text-lg leading-relaxed text-blue-50 mb-6">
            Адресът може да е сгрешен или урокът да е преместен. Избери предмет от списъка или се върни в началото.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 font-semibold text-indigo-700 shadow-sm hover:bg-blue-50 transition-colors"
          >
            <Home size={18} /> Към началната страница
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {LINKS.map(({to, label, icon: Icon}) => (
            <li key={to}>
              <Link
                to={to}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-800 shadow-sm hover:border-indigo-300 hover:text-indigo-700 transition-colors dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
              >
                <Icon size={20} className="flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                <span className="flex-1">{label}</span>
                <ArrowRight size={18} className="text-gray-400" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
