import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { MoleculeGroup } from '../StructuralFormula';
import { buildMolecule } from '../smiles';

/** Ивица в спектъра: център (cm⁻¹), полуширина, дълбочина (0–1) и надпис за характерните. */
type Band = [number, number, number, string?];
type Compound = { name: string; smiles: string; cls: string; bands: Band[]; hint: string };

// Схематични спектри: положенията на ивиците са типичните за групите, височините – ориентировъчни
const COMPOUNDS: Compound[] = [
  {
    name: 'хексан',
    smiles: 'CCCCCC',
    cls: 'алкан',
    bands: [[2960, 22, 0.8, 'C–H'], [2925, 18, 0.9], [2860, 18, 0.7], [1465, 14, 0.5], [1380, 10, 0.35], [725, 10, 0.2]],
    hint: 'Само ивици на C–H около 2850–3000 cm⁻¹ – няма O–H, C=O или N–H.',
  },
  {
    name: 'етанол',
    smiles: 'CCO',
    cls: 'алкохол',
    bands: [[3350, 150, 0.85, 'O–H (широка)'], [2975, 25, 0.7, 'C–H'], [2890, 20, 0.4], [1380, 14, 0.35], [1090, 18, 0.5], [1050, 20, 0.85, 'C–O'], [880, 14, 0.4]],
    hint: 'Широката ивица около 3350 cm⁻¹ е O–H с водородни връзки; C=O няма.',
  },
  {
    name: 'диметилов етер',
    smiles: 'COC',
    cls: 'етер',
    bands: [[2990, 22, 0.7, 'C–H'], [2820, 18, 0.6], [1460, 14, 0.4], [1100, 22, 0.85, 'C–O'], [930, 14, 0.4]],
    hint: 'Има силна C–O около 1100 cm⁻¹, но няма O–H – затова не е алкохол, макар формулата C₂H₆O да е като на етанола.',
  },
  {
    name: 'пропанал',
    smiles: 'CCC=O',
    cls: 'алдехид',
    bands: [[2980, 22, 0.6, 'C–H'], [2820, 14, 0.35], [2720, 14, 0.4, 'C–H (CHO)'], [1730, 18, 0.95, 'C=O'], [1460, 14, 0.4], [1390, 12, 0.35]],
    hint: 'Силна C=O около 1730 cm⁻¹ и две слаби ивици около 2820 и 2720 cm⁻¹ от C–H на алдехидната група.',
  },
  {
    name: 'пропанон',
    smiles: 'CC(C)=O',
    cls: 'кетон',
    bands: [[3005, 20, 0.35, 'C–H'], [2925, 18, 0.3], [1715, 18, 0.95, 'C=O'], [1420, 14, 0.45], [1360, 14, 0.6], [1220, 18, 0.65]],
    hint: 'Силна C=O около 1715 cm⁻¹, но без ивиците на алдехидния C–H около 2720 cm⁻¹.',
  },
  {
    name: 'етанова киселина',
    smiles: 'CC(=O)O',
    cls: 'карбоксилна киселина',
    bands: [[3000, 330, 0.6, 'O–H (много широка)'], [1710, 20, 0.95, 'C=O'], [1410, 16, 0.45], [1290, 20, 0.7, 'C–O'], [935, 18, 0.4]],
    hint: 'Много широка O–H от около 2500 до 3300 cm⁻¹, която покрива C–H, плюс силна C=O около 1710 cm⁻¹.',
  },
  {
    name: 'етилов етаноат',
    smiles: 'CCOC(C)=O',
    cls: 'естер',
    bands: [[2985, 20, 0.4, 'C–H'], [1740, 18, 0.95, 'C=O'], [1375, 14, 0.5], [1240, 22, 0.9, 'C–O'], [1045, 18, 0.6]],
    hint: 'C=O около 1740 cm⁻¹ (малко по-високо от кетоните) и силна C–O около 1240 cm⁻¹; O–H няма.',
  },
  {
    name: 'етиламин',
    smiles: 'CCN',
    cls: 'амин',
    bands: [[3370, 30, 0.45, 'N–H'], [3290, 30, 0.4], [2965, 22, 0.6, 'C–H'], [2875, 18, 0.45], [1600, 22, 0.35], [1080, 18, 0.3]],
    hint: 'Две по-тесни ивици около 3300–3400 cm⁻¹ – N–H на първичен амин (O–H е една и по-широка).',
  },
  {
    name: 'пропаннитрил',
    smiles: 'CCC#N',
    cls: 'нитрил',
    bands: [[2990, 20, 0.5, 'C–H'], [2950, 18, 0.45], [2250, 14, 0.7, 'C≡N'], [1460, 14, 0.4], [1080, 14, 0.3]],
    hint: 'Остра ивица около 2250 cm⁻¹ – там почти няма други ивици, така че C≡N се познава лесно.',
  },
];

const X0 = 40;
const X1 = 465;
const Y0 = 30; // 100% пропускане
const Y1 = 150; // 0%
const NU_MAX = 4000;
const NU_MIN = 500;
const X = (nu: number) => X0 + ((NU_MAX - nu) / (NU_MAX - NU_MIN)) * (X1 - X0);
const transmittance = (bands: Band[], nu: number) => Math.max(0.02, 1 - bands.reduce((s, [c, w, d]) => s + d * Math.exp(-(((nu - c) / w) ** 2)), 0));

