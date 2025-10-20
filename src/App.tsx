import { BookOpen, Moon, Sun, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Algebra from '~/Algebra';
import Functions from '~/Functions';
import Triangle from '~/geometry/Triangle';
import SidebarMenu from '~/SidebarMenu';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div
      className={
        darkMode
          ? 'bg-gray-900 text-gray-100 h-screen flex flex-col'
          : 'bg-gray-50 text-gray-800 h-screen flex flex-col'
      }
    >
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-600" />
          <span className="font-semibold text-lg">
            Образованието е в твоите ръце
          </span>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Търси уроци..."
            className="px-3 py-1 rounded-lg border dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none"
          />
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <User />
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <SidebarMenu />
        <Routes>
          <Route path="/" element={<Navigate to="/algebra/linear" replace />} />

          {/* Algebra Routes */}
          <Route
            path="/algebra"
            element={<Navigate to="/algebra/linear" replace />}
          />
          <Route path="/algebra/linear" element={<Algebra />} />
          <Route path="/algebra/quadratic" element={<Algebra />} />
          <Route path="/algebra/systems" element={<Algebra />} />

          {/* Functions Routes */}
          <Route
            path="/functions"
            element={<Navigate to="/functions/linear" replace />}
          />
          <Route path="/functions/linear" element={<Functions />} />
          <Route path="/functions/quadratic" element={<Functions />} />
          <Route path="/functions/exponential" element={<Functions />} />

          {/* Geometry Routes */}
          <Route
            path="/geometry"
            element={<Navigate to="/geometry/triangle" replace />}
          />
          <Route path="/geometry/triangle" element={<Triangle />} />
          <Route path="/geometry/quadrilateral" element={<Triangle />} />
          <Route path="/geometry/circle" element={<Triangle />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
