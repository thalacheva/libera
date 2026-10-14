import { useState } from 'react';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';
import { wavelengthCss } from '~/physics/optics/wavelengthColor';

const LEVELS = [1, 2, 3, 4, 5];
const HC = 1240; // eV·nm
// Енергетичната диаграма: E = 0 горе, E₁ долу
const D = { left: 34, right: 196, top: 36, bottom: 226 };
const ly = (n: number) => D.top + (D.bottom - D.top) / (n * n);
// Атомът: радиусите растат като n²/Z
const A = { x: 356, y: 128 };
const ORBIT = 4.4; // px за n = 1 при Z = 1
// Лентата на спектъра
const SP = { left: 60, right: 440, y: 258 };
const spx = (nm: number) => SP.left + ((nm - 380) / (750 - 380)) * (SP.right - SP.left);

const SUB = '₀₁₂₃₄₅';
const SERIES = ['', 'Лайман', 'Балмер', 'Пашен', 'Брекет'];

const region = (nm: number) => (nm < 380 ? 'ултравиолетово' : nm > 750 ? 'инфрачервено' : 'видимо');

/** Вълничка – фотон от точка p в посока (ux, uy). */
function photonPath(p: { x: number; y: number }, ux: number, uy: number, len: number) {
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const s = (i / 60) * len;
    const w = 5 * Math.sin((s / 9) * 2 * Math.PI);
    pts.push(`${i ? 'L' : 'M'} ${(p.x + ux * s - uy * w).toFixed(1)} ${(p.y + uy * s + ux * w).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Модел на Бор: енергетични нива на водорода (и на йона He⁺), преходи с излъчване и поглъщане на фотон. */
export default function BohrLab() {
  const [Z, setZ] = useState(1);
  const [n, setN] = useState(3); // текущо ниво
  const [from, setFrom] = useState<number | null>(null); // откъде е дошъл електронът (null – няма преход; 0 – йонизация)

  const E = (k: number) => (-13.6 * Z * Z) / (k * k);
  const go = (k: number) => {
    if (k === n) return;
    setFrom(n);
    setN(k);
  };
  const ionize = () => {
    setFrom(n);
    setN(0);
  };
  const reset = () => {
    setFrom(null);
    setN(1);
  };

  // Преходът: ΔE > 0 – поглъщане, ΔE < 0 – излъчване
  const ionized = n === 0;
  // from = 0: свободен електрон (с почти нулева енергия) се връща в атома
  const dE = from === null ? null : ionized ? (from === 0 ? null : -E(from)) : E(n) - (from === 0 ? 0 : E(from));
  const lam = dE === null ? null : HC / Math.abs(dE);
  const emitted = dE !== null && dE < 0;
  const low = from === null || ionized ? null : from === 0 ? n : Math.min(from, n);
  const color = lam === null ? '#9ca3af' : lam < 380 ? '#8b5cf6' : lam > 750 ? '#b91c1c' : wavelengthCss(lam);

  // Електронът върху орбитата си (при йонизация – извън атома)
  const angle = -0.7;
  const r = ionized ? 150 : (ORBIT * n * n) / Z;
  const e = { x: A.x + r * Math.cos(angle), y: A.y + r * Math.sin(angle) };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={Z === 1} onClick={() => {
            setZ(1);
            setFrom(null);
          }}>
          водород H
        </DiagramButton>
        <DiagramButton active={Z === 2} onClick={() => {
            setZ(2);
            setFrom(null);
          }}>
          йон He⁺ (Z = 2)
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 290">
        {/* Енергетична диаграма */}
        <line x1={D.left} y1={D.top - 6} x2={D.left} y2={D.bottom + 6} className="stroke-gray-400" strokeWidth="1.5" />
        <line x1={D.left} y1={D.top} x2={D.right} y2={D.top} className="stroke-gray-400" strokeWidth="1" strokeDasharray="4 3" />
        <Label p={{ x: D.right + 4, y: D.top - 8 }} size={10} anchor="end">
          E = 0 (n = ∞)
        </Label>
        {LEVELS.map(k => (
          <g key={k}>
            <line
              x1={D.left}
              y1={ly(k)}
              x2={D.right}
              y2={ly(k)}
              className={k === n ? 'stroke-blue-500' : 'stroke-gray-500 dark:stroke-gray-400'}
              strokeWidth={k === n ? 3 : 1.5}
            />
            {k <= 3 && (
              <Label p={{ x: D.right - 2, y: ly(k) + (k === 1 ? -9 : 8) }} size={10} anchor="end">
                {`n = ${k}: ${fmtNum(E(k), 2)} eV`}
              </Label>
            )}
          </g>
        ))}
        <Label p={{ x: D.left - 4, y: ly(4) - 2 }} size={9} anchor="end">
          4, 5
        </Label>
        {/* Стрелката на прехода */}
        {dE !== null && (
          <line
            x1={D.left + 60}
            y1={from ? ly(from) : D.top}
            x2={D.left + 60}
            y2={ionized ? D.top : ly(n)}
            stroke={color}
            strokeWidth="3"
            markerEnd="url(#bohr-arrow)"
          />
        )}
        <defs>
          <marker id="bohr-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        </defs>

        {/* Атомът */}
        {LEVELS.map(k => (
          <circle
            key={k}
            cx={A.x}
            cy={A.y}
            r={(ORBIT * k * k) / Z}
            fill="none"
            className={k === n ? 'stroke-blue-400' : 'stroke-gray-300 dark:stroke-gray-600'}
            strokeWidth={k === n ? 2 : 1}
            strokeDasharray={k === n ? undefined : '3 3'}
          />
        ))}
        <circle cx={A.x} cy={A.y} r={Z === 1 ? 3 : 4} className="fill-rose-500" />
        <circle cx={e.x} cy={e.y} r={4.5} className="fill-blue-500" />
        {lam !== null && (
          <path
            d={emitted ? photonPath(e, Math.cos(angle + 0.9), Math.sin(angle + 0.9), 70) : photonPath({ x: e.x - 80, y: e.y + 20 }, 0.97, -0.24, 72)}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
          />
        )}
        {ionized && (
          <Label p={{ x: e.x + 4, y: e.y - 12 }} size={10} tone="blue" anchor="end">
            свободен електрон
          </Label>
        )}

        {/* Спектърът */}
        <defs>
          <linearGradient id="bohr-spectrum">
            {Array.from({ length: 16 }, (_, i) => 380 + i * 24.6).map(nm => (
              <stop key={nm} offset={`${((nm - 380) / 370) * 100}%`} stopColor={wavelengthCss(nm)} />
            ))}
          </linearGradient>
        </defs>
        <rect x={SP.left} y={SP.y - 7} width={SP.right - SP.left} height={14} fill="url(#bohr-spectrum)" />
        <Label p={{ x: SP.left - 6, y: SP.y }} size={10} anchor="end">
          УВ ←
        </Label>
        <Label p={{ x: SP.right + 6, y: SP.y }} size={10} anchor="start">
          → ИЧ
        </Label>
        {[400, 500, 600, 700].map(nm => (
          <Label key={nm} p={{ x: spx(nm), y: SP.y + 18 }} size={9}>
            {`${nm} nm`}
          </Label>
        ))}
        {lam !== null && lam >= 380 && lam <= 750 && <line x1={spx(lam)} y1={SP.y - 12} x2={spx(lam)} y2={SP.y + 10} className="stroke-gray-900 dark:stroke-white" strokeWidth="3" />}
      </ZoomingSvg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
        <span className="text-sm text-gray-600 dark:text-gray-300">Премести електрона на ниво:</span>
        {LEVELS.map(k => (
          <DiagramButton key={k} active={k === n} onClick={() => go(k)}>
            {`n = ${k}`}
          </DiagramButton>
        ))}
      </div>
      <Buttons>
        <DiagramButton onClick={ionize}>йонизирай</DiagramButton>
        <DiagramButton onClick={reset}>основно състояние</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={
            dE === null || lam === null
              ? [{ label: ionized ? 'E =' : `E${SUB[n]} =`, value: ionized ? '0 eV' : `${fmtNum(E(n), 2)} eV`, tone: 'blue' }]
              : [
                  { label: 'ΔE =', value: `${fmtNum(Math.abs(dE), 2)} eV`, tone: 'blue' },
                  { label: 'λ =', value: `${fmtNum(lam, 0)} nm`, tone: 'violet' },
                  { label: 'област:', value: region(lam), tone: 'amber' },
                  ...(Z === 1 && low !== null && SERIES[low] ? [{ label: 'серия:', value: SERIES[low] }] : []),
                ]
          }
        />
      </div>
      <Note tone={emitted ? 'emerald' : 'violet'}>
        {dE === null
          ? ionized
            ? 'Електронът е свободен. Върни го в атома с бутоните за ниво – тогава атомът излъчва фотон.'
            : 'Избери ново ниво: към по-ниско атомът излъчва фотон, към по-високо – трябва да погълне фотон с точно тази енергия.'
          : ionized
            ? `Йонизация: на електрона трябват поне ${fmtNum(-E(from ?? 1), 2)} eV, за да стигне до E = 0. Всеки фотон с повече енергия също върши работа – излишъкът става кинетична енергия.`
            : from === 0
              ? `Свободен електрон се връща на ниво ${n} – фотонът отнася поне ${fmtNum(-E(n), 2)} eV.`
              : emitted
                ? `Излъчване: фотонът отнася разликата в енергиите, hf = E${SUB[from ?? 0]} − E${SUB[n]}.`
                : `Поглъщане: атомът поема само фотон с hf = E${SUB[n]} − E${SUB[from ?? 0]} – друг фотон минава през него.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Вляво са енергиите на нивата, вдясно – орбитите на Бор (радиусите растат като n²; при He⁺ са два пъти по-малки). Видимите линии
        на водорода са само четири – преходите към n = 2 от n = 3, 4, 5, 6. Сравни ги с линиите на He⁺: енергиите му са Z² = 4 пъти по-големи.
      </p>
    </div>
  );
}
