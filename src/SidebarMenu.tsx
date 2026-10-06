import {BookOpen, ChevronDown, ChevronRight, Sigma, Telescope} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';

const mathTopics = [
  {
    name: 'Алгебра',
    path: '/algebra',
    subtopics: [
      { name: 'Линейни уравнения', path: '/linear' },
      { name: 'Квадратни уравнения', path: '/quadratic' },
    ],
  },
  {
    name: 'Функции',
    path: '/functions',
    subtopics: [
      { name: 'Линейни функции', path: '/linear' },
      { name: 'Квадратни функции', path: '/quadratic' },
      { name: 'Графики на функции', path: '/grapher' },
    ],
  },
  {
    name: 'Геометрия',
    path: '/geometry',
    subtopics: [
      { name: 'Триъгълник', path: '/triangle' },
      { name: 'Четириъгълник', path: '/quadrilateral' },
      { name: 'Окръжност и кръг', path: '/circle' },
    ],
  },
];

const astronomyTopics = [
  {
    name: 'Астрономия',
    path: '/astronomy',
    subtopics: [
      { name: 'Небесната сфера', path: '/lecture01' },
      { name: 'Небесни координати', path: '/lecture02' },
      { name: 'Движение на Земята', path: '/lecture03' },
      { name: 'Фази на Луната', path: '/lecture04' },
      { name: 'Слънчеви затъмнения', path: '/lecture05' },
      { name: 'Гравитация', path: '/lecture06' },
      { name: 'Закони на Кеплер', path: '/lecture07' },
      { name: 'Орбити и скорости', path: '/lecture08' },
      { name: 'Светлина и спектри', path: '/lecture09' },
      { name: 'Телескопи', path: '/lecture10' },
      { name: 'Слънцето', path: '/lecture11' },
      { name: 'Слънчева активност', path: '/lecture12' },
      { name: 'Планети от земен тип', path: '/lecture13' },
      { name: 'Газови гиганти', path: '/lecture14' },
      { name: 'Малки тела', path: '/lecture15' },
      { name: 'Комети и метеори', path: '/lecture16' },
      { name: 'Астероиди', path: '/lecture17' },
      { name: 'Звезди', path: '/lecture18' },
      { name: 'HR диаграма', path: '/lecture19' },
      { name: 'Еволюция на звездите', path: '/lecture20' },
      { name: 'Бели джуджета и черни дупки', path: '/lecture21' },
      { name: 'Двойни звезди', path: '/lecture22' },
      { name: 'Променливи звезди', path: '/lecture23' },
      { name: 'Разстояния', path: '/lecture24' },
      { name: 'Галактики', path: '/lecture25' },
      { name: 'Млечният път', path: '/lecture26' },
      { name: 'Големият взрив', path: '/lecture27' },
      { name: 'Разширяване на Вселената', path: '/lecture28' },
      { name: 'Тъмна материя', path: '/lecture29' },
      { name: 'Екзопланети', path: '/lecture30' },
      { name: 'Астробиология', path: '/lecture31' },
      { name: 'Методи за наблюдение', path: '/lecture32' },
      { name: 'Специална теория на относителността', path: '/lecture33' },
    ],
  },
];

interface SidebarMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarMenu({
  isOpen = true,
  onClose,
}: SidebarMenuProps) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    math: true,
    astronomy: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center gap-3 px-5 pt-16 pb-5 lg:pt-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
            <BookOpen size={18} />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-gray-900 dark:text-white">
              Libera
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Учи свободно
            </div>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-6">
          {/* Математика секция */}
          <div>
            <SectionHeader
              icon={<Sigma size={16} />}
              label="Математика"
              expanded={expandedSections.math}
              onToggle={() => toggleSection('math')}
            />
            {expandedSections.math && (
              <ul className="mt-2 space-y-3">
                {mathTopics.map(topic => {
                  const defaultPath = topic.subtopics?.[0]
                    ? topic.path + topic.subtopics[0].path
                    : topic.path;

                  const isTopicActive = location.pathname.startsWith(topic.path);

                  return (
                    <li key={topic.name}>
                      <Link
                        to={defaultPath}
                        onClick={onClose}
                        className={`block px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                          isTopicActive
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        {topic.name}
                      </Link>
                      {topic.subtopics && (
                        <ul className="ml-3 mt-1 space-y-0.5 border-l border-gray-200 dark:border-gray-800 pl-2">
                          {topic.subtopics.map(subtopic => {
                            const fullPath = topic.path + subtopic.path;
                            return (
                              <li key={subtopic.name}>
                                <NavItem
                                  to={fullPath}
                                  active={location.pathname === fullPath}
                                  accent="blue"
                                  onClick={onClose}
                                >
                                  {subtopic.name}
                                </NavItem>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Астрономия секция */}
          <div>
            <SectionHeader
              icon={<Telescope size={16} />}
              label="Астрономия"
              expanded={expandedSections.astronomy}
              onToggle={() => toggleSection('astronomy')}
            />
            {expandedSections.astronomy && (
              <ul className="mt-2 space-y-0.5">
                {astronomyTopics.flatMap(topic =>
                  topic.subtopics.map((subtopic, index) => {
                    const fullPath = topic.path + subtopic.path;
                    return (
                      <li key={subtopic.name}>
                        <NavItem
                          to={fullPath}
                          active={location.pathname === fullPath}
                          accent="purple"
                          onClick={onClose}
                        >
                          <span className="w-6 flex-shrink-0 text-xs tabular-nums text-gray-400 dark:text-gray-500">
                            {index + 1}
                          </span>
                          <span>{subtopic.name}</span>
                        </NavItem>
                      </li>
                    );
                  }),
                )}
              </ul>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}

function SectionHeader({
  icon,
  label,
  expanded,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={expanded}
      className="flex items-center gap-2 w-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
    </button>
  );
}

const accentClasses = {
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  purple: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
};

function NavItem({
  to,
  active,
  accent,
  onClick,
  children,
}: {
  to: string;
  active: boolean;
  accent: keyof typeof accentClasses;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (active) ref.current?.scrollIntoView({block: 'nearest'});
  }, [active]);

  return (
    <Link
      ref={ref}
      to={to}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors ${
        active
          ? `${accentClasses[accent]} font-medium`
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}
