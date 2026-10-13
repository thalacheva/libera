import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum, pow10, sig } from '~/physics/sim';

const R = 8.314;

const GASES = [
  { name: 'H₂', M: 0.002 },
  { name: 'He', M: 0.004 },
  { name: 'N₂', M: 0.028 },
  { name: 'O₂', M: 0.032 },
  { name: 'CO₂', M: 0.044 },
];

// Втора космическа скорост, m/s
const BODIES = [
  { name: 'без', v: 0 },
  { name: 'Земята', v: 11200 },
  { name: 'Марс', v: 5000 },
  { name: 'Луната', v: 2400 },
];

/** Най-вероятната скорост vₚ = √(2RT/M). */
const vProb = (T: number, M: number) => Math.sqrt((2 * R * T) / M);

/** Разпределение на Максуел по скорости (плътност на вероятността) – чрез x = v/vₚ. */
const maxwell = (v: number, vp: number) => (4 / Math.sqrt(Math.PI)) * (v * v) / vp ** 3 * Math.exp(-((v / vp) ** 2));

/** log₁₀ от частта на молекулите, по-бързи от v (x = v/vₚ). При голямо x – асимптотика, за да няма препълване. */
function tailLog10(x: number) {
  if (x < 3) {
    // Приближение на Абрамовиц–Стегун за erfc
    const t = 1 / (1 + 0.3275911 * x);
    const erfc = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x);
    return Math.log10(erfc + ((2 * x) / Math.sqrt(Math.PI)) * Math.exp(-x * x));
  }
  const rest = (2 * x) / Math.sqrt(Math.PI) + (1 - 1 / (2 * x * x) + 3 / (4 * x ** 4)) / (x * Math.sqrt(Math.PI));
  return -x * x * Math.LOG10E + Math.log10(rest);
}

/** Частта като текст: проценти или степен на 10. */
function share(log: number) {
  if (log > -2) return `${fmtNum(100 * 10 ** log, 1)}%`;
  if (log > -300) return sig(10 ** log, 2);
  return `≈ ${pow10(Math.round(log))}`;
}

const P = { x0: 44, x1: 466, y0: 22, y1: 196 };

