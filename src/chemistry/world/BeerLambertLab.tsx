import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Substance = {
  name: string;
  /** Моларен коефициент на поглъщане при λ, L/(mol·cm) – приблизителен. */
  eps: number;
  lambda: number;
  /** Концентрация в mmol/L: обхватът на плъзгача и стандартите. */
  max: number;
  standards: number[];
  color: string;
  absorbed: string;
};

const SUBSTANCES: Substance[] = [
  { name: 'KMnO₄', eps: 2400, lambda: 525, max: 0.5, standards: [0.1, 0.2, 0.3, 0.4], color: '#8b1e8f', absorbed: 'зелена' },
  { name: '[Cu(NH₃)₄]²⁺', eps: 50, lambda: 600, max: 25, standards: [5, 10, 15, 20], color: '#1d4ed8', absorbed: 'оранжева' },
];
// Малки „грешки на измерването“ на стандартите – фиксирани, за да е еднакво при всяко зареждане
const NOISE = [0.006, -0.004, 0.005, -0.007];
const PATHS = [0.5, 1, 2];

const fmt = (v: number, d = 3) => v.toFixed(d).replace('.', ',');

/** Фотометър: закон на Бер–Ламберт и определяне на концентрация по калибровъчна права. */
export default function BeerLambertLab() {
  const [si, setSi] = useState(0);
  const [l, setL] = useState(1);
  const [frac, setFrac] = useState(0.5); // концентрацията като част от обхвата
  const [unknown, setUnknown] = useState(0.63);
  const [measureUnknown, setMeasureUnknown] = useState(false);
  const [reveal, setReveal] = useState(false);
  const s = SUBSTANCES[si];

  const cOf = (f: number) => f * s.max; // mmol/L
  const c = measureUnknown ? cOf(unknown) : cOf(frac);
  const A = s.eps * l * (c / 1000);
  const T = 10 ** -A;
  const Ashown = Math.round(A * 1000) / 1000;

  // ---- кювета (вляво) ----
  const beamIn = 14;
  const beamOut = Math.max(1, beamIn * T);

  // ---- калибровъчна графика (вдясно) ----
  const gx0 = 290;
  const gx1 = 460;
  const gy0 = 190;
  const gy1 = 40;
  const slope = (s.eps * l) / 1000; // A на mmol/L
  const Atop = Math.ceil(1.1 * slope * s.max * 2) / 2;
  const X = (cc: number) => gx0 + (cc / s.max) * (gx1 - gx0);
  const Y = (a: number) => gy0 - (Math.min(a, Atop) / Atop) * (gy0 - gy1);
  const pts = s.standards.map((cc, i) => ({ c: cc, A: slope * cc + NOISE[i] }));
  const cRead = Ashown / slope;

  const newSample = () => {
    setUnknown(0.15 + Math.round(Math.random() * 65) / 100);
    setMeasureUnknown(true);
    setReveal(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SUBSTANCES.map((x, i) => (
          <DiagramButton key={x.name} active={i === si} onClick={() => { setSi(i); setReveal(false); }}>
            {x.name} ({x.lambda} nm)
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 230" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* източник */}
        <rect x={8} y={88} width={34} height={44} rx={5} className="fill-gray-200 dark:fill-gray-700 stroke-gray-500" />
        <text x={25} y={148} fontSize="10" textAnchor="middle" className="fill-gray-500">{s.lambda} nm</text>
        <text x={25} y={162} fontSize="10" textAnchor="middle" className="fill-gray-500">I₀</text>
        {/* лъч преди кюветата */}
        <rect x={42} y={110 - beamIn / 2} width={58} height={beamIn} fill="#facc15" opacity={0.85} />
        {/* кювета: ширината ѝ е дължината на пътя */}
        {(() => {
          const w = 30 + l * 30;
          const x0 = 100;
          return (
            <g>
              <rect x={x0} y={70} width={w} height={80} fill={s.color} opacity={Math.min(0.92, 1 - T + 0.04)} />
              <rect x={x0} y={70} width={w} height={80} fill="none" className="stroke-gray-500" strokeWidth={2} />
              <text x={x0 + w / 2} y={64} fontSize="10" textAnchor="middle" className="fill-gray-500">l = {fmt(l, 1)} cm</text>
              <rect x={x0 + w} y={110 - beamOut / 2} width={200 - x0 - w + 30} height={beamOut} fill="#facc15" opacity={0.85} />
              <text x={x0 + w / 2} y={170} fontSize="10" textAnchor="middle" className="fill-current">
                {measureUnknown ? 'проба' : `c = ${fmt(c, s.max < 1 ? 2 : 1)} mmol/L`}
              </text>
            </g>
          );
        })()}
        {/* детектор */}
        <rect x={230} y={88} width={30} height={44} rx={5} className="fill-gray-300 dark:fill-gray-600 stroke-gray-500" />
        <text x={245} y={148} fontSize="10" textAnchor="middle" className="fill-gray-500">I</text>
        <text x={135} y={200} fontSize="11" textAnchor="middle" className="fill-current" fontWeight={600}>
          A = {fmt(Ashown)}   T = {fmt(T * 100, 1)}%
        </text>

        {/* графика */}
        <line x1={gx0} y1={gy0} x2={gx1 + 5} y2={gy0} className="stroke-gray-400" />
        <line x1={gx0} y1={gy0} x2={gx0} y2={gy1 - 8} className="stroke-gray-400" />
        <text x={gx0 - 4} y={gy1 - 12} fontSize="10" className="fill-gray-500">A</text>
        
        {[0, 0.5, 1, 1.5, 2, 2.5, 3].filter(a => a <= Atop + 1e-9).map(a => (
          <text key={a} x={gx0 - 4} y={Y(a) + 3} fontSize="9" textAnchor="end" className="fill-gray-500">{fmt(a, 1)}</text>
        ))}
        {s.standards.map(cc => (
          <text key={cc} x={X(cc)} y={gy0 + 13} fontSize="9" textAnchor="middle" className="fill-gray-500">{fmt(cc, s.max < 1 ? 1 : 0)}</text>
        ))}
        <line x1={X(0)} y1={Y(0)} x2={X(s.max)} y2={Y(slope * s.max)} className="stroke-blue-500" strokeWidth={1.5} />
        {pts.map(p => (
          <circle key={p.c} cx={X(p.c)} cy={Y(p.A)} r={3.5} className="fill-blue-600" />
        ))}
        {/* текущото измерване */}
        {Ashown <= Atop && (
          <g>
            <line x1={gx0} y1={Y(Ashown)} x2={X(Math.min(cRead, s.max))} y2={Y(Ashown)} className="stroke-rose-500" strokeDasharray="4 3" />
            {cRead <= s.max && <line x1={X(cRead)} y1={Y(Ashown)} x2={X(cRead)} y2={gy0} className="stroke-rose-500" strokeDasharray="4 3" />}
            {cRead <= s.max && <circle cx={X(cRead)} cy={Y(Ashown)} r={4} className="fill-rose-500" />}
          </g>
        )}
        <text x={(gx0 + gx1) / 2} y={gy0 + 28} fontSize="10" textAnchor="middle" className="fill-gray-500">c, mmol/L – калибровъчна права</text>
      </LabSvg>

      <Sliders>
        {!measureUnknown && <Slider label="c" value={Math.round(frac * 100)} onChange={v => setFrac(v / 100)} min={0} max={100} step={1} tone="violet" />}
      </Sliders>
      <Buttons>
        {PATHS.map(p => (
          <DiagramButton key={p} active={p === l} onClick={() => setL(p)}>
            кювета {fmt(p, 1)} cm
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={!measureUnknown} onClick={() => setMeasureUnknown(false)}>
          стандартен разтвор
        </DiagramButton>
        <DiagramButton active={measureUnknown} onClick={newSample}>
          нова проба с неизвестна c
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'ε ≈', value: `${s.eps} L/(mol·cm)`, tone: 'blue' },
            { label: 'A = εlc =', value: fmt(Ashown), tone: 'violet' },
            { label: 'пропусната светлина:', value: `${fmt(T * 100, 1)}%`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={A > 1.5 ? 'amber' : 'emerald'}>
        {A > 1.5
          ? `A = ${fmt(Ashown, 2)}: до детектора стига под 3% от светлината и измерването става неточно. Разреди пробата или вземи по-тясна кювета.`
          : measureUnknown
            ? reveal
              ? `По правата: c = A / (εl) = ${fmt(Ashown)} / ${fmt(slope, 3)} ≈ ${fmt(cRead, s.max < 1 ? 3 : 2)} mmol/L.`
              : 'Отчети c от графиката: от A на пробата хоризонтално до правата и надолу до оста.'
            : `Разтворът поглъща ${s.absorbed}та светлина около ${s.lambda} nm, затова го виждаме в допълнителния ѝ цвят.`}
      </Note>
      {measureUnknown && !reveal && (
        <div className="text-center mt-2">
          <DiagramButton onClick={() => setReveal(true)}>покажи сметката</DiagramButton>
        </div>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Стойностите на ε са приблизителни (за KMnO₄ при 525 nm около 2,4·10³, за медния амонячен комплекс при около 600 nm – около 50
        L/(mol·cm)). На практика ε не се взима от таблица – начертава се калибровъчна права по стандартни разтвори, както тук.
      </p>
    </div>
  );
}
