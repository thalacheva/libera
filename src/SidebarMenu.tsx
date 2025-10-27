import { Link, useLocation } from 'react-router-dom';

const topics = [
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

interface SidebarMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarMenu({
  isOpen = true,
  onClose,
}: SidebarMenuProps) {
  const location = useLocation();

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
      </aside>
    </>
  );
}
