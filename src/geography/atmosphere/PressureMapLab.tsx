import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt, rad } from '../geo';
import { contours } from '../terrain';

// Карта 420 × 360 px = 2100 × 1800 km (5 km на пиксел); x на изток, y на юг (надолу)
const MX = 10;
const MY = 10;
const MW = 420;
const MH = 360;
const KM = 5;
const SIGMA = 600;
const RHO = 1.2;
const OMEGA = 7.292e-5;
const N = 48;

type Pt = { x: number; y: number };
type Mode = 'push' | 'aloft' | 'surface';

/** Налягане в hPa в точка (x, y) в пиксели от ъгъла на картата. */
const pressureAt = (h: Pt, l: Pt) => (x: number, y: number) => {
  const r2 = (c: Pt) => (((x - c.x) * KM) ** 2 + ((y - c.y) * KM) ** 2) / SIGMA ** 2;
  return 1012 + 14 * Math.exp(-r2(h)) - 18 * Math.exp(-r2(l));
};

/** Посока, ОТКЪДЕТО духа вятърът, по вектора на движението (на изток, на север). */
const COMPASS = ['С', 'СИ', 'И', 'ЮИ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
const fromDir = (ue: number, vn: number) => {
  const toward = (Math.atan2(ue, vn) * 180) / Math.PI;
  const from = (toward + 180 + 360) % 360;
  return COMPASS[Math.round(from / 45) % 8];
};

const MODES: { id: Mode; name: string }[] = [
  { id: 'push', name: 'само градиентна сила' },
  { id: 'aloft', name: 'високо (геострофичен вятър)' },
  { id: 'surface', name: 'при земята (с триене)' },
];

/**
 * Вятърът в точка: градиент на налягането (hPa/km, на изток и на север) → вектор на вятъра в m/s.
 * Геострофичен: v = (1/ρf) k × ∇p. При триене моделът е прост: вятърът се завърта с ъгъл α към
 * ниското налягане и отслабва до cos α – тогава градиентната сила, Кориолис и триенето се уравновесяват.
 */
function windOf(ge: number, gn: number, f: number, mode: Mode, alpha: number) {
  const gx = ge * 0.1; // hPa/km → Pa/m
  const gy = gn * 0.1;
  if (mode === 'push') return { ue: -gx, vn: -gy };
  let ue = -gy / (RHO * f);
  let vn = gx / (RHO * f);
  if (mode === 'surface') {
    const a = rad(alpha) * Math.sign(f);
    const c = Math.cos(rad(alpha));
    [ue, vn] = [c * (ue * Math.cos(a) - vn * Math.sin(a)), c * (ue * Math.sin(a) + vn * Math.cos(a))];
  }
  return { ue, vn };
}

const arrowHead = (x1: number, y1: number, x2: number, y2: number, size = 5) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  return `M${x2} ${y2}L${x2 - size * Math.cos(a - 0.45)} ${y2 - size * Math.sin(a - 0.45)}L${x2 - size * Math.cos(a + 0.45)} ${y2 - size * Math.sin(a + 0.45)}Z`;
};

function Arrow({ x1, y1, x2, y2, cls, w = 2, head = 5 }: { x1: number; y1: number; x2: number; y2: number; cls: string; w?: number; head?: number }) {
  if (Math.hypot(x2 - x1, y2 - y1) < 2) return null;
  return (
    <g className={cls}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={w} stroke="currentColor" />
      <path d={arrowHead(x1, y1, x2, y2, head)} fill="currentColor" />
    </g>
  );
}

