import { BookOpen, Menu, Moon, Sun, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Algebra from '~/Algebra';
import Triangle from '~/geometry/Triangle';
import SidebarMenu from '~/SidebarMenu';
import InteractiveFunctionGrapher from './functions/InteractiveFunctionGrapher';
import LinearFunctions from './functions/LinearFunctions';
import QuadraticFunctions from './functions/QuadraticFunctions';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={`h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}
    >
      <header className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <BookOpen className="text-blue-600" size={20} />
          <span className="font-semibold text-sm sm:text-lg">
            Образованието е в твоите ръце
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <input
            type="text"
            placeholder="Търси..."
            className="hidden sm:block px-3 py-1 rounded-lg border dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none text-sm"
          />
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <User className="hidden sm:block" size={20} />
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <SidebarMenu
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/algebra/linear" replace />} />
          <Route path="algebra">
            <Route path="linear" element={<Algebra />} />
            <Route path="quadratic" element={<Algebra />} />
            <Route path="systems" element={<Algebra />} />
          </Route>
          <Route path="functions">
            <Route path="grapher" element={<InteractiveFunctionGrapher />} />
            <Route path="linear" element={<LinearFunctions />} />
            <Route path="quadratic" element={<QuadraticFunctions />} />
          </Route>
          <Route path="geometry">
            <Route path="triangle" element={<Triangle />} />
            <Route path="quadrilateral" element={<Triangle />} />
            <Route path="circle" element={<Triangle />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
