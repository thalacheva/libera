import {BookOpen, Menu, Moon, Sun, User, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import {Circle, Quadrangle, Triangle} from '~/geometry';
import SidebarMenu from '~/SidebarMenu';
import {LinearEquations, QuadraticEquations} from './algebra';
import {
  Lecture01, Lecture02, Lecture03, Lecture04, Lecture05,
  Lecture06, Lecture07, Lecture08, Lecture09, Lecture10,
  Lecture11, Lecture12, Lecture13, Lecture14, Lecture15,
  Lecture16, Lecture17, Lecture18, Lecture19, Lecture20,
  Lecture21, Lecture22, Lecture23, Lecture24, Lecture25,
  Lecture26, Lecture27, Lecture28, Lecture29, Lecture30,
  Lecture31, Lecture32,
} from './astronomy';
import {
  FunctionGraph,
  LinearFunctions,
  QuadraticFunctions,
} from './functions';

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
            <Route path="linear" element={<LinearEquations />} />
            <Route path="quadratic" element={<QuadraticEquations />} />
          </Route>
          <Route path="functions">
            <Route path="linear" element={<LinearFunctions />} />
            <Route path="quadratic" element={<QuadraticFunctions />} />
            <Route path="grapher" element={<FunctionGraph />} />
          </Route>
          <Route path="geometry">
            <Route path="triangle" element={<Triangle />} />
            <Route path="quadrilateral" element={<Quadrangle />} />
            <Route path="circle" element={<Circle />} />
          </Route>
          <Route path="astronomy">
            <Route path="lecture01" element={<Lecture01 />} />
            <Route path="lecture02" element={<Lecture02 />} />
            <Route path="lecture03" element={<Lecture03 />} />
            <Route path="lecture04" element={<Lecture04 />} />
            <Route path="lecture05" element={<Lecture05 />} />
            <Route path="lecture06" element={<Lecture06 />} />
            <Route path="lecture07" element={<Lecture07 />} />
            <Route path="lecture08" element={<Lecture08 />} />
            <Route path="lecture09" element={<Lecture09 />} />
            <Route path="lecture10" element={<Lecture10 />} />
            <Route path="lecture11" element={<Lecture11 />} />
            <Route path="lecture12" element={<Lecture12 />} />
            <Route path="lecture13" element={<Lecture13 />} />
            <Route path="lecture14" element={<Lecture14 />} />
            <Route path="lecture15" element={<Lecture15 />} />
            <Route path="lecture16" element={<Lecture16 />} />
            <Route path="lecture17" element={<Lecture17 />} />
            <Route path="lecture18" element={<Lecture18 />} />
            <Route path="lecture19" element={<Lecture19 />} />
            <Route path="lecture20" element={<Lecture20 />} />
            <Route path="lecture21" element={<Lecture21 />} />
            <Route path="lecture22" element={<Lecture22 />} />
            <Route path="lecture23" element={<Lecture23 />} />
            <Route path="lecture24" element={<Lecture24 />} />
            <Route path="lecture25" element={<Lecture25 />} />
            <Route path="lecture26" element={<Lecture26 />} />
            <Route path="lecture27" element={<Lecture27 />} />
            <Route path="lecture28" element={<Lecture28 />} />
            <Route path="lecture29" element={<Lecture29 />} />
            <Route path="lecture30" element={<Lecture30 />} />
            <Route path="lecture31" element={<Lecture31 />} />
            <Route path="lecture32" element={<Lecture32 />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
