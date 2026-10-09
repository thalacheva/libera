import {Menu, X} from 'lucide-react';
import {lazy, Suspense, useEffect, useState} from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import Seo from '~/Seo';
import SidebarMenu from '~/SidebarMenu';

// Всеки урок се зарежда отделно, едва когато се отвори.
const Fractions = lazy(() => import('./algebra/Fractions').then(m => ({default: m.Fractions})));
const Inequalities = lazy(() => import('./algebra/Inequalities').then(m => ({default: m.Inequalities})));
const LinearEquations = lazy(() => import('./algebra/LinearEquations').then(m => ({default: m.LinearEquations})));
const Logarithms = lazy(() => import('./algebra/Logarithms').then(m => ({default: m.Logarithms})));
const Powers = lazy(() => import('./algebra/Powers').then(m => ({default: m.Powers})));
const QuadraticEquations = lazy(() => import('./algebra/QuadraticEquations').then(m => ({default: m.QuadraticEquations})));
const Sequences = lazy(() => import('./algebra/Sequences').then(m => ({default: m.Sequences})));
const SystemsOfEquations = lazy(() => import('./algebra/SystemsOfEquations').then(m => ({default: m.SystemsOfEquations})));
const FunctionGraph = lazy(() => import('./functions/FunctionGraph').then(m => ({default: m.FunctionGraph})));
const LinearFunctions = lazy(() => import('./functions/LinearFunctions').then(m => ({default: m.LinearFunctions})));
const QuadraticFunctions = lazy(() => import('./functions/QuadraticFunctions').then(m => ({default: m.QuadraticFunctions})));
const Circle = lazy(() => import('./geometry/Circle').then(m => ({default: m.Circle})));
const Polygons = lazy(() => import('./geometry/Polygons').then(m => ({default: m.Polygons})));
const Quadrangle = lazy(() => import('./geometry/Quadrangle').then(m => ({default: m.Quadrangle})));
const Similarity = lazy(() => import('./geometry/Similarity').then(m => ({default: m.Similarity})));
const Solids = lazy(() => import('./geometry/Solids').then(m => ({default: m.Solids})));
const Triangle = lazy(() => import('./geometry/Triangle').then(m => ({default: m.Triangle})));
const Trigonometry = lazy(() => import('./geometry/Trigonometry').then(m => ({default: m.Trigonometry})));
const Vectors = lazy(() => import('./geometry/Vectors').then(m => ({default: m.Vectors})));
const Combinatorics = lazy(() => import('./probability/Combinatorics').then(m => ({default: m.Combinatorics})));
const Probability = lazy(() => import('./probability/Probability').then(m => ({default: m.Probability})));
const Formulas = lazy(() => import('./reference/Formulas').then(m => ({default: m.Formulas})));
const Tonight = lazy(() => import('./tonight/Tonight').then(m => ({default: m.Tonight})));
const Lecture01 = lazy(() => import('./astronomy/Lecture01'));
const Lecture02 = lazy(() => import('./astronomy/Lecture02'));
const Lecture03 = lazy(() => import('./astronomy/Lecture03'));
const Lecture04 = lazy(() => import('./astronomy/Lecture04'));
const Lecture05 = lazy(() => import('./astronomy/Lecture05'));
const Lecture06 = lazy(() => import('./astronomy/Lecture06'));
const Lecture07 = lazy(() => import('./astronomy/Lecture07'));
const Lecture08 = lazy(() => import('./astronomy/Lecture08'));
const Lecture09 = lazy(() => import('./astronomy/Lecture09'));
const Lecture10 = lazy(() => import('./astronomy/Lecture10'));
const Lecture11 = lazy(() => import('./astronomy/Lecture11'));
const Lecture12 = lazy(() => import('./astronomy/Lecture12'));
const Lecture13 = lazy(() => import('./astronomy/Lecture13'));
const Lecture14 = lazy(() => import('./astronomy/Lecture14'));
const Lecture15 = lazy(() => import('./astronomy/Lecture15'));
const Lecture16 = lazy(() => import('./astronomy/Lecture16'));
const Lecture17 = lazy(() => import('./astronomy/Lecture17'));
const Lecture18 = lazy(() => import('./astronomy/Lecture18'));
const Lecture19 = lazy(() => import('./astronomy/Lecture19'));
const Lecture20 = lazy(() => import('./astronomy/Lecture20'));
const Lecture21 = lazy(() => import('./astronomy/Lecture21'));
const Lecture22 = lazy(() => import('./astronomy/Lecture22'));
const Lecture23 = lazy(() => import('./astronomy/Lecture23'));
const Lecture24 = lazy(() => import('./astronomy/Lecture24'));
const Lecture25 = lazy(() => import('./astronomy/Lecture25'));
const Lecture26 = lazy(() => import('./astronomy/Lecture26'));
const Lecture27 = lazy(() => import('./astronomy/Lecture27'));
const Lecture28 = lazy(() => import('./astronomy/Lecture28'));
const Lecture29 = lazy(() => import('./astronomy/Lecture29'));
const Lecture30 = lazy(() => import('./astronomy/Lecture30'));
const Lecture31 = lazy(() => import('./astronomy/Lecture31'));
const Lecture32 = lazy(() => import('./astronomy/Lecture32'));
const Lecture33 = lazy(() => import('./astronomy/Lecture33'));

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
      <Seo />
      <div className="flex flex-1 overflow-hidden">
        <SidebarMenu
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Suspense fallback={<PageLoading />}>
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
              <Route path="polygons" element={<Polygons />} />
              <Route path="circle" element={<Circle />} />
              <Route path="solids" element={<Solids />} />
            </Route>
            <Route path="probability">
              <Route path="combinatorics" element={<Combinatorics />} />
              <Route path="basics" element={<Probability />} />
            </Route>
            <Route path="reference">
              <Route path="formulas" element={<Formulas />} />
            </Route>
            <Route path="astronomy">
              <Route path="tonight" element={<Tonight />} />
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
        </Suspense>
      </div>
    </div>
  );
}

function PageLoading() {
  return (
    <main className="flex-1 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      Зареждане…
    </main>
  );
}

export default App;
