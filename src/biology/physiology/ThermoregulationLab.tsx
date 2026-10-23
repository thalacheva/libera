import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

/** Топлинен капацитет на тяло от 70 kg (≈ 3,5 kJ/(kg·K)), J/K. */
const C = 245000;
/** Основна обмяна в покой, W. */
const BASAL = 80;
/** Допълнителна топлина при бягане, W. */
const RUN = 600;
/** Максимално треперене, W. */
const SHIVER_MAX = 300;
/** 1 L пот на час, изпарен, отнема 2420 kJ / 3600 s ≈ 672 W. */
const SWEAT_W_PER_LH = 672;
/** Треската: зададената температура се вдига до 39 °C между тези минути. */
const FEVER_FROM = 20;
const FEVER_TO = 120;
const MINUTES = 180;
const DT = 6; // s

type Point = { t: number; T: number; S: number; shiver: number; dry: number; evap: number; sweat: number; vaso: number; M: number };

function simulate(ta: number, rh: number, run: boolean, clothed: boolean, fever: boolean) {
  const gMin = clothed ? 4.5 : 9; // W/K – свити кожни съдове
  const gMax = gMin * 3.3; // разширени
  const eMax = Math.min(700, (700 * (100 - rh)) / 70); // колко пот може да се изпари, W
  let T = 37;
  const out: Point[] = [];
  const steps = (MINUTES * 60) / DT;
  for (let k = 0; k <= steps; k++) {
    const t = (k * DT) / 60;
    const S = fever && t >= FEVER_FROM && t < FEVER_TO ? 39 : 37;
    const e = T - S;
    const vaso = Math.min(1, Math.max(0, (e + 0.15) / 0.4));
    const g = gMin + vaso * (gMax - gMin);
    const shiver = Math.min(SHIVER_MAX, Math.max(0, 600 * (-e - 0.4)));
    const sweatW = Math.min(2 * SWEAT_W_PER_LH, Math.max(0, 700 * (e - 0.1)));
    const evap = Math.min(sweatW, eMax);
    const M = BASAL + (run ? RUN : 0) + shiver;
    const dry = g * (T - ta);
    if (k % 10 === 0) out.push({ t, T, S, shiver, dry, evap, sweat: sweatW / SWEAT_W_PER_LH, vaso, M });
    if (T < 42.5) T += ((M - dry - evap) * DT) / C;
  }
  return out;
}

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',').replace('-', '−');

// графиката
const X0 = 50;
const X1 = 420;
const Y0 = 290;
const Y1 = 30;
const TMIN = 33;
const TMAX = 43;
const px = (t: number) => X0 + (t / MINUTES) * (X1 - X0);
const py = (T: number) => Y0 - ((Math.min(TMAX, Math.max(TMIN, T)) - TMIN) / (TMAX - TMIN)) * (Y0 - Y1);

