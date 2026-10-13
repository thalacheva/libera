import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Handle, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';
import { fmtNum } from '~/physics/sim';

type Mode = 'magnet' | 'wire' | 'coil';

const W = 480;
const H = 260;
const C = { x: 240, y: 130 };
const PX_PER_M = 4000; // 40 px = 1 cm
const MU0 = 4 * Math.PI * 1e-7;

// Магнитът е модел с два „полюса“ в краищата си – N вдясно, S вляво
const POLES = [
  { x: C.x + 50, y: C.y, s: 1 },
  { x: C.x - 50, y: C.y, s: -1 },
];
// Бобината в разрез: 9 навивки отгоре и 9 отдолу
const TURNS = Array.from({ length: 9 }, (_, i) => C.x - 80 + i * 20);
const COIL_R = 40;

type Wire = { x: number; y: number; dir: number };

/** Жиците за избрания режим; dir = +1 – токът излиза от листа (⊙), −1 – влиза (⊗). */
function wiresFor(mode: Mode, sign: number): Wire[] {
  if (mode === 'wire') return [{ x: C.x, y: C.y, dir: sign }];
  if (mode === 'coil') return TURNS.flatMap(x => [{ x, y: C.y - COIL_R, dir: sign }, { x, y: C.y + COIL_R, dir: -sign }]);
  return [];
}

/** Поле в точка p (координати на SVG): посока и големина в тесли (за магнита – в относителни единици). */
function field(mode: Mode, wires: Wire[], I: number, p: Point) {
  let bx = 0;
  let by = 0;
  if (mode === 'magnet') {
    for (const q of POLES) {
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const r3 = Math.max(Math.hypot(dx, dy), 4) ** 3;
      bx += (q.s * dx) / r3;
      by += (q.s * dy) / r3;
    }
    return { bx, by, tesla: null as number | null };
  }
  for (const w of wires) {
    const dx = p.x - w.x;
    const dy = p.y - w.y;
    const rPx = Math.max(Math.hypot(dx, dy), 3);
    const B = (MU0 * I) / (2 * Math.PI * (rPx / PX_PER_M));
    // ⊙: обратно на часовниковата стрелка на екрана (y на SVG е надолу)
    bx += (w.dir * B * dy) / rPx;
    by += (-w.dir * B * dx) / rPx;
  }
  return { bx, by, tesla: Math.hypot(bx, by) };
}

/** Силова линия от точка start по посоката на полето (dir = ±1). */
function trace(mode: Mode, wires: Wire[], start: Point, dir: number, stop: (p: Point) => boolean) {
  const pts: Point[] = [start];
  let p = start;
  for (let i = 0; i < 1400; i++) {
    const f1 = field(mode, wires, 1, p);
    const n1 = Math.hypot(f1.bx, f1.by) || 1;
    const mid = { x: p.x + (dir * 1.5 * f1.bx) / n1, y: p.y + (dir * 1.5 * f1.by) / n1 };
    const f2 = field(mode, wires, 1, mid);
    const n2 = Math.hypot(f2.bx, f2.by) || 1;
    p = { x: p.x + (dir * 3 * f2.bx) / n2, y: p.y + (dir * 3 * f2.by) / n2 };
    pts.push(p);
    if (p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10 || stop(p)) break;
    // Затворена линия: върнали сме се до началото
    if (i > 40 && Math.hypot(p.x - start.x, p.y - start.y) < 3) break;
  }
  return pts;
}

