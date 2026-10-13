import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { sig } from '~/physics/sim';

const EPS0 = 8.854e-12;

// Диелектрична проницаемост – приблизителни стойности
const DIELECTRICS = [
  { name: 'въздух', eps: 1 },
  { name: 'хартия', eps: 3 },
  { name: 'стъкло', eps: 6 },
  { name: 'чиста вода', eps: 80 },
];

const CX = 240;
const MID = 112;

/** Плосък кондензатор: капацитетът зависи само от формата и диелектрика, а не от напрежението. */
export default function PlateCapacitorLab() {
  const [S, setS] = useState(100); // cm²
  const [d, setD] = useState(2); // mm
  const [k, setK] = useState(0);
  const [U0, setU0] = useState(100);
  // При откачена батерия зарядът остава този, който е бил в момента на откачването
  const [qFixed, setQFixed] = useState<number | null>(null);

  const eps = DIELECTRICS[k].eps;
  const C = (EPS0 * eps * S * 1e-4) / (d * 1e-3);
  const q = qFixed ?? C * U0;
  const U = q / C;
  const E = U / (d * 1e-3);
  const W = (q * U) / 2;
  const sigma = q / (S * 1e-4);

  const toggleBattery = () => setQFixed(qFixed === null ? C * U0 : null);

  // Размери на чертежа: височина на плочите ∝ √S, разстояние ∝ d
  const h = Math.sqrt(S) * 8;
  const gap = 14 + d * 14;
  const left = CX - gap / 2;
  const right = CX + gap / 2;
  const top = MID - h / 2;

  const plus = Math.min(14, Math.round(sigma / 1e-7));
  const lines = Math.min(9, Math.round(E / 1.5e4));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {DIELECTRICS.map((x, i) => (
          <DiagramButton key={x.name} active={i === k} onClick={() => setK(i)}>
            {`${x.name} (ε ≈ ${x.eps})`}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 230">
        {/* Диелектрик между плочите */}
        {eps > 1 && <rect x={left + 3} y={top} width={gap - 6} height={h} className="fill-amber-200/60 dark:fill-amber-700/30" />}
        {eps > 1 &&
          Array.from({ length: Math.max(1, Math.floor(h / 26)) }, (_, i) => top + 13 + i * 26).map(y => (
            <g key={y}>
              <ellipse cx={CX} cy={y} rx={Math.min(10, gap / 2 - 5)} ry={4} className="fill-none stroke-amber-600" strokeWidth="1" />
            </g>
          ))}
        {/* Силови линии – от + към − */}
        {Array.from({ length: lines }, (_, i) => top + ((i + 0.5) * h) / lines).map(y => (
          <g key={y}>
            <line x1={left + 4} y1={y} x2={right - 8} y2={y} className="stroke-blue-400" strokeWidth="1.2" />
            <polygon points={`${right - 4},${y} ${right - 10},${y - 3} ${right - 10},${y + 3}`} className="fill-blue-400" />
          </g>
        ))}
        <rect x={left - 6} y={top} width={6} height={h} className="fill-rose-500" />
        <rect x={right} y={top} width={6} height={h} className="fill-sky-600" />
        {Array.from({ length: plus }, (_, i) => top + ((i + 0.5) * h) / plus).map(y => (
          <g key={y}>
            <text x={left - 16} y={y} fontSize={12} textAnchor="middle" dominantBaseline="central" className="fill-rose-600 font-bold">
              +
            </text>
            <text x={right + 16} y={y} fontSize={12} textAnchor="middle" dominantBaseline="central" className="fill-sky-700 font-bold">
              −
            </text>
          </g>
        ))}
        {/* Жиците към батерията */}
        <polyline points={`${left - 3},${top} ${left - 3},12 ${CX - 30},12`} fill="none" className="stroke-gray-500" strokeWidth="2" />
        <polyline points={`${right + 3},${top} ${right + 3},12 ${CX + 30},12`} fill="none" className="stroke-gray-500" strokeWidth="2" />
        {qFixed === null ? (
          <g>
            <line x1={CX - 30} y1={12} x2={CX - 6} y2={12} className="stroke-gray-500" strokeWidth="2" />
            <line x1={CX - 6} y1={2} x2={CX - 6} y2={22} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2.5" />
            <line x1={CX + 6} y1={7} x2={CX + 6} y2={17} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="4" />
            <line x1={CX + 6} y1={12} x2={CX + 30} y2={12} className="stroke-gray-500" strokeWidth="2" />
          </g>
        ) : (
          <Label p={{ x: CX, y: 12 }} size={11} tone="amber">
            откачено
          </Label>
        )}
        <Label p={{ x: CX, y: top + h + 16 }} size={11}>
          {`d = ${d} mm`}
        </Label>
        <Label p={{ x: 70, y: MID }} size={12} tone="blue">
          {`S = ${S} cm²`}
        </Label>
        <Label p={{ x: 410, y: MID }} size={12}>
          {`U = ${sig(U, 3)} V`}
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="S, cm²" value={S} onChange={setS} min={25} max={400} step={25} tone="blue" />
        <Slider label="d, mm" value={d} onChange={setD} min={1} max={10} step={0.5} tone="gray" />
        {qFixed === null && <Slider label="U, V" value={U0} onChange={setU0} min={0} max={200} step={10} tone="rose" />}
      </Sliders>
      <Buttons>
        <DiagramButton active={qFixed !== null} onClick={toggleBattery}>
          {qFixed === null ? '🔌 Откачи батерията' : '🔋 Свържи батерията'}
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'C =', value: `${sig(C * 1e12, 3)} pF`, tone: 'blue' },
            { label: 'q =', value: `${sig(q * 1e9, 3)} nC`, tone: 'rose' },
            { label: 'E =', value: `${sig(E / 1000, 3)} kV/m` },
            { label: 'W =', value: `${sig(W * 1e6, 3)} µJ`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={qFixed === null ? 'gray' : 'amber'}>
        {qFixed === null
          ? 'Свързан с батерията: напрежението е постоянно, а зарядът следва капацитета (q = CU).'
          : 'Откачен: зарядът няма къде да отиде. Раздалечи плочите – C намалява, затова U и енергията растат (вършиш работа срещу привличането им).'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 C = ε₀εS/d. Знаците + и − показват колко гъсто е разпределен зарядът, а сините линии – полето E = U/d между плочите. Диелектрикът се
        поляризира (жълтите „диполи“) и отслабва полето, затова при същото напрежение плочите побират ε пъти повече заряд.
      </p>
    </div>
  );
}