/** Схематичен ИЧ спектър; в режим „познай“ веществото е скрито. */
export default function IrSpectrumLab() {
  const [ci, setCi] = useState(1);
  const [quiz, setQuiz] = useState(false);
  const [guess, setGuess] = useState<number | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const comp = COMPOUNDS[ci];

  const path: string[] = [];
  for (let nu = NU_MAX; nu >= NU_MIN; nu -= 4) {
    const t = transmittance(comp.bands, nu);
    path.push(`${path.length ? 'L' : 'M'} ${X(nu).toFixed(1)} ${(Y1 - t * (Y1 - Y0)).toFixed(1)}`);
  }
  const showAnswer = !quiz || guess !== null;
  const labeled = comp.bands.filter(b => b[3]);

  const nextQuiz = () => {
    let n = ci;
    while (n === ci) n = Math.floor(Math.random() * COMPOUNDS.length);
    setCi(n);
    setGuess(null);
  };
  const answer = (i: number) => {
    if (guess !== null) return;
    setGuess(i);
    setScore(s => ({ right: s.right + (i === ci ? 1 : 0), total: s.total + 1 }));
  };

  const mol = buildMolecule(comp.smiles);
  const minX = Math.min(...mol.atoms.map(a => a.x));
  const maxX = Math.max(...mol.atoms.map(a => a.x));
  const minY = Math.min(...mol.atoms.map(a => a.y));
  const maxY = Math.max(...mol.atoms.map(a => a.y));
  const bond = 22;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={!quiz} onClick={() => { setQuiz(false); setGuess(null); }}>
          разгледай спектрите
        </DiagramButton>
        <DiagramButton active={quiz} onClick={() => { setQuiz(true); nextQuiz(); }}>
          познай веществото
        </DiagramButton>
      </Buttons>
      {!quiz && (
        <Buttons>
          {COMPOUNDS.map((c, i) => (
            <DiagramButton key={c.name} active={i === ci} onClick={() => setCi(i)}>
              {c.name}
            </DiagramButton>
          ))}
        </Buttons>
      )}

      <LabSvg viewBox="0 0 480 250" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* област на отпечатъка */}
        <rect x={X(1500)} y={Y0} width={X(NU_MIN) - X(1500)} height={Y1 - Y0} className="fill-gray-100 dark:fill-gray-700/50" />
        <text x={(X(1500) + X(NU_MIN)) / 2} y={Y0 - 5} fontSize="9" textAnchor="middle" className="fill-gray-500">област на „отпечатъка“</text>
        {/* оси */}
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} className="stroke-gray-400" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} className="stroke-gray-400" />
        {[4000, 3500, 3000, 2500, 2000, 1500, 1000, 500].map(nu => (
          <g key={nu}>
            <line x1={X(nu)} y1={Y1} x2={X(nu)} y2={Y1 + 4} className="stroke-gray-400" />
            <text x={X(nu)} y={Y1 + 14} fontSize="9" textAnchor="middle" className="fill-gray-500">{nu}</text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={Y1 + 27} fontSize="10" textAnchor="middle" className="fill-gray-500">вълново число, cm⁻¹</text>
        <text x={X0 - 4} y={Y0 + 3} fontSize="9" textAnchor="end" className="fill-gray-500">100%</text>
        <text x={X0 - 4} y={Y1} fontSize="9" textAnchor="end" className="fill-gray-500">0</text>
        <text x={X0 - 4} y={(Y0 + Y1) / 2 + 3} fontSize="9" textAnchor="end" className="fill-gray-500">T</text>
        <path d={path.join(' ')} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth={1.5} />
        {/* надписи на характерните ивици */}
        {showAnswer &&
          labeled.map(([c, , d, label], i) => {
            const y = Y1 - transmittance(comp.bands, c) * (Y1 - Y0);
            const ly = Math.min(Y1 - 4, y + 12 + (i % 2) * 11);
            return (
              <text key={c} x={X(c)} y={ly} fontSize="9.5" fontWeight={600} textAnchor="middle" className={d > 0.8 ? 'fill-blue-700 dark:fill-blue-300' : 'fill-gray-600 dark:fill-gray-300'}>
                {label}
              </text>
            );
          })}
        {/* формулата */}
        {showAnswer && (
          <g>
            <MoleculeGroup mol={mol} mode="skeletal" bond={bond} x={240 - ((minX + maxX) / 2) * bond} y={215 - ((minY + maxY) / 2) * bond} />
          </g>
        )}
      </LabSvg>

      {quiz && (
        <>
          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">Кое е веществото?</p>
          <Buttons>
            {COMPOUNDS.map((c, i) => (
              <DiagramButton key={c.name} active={guess === i} onClick={() => answer(i)}>
                {c.name}
              </DiagramButton>
            ))}
          </Buttons>
          <p className="text-center text-xs text-gray-500 mt-1">
            верни: {score.right} от {score.total}
          </p>
        </>
      )}
      {showAnswer && (
        <Note tone={quiz && guess !== ci ? 'amber' : 'emerald'}>
          {quiz && guess !== ci ? `Не – това е ${comp.name} (${comp.cls}). ` : `${comp.name[0].toUpperCase() + comp.name.slice(1)} – ${comp.cls}. `}
          {comp.hint}
        </Note>
      )}
      {quiz && guess !== null && (
        <div className="text-center mt-2">
          <DiagramButton onClick={nextQuiz}>следващ спектър</DiagramButton>
        </div>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Схематичен спектър: положенията на ивиците са типичните за групите, а височините и ширините са ориентировъчни. По традиция
        оста е обърната – от 4000 към 500 cm⁻¹, а ивиците „висят“ надолу, защото там веществото поглъща и пропуска по-малко светлина.
      </p>
    </div>
  );
}
