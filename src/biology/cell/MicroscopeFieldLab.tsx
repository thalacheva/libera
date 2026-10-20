import { type ReactNode, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Specimen = 'onion' | 'cheek' | 'blood' | 'bacteria';

// Обективи на училищен микроскоп: увеличение и числова апертура
const OBJECTIVES = [
  { m: 4, na: 0.1 },
  { m: 10, na: 0.25 },
  { m: 40, na: 0.65 },
  { m: 100, na: 1.25 },
];
const EYEPIECE = 10;
/** Полево число на окуляра, mm: диаметърът на зрителното поле е FN / увеличението на обектива. */
const FIELD_NUMBER = 18;
const LAMBDA = 0.55; // µm, зелена светлина

const SPECIMENS: { id: Specimen; label: string; size: number; what: string; bg: string }[] = [
  { id: 'onion', label: 'люспа от лук', size: 250, what: 'клетка от лук (дължина)', bg: '#fef9c3' },
  { id: 'cheek', label: 'клетки от бузата', size: 60, what: 'клетка от бузата', bg: '#f0f9ff' },
  { id: 'blood', label: 'кръвна натривка', size: 7.5, what: 'червено кръвно телце', bg: '#fff1f2' },
  { id: 'bacteria', label: 'бактерии от кисело мляко', size: 3, what: 'бактерия (дължина)', bg: '#faf5ff' },
];

// Зрителното поле в SVG: кръг с център (FX, FY) и радиус FR
const FX = 150;
const FY = 140;
const FR = 125;

/** Псевдослучайно число в [0, 1) за клетка (i, j) – еднакво при prerender и в браузъра. */
const hash = (i: number, j: number, k = 0) => {
  const x = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
  return x - Math.floor(x);
};
const fmt = (v: number) => String(Number(v.toPrecision(3))).replace('.', ',');
/** Хубава дължина за мащабната линийка – около една пета от полето. */
const niceBar = (field: number) => [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000].filter(v => v <= field / 4).pop() ?? 1;
const um = (v: number) => (v >= 1000 ? `${fmt(v / 1000)} mm` : `${fmt(v)} µm`);

/**
 * Рисува препарата за зрително поле с диаметър field (µm); s – пиксели на микрометър.
 * Рисуват се само клетките в полето; ако са по-малки от пиксел, препаратът е само оцветен фон.
 */
function specimenShapes(id: Specimen, field: number, s: number): ReactNode[] {
  const out: ReactNode[] = [];
  const half = field / 2 + 10;
  const inField = (x: number, y: number, r: number) => x * x + y * y < (half + r) ** 2;
  const P = (x: number, y: number) => [FX + x * s, FY + y * s] as const;

  if (id === 'onion') {
    // Тухлена зидария от удължени клетки 250 × 60 µm, оцветени с йод (ядрата са по-тъмни)
    const W = 250;
    const H = 60;
    for (let j = Math.floor(-half / H) - 1; j <= half / H + 1; j++) {
      const shift = (j % 2) * (W / 2);
      for (let i = Math.floor(-half / W) - 1; i <= half / W + 1; i++) {
        const x = i * W + shift;
        const y = j * H;
        if (!inField(x + W / 2, y + H / 2, W)) continue;
        const [px, py] = P(x, y);
        const nx = x + W * (0.25 + 0.5 * hash(i, j));
        const [qx, qy] = P(nx, y + H / 2);
        out.push(
          <g key={`${i},${j}`}>
            <rect x={px} y={py} width={W * s} height={H * s} fill="#fde68a" stroke="#b45309" strokeWidth={Math.max(0.3, Math.min(2, 2 * s))} />
            {s * 20 > 1 && <ellipse cx={qx} cy={qy} rx={11 * s} ry={8 * s} fill="#a16207" />}
          </g>
        );
      }
    }
  } else if (id === 'cheek') {
    // Разпилени плоски клетки ~60 µm, оцветени с метиленово синьо
    const G = 90;
    for (let j = Math.floor(-half / G) - 1; j <= half / G + 1; j++) {
      for (let i = Math.floor(-half / G) - 1; i <= half / G + 1; i++) {
        if (hash(i, j, 1) < 0.45) continue;
        const x = (i + hash(i, j, 2) * 0.6) * G;
        const y = (j + hash(i, j, 3) * 0.6) * G;
        if (!inField(x, y, 40)) continue;
        const [px, py] = P(x, y);
        const rot = hash(i, j, 4) * 180;
        out.push(
          <g key={`${i},${j}`} transform={`rotate(${rot.toFixed(1)} ${px.toFixed(2)} ${py.toFixed(2)})`}>
            <ellipse cx={px} cy={py} rx={32 * s} ry={24 * s} fill="#bae6fd" stroke="#0284c7" strokeWidth={Math.max(0.3, Math.min(1.5, s))} opacity="0.85" />
            {s * 8 > 1 && <circle cx={px + 3 * s} cy={py} r={4.5 * s} fill="#1e3a8a" />}
          </g>
        );
      }
    }
  } else if (id === 'blood') {
    // Червени кръвни телца 7,5 µm, тук-там бяло кръвно телце с лилаво ядро
    const G = 10;
    if (7.5 * s < 1.5) return out;
    for (let j = Math.floor(-half / G) - 1; j <= half / G + 1; j++) {
      for (let i = Math.floor(-half / G) - 1; i <= half / G + 1; i++) {
        const x = (i + (hash(i, j, 1) - 0.5) * 0.3) * G;
        const y = (j + (hash(i, j, 2) - 0.5) * 0.3) * G;
        if (!inField(x, y, 10)) continue;
        const [px, py] = P(x, y);
        if (hash(i, j, 3) < 0.004) {
          out.push(
            <g key={`${i},${j}`}>
              <circle cx={px} cy={py} r={6 * s} fill="#ede9fe" />
              <circle cx={px - 1.5 * s} cy={py} r={3.5 * s} fill="#6d28d9" />
            </g>
          );
        } else if (hash(i, j, 5) > 0.2) {
          out.push(
            <g key={`${i},${j}`}>
              <circle cx={px} cy={py} r={3.75 * s} fill="#fb7185" />
              {s > 1 && <circle cx={px} cy={py} r={1.5 * s} fill="#fecdd3" />}
            </g>
          );
        }
      }
    }
  } else {
    // Пръчковидни бактерии ~3 × 1 µm, оцветени с генцианвиолет
    const G = 8;
    if (3 * s < 1.2) return out;
    for (let j = Math.floor(-half / G) - 1; j <= half / G + 1; j++) {
      for (let i = Math.floor(-half / G) - 1; i <= half / G + 1; i++) {
        if (hash(i, j, 1) < 0.3) continue;
        const x = (i + hash(i, j, 2) * 0.7) * G;
        const y = (j + hash(i, j, 3) * 0.7) * G;
        if (!inField(x, y, 4)) continue;
        const a = hash(i, j, 4) * Math.PI;
        const [p1x, p1y] = P(x - 1.5 * Math.cos(a), y - 1.5 * Math.sin(a));
        const [p2x, p2y] = P(x + 1.5 * Math.cos(a), y + 1.5 * Math.sin(a));
        out.push(<line key={`${i},${j}`} x1={p1x} y1={p1y} x2={p2x} y2={p2y} stroke="#7e22ce" strokeWidth={Math.max(0.8, s)} strokeLinecap="round" />);
      }
    }
  }
  return out;
}

/** Виртуален микроскоп: смени обектива и виж колко голямо е зрителното поле и какво се различава в него. */
export default function MicroscopeFieldLab() {
  const [specimen, setSpecimen] = useState<Specimen>('onion');
  const [objective, setObjective] = useState(0);
  const [focus, setFocus] = useState(50);

  const { m, na } = OBJECTIVES[objective];
  const sp = SPECIMENS.find(x => x.id === specimen)!;
  const field = (FIELD_NUMBER / m) * 1000; // µm
  const s = (2 * FR) / field; // пиксели на µm
  const resolution = LAMBDA / (2 * na);
  // При по-голямо увеличение дълбочината на рязкост е по-малка – фокусът е по-чувствителен
  const blur = (Math.abs(focus - 50) * Math.sqrt(m)) / 18;
  const bar = niceBar(field);
  const across = field / sp.size;
  const tooSmall = sp.size * s < 1.5;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 280" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="mic-field">
            <circle cx={FX} cy={FY} r={FR} />
          </clipPath>
          <filter id="mic-blur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={blur.toFixed(2)} />
          </filter>
        </defs>
        <rect x={FX - FR - 15} y={FY - FR - 15} width={2 * FR + 30} height={2 * FR + 30} rx="16" fill="#111827" />
        <g clipPath="url(#mic-field)">
          <circle cx={FX} cy={FY} r={FR} fill={sp.bg} />
          <g filter={blur > 0.05 ? 'url(#mic-blur)' : undefined}>
            {tooSmall && <circle cx={FX} cy={FY} r={FR} fill={specimen === 'blood' ? '#fda4af' : '#d8b4fe'} opacity="0.35" />}
            {specimenShapes(specimen, field, s)}
          </g>
          {/* Мащабна линийка */}
          <rect x={FX - (bar * s) / 2 - 8} y={FY + FR - 42} width={bar * s + 16} height={26} rx="4" fill="white" opacity="0.85" />
          <line x1={FX - (bar * s) / 2} x2={FX + (bar * s) / 2} y1={FY + FR - 34} y2={FY + FR - 34} stroke="#111827" strokeWidth="3" />
          <text x={FX} y={FY + FR - 20} fontSize="11" textAnchor="middle" fill="#111827">
            {um(bar)}
          </text>
        </g>
        <circle cx={FX} cy={FY} r={FR} fill="none" stroke="#374151" strokeWidth="3" />

        {/* Данни вдясно */}
        <g fontSize="13" fill="currentColor">
          <text x={300} y={40} fontSize="15" fontWeight="700">
            {EYEPIECE}× · {m}× = {EYEPIECE * m}×
          </text>
          <text x={300} y={62} className="fill-gray-600 dark:fill-gray-300">
            окуляр · обектив
          </text>
          <text x={300} y={98}>поле: {um(field)}</text>
          <text x={300} y={122}>различава: {um(resolution)}</text>
          <text x={300} y={158}>{sp.what}:</text>
          <text x={300} y={178} fontWeight="700">
            {um(sp.size)}
          </text>
          <text x={300} y={214}>в диаметъра на полето</text>
          <text x={300} y={234}>се нареждат ≈ {across >= 100 ? Math.round(across / 10) * 10 : fmt(across)}</text>
        </g>
      </LabSvg>

      <Buttons>
        {SPECIMENS.map(x => (
          <DiagramButton key={x.id} active={specimen === x.id} onClick={() => setSpecimen(x.id)}>
            {x.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {OBJECTIVES.map((o, i) => (
          <DiagramButton key={o.m} active={objective === i} onClick={() => setObjective(i)}>
            обектив {o.m}×
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label={`Фокус${focus === 50 ? ' ✓' : ''}`} value={focus} onChange={setFocus} min={0} max={100} step={1} />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'увеличение', value: `${EYEPIECE * m}×` },
            { label: 'поле', value: um(field) },
            { label: 'd', value: um(resolution) },
          ]}
        />
      </div>
      <Note tone={tooSmall ? 'amber' : across < 1.5 ? 'violet' : 'emerald'}>
        {tooSmall
          ? `При ${EYEPIECE * m}× ${sp.what === 'бактерия (дължина)' ? 'бактериите' : 'кръвните телца'} са твърде малки – виждаш само оцветено петно. Смени с по-силен обектив.`
          : across < 1.5
            ? 'Една клетка е по-голяма от цялото поле – за нея е по-удобно по-слабо увеличение.'
            : `Размерът на клетката ≈ поле : брой клетки = ${um(field)} : ${across >= 100 ? Math.round(across / 10) * 10 : fmt(across)} ≈ ${um(sp.size)}.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Окулярът е 10× с полево число 18 mm: зрителното поле е 18 mm : (увеличение на обектива). Започвай винаги със слабия обектив и
        фокусирай – при 40× и 100× фокусът е много по-чувствителен. Обективът 100× се ползва с имерсионно масло. Размерите на клетките са
        типични, в природата варират.
      </p>
    </div>
  );
}
