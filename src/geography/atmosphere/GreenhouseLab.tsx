import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

const SIGMA = 5.67e-8;
const S0 = 1361;
const K = 273.15;

const PRESETS = [
  { name: 'Земята днес', albedo: 0.3, eps: 0.78 },
  { name: 'без парникови газове', albedo: 0.3, eps: 0 },
  { name: '„Снежна топка“', albedo: 0.6, eps: 0.78 },
  { name: 'повече CO₂', albedo: 0.3, eps: 0.8 },
];

// Нива на чертежа
const SPACE = 52;
const ATM_Y = 120;
const ATM_H = 44;
const GROUND = 250;

/** Стрелка надолу или нагоре с дебелина според потока (W/m²). */
const FLUX_TONES = {
  sun: ['stroke-amber-500', 'fill-amber-500'],
  reflected: ['stroke-amber-300', 'fill-amber-300'],
  surface: ['stroke-rose-500', 'fill-rose-500'],
  air: ['stroke-violet-500', 'fill-violet-500'],
};

function Flux({ x, y1, y2, w, tone, label, side = 'right' }: { x: number; y1: number; y2: number; w: number; tone: keyof typeof FLUX_TONES; label: string; side?: 'left' | 'right' }) {
  const [stroke, fill] = FLUX_TONES[tone];
  const width = Math.max(1.5, w / 22);
  const dir = y2 > y1 ? 1 : -1;
  const head = Math.min(10, Math.abs(y2 - y1) / 2);
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2 - dir * head} className={stroke} strokeWidth={width} />
      <path d={`M${x - width / 2 - 5} ${y2 - dir * head}L${x + width / 2 + 5} ${y2 - dir * head}L${x} ${y2}Z`} className={fill} />
      <text x={side === 'right' ? x + width / 2 + 6 : x - width / 2 - 6} y={(y1 + y2) / 2 + 4} fontSize="11" textAnchor={side === 'right' ? 'start' : 'end'} className="fill-gray-800 dark:fill-gray-100">
        {label}
      </text>
    </g>
  );
}

