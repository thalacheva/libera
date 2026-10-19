import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

// Енталпии на разтваряне (kJ/mol) – пресметнати от стандартните енталпии на образуване на твърдото вещество и на йоните във вода
const SALTS = [
  { name: 'NaOH', M: 40, dH: -44.5, color: 'fill-gray-100' },
  { name: 'CaCl₂', M: 111, dH: -81.8, color: 'fill-gray-200' },
  { name: 'NH₄NO₃', M: 80, dH: 25.7, color: 'fill-white' },
];
const C = 4.18; // J/(g·K) – приемаме, че разтворът има топлинния капацитет на водата
const T0 = 20;

// Термометър от −10 до 100 °C
const TH_TOP = 40;
const TH_BOTTOM = 172;
const ty = (t: number) => TH_BOTTOM - ((Math.min(100, Math.max(-10, t)) + 10) / 110) * (TH_BOTTOM - TH_TOP);
const num = (v: number, d = 1) => v.toFixed(d).replace('.', ',').replace('-', '−');

/** Калориметър „чаша от стиропор“: разтваряне на сол и промяна на температурата. */
export default function CalorimeterLab() {
  const [si, setSi] = useState(2);
  const [ms, setMs] = useState(8);
  const [mw, setMw] = useState(100);
  const [done, setDone] = useState(false);
  const s = SALTS[si];

  const n = ms / s.M;
  const q = -n * s.dH * 1000; // J, топлината, получена от разтвора
  const dT = q / ((mw + ms) * C);
  const T = done ? T0 + dT : T0;
  const level = 150 - mw * 0.32; // горната повърхност на течността

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SALTS.map((x, i) => (
          <DiagramButton
            key={x.name}
            active={i === si}
            onClick={() => {
              setSi(i);
              setDone(false);
            }}
          >
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 240" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* чаша от стиропор с капак */}
        <path d="M 120 60 L 132 200 L 248 200 L 260 60" className="fill-gray-50 dark:fill-gray-700 stroke-gray-400" strokeWidth="6" strokeLinejoin="round" />
        <rect x={112} y={50} width={156} height={12} rx={3} className="fill-gray-300 dark:fill-gray-500" />
        <path d={`M ${120 + (level - 60) * 0.086 + 4} ${level} L 135 196 L 245 196 L ${260 - (level - 60) * 0.086 - 4} ${level} Z`} className={T > T0 + 0.5 ? 'fill-orange-200' : T < T0 - 0.5 ? 'fill-sky-200' : 'fill-blue-100'} />
        {!done &&
          [0, 1, 2, 3, 4, 5].map(i => (
            <rect key={i} x={146 + i * 9} y={189 - (i % 2) * 5} width={8} height={7} className={`${s.color} stroke-gray-500`} strokeWidth="1" />
          ))}
        <text x={190} y={225} fontSize="12" textAnchor="middle" className="fill-gray-500">
          {done ? 'разтворът след разбъркване' : `${ms} g ${s.name} на дъното`}
        </text>

        {/* термометър */}
        <rect x={203} y={TH_TOP - 8} width={12} height={TH_BOTTOM - TH_TOP + 10} rx={6} className="fill-white dark:fill-gray-900 stroke-gray-500" strokeWidth="1.5" />
        <rect x={206} y={ty(T)} width={6} height={TH_BOTTOM - ty(T)} className="fill-red-500" />
        <circle cx={209} cy={TH_BOTTOM + 6} r={9} className="fill-red-500" />

        {/* скала */}
        {[0, 20, 40, 60, 80, 100].map(t => (
          <g key={t}>
            <line x1={300} x2={310} y1={ty(t)} y2={ty(t)} className="stroke-gray-400" />
            <text x={316} y={ty(t) + 4} fontSize="11" className="fill-gray-500">
              {t} °C
            </text>
          </g>
        ))}
        <line x1={300} x2={300} y1={ty(-10)} y2={ty(100)} className="stroke-gray-400" />
        <path d={`M 218 ${ty(T)} L 296 ${ty(T)}`} className="stroke-red-400" strokeDasharray="3 3" />
        <text x={370} y={ty(T) + 4} fontSize="14" fontWeight="700" className="fill-red-600 dark:fill-red-400">
          {num(T)} °C
        </text>
      </LabSvg>

      <Sliders>
        <Slider label="сол, g" value={ms} onChange={v => {
            setMs(v);
            setDone(false);
          }} min={1} max={20} step={1} tone="violet" />
        <Slider label="вода, g" value={mw} onChange={v => {
            setMw(v);
            setDone(false);
          }} min={50} max={250} step={10} tone="blue" />
      </Sliders>
      <Buttons>
        <DiagramButton active={done} onClick={() => setDone(!done)}>
          {done ? '↺ отначало' : '🥄 разтвори и разбъркай'}
        </DiagramButton>
      </Buttons>
      {done && (
        <div className="mt-3">
          <Readout
            items={[
              { label: 'ΔT =', value: `${dT > 0 ? '+' : ''}${num(dT)} K`, tone: dT > 0 ? 'amber' : 'blue' },
              { label: 'q = m·c·ΔT =', value: `${num(q / 1000, 2)} kJ` },
              { label: 'n =', value: `${num(n, 3)} mol` },
              { label: 'ΔH = −q/n =', value: `${num(s.dH)} kJ/mol`, tone: 'rose' },
            ]}
          />
        </div>
      )}
      {done && (
        <Note tone={T > 100 ? 'rose' : dT > 0 ? 'amber' : 'blue'}>
          {T > 100
            ? 'Пресметнатата температура е над 100 °C – в действителност разтворът ще кипне и ще пръска. Не повтаряй това!'
            : dT > 0
              ? `Разтворът се затопля – разтварянето на ${s.name} е екзотермично (ΔH < 0).`
              : `Разтворът се охлажда – разтварянето на ${s.name} е ендотермично (ΔH > 0). Така работят студените компреси за спортни травми.`}
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Приемаме, че калориметърът не губи топлина и че разтворът има специфичния топлинен капацитет на водата, 4,18 J/(g·K). Тогава
        топлината <i>q</i> = <i>m</i>·<i>c</i>·Δ<i>T</i> идва от процеса и ΔH = −<i>q</i>/<i>n</i>. Опитай: при двойно повече сол ΔT се
        удвоява, а ΔH на мол не се променя.
      </p>
    </div>
  );
}
