import { Link, useLocation } from 'react-router-dom';

const topics = [
  { name: 'Алгебра', path: '/' },
  { name: 'Функции', path: '/functions' },
  { name: 'Геометрия', path: '/geometry' },
];

export default function SidebarMenu() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-lg font-semibold mb-3">Математика</h2>
      <ul className="space-y-2">
        {topics.map(topic => (
          <li key={topic.name}>
            <Link
              to={topic.path}
              className={`block px-3 py-2 rounded-lg transition ${
                location.pathname === topic.path
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-blue-100 dark:hover:bg-blue-900'
              }`}
            >
              {topic.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