/** Модел с един слой атмосфера: албедо и поглъщане на инфрачервеното лъчение → температура на повърхността. */
export default function GreenhouseLab() {
  const [albedo, setAlbedo] = useState(0.3);
  const [eps, setEps] = useState(0.78);

  const incoming = S0 / 4;
  const reflected = albedo * incoming;
  const absorbed = incoming - reflected;
  const Te = (absorbed / SIGMA) ** 0.25;
  const Ts = Te * (2 / (2 - eps)) ** 0.25;
  const Ta = Ts / 2 ** 0.25;
  const surfaceOut = SIGMA * Ts ** 4;
  const atmOut = eps * SIGMA * Ta ** 4;
  const passed = (1 - eps) * surfaceOut;

  // Термометър: −60…+60 °C
  const tY = (t: number) => GROUND - ((t + 60) / 120) * (GROUND - 30);
  const tsC = Ts - K;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 290" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={10} y={10} width={520} height={SPACE} className="fill-slate-800 dark:fill-slate-950" />
        <text x={20} y={30} fontSize="11" className="fill-slate-100">
          космос
        </text>
        <rect x={10} y={ATM_Y} width={520} height={ATM_H} className="fill-sky-300/60 dark:fill-sky-800/60" style={{ opacity: 0.25 + 0.75 * eps }} />
        <text x={20} y={ATM_Y + 16} fontSize="11" className="fill-sky-900 dark:fill-sky-100">
          атмосфера
        </text>
        <text x={20} y={ATM_Y + 31} fontSize="10" className="fill-sky-900 dark:fill-sky-100">
          T = {fmt(Ta - K)} °C
        </text>
        <rect x={10} y={GROUND} width={520} height={30} className={albedo > 0.5 ? 'fill-slate-100 dark:fill-slate-300' : 'fill-lime-700/80 dark:fill-lime-900'} />
        <text x={20} y={GROUND + 19} fontSize="11" className={albedo > 0.5 ? 'fill-gray-800' : 'fill-white'}>
          повърхност: {fmt(tsC, 1)} °C
        </text>

        {/* Късовълново: от Слънцето */}
        <Flux x={120} y1={SPACE + 14} y2={GROUND} w={incoming} tone="sun" label={`${fmt(incoming)}`} side="left" />
        <Flux x={160} y1={GROUND - 4} y2={SPACE + 14} w={reflected} tone="reflected" label={`${fmt(reflected)} отразени`} />
        {/* Дълговълново */}
        <Flux x={300} y1={GROUND} y2={ATM_Y + ATM_H} w={surfaceOut} tone="surface" label={`${fmt(surfaceOut)}`} side="left" />
        {eps < 0.995 && <Flux x={300} y1={ATM_Y} y2={SPACE + 14} w={passed} tone="surface" label={`${fmt(passed)} минават`} />}
        {eps > 0.005 && (
          <>
            <Flux x={420} y1={ATM_Y} y2={SPACE + 14} w={atmOut} tone="air" label={`${fmt(atmOut)}`} />
            <Flux x={460} y1={ATM_Y + ATM_H} y2={GROUND} w={atmOut} tone="air" label={`${fmt(atmOut)}`} />
            <text x={470} y={GROUND - 22} fontSize="10" className="fill-violet-700 dark:fill-violet-300">
              обратно
            </text>
          </>
        )}

        {/* Термометър */}
        <rect x={570} y={30} width={14} height={GROUND - 30} rx={7} className="fill-gray-100 dark:fill-gray-700 stroke-gray-400" />
        <rect x={572} y={tY(Math.max(-60, Math.min(60, tsC)))} width={10} height={GROUND - tY(Math.max(-60, Math.min(60, tsC)))} className="fill-rose-500" />
        <circle cx={577} cy={GROUND + 10} r={11} className="fill-rose-500" />
        {[-60, -30, 0, 30, 60].map(t => (
          <g key={t}>
            <line x1={586} y1={tY(t)} x2={592} y2={tY(t)} className="stroke-gray-500" />
            <text x={595} y={tY(t) + 3} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
              {t}
            </text>
          </g>
        ))}
        <line x1={556} y1={tY(15)} x2={586} y2={tY(15)} className="stroke-emerald-600" strokeWidth="2" />
        <text x={552} y={tY(15) + 3} fontSize="10" textAnchor="end" className="fill-emerald-700 dark:fill-emerald-300">
          15
        </text>
        <line x1={556} y1={tY(Te - K)} x2={586} y2={tY(Te - K)} className="stroke-sky-600" strokeWidth="2" strokeDasharray="3 2" />
        <text x={552} y={tY(Te - K) + 3} fontSize="10" textAnchor="end" className="fill-sky-700 dark:fill-sky-300">
          {fmt(Te - K)}
        </text>
        <text x={577} y={22} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          °C
        </text>
      </LabSvg>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Потоците са в W/m², средно за цялата Земя. Жълто – слънчева светлина, червено – топлинно излъчване на повърхността, виолетово – излъчване на атмосферата.
      </p>
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton
            key={p.name}
            active={Math.abs(p.albedo - albedo) < 0.001 && Math.abs(p.eps - eps) < 0.001}
            onClick={() => {
              setAlbedo(p.albedo);
              setEps(p.eps);
            }}
          >
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="α" value={albedo} onChange={setAlbedo} min={0} max={0.9} step={0.01} tone="amber" />
        <Slider label="ε" value={eps} onChange={setEps} min={0} max={1} step={0.01} tone="violet" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        α – албедо (каква част от светлината се отразява); ε – каква част от топлинното излъчване на повърхността поглъща атмосферата.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'погълнати', value: `${fmt(absorbed)} W/m²`, tone: 'amber' },
            { label: 'без атмосфера', value: `${fmt(Te - K, 1)} °C`, tone: 'blue' },
            { label: 'повърхност', value: `${fmt(tsC, 1)} °C`, tone: 'rose' },
            { label: 'парников ефект', value: `+${fmt(Ts - Te, 1)} °C`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={tsC < -5 ? 'blue' : tsC > 25 ? 'rose' : 'emerald'}>
        {eps < 0.01
          ? 'Без парникови газове цялото топлинно излъчване излиза в космоса и Земята би била около −18 °C.'
          : tsC < -5
            ? 'Повече отразена светлина – по-малко погълната енергия: планетата замръзва.'
            : 'Атмосферата връща част от топлината обратно към повърхността и тя се затопля, докато излъчи толкова, колкото поглъща.'}
      </Note>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Опростен модел: цялата светлина се поглъща от повърхността, атмосферата е един слой, без облаци, вятър и изпарение.
      </p>
    </div>
  );
}
