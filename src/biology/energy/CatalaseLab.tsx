import { useEffect, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { useSimulation } from '~/physics/sim';

// Опит: 5 mL 3% H₂O₂ + парче тъкан, кислородът се събира в газова спринцовка.
// 2H₂O₂ → 2H₂O + O₂ дава най-много около 50 mL O₂.
const V_TOT = 50;
const T_END = 120; // s

type Tissue = 'liver' | 'potato' | 'boiled' | 'water';
const TISSUES: Record<Tissue, { label: string; k: number; color: string }> = {
  liver: { label: 'черен дроб', k: 1, color: '#9f1239' },
  potato: { label: 'картоф', k: 0.2, color: '#fde68a' },
  boiled: { label: 'сварен черен дроб', k: 0, color: '#78716c' },
  water: { label: 'вода (контрола)', k: 0, color: '' },
};

/** Каква част от ензима е запазила формата си при температура T (денатурацията започва над ~40 °C). */
const intact = (T: number) => 1 / (1 + Math.exp((T - 47) / 3));
/** Начална скорост в mL O₂/s: Q₁₀ = 2 до оптимума, после денатурация; pH – около 7. */
const rate = (tissue: Tissue, T: number, pH: number) => TISSUES[tissue].k * 2 ** ((T - 37) / 10) * intact(T) * Math.exp(-(((pH - 7) / 1.6) ** 2));
const volume = (r: number, t: number) => V_TOT * (1 - Math.exp((-r * t) / V_TOT));

const COLORS = ['#e11d48', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2'];

// Графиката
const GX = 46;
const GW = 240;
const GY = 14;
const GH = 190;
const gx = (t: number) => GX + (t / T_END) * GW;
const gy = (v: number) => GY + GH - (v / 60) * GH;
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

type Run = { tissue: Tissue; T: number; pH: number; r: number };

const seed = (i: number) => {
  const x = Math.sin(i * 91.17 + 3.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Каталаза: колко кислород отделя тъканта от водороден пероксид при различни температура и pH. */
export default function CatalaseLab() {
  const [tissue, setTissue] = useState<Tissue>('liver');
  const [T, setT] = useState(20);
  const [pH, setPH] = useState(7);
  const [runs, setRuns] = useState<Run[]>([]);
  const sim = useSimulation(
    () => 0,
    (t, dt) => Math.min(T_END, t + dt),
    { dt: 1 / 10, speed: 20 }
  );
  const t = sim.state;
  const done = t >= T_END;
  const { running, pause } = sim;
  useEffect(() => {
    if (done && running) pause();
  }, [done, running, pause]);

  const r = rate(tissue, T, pH);
  const current = runs.length > 0 && (running || t > 0) ? runs[runs.length - 1] : null;
  const vNow = current ? volume(current.r, t) : 0;

  const start = () => {
    setRuns(rs => [...rs.slice(-(COLORS.length - 1)), { tissue, T, pH, r }]);
    sim.reset(0);
    sim.play();
  };
  const change = (f: () => void) => {
    f();
    if (running || t > 0) sim.reset(0);
  };

  const curve = (run: Run, upTo: number) =>
    Array.from({ length: 61 }, (_, i) => (i / 60) * upTo)
      .map(s => `${gx(s).toFixed(1)},${gy(volume(run.r, s)).toFixed(1)}`)
      .join(' ');

  // Мехурчета в епруветката – повече при по-бърза реакция, докато пероксидът свършва
  const shown = current ?? { tissue, T, pH, r: 0 };
  const activity = current ? (current.r * Math.exp((-current.r * t) / V_TOT)) / 1.2 : 0;
  const nBubbles = running ? Math.min(40, Math.round(activity * 40)) : 0;
  const foam = Math.min(46, vNow * 0.9 * Math.min(1, shown.r / 0.4 + 0.15));

  let note: string;
  if (!current) note = 'Избери тъкан, температура и pH и пусни опита. Всеки опит се добавя в таблицата.';
  else if (current.tissue === 'water') note = 'Без ензим пероксидът се разпада толкова бавно, че за две минути не се отделя видим газ. Това е контролата.';
  else if (current.tissue === 'boiled') note = 'Свареният черен дроб не отделя кислород: при варенето каталазата е денатурирала и формата на активния ѝ център е загубена.';
  else if (current.T >= 60) note = 'При тази температура почти цялата каталаза е денатурирала. Ако охладим епруветката, ензимът няма да се възстанови.';
  else if (current.T > 45) note = 'Над около 45 °C част от молекулите на ензима денатурират – скоростта пада, въпреки че ударите стават по-чести.';
  else if (Math.abs(current.pH - 7) >= 3) note = 'Далеч от оптималното pH йонните връзки в белтъка се променят и активният център вече не пасва на субстрата.';
  else note = 'Скоростта е най-голяма в началото и намалява, защото пероксидът свършва. Затова сравняваме началните скорости.';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 240" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Графика обем – време */}
        <line x1={GX} x2={GX + GW} y1={gy(0)} y2={gy(0)} className="stroke-gray-400" />
        <line x1={GX} x2={GX} y1={GY} y2={GY + GH} className="stroke-gray-400" />
        {[0, 10, 20, 30, 40, 50, 60].map(v => (
          <g key={v}>
            <line x1={GX} x2={GX + GW} y1={gy(v)} y2={gy(v)} className="stroke-gray-100 dark:stroke-gray-700" />
            <text x={GX - 6} y={gy(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">
              {v}
            </text>
          </g>
        ))}
        {[0, 30, 60, 90, 120].map(s => (
          <text key={s} x={gx(s)} y={GY + GH + 15} fontSize="11" textAnchor="middle" fill="currentColor">
            {s}
          </text>
        ))}
        <text x={GX + 6} y={GY + 10} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          O₂, mL
        </text>
        <text x={GX + GW} y={GY + GH + 30} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          време, s
        </text>
        {runs.map((run, i) => {
          const isCurrent = current !== null && i === runs.length - 1;
          return <polyline key={i} points={curve(run, isCurrent ? t : T_END)} fill="none" stroke={COLORS[i]} strokeWidth={isCurrent ? 3 : 2} opacity={isCurrent ? 1 : 0.7} />;
        })}

        {/* Газова спринцовка */}
        <rect x={330} y={22} width={130} height={22} rx={3} className="fill-sky-50 stroke-gray-400 dark:fill-sky-950/40" />
        <rect x={331} y={23} width={(vNow / 60) * 128} height={20} fill="#bae6fd" opacity="0.7" />
        <line x1={331 + (vNow / 60) * 128} x2={331 + (vNow / 60) * 128} y1={20} y2={46} stroke="#475569" strokeWidth="3" />
        <line x1={331 + (vNow / 60) * 128} x2={474} y1={33} y2={33} stroke="#475569" strokeWidth="2" />
        {[0, 20, 40, 60].map(v => (
          <g key={v}>
            <line x1={331 + (v / 60) * 128} x2={331 + (v / 60) * 128} y1={44} y2={49} className="stroke-gray-400" />
            <text x={331 + (v / 60) * 128} y={60} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              {v}
            </text>
          </g>
        ))}
        {/* Маркуч и епруветка */}
        <path d="M330 33 H318 V72 H372 V88" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinejoin="round" />
        <rect x={358} y={86} width={28} height={8} rx={2} fill="#475569" />
        <path d="M352 94 V196 a20 20 0 0 0 40 0 V94" className="fill-white stroke-gray-400 dark:fill-gray-900" strokeWidth="1.5" />
        <path d="M353 150 V196 a19 19 0 0 0 38 0 V150 Z" fill="#e0f2fe" opacity="0.9" />
        {foam > 1 && <rect x={353} y={150 - foam} width={38} height={foam} fill="#f8fafc" stroke="#cbd5e1" strokeDasharray="2 2" />}
        {shown.tissue !== 'water' && <ellipse cx={372} cy={205} rx={12} ry={6} fill={TISSUES[shown.tissue].color} stroke="#57534e" strokeWidth="0.8" />}
        {Array.from({ length: nBubbles }, (_, i) => {
          const phase = (seed(i) + t * (0.4 + seed(i + 99) * 0.5)) % 1;
          return <circle key={i} cx={357 + seed(i + 7) * 30} cy={200 - phase * 50} r={1.5 + seed(i + 3) * 1.5} fill="white" stroke="#0284c7" strokeWidth="0.7" />;
        })}
        <text x={415} y={130} fontSize="11" fill="currentColor">
          {fmt(shown.T, 0)} °C
        </text>
        <text x={415} y={146} fontSize="11" fill="currentColor">
          pH {shown.pH}
        </text>
        <text x={415} y={170} fontSize="12" fontWeight="700" fill="currentColor">
          {fmt(vNow)} mL
        </text>
      </LabSvg>

      <Buttons>
        {(Object.keys(TISSUES) as Tissue[]).map(k => (
          <DiagramButton key={k} active={tissue === k} onClick={() => change(() => setTissue(k))}>
            {TISSUES[k].label}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="T, °C" value={T} onChange={v => change(() => setT(v))} min={0} max={80} step={5} tone="rose" />
        <Slider label="pH" value={pH} onChange={v => change(() => setPH(v))} min={3} max={11} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton active={running} onClick={start}>
          ▶ Пусни опита
        </DiagramButton>
        {runs.length > 0 && (
          <DiagramButton
            onClick={() => {
              setRuns([]);
              sim.reset(0);
            }}
          >
            Изчисти
          </DiagramButton>
        )}
      </Buttons>
      <Note tone="violet">{note}</Note>

      {runs.length > 0 && (
        <div className="overflow-x-auto mt-3">
          <table className="mx-auto text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400">
                <th className="px-2 py-1"></th>
                <th className="px-2 py-1 text-left font-medium">тъкан</th>
                <th className="px-2 py-1 font-medium">T, °C</th>
                <th className="px-2 py-1 font-medium">pH</th>
                <th className="px-2 py-1 font-medium">O₂ за 30 s, mL</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run, i) => (
                <tr key={i} className="border-t border-gray-100 dark:border-gray-700 text-center font-mono">
                  <td className="px-2 py-1">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                  </td>
                  <td className="px-2 py-1 text-left font-sans">{TISSUES[run.tissue].label}</td>
                  <td className="px-2 py-1">{run.T}</td>
                  <td className="px-2 py-1">{run.pH}</td>
                  <td className="px-2 py-1">{fmt(volume(run.r, 30))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 В епруветката има 5 mL 3% водороден пероксид – от него се отделят най-много около 50 mL кислород. Количеството O₂ за първите 30 s
        е мярка за началната скорост. Задача: намери оптималната температура за каталазата от черен дроб. Числата са от опростен модел, но
        формата на зависимостите е като в истинския опит.
      </p>
    </div>
  );
}