/** Карта на налягането: местиш циклона и антициклона и гледаш как духа вятърът. */
export default function PressureMapLab() {
  const [hi, setHi] = useState<Pt>({ x: 300, y: 110 });
  const [lo, setLo] = useState<Pt>({ x: 120, y: 240 });
  const [probe, setProbe] = useState<Pt>({ x: 215, y: 165 });
  const [drag, setDrag] = useState<'h' | 'l' | 'p' | null>(null);
  const [mode, setMode] = useState<Mode>('aloft');
  const [south, setSouth] = useState(false);
  const [lat, setLat] = useState(45);
  const [alpha, setAlpha] = useState(30);

  const f = (south ? -1 : 1) * 2 * OMEGA * Math.sin(rad(lat));
  const p = pressureAt(hi, lo);

  const lines = useMemo(() => {
    const pf = pressureAt(hi, lo);
    const grid = Array.from({ length: N + 1 }, (_, j) => Array.from({ length: N + 1 }, (_, i) => pf((i / N) * MW, (j / N) * MH)));
    const levels: number[] = [];
    for (let L = 980; L <= 1040; L += 4) levels.push(L);
    return contours(grid, levels);
  }, [hi, lo]);

  /** Градиент в hPa/km: на изток и на север (y на картата расте на юг). */
  const grad = (x: number, y: number) => ({
    ge: (p(x + 1, y) - p(x - 1, y)) / (2 * KM),
    gn: -(p(x, y + 1) - p(x, y - 1)) / (2 * KM),
  });

  const arrows: { x: number; y: number; dx: number; dy: number }[] = [];
  for (let y = 30; y < MH; y += 45)
    for (let x = 30; x < MW; x += 45) {
      const { ge, gn } = grad(x, y);
      const w = windOf(ge, gn, f, mode, alpha);
      // При „само градиентна сила“ дължината е пропорционална на градиента (вятър още няма)
      const k = mode === 'push' ? 300 : 0.9;
      let dx = w.ue * k;
      let dy = -w.vn * k;
      const len = Math.hypot(dx, dy);
      if (len > 34) {
        dx *= 34 / len;
        dy *= 34 / len;
      }
      arrows.push({ x, y, dx, dy });
    }

  const g = grad(probe.x, probe.y);
  const gMag = Math.hypot(g.ge, g.gn); // hPa/km
  const vg = (gMag * 0.1) / (RHO * Math.abs(f));
  const wind = windOf(g.ge, g.gn, f, mode, alpha);
  const speed = Math.hypot(wind.ue, wind.vn);

  // Равновесие на силите в точката: градиентната сила е стрелка с дължина 60 px към ниското налягане
  const FX = 535;
  const FY = 215;
  const S = 60;
  const pgf = gMag > 1e-6 ? { x: -g.ge / gMag, y: g.gn / gMag } : { x: 0, y: 0 }; // екранни координати
  const wDir = speed > 1e-9 ? { x: wind.ue / speed, y: -wind.vn / speed } : { x: 0, y: 0 };
  const ratio = mode === 'surface' ? Math.cos(rad(alpha)) : 1;
  // Кориолис: перпендикулярно на вятъра – надясно в Северното полукълбо, наляво в Южното
  const sgn = south ? -1 : 1;
  const cor = { x: -wDir.y * sgn * ratio, y: wDir.x * sgn * ratio };
  const fric = { x: -(pgf.x + cor.x), y: -(pgf.y + cor.y) };

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const m = e.currentTarget.getScreenCTM();
    if (!m) return;
    const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const pt = { x: Math.max(10, Math.min(MW - 10, q.x - MX)), y: Math.max(10, Math.min(MH - 10, q.y - MY)) };
    if (drag === 'h') setHi(pt);
    else if (drag === 'l') setLo(pt);
    else setProbe(pt);
  };
  const grab = (k: 'h' | 'l' | 'p') => (e: React.PointerEvent) => {
    (e.currentTarget as SVGElement).ownerSVGElement?.setPointerCapture(e.pointerId);
    setDrag(k);
  };

  const center = (c: Pt, letter: string, cls: string, k: 'h' | 'l') => (
    <g transform={`translate(${MX + c.x} ${MY + c.y})`} className="cursor-grab" style={{ touchAction: 'none' }} onPointerDown={grab(k)}>
      <circle r={15} className={cls} strokeWidth="2" />
      <text y={6} fontSize="17" fontWeight="bold" textAnchor="middle" className="fill-white select-none pointer-events-none">
        {letter}
      </text>
    </g>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg
        viewBox="0 0 640 380"
        className="w-full h-auto block select-none text-gray-800 dark:text-gray-100"
        onPointerMove={move}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        <defs>
          <clipPath id="pm-map">
            <rect x={MX} y={MY} width={MW} height={MH} />
          </clipPath>
        </defs>
        <rect x={MX} y={MY} width={MW} height={MH} className="fill-sky-50 dark:fill-slate-900" />
        <g clipPath="url(#pm-map)">
          <g transform={`translate(${MX} ${MY}) scale(${MW} ${MH})`}>
            {lines.map(l => (
              <path key={l.level} d={l.d} fill="none" vectorEffect="non-scaling-stroke" strokeWidth={l.level % 8 === 0 ? 1.6 : 1} className="stroke-slate-500 dark:stroke-slate-400" />
            ))}
          </g>
          {arrows.map((a, i) => (
            <Arrow key={i} x1={MX + a.x - a.dx / 2} y1={MY + a.y - a.dy / 2} x2={MX + a.x + a.dx / 2} y2={MY + a.y + a.dy / 2} cls={mode === 'push' ? 'text-rose-500' : 'text-blue-600 dark:text-blue-400'} w={1.6} head={4} />
          ))}
          {lines
            .filter(l => l.level % 8 === 0)
            .map(l => {
              const m = l.d.match(/M([\d.]+) ([\d.]+)/);
              if (!m || Number(m[2]) * MH < 14 || Number(m[1]) * MW > MW - 30) return null;
              return (
                <text key={`t${l.level}`} x={MX + Number(m[1]) * MW + 3} y={MY + Number(m[2]) * MH - 3} fontSize="9" className="fill-slate-600 dark:fill-slate-300">
                  {l.level}
                </text>
              );
            })}
        </g>
        <rect x={MX} y={MY} width={MW} height={MH} fill="none" className="stroke-gray-400" />
        {center(hi, 'В', 'fill-amber-500 stroke-amber-700', 'h')}
        {center(lo, 'Н', 'fill-blue-500 stroke-blue-700', 'l')}
        <g transform={`translate(${MX + probe.x} ${MY + probe.y})`} className="cursor-grab" style={{ touchAction: 'none' }} onPointerDown={grab('p')}>
          <circle r={8} className="fill-fuchsia-500/40 stroke-fuchsia-700" strokeWidth="2" />
        </g>
        {/* Мащаб */}
        <line x1={MX + 12} y1={MY + MH - 12} x2={MX + 112} y2={MY + MH - 12} className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="2" />
        <text x={MX + 62} y={MY + MH - 17} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          500 km
        </text>
        <text x={MX + MW - 8} y={MY + 16} fontSize="10" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          С ↑ · изобари през 4 hPa
        </text>

        {/* Силите в избраната точка */}
        <text x={FX} y={34} fontSize="12" fontWeight="bold" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          Силите в точката
        </text>
        <circle cx={FX} cy={FY} r={4} className="fill-fuchsia-600" />
        <Arrow x1={FX} y1={FY} x2={FX + pgf.x * S} y2={FY + pgf.y * S} cls="text-rose-600 dark:text-rose-400" w={2.5} />
        {mode !== 'push' && <Arrow x1={FX} y1={FY} x2={FX + cor.x * S} y2={FY + cor.y * S} cls="text-violet-600 dark:text-violet-400" w={2.5} />}
        {mode === 'surface' && <Arrow x1={FX} y1={FY} x2={FX + fric.x * S} y2={FY + fric.y * S} cls="text-amber-600 dark:text-amber-400" w={2.5} />}
        {mode !== 'push' && <Arrow x1={FX} y1={FY} x2={FX + wDir.x * 0.75 * S} y2={FY + wDir.y * 0.75 * S} cls="text-blue-600 dark:text-blue-400" w={3.5} head={7} />}
        <g fontSize="11">
          <text x={455} y={300} className="fill-rose-600 dark:fill-rose-400">
            ● градиентна сила
          </text>
          {mode !== 'push' && (
            <text x={455} y={316} className="fill-violet-600 dark:fill-violet-400">
              ● сила на Кориолис
            </text>
          )}
          {mode === 'surface' && (
            <text x={455} y={332} className="fill-amber-600 dark:fill-amber-400">
              ● триене
            </text>
          )}
          {mode !== 'push' && (
            <text x={455} y={348} className="fill-blue-600 dark:fill-blue-400">
              ● посока на вятъра
            </text>
          )}
        </g>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Влачи центровете В (високо налягане) и Н (ниско налягане) и розовата точка. Моделът е опростен: плътност 1,2 kg/m³, една и съща ширина
        за цялата карта.
      </p>
      <Buttons>
        {MODES.map(m => (
          <DiagramButton key={m.id} active={mode === m.id} onClick={() => setMode(m.id)}>
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={!south} onClick={() => setSouth(false)}>
          Северно полукълбо
        </DiagramButton>
        <DiagramButton active={south} onClick={() => setSouth(true)}>
          Южно полукълбо
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="φ, °" value={lat} onChange={setLat} min={25} max={70} step={1} tone="violet" />
        {mode === 'surface' && <Slider label="α, °" value={alpha} onChange={setAlpha} min={0} max={45} step={5} tone="amber" />}
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'p', value: `${fmt(p(probe.x, probe.y), 1)} hPa` },
            { label: 'градиент', value: `${fmt(gMag * 100, 1)} hPa/100 km`, tone: 'rose' },
            { label: 'f', value: `${fmt(Math.abs(f) * 1e5, 2)}·10⁻⁵ s⁻¹`, tone: 'violet' },
            { label: 'геострофичен', value: `${fmt(vg, 1)} m/s` },
            ...(mode === 'push' ? [] : [{ label: 'вятър', value: `${fmt(speed, 1)} m/s от ${fromDir(wind.ue, wind.vn)}`, tone: 'blue' as const }]),
          ]}
        />
      </div>
      <Note tone={mode === 'push' ? 'rose' : 'blue'}>
        {mode === 'push'
          ? 'В първия миг въздухът тръгва право от високото към ниското налягане – но Земята се върти и силата на Кориолис започва да го отклонява.'
          : mode === 'aloft'
            ? `Високо, където няма триене, вятърът духа успоредно на изобарите: ниското налягане остава ${south ? 'отдясно' : 'отляво'}, ако застанеш с гръб към вятъра. Около Н той се върти ${south ? 'по' : 'обратно на'} часовниковата стрелка.`
            : `Триенето забавя вятъра, силата на Кориолис отслабва и вятърът пресича изобарите под ъгъл α към ниското налягане: към Н въздухът се събира и се издига, от В се разтича.`}
      </Note>
    </div>
  );
}