/** Разпределение на молекулите по скорости при различни газове и температури. */
export default function SpeedDistributionLab() {
  const [g, setG] = useState(2);
  const [T, setT] = useState(300);
  const [b, setB] = useState(0);
  const gas = GASES[g];
  const body = BODIES[b];
  const vp = vProb(T, gas.M);
  const vp300 = vProb(300, gas.M);
  const mean = vp * (2 / Math.sqrt(Math.PI));
  const rms = vp * Math.sqrt(1.5);

  // Мащаб: да се виждат и двете криви, и линията v₂/6
  const need = Math.max(3.2 * vp, 3.2 * vp300, body.v ? (body.v / 6) * 1.15 : 0);
  const stepX = need > 6000 ? 2000 : need > 3000 ? 1000 : 500;
  const vMax = Math.ceil(need / stepX) * stepX;
  const peak = (p: number) => maxwell(p, p);
  const yMax = 1.12 * Math.max(peak(vp), peak(vp300));
  const px = (v: number) => P.x0 + (v / vMax) * (P.x1 - P.x0);
  const py = (f: number) => P.y1 - (f / yMax) * (P.y1 - P.y0);
  const path = (p: number) =>
    Array.from({ length: 161 }, (_, i) => (i / 160) * vMax)
      .map((v, i) => `${i ? 'L' : 'M'} ${px(v).toFixed(1)} ${py(maxwell(v, p)).toFixed(1)}`)
      .join(' ');

  const marks = [
    { v: vp, name: 'vₚ', tone: 'fill-violet-600 dark:fill-violet-400', stroke: 'stroke-violet-500', dy: 0 },
    { v: mean, name: '⟨v⟩', tone: 'fill-emerald-600 dark:fill-emerald-400', stroke: 'stroke-emerald-500', dy: 13 },
    { v: rms, name: 'v ск', tone: 'fill-rose-600 dark:fill-rose-400', stroke: 'stroke-rose-500', dy: 26 },
  ];
  const kept = body.v > 0 && 6 * rms < body.v;
  const tail = body.v > 0 ? tailLog10(body.v / vp) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {GASES.map((x, i) => (
          <DiagramButton key={x.name} active={i === g} onClick={() => setG(i)}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 228">
        <line x1={P.x0} y1={P.y1} x2={P.x1} y2={P.y1} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={P.x0} y1={P.y1} x2={P.x0} y2={P.y0} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {Array.from({ length: vMax / stepX + 1 }, (_, i) => i * stepX).map(v => (
          <g key={v}>
            <line x1={px(v)} y1={P.y1} x2={px(v)} y2={P.y1 + 4} className="stroke-gray-400 dark:stroke-gray-500" />
            <Label p={{ x: px(v), y: P.y1 + 14 }} size={10} weight={500}>
              {fmtNum(v)}
            </Label>
          </g>
        ))}
        <Label p={{ x: P.x1, y: P.y1 + 28 }} size={11} anchor="end">
          v, m/s
        </Label>
        <Label p={{ x: P.x0 + 6, y: P.y0 - 8 }} size={11} anchor="start">
          дял на молекулите
        </Label>

        {T !== 300 && <path d={path(vp300)} fill="none" className="stroke-gray-400" strokeWidth="1.5" strokeDasharray="5 4" />}
        <path d={`${path(vp)} L ${px(vMax)} ${P.y1} L ${P.x0} ${P.y1} Z`} className="fill-blue-500/15" />
        <path d={path(vp)} fill="none" className="stroke-blue-500" strokeWidth="3" />
        {marks.map(m => (
          <g key={m.name}>
            <line x1={px(m.v)} y1={P.y1} x2={px(m.v)} y2={P.y0 + 8 + m.dy} className={m.stroke} strokeWidth="1.5" strokeDasharray="3 3" />
            <text x={px(m.v) + 3} y={P.y0 + 8 + m.dy} fontSize={11} fontWeight={600} dominantBaseline="central" className={m.tone}>
              {m.name}
            </text>
          </g>
        ))}
        {body.v > 0 && (
          <>
            <line x1={px(body.v / 6)} y1={P.y1} x2={px(body.v / 6)} y2={P.y0 + 50} className="stroke-amber-500" strokeWidth="2" />
            <Label p={{ x: px(body.v / 6) - 4, y: P.y0 + 44 }} size={10} tone="amber" anchor="end">
              {`v₂/6 (${body.name})`}
            </Label>
          </>
        )}
        {T !== 300 && (
          <Label p={{ x: P.x1, y: P.y0 + 6 }} size={10} anchor="end">
            пунктир – при 300 K
          </Label>
        )}
      </ZoomingSvg>

      <Sliders>
        <Slider label="T, K" value={T} onChange={setT} min={50} max={1500} step={10} tone="rose" />
      </Sliders>
      <Buttons>
        {BODIES.map((x, i) => (
          <DiagramButton key={x.name} active={i === b} onClick={() => setB(i)}>
            {i === 0 ? 'без планета' : x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'vₚ =', value: `${fmtNum(vp, 0)} m/s`, tone: 'violet' },
            { label: '⟨v⟩ =', value: `${fmtNum(mean, 0)} m/s`, tone: 'emerald' },
            { label: 'v ск =', value: `${fmtNum(rms, 0)} m/s`, tone: 'rose' },
            ...(body.v > 0 ? [{ label: `по-бързи от ${fmtNum(body.v / 1000, 1)} km/s:`, value: share(tail), tone: 'amber' as const }] : []),
          ]}
        />
      </div>
      <Note tone={body.v === 0 ? 'gray' : kept ? 'emerald' : 'rose'}>
        {body.v === 0
          ? 'По-високата температура разлива кривата надясно; по-леките молекули са по-бързи при същата температура.'
          : kept
            ? `${gas.name} се задържа: 6·v ск = ${fmtNum((6 * rms) / 1000, 1)} km/s е под втората космическа скорост на ${body.name}.`
            : `${gas.name} постепенно бяга: 6·v ск = ${fmtNum((6 * rms) / 1000, 1)} km/s надминава втората космическа скорост.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Площта под кривата е 1 (всички молекули). vₚ е най-вероятната скорост, ⟨v⟩ – средната, а v ск – средната квадратична, която
        участва в енергията. Грубото правило е, че газ се задържа милиарди години, ако 6·v ск е под втората космическа скорост – но бягат
        и молекулите от далечната „опашка“ на кривата. Горните слоеве на атмосферата са много по-горещи от повърхността (около 1000 K).
      </p>
    </div>
  );
}
