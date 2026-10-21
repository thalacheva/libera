import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

// Опростени спектри на поглъщане (сума от гаусови криви), нормирани към 1 в най-високия връх.
// Върховете са приблизително като на пигментите в органичен разтворител.
type Peak = [number, number, number]; // λ, ширина σ, височина
const gauss = (peaks: Peak[]) => (l: number) => peaks.reduce((s, [m, w, h]) => s + h * Math.exp(-((l - m) ** 2) / (2 * w * w)), 0);

const PIGMENTS = [
  {
    key: 'a',
    name: 'хлорофил a',
    color: '#16a34a',
    f: gauss([
      [430, 14, 1],
      [412, 10, 0.35],
      [662, 11, 0.78],
      [615, 14, 0.14],
    ]),
  },
  {
    key: 'b',
    name: 'хлорофил b',
    color: '#0d9488',
    f: gauss([
      [453, 13, 1],
      [432, 10, 0.3],
      [642, 10, 0.4],
      [595, 14, 0.08],
    ]),
  },
  {
    key: 'c',
    name: 'каротеноиди',
    color: '#f59e0b',
    f: gauss([
      [425, 10, 0.55],
      [450, 13, 0.95],
      [478, 12, 0.82],
    ]),
  },
];

// Спектър на действието: колко фотосинтеза дава светлината с дадена дължина на вълната.
// Модел: приносите на пигментите (каротеноидите предават енергията по-слабо) плюс малко „фон“.
const actionRaw = (l: number) => 0.55 * PIGMENTS[0].f(l) + 0.35 * PIGMENTS[1].f(l) + 0.2 * PIGMENTS[2].f(l);
const ACTION_MAX = Math.max(...Array.from({ length: 301 }, (_, i) => actionRaw(400 + i)));
const action = (l: number) => 0.12 + 0.88 * (actionRaw(l) / ACTION_MAX);

/** Цвят на видимата светлина с дадена дължина на вълната (приблизително). */
function wavelengthColor(l: number) {
  let r = 0;
  let g = 0;
  let b = 0;
  if (l < 440) [r, g, b] = [(440 - l) / 40, 0, 1];
  else if (l < 490) [r, g, b] = [0, (l - 440) / 50, 1];
  else if (l < 510) [r, g, b] = [0, 1, (510 - l) / 20];
  else if (l < 580) [r, g, b] = [(l - 510) / 70, 1, 0];
  else if (l < 645) [r, g, b] = [1, (645 - l) / 65, 0];
  else [r, g, b] = [1, 0, 0];
  const fade = l < 420 ? 0.4 + (0.6 * (l - 400)) / 20 : l > 680 ? 0.4 + (0.6 * (700 - l)) / 20 : 1;
  const c = (v: number) => Math.round(255 * Math.max(0, Math.min(1, v * fade)));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}

const colorName = (l: number) =>
  l < 450 ? 'виолетово-синя' : l < 490 ? 'синя' : l < 520 ? 'синьо-зелена' : l < 570 ? 'зелена' : l < 590 ? 'жълта' : l < 625 ? 'оранжева' : 'червена';

// Графиката
const GX = 50;
const GW = 400;
const GY = 14;
const GH = 150;
const L0 = 400;
const L1 = 700;
const gx = (l: number) => GX + ((l - L0) / (L1 - L0)) * GW;
const gy = (v: number) => GY + GH - v * (GH - 10);
const BAND_Y = GY + GH + 4;
// Нишката на Енгелман
const FIL_Y = 232;

const hash = (i: number) => {
  const x = Math.sin(i * 91.17 + 4.3) * 43758.5453;
  return x - Math.floor(x);
};
// Бактериите: 420 точки с фиксирани „случайни“ места; всяка се показва, ако кислородът на мястото ѝ стига.
const BACTERIA = Array.from({ length: 420 }, (_, i) => ({ l: L0 + hash(i) * (L1 - L0), dy: (hash(i + 500) - 0.5) * 2, p: hash(i + 900) }));

const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

