import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

/** Радиус на капиляра, mm. */
const R_CAP = 0.5;
const AREA = Math.PI * R_CAP ** 2; // mm²
/** Дължина на скалата на капиляра, mm. */
const SCALE_MM = 150;

type Vaseline = 'none' | 'upper' | 'lower' | 'both';
const VASELINE: Record<Vaseline, { label: string; open: number }> = {
  none: { label: 'без вазелин', open: 1 },
  // при повечето двусемеделни около 4/5 от устицата са на долната страна
  upper: { label: 'горна страна', open: 0.8 },
  lower: { label: 'долна страна', open: 0.2 },
  both: { label: 'двете страни', open: 0.02 },
};

/** Налягане на наситените водни пари, kPa (формула на Тетенс). */
const es = (t: number) => 0.6108 * Math.exp((17.27 * t) / (t + 237.3));

/** Скорост на поемане на вода, mm³/min. Калибровка: 20 °C, 50 %, светло, без вятър ≈ 12 mm³/min. */
function uptake(light: boolean, wind: boolean, temp: number, rh: number, vas: Vaseline) {
  const vpd = es(temp) * (1 - rh / 100); // дефицит на насищане, kPa
  // устицата + малко през кутикулата
  const gs = (light ? 1 : 0.08) * VASELINE[vas].open + 0.03;
  // граничният слой неподвижен въздух около листа – вятърът го отнася
  const gb = wind ? 4 : 1.2;
  const g = 1 / (1 / gs + 1 / gb);
  return 19 * vpd * g;
}

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

// Чертежът
const X0 = 150; // началото на скалата
const PX = 3; // px на mm
const CY = 232; // оста на капиляра

function Leaf({ x, y, a, vas, side }: { x: number; y: number; a: number; vas: Vaseline; side: 'l' | 'r' }) {
  const coated = vas !== 'none';
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <ellipse cx={side === 'r' ? 22 : -22} cy={0} rx={24} ry={9} className="fill-emerald-400 dark:fill-emerald-600" stroke={coated ? '#f59e0b' : '#047857'} strokeWidth={coated ? 2.5 : 1} />
      <line x1={0} y1={0} x2={side === 'r' ? 44 : -44} y2={0} stroke="#065f46" strokeWidth={0.8} />
    </g>
  );
}

