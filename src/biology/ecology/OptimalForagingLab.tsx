import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

/** Колко енергия (J) има в едно петно – колкото и дълго да стои животното, повече не може да събере. */
const G = 60;
const TMAX = 120;

/** Събраната енергия след t секунди в петното: отначало бързо, после все по-бавно (петното се изтощава). */
const gain = (t: number, tau: number) => G * (1 - Math.exp(-t / tau));

/** Оптималното време в петното (теорема за пределната стойност): g'(t)·(T + t) = g(t). */
function bestTime(T: number, tau: number) {
  const f = (t: number) => (T + t) / tau - (Math.exp(t / tau) - 1);
  let a = 1e-9;
  let b = 40 * tau;
  for (let k = 0; k < 100; k++) {
    const m = (a + b) / 2;
    if (f(a) * f(m) <= 0) b = m;
    else a = m;
  }
  return (a + b) / 2;
}

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

// чертеж: времето за път е наляво от началото, времето в петното – надясно
const OX = 320;
const K = 2.4; // px за 1 s
const Y0 = 260;
const KY = 200 / G;
const sx = (t: number) => OX + t * K;
const sy = (g: number) => Y0 - g * KY;

const PRESETS = [
  { name: 'храстите са близо', T: 10 },
  { name: 'средно', T: 30 },
  { name: 'храстите са далеч', T: 90 },
];

/** Оптимално хранене: кога да напусне животното едно петно с храна (теоремата на Чарнов). */
export default function OptimalForagingLab() {
  const [T, setT] = useState(30);
  const [tau, setTau] = useState(20);
  const [stay, setStay] = useState(10);

  const tb = bestTime(T, tau);
  const rateBest = gain(tb, tau) / (T + tb);
  const rate = gain(stay, tau) / (T + stay);
  const pct = (rate / rateBest) * 100;

  const curve = Array.from({ length: 121 }, (_, k) => `${k ? 'L' : 'M'} ${sx(k).toFixed(1)} ${sy(gain(k, tau)).toFixed(1)}`).join(' ');
  // допирателната от (−T, 0), удължена до края на чертежа
  const lineTo = (slope: number) => {
    const tEnd = Math.min(TMAX, (G * 1.05) / slope - T);
    return { x: sx(tEnd), y: sy(slope * (T + tEnd)) };
  };
  const tanEnd = lineTo(rateBest);
  const myEnd = lineTo(rate);

  let msg: string;
  if (pct > 98) msg = 'Почти оптимално! Тръгваш точно когато добивът в петното падне до средния добив, който можеш да имаш навсякъде.';
  else if (stay < tb) msg = `Тръгваш твърде рано: в петното храната още идва бързо, а пътят до следващото е дълъг. Остани около ${fmt(tb, 0)} s.`;
  else msg = `Стоиш твърде дълго: петното е почти изтощено и добивът в него е под средния. Тръгни след около ${fmt(tb, 0)} s.`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* оси */}
        <line x1={sx(-TMAX)} y1={Y0} x2={sx(TMAX)} y2={Y0} stroke="currentColor" />
        <line x1={OX} y1={Y0} x2={OX} y2={sy(G) - 10} stroke="currentColor" />
        {[-120, -90, -60, -30, 0, 30, 60, 90, 120].map(v => (
          <g key={v}>
            <line x1={sx(v)} x2={sx(v)} y1={Y0} y2={Y0 + 4} stroke="currentColor" />
            <text x={sx(v)} y={Y0 + 16} fontSize="11" textAnchor="middle" fill="currentColor">{Math.abs(v)}</text>
          </g>
        ))}
        {[20, 40, 60].map(v => (
          <g key={v}>
            <line x1={OX - 4} x2={sx(TMAX)} y1={sy(v)} y2={sy(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={OX - 8} y={sy(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">{v}</text>
          </g>
        ))}
        <text x={sx(-60)} y={Y0 + 32} fontSize="12" textAnchor="middle" fill="currentColor">← път до петното, s</text>
        <text x={sx(60)} y={Y0 + 32} fontSize="12" textAnchor="middle" fill="currentColor">време в петното, s →</text>
        <text x={OX + 6} y={sy(G) - 14} fontSize="12" fill="currentColor">събрана енергия, J</text>

        {/* пътят */}
        <line x1={sx(-T)} y1={Y0} x2={OX} y2={Y0} stroke="#64748b" strokeWidth={5} opacity={0.5} />
        <circle cx={sx(-T)} cy={Y0} r={5} fill="#64748b" />

        <path d={curve} fill="none" stroke="#16a34a" strokeWidth={3} />
        <line x1={sx(-T)} y1={Y0} x2={tanEnd.x} y2={tanEnd.y} stroke="#7c3aed" strokeWidth={2} />
        <circle cx={sx(tb)} cy={sy(gain(tb, tau))} r={5} fill="#7c3aed" />
        <line x1={sx(-T)} y1={Y0} x2={myEnd.x} y2={myEnd.y} stroke="#e11d48" strokeWidth={2} strokeDasharray="6 4" />
        <line x1={sx(stay)} x2={sx(stay)} y1={Y0} y2={sy(gain(stay, tau))} stroke="#e11d48" strokeDasharray="2 3" />
        <circle cx={sx(stay)} cy={sy(gain(stay, tau))} r={6} fill="#e11d48" />

        <g fontSize="11">
          <text x={sx(-TMAX) + 4} y={sy(G) + 4} fill="#16a34a">— енергия в петното</text>
          <text x={sx(-TMAX) + 4} y={sy(G) + 20} fill="#7c3aed">— допирателна: най-добрият среден добив</text>
          <text x={sx(-TMAX) + 4} y={sy(G) + 36} fill="#e11d48">- - твоят среден добив</text>
        </g>
      </LabSvg>

      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.name} active={T === p.T} onClick={() => setT(p.T)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="път T" value={T} onChange={setT} min={5} max={120} step={5} tone="gray" />
        <Slider label="τ петно" value={tau} onChange={setTau} min={5} max={60} step={5} tone="emerald" />
        <Slider label="стой t" value={stay} onChange={setStay} min={1} max={120} step={1} tone="rose" />
      </Sliders>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'най-добре t*', value: `${fmt(tb, 1)} s`, tone: 'violet' },
            { label: 'макс. добив', value: `${fmt(rateBest, 2)} J/s`, tone: 'violet' },
            { label: 'твоят добив', value: `${fmt(rate, 2)} J/s`, tone: 'rose' },
            { label: 'от максимума', value: `${fmt(pct, 0)} %`, tone: pct > 98 ? 'emerald' : 'amber' },
          ]}
        />
      </div>
      <Formula>
        R = g(t) / (T + t) = {fmt(gain(stay, tau), 1)} / ({T} + {stay}) = {fmt(rate, 2)} J/s
      </Formula>
      <Note tone={pct > 98 ? 'emerald' : 'amber'}>{msg}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Средният добив е наклонът на правата от началото на пътя (точката вляво) до точката на кривата, когато животното тръгва.
        Най-стръмната такава права е допирателната към кривата – там скоростта на добив в петното е равна на средната. Удължи пътя и
        виж как оптималното време в петното расте: щом пътят е скъп, си струва да изсмучеш петното по-добре. Петното е модел:
        енергията в него е g(t) = 60 · (1 − e^(−t/τ)) J, а τ показва колко бавно се изтощава.
      </p>
    </div>
  );
}