/** Терморегулация: отрицателна обратна връзка около зададена температура 37 °C (и 39 °C при треска). */
export default function ThermoregulationLab() {
  const [ta, setTa] = useState(22);
  const [rh, setRh] = useState(50);
  const [run, setRun] = useState(false);
  const [clothed, setClothed] = useState(true);
  const [fever, setFever] = useState(false);
  const [cursor, setCursor] = useState(90);

  const data = useMemo(() => simulate(ta, rh, run, clothed, fever), [ta, rh, run, clothed, fever]);
  const at = data[Math.min(data.length - 1, Math.round(cursor))];
  const path = data.map((d, k) => `${k ? 'L' : 'M'} ${px(d.t).toFixed(1)} ${py(d.T).toFixed(1)}`).join(' ');
  const setPath = data.map((d, k) => `${k ? 'L' : 'M'} ${px(d.t).toFixed(1)} ${py(d.S).toFixed(1)}`).join(' ');
  const peak = Math.max(...data.map(d => d.T));
  const low = Math.min(...data.map(d => d.T));

  const flows = [
    { name: 'произвежда', w: at.M, color: '#f97316' },
    { name: 'отдава (кожа)', w: at.dry, color: '#0ea5e9' },
    { name: 'изпарява пот', w: at.evap, color: '#8b5cf6' },
  ];

  let msg: string;
  if (peak >= 40.5) msg = 'Топлината се трупа по-бързо, отколкото тялото я губи: над 40 °C идва топлинен удар. Във влажен въздух потта не се изпарява и не охлажда – тече напразно.';
  else if (low <= 35) msg = 'Хипотермия: дори с максимално треперене и свити съдове тялото губи повече топлина, отколкото произвежда. Облечи се!';
  else if (fever && at.t >= FEVER_FROM && at.t < FEVER_FROM + 40) msg = 'Зададената стойност скочи на 39 °C, а тялото е „само“ 37 °C – чувства студ: трепери и кожата бледнее. Това са тръпките в началото на треската.';
  else if (fever && at.t >= FEVER_TO && at.t < FEVER_TO + 40) msg = 'Треската „пада“: зададената стойност е отново 37 °C, тялото е по-топло – кожата се зачервява и човек се облива в пот.';
  else if (at.shiver > 5) msg = 'Студено: кожните съдове са свити и мускулите треперят, за да произведат топлина.';
  else if (at.evap > 5) msg = 'Топло: кожните съдове са разширени и тялото се изпотява – изпарението отнема топлина.';
  else msg = 'Зона на топлинен комфорт: температурата се държи само с ширината на кожните съдове.';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={X0} y={py(42)} width={X1 - X0} height={py(40) - py(42)} fill="#ef4444" opacity={0.1} />
        <rect x={X0} y={py(35)} width={X1 - X0} height={py(33) - py(35)} fill="#3b82f6" opacity={0.1} />
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="currentColor" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="currentColor" />
        {[0, 30, 60, 90, 120, 150, 180].map(v => (
          <g key={v}>
            <line x1={px(v)} x2={px(v)} y1={Y0} y2={Y0 + 4} stroke="currentColor" />
            <text x={px(v)} y={Y0 + 16} fontSize="11" textAnchor="middle" fill="currentColor">{v}</text>
          </g>
        ))}
        {[33, 35, 37, 39, 41, 43].map(v => (
          <g key={v}>
            <line x1={X0 - 4} x2={X1} y1={py(v)} y2={py(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 8} y={py(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">{v}</text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={Y0 + 32} fontSize="12" textAnchor="middle" fill="currentColor">време, min</text>
        <text x={X0 + 4} y={Y1 - 10} fontSize="12" fill="currentColor">температура в тялото, °C</text>

        <path d={setPath} fill="none" stroke="#64748b" strokeWidth={2} strokeDasharray="6 4" />
        <path d={path} fill="none" stroke="#e11d48" strokeWidth={3} />
        <line x1={px(at.t)} x2={px(at.t)} y1={Y0} y2={Y1} stroke="#0ea5e9" strokeDasharray="3 3" />
        <circle cx={px(at.t)} cy={py(at.T)} r={5} fill="#e11d48" />

        {/* потоци на топлина в избрания момент */}
        <text x={455} y={44} fontSize="12" fontWeight="700" fill="currentColor">
          в {Math.round(at.t)}-та минута, W
        </text>
        {flows.map((f, k) => {
          const y = 66 + k * 54;
          const w = (Math.min(Math.max(f.w, 0), 1000) / 1000) * 125;
          return (
            <g key={f.name}>
              <text x={455} y={y} fontSize="12" fill="currentColor">{f.name}</text>
              <rect x={455} y={y + 6} width={Math.max(w, 1)} height={18} rx={2} fill={f.color} opacity={0.85} />
              <text x={455 + Math.max(w, 1) + 4} y={y + 20} fontSize="11" fill="currentColor">
                {Math.round(f.w)}
              </text>
            </g>
          );
        })}
        {/* кожните съдове */}
        <text x={455} y={240} fontSize="12" fill="currentColor">кожни съдове</text>
        <ellipse cx={500} cy={268} rx={12 + 26 * at.vaso} ry={6 + 6 * at.vaso} fill="#ef4444" opacity={0.35 + 0.5 * at.vaso} />
        <text x={548} y={272} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          {at.vaso < 0.1 ? 'свити' : at.vaso > 0.9 ? 'разширени' : 'отчасти'}
        </text>
      </LabSvg>

      <Buttons>
        <DiagramButton active={run} onClick={() => setRun(!run)}>
          🏃 бягане
        </DiagramButton>
        <DiagramButton active={clothed} onClick={() => setClothed(!clothed)}>
          🧥 облечен
        </DiagramButton>
        <DiagramButton active={fever} onClick={() => setFever(!fever)}>
          🤒 треска (20.–120. min)
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="въздух" value={ta} onChange={setTa} min={-10} max={45} step={1} tone="amber" />
        <Slider label="влажн." value={rh} onChange={setRh} min={20} max={100} step={5} tone="blue" />
        <Slider label="t, min" value={cursor} onChange={setCursor} min={0} max={MINUTES} step={1} tone="gray" />
      </Sliders>

      <Readout
        items={[
          { label: 'T', value: `${fmt(at.T, 2)} °C`, tone: 'rose' },
          { label: 'зададена', value: `${at.S} °C`, tone: 'gray' },
          { label: 'треперене', value: `${Math.round(at.shiver)} W`, tone: 'amber' },
          { label: 'пот', value: `${fmt(at.sweat, 2)} L/h`, tone: 'violet' },
        ]}
      />
      <Note tone="rose">{msg}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моделът: тяло от 70 kg (C ≈ 245 kJ/K) произвежда {BASAL} W в покой и още {RUN} W при бягане. Хипоталамусът сравнява
        температурата T със зададената стойност: под нея свива кожните съдове и после включва треперенето (до {SHIVER_MAX} W), над нея
        разширява съдовете и включва потенето. Изпарението на 1 L пот на час отнема около 670 W, но колкото по-влажен е въздухът,
        толкова по-малко пот успява да се изпари. Плъзгачите: температура на въздуха (°C), относителна влажност (%) и момент от времето (min). Числата са приблизителни – пробвай −10 °C без дрехи или бягане при 35 °C и 90 % влажност.
      </p>
    </div>
  );
}
