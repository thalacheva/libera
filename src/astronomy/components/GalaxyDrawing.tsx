// Процедурно рисуване на галактики по типа им в класификацията на Хъбъл.

export type GalaxyType = 'E0' | 'E3' | 'E7' | 'S0' | 'Sa' | 'Sb' | 'Sc' | 'SBa' | 'SBb' | 'SBc' | 'Irr';

function rnd(n: number) {
  const x = Math.sin(n * 12.9898 + 4.1414) * 43758.5453;
  return x - Math.floor(x);
}

type Spec = { bulge: number; pitch: number; bar: boolean; arms: boolean; ellip: number };

const SPECS: Record<GalaxyType, Spec> = {
  E0: { bulge: 1, pitch: 0, bar: false, arms: false, ellip: 0 },
  E3: { bulge: 1, pitch: 0, bar: false, arms: false, ellip: 0.3 },
  E7: { bulge: 1, pitch: 0, bar: false, arms: false, ellip: 0.7 },
  S0: { bulge: 0.55, pitch: 0, bar: false, arms: false, ellip: 0.5 },
  Sa: { bulge: 0.45, pitch: 8, bar: false, arms: true, ellip: 0 },
  Sb: { bulge: 0.3, pitch: 14, bar: false, arms: true, ellip: 0 },
  Sc: { bulge: 0.15, pitch: 22, bar: false, arms: true, ellip: 0 },
  SBa: { bulge: 0.4, pitch: 8, bar: true, arms: true, ellip: 0 },
  SBb: { bulge: 0.28, pitch: 14, bar: true, arms: true, ellip: 0 },
  SBc: { bulge: 0.15, pitch: 22, bar: true, arms: true, ellip: 0 },
  Irr: { bulge: 0, pitch: 0, bar: false, arms: false, ellip: 0 },
};

/** Рисува галактика с център (cx, cy) и радиус r. tilt (0–1) сплесква диска на спиралите. */
export function GalaxyDrawing({ type, cx, cy, r, id, tilt = 0, dots = 160 }: { type: GalaxyType; cx: number; cy: number; r: number; id: string; tilt?: number; dots?: number }) {
  const s = SPECS[type];
  const gid = `gal-${id}`;
  const squash = 1 - tilt * 0.75;

  if (type.startsWith('E')) {
    return (
      <g>
        <defs>
          <radialGradient id={gid}>
            <stop offset="0" stopColor="#fff7ed" />
            <stop offset="0.35" stopColor="#fdba74" stopOpacity="0.9" />
            <stop offset="1" stopColor="#c2410c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={cx} cy={cy} rx={r} ry={r * (1 - s.ellip)} fill={`url(#${gid})`} />
      </g>
    );
  }

  if (type === 'Irr') {
    return (
      <g>
        {Array.from({ length: Math.round(dots * 0.8) }, (_, i) => {
          const a = rnd(i) * 2 * Math.PI;
          const d = Math.sqrt(rnd(i + 99)) * r * (0.6 + 0.4 * Math.sin(a * 2 + 1));
          const clump = rnd(i + 7) < 0.15;
          return <circle key={i} cx={cx + d * Math.cos(a) + (rnd(i + 3) - 0.5) * r * 0.3} cy={cy + d * Math.sin(a) * 0.8} r={clump ? 2.2 * (r / 90) + 0.8 : 1 * (r / 90) + 0.4} fill={clump ? '#f9a8d4' : '#bfdbfe'} fillOpacity="0.8" />;
        })}
      </g>
    );
  }

  const k = Math.tan((s.pitch * Math.PI) / 180) || 0.01;
  const start = s.bar ? r * 0.35 : r * 0.12;
  const armDots = s.arms ? dots : 0;
  return (
    <g>
      <defs>
        <radialGradient id={gid}>
          <stop offset="0" stopColor="#fff7ed" />
          <stop offset="0.5" stopColor="#fde68a" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${gid}-disk`}>
          <stop offset="0" stopColor="#bfdbfe" stopOpacity="0.35" />
          <stop offset="1" stopColor="#bfdbfe" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * squash * (type === 'S0' ? 0.5 : 1)} fill={`url(#${gid}-disk)`} />
      {s.bar && <ellipse cx={cx} cy={cy} rx={start * 1.05} ry={r * 0.09 * (squash + 0.3)} fill="#fde68a" fillOpacity="0.55" />}
      {/* Две логаритмични спирали: r = r₀ · e^(kθ) */}
      {Array.from({ length: armDots }, (_, i) => {
        const arm = i % 2;
        const theta = rnd(i) * Math.log(r / start) / k;
        const rr = start * Math.exp(k * theta);
        if (rr > r) return null;
        const a = theta + arm * Math.PI + (rnd(i + 500) - 0.5) * 0.35;
        const jitter = (rnd(i + 900) - 0.5) * r * 0.06;
        const x = cx + (rr + jitter) * Math.cos(a);
        const y = cy + (rr + jitter) * Math.sin(a) * squash;
        const young = rnd(i + 300) < 0.18;
        return <circle key={i} cx={x} cy={y} r={(young ? 1.6 : 1) * Math.max(0.5, r / 90)} fill={young ? '#f9a8d4' : '#93c5fd'} fillOpacity="0.85" />;
      })}
      <ellipse cx={cx} cy={cy} rx={r * s.bulge * 0.6} ry={r * s.bulge * 0.6 * (0.5 + 0.5 * squash)} fill={`url(#${gid})`} />
    </g>
  );
}
