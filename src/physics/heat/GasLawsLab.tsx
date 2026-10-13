import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

// pV/T е едно и също за даденото количество газ: 100 kPa · 2 L / 300 K
const C = (100 * 2) / 300;

type Mode = 'T' | 'p' | 'V';
const MODES: { id: Mode; name: string; law: string }[] = [
  { id: 'T', name: 'изотермен (T = const)', law: 'Закон на Бойл–Мариот: pV = const – свиваш газа наполовина, налягането се удвоява.' },
  { id: 'p', name: 'изобарен (p = const)', law: 'Закон на Гей-Люсак: V/T = const – обемът е пропорционален на абсолютната температура.' },
  { id: 'V', name: 'изохорен (V = const)', law: 'Закон на Шарл: p/T = const – налягането е пропорционално на абсолютната температура.' },
];

// Неподвижни „молекули“ в единичен квадрат – детерминирани, за да няма разлика между сървъра и браузъра
const DOTS = Array.from({ length: 36 }, (_, i) => ({ u: ((i * 0.618034) % 1) * 0.9 + 0.05, w: ((i * 0.754877 + 0.3) % 1) * 0.9 + 0.05 }));

// Графиката вдясно
const G = { x0: 222, x1: 462, y0: 20, y1: 196 };

/** Газ в цилиндър с бутало: три процеса и графиките им. */
export default function GasLawsLab() {
  const [mode, setMode] = useState<Mode>('T');
  const [V1, setV1] = useState(2);
  const [T1, setT1] = useState(300);

  // Състоянието според процеса
  const T = mode === 'T' ? 300 : T1;
  const V = mode === 'T' ? V1 : mode === 'p' ? (C * T) / 100 : 2;
  const p = (C * T) / V;

  // Оси на графиката: p–V при изотермен, V–T при изобарен, p–T при изохорен
  const axes =
    mode === 'T'
      ? { xMax: 4.5, yMax: 450, xName: 'V, L', yName: 'p, kPa', x: V, y: p, f: (v: number) => (C * 300) / v, xTicks: [1, 2, 3, 4], yTicks: [100, 200, 300, 400] }
      : mode === 'p'
        ? { xMax: 650, yMax: 4.5, xName: 'T, K', yName: 'V, L', x: T, y: V, f: (t: number) => (C * t) / 100, xTicks: [100, 200, 300, 400, 500, 600], yTicks: [1, 2, 3, 4] }
        : { xMax: 650, yMax: 220, xName: 'T, K', yName: 'p, kPa', x: T, y: p, f: (t: number) => (C * t) / 2, xTicks: [100, 200, 300, 400, 500, 600], yTicks: [50, 100, 150, 200] };
  const gx = (v: number) => G.x0 + (v / axes.xMax) * (G.x1 - G.x0);
  const gy = (v: number) => G.y1 - (Math.min(v, axes.yMax) / axes.yMax) * (G.y1 - G.y0);
  const curve = (from: number, to: number) =>
    Array.from({ length: 81 }, (_, i) => from + ((to - from) * i) / 80)
      .map((v, i) => `${i ? 'L' : 'M'} ${gx(v).toFixed(1)} ${gy(axes.f(v)).toFixed(1)}`)
      .join(' ');
  const isotherm = (t: number) =>
    Array.from({ length: 81 }, (_, i) => 0.3 + (4.2 * i) / 80)
      .filter(v => (C * t) / v <= axes.yMax)
      .map((v, i) => `${i ? 'L' : 'M'} ${gx(v).toFixed(1)} ${gy((C * t) / v).toFixed(1)}`)
      .join(' ');
  // Плътната част е обхватът на плъзгача; при V–T и p–T пунктирът продължава до 0 K
  const solid = mode === 'T' ? curve(0.5, 4.5) : curve(100, 600);

  // Цилиндърът: височината на газа е пропорционална на обема (4,5 L = 160 px)
  const cyl = { x: 40, w: 110, bottom: 206 };
  const gasH = (V / 4.5) * 160;
  const pistonY = cyl.bottom - gasH;
  // Цвят на газа според температурата – от синьо (студено) към червено (горещо)
  const heat = (T - 100) / 500;
  const gasColor = `rgb(${Math.round(120 + 135 * heat)}, ${Math.round(170 - 60 * heat)}, ${Math.round(250 - 170 * heat)})`;

  const choose = (m: Mode) => {
    setMode(m);
    setV1(2);
    setT1(300);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MODES.map(m => (
          <DiagramButton key={m.id} active={m.id === mode} onClick={() => choose(m.id)}>
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 228">
        {/* Цилиндър с бутало */}
        <rect x={cyl.x} y={pistonY} width={cyl.w} height={gasH} fill={gasColor} opacity={0.35} />
        {DOTS.map((d, i) => (
          <circle key={i} cx={cyl.x + 6 + d.u * (cyl.w - 12)} cy={pistonY + 4 + d.w * (gasH - 8)} r={2.6} fill={gasColor} />
        ))}
        <path d={`M ${cyl.x} 30 V ${cyl.bottom} H ${cyl.x + cyl.w} V 30`} fill="none" className="stroke-gray-500" strokeWidth="3" />
        <rect x={cyl.x + 2} y={pistonY - 10} width={cyl.w - 4} height={10} className="fill-gray-500" />
        <line x1={cyl.x + cyl.w / 2} y1={pistonY - 10} x2={cyl.x + cyl.w / 2} y2={Math.max(14, pistonY - 40)} className="stroke-gray-500" strokeWidth="4" />
        {mode === 'V' && <line x1={cyl.x - 6} y1={pistonY - 1} x2={cyl.x + cyl.w + 6} y2={pistonY - 1} className="stroke-rose-500" strokeWidth="2" strokeDasharray="4 3" />}
        <Label p={{ x: cyl.x + cyl.w / 2, y: 220 }} size={11}>
          {mode === 'V' ? 'буталото е закрепено' : mode === 'p' ? 'буталото се движи свободно' : 'бавно, при постоянна T'}
        </Label>
        {/* Манометър */}
        <circle cx={186} cy={52} r={24} className="fill-white stroke-gray-500 dark:fill-gray-900" strokeWidth="2" />
        <line
          x1={186}
          y1={52}
          x2={186 + 19 * Math.cos(Math.PI * (1.25 - (1.5 * Math.min(p, 450)) / 450))}
          y2={52 - 19 * Math.sin(Math.PI * (1.25 - (1.5 * Math.min(p, 450)) / 450))}
          className="stroke-rose-500"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Label p={{ x: 186, y: 90 }} size={11}>
          {`${fmtNum(p, 0)} kPa`}
        </Label>
        {/* Термометър */}
        <rect x={180} y={110} width={12} height={84} rx={6} className="fill-gray-100 stroke-gray-400 dark:fill-gray-700" />
        <rect x={182} y={192 - (T / 650) * 80} width={8} height={(T / 650) * 80} rx={4} className="fill-rose-500" />
        <Label p={{ x: 186, y: 208 }} size={11}>
          {`${fmtNum(T, 0)} K`}
        </Label>

        {/* Графика */}
        <line x1={G.x0} y1={G.y1} x2={G.x1} y2={G.y1} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={G.x0} y1={G.y1} x2={G.x0} y2={G.y0} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {axes.xTicks.map(v => (
          <Label key={v} p={{ x: gx(v), y: G.y1 + 12 }} size={10} weight={500}>
            {fmtNum(v)}
          </Label>
        ))}
        {axes.yTicks.map(v => (
          <g key={v}>
            <line x1={G.x0} y1={gy(v)} x2={G.x1} y2={gy(v)} className="stroke-gray-100 dark:stroke-gray-700/50" />
            <Label p={{ x: G.x0 - 4, y: gy(v) }} size={10} weight={500} anchor="end">
              {fmtNum(v)}
            </Label>
          </g>
        ))}
        <Label p={{ x: G.x1, y: G.y1 + 26 }} size={11} anchor="end">
          {axes.xName}
        </Label>
        <Label p={{ x: G.x0 + 6, y: G.y0 - 6 }} size={11} anchor="start">
          {axes.yName}
        </Label>
        {mode !== 'T' && (
          <>
            <path d={curve(0, 100)} fill="none" className="stroke-blue-500" strokeWidth="2" strokeDasharray="4 4" />
            <Label p={{ x: G.x0 + 16, y: G.y1 - 12 }} size={10} tone="blue" anchor="start">
              0 K
            </Label>
          </>
        )}
        {/* Други изотерми за сравнение: по-горещият газ е по-далеч от осите */}
        {mode === 'T' &&
          [150, 450].map(t => (
            <g key={t}>
              <path d={isotherm(t)} fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1.5" strokeDasharray="5 4" />
              <Label p={{ x: gx(4.3), y: gy((C * t) / 4.3) + (t < 300 ? 10 : -10) }} size={10} anchor="end">
                {`${t} K`}
              </Label>
            </g>
          ))}
        <path d={solid} fill="none" className="stroke-blue-500" strokeWidth="3" />
        <line x1={gx(axes.x)} y1={G.y1} x2={gx(axes.x)} y2={gy(axes.y)} className="stroke-rose-400" strokeDasharray="3 3" />
        <line x1={G.x0} y1={gy(axes.y)} x2={gx(axes.x)} y2={gy(axes.y)} className="stroke-rose-400" strokeDasharray="3 3" />
        <circle cx={gx(axes.x)} cy={gy(axes.y)} r={6} className="fill-rose-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />
      </ZoomingSvg>

      <Sliders>
        {mode === 'T' ? (
          <Slider label="V, L" value={V1} onChange={setV1} min={0.5} max={4} step={0.1} tone="blue" />
        ) : (
          <Slider label="T, K" value={T1} onChange={setT1} min={100} max={600} step={10} tone="rose" />
        )}
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'p =', value: `${fmtNum(p, 1)} kPa`, tone: 'rose' },
            { label: 'V =', value: `${fmtNum(V, 2)} L`, tone: 'blue' },
            { label: 'T =', value: `${fmtNum(T, 0)} K = ${fmtNum(T - 273, 0)} °C` },
            { label: 'pV/T =', value: `${fmtNum(C, 3)} kPa·L/K`, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone="blue">{MODES.find(m => m.id === mode)!.law}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Количеството газ е едно и също (около 0,08 mol), затова pV/T не се променя при никой процес. При изобарния и изохорния процес
        правите, продължени назад (пунктир), минават през 0 K – така е открита абсолютната нула. Истинският газ се втечнява много преди това.
      </p>
    </div>
  );
}
