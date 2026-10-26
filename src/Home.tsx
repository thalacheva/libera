import {Atom, BookA, BookMarked, ChevronDown, ChevronRight, FlaskConical, Leaf, PencilLine, Sigma, Target, Telescope, TrendingUp, Trophy} from 'lucide-react';
import {useState, type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {astronomyIntro, astronomyTopics, biologyTopics, chemistryTopics, lectureNumber, lessonCount, mathTopics, physicsTopics} from '~/topics';

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

// Пълни имена на класовете, за да ги намери Tailwind.
const ACCENTS = {
  blue: {
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-700 dark:text-blue-300',
    hover: 'hover:text-blue-700 dark:hover:text-blue-300',
  },
  emerald: {
    icon: 'text-emerald-600 dark:text-emerald-400',
    title: 'text-emerald-700 dark:text-emerald-300',
    hover: 'hover:text-emerald-700 dark:hover:text-emerald-300',
  },
  purple: {
    icon: 'text-purple-600 dark:text-purple-400',
    title: 'text-purple-700 dark:text-purple-300',
    hover: 'hover:text-purple-700 dark:hover:text-purple-300',
  },
  amber: {
    icon: 'text-amber-600 dark:text-amber-400',
    title: 'text-amber-700 dark:text-amber-300',
    hover: 'hover:text-amber-700 dark:hover:text-amber-300',
  },
  rose: {
    icon: 'text-rose-600 dark:text-rose-400',
    title: 'text-rose-700 dark:text-rose-300',
    hover: 'hover:text-rose-700 dark:hover:text-rose-300',
  },
};
type Accent = (typeof ACCENTS)[keyof typeof ACCENTS];

type TopicGroup = {name: string; path: string; subtopics: {name: string; path: string}[]};

const SUBJECTS = [
  {to: '/math', label: 'Математика', icon: Sigma, accent: ACCENTS.blue, topics: mathTopics, lectures: false},
  {to: '/physics', label: 'Физика', icon: Atom, accent: ACCENTS.emerald, topics: physicsTopics, lectures: false},
  {to: '/astronomy', label: 'Астрономия', icon: Telescope, accent: ACCENTS.purple, topics: astronomyTopics, lectures: true},
  {to: '/chemistry', label: 'Химия', icon: FlaskConical, accent: ACCENTS.amber, topics: chemistryTopics, lectures: false},
  {to: '/biology', label: 'Биология', icon: Leaf, accent: ACCENTS.rose, topics: biologyTopics, lectures: false},
];

export function Home() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-5 pb-12 sm:px-6 sm:pt-10 lg:px-10">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-5 sm:p-10 rounded-2xl mb-8 shadow-lg">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4 text-balance">
            Интерактивни уроци по математика, физика, астрономия, химия и биология
          </h1>
          <p className="text-base sm:text-xl leading-relaxed text-blue-50 max-w-3xl mb-5 sm:mb-6">
            Libera е безплатен сайт на български за ученици, които искат да разберат материала, а не само да го
            запомнят – и за всички, които се готвят за олимпиада. Без регистрация: отваряш урок и започваш.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {SUBJECTS.map(({to, label, icon: Icon}, i) => (
              <Link
                key={to}
                to={to}
                className={
                  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-colors sm:justify-start ' +
                  (i === 0
                    ? 'col-span-2 bg-white text-indigo-700 shadow-sm hover:bg-blue-50'
                    : 'bg-white/15 text-white ring-1 ring-white/40 hover:bg-white/25')
                }
              >
                <Icon size={18} /> {label}
              </Link>
            ))}
          </div>
        </div>

        <section className="mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Какво има във всеки урок</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURES.map(({icon: Icon, title, text}) => (
              <div
                key={title}
                className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:block dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 sm:mb-2 dark:bg-indigo-500/15 dark:text-indigo-300">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 sm:mb-10 grid sm:grid-cols-2 gap-3">
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
            to="/reference/glossary"
            icon={<BookA size={24} className="text-indigo-600 dark:text-indigo-300" />}
            title="Речник на термините"
            text="Кратко обяснение на всяко понятие от уроците, с връзка към урока."
          />
          <ShortcutCard
            to="/progress"
            icon={<TrendingUp size={24} className="text-emerald-600 dark:text-emerald-300" />}
            title="Моят напредък"
            text="Решените задачи и тестовете по всички уроци и сгрешените въпроси за преговор."
          />
        </section>

        {SUBJECTS.map(({to, label, icon, accent, topics, lectures}) => (
          <section key={to} className="mb-8 sm:mb-10">
            <SubjectHeading
              to={to}
              icon={icon}
              accent={accent}
              title={`${label} – ${lessonCount(topics.reduce((n, t) => n + t.subtopics.length, 0), lectures)}`}
            />
            <TopicGrid topics={topics} accent={accent} lectures={lectures} />
          </section>
        ))}
      </div>
    </main>
  );
}

