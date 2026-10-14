import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum, sig } from '~/physics/sim';

const K_E = 0.376; // h²/(8mₑ) в eV·nm²
const M_RATIO = 1836; // mₚ / mₑ
const HC = 1240; // eV·nm
const LEVELS = [1, 2, 3, 4, 5];
const SUB = '₀₁₂₃₄₅';

// Ямата: дъното е при BASE, най-горното ниво (n = 5) – при TOP
const BASE = 236;
const TOP = 34;
const ly = (n: number) => BASE - ((BASE - TOP) * n * n) / 25;
const X0 = 70; // лява стена
const PX_PER_NM = 140;
const AMP = 17; // амплитуда на рисуваната вълнова функция в px

/** Енергия в удобни единици: eV или meV. */
const energy = (eV: number) => (eV >= 0.1 ? `${sig(eV, 3)} eV` : `${sig(eV * 1000, 3)} meV`);

/** Частица в кутия: нивата Eₙ = n²h²/(8mL²), вълновите функции и вероятността |ψ|². */
export default function BoxLevelsLab() {
  const [L, setL] = useState(1); // nm
  const [proton, setProton] = useState(false);
  const [n, setN] = useState(1);
  const [prob, setProb] = useState(false);

  const E1 = K_E / (L * L) / (proton ? M_RATIO : 1);
  const E = (k: number) => k * k * E1;
  const w = L * PX_PER_NM;
  const X1 = X0 + w;

  // Вълновата функция на избраното ниво, нарисувана върху линията му
  const pts = Array.from({ length: 121 }, (_, i) => {
    const t = i / 120;
    const psi = Math.sin(n * Math.PI * t);
    const v = prob ? psi * psi : psi;
    return `${(X0 + t * w).toFixed(1)},${(ly(n) - AMP * (prob ? 1.6 : 1) * v).toFixed(1)}`;
  }).join(' ');
  const fill = prob ? `${X0},${ly(n)} ${pts} ${X1},${ly(n)}` : null;

  const dE = n > 1 ? E(n) - E(n - 1) : null;
  const lamPhoton = dE === null ? null : HC / dE;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={!proton} onClick={() => setProton(false)}>
          електрон
        </DiagramButton>
        <DiagramButton active={proton} onClick={() => setProton(true)}>
          протон (1836 пъти по-тежък)
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 270">
        {/* Стените на кутията */}
        <rect x={X0 - 14} y={TOP - 18} width={14} height={BASE - TOP + 18} className="fill-gray-300 dark:fill-gray-600" />
        <rect x={X1} y={TOP - 18} width={14} height={BASE - TOP + 18} className="fill-gray-300 dark:fill-gray-600" />
        <line x1={X0} y1={BASE} x2={X1} y2={BASE} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="2" />

        {/* Нивата */}
        {LEVELS.map(k => (
          <g key={k}>
            <line
              x1={X0}
              y1={ly(k)}
              x2={X1}
              y2={ly(k)}
              className={k === n ? 'stroke-blue-500' : 'stroke-gray-400 dark:stroke-gray-500'}
              strokeWidth={k === n ? 2 : 1.2}
              strokeDasharray={k === n ? undefined : '5 4'}
            />
            <Label p={{ x: X1 + 22, y: ly(k) }} size={11} anchor="start" tone={k === n ? 'blue' : 'gray'}>
              {`n = ${k}: ${energy(E(k))}`}
            </Label>
          </g>
        ))}

        {/* ψ или |ψ|² */}
        {fill && <polygon points={fill} className="fill-blue-500/25" />}
        <polyline points={pts} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.5" />
        {!prob &&
          Array.from({ length: n - 1 }, (_, i) => (
            <circle key={i} cx={X0 + ((i + 1) / n) * w} cy={ly(n)} r={3.5} className="fill-rose-500" />
          ))}

        {/* Ширината */}
        <line x1={X0} y1={BASE + 16} x2={X1} y2={BASE + 16} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="1" />
        <line x1={X0} y1={BASE + 11} x2={X0} y2={BASE + 21} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="1" />
        <line x1={X1} y1={BASE + 11} x2={X1} y2={BASE + 21} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="1" />
        <Label p={{ x: (X0 + X1) / 2, y: BASE + 27 }} size={11}>
          {`L = ${fmtNum(L, 1)} nm`}
        </Label>
        <Label p={{ x: 26, y: TOP - 8 }} size={11} anchor="start">
          E
        </Label>
      </ZoomingSvg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
        <span className="text-sm text-gray-600 dark:text-gray-300">Ниво:</span>
        {LEVELS.map(k => (
          <DiagramButton key={k} active={k === n} onClick={() => setN(k)}>
            {`n = ${k}`}
          </DiagramButton>
        ))}
      </div>
      <Buttons>
        <DiagramButton active={!prob} onClick={() => setProb(false)}>
          вълнова функция ψ
        </DiagramButton>
        <DiagramButton active={prob} onClick={() => setProb(true)}>
          вероятност |ψ|²
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="L, nm" value={L} onChange={setL} min={0.2} max={2} step={0.1} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: `E${SUB[n]} =`, value: energy(E(n)), tone: 'blue' },
            { label: 'λ =', value: `2L/${n} = ${fmtNum((2 * L) / n, 2)} nm`, tone: 'violet' },
            { label: 'възли:', value: String(n - 1), tone: 'rose' },
            ...(lamPhoton === null ? [] : [{ label: `фотон ${n} → ${n - 1}:`, value: lamPhoton > 1e5 ? `${sig(lamPhoton / 1e6, 3)} mm` : lamPhoton > 1e4 ? `${sig(lamPhoton / 1000, 3)} µm` : `${sig(lamPhoton, 3)} nm`, tone: 'amber' as const }]),
          ]}
        />
      </div>
      <Note tone="blue">
        {n === 1
          ? 'Дори на най-ниското ниво енергията не е нула – частицата в кутия никога не стои неподвижно.'
          : prob
            ? `Има ${n} места, където частицата се среща най-често, и ${n - 1} точки, в които не се среща никога.`
            : `В кутията се събират точно ${n} половини вълни; червените точки са възлите.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Нивата са нарисувани в един и същ мащаб спрямо E₅, затова картината на разстоянията (1 : 4 : 9 : 16 : 25) не се мени – менят се
        числата. Стесни кутията наполовина: всички енергии стават 4 пъти по-големи. Смени електрона с протон: енергиите падат 1836 пъти – затова
        квантуването се забелязва най-лесно при леки частици в малки области.
      </p>
    </div>
  );
}
