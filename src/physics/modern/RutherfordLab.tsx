import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

// Мащаб: 1 fm = S пиксела, ядрото е в C
const C = { x: 270, y: 150 };
const S = 1.5;
const KE2 = 1.44; // ke², MeV·fm
const BEAM = [-60, -48, -36, -26, -18, -12, -7, -3, 3, 7, 12, 18, 26, 36, 48, 60]; // прицелни параметри, fm

type Target = 'Au' | 'Ag' | 'Al';
const TARGETS: { id: Target; name: string; Z: number; A: number }[] = [
  { id: 'Au', name: 'злато', Z: 79, A: 197 },
  { id: 'Ag', name: 'сребро', Z: 47, A: 108 },
  { id: 'Al', name: 'алуминий', Z: 13, A: 27 },
];

/**
 * Траектория на α-частица в отблъскващото кулоново поле на ядрото (в fm) – хипербола.
 * В полярни координати около ядрото 1/r = sin φ / b − d (1 + cos φ) / (2b²): частицата идва
 * отляво (φ = π) и излиза под ъгъл θ, за който tg(θ/2) = d/(2b). d е най-малкото разстояние при челен удар.
 */
function trajectory(b: number, d: number): [number, number][] {
  if (b === 0) return [[-240, 0], [-d, 0]];
  const s = Math.sign(b);
  const B = Math.abs(b);
  const theta = 2 * Math.atan(d / (2 * B));
  const pts: [number, number][] = [];
  for (let i = 1; i < 600; i++) {
    const phi = Math.PI - (i / 600) * (Math.PI - theta);
    const u = Math.sin(phi) / B - (d * (1 + Math.cos(phi))) / (2 * B * B);
    if (u <= 0) continue;
    const r = 1 / u;
    if (r > 260) continue;
    pts.push([r * Math.cos(phi), s * r * Math.sin(phi)]);
  }
  return pts;
}

const toPath = (pts: [number, number][]) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${(C.x + x * S).toFixed(1)} ${(C.y - y * S).toFixed(1)}`).join(' ');

/** Опитът на Гайгер и Марсдън: α-частици се разсейват от ядро – повечето почти не се отклоняват. */
export default function RutherfordLab() {
  const [target, setTarget] = useState<Target>('Au');
  const [E, setE] = useState(5); // MeV
  const [b, setB] = useState(10); // fm
  const t = TARGETS.find(x => x.id === target)!;
  const d = (KE2 * 2 * t.Z) / E; // най-малко разстояние при челен удар, fm
  const R = 1.2 * (Math.cbrt(t.A) + Math.cbrt(4)); // ядрото и α-частицата се допират, fm

  const beam = useMemo(() => BEAM.map(bb => toPath(trajectory(bb, d))), [d]);
  const main = useMemo(() => toPath(trajectory(b, d)), [b, d]);

  const theta = b === 0 ? 180 : (2 * Math.atan(d / (2 * b)) * 180) / Math.PI;
  const rMin = (d / 2) * (1 + Math.sqrt(1 + ((2 * b) / d) ** 2));
  const touches = rMin < R;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {TARGETS.map(x => (
          <DiagramButton key={x.id} active={x.id === target} onClick={() => setTarget(x.id)}>
            {`${x.name} (Z = ${x.Z})`}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 300">
        <defs>
          <radialGradient id="rutherford-nucleus">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#e11d48" />
          </radialGradient>
        </defs>
        {/* Снопът α-частици */}
        {beam.map((p, i) => (
          <path key={i} d={p} fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1.2" />
        ))}
        {/* Най-малкото разстояние за избраната частица */}
        <circle cx={C.x} cy={C.y} r={rMin * S} fill="none" className="stroke-violet-400" strokeWidth="1" strokeDasharray="3 3" />
        <path d={main} fill="none" className="stroke-blue-500" strokeWidth="2.5" />
        <circle cx={C.x} cy={C.y} r={Math.max(2.5, 1.2 * Math.cbrt(t.A) * S)} fill="url(#rutherford-nucleus)" />
        {/* Прицелният параметър */}
        <line x1={24} y1={C.y} x2={C.x} y2={C.y} className="stroke-gray-400" strokeWidth="1" strokeDasharray="2 4" />
        {b > 3 && (
          <>
            <line x1={40} y1={C.y} x2={40} y2={C.y - b * S} className="stroke-blue-500" strokeWidth="1.5" />
            <Label p={{ x: 52, y: C.y - (b * S) / 2 }} size={12} tone="blue" anchor="start">
              b
            </Label>
          </>
        )}
        <Label p={{ x: C.x, y: C.y + 22 }} size={11} tone="rose">
          ядро
        </Label>
        <Label p={{ x: 470, y: 288 }} size={10} anchor="end">
          20 fm
        </Label>
        <line x1={470 - 20 * S} y1={276} x2={470} y2={276} className="stroke-gray-500" strokeWidth="2" />
      </ZoomingSvg>

      <Sliders>
        <Slider label="E, MeV" value={E} onChange={setE} min={2} max={10} step={0.5} tone="amber" />
        <Slider label="b, fm" value={b} onChange={setB} min={0} max={60} step={1} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'd =', value: `${fmtNum(d, 1)} fm`, tone: 'amber' },
            { label: 'θ =', value: `${fmtNum(theta, 1)}°`, tone: 'blue' },
            { label: 'r_min =', value: `${fmtNum(rMin, 1)} fm`, tone: 'violet' },
            { label: 'R_ядро + R_α ≈', value: `${fmtNum(R, 1)} fm`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={touches ? 'rose' : 'violet'}>
        {touches
          ? 'Частицата стига до самото ядро – тук освен кулоновото отблъскване действат и ядрените сили и формулата на Ръдърфорд вече не важи.'
          : `Отклонение над 90° имат само частиците с b < d/2 = ${fmtNum(d / 2, 1)} fm. Атомът е десетки хиляди пъти по-голям от ядрото – повечето частици минават далеч от ядрото.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Сивите линии са сноп α-частици с различни прицелни параметри b – разстоянието, на което частицата би подминала ядрото, ако
        то не я отблъскваше. Синята е избраната частица, пунктирът – най-близкото ѝ разстояние до ядрото. Пробвай b = 0 (челен удар) и по-ниска
        енергия. При алуминия и висока енергия частиците стигат до ядрото – така по-късно е оценен размерът на ядрата.
      </p>
    </div>
  );
}
