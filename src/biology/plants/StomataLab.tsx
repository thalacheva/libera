import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

type Co2 = 'low' | 'normal' | 'high';
const CO2_NAME: Record<Co2, string> = { low: 'малко CO₂', normal: 'нормално CO₂', high: 'много CO₂' };

/** Колко е отворено устицето (0…1). */
function opening(light: boolean, co2: Co2, aba: boolean) {
  let o = light ? 0.85 : 0.08;
  if (co2 === 'low') o += 0.15;
  if (co2 === 'high') o *= 0.45;
  if (aba) o *= 0.06;
  return Math.min(1, o);
}

/** Примерни гъстоти на устицата, броя на mm² (приблизителни стойности от учебниците). */
const LEAVES = [
  { name: 'слънчоглед', upper: 175, lower: 325 },
  { name: 'царевица', upper: 98, lower: 108 },
  { name: 'дъб', upper: 0, lower: 340 },
  { name: 'водна роза', upper: 460, lower: 0 },
];

/** Зрително поле с диаметър 0,45 mm (окуляр с поле 18 mm и обектив 40×). */
const FIELD_D = 0.45;
const FIELD_AREA = Math.PI * (FIELD_D / 2) ** 2; // mm²

/** Псевдослучайни числа с начало seed – еднакви при сървъра и в браузъра. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Устицата в зрителното поле: n точки в кръг с радиус rad, без застъпване. */
function field(density: number, seed: number, rad: number) {
  const r = rng(seed);
  // броят варира около очаквания (±10 %)
  const n = Math.round(density * FIELD_AREA * (0.9 + 0.2 * r()));
  const pts: { x: number; y: number; a: number }[] = [];
  let tries = 0;
  while (pts.length < n && tries < 20000) {
    tries++;
    const x = (2 * r() - 1) * rad;
    const y = (2 * r() - 1) * rad;
    if (x * x + y * y > (rad - 6) ** 2) continue;
    if (pts.some(p => (p.x - x) ** 2 + (p.y - y) ** 2 < 13 ** 2)) continue;
    pts.push({ x, y, a: r() * 180 });
  }
  return pts;
}

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',').replace('-', '−');
const RT = 2.437; // L·MPa/mol при 20 °C

// Двете затварящи клетки: бъбреци, които се извиват навън, когато тургорът расте
function GuardCells({ o }: { o: number }) {
  const cx = 160;
  const cy = 135;
  const gap = 3 + 22 * o; // половин ширина на отвора
  const len = 78;
  const kidney = (sd: number) => {
    const inner = cx + sd * gap;
    const outer = cx + sd * (gap + 34 - 6 * o);
    return `M ${cx} ${cy - len} C ${inner} ${cy - len * 0.55}, ${inner} ${cy + len * 0.55}, ${cx} ${cy + len} C ${outer + sd * 8} ${cy + len * 0.75}, ${outer + sd * 8} ${cy - len * 0.75}, ${cx} ${cy - len} Z`;
  };
  const k = Math.round(3 + 14 * o);
  return (
    <g>
      {/* съседните клетки на епидермиса */}
      <path d="M 20 20 L 110 30 L 160 50 L 210 30 L 300 20 L 300 250 L 210 240 L 160 220 L 110 240 L 20 250 Z" className="fill-lime-50 dark:fill-lime-950" stroke="#84cc16" />
      {/* отворът */}
      <ellipse cx={cx} cy={cy} rx={gap + 0.5} ry={len * 0.6} fill="#0f172a" opacity={0.8} />
      {[-1, 1].map(sd => (
        <g key={sd}>
          <path d={kidney(sd)} fill="#bbf7d0" stroke="#15803d" strokeWidth={2} />
          {/* по-дебелата вътрешна стена */}
          <path d={`M ${cx} ${cy - len + 6} C ${cx + sd * gap} ${cy - len * 0.5}, ${cx + sd * gap} ${cy + len * 0.5}, ${cx} ${cy + len - 6}`} fill="none" stroke="#166534" strokeWidth={5} opacity={0.6} />
          {/* хлоропласти */}
          {[-40, -12, 16, 42].map(dy => (
            <ellipse key={dy} cx={cx + sd * (gap + 20 - 3 * o)} cy={cy + dy} rx={5} ry={3} fill="#16a34a" />
          ))}
          {/* K⁺ */}
          {Array.from({ length: k }, (_, i) => (
            <text key={i} x={cx + sd * (gap + 12 + (i % 2) * 14)} y={cy - 52 + i * (104 / Math.max(k, 1))} fontSize="9" fontWeight="700" fill="#7c3aed" textAnchor="middle">
              K⁺
            </text>
          ))}
        </g>
      ))}
    </g>
  );
}

