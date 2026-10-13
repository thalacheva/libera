import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';
import { mixColor, rgbCss, wavelengthCss } from './wavelengthColor';

type Mode = 'soap' | 'oil' | 'coating';
const MODES: { id: Mode; name: string; n: number; below: number; belowName: string; dMax: number }[] = [
  { id: 'soap', name: 'сапунен филм', n: 1.33, below: 1, belowName: 'въздух', dMax: 1000 },
  { id: 'oil', name: 'масло върху вода', n: 1.45, below: 1.33, belowName: 'вода', dMax: 1000 },
  { id: 'coating', name: 'антиотражателно покритие', n: 1.38, below: 1.52, belowName: 'стъкло', dMax: 300 },
];

/**
 * Отражение от тънък слой при перпендикулярно падане: двата отразени лъча (от горната и от долната граница)
 * интерферират. Амплитудите r са по Френел; отрицателно r означава обръщане на фазата (отражение от по-плътна среда).
 */
function reflectance(n: number, below: number, d: number) {
  const r1 = (1 - n) / (1 + n);
  const r2 = (n - below) / (n + below);
  return {
    r1,
    r2,
    R: (nm: number) => r1 * r1 + r2 * r2 + 2 * r1 * r2 * Math.cos((4 * Math.PI * n * d) / nm),
    max: (Math.abs(r1) + Math.abs(r2)) ** 2,
  };
}

const G = { left: 40, right: 320, top: 132, bottom: 222 };
const gx = (nm: number) => G.left + ((nm - 380) / 370) * (G.right - G.left);
const STRIP = { x: 362, top: 132, bottom: 222 };

