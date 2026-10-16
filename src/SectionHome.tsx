import {ArrowRight, Atom, BookA, BookMarked, CheckCircle2, ChevronRight, FlaskConical, Sigma, Telescope} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {lessonPages} from '~/pages';
import {hasActivity, lessonProgress} from '~/progress';
import {astronomyIntro, astronomyTopics, chemistryTopics, mathTopics, physicsTopics} from '~/topics';

type Area = 'math' | 'physics' | 'astronomy' | 'chemistry';
type Lesson = {path: string; name: string; number?: number};
type Group = {name: string; lessons: Lesson[]};

const groupsOf = (topics: typeof mathTopics, numbered = false): Group[] =>
  topics.map(t => ({
    name: t.name,
    lessons: t.subtopics.map((s, i) => ({path: t.path + s.path, name: s.name, number: numbered ? i + 1 : undefined})),
  }));

const SECTIONS: Record<
  Area,
  {
    title: string;
    icon: typeof Sigma;
    intro: string;
    groups: Group[];
    hero: string;
    accent: string;
    hover: string;
  }
> = {
  math: {
    title: 'Математика',
    icon: Sigma,
    intro:
      'От дробите и уравненията до производните, интегралите и вероятностите. Всеки урок има интерактивни чертежи и графики, решени примери, бърз тест и задачи на три нива – до международна олимпиада.',
    groups: groupsOf(mathTopics),
    hero: 'from-blue-600 to-indigo-800',
    accent: 'text-blue-700 dark:text-blue-300',
    hover: 'hover:border-blue-300 dark:hover:border-blue-500/50',
  },
  physics: {
    title: 'Физика',
    icon: Atom,
    intro:
      'Курс по физика от мерните единици и законите на Нютон до фотоните, атома и ядрото. Във всеки урок има симулации, в които сам променяш параметрите, решени примери, бърз тест и олимпиадни задачи.',
    groups: groupsOf(physicsTopics),
    hero: 'from-emerald-600 to-teal-800',
    accent: 'text-emerald-700 dark:text-emerald-300',
    hover: 'hover:border-emerald-300 dark:hover:border-emerald-500/50',
  },
  chemistry: {
    title: 'Химия',
    icon: FlaskConical,
    intro:
      'Курс по химия от веществата и смесите до реакциите, органичната и ядрената химия. Във всеки урок има лаборатории, в които сам смесваш, разделяш и измерваш, решени примери, бърз тест и олимпиадни задачи.',
    groups: groupsOf(chemistryTopics),
    hero: 'from-amber-600 to-orange-800',
    accent: 'text-amber-700 dark:text-amber-300',
    hover: 'hover:border-amber-300 dark:hover:border-amber-500/50',
  },
  astronomy: {
    title: 'Астрономия',
    icon: Telescope,
    intro:
      'Лекции от небесната сфера и Слънчевата система до звездите, галактиките и космологията. Във всяка има интерактивни симулации, решени примери, бърз тест и задачи от олимпиадите по астрономия.',
    // въведението е първо и без номер
    groups: groupsOf(astronomyTopics, true).map(g => ({...g, lessons: [{path: astronomyIntro.path, name: 'Въведение: какво изучава астрономията'}, ...g.lessons]})),
    hero: 'from-purple-600 to-indigo-900',
    accent: 'text-purple-700 dark:text-purple-300',
    hover: 'hover:border-purple-300 dark:hover:border-purple-500/50',
  },
};

const aboutOf = (path: string) => lessonPages.find(p => p.path === path)?.about;

/** Начална страница на раздел: всички уроци по групи, с кратко описание и отметка за започнатите. */
export function SectionHome({area}: {area: Area}) {
  const {title, icon: Icon, intro, groups, hero, accent, hover} = SECTIONS[area];
  const lessons = groups.flatMap(g => g.lessons);
  const single = groups.length === 1;
  const word = area === 'astronomy' ? (lessons.length === 1 ? 'лекция' : 'лекции') : lessons.length === 1 ? 'урок' : 'урока';

  // Прогресът е в localStorage – чете се след зареждане, за да съвпада с готовия HTML
  const [started, setStarted] = useState<Set<string>>(new Set());
  useEffect(() => {
    setStarted(new Set(lessons.filter(l => hasActivity(lessonProgress(l.path))).map(l => l.path)));
  }, [area]); // eslint-disable-line react-hooks/exhaustive-deps

  const first = lessons[0];
  const next = started.size ? lessons.find(l => !started.has(l.path)) : undefined;

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-5xl mx-auto">
        <div className={`bg-gradient-to-br ${hero} text-white p-6 sm:p-10 rounded-2xl mb-8 shadow-lg`}>
          <h1 className="flex items-center gap-3 text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            <Icon size={34} className="flex-shrink-0" />
            {title}
          </h1>
          <p className="text-lg leading-relaxed text-white/90 max-w-3xl mb-2">{intro}</p>
          <p className="text-sm text-white/75 mb-6">
            {lessons.length} {word}
            {!single && ` в ${groups.length} теми`}
            {started.size > 0 && ` · започнати: ${started.size}`}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={(next ?? first).path}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 font-semibold text-gray-900 shadow-sm hover:bg-gray-100 transition-colors"
            >
              {next ? `Продължи: ${next.name}` : `Започни: ${first.name}`}
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/reference/formulas"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 font-semibold text-white ring-1 ring-white/40 hover:bg-white/25 transition-colors"
            >
              <BookMarked size={18} /> Формули
            </Link>
            <Link
              to="/reference/glossary"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 font-semibold text-white ring-1 ring-white/40 hover:bg-white/25 transition-colors"
            >
              <BookA size={18} /> Речник
            </Link>
          </div>
        </div>

        {area === 'astronomy' && (
          <Link
            to="/astronomy/tonight"
            className={`group mb-10 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition dark:border-gray-800 dark:bg-gray-900 ${hover}`}
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-2xl dark:bg-gray-800">
              🔭
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">Какво да наблюдавам тази вечер</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Видими планети, фаза на Луната, метеорни потоци и карта на небето за твоя град.
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-purple-500" />
          </Link>
        )}

        {groups.map(group => (
          <section key={group.name} className="mb-10">
            {!single && (
              <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${accent}`}>
                {group.name}{' '}
                <span className="text-base font-normal text-gray-500 dark:text-gray-400">
                  · {group.lessons.length} {group.lessons.length === 1 ? 'урок' : 'урока'}
                </span>
              </h2>
            )}
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.lessons.map(l => (
                <li key={l.path}>
                  <Link
                    to={l.path}
                    className={`group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition dark:border-gray-800 dark:bg-gray-900 ${hover}`}
                  >
                    <h3 className="flex items-start gap-2 font-semibold text-gray-900 dark:text-gray-100">
                      {l.number && <span className="w-6 flex-shrink-0 tabular-nums text-gray-400 dark:text-gray-500">{l.number}</span>}
                      <span className="flex-1">{l.name}</span>
                      {started.has(l.path) && (
                        <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5 text-emerald-500" aria-label="започнат" />
                      )}
                    </h3>
                    {aboutOf(l.path) && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 first-letter:uppercase">{aboutOf(l.path)}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
