import {BookMarked, ChevronRight, FlaskConical, PencilLine, Sigma, Target, Telescope, TrendingUp, Trophy} from 'lucide-react';
import {Link} from 'react-router-dom';
import {astronomyTopics, mathTopics} from '~/topics';

const mathCount = mathTopics.reduce((n, t) => n + t.subtopics.length, 0);
const lectures = astronomyTopics.flatMap(t => t.subtopics.map(s => ({name: s.name, path: t.path + s.path})));

const FEATURES = [
  {
    icon: FlaskConical,
    title: 'Лаборатории',
    text: 'Интерактивни симулации и чертежи – променяш параметрите и веднага виждаш резултата.',
  },
  {
    icon: PencilLine,
    title: 'Решени примери',
    text: 'Теореми и определения с кратко обяснение и примери, решени стъпка по стъпка.',
  },
  {
    icon: Target,
    title: 'Бърз тест',
    text: 'Въпроси един по един, резултат накрая и преглед на грешките.',
  },
  {
    icon: Trophy,
    title: 'Задачи на три нива',
    text: 'А – областен кръг, В – национален кръг, С – международна олимпиада, с подробно решение.',
  },
];

export function Home() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-6 sm:p-10 rounded-2xl mb-8 shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Интерактивни уроци по математика и астрономия
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed text-blue-50 max-w-3xl mb-6">
            Libera е безплатен сайт на български за ученици, които искат да разберат материала, а не само да го
            запомнят – и за всички, които се готвят за олимпиада. Без регистрация: отваряш урок и започваш.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={mathTopics[0].path + mathTopics[0].subtopics[0].path}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 font-semibold text-indigo-700 shadow-sm hover:bg-blue-50 transition-colors"
            >
              <Sigma size={18} /> Математика
            </Link>
            <Link
              to={lectures[0].path}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 font-semibold text-white ring-1 ring-white/40 hover:bg-white/25 transition-colors"
            >
              <Telescope size={18} /> Астрономия
            </Link>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Какво има във всеки урок</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURES.map(({icon: Icon, title, text}) => (
              <div
                key={title}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                  <Icon size={18} />
                </div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ShortcutCard
            to="/astronomy/tonight"
            icon={<span className="text-2xl">🔭</span>}
            title="Какво да наблюдавам тази вечер"
            text="Видими планети, фаза на Луната, метеорни потоци и карта на небето за твоя град."
          />
          <ShortcutCard
            to="/reference/formulas"
            icon={<BookMarked size={24} className="text-blue-600 dark:text-blue-300" />}
            title="Справочник с формули"
            text="Основните формули от всички уроци и физичните константи на едно място, с търсене."
          />
          <ShortcutCard
            to="/progress"
            icon={<TrendingUp size={24} className="text-emerald-600 dark:text-emerald-300" />}
            title="Моят напредък"
            text="Решените задачи и тестовете по всички уроци и сгрешените въпроси за преговор."
          />
        </section>

        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-2">
            <Sigma size={22} className="text-blue-600 dark:text-blue-400" />
            Математика – {mathCount} урока
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {mathTopics.map(topic => (
              <div
                key={topic.name}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">{topic.name}</h3>
                <ul className="space-y-1 text-sm">
                  {topic.subtopics.map(s => (
                    <li key={s.path}>
                      <Link
                        to={topic.path + s.path}
                        className="text-gray-700 hover:text-blue-700 hover:underline dark:text-gray-300 dark:hover:text-blue-300"
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-2">
            <Telescope size={22} className="text-purple-600 dark:text-purple-400" />
            Астрономия – {lectures.length} лекции
          </h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 rounded-xl border border-gray-200 bg-white p-4 text-sm dark:border-gray-800 dark:bg-gray-900">
            {lectures.map((l, i) => (
              <li key={l.path} className="flex">
                <span className="w-7 flex-shrink-0 tabular-nums text-gray-400 dark:text-gray-500">{i + 1}</span>
                <Link
                  to={l.path}
                  className="text-gray-700 hover:text-purple-700 hover:underline dark:text-gray-300 dark:hover:text-purple-300"
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}

function ShortcutCard({to, icon, title, text}: {to: string; icon: React.ReactNode; title: string; text: string}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-500/50"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
      </div>
      <ChevronRight size={18} className="text-gray-400 group-hover:text-indigo-500" />
    </Link>
  );
}
