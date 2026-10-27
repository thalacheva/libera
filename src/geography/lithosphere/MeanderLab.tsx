import { useEffect, useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { simulate, sinuosity, type Pt } from './meanderSim';

const STEPS = 1300;
const SNAP = 20;
const W = 640;
const H = 300;
const X0 = 20;
const LEN = 600;
const CY = 150;
const K = 300; // px на единица от долината по ширина

const pathOf = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${(X0 + p.x * LEN).toFixed(1)} ${(CY + p.y * K).toFixed(1)}`).join('');

/** Меандри: завоите се подкопават отвън, пълзят надолу по долината и накрая се прекъсват – остават старици. */
export default function MeanderLab() {
  const snaps = useMemo(() => simulate(STEPS, SNAP), []);
  const [t, setT] = useState(0);
  const [play, setPlay] = useState(false);
  const [trace, setTrace] = useState(true);
  const s = snaps[t];

  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => setT(v => (v >= snaps.length - 1 ? v : v + 1)), 90);
    return () => clearInterval(id);
  }, [play, snaps.length]);
  useEffect(() => {
    if (t >= snaps.length - 1) setPlay(false);
  }, [t, snaps.length]);

  // Предишните положения на коритото – следите по заливната тераса
  const ghosts = trace ? [0.25, 0.5, 0.75].map(f => Math.floor(t * f)).filter(i => i > 0 && i < t) : [];
  const step = t * SNAP;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={0} y={0} width={W} height={H} className="fill-amber-100 dark:fill-stone-800" />
        <rect x={X0} y={CY - 0.45 * K} width={LEN} height={0.9 * K} className="fill-lime-100 dark:fill-lime-950/60" />
        <text x={X0 + 4} y={CY - 0.45 * K - 4} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          заливна тераса (дъното на долината)
        </text>
        {ghosts.map(i => (
          <path key={i} d={pathOf(snaps[i].river)} fill="none" className="stroke-sky-400/30" strokeWidth="2" />
        ))}
        {s.oxbows.map((o, i) => (
          <path
            key={i}
            d={pathOf(o.pts)}
            fill="none"
            className="stroke-teal-600 dark:stroke-teal-400"
            strokeWidth="4"
            strokeLinecap="round"
            // Старите старици постепенно се затлачват и зарастват
            opacity={Math.max(0.15, 1 - (step - o.step) / 900)}
          />
        ))}
        <path d={pathOf(s.river)} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
        <text x={X0} y={H - 10} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          течението →
        </text>
        <g transform={`translate(${W - 210} ${H - 30})`}>
          <line x1={0} y1={0} x2={22} y2={0} className="stroke-blue-600" strokeWidth="5" />
          <text x={28} y={4} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            река
          </text>
          <line x1={70} y1={0} x2={92} y2={0} className="stroke-teal-600" strokeWidth="4" />
          <text x={98} y={4} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            старица
          </text>
        </g>
      </LabSvg>
      <Buttons>
        <DiagramButton active={play} onClick={() => (t >= snaps.length - 1 ? (setT(0), setPlay(true)) : setPlay(!play))}>
          {play ? '⏸ Пауза' : '▶ Пусни'}
        </DiagramButton>
        <DiagramButton
          onClick={() => {
            setPlay(false);
            setT(0);
          }}
        >
          ⟲ Отначало
        </DiagramButton>
        <DiagramButton active={trace} onClick={() => setTrace(!trace)}>
          Стари корита
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="време" value={t} onChange={setT} min={0} max={snaps.length - 1} step={1} tone="blue" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Времето е условно – според реката завоите се местят с от под метър до десетки метри годишно.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'коефициент на извитост', value: fmt(sinuosity(s.river), 2), tone: 'blue' },
            { label: 'прекъснати завои', value: String(s.cutoffs), tone: 'emerald' },
          ]}
        />
      </div>
    </div>
  );
}
