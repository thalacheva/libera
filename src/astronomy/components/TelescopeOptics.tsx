import { useState } from 'react';

const W = 640;
const X0 = 70; // входът на тръбата

type Kind = 'refractor' | 'newton' | 'cassegrain';

const KINDS: { id: Kind; name: string; text: string }[] = [
  {
    id: 'refractor',
    name: 'Рефрактор',
    text: 'Лещата (обектив) пречупва лъчите и ги събира във фокуса. Окулярът е лупа, през която гледаме изображението. Различните цветове се пречупват различно – това е хроматичната аберация.',
  },
  {
    id: 'newton',
    name: 'Нютонов рефлектор',
    text: 'Вдлъбнато (параболично) огледало отразява лъчите обратно към фокуса. Малко плоско огледало под 45° ги извежда встрани от тръбата, където е окулярът. Огледалото отразява всички цветове еднакво.',
  },
  {
    id: 'cassegrain',
    name: 'Касегрен',
    text: 'Изпъкнало вторично огледало връща лъчите обратно през отвор в главното огледало. Пътят на светлината се „сгъва“ и дългото фокусно разстояние се побира в къса тръба – така са построени почти всички големи телескопи.',
  },
];

type P = { x: number; y: number };
const lerp = (a: P, b: P, t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const pts = (...ps: P[]) => ps.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

function Eye({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d="M 0 -9 Q 14 0 0 9" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" />
      <circle cx={3} cy={0} r={3.5} fill="#38bdf8" />
    </g>
  );
}

export default function TelescopeOptics() {
  const [kind, setKind] = useState<Kind>('newton');
  const [F, setF] = useState(1000); // mm
  const [f, setF2] = useState(20); // mm
  const [D, setD] = useState(150); // mm
  const [chromatic, setChromatic] = useState(false);

  const M = F / f;
  const maxUseful = 2 * D;
  const minUseful = D / 7;
  const exitPupil = D / M;

  // Схемата не е в мащаб, но следва промените
  const L = 150 + ((F - 400) / 1600) * 250;
  const half = 18 + ((D - 50) / 250) * 40;
  const fpx = 12 + ((f - 4) / 36) * 40;
  const heights = [-0.85, -0.4, 0.4, 0.85].map(k => k * half);

  const rays: React.ReactNode[] = [];
  const parts: React.ReactNode[] = [];
  const ray = (key: string, points: P[], color = '#fde68a', opacity = 0.9) =>
    rays.push(<polyline key={key} points={pts(...points)} fill="none" stroke={color} strokeOpacity={opacity} strokeWidth="1.6" />);

  if (kind === 'refractor') {
    const cy = 120;
    const focus = { x: X0 + L, y: cy };
    const eyepiece = focus.x + fpx;
    const variants = chromatic
      ? [
          { dx: -22, color: '#60a5fa' },
          { dx: 22, color: '#f87171' },
        ]
      : [{ dx: 0, color: '#fde68a' }];
    // Бялата светлина пристига обща, а след лещата цветовете се разделят
    heights.forEach((h, i) => ray(`in${i}`, [{ x: 10, y: cy + h }, { x: X0, y: cy + h }]));
    variants.forEach(({ dx, color }) =>
      heights.forEach((h, i) => {
        const lens = { x: X0, y: cy + h };
        const fp = { x: focus.x + dx, y: cy };
        // След фокуса лъчът продължава до окуляра и излиза успоредно
        const atEye = lerp(lens, fp, (eyepiece - lens.x) / (fp.x - lens.x));
        ray(`r${color}${i}`, [lens, fp, atEye, { x: eyepiece + 40, y: atEye.y }], color);
      })
    );
    parts.push(
      <rect key="tube" x={X0} y={cy - half - 8} width={L + fpx - 6} height={2 * half + 16} fill="none" stroke="#64748b" strokeWidth="1.5" />,
      <ellipse key="obj" cx={X0} cy={cy} rx={6} ry={half + 4} fill="#7dd3fc" fillOpacity="0.35" stroke="#7dd3fc" />,
      <ellipse key="ep" cx={eyepiece} cy={cy} rx={4} ry={Math.max(8, (half * fpx) / L + 6)} fill="#7dd3fc" fillOpacity="0.35" stroke="#7dd3fc" />,
      <circle key="f" cx={focus.x} cy={cy} r={3} fill="white" />,
      <text key="ft" x={focus.x} y={cy + half + 26} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
        фокус
      </text>,
      <Eye key="eye" x={eyepiece + 44} y={cy} />,
      <text key="lt" x={X0} y={cy - half - 16} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
        обектив
      </text>,
      <text key="et" x={eyepiece} y={cy - half - 16} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
        окуляр
      </text>
    );
    // Размерна линия за F
    parts.push(
      <g key="dim">
        <line x1={X0} x2={focus.x} y1={cy + half + 40} y2={cy + half + 40} stroke="white" strokeOpacity="0.5" />
        <text x={(X0 + focus.x) / 2} y={cy + half + 54} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
          F = {F} mm
        </text>
      </g>
    );
  } else if (kind === 'newton') {
    const cy = 190;
    const mirrorX = X0 + L;
    const px = mirrorX - L; // главният фокус (ако нямаше диагонално огледало)
    const xd = px + 46;
    const image = { x: xd, y: cy - (xd - px) };
    const eyeY = image.y - fpx;
    heights.forEach((h, i) => {
      const m = { x: mirrorX, y: cy + h };
      const t = (xd - m.x + h) / (px - m.x + h);
      const q = lerp(m, { x: px, y: cy }, t);
      const atEye = lerp(q, image, (eyeY - q.y) / (image.y - q.y));
      ray(`n${i}`, [{ x: 10, y: cy + h }, m, q, image, atEye, { x: atEye.x, y: eyeY - 36 }]);
    });
    const s = (half * (xd - px)) / (mirrorX - px) + 5;
    parts.push(
      <rect key="tube" x={X0 - 20} y={cy - half - 10} width={L + 26} height={2 * half + 20} fill="none" stroke="#64748b" strokeWidth="1.5" />,
      <path key="mirror" d={`M ${mirrorX + 2} ${cy - half - 6} Q ${mirrorX - 10} ${cy} ${mirrorX + 2} ${cy + half + 6}`} fill="none" stroke="#e2e8f0" strokeWidth="4" />,
      <line key="diag" x1={xd - s} y1={cy - s} x2={xd + s} y2={cy + s} stroke="#e2e8f0" strokeWidth="3" />,
      <ellipse key="ep" cx={xd} cy={eyeY} rx={Math.max(8, s + 4)} ry={4} fill="#7dd3fc" fillOpacity="0.35" stroke="#7dd3fc" />,
      <circle key="f" cx={image.x} cy={image.y} r={3} fill="white" />,
      <Eye key="eye" x={xd} y={eyeY - 40} rotate={-90} />,
      <text key="mt" x={mirrorX - 4} y={cy + half + 28} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
        главно огледало
      </text>,
      <text key="dt" x={xd + 14} y={cy + half + 28} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
        диагонално огледало
      </text>,
      <text key="et" x={xd + s + 14} y={eyeY + 4} fontSize="11" fill="white" fillOpacity="0.7">
        окуляр
      </text>
    );
  } else {
    const cy = 120;
    const mirrorX = X0 + Math.min(L, 330);
    const L1 = (mirrorX - X0) * 0.75; // фокусно разстояние на главното огледало (на чертежа)
    const p1 = { x: mirrorX - L1, y: cy };
    const xs = mirrorX - L1 * 0.62;
    const focus = { x: mirrorX + 46, y: cy };
    const eyepiece = focus.x + fpx;
    heights.forEach((h, i) => {
      const m = { x: mirrorX, y: cy + h };
      const q = lerp(m, p1, (xs - m.x) / (p1.x - m.x));
      const atEye = lerp(q, focus, (eyepiece - q.x) / (focus.x - q.x));
      ray(`c${i}`, [{ x: 10, y: cy + h }, m, q, focus, atEye, { x: eyepiece + 40, y: atEye.y }]);
    });
    const s = (half * (xs - p1.x)) / (mirrorX - p1.x) + 5;
    parts.push(
      <rect key="tube" x={X0 - 20} y={cy - half - 10} width={mirrorX - X0 + 26} height={2 * half + 20} fill="none" stroke="#64748b" strokeWidth="1.5" />,
      <path key="m1a" d={`M ${mirrorX + 2} ${cy - half - 6} Q ${mirrorX - 6} ${cy - half / 2} ${mirrorX - 8} ${cy - 7}`} fill="none" stroke="#e2e8f0" strokeWidth="4" />,
      <path key="m1b" d={`M ${mirrorX + 2} ${cy + half + 6} Q ${mirrorX - 6} ${cy + half / 2} ${mirrorX - 8} ${cy + 7}`} fill="none" stroke="#e2e8f0" strokeWidth="4" />,
      <path key="m2" d={`M ${xs - 2} ${cy - s} Q ${xs + 6} ${cy} ${xs - 2} ${cy + s}`} fill="none" stroke="#e2e8f0" strokeWidth="3" />,
      <ellipse key="ep" cx={eyepiece} cy={cy} rx={4} ry={10} fill="#7dd3fc" fillOpacity="0.35" stroke="#7dd3fc" />,
      <circle key="f" cx={focus.x} cy={cy} r={3} fill="white" />,
      <Eye key="eye" x={eyepiece + 44} y={cy} />,
      <text key="mt" x={mirrorX} y={cy + half + 28} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
        главно огледало с отвор
      </text>,
      <text key="st" x={xs} y={cy - half - 18} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
        вторично огледало
      </text>
    );
  }

  const info = KINDS.find(k => k.id === kind)!;
  const H = kind === 'newton' ? 300 : 245;
  const tooMuch = M > maxUseful;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Как работи телескопът</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Изберете оптична схема и сменете обектива, окуляра и диаметъра. Чертежът не е в мащаб.
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {KINDS.map(k => (
          <button
            key={k.id}
            onClick={() => setKind(k.id)}
            className={`px-3 py-1 rounded-lg text-sm border ${
              kind === k.id
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {k.name}
          </button>
        ))}
        {kind === 'refractor' && (
          <label className="ml-auto flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <input type="checkbox" checked={chromatic} onChange={e => setChromatic(e.target.checked)} />
            хроматична аберация
          </label>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <text x={10} y={20} fontSize="11" fill="white" fillOpacity="0.6">
          светлина от звезда →
        </text>
        {rays}
        {parts}
      </svg>

      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{info.text}</p>

      <div className="grid sm:grid-cols-3 gap-3 mt-3 text-sm">
        {[
          { label: `Фокусно разстояние на обектива F = ${F} mm`, value: F, set: setF, min: 400, max: 2000, step: 50 },
          { label: `Фокусно разстояние на окуляра f = ${f} mm`, value: f, set: setF2, min: 4, max: 40, step: 1 },
          { label: `Диаметър (апертура) D = ${D} mm`, value: D, set: setD, min: 50, max: 300, step: 10 },
        ].map(s => (
          <label key={s.min} className="block">
            <span className="block text-xs font-semibold mb-1">{s.label}</span>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.value} onChange={e => s.set(Number(e.target.value))} className="w-full" />
          </label>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        {[
          { label: 'Увеличение M = F / f', value: `${Math.round(M)}×` },
          { label: 'Светосила F / D', value: `f/${(F / D).toFixed(1).replace('.', ',')}` },
          { label: 'Полезно увеличение', value: `${Math.round(minUseful)}× – ${maxUseful}×` },
          { label: 'Изходен зрачок D / M', value: `${exitPupil.toFixed(1).replace('.', ',')} mm` },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-mono font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <p className={`mt-2 text-sm ${tooMuch ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
        {tooMuch
          ? `✗ ${Math.round(M)}× е „празно“ увеличение: над ~2D = ${maxUseful}× изображението само става по-голямо и по-размито, без нови детайли.`
          : exitPupil > 7
            ? '◐ Изходният зрачок е по-голям от зеницата на окото (~7 mm) – част от събраната светлина се губи.'
            : '✓ Увеличението е в полезните граници.'}
      </p>
    </div>
  );
}
