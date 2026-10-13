import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, ZoomingSvg } from '~/geometry/diagram';

const W = 480;
const H = 300;

type Charge = { x: number; y: number; q: number };
type Preset = 'two' | 'plates';

/** Полето на зарядите в точка (x; y) – в условни единици (k = 1, разстоянията в пиксели). */
function field(cs: Charge[], x: number, y: number) {
  let ex = 0;
  let ey = 0;
  for (const c of cs) {
    const dx = x - c.x;
    const dy = y - c.y;
    const r2 = dx * dx + dy * dy;
    const r3 = r2 * Math.sqrt(r2) || 1e-9;
    ex += (c.q * dx) / r3;
    ey += (c.q * dy) / r3;
  }
  return { ex, ey };
}

function potential(cs: Charge[], x: number, y: number) {
  return cs.reduce((s, c) => s + c.q / Math.max(4, Math.hypot(x - c.x, y - c.y)), 0);
}

/** Силова линия: тръгва от заряда и върви по посока на полето (или обратно – от отрицателен заряд). */
function traceLine(cs: Charge[], start: Charge, angle: number) {
  const sign = start.q > 0 ? 1 : -1;
  let x = start.x + 10 * Math.cos(angle);
  let y = start.y + 10 * Math.sin(angle);
  const pts = [`M ${x.toFixed(1)} ${y.toFixed(1)}`];
  for (let i = 0; i < 700; i++) {
    // Метод на средната точка (RK2) с постоянна дължина на стъпката
    const f1 = field(cs, x, y);
    const n1 = Math.hypot(f1.ex, f1.ey) || 1;
    const mx = x + (sign * 1.5 * f1.ex) / n1;
    const my = y + (sign * 1.5 * f1.ey) / n1;
    const f2 = field(cs, mx, my);
    const n2 = Math.hypot(f2.ex, f2.ey) || 1;
    x += (sign * 3 * f2.ex) / n2;
    y += (sign * 3 * f2.ey) / n2;
    pts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
    if (x < -20 || x > W + 20 || y < -20 || y > H + 20) break;
    if (cs.some(c => c !== start && Math.hypot(x - c.x, y - c.y) < 9 && Math.sign(c.q) !== Math.sign(start.q))) break;
  }
  return pts.join(' ');
}

/** Еквипотенциални линии по метода „марширащи квадрати“ върху мрежа. */
function contours(cs: Charge[]) {
  const STEP = 8;
  const nx = Math.ceil(W / STEP) + 1;
  const ny = Math.ceil(H / STEP) + 1;
  const v: number[][] = [];
  for (let j = 0; j < ny; j++) {
    v.push([]);
    for (let i = 0; i < nx; i++) v[j].push(potential(cs, i * STEP, j * STEP));
  }
  // Нивата – равномерни, според типичния потенциал далеч от зарядите
  const far = v.flat().map(Math.abs).sort((a, b) => a - b);
  const typical = far[Math.floor(far.length * 0.9)] || 1;
  const step = typical / 4;
  const levels = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map(n => n * step);
  const mixed = cs.some(c => c.q > 0) && cs.some(c => c.q < 0);
  const segs: string[] = [];
  for (const L of levels) {
    if (L === 0 && !mixed) continue;
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const corners = [
          [i, j],
          [i + 1, j],
          [i + 1, j + 1],
          [i, j + 1],
        ];
        const pts: [number, number][] = [];
        for (let k = 0; k < 4; k++) {
          const [ai, aj] = corners[k];
          const [bi, bj] = corners[(k + 1) % 4];
          const a = v[aj][ai] - L;
          const b = v[bj][bi] - L;
          if ((a < 0) !== (b < 0)) {
            const t = a / (a - b);
            pts.push([(ai + t * (bi - ai)) * STEP, (aj + t * (bj - aj)) * STEP]);
          }
        }
        for (let k = 0; k + 1 < pts.length; k += 2) {
          segs.push(`M ${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)} L ${pts[k + 1][0].toFixed(1)} ${pts[k + 1][1].toFixed(1)}`);
        }
      }
    }
  }
  return segs.join(' ');
}

