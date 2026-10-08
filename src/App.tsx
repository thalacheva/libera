import {Menu, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import {Circle, Quadrangle, Similarity, Triangle, Trigonometry, Vectors} from '~/geometry';
import SidebarMenu from '~/SidebarMenu';
import {Fractions, Inequalities, LinearEquations, Logarithms, Powers, QuadraticEquations, Sequences, SystemsOfEquations} from './algebra';
import {
  Lecture01, Lecture02, Lecture03, Lecture04, Lecture05,
  Lecture06, Lecture07, Lecture08, Lecture09, Lecture10,
  Lecture11, Lecture12, Lecture13, Lecture14, Lecture15,
  Lecture16, Lecture17, Lecture18, Lecture19, Lecture20,
  Lecture21, Lecture22, Lecture23, Lecture24, Lecture25,
  Lecture26, Lecture27, Lecture28, Lecture29, Lecture30,
  Lecture31, Lecture32, Lecture33,
} from './astronomy';
import {
  FunctionGraph,
  LinearFunctions,
  QuadraticFunctions,
} from './functions';
import {Probability} from './probability';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-gray-100">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-3 left-3 z-[60] p-2 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className="flex flex-1 overflow-hidden">
        <SidebarMenu
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/algebra/linear" replace />} />
          <Route path="algebra">
            <Route path="fractions" element={<Fractions />} />
            <Route path="powers" element={<Powers />} />
            <Route path="logarithms" element={<Logarithms />} />
            <Route path="linear" element={<LinearEquations />} />
            <Route path="quadratic" element={<QuadraticEquations />} />
            <Route path="systems" element={<SystemsOfEquations />} />
            <Route path="inequalities" element={<Inequalities />} />
            <Route path="sequences" element={<Sequences />} />
          </Route>
          <Route path="functions">
            <Route path="linear" element={<LinearFunctions />} />
            <Route path="quadratic" element={<QuadraticFunctions />} />
            <Route path="grapher" element={<FunctionGraph />} />
          </Route>
          <Route path="geometry">
            <Route path="triangle" element={<Triangle />} />
            <Route path="similar" element={<Similarity />} />
            <Route path="trigonometry" element={<Trigonometry />} />
            <Route path="vectors" element={<Vectors />} />
            <Route path="quadrilateral" element={<Quadrangle />} />
            <Route path="circle" element={<Circle />} />
          </Route>
          <Route path="probability">
            <Route path="basics" element={<Probability />} />
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
            <Route path="lecture33" element={<Lecture33 />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
