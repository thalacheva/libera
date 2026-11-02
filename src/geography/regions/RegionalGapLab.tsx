import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { GDP_SERIES, GDP_YEARS, OBLASTS, POP_SERIES } from './bgData';

const SOFIA = OBLASTS.findIndex(o => o.code === 'BG411');
const SHORT: Record<string, string> = { 'Велико Търново': 'В. Търново', 'Стара Загора': 'Ст. Загора', 'София (столица)': 'София-град', София: 'Софийска' };

/** Кривата на Лоренц и коефициентът на Джини за БВП по области през една година. */
function lorenz(year: number, withSofia: boolean) {
  const t = GDP_YEARS.indexOf(year);
  const items = OBLASTS.map((o, i) => ({ o, i, gdp: GDP_SERIES[t][i], pop: POP_SERIES[t][i] * 1000 }))
    .filter(q => withSofia || q.i !== SOFIA)
    .map(q => ({ ...q, pc: (q.gdp * 1e6) / q.pop }))
    .sort((a, b) => a.pc - b.pc);
  const P = items.reduce((s, q) => s + q.pop, 0);
  const Y = items.reduce((s, q) => s + q.gdp, 0);
  const pts: [number, number][] = [[0, 0]];
  let cp = 0;
  let cy = 0;
  let area = 0;
  for (const q of items) {
    const [x0, y0] = [cp / P, cy / Y];
    cp += q.pop;
    cy += q.gdp;
    area += ((cp / P - x0) * (cy / Y + y0)) / 2;
    pts.push([cp / P, cy / Y]);
  }
  const avg = (Y * 1e6) / P;
  return { items, pts, gini: 1 - 2 * area, avg };
}