/** Устица: затварящите клетки с K⁺ и тургор; броене на устицата под микроскоп. */
export default function StomataLab() {
  const [light, setLight] = useState(true);
  const [co2, setCo2] = useState<Co2>('normal');
  const [aba, setAba] = useState(false);
  const [leaf, setLeaf] = useState(0);
  const [lower, setLower] = useState(true);
  const [shown, setShown] = useState(false);

  const o = opening(light, co2, aba);
  const width = 0.5 + 9.5 * o; // µm
  const kConc = 100 + 400 * o; // mM в затварящите клетки
  const psiS = (-2 * kConc * RT) / 1000; // K⁺ и равен брой аниони

  const L = LEAVES[leaf];
  const density = lower ? L.lower : L.upper;
  const RAD = 105;
  const pts = field(density, 7 + leaf * 31 + (lower ? 3 : 0), RAD);
  const measured = pts.length / FIELD_AREA;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 270" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <GuardCells o={o} />
        <text x={160} y={266} fontSize="12" textAnchor="middle" fill="currentColor">
          отвор ≈ {fmt(width)} µm
        </text>
        {/* зрителното поле */}
        <g transform="translate(480 132)">
          <circle r={RAD + 4} fill="#0f172a" />
          <circle r={RAD} className="fill-lime-50 dark:fill-lime-950" />
          {pts.map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.a})`}>
              <ellipse rx={4.5} ry={2.6} fill="#22c55e" stroke="#15803d" strokeWidth={0.8} />
              <line x1={-3} x2={3} y1={0} y2={0} stroke="#14532d" strokeWidth={0.8} />
            </g>
          ))}
          {pts.length === 0 && (
            <text y={4} fontSize="12" textAnchor="middle" className="fill-gray-500">
              няма устица
            </text>
          )}
        </g>
        <text x={480} y={266} fontSize="12" textAnchor="middle" fill="currentColor">
          {L.name}, {lower ? 'долна' : 'горна'} страна · поле {fmt(FIELD_D, 2)} mm
        </text>
      </LabSvg>

      <Buttons>
        <DiagramButton active={light} onClick={() => setLight(l => !l)}>
          {light ? '☀️ светло' : '🌙 тъмно'}
        </DiagramButton>
        {(Object.keys(CO2_NAME) as Co2[]).map(c => (
          <DiagramButton key={c} active={co2 === c} onClick={() => setCo2(c)}>
            {CO2_NAME[c]}
          </DiagramButton>
        ))}
        <DiagramButton active={aba} onClick={() => setAba(a => !a)}>
          {aba ? '🏜️ суша (АБК)' : 'достатъчно вода'}
        </DiagramButton>
      </Buttons>
      <Readout
        items={[
          { label: 'K⁺', value: `${Math.round(kConc)} mM`, tone: 'violet' },
          { label: 'Ψs', value: `${fmt(psiS, 2)} MPa`, tone: 'blue' },
          { label: 'отвор', value: `${fmt(width)} µm`, tone: 'emerald' },
        ]}
      />
      <Note tone="violet">
        {aba
          ? 'При суша корените и листата отделят абсцисинова киселина (АБК). Тя изпуска K⁺ от затварящите клетки, водата излиза след него и устицето се затваря – дори на светло.'
          : !light
            ? 'На тъмно помпите спират, K⁺ излиза, клетките губят вода и се отпускат – устицето се затваря.'
            : co2 === 'high'
              ? 'Много CO₂ в листа – растението има достатъчно за фотосинтезата и притваря устицата, за да пести вода.'
              : 'Синята светлина пуска протонните помпи; в затварящите клетки влиза K⁺, Ψ пада, влиза вода и тургорът ги извива навън.'}
      </Note>

      <Buttons>
        {LEAVES.map((l, i) => (
          <DiagramButton key={l.name} active={leaf === i} onClick={() => { setLeaf(i); setShown(false); }}>
            {l.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={!lower} onClick={() => { setLower(false); setShown(false); }}>
          горна страна
        </DiagramButton>
        <DiagramButton active={lower} onClick={() => { setLower(true); setShown(false); }}>
          долна страна
        </DiagramButton>
        <DiagramButton active={shown} onClick={() => setShown(s => !s)}>
          {shown ? 'скрий отговора' : 'преброих – покажи'}
        </DiagramButton>
      </Buttons>
      {shown && (
        <Formula>
          {pts.length} устица / {fmt(FIELD_AREA, 3)} mm² ≈ {Math.round(measured)} на mm² (по учебник ≈ {density})
        </Formula>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Затварящите клетки имат по-дебела вътрешна стена и пръстени от целулозни влакна – затова, когато се напълнят с вода, не
        се издуват равномерно, а се извиват като бъбреци и между тях се отваря процеп. Преброй устицата в зрителното поле и раздели
        на площта му <span className="whitespace-nowrap">π · (0,225 mm)² ≈ 0,159 mm²</span>. Гъстотите са приблизителни и
        зависят от сорта и условията. Сравни сухоземните растения с водната роза, чиито листа лежат върху водата.
      </p>
    </div>
  );
}