// По-високи редове на телефон, за да се натискат лесно с пръст.
const LESSON_LINK = 'block py-1.5 text-gray-700 hover:underline sm:py-0 dark:text-gray-300';

function SubjectHeading({to, icon: Icon, accent, title}: {to: string; icon: typeof Sigma; accent: Accent; title: string}) {
  return (
    <h2 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
      <Icon size={22} className={`flex-shrink-0 ${accent.icon}`} />
      <span className="min-w-0">{title}</span>
      <Link
        to={to}
        className={`ml-auto inline-flex flex-shrink-0 items-center whitespace-nowrap text-sm font-medium hover:underline ${accent.title}`}
      >
        <span className="hidden sm:inline">Към раздела</span>
        <span className="sm:hidden">Всички</span>
        <ChevronRight size={16} />
      </Link>
    </h2>
  );
}

/** При астрономията лекциите са с номерата си, а въведението (без номер) е първо в първия раздел. */
function TopicGrid({topics, accent, lectures}: {topics: TopicGroup[]; accent: Accent; lectures: boolean}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {topics.map((topic, i) => {
        const items = topic.subtopics.map(s => ({
          path: topic.path + s.path,
          name: s.name,
          number: lectures ? String(lectureNumber(s.path)) : '',
        }));
        if (lectures && i === 0) items.unshift({path: astronomyIntro.path, name: 'Въведение', number: '·'});
        return (
          <Collapsible key={topic.name} title={topic.name} meta={lessonCount(topic.subtopics.length, lectures)} accent={accent}>
            <ul className="sm:space-y-1 text-sm">
              {items.map(l => (
                <li key={l.path} className="flex">
                  {lectures && (
                    <span className="w-6 py-1.5 flex-shrink-0 tabular-nums text-gray-400 sm:py-0 dark:text-gray-500">{l.number}</span>
                  )}
                  <Link to={l.path} className={`${LESSON_LINK} ${accent.hover}`}>
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Collapsible>
        );
      })}
    </div>
  );
}

/** Карта, която на телефон е свита до заглавието; от sm нагоре съдържанието винаги се вижда. */
function Collapsible({title, meta, accent, children}: {title: string; meta: string; accent: Accent; children: ReactNode}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left sm:pointer-events-none sm:pb-2 sm:pt-4"
      >
        <h3 className={`flex-1 font-semibold ${accent.title}`}>{title}</h3>
        <span className="text-xs text-gray-500 sm:hidden dark:text-gray-400">{meta}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform sm:hidden ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`px-4 pb-3 sm:block sm:pb-4 ${open ? '' : 'hidden'}`}>{children}</div>
    </div>
  );
}

function ShortcutCard({to, icon, title, text}: {to: string; icon: ReactNode; title: string; text: string}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 sm:gap-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4 hover:border-indigo-300 hover:shadow-sm transition dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-500/50"
    >
      <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
      </div>
      <ChevronRight size={18} className="flex-shrink-0 text-gray-400 group-hover:text-indigo-500" />
    </Link>
  );
}