/** Спектри на поглъщане на пигментите, спектър на действието и опитът на Енгелман. */
export default function SpectrumLab() {
  const [shown, setShown] = useState<Record<string, boolean>>({ a: true, b: true, c: true });
  const [showAction, setShowAction] = useState(false);
  const [engelmann, setEngelmann] = useState(false);
  const [l, setL] = useState(550);

  const path = (f: (l: number) => number) =>
    Array.from({ length: 151 }, (_, i) => {
      const x = L0 + (i / 150) * (L1 - L0);
      return `${gx(x).toFixed(1)},${gy(f(x)).toFixed(1)}`;
    }).join(' ');

  const values = PIGMENTS.map(p => p.f(l));
  const eV = 1240 / l;

  let note: string;
  const act = action(l);
  if (act > 0.7) note = `Тази светлина (${colorName(l)}) се поглъща силно – фотосинтезата върви бързо.`;
  else if (act > 0.35) note = `Тази светлина (${colorName(l)}) се поглъща частично – най-вече от помощните пигменти.`;
  else note = `Тази светлина (${colorName(l)}) почти не се поглъща от разтворените пигменти – повечето се отразява или минава през листа. Затова листата са зелени.`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 262" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Оси */}
        <line x1={GX} x2={GX + GW} y1={GY + GH} y2={GY + GH} className="stroke-gray-400" />
        <line x1={GX} x2={GX} y1={GY} y2={GY + GH} className="stroke-gray-400" />
        <text x={GX - 6} y={GY + 10} fontSize="11" textAnchor="end" fill="currentColor">
          max
        </text>
        <text x={GX - 6} y={GY + GH} fontSize="11" textAnchor="end" fill="currentColor">
          0
        </text>
        <text x={14} y={GY + GH / 2} fontSize="11" textAnchor="middle" fill="currentColor" transform={`rotate(-90 14 ${GY + GH / 2})`}>
          поглъщане
        </text>
        {/* Цветната лента на спектъра */}
        {Array.from({ length: 60 }, (_, i) => {
          const x = L0 + i * 5;
          return <rect key={x} x={gx(x)} y={BAND_Y} width={GW / 60 + 0.5} height={8} fill={wavelengthColor(x + 2.5)} />;
        })}
        {[400, 450, 500, 550, 600, 650, 700].map(v => (
          <text key={v} x={gx(v)} y={BAND_Y + 21} fontSize="11" textAnchor="middle" fill="currentColor">
            {v}
          </text>
        ))}
        <text x={GX + GW} y={BAND_Y + 34} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          дължина на вълната, nm
        </text>

        {PIGMENTS.map(p => shown[p.key] && <polyline key={p.key} points={path(p.f)} fill="none" stroke={p.color} strokeWidth="2.5" />)}
        {showAction && <polyline points={path(action)} fill="none" stroke="#e11d48" strokeWidth="2.5" strokeDasharray="7 4" />}

        {/* Избраната дължина на вълната */}
        <line x1={gx(l)} x2={gx(l)} y1={GY} y2={GY + GH} className="stroke-gray-500" />
        {PIGMENTS.map((p, i) => shown[p.key] && <circle key={p.key} cx={gx(l)} cy={gy(values[i])} r="4" fill={p.color} />)}
        {showAction && <circle cx={gx(l)} cy={gy(act)} r="4" fill="#e11d48" />}

        {/* Легенда */}
        <g transform={`translate(${gx(512)} ${GY + 6})`}>
          <rect x={-6} y={-4} width={118} height={showAction ? 66 : 52} rx={6} className="fill-white/85 dark:fill-gray-800/85" />
          {PIGMENTS.map((p, i) => (
            <g key={p.key} transform={`translate(0 ${i * 14})`} opacity={shown[p.key] ? 1 : 0.35}>
              <line x1={0} x2={14} y1={6} y2={6} stroke={p.color} strokeWidth="2.5" />
              <text x={19} y={10} fontSize="10.5" fill="currentColor">
                {p.name}
              </text>
            </g>
          ))}
          {showAction && (
            <g transform="translate(0 42)">
              <line x1={0} x2={14} y1={6} y2={6} stroke="#e11d48" strokeWidth="2.5" strokeDasharray="4 3" />
              <text x={19} y={10} fontSize="10.5" fill="currentColor">
                спектър на действие
              </text>
            </g>
          )}
        </g>

        {/* Опитът на Енгелман: нишка от водорасло под спектъра, бактериите се събират там, където се отделя кислород */}
        {engelmann && (
          <g>
            <rect x={GX} y={FIL_Y - 7} width={GW} height={14} rx={7} fill="#4ade80" stroke="#15803d" />
            {Array.from({ length: 16 }, (_, i) => (
              <line key={i} x1={GX + (i + 1) * (GW / 17)} x2={GX + (i + 1) * (GW / 17)} y1={FIL_Y - 7} y2={FIL_Y + 7} stroke="#15803d" />
            ))}
            {BACTERIA.filter(b => b.p < action(b.l) ** 2).map((b, i) => (
              <circle key={i} cx={gx(b.l)} cy={FIL_Y + (b.dy > 0 ? 11 + b.dy * 9 : -11 + b.dy * 9)} r="1.6" className="fill-gray-700 dark:fill-gray-200" />
            ))}
          </g>
        )}
        {!engelmann && (
          <text x={GX + GW / 2} y={FIL_Y + 4} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            Включи „опитът на Енгелман“, за да видиш водораслото и бактериите
          </text>
        )}
      </LabSvg>

      <Sliders>
        <Slider label={`λ, nm`} value={l} onChange={setL} min={400} max={700} step={5} tone="emerald" />
      </Sliders>
      <Buttons>
        {PIGMENTS.map(p => (
          <DiagramButton key={p.key} active={shown[p.key]} onClick={() => setShown(s => ({ ...s, [p.key]: !s[p.key] }))}>
            {p.name}
          </DiagramButton>
        ))}
        <DiagramButton active={showAction} onClick={() => setShowAction(v => !v)}>
          спектър на действие
        </DiagramButton>
        <DiagramButton active={engelmann} onClick={() => setEngelmann(v => !v)}>
          опитът на Енгелман
        </DiagramButton>
      </Buttons>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs sm:text-sm">
        {PIGMENTS.map((p, i) => (
          <div key={p.key} className="rounded bg-gray-50 dark:bg-gray-900/40 px-2 py-1">
            <div style={{ color: p.color }} className="font-medium">
              {p.name}
            </div>
            <div className="font-mono">{fmt(values[i])}</div>
          </div>
        ))}
        <div className="rounded bg-gray-50 dark:bg-gray-900/40 px-2 py-1">
          <div className="font-medium flex items-center justify-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: wavelengthColor(l) }} /> фотон
          </div>
          <div className="font-mono">{fmt(eV)} eV</div>
        </div>
      </div>
      <Note tone="emerald">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Кривите са опростени и нормирани – всяка към своя най-висок връх; върховете са приблизително на местата, измерени за пигментите в
        разтвор (хлорофил a – около 430 и 662 nm, хлорофил b – около 453 и 642 nm). В живия лист пигментите са свързани с белтъци и
        върховете леко се изместват. Енергията на фотона е <span className="font-mono">E ≈ 1240 / λ</span> eV при λ в nm.
      </p>
    </div>
  );
}
