import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum, sig } from '../sim';

const G = 9.81;

// m – маса, v – скорост преди спирането, hard – време за спиране при твърд удар (ms)
const CASES = [
  { name: '🥚 яйце от 1 m', m: 0.06, v: Math.sqrt(2 * G), hard: 1, soft: 'Пусни го върху възглавница: около 50 ms.' },
  { name: '🦵 скок от 1 m', m: 70, v: Math.sqrt(2 * G), hard: 10, soft: 'Със свити колене спирането трае около 0,2 s.' },
  { name: '🚗 удар при 50 km/h', m: 70, v: 50 / 3.6, hard: 10, soft: 'С колан и въздушна възглавница спирането трае около 0,1–0,15 s.' },
];

const L = 58;
const R = 462;
const TOP = 16;
const BOTTOM = 196;

/** Едно и също изменение на импулса, но различно време: колкото по-дълго спираме, толкова по-малка е силата. */
export default function AirbagLab() {
  const [k, setK] = useState(0);
  const C = CASES[k];
  const [ms, setMs] = useState(C.hard);
  const dt = ms / 1000;
  const dp = C.m * C.v;
  const avg = dp / dt;
  // Силата расте и намалява плавно (половин синусоида): лицето под нея е Δp
  const peak = (Math.PI * dp) / (2 * dt);
  const hardPeak = (Math.PI * dp) / (2 * (C.hard / 1000));

  const tMax = Math.max(ms, C.hard) * 1.15;
  const fMax = Math.max(peak, hardPeak) * 1.1;
  const tx = (t: number) => L + (t / tMax) * (R - L);
  const fy = (f: number) => BOTTOM - (f / fMax) * (BOTTOM - TOP);
  const curve = (len: number, top: number) =>
    Array.from({ length: 81 }, (_, i) => {
      const t = (i / 80) * len;
      return `${tx(t).toFixed(1)},${fy(top * Math.sin((Math.PI * t) / len)).toFixed(1)}`;
    }).join(' ');

  const choose = (i: number) => {
    setK(i);
    setMs(CASES[i].hard);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {CASES.map((c, i) => (
          <DiagramButton key={c.name} active={i === k} onClick={() => choose(i)}>
            {c.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 230">
        <line x1={L} y1={BOTTOM} x2={R} y2={BOTTOM} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={L} y1={BOTTOM} x2={L} y2={TOP} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <Label p={{ x: L + 6, y: TOP + 4 }} size={11} anchor="start">
          F, N
        </Label>
        <Label p={{ x: L - 6, y: fy(fMax / 1.1) }} size={10} anchor="end">
          {sig(fMax / 1.1, 2)}
        </Label>
        <Label p={{ x: L - 6, y: BOTTOM }} size={10} anchor="end">
          0
        </Label>
        {[0.25, 0.5, 0.75, 1].map(f => (
          <Label key={f} p={{ x: tx(tMax * f), y: BOTTOM + 13 }} size={10} weight={500}>
            {fmtNum(tMax * f, tMax < 10 ? 1 : 0)}
          </Label>
        ))}
        <Label p={{ x: R, y: BOTTOM + 27 }} size={11} anchor="end">
          t, ms
        </Label>
        {/* Твърдият удар – за сравнение */}
        {ms !== C.hard && <polyline points={curve(C.hard, hardPeak)} fill="none" className="stroke-gray-400" strokeWidth="2" strokeDasharray="4 3" />}
        <polygon points={`${tx(0)},${BOTTOM} ${curve(ms, peak)} ${tx(ms)},${BOTTOM}`} className="fill-blue-500/25 stroke-blue-500" strokeWidth="2.5" />
        <Label p={{ x: tx(ms / 2), y: Math.max(fy(peak / 2), TOP + 30) }} size={12} tone="blue">
          {`Δp = ${fmtNum(dp, 2)} N·s`}
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="Δt, ms" value={ms} onChange={setMs} min={1} max={300} step={1} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'средна сила', value: `${sig(avg, 3)} N`, tone: 'blue' },
            { label: 'най-голяма', value: `${sig(peak, 3)} N` },
            { label: 'забавяне', value: `${sig(C.v / dt / G, 3)} g`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={ms >= 50 ? 'emerald' : 'rose'}>
        {ms === C.hard
          ? `Твърд удар. ${C.soft}`
          : ms > C.hard
            ? `Силата е ${sig(ms / C.hard, 2)} пъти по-малка, отколкото при твърд удар (пунктира).`
            : `Силата е ${sig(C.hard / ms, 2)} пъти по-голяма, отколкото при твърд удар (пунктира).`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Изменението на импулса Δp = mv е едно и също – тялото и в двата случая спира. Затова лицето под кривата F(t) е едно и също.
        Възглавницата, свитите колене и въздушната възглавница в колата удължават времето Δt и така намаляват силата. Забавянето е дадено в
        единици g = 9,81 m/s².
      </p>
    </div>
  );
}