/** Потометър: мехурчето в капиляра показва колко вода поема клонката; светлина, вятър, температура, влажност, вазелин. */
export default function PotometerLab() {
  const [light, setLight] = useState(true);
  const [wind, setWind] = useState(false);
  const [temp, setTemp] = useState(20);
  const [rh, setRh] = useState(50);
  const [vas, setVas] = useState<Vaseline>('none');
  const [t, setT] = useState(5);

  const q = uptake(light, wind, temp, rh, vas); // mm³/min
  const v = q / AREA; // mm/min
  const dist = Math.min(SCALE_MM, v * t);
  const full = v * t >= SCALE_MM;
  const bx = X0 + dist * PX;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 280" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* слънце или луна */}
        {light ? (
          <g>
            <circle cx={40} cy={40} r={16} fill="#facc15" />
            {Array.from({ length: 8 }, (_, k) => {
              const a = (k * Math.PI) / 4;
              return <line key={k} x1={40 + 21 * Math.cos(a)} y1={40 + 21 * Math.sin(a)} x2={40 + 29 * Math.cos(a)} y2={40 + 29 * Math.sin(a)} stroke="#facc15" strokeWidth={3} />;
            })}
          </g>
        ) : (
          <path d="M 48 24 A 17 17 0 1 0 52 56 A 13 13 0 1 1 48 24 Z" fill="#94a3b8" />
        )}
        {/* вентилатор */}
        {wind && (
          <g>
            <circle cx={245} cy={95} r={20} fill="none" stroke="#64748b" strokeWidth={2} />
            <path d="M245 95 L245 77 A 18 18 0 0 1 260 88 Z M245 95 L230 104 A 18 18 0 0 1 233 82 Z M245 95 L258 108 A 18 18 0 0 1 240 112 Z" fill="#94a3b8" />
            {[80, 95, 110].map(y => (
              <path key={y} d={`M 220 ${y} q -15 -5 -30 0 t -30 0`} fill="none" stroke="#38bdf8" strokeWidth={2} />
            ))}
          </g>
        )}
        <text x={630} y={28} fontSize="13" textAnchor="end" fill="currentColor">
          {temp} °C · влажност {rh} %
        </text>
        <text x={630} y={46} fontSize="12" textAnchor="end" className="fill-amber-600 dark:fill-amber-400">
          {vas === 'none' ? '' : `вазелин: ${VASELINE[vas].label}`}
        </text>

        {/* клонката */}
        <line x1={110} y1={40} x2={110} y2={185} stroke="#065f46" strokeWidth={4} />
        <Leaf x={110} y={60} a={-25} vas={vas} side="r" />
        <Leaf x={110} y={80} a={25} vas={vas} side="l" />
        <Leaf x={110} y={110} a={-15} vas={vas} side="r" />
        <Leaf x={110} y={135} a={15} vas={vas} side="l" />
        <Leaf x={110} y={45} a={-70} vas={vas} side="r" />

        {/* тапа, широка тръба и капиляр */}
        <rect x={96} y={175} width={28} height={14} rx={2} fill="#78350f" />
        <path d={`M 98 189 L 98 ${CY + 6} L 600 ${CY + 6} L 600 ${CY - 6} L 122 ${CY - 6} L 122 189 Z`} fill="#bae6fd" stroke="#0369a1" strokeWidth={1.5} />
        {/* резервоар с кран */}
        <path d="M 128 150 L 158 150 L 146 196 L 140 196 Z" fill="#bae6fd" stroke="#0369a1" strokeWidth={1.5} />
        <rect x={140} y={196} width={6} height={30} fill="#bae6fd" stroke="#0369a1" strokeWidth={1} />
        <rect x={134} y={204} width={18} height={6} rx={1} fill="#475569" />
        <text x={160} y={160} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          резервоар с кранче
        </text>

        {/* мехурчето */}
        <rect x={bx - 5} y={CY - 5} width={10} height={10} rx={4} fill="white" stroke="#0f172a" strokeWidth={1.2} />
        <line x1={X0} x2={bx} y1={CY + 16} y2={CY + 16} stroke="#e11d48" strokeWidth={2} />

        {/* скала */}
        {Array.from({ length: SCALE_MM / 10 + 1 }, (_, k) => (
          <g key={k}>
            <line x1={X0 + k * 10 * PX} x2={X0 + k * 10 * PX} y1={CY + 7} y2={CY + 13} stroke="#334155" />
            {k % 3 === 0 && (
              <text x={X0 + k * 10 * PX} y={CY + 30} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                {k * 10}
              </text>
            )}
          </g>
        ))}
        <text x={600} y={CY + 44} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          mm (капиляр с радиус {fmt(R_CAP)} mm)
        </text>
        <text x={X0 + 140} y={CY - 16} fontSize="12" fill="currentColor">
          ← водата отива към клонката, мехурчето – след нея
        </text>
      </LabSvg>

      <Buttons>
        <DiagramButton active={light} onClick={() => setLight(l => !l)}>
          {light ? '☀️ светло' : '🌙 тъмно'}
        </DiagramButton>
        <DiagramButton active={wind} onClick={() => setWind(w => !w)}>
          {wind ? '🌬️ вентилатор' : 'без вятър'}
        </DiagramButton>
      </Buttons>
      <Buttons>
        {(Object.keys(VASELINE) as Vaseline[]).map(k => (
          <DiagramButton key={k} active={vas === k} onClick={() => setVas(k)}>
            {VASELINE[k].label}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="T, °C" value={temp} onChange={setTemp} min={10} max={35} step={1} tone="rose" />
        <Slider label="влажн., %" value={rh} onChange={setRh} min={20} max={95} step={5} tone="blue" />
        <Slider label="t, min" value={t} onChange={setT} min={0} max={10} step={0.5} tone="emerald" />
      </Sliders>

      <Readout
        items={[
          { label: 'мехурчето', value: full ? '> 150 mm' : `${fmt(dist)} mm`, tone: 'rose' },
          { label: 'скорост', value: `${fmt(v)} mm/min`, tone: 'blue' },
          { label: 'вода', value: `${fmt(q)} mm³/min`, tone: 'emerald' },
        ]}
      />
      <Formula>
        V = πr² · v = {fmt(AREA, 3)} mm² · {fmt(v)} mm/min ≈ {fmt(q)} mm³/min
      </Formula>
      <Note tone="emerald">
        {full
          ? 'Мехурчето стигна края на скалата – с кранчето на резервоара то се връща в началото.'
          : !light
            ? 'На тъмно устицата се затварят и клонката почти спира да поема вода – остава само малко изпарение през кутикулата.'
            : vas === 'lower' || vas === 'both'
              ? 'Вазелинът на долната страна запушва повечето устица – там са около 4/5 от тях при повечето двусемеделни.'
              : wind
                ? 'Вятърът отнася влажния въздух около листата и изпарението се ускорява.'
                : rh >= 85
                  ? 'Във влажен въздух водните пари почти не излизат – транспирацията е бавна.'
                  : 'Потометърът мери колко вода поема клонката. Почти цялата (около 99 %) се изпарява през устицата.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моделът: изпарението е пропорционално на дефицита на насищане на въздуха (колко още пари може да поеме – расте с
        температурата и пада с влажността) и на проводимостта на устицата и на неподвижния въздух около листа. Сравни долната и
        горната страна с вазелин; после изключи светлината. В истинския опит клонката се реже под вода, за да не влезе въздух в
        ксилема.
      </p>
    </div>
  );
}
