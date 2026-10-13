import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow } from '../SimControls';
import { fmtNum, sig } from '../sim';

const G = 9.8;
const CAR = 1200;
const P0 = 101.3; // атмосферно налягане, kPa

/** Хидравлична преса: налягането се предава еднакво, затова малка сила на малко бутало повдига кола. */
function Press() {
  const [S1, setS1] = useState(5);
  const [S2, setS2] = useState(500);
  const [s1, setS1Push] = useState(20);

  const F2 = CAR * G;
  const F1 = (F2 * S1) / S2;
  const s2 = (s1 * S1) / S2;
  const p = F2 / (S2 * 1e-4);

  const level = 150;
  const k = 1.6; // пиксела на сантиметър ход
  const w1 = 8 * Math.sqrt(S1);
  const w2 = 5 * Math.sqrt(S2);
  const left = { x: 110, y: level + s1 * k };
  const right = { x: 330, y: level - s2 * k };

  return (
    <>
      <ZoomingSvg viewBox="0 0 480 280">
        {/* Течността: двата цилиндъра и тръбата между тях */}
        <rect x={left.x - w1 / 2} y={left.y} width={w1} height={250 - left.y} className="fill-amber-300/60" />
        <rect x={right.x - w2 / 2} y={right.y} width={w2} height={250 - right.y} className="fill-amber-300/60" />
        <rect x={left.x} y={232} width={right.x - left.x} height={18} className="fill-amber-300/60" />
        <g className="stroke-gray-500" strokeWidth="2.5" fill="none">
          <polyline points={`${left.x - w1 / 2},70 ${left.x - w1 / 2},252 ${right.x + w2 / 2},252 ${right.x + w2 / 2},110`} />
          <polyline points={`${left.x + w1 / 2},70 ${left.x + w1 / 2},230 ${right.x - w2 / 2},230 ${right.x - w2 / 2},110`} />
        </g>
        {/* Буталата */}
        <rect x={left.x - w1 / 2} y={left.y - 8} width={w1} height={8} className="fill-gray-600" />
        <rect x={right.x - w2 / 2} y={right.y - 8} width={w2} height={8} className="fill-gray-600" />
        <text x={right.x} y={right.y - 26} fontSize={36} textAnchor="middle" dominantBaseline="central">
          🚗
        </text>
        <Arrow from={{ x: left.x, y: left.y - 70 }} to={{ x: left.x, y: left.y - 10 }} tone="rose" label="" />
        <Label p={{ x: left.x + 16, y: left.y - 50 }} size={12} tone="rose" anchor="start">
          {`F₁ = ${fmtNum(F1, 0)} N`}
        </Label>
        <line x1={20} y1={level} x2={460} y2={level} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="4 4" />
        <Label p={{ x: left.x, y: 268 }} size={11}>
          {`S₁ = ${S1} cm²`}
        </Label>
        <Label p={{ x: right.x, y: 268 }} size={11}>
          {`S₂ = ${S2} cm²`}
        </Label>
        <Label p={{ x: right.x + w2 / 2 + 8, y: right.y - 30 }} size={11} anchor="start" tone="blue">
          {`${CAR} kg`}
        </Label>
      </ZoomingSvg>
      <Sliders>
        <Slider label="S₁, cm²" value={S1} onChange={setS1} min={2} max={20} step={1} tone="rose" />
        <Slider label="S₂, cm²" value={S2} onChange={setS2} min={100} max={1000} step={50} tone="blue" />
        <Slider label="ход, cm" value={s1} onChange={setS1Push} min={0} max={50} step={1} tone="amber" />
      </Sliders>
      <div className="mt-3 space-y-2">
        <Readout
          items={[
            { label: 'p =', value: `${fmtNum(p / 1000, 1)} kPa` },
            { label: 'F₂ : F₁ =', value: fmtNum(S2 / S1, 1), tone: 'blue' },
            { label: 'колата се вдига с', value: `${fmtNum(s2, 2)} cm`, tone: 'blue' },
          ]}
        />
        <Readout
          items={[
            { label: 'A₁ = F₁s₁ =', value: `${fmtNum(F1 * s1 / 100, 1)} J`, tone: 'rose' },
            { label: 'A₂ = F₂s₂ =', value: `${fmtNum(F2 * s2 / 100, 1)} J`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone="emerald">Печелим сила, но губим път: работата от двете страни е една и съща.</Note>
    </>
  );
}

const WATERS = [
  { name: 'прясна вода', rho: 1000 },
  { name: 'морска вода', rho: 1025 },
];

/** Налягане под водата: на всеки около 10 m прибавяме още една атмосфера. */
function Depth() {
  const [h, setH] = useState(10);
  const [wi, setWi] = useState(1);
  const rho = WATERS[wi].rho;
  const p = P0 + (rho * G * h) / 1000;
  // Балон с 1 L въздух при повърхността се свива обратно пропорционално на налягането
  const V = P0 / p;

  const top = 30;
  const scale = 5; // пиксела на метър
  const y = top + h * scale;
  // Стрелка на манометъра: 0–600 kPa на 240°
  const angle = (-210 + (Math.min(p, 600) / 600) * 240) * (Math.PI / 180);
  const dial = { x: 370, y: 120 };

  return (
    <>
      <Buttons>
        {WATERS.map((w, i) => (
          <DiagramButton key={w.name} active={i === wi} onClick={() => setWi(i)}>
            {w.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 260">
        <rect x={30} y={top} width={220} height={40 * scale} className="fill-sky-500/25" />
        <line x1={30} y1={top} x2={250} y2={top} className="stroke-sky-600" strokeWidth="2" />
        {[0, 10, 20, 30, 40].map(d => (
          <g key={d}>
            <line x1={24} y1={top + d * scale} x2={30} y2={top + d * scale} className="stroke-gray-500" />
            <Label p={{ x: 20, y: top + d * scale }} size={10} anchor="end">
              {`${d} m`}
            </Label>
          </g>
        ))}
        <text x={110} y={y} fontSize={26} textAnchor="middle" dominantBaseline="central">
          🤿
        </text>
        <circle cx={190} cy={y} r={14 * Math.cbrt(V)} className="fill-rose-400/70 stroke-rose-600" strokeWidth="1.5" />
        <Label p={{ x: 190, y: y + 14 * Math.cbrt(V) + 12 }} size={10} tone="rose">
          {`${fmtNum(V, 2)} L`}
        </Label>

        {/* Манометър */}
        <circle cx={dial.x} cy={dial.y} r={70} className="fill-gray-50 stroke-gray-500 dark:fill-gray-900" strokeWidth="3" />
        {[0, 100, 200, 300, 400, 500, 600].map(v => {
          const a = (-210 + (v / 600) * 240) * (Math.PI / 180);
          return (
            <g key={v}>
              <line x1={dial.x + 58 * Math.cos(a)} y1={dial.y + 58 * Math.sin(a)} x2={dial.x + 68 * Math.cos(a)} y2={dial.y + 68 * Math.sin(a)} className="stroke-gray-600" strokeWidth="2" />
              <Label p={{ x: dial.x + 46 * Math.cos(a), y: dial.y + 46 * Math.sin(a) }} size={10} weight={500}>
                {String(v)}
              </Label>
            </g>
          );
        })}
        <line x1={dial.x} y1={dial.y} x2={dial.x + 52 * Math.cos(angle)} y2={dial.y + 52 * Math.sin(angle)} className="stroke-rose-600" strokeWidth="3" strokeLinecap="round" />
        <circle cx={dial.x} cy={dial.y} r={5} className="fill-rose-600" />
        <Label p={{ x: dial.x, y: dial.y + 34 }} size={11}>
          kPa
        </Label>
      </ZoomingSvg>
      <Sliders>
        <Slider label="h, m" value={h} onChange={setH} min={0} max={40} step={1} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'ρgh =', value: `${fmtNum((rho * G * h) / 1000, 1)} kPa`, tone: 'blue' },
            { label: 'p =', value: `${fmtNum(p, 1)} kPa`, tone: 'rose' },
            { label: '≈', value: `${sig(p / P0, 3)} atm` },
          ]}
        />
      </div>
      <Note tone="blue">На всеки около 10 m вода налягането нараства с още една атмосфера. Затова балонът на 10 m е наполовина.</Note>
    </>
  );
}

export default function HydraulicLab() {
  const [mode, setMode] = useState(0);
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 0} onClick={() => setMode(0)}>
          Хидравлична преса
        </DiagramButton>
        <DiagramButton active={mode === 1} onClick={() => setMode(1)}>
          Налягане под водата
        </DiagramButton>
      </Buttons>
      {mode === 0 ? <Press /> : <Depth />}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 {mode === 0
          ? 'Натискаме малкото бутало със сила F₁. Налягането p = F₁/S₁ се предава във всички посоки и бута голямото бутало със сила F₂ = p·S₂. Течността не се свива, затова обемът, изтласкан отляво, влиза отдясно: S₁s₁ = S₂s₂.'
          : 'Налягането на дълбочина h е p = p₀ + ρgh, където p₀ ≈ 101 kPa е атмосферното. Въздухът в балона се свива при по-голямо налягане – затова гмуркачите изравняват налягането в ушите си.'}
      </p>
    </div>
  );
}