function fieldLines(mode: Mode, wires: Wire[]): Point[][] {
  if (mode === 'wire') {
    return [30, 60, 95, 135].map(r => Array.from({ length: 73 }, (_, i) => ({ x: C.x + r * Math.cos((i / 72) * 2 * Math.PI), y: C.y + r * Math.sin((i / 72) * 2 * Math.PI) })));
  }
  if (mode === 'magnet') {
    const nearS = (p: Point) => Math.hypot(p.x - POLES[1].x, p.y - POLES[1].y) < 6;
    return Array.from({ length: 14 }, (_, i) => {
      const a = ((i + 0.5) / 14) * 2 * Math.PI;
      return trace(mode, wires, { x: POLES[0].x + 7 * Math.cos(a), y: POLES[0].y + 7 * Math.sin(a) }, 1, nearS);
    });
  }
  // Бобина: линии, които минават през вътрешността ѝ
  return [-28, -14, 0, 14, 28].map(dy => {
    const start = { x: C.x, y: C.y + dy };
    const fwd = trace(mode, wires, start, 1, () => false);
    const last = fwd[fwd.length - 1];
    if (Math.hypot(last.x - start.x, last.y - start.y) < 4) return fwd;
    // Незатворена линия: дорисуваме и частта преди началната точка
    return [...trace(mode, wires, start, -1, () => false).reverse(), ...fwd.slice(1)];
  });
}

/** Стрелки по силовата линия – на равни разстояния. */
function arrowsOn(pts: Point[], every: number) {
  const out: { p: Point; a: number }[] = [];
  for (let i = every / 2; i < pts.length - 1; i += every) {
    const k = Math.floor(i);
    const a = pts[k];
    const b = pts[k + 1];
    if (a.y < 0 || a.y > H || a.x < 0 || a.x > W) continue;
    out.push({ p: a, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI });
  }
  return out;
}