/** Цветовете на сапунените мехури и антиотражателните покрития – интерференция в тънък слой. */
export default function ThinFilmLab() {
  const [k, setK] = useState(0);
  const M = MODES[k];
  const [n, setN] = useState(M.n);
  const [d, setD] = useState(300);
  const choose = (i: number) => {
    setK(i);
    setN(MODES[i].n);
    setD(MODES[i].id === 'coating' ? 100 : 300);
  };

  const f = reflectance(n, M.below, d);
  const coating = M.id === 'coating';
  // В режим „покритие“ показваме истинския коефициент на отражение, иначе – отнесен към най-големия възможен
  const scale = coating ? 0.06 : f.max;
  const color = rgbCss(mixColor(nm => f.R(nm) / f.max), coating ? 1 : 1.25);
  const uncoated = ((1 - M.below) / (1 + M.below)) ** 2;
  let best = 380;
  for (let nm = 380; nm <= 750; nm += 2) if (f.R(nm) > f.R(best)) best = nm;
  const ideal = 550 / (4 * n);

  const rows = Array.from({ length: 46 }, (_, i) => i);
  const rowD = (i: number) => (i / 45) * M.dMax;
  const sy = (dd: number) => STRIP.top + (dd / M.dMax) * (STRIP.bottom - STRIP.top);

  // Схемата с двата лъча
  const top = 52;
  const bot = 84;
  const flip1 = f.r1 < 0;
  const flip2 = f.r2 < 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MODES.map((m, i) => (
          <DiagramButton key={m.id} active={i === k} onClick={() => choose(i)}>
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 262">
        {/* Двата отразени лъча */}
        <rect x={16} y={top} width={214} height={bot - top} className="fill-sky-200/70 dark:fill-sky-800/50" />
        <rect x={16} y={bot} width={214} height={28} className={M.below === 1 ? 'fill-transparent' : 'fill-gray-200 dark:fill-gray-700'} />
        <line x1={16} y1={top} x2={230} y2={top} className="stroke-sky-600" />
        <line x1={16} y1={bot} x2={230} y2={bot} className="stroke-sky-600" />
        <polyline points={`40,14 80,${top} 110,${bot} 140,${top}`} fill="none" className="stroke-amber-500" strokeWidth="2" />
        <line x1={80} y1={top} x2={118} y2={14} className="stroke-amber-500" strokeWidth="2" />
        <line x1={140} y1={top} x2={178} y2={14} className="stroke-amber-500" strokeWidth="2" strokeDasharray="5 3" />
        <Label p={{ x: 124, y: 12 }} size={11} tone="amber">
          1
        </Label>
        <Label p={{ x: 184, y: 12 }} size={11} tone="amber">
          2
        </Label>
        {flip1 && (
          <Label p={{ x: 62, y: top - 10 }} size={10} tone="rose">
            +λ/2
          </Label>
        )}
        {flip2 && (
          <Label p={{ x: 110, y: bot + 12 }} size={10} tone="rose">
            +λ/2
          </Label>
        )}
        <Label p={{ x: 226, y: (top + bot) / 2 }} size={10} anchor="end">
          {`d = ${fmtNum(d)} nm, n = ${fmtNum(n, 2)}`}
        </Label>
        <Label p={{ x: 226, y: bot + 16 }} size={10} anchor="end">
          {M.belowName}
        </Label>

        {/* Отразеният цвят */}
        <rect x={262} y={20} width={80} height={80} rx={8} className="fill-gray-900" />
        <rect x={272} y={30} width={60} height={60} rx={6} style={{ fill: color }} />
        <Label p={{ x: 352, y: 44 }} size={11} anchor="start">
          отразен цвят
        </Label>
        <Label p={{ x: 352, y: 62 }} size={10} anchor="start">
          {coating ? `R(550 nm) = ${fmtNum(f.R(550) * 100, 2)}%` : `най-силно: ${best} nm`}
        </Label>
        <Label p={{ x: 352, y: 80 }} size={10} anchor="start">
          {`2nd = ${fmtNum(2 * n * d)} nm`}
        </Label>

        {/* Спектър на отразената светлина */}
        {Array.from({ length: 75 }, (_, i) => 380 + i * 5).map(nm => {
          const h = Math.min(1, f.R(nm) / scale) * (G.bottom - G.top);
          return <rect key={nm} x={gx(nm)} y={G.bottom - h} width={(G.right - G.left) / 74 + 0.4} height={h} style={{ fill: wavelengthCss(nm) }} />;
        })}
        <line x1={G.left} y1={G.bottom} x2={G.right} y2={G.bottom} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={G.left} y1={G.bottom} x2={G.left} y2={G.top} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {coating && (
          <>
            <line x1={G.left} y1={G.bottom - (uncoated / scale) * (G.bottom - G.top)} x2={G.right} y2={G.bottom - (uncoated / scale) * (G.bottom - G.top)} className="stroke-gray-500" strokeDasharray="4 3" />
            <Label p={{ x: G.right - 4, y: G.bottom - (uncoated / scale) * (G.bottom - G.top) - 9 }} size={10} anchor="end">
              {`без покритие ${fmtNum(uncoated * 100, 1)}%`}
            </Label>
          </>
        )}
        {[400, 500, 600, 700].map(nm => (
          <Label key={nm} p={{ x: gx(nm), y: G.bottom + 12 }} size={10} weight={500}>
            {String(nm)}
          </Label>
        ))}
        <Label p={{ x: G.right, y: G.bottom + 26 }} size={10} anchor="end">
          λ, nm
        </Label>
        <Label p={{ x: G.left + 6, y: G.top - 6 }} size={10} anchor="start">
          {coating ? 'отражение, до 6%' : 'отразена светлина'}
        </Label>

        {/* Вертикален филм – дебелината расте надолу */}
        <rect x={STRIP.x - 4} y={STRIP.top - 4} width={48} height={STRIP.bottom - STRIP.top + 8} rx={4} className="fill-gray-900" />
        {rows.map(i => (
          <rect
            key={i}
            x={STRIP.x}
            y={sy(rowD(i))}
            width={40}
            height={(STRIP.bottom - STRIP.top) / 45 + 0.5}
            style={{ fill: rgbCss(mixColor(nm => reflectance(n, M.below, rowD(i)).R(nm) / f.max), coating ? 1 : 1.25) }}
          />
        ))}
        <line x1={STRIP.x - 6} y1={sy(d)} x2={STRIP.x + 46} y2={sy(d)} className="stroke-rose-500" strokeWidth="2" />
        <Label p={{ x: STRIP.x + 52, y: sy(d) }} size={10} anchor="start" tone="rose">
          d
        </Label>
        <Label p={{ x: STRIP.x + 20, y: STRIP.top - 14 }} size={10}>
          {`0 → ${M.dMax} nm`}
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="d, nm" value={d} onChange={setD} min={coating ? 20 : 0} max={M.dMax} step={coating ? 2 : 10} tone="rose" />
        <Slider label="n" value={n} onChange={setN} min={1.2} max={1.7} step={0.01} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={
            coating
              ? [
                  { label: 'R(550 nm) =', value: `${fmtNum(f.R(550) * 100, 2)}%`, tone: 'rose' },
                  { label: 'без покритие', value: `${fmtNum(uncoated * 100, 2)}%` },
                  { label: 'идеално d = λ/(4n) =', value: `${fmtNum(ideal, 1)} nm`, tone: 'blue' },
                ]
              : [
                  { label: 'път. разлика 2nd =', value: `${fmtNum(2 * n * d)} nm`, tone: 'blue' },
                  { label: 'най-силно отразява', value: `${best} nm`, tone: 'violet' },
                ]
          }
        />
      </div>
      <Note tone={coating ? 'blue' : 'violet'}>
        {coating
          ? Math.abs(d - ideal) < 8
            ? 'Слой с дебелина λ/(4n): двата отразени лъча са в противофаза и почти се гасят – стъклото почти не отразява зелената светлина.'
            : 'Нагласи дебелината към λ/(4n), за да изчезне отражението около 550 nm.'
          : d < 30
            ? 'Много тънък филм изглежда черен: лъчите се гасят, защото единият е обърнат с половин вълна.'
            : 'Различните дебелини усилват различни цветове – затова мехурът е на цветни ивици.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Лъч 1 се отразява от горната граница, лъч 2 – от долната; той изминава допълнително 2nd. При отражение от оптически по-плътна
        среда фазата се обръща (+λ/2, отбелязано в червено). Вдясно: вертикален сапунен филм – водата се стича надолу, затова той е тънък горе
        и по-дебел долу. Смятаме само двата първи лъча при перпендикулярно падане, а цветовете са приблизителни.
      </p>
    </div>
  );
}
