import {ChevronDown, ChevronRight} from 'lucide-react';
import {useState} from 'react';
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
      { name: 'Кръг', path: '/circle' },
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Математика секция */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('math')}
            className="flex items-center justify-between w-full text-lg font-semibold mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <span>Математика</span>
            {expandedSections.math ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
          {expandedSections.math && (
            <ul className="space-y-2">
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
                      className={`block px-3 py-2 rounded-lg transition ${
                        isTopicActive
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-blue-100 dark:hover:bg-blue-900'
                      }`}
                    >
                      {topic.name}
                    </Link>
                    {topic.subtopics && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {topic.subtopics.map(subtopic => {
                          const fullPath = topic.path + subtopic.path;
                          return (
                            <li key={subtopic.name}>
                              <Link
                                to={fullPath}
                                onClick={onClose}
                                className={`block px-3 py-1.5 rounded-lg transition text-sm ${
                                  location.pathname === fullPath
                                    ? 'bg-blue-500 text-white'
                                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/50'
                                }`}
                              >
                                {subtopic.name}
                              </Link>
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
        <div className="mb-6">
          <button
            onClick={() => toggleSection('astronomy')}
            className="flex items-center justify-between w-full text-lg font-semibold mb-3 hover:text-purple-600 dark:hover:text-purple-400 transition"
          >
            <span>Астрономия</span>
            {expandedSections.astronomy ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
          {expandedSections.astronomy && (
            <ul className="space-y-2">
              {astronomyTopics.map(topic => {
                return (
                  <li key={topic.name}>
                    {topic.subtopics && (
                      <ul className="space-y-1">
                        {topic.subtopics.map(subtopic => {
                          const fullPath = topic.path + subtopic.path;
                          return (
                            <li key={subtopic.name}>
                              <Link
                                to={fullPath}
                                onClick={onClose}
                                className={`block px-3 py-1.5 rounded-lg transition text-sm ${
                                  location.pathname === fullPath
                                    ? 'bg-purple-500 text-white'
                                    : 'hover:bg-purple-50 dark:hover:bg-purple-900/50'
                                }`}
                              >
                                {subtopic.name}
                              </Link>
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
      </aside>
    </>
  );
}