/** Магнитно поле на магнит, прав проводник и бобина; компасът показва посоката в избраната точка. */
export default function MagnetFieldLab() {
  const [mode, setMode] = useState<Mode>('wire');
  const [I, setI] = useState(10);
  const [sign, setSign] = useState(1);
  const [compass, setCompass] = useState<Point>({ x: C.x + 80, y: C.y - 60 });

  const wires = useMemo(() => wiresFor(mode, sign), [mode, sign]);
  const lines = useMemo(() => fieldLines(mode, wires), [mode, wires]);
  const f = field(mode, wires, I, compass);
  const angle = (Math.atan2(f.by, f.bx) * 180) / Math.PI;
  const rCm = Math.hypot(compass.x - C.x, compass.y - C.y) / 40;

  const choose = (m: Mode) => {
    setMode(m);
    setI(m === 'coil' ? 2 : 10);
  };
  const move = (p: Point) => setCompass({ x: Math.min(W - 16, Math.max(16, p.x)), y: Math.min(H - 16, Math.max(16, p.y)) });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'magnet'} onClick={() => choose('magnet')}>
          прав магнит
        </DiagramButton>
        <DiagramButton active={mode === 'wire'} onClick={() => choose('wire')}>
          прав проводник
        </DiagramButton>
        <DiagramButton active={mode === 'coil'} onClick={() => choose('coil')}>
          бобина (разрез)
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox={`0 0 ${W} ${H}`}>
        <rect x={0} y={0} width={W} height={H} rx={8} className="fill-slate-50 dark:fill-gray-900/40" />
        {lines.map((pts, i) => (
          <g key={i}>
            <polyline points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none" className="stroke-sky-400/80" strokeWidth="1.5" />
            {arrowsOn(mode === 'wire' ? (sign > 0 ? [...pts].reverse() : pts) : pts, mode === 'wire' ? 18 : 45).map((a, j) => (
              <polygon key={j} points="-5,-4 5,0 -5,4" transform={`translate(${a.p.x} ${a.p.y}) rotate(${a.a})`} className="fill-sky-500" />
            ))}
          </g>
        ))}

        {mode === 'magnet' && (
          <g>
            <rect x={C.x - 60} y={C.y - 14} width={60} height={28} className="fill-blue-500" />
            <rect x={C.x} y={C.y - 14} width={60} height={28} className="fill-rose-500" />
            <text x={C.x - 30} y={C.y + 1} fontSize={16} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="fill-white">
              S
            </text>
            <text x={C.x + 30} y={C.y + 1} fontSize={16} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="fill-white">
              N
            </text>
          </g>
        )}
        {wires.map((w, i) => (
          <g key={i}>
            <circle cx={w.x} cy={w.y} r={mode === 'wire' ? 11 : 7} className="fill-amber-100 stroke-amber-600" strokeWidth="2" />
            {w.dir > 0 ? (
              <circle cx={w.x} cy={w.y} r={mode === 'wire' ? 3 : 2} className="fill-amber-700" />
            ) : (
              <path
                d={`M ${w.x - (mode === 'wire' ? 6 : 4)} ${w.y - (mode === 'wire' ? 6 : 4)} L ${w.x + (mode === 'wire' ? 6 : 4)} ${w.y + (mode === 'wire' ? 6 : 4)} M ${w.x + (mode === 'wire' ? 6 : 4)} ${w.y - (mode === 'wire' ? 6 : 4)} L ${w.x - (mode === 'wire' ? 6 : 4)} ${w.y + (mode === 'wire' ? 6 : 4)}`}
                className="stroke-amber-700"
                strokeWidth="2"
              />
            )}
          </g>
        ))}

        {/* Компас: червеният край (N) сочи по полето */}
        <g transform={`translate(${compass.x} ${compass.y}) rotate(${angle})`}>
          <circle r={20} className="fill-white/80 stroke-gray-400 dark:fill-gray-800/80" strokeWidth="1.5" />
          <polygon points="0,-5 17,0 0,5" className="fill-rose-500" />
          <polygon points="0,-5 -17,0 0,5" className="fill-gray-400" />
        </g>
        <Handle p={compass} onMove={move} name="компас" tone="gray" />
        <Label p={{ x: 10, y: H - 12 }} size={11} anchor="start">
          {mode === 'wire' ? `токът ${sign > 0 ? 'излиза от листа ⊙' : 'влиза в листа ⊗'}` : mode === 'coil' ? 'горе ⊙, долу ⊗ – или обратно' : 'линиите излизат от N и влизат в S'}
        </Label>
      </ZoomingSvg>

      {mode !== 'magnet' && (
        <>
          <Sliders>
            <Slider label="I, A" value={I} onChange={setI} min={0.5} max={mode === 'coil' ? 5 : 20} step={0.5} tone="amber" />
          </Sliders>
          <Buttons>
            <DiagramButton active={sign > 0} onClick={() => setSign(1)}>
              {mode === 'wire' ? 'ток ⊙' : 'горе ⊙'}
            </DiagramButton>
            <DiagramButton active={sign < 0} onClick={() => setSign(-1)}>
              {mode === 'wire' ? 'ток ⊗' : 'горе ⊗'}
            </DiagramButton>
          </Buttons>
        </>
      )}
      <div className="mt-3">
        <Readout
          items={
            f.tesla === null
              ? [{ label: 'полето', value: 'посока – по червената стрелка на компаса', tone: 'rose' }]
              : [
                  ...(mode === 'wire' ? [{ label: 'r =', value: `${fmtNum(rCm, 1)} cm` }] : []),
                  { label: 'B =', value: `${fmtNum(f.tesla * 1e6, 0)} µT`, tone: 'blue' },
                  { label: 'Земята ≈', value: '50 µT' },
                ]
          }
        />
      </div>
      <Note tone="gray">
        {mode === 'wire'
          ? 'Линиите са окръжности около проводника. Обърни тока – и компасът се обръща.'
          : mode === 'coil'
            ? 'Вътре в бобината полето е почти еднородно – като на прав магнит.'
            : 'Отвън линиите вървят от N към S, а вътре в магнита – от S към N: те са затворени.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Премести компаса с мишката или с пръст. Червеният край на стрелката е северният ѝ полюс и сочи по посоката на полето. 40 px на
        екрана са 1 cm. Полето на Земята пренебрегваме – близо до проводник с ток то е по-слабо от полето на тока.
      </p>
    </div>
  );
}
