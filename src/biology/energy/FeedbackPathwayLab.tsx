import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { useSimulation } from '~/physics/sim';

// Път треонин → B → C → D → изолевцин (в действителност стъпките са пет). Първият ензим (треонин дезаминаза)
// се потиска алостерично от крайния продукт. Скоростите са в условни единици; треонинът се доставя постоянно.
const KI = 0.5;
const K = 1.5;

type State = { b: number; c: number; d: number; e: number; used: number; made: number };
const init = (): State => ({ b: 0, c: 0, d: 0, e: 0, used: 0, made: 0 });

const NODES = [
  { x: 34, label: 'Тре' },
  { x: 124, label: 'B' },
  { x: 214, label: 'C' },
  { x: 304, label: 'D' },
  { x: 394, label: 'Иле' },
];
const NY = 72;
const R = 20;
const BAR_Y = 196;
const BAR_H = 70; // височина за концентрация 2
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

/** Обратна връзка: крайният продукт спира първия ензим от пътя. */
export default function FeedbackPathwayLab() {
  const [demand, setDemand] = useState(0.3);
  const [feedback, setFeedback] = useState(true);

  const v1Of = (e: number) => (feedback ? 1 / (1 + (e / KI) ** 2) : 1);
  const step = (s: State, dt: number): State => {
    const v1 = v1Of(s.e);
    const u = (demand * s.e) / (0.1 + s.e);
    return {
      b: s.b + (v1 - K * s.b) * dt,
      c: s.c + K * (s.b - s.c) * dt,
      d: s.d + K * (s.c - s.d) * dt,
      e: s.e + (K * s.d - u) * dt,
      used: s.used + v1 * dt,
      made: s.made + u * dt,
    };
  };
  const sim = useSimulation(init, step, { dt: 1 / 50, speed: 3 });
  const s = sim.state;
  const v1 = v1Of(s.e);
  const inhibited = feedback ? 1 - v1 : 0;
  const fluxes = [v1, K * s.b, K * s.c, K * s.d];
  const consumption = (demand * s.e) / (0.1 + s.e);
  const concs = [1, s.b, s.c, s.d, s.e];

  let note: string;
  if (sim.time < 3) note = 'Пусни симулацията и гледай как се пълни пътят. После промени нуждата на клетката от изолевцин.';
  else if (!feedback && s.e > 2) note = 'Без обратна връзка първият ензим работи с пълна сила, каквато и да е нуждата. Изолевцинът се трупа излишно, а треонинът се хаби.';
  else if (feedback && inhibited > 0.5) note = 'Изолевцинът е в излишък и се свързва с алостеричния център на първия ензим – пътят почти спира. Клетката пести треонин и енергия.';
  else if (feedback) note = 'Когато клетката изразходва повече изолевцин, концентрацията му пада, по-малко молекули потискат първия ензим и пътят се ускорява сам.';
  else note = 'При голяма нужда пътят без обратна връзка едва смогва – тук двата варианта се различават малко. Намали нуждата и сравни.';

  const arrow = (x1: number, x2: number, w: number) => (
    <g>
      <line x1={x1} x2={x2 - 6} y1={NY} y2={NY} stroke="#64748b" strokeWidth={1 + w * 5} />
      <path d={`M${x2} ${NY} l-9 -6 v12 z`} fill="#64748b" />
    </g>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 220" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Стрелки – дебелината е скоростта на стъпката */}
        {NODES.slice(0, 4).map((n, i) => (
          <g key={i}>{arrow(n.x + R + 2, NODES[i + 1].x - R - 2, Math.min(1.2, fluxes[i]))}</g>
        ))}
        {arrow(NODES[4].x + R + 2, 470, Math.min(1.2, consumption))}
        <text x={462} y={NY - 12} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          белтъци
        </text>
        {/* Ензимите */}
        {NODES.slice(0, 4).map((n, i) => {
          const ex = (n.x + NODES[i + 1].x) / 2;
          return (
            <g key={i}>
              <rect x={ex - 15} y={NY - 34} width={30} height={18} rx={8} fill={i === 0 ? '#fda4af' : '#cbd5e1'} stroke={i === 0 ? '#e11d48' : '#64748b'} />
              <text x={ex} y={NY - 21} fontSize="10" textAnchor="middle" fill="#1f2937">
                Е{i + 1}
              </text>
            </g>
          );
        })}
        {/* Алостеричен център на Е1 и свързан изолевцин */}
        {feedback && (
          <g>
            <path d={`M${NODES[4].x} ${NY - R} V20 H79 V${NY - 47}`} fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="5 4" opacity={0.35 + inhibited * 0.65} />
            <circle cx={79} cy={NY - 40} r={5} fill="#dc2626" opacity={inhibited} />
            <text x={236} y={14} fontSize="11" fontWeight="700" textAnchor="middle" fill="#dc2626">
              − потискане
            </text>
          </g>
        )}
        {/* Веществата */}
        {NODES.map((n, i) => (
          <g key={n.label}>
            <circle cx={n.x} cy={NY} r={R} fill={i === 4 ? '#fecdd3' : i === 0 ? '#fde68a' : '#e2e8f0'} stroke="#64748b" />
            <text x={n.x} y={NY + 4} fontSize="11" textAnchor="middle" fill="#1f2937" fontWeight="600">
              {n.label}
            </text>
          </g>
        ))}
        {/* Концентрациите */}
        <line x1={10} x2={410} y1={BAR_Y} y2={BAR_Y} className="stroke-gray-300 dark:stroke-gray-600" />
        {concs.map((c, i) => {
          const h = Math.min(BAR_H * 1.3, (c / 2) * BAR_H);
          return (
            <g key={i}>
              <rect x={NODES[i].x - 12} y={BAR_Y - h} width={24} height={h} fill={i === 4 ? '#e11d48' : i === 0 ? '#f59e0b' : '#94a3b8'} rx={2} />
              <text x={NODES[i].x} y={BAR_Y + 14} fontSize="11" textAnchor="middle" fill="currentColor">
                {c > 2.6 ? `↑${fmt(c)}` : fmt(c, 2)}
              </text>
            </g>
          );
        })}
        <text x={476} y={BAR_Y + 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          концентрации
        </text>
      </LabSvg>

      <Sliders>
        <Slider label="нужда" value={demand} onChange={setDemand} min={0} max={1.5} step={0.1} tone="rose" />
      </Sliders>
      <Buttons>
        <DiagramButton active={feedback} onClick={() => setFeedback(!feedback)}>
          {feedback ? '✓ обратна връзка' : '✗ мутантен Е1 без алостеричен център'}
        </DiagramButton>
      </Buttons>
      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
      <div className="mt-3">
        <Readout
          items={[
            { label: 'изразходван треонин', value: fmt(s.used) },
            { label: 'изолевцин в белтъци', value: fmt(s.made) },
            { label: 'Е1 потиснат', value: `${Math.round(inhibited * 100)}%` },
          ]}
        />
      </div>
      <Note tone="violet">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Тре – треонин, Иле – изолевцин. Дебелината на стрелките е скоростта на всяка стъпка, стълбчетата – концентрациите. Пътят от
        треонин до изолевцин при бактериите е от пет ензима; тук междинните вещества са обединени. Числата са в условни единици.
      </p>
    </div>
  );
}