/** Силови линии, вектори на полето и еквипотенциални линии за няколко точкови заряда. */
export default function FieldLinesLab() {
  const [preset, setPreset] = useState<Preset>('two');
  const [qa, setQa] = useState(1);
  const [qb, setQb] = useState(-1);
  const [d, setD] = useState(160);
  const [showLines, setShowLines] = useState(true);
  const [showVectors, setShowVectors] = useState(false);
  const [showEquip, setShowEquip] = useState(false);

  const charges = useMemo<Charge[]>(() => {
    if (preset === 'plates') {
      return Array.from({ length: 11 }, (_, i) => 130 + i * 22).flatMap(x => [
        { x, y: 100, q: 1 },
        { x, y: 200, q: -1 },
      ]);
    }
    return [
      { x: W / 2 - d / 2, y: H / 2, q: qa },
      { x: W / 2 + d / 2, y: H / 2, q: qb },
    ].filter(c => c.q !== 0);
  }, [preset, qa, qb, d]);

  const lines = useMemo(() => {
    if (!charges.length) return [];
    // Линиите тръгват от положителните заряди; ако няма такива – от отрицателните
    const sources = charges.some(c => c.q > 0) ? charges.filter(c => c.q > 0) : charges;
    const perUnit = preset === 'plates' ? 2 : 8;
    return sources.flatMap(c => {
      const n = perUnit * Math.abs(c.q);
      // При плочите линиите тръгват само навътре – към другата плоча
      const angles = preset === 'plates' ? [Math.PI / 2 - 0.3, Math.PI / 2 + 0.3].slice(0, n) : Array.from({ length: n }, (_, i) => (2 * Math.PI * (i + 0.5)) / n);
      return angles.map(a => traceLine(charges, c, a));
    });
  }, [charges, preset]);

  const equip = useMemo(() => (showEquip && charges.length ? contours(charges) : ''), [charges, showEquip]);

  const vectors = useMemo(() => {
    if (!showVectors || !charges.length) return [];
    const out = [];
    for (let y = 20; y < H; y += 30) {
      for (let x = 20; x < W; x += 30) {
        if (charges.some(c => Math.hypot(x - c.x, y - c.y) < 16)) continue;
        const { ex, ey } = field(charges, x, y);
        const n = Math.hypot(ex, ey);
        if (n === 0) continue;
        // Дължината расте логаритмично със силата на полето
        const len = Math.max(4, Math.min(13, 4 + 2.2 * Math.log10(n * 1e5)));
        out.push({ x, y, ux: ex / n, uy: ey / n, len });
      }
    }
    return out;
  }, [charges, showVectors]);

  const choose = (p: Preset, a: number, b: number) => {
    setPreset(p);
    setQa(a);
    setQb(b);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={preset === 'two' && qa > 0 && qb < 0} onClick={() => choose('two', 1, -1)}>
          дипол
        </DiagramButton>
        <DiagramButton active={preset === 'two' && qa > 0 && qb > 0} onClick={() => choose('two', 1, 1)}>
          еднакви заряди
        </DiagramButton>
        <DiagramButton active={preset === 'two' && qa === 2 && qb === -1} onClick={() => choose('two', 2, -1)}>
          +2 и −1
        </DiagramButton>
        <DiagramButton active={preset === 'plates'} onClick={() => setPreset('plates')}>
          две плочи
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox={`0 0 ${W} ${H}`}>
        <rect x={0} y={0} width={W} height={H} className="fill-slate-50 dark:fill-gray-900/40" />
        {showEquip && <path d={equip} fill="none" className="stroke-emerald-500" strokeWidth="1.2" opacity={0.8} />}
        {showLines && (
          <g fill="none" className="stroke-amber-500" strokeWidth="1.6">
            {lines.map((l, i) => (
              <path key={i} d={l} />
            ))}
          </g>
        )}
        {vectors.map((v, i) => (
          <g key={i} className="stroke-violet-500 fill-violet-500" strokeWidth="1.5">
            <line x1={v.x - (v.ux * v.len) / 2} y1={v.y - (v.uy * v.len) / 2} x2={v.x + (v.ux * v.len) / 2} y2={v.y + (v.uy * v.len) / 2} />
            <circle cx={v.x + (v.ux * v.len) / 2} cy={v.y + (v.uy * v.len) / 2} r={1.8} />
          </g>
        ))}
        {charges.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={preset === 'plates' ? 7 : 9 + Math.abs(c.q) * 2} className={c.q > 0 ? 'fill-rose-500' : 'fill-blue-500'} />
            <text x={c.x} y={c.y} fontSize={preset === 'plates' ? 11 : 14} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="fill-white">
              {c.q > 0 ? '+' : '−'}
            </text>
          </g>
        ))}
      </ZoomingSvg>

      <Buttons>
        <DiagramButton active={showLines} onClick={() => setShowLines(!showLines)}>
          силови линии
        </DiagramButton>
        <DiagramButton active={showVectors} onClick={() => setShowVectors(!showVectors)}>
          вектори E
        </DiagramButton>
        <DiagramButton active={showEquip} onClick={() => setShowEquip(!showEquip)}>
          еквипотенциални линии
        </DiagramButton>
      </Buttons>
      {preset === 'two' && (
        <Sliders>
          <Slider label="q₁" value={qa} onChange={setQa} min={-3} max={3} step={1} tone="rose" />
          <Slider label="q₂" value={qb} onChange={setQb} min={-3} max={3} step={1} tone="blue" />
          <Slider label="d" value={d} onChange={setD} min={60} max={280} step={10} tone="gray" />
        </Sliders>
      )}
      <Note tone="gray">
        {preset === 'plates'
          ? 'Между плочите линиите са успоредни и на равни разстояния – полето е еднородно: E = U/d.'
          : qa * qb < 0
            ? 'Линиите излизат от положителния заряд и влизат в отрицателния. Където са по-гъсти, полето е по-силно.'
            : qa * qb > 0
              ? 'Еднаквите заряди се отблъскват: линиите им се „избягват“ и между зарядите има точка, където полето е нула.'
              : 'Един заряд: линиите са радиални, а еквипотенциалните линии – окръжности.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Силовите линии (оранжево) са пресметнати числено: от всеки положителен заряд тръгват линии, които всеки миг следват посоката на
        полето. Броят им е пропорционален на заряда. Еквипотенциалните линии (зелено) винаги пресичат силовите под прав ъгъл. Векторите
        (лилаво) показват посоката на E в точки от мрежа – по-дългите са там, където полето е по-силно.
      </p>
    </div>
  );
}
