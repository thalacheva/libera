import {Menu, X} from 'lucide-react';
import {lazy, Suspense, useEffect, useState} from 'react';
import {Route, Routes} from 'react-router-dom';
import Seo from '~/Seo';
import DevBanner from './DevBanner';
import SidebarMenu from '~/SidebarMenu';

// Всеки урок се зарежда отделно, едва когато се отвори.
const Home = lazy(() => import('./Home').then(m => ({default: m.Home})));
const SectionHome = lazy(() => import('./SectionHome').then(m => ({default: m.SectionHome})));
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
const Limits = lazy(() => import('./analysis/Limits').then(m => ({default: m.Limits})));
const Matrices = lazy(() => import('./algebra/Matrices').then(m => ({default: m.Matrices})));
const OlympiadInequalities = lazy(() => import('./algebra/OlympiadInequalities').then(m => ({default: m.OlympiadInequalities})));
const Derivatives = lazy(() => import('./analysis/Derivatives').then(m => ({default: m.Derivatives})));
const Integrals = lazy(() => import('./analysis/Integrals').then(m => ({default: m.Integrals})));
const DifferentialEquations = lazy(() => import('./analysis/DifferentialEquations').then(m => ({default: m.DifferentialEquations})));
const ComplexNumbers = lazy(() => import('./algebra/ComplexNumbers').then(m => ({default: m.ComplexNumbers})));
const NumberSets = lazy(() => import('./numbers/NumberSets').then(m => ({default: m.NumberSets})));
const Divisibility = lazy(() => import('./numbers/Divisibility').then(m => ({default: m.Divisibility})));
const Gcd = lazy(() => import('./numbers/Gcd').then(m => ({default: m.Gcd})));
const PlaneMotion = lazy(() => import('./physics/mechanics/PlaneMotion').then(m => ({default: m.PlaneMotion})));
const Newton = lazy(() => import('./physics/mechanics/Newton').then(m => ({default: m.Newton})));
const Energy = lazy(() => import('./physics/mechanics/Energy').then(m => ({default: m.Energy})));
const Momentum = lazy(() => import('./physics/mechanics/Momentum').then(m => ({default: m.Momentum})));
const Rotation = lazy(() => import('./physics/mechanics/Rotation').then(m => ({default: m.Rotation})));
const StaticsFluids = lazy(() => import('./physics/mechanics/StaticsFluids').then(m => ({default: m.StaticsFluids})));
const Oscillations = lazy(() => import('./physics/waves/Oscillations').then(m => ({default: m.Oscillations})));
const Waves = lazy(() => import('./physics/waves/Waves').then(m => ({default: m.Waves})));
const Sound = lazy(() => import('./physics/waves/Sound').then(m => ({default: m.Sound})));
const Temperature = lazy(() => import('./physics/heat/Temperature').then(m => ({default: m.Temperature})));
const IdealGas = lazy(() => import('./physics/heat/IdealGas').then(m => ({default: m.IdealGas})));
const Thermodynamics = lazy(() => import('./physics/heat/Thermodynamics').then(m => ({default: m.Thermodynamics})));
const Electrostatics = lazy(() => import('./physics/electricity/Electrostatics').then(m => ({default: m.Electrostatics})));
const Capacitors = lazy(() => import('./physics/electricity/Capacitors').then(m => ({default: m.Capacitors})));
const DirectCurrent = lazy(() => import('./physics/electricity/DirectCurrent').then(m => ({default: m.DirectCurrent})));
const MagneticField = lazy(() => import('./physics/electricity/MagneticField').then(m => ({default: m.MagneticField})));
const Induction = lazy(() => import('./physics/electricity/Induction').then(m => ({default: m.Induction})));
const AcEmWaves = lazy(() => import('./physics/electricity/AcEmWaves').then(m => ({default: m.AcEmWaves})));
const ReflectionRefraction = lazy(() => import('./physics/optics/ReflectionRefraction').then(m => ({default: m.ReflectionRefraction})));
const Lenses = lazy(() => import('./physics/optics/Lenses').then(m => ({default: m.Lenses})));
const WaveOptics = lazy(() => import('./physics/optics/WaveOptics').then(m => ({default: m.WaveOptics})));
const Photons = lazy(() => import('./physics/modern/Photons').then(m => ({default: m.Photons})));
const Atom = lazy(() => import('./physics/modern/Atom').then(m => ({default: m.Atom})));
const Nucleus = lazy(() => import('./physics/modern/Nucleus').then(m => ({default: m.Nucleus})));
const Uncertainty = lazy(() => import('./physics/modern/Uncertainty').then(m => ({default: m.Uncertainty})));
const ParticleInBox = lazy(() => import('./physics/modern/ParticleInBox').then(m => ({default: m.ParticleInBox})));
const QuantumAtom = lazy(() => import('./physics/modern/QuantumAtom').then(m => ({default: m.QuantumAtom})));
const LinearMotion = lazy(() => import('./physics/mechanics/LinearMotion').then(m => ({default: m.LinearMotion})));
const AtomsTable = lazy(() => import('./chemistry/structure/AtomsTable').then(m => ({default: m.AtomsTable})));
const Bonding = lazy(() => import('./chemistry/structure/Bonding').then(m => ({default: m.Bonding})));
const Molecules = lazy(() => import('./chemistry/structure/Molecules').then(m => ({default: m.Molecules})));
const Mole = lazy(() => import('./chemistry/quantities/Mole').then(m => ({default: m.Mole})));
const Stoichiometry = lazy(() => import('./chemistry/quantities/Stoichiometry').then(m => ({default: m.Stoichiometry})));
const Solutions = lazy(() => import('./chemistry/quantities/Solutions').then(m => ({default: m.Solutions})));
const Gases = lazy(() => import('./chemistry/quantities/Gases').then(m => ({default: m.Gases})));
const ReactionEnergy = lazy(() => import('./chemistry/reactions/ReactionEnergy').then(m => ({default: m.ReactionEnergy})));
const Kinetics = lazy(() => import('./chemistry/reactions/Kinetics').then(m => ({default: m.Kinetics})));
const Equilibrium = lazy(() => import('./chemistry/reactions/Equilibrium').then(m => ({default: m.Equilibrium})));
const AcidsBases = lazy(() => import('./chemistry/reactions/AcidsBases').then(m => ({default: m.AcidsBases})));
const Redox = lazy(() => import('./chemistry/reactions/Redox').then(m => ({default: m.Redox})));
const Metals = lazy(() => import('./chemistry/inorganic/Metals').then(m => ({default: m.Metals})));
const Nonmetals = lazy(() => import('./chemistry/inorganic/Nonmetals').then(m => ({default: m.Nonmetals})));
const CompoundClasses = lazy(() => import('./chemistry/inorganic/CompoundClasses').then(m => ({default: m.CompoundClasses})));
const QualitativeAnalysis = lazy(() => import('./chemistry/inorganic/QualitativeAnalysis').then(m => ({default: m.QualitativeAnalysis})));
const Hydrocarbons = lazy(() => import('./chemistry/organic/Hydrocarbons').then(m => ({default: m.Hydrocarbons})));
const FunctionalGroups = lazy(() => import('./chemistry/organic/FunctionalGroups').then(m => ({default: m.FunctionalGroups})));
const Mechanisms = lazy(() => import('./chemistry/organic/Mechanisms').then(m => ({default: m.Mechanisms})));
const Polymers = lazy(() => import('./chemistry/organic/Polymers').then(m => ({default: m.Polymers})));
const Biomolecules = lazy(() => import('./chemistry/organic/Biomolecules').then(m => ({default: m.Biomolecules})));
const NuclearChemistry = lazy(() => import('./chemistry/world/NuclearChemistry').then(m => ({default: m.NuclearChemistry})));
const Environment = lazy(() => import('./chemistry/world/Environment').then(m => ({default: m.Environment})));
const Spectroscopy = lazy(() => import('./chemistry/world/Spectroscopy').then(m => ({default: m.Spectroscopy})));
const Substances = lazy(() => import('./chemistry/structure/Substances').then(m => ({default: m.Substances})));
const Structure = lazy(() => import('./biology/cell/Structure').then(m => ({default: m.Structure})));
const Membrane = lazy(() => import('./biology/cell/Membrane').then(m => ({default: m.Membrane})));
const Division = lazy(() => import('./biology/cell/Division').then(m => ({default: m.Division})));
const Life = lazy(() => import('./biology/cell/Life').then(m => ({default: m.Life})));
const Enzymes = lazy(() => import('./biology/energy/Enzymes').then(m => ({default: m.Enzymes})));
const Respiration = lazy(() => import('./biology/energy/Respiration').then(m => ({default: m.Respiration})));
const Photosynthesis = lazy(() => import('./biology/energy/Photosynthesis').then(m => ({default: m.Photosynthesis})));
const Dna = lazy(() => import('./biology/genetics/Dna').then(m => ({default: m.Dna})));
const Mendel = lazy(() => import('./biology/genetics/Mendel').then(m => ({default: m.Mendel})));
const HumanGenetics = lazy(() => import('./biology/genetics/HumanGenetics').then(m => ({default: m.HumanGenetics})));
const Biotech = lazy(() => import('./biology/genetics/Biotech').then(m => ({default: m.Biotech})));
const Selection = lazy(() => import('./biology/evolution/Selection').then(m => ({default: m.Selection})));
const Phylogeny = lazy(() => import('./biology/evolution/Phylogeny').then(m => ({default: m.Phylogeny})));
const Microbes = lazy(() => import('./biology/evolution/Microbes').then(m => ({default: m.Microbes})));
const Classification = lazy(() => import('./biology/evolution/Classification').then(m => ({default: m.Classification})));
const PlantTransport = lazy(() => import('./biology/plants/PlantTransport').then(m => ({default: m.PlantTransport})));
const PlantGrowth = lazy(() => import('./biology/plants/PlantGrowth').then(m => ({default: m.PlantGrowth})));
const Digestion = lazy(() => import('./biology/physiology/Digestion').then(m => ({default: m.Digestion})));
const Circulation = lazy(() => import('./biology/physiology/Circulation').then(m => ({default: m.Circulation})));
const Breathing = lazy(() => import('./biology/physiology/Breathing').then(m => ({default: m.Breathing})));
const Homeostasis = lazy(() => import('./biology/physiology/Homeostasis').then(m => ({default: m.Homeostasis})));
const Nerves = lazy(() => import('./biology/physiology/Nerves').then(m => ({default: m.Nerves})));
const Hormones = lazy(() => import('./biology/physiology/Hormones').then(m => ({default: m.Hormones})));
const Immunity = lazy(() => import('./biology/physiology/Immunity').then(m => ({default: m.Immunity})));
const Reproduction = lazy(() => import('./biology/physiology/Reproduction').then(m => ({default: m.Reproduction})));
const Ecosystems = lazy(() => import('./biology/ecology/Ecosystems').then(m => ({default: m.Ecosystems})));
const Populations = lazy(() => import('./biology/ecology/Populations').then(m => ({default: m.Populations})));
const Biodiversity = lazy(() => import('./biology/ecology/Biodiversity').then(m => ({default: m.Biodiversity})));
const Behaviour = lazy(() => import('./biology/ecology/Behaviour').then(m => ({default: m.Behaviour})));
const Units = lazy(() => import('./physics/mechanics/Units').then(m => ({default: m.Units})));
const Modular = lazy(() => import('./numbers/Modular').then(m => ({default: m.Modular})));
const MyProgress = lazy(() => import('./MyProgress').then(m => ({default: m.MyProgress})));
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
const Glossary = lazy(() => import('./reference/Glossary').then(m => ({default: m.Glossary})));
const AstronomyIntro = lazy(() => import('./astronomy/Intro').then(m => ({default: m.Intro})));
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
      <DevBanner />
      <div className="flex flex-1 overflow-hidden">
        <SidebarMenu
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="progress" element={<MyProgress />} />
            <Route path="math" element={<SectionHome area="math" />} />
            <Route path="algebra">
              <Route path="fractions" element={<Fractions />} />
              <Route path="powers" element={<Powers />} />
              <Route path="logarithms" element={<Logarithms />} />
              <Route path="linear" element={<LinearEquations />} />
              <Route path="quadratic" element={<QuadraticEquations />} />
              <Route path="systems" element={<SystemsOfEquations />} />
              <Route path="matrices" element={<Matrices />} />
              <Route path="inequalities" element={<Inequalities />} />
              <Route path="olympiad-inequalities" element={<OlympiadInequalities />} />
              <Route path="sequences" element={<Sequences />} />
              <Route path="complex" element={<ComplexNumbers />} />
            </Route>
            <Route path="numbers">
              <Route path="number-sets" element={<NumberSets />} />
              <Route path="divisibility" element={<Divisibility />} />
              <Route path="gcd" element={<Gcd />} />
              <Route path="modular" element={<Modular />} />
            </Route>
            <Route path="functions">
              <Route path="linear" element={<LinearFunctions />} />
              <Route path="quadratic" element={<QuadraticFunctions />} />
              <Route path="grapher" element={<FunctionGraph />} />
            </Route>
            <Route path="analysis">
              <Route path="limits" element={<Limits />} />
              <Route path="derivatives" element={<Derivatives />} />
              <Route path="integrals" element={<Integrals />} />
              <Route path="differential-equations" element={<DifferentialEquations />} />
            </Route>
            <Route path="physics">
              <Route index element={<SectionHome area="physics" />} />
              <Route path="mechanics">
                <Route path="units" element={<Units />} />
                <Route path="linear-motion" element={<LinearMotion />} />
                <Route path="plane-motion" element={<PlaneMotion />} />
                <Route path="newton" element={<Newton />} />
                <Route path="energy" element={<Energy />} />
                <Route path="momentum" element={<Momentum />} />
                <Route path="rotation" element={<Rotation />} />
                <Route path="statics-fluids" element={<StaticsFluids />} />
              </Route>
              <Route path="waves">
                <Route path="oscillations" element={<Oscillations />} />
                <Route path="waves" element={<Waves />} />
                <Route path="sound" element={<Sound />} />
              </Route>
              <Route path="heat">
                <Route path="temperature" element={<Temperature />} />
                <Route path="ideal-gas" element={<IdealGas />} />
                <Route path="thermodynamics" element={<Thermodynamics />} />
              </Route>
              <Route path="electricity">
                <Route path="electrostatics" element={<Electrostatics />} />
                <Route path="capacitors" element={<Capacitors />} />
                <Route path="direct-current" element={<DirectCurrent />} />
                <Route path="magnetic-field" element={<MagneticField />} />
                <Route path="induction" element={<Induction />} />
                <Route path="ac-em-waves" element={<AcEmWaves />} />
              </Route>
              <Route path="optics">
                <Route path="reflection-refraction" element={<ReflectionRefraction />} />
                <Route path="lenses" element={<Lenses />} />
                <Route path="wave-optics" element={<WaveOptics />} />
              </Route>
              <Route path="modern">
                <Route path="photons" element={<Photons />} />
                <Route path="atom" element={<Atom />} />
                <Route path="nucleus" element={<Nucleus />} />
                <Route path="uncertainty" element={<Uncertainty />} />
                <Route path="particle-in-box" element={<ParticleInBox />} />
                <Route path="quantum-atom" element={<QuantumAtom />} />
              </Route>
            </Route>
            <Route path="chemistry">
              <Route index element={<SectionHome area="chemistry" />} />
              <Route path="structure">
                <Route path="substances" element={<Substances />} />
                <Route path="atoms" element={<AtomsTable />} />
                <Route path="bonding" element={<Bonding />} />
                <Route path="molecules" element={<Molecules />} />
              </Route>
              <Route path="quantities">
                <Route path="mole" element={<Mole />} />
                <Route path="stoichiometry" element={<Stoichiometry />} />
                <Route path="solutions" element={<Solutions />} />
                <Route path="gases" element={<Gases />} />
              </Route>
              <Route path="reactions">
                <Route path="energy" element={<ReactionEnergy />} />
                <Route path="kinetics" element={<Kinetics />} />
                <Route path="equilibrium" element={<Equilibrium />} />
                <Route path="acids-bases" element={<AcidsBases />} />
                <Route path="redox" element={<Redox />} />
              </Route>
              <Route path="inorganic">
                <Route path="metals" element={<Metals />} />
                <Route path="nonmetals" element={<Nonmetals />} />
                <Route path="compound-classes" element={<CompoundClasses />} />
                <Route path="qualitative-analysis" element={<QualitativeAnalysis />} />
              </Route>
              <Route path="organic">
                <Route path="hydrocarbons" element={<Hydrocarbons />} />
                <Route path="functional-groups" element={<FunctionalGroups />} />
                <Route path="mechanisms" element={<Mechanisms />} />
                <Route path="polymers" element={<Polymers />} />
                <Route path="biomolecules" element={<Biomolecules />} />
              </Route>
              <Route path="world">
                <Route path="nuclear" element={<NuclearChemistry />} />
                <Route path="environment" element={<Environment />} />
                <Route path="spectroscopy" element={<Spectroscopy />} />
              </Route>
            </Route>
            <Route path="biology">
              <Route index element={<SectionHome area="biology" />} />
              <Route path="cell">
                <Route path="life" element={<Life />} />
                <Route path="structure" element={<Structure />} />
                <Route path="membrane" element={<Membrane />} />
                <Route path="division" element={<Division />} />
              </Route>
              <Route path="energy">
                <Route path="enzymes" element={<Enzymes />} />
                <Route path="respiration" element={<Respiration />} />
                <Route path="photosynthesis" element={<Photosynthesis />} />
              </Route>
              <Route path="genetics">
                <Route path="dna" element={<Dna />} />
                <Route path="mendel" element={<Mendel />} />
                <Route path="human" element={<HumanGenetics />} />
                <Route path="biotech" element={<Biotech />} />
              </Route>
              <Route path="evolution">
                <Route path="selection" element={<Selection />} />
                <Route path="phylogeny" element={<Phylogeny />} />
                <Route path="microbes" element={<Microbes />} />
                <Route path="classification" element={<Classification />} />
              </Route>
              <Route path="plants">
                <Route path="transport" element={<PlantTransport />} />
                <Route path="growth" element={<PlantGrowth />} />
              </Route>
              <Route path="physiology">
                <Route path="digestion" element={<Digestion />} />
                <Route path="circulation" element={<Circulation />} />
                <Route path="breathing" element={<Breathing />} />
                <Route path="homeostasis" element={<Homeostasis />} />
                <Route path="nerves" element={<Nerves />} />
                <Route path="hormones" element={<Hormones />} />
                <Route path="immunity" element={<Immunity />} />
                <Route path="reproduction" element={<Reproduction />} />
              </Route>
              <Route path="ecology">
                <Route path="ecosystems" element={<Ecosystems />} />
                <Route path="populations" element={<Populations />} />
                <Route path="biodiversity" element={<Biodiversity />} />
                <Route path="behaviour" element={<Behaviour />} />
              </Route>
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
              <Route path="glossary" element={<Glossary />} />
            </Route>
            <Route path="astronomy">
              <Route index element={<SectionHome area="astronomy" />} />
              <Route path="tonight" element={<Tonight />} />
              <Route path="intro" element={<AstronomyIntro />} />
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
