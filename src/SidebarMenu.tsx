import { Link, useLocation } from 'react-router-dom';

const topics = [
  {
    name: 'Алгебра',
    path: '/algebra',
    subtopics: [
      { name: 'Линейни уравнения', path: '/linear' },
      { name: 'Квадратни уравнения', path: '/quadratic' },
      { name: 'Системи уравнения', path: '/systems' },
    ],
  },
  {
    name: 'Функции',
    path: '/functions',
    subtopics: [
      { name: 'Графики на функции', path: '/grapher' },
      { name: 'Линейни функции', path: '/linear' },
      { name: 'Квадратни функции', path: '/quadratic' },
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

export default function SidebarMenu() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-lg font-semibold mb-3">Математика</h2>
      <ul className="space-y-2">
        {topics.map(topic => {
          const defaultPath = topic.subtopics?.[0]
            ? topic.path + topic.subtopics[0].path
            : topic.path;

          const isTopicActive = location.pathname.startsWith(topic.path);

          return (
            <li key={topic.name}>
              <Link
                to={defaultPath}
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
    </aside>
  );
}