/** Регионалните разлики: крива на Лоренц, коефициент на Джини и БВП на човек по области от 2000 г. насам. */
export default function RegionalGapLab() {
  const [year, setYear] = useState(2024);
  const [withSofia, setWithSofia] = useState(true);
  const { items, pts, gini, avg } = lorenz(year, withSofia);
  const first = lorenz(GDP_YEARS[0], withSofia);
  const rich = items[items.length - 1];
  const poor = items[0];
  const t = GDP_YEARS.indexOf(year);
  const totalGdp = GDP_SERIES[t].reduce((a, b) => a + b, 0);
  const totalPop = POP_SERIES[t].reduce((a, b) => a + b, 0);

  // Лоренц: квадрат вляво
  const L = { x: 44, y: 20, s: 220 };
  const lx = (v: number) => L.x + v * L.s;
  const ly = (v: number) => L.y + L.s - v * L.s;
  const curve = pts.map(([a, b], i) => `${i ? 'L' : 'M'}${lx(a).toFixed(1)} ${ly(b).toFixed(1)}`).join('');

  // Стълбове вдясно: БВП на човек спрямо средното (= 100)
  const B = { x: 368, y: 20, w: 260, row: 9.4 };
  const desc = [...items].reverse();
  const idxMax = Math.max(300, ...desc.map(q => (100 * q.pc) / avg));
  const bx = (v: number) => B.x + (v / idxMax) * B.w;

  // Джини по години – малка графика под кривата
  const ginis = GDP_YEARS.map(y => lorenz(y, withSofia).gini);
  const G = { x: 44, y: 268, w: 220, h: 22 };
  const [gMin, gMax] = [0.05, 0.35];
  const gx = (y: number) => G.x + ((y - GDP_YEARS[0]) / (GDP_YEARS[GDP_YEARS.length - 1] - GDP_YEARS[0])) * G.w;
  const gy = (v: number) => G.y + G.h - ((v - gMin) / (gMax - gMin)) * G.h;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={L.x} y={12} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          Крива на Лоренц, {year} г.
        </text>
        <rect x={L.x} y={L.y} width={L.s} height={L.s} className="fill-gray-50 dark:fill-gray-900/40 stroke-gray-300 dark:stroke-gray-600" strokeWidth={0.6} />
        {[0.25, 0.5, 0.75].map(v => (
          <g key={v}>
            <line x1={lx(v)} y1={L.y} x2={lx(v)} y2={L.y + L.s} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth={0.5} />
            <line x1={L.x} y1={ly(v)} x2={L.x + L.s} y2={ly(v)} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth={0.5} />
            <text x={lx(v)} y={L.y + L.s + 10} fontSize="8" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              {v * 100}%
            </text>
            <text x={L.x - 4} y={ly(v) + 3} fontSize="8" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {v * 100}%
            </text>
          </g>
        ))}
        <path d={`${curve}L${lx(1)} ${ly(1)}L${lx(0)} ${ly(0)}Z`} className="fill-sky-500/25" />
        <line x1={lx(0)} y1={ly(0)} x2={lx(1)} y2={ly(1)} className="stroke-gray-400" strokeDasharray="4 3" />
        <path d={curve} fill="none" className="stroke-sky-600 dark:stroke-sky-400" strokeWidth={2} />
        {pts.slice(1).map(([a, b], i) => (
          <circle key={i} cx={lx(a)} cy={ly(b)} r={items[i].i === SOFIA ? 3.5 : 1.8} className={items[i].i === SOFIA ? 'fill-violet-600' : 'fill-sky-600 dark:fill-sky-400'} />
        ))}
        <text x={lx(0.52)} y={ly(0.62)} fontSize="9" className="fill-gray-500 dark:fill-gray-400" transform={`rotate(-45 ${lx(0.52)} ${ly(0.62)})`}>
          пълно равенство
        </text>
        <text x={L.x + L.s / 2} y={L.y + L.s + 21} fontSize="8.5" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          дял от населението (от най-бедната област)
        </text>
        <text x={12} y={L.y + L.s / 2} fontSize="8.5" textAnchor="middle" transform={`rotate(-90 12 ${L.y + L.s / 2})`} className="fill-gray-600 dark:fill-gray-300">
          дял от БВП
        </text>

        {/* Джини по години */}
        <text x={G.x + G.w + 6} y={G.y + 10} fontSize="8" className="fill-gray-500 dark:fill-gray-400">
          G по години
        </text>
        <path d={ginis.map((g, i) => `${i ? 'L' : 'M'}${gx(GDP_YEARS[i]).toFixed(1)} ${gy(g).toFixed(1)}`).join('')} fill="none" className="stroke-rose-500" strokeWidth={1.5} />
        <circle cx={gx(year)} cy={gy(gini)} r={3} className="fill-rose-600" />
        <text x={G.x} y={G.y + G.h + 9} fontSize="7.5" className="fill-gray-500 dark:fill-gray-400">
          {GDP_YEARS[0]}
        </text>
        <text x={G.x + G.w} y={G.y + G.h + 9} fontSize="7.5" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          {GDP_YEARS[GDP_YEARS.length - 1]}
        </text>

        {/* БВП на човек спрямо средното */}
        <text x={B.x - 60} y={12} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          БВП на човек, средното = 100
        </text>
        <line x1={bx(100)} y1={B.y - 4} x2={bx(100)} y2={B.y + desc.length * B.row} className="stroke-gray-400" strokeDasharray="3 2" strokeWidth={0.8} />
        {desc.map((q, i) => {
          const v = (100 * q.pc) / avg;
          const y = B.y + i * B.row;
          return (
            <g key={q.o.code}>
              <text x={B.x - 4} y={y + 6.5} fontSize="7" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
                {SHORT[q.o.name] ?? q.o.name}
              </text>
              <rect x={B.x} y={y} width={Math.max(1, bx(v) - B.x)} height={B.row - 2} className={q.i === SOFIA ? 'fill-violet-500' : v >= 100 ? 'fill-sky-500' : 'fill-sky-300 dark:fill-sky-700'} />
              <text x={Math.min(bx(v) + 3, B.x + B.w - 2)} y={y + 6.5} fontSize="6.5" textAnchor={bx(v) + 3 > B.x + B.w - 14 ? 'end' : 'start'} className="fill-gray-700 dark:fill-gray-200">
                {fmt(v)}
              </text>
            </g>
          );
        })}
      </LabSvg>
      <Buttons>
        <DiagramButton active={withSofia} onClick={() => setWithSofia(true)}>
          28 области
        </DiagramButton>
        <DiagramButton active={!withSofia} onClick={() => setWithSofia(false)}>
          без София-град
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="година" value={year} onChange={setYear} min={GDP_YEARS[0]} max={GDP_YEARS[GDP_YEARS.length - 1]} step={1} tone="rose" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Областите са подредени от най-бедната към най-богатата по БВП на човек. Колкото повече кривата се отдалечава от диагонала, толкова по-голямо е
        неравенството. Коефициентът на Джини G е удвоената площ между диагонала и кривата: 0 – пълно равенство, 1 – целият БВП е в една област.
        Данни: Евростат (БВП по текущи цени и средногодишно население).
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'G', value: fmt(gini, 3), tone: 'rose' },
            { label: `G ${GDP_YEARS[0]}`, value: fmt(first.gini, 3), tone: 'gray' },
            { label: 'най-богата / най-бедна', value: `${fmt(rich.pc / poor.pc, 1)} пъти`, tone: 'blue' },
            { label: 'София-град', value: `${fmt((100 * GDP_SERIES[t][SOFIA]) / totalGdp, 1)}% от БВП, ${fmt((100 * POP_SERIES[t][SOFIA]) / totalPop, 1)}% от хората`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={gini > first.gini + 0.02 ? 'rose' : 'emerald'}>
        {`${year} г.: най-висок БВП на човек – ${SHORT[rich.o.name] ?? rich.o.name} (${fmt(rich.pc)} €), най-нисък – ${SHORT[poor.o.name] ?? poor.o.name} (${fmt(poor.pc)} €). `}
        {gini > first.gini + 0.02 ? `Неравенството е по-голямо, отколкото през ${GDP_YEARS[0]} г.` : `Неравенството е близо до това през ${GDP_YEARS[0]} г.`}
      </Note>
    </div>
  );
}
