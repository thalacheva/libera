import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

/** Приблизителен полуживот в кръвта, в минути. */
const HORMONES = [
  { name: 'адреналин', half: 2.5 },
  { name: 'инсулин', half: 5 },
  { name: 'АДХ', half: 15 },
  { name: 'кортизол', half: 70 },
  { name: 'T3', half: 24 * 60 },
  { name: 'T4', half: 7 * 24 * 60 },
] as const;

type Mode = 'pulse' | 'steady' | 'doses';

const fmt = (v: number, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toString().replace('.', ',');

/** Време в минути → в удобни единици. */
function timeText(min: number) {
  if (min < 120) return `${fmt(min, min < 10 ? 1 : 0)} min`;
  if (min < 3 * 24 * 60) return `${fmt(min / 60, min < 600 ? 1 : 0)} h`;
  return `${fmt(min / 1440, 1)} дни`;
}

// графиката
const X0 = 50;
const X1 = 600;
const Y0 = 270;
const Y1 = 30;
const SPAN = 10; // полуживота по оста x

/** Полуживот на хормон: един импулс, постоянно отделяне и повтарящи се дози. */
export default function HormoneHalfLifeLab() {
  const [h, setH] = useState(3);
  const [mode, setMode] = useState<Mode>('doses');
  const [tau, setTau] = useState(1); // интервал между дозите, в полуживоти
  const half = HORMONES[h].half;
  const r = Math.pow(2, -tau);
  const acc = 1 / (1 - r);

  // концентрация като функция на времето (в полуживоти); 1 = върхът след един импулс
  const conc = (t: number) => {
    if (mode === 'pulse') return Math.pow(2, -t);
    if (mode === 'steady') return 1 - Math.pow(2, -t);
    const n = Math.floor(t / tau + 1e-9); // брой дози преди t (без първата)
    const since = t - n * tau;
    return ((1 - Math.pow(r, n + 1)) / (1 - r)) * Math.pow(2, -since);
  };
  const yMax = mode === 'doses' ? Math.max(1.2, acc * 1.1) : 1.2;
  const px = (t: number) => X0 + (t / SPAN) * (X1 - X0);
  const py = (c: number) => Y0 - (c / yMax) * (Y0 - Y1);

  const N = 600;
  let d = '';
  for (let k = 0; k <= N; k++) {
    const t = (k / N) * SPAN;
    // точно преди и след всяка доза – вертикален скок
    if (mode === 'doses' && k > 0) {
      const prev = ((k - 1) / N) * SPAN;
      const jump = Math.floor(t / tau + 1e-9) > Math.floor(prev / tau + 1e-9);
      if (jump) {
        const tj = Math.floor(t / tau + 1e-9) * tau;
        d += ` L ${px(tj).toFixed(1)} ${py(conc(tj - 1e-6)).toFixed(1)} L ${px(tj).toFixed(1)} ${py(conc(tj)).toFixed(1)}`;
      }
    }
    d += `${k ? ' L' : 'M'} ${px(t).toFixed(1)} ${py(conc(t)).toFixed(1)}`;
  }

  const ticksY = yMax > 1.3 ? Array.from({ length: Math.floor(yMax) + 1 }, (_, k) => k).filter(v => yMax < 6 || v % 2 === 0) : [0, 0.25, 0.5, 0.75, 1];

  let readout: { label: string; value: string; tone?: 'rose' | 'blue' | 'violet' | 'emerald' | 'amber' }[];
  let formula: string;
  let note: string;
  if (mode === 'pulse') {
    readout = [
      { label: 't½', value: timeText(half), tone: 'rose' },
      { label: 'k = ln2/t½', value: `${fmt(Math.log(2) / half, 4)} /min`, tone: 'blue' },
      { label: '1 % остава след', value: timeText(half * Math.log2(100)), tone: 'violet' },
    ];
    formula = `C = C₀ · 2^(−t / t½); след 10 полуживота остава 2⁻¹⁰ ≈ 0,1 %`;
    note = 'След всеки полуживот остава половината. Ако жлезата спре, хормонът изчезва толкова бързо, колкото е краткият му полуживот.';
  } else if (mode === 'steady') {
    readout = [
      { label: 't½', value: timeText(half), tone: 'rose' },
      { label: '50 % от нивото', value: timeText(half), tone: 'blue' },
      { label: '90 % от нивото', value: timeText(half * Math.log2(10)), tone: 'violet' },
    ];
    formula = 'C = C_ст · (1 − 2^(−t / t½)); C_ст = скорост на отделяне / (k · V)';
    note = 'При постоянно отделяне нивото расте, докато разграждането стане равно на отделянето. Времето дотам зависи само от полуживота – около 3,3 полуживота до 90 %.';
  } else {
    readout = [
      { label: 'интервал', value: timeText(half * tau), tone: 'rose' },
      { label: 'натрупване', value: `× ${fmt(acc, 2)}`, tone: 'blue' },
      { label: 'връх', value: `${fmt(acc, 2)}`, tone: 'violet' },
      { label: 'дъно', value: `${fmt(acc * r, 2)}`, tone: 'emerald' },
    ];
    formula = `R = 1 / (1 − 2^(−τ / t½)) = 1 / (1 − ${fmt(r, 3)}) = ${fmt(acc, 2)}`;
    note =
      tau <= 0.5
        ? 'Дозите са много по-често от полуживота: нивото се натрупва много и почти не се колебае – като постоянно отделяне.'
        : tau >= 3
          ? 'Дозите са рядко: между тях хормонът почти изчезва и нивото силно се колебае – импулси.'
          : 'Нивото се натрупва, докато за един интервал се разгради точно колкото носи една доза.';
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {HORMONES.map((v, k) => (
          <DiagramButton key={v.name} onClick={() => setH(k)} active={h === k}>
            {v.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton onClick={() => setMode('pulse')} active={mode === 'pulse'}>
          един импулс
        </DiagramButton>
        <DiagramButton onClick={() => setMode('steady')} active={mode === 'steady'}>
          постоянно отделяне
        </DiagramButton>
        <DiagramButton onClick={() => setMode('doses')} active={mode === 'doses'}>
          повтарящи се дози
        </DiagramButton>
      </Buttons>

      <LabSvg viewBox="0 0 640 320" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="currentColor" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="currentColor" />
        {Array.from({ length: SPAN + 1 }, (_, k) => (
          <g key={k}>
            <line x1={px(k)} x2={px(k)} y1={Y0} y2={Y1} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={px(k)} y={Y0 + 16} fontSize="11" textAnchor="middle" fill="currentColor">{k}</text>
          </g>
        ))}
        {ticksY.map(v => (
          <text key={v} x={X0 - 6} y={py(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">{fmt(v, 2)}</text>
        ))}
        <text x={(X0 + X1) / 2} y={Y0 + 34} fontSize="12" textAnchor="middle" fill="currentColor">
          време в полуживоти (1 полуживот = {timeText(half)})
        </text>
        <text x={X0 + 4} y={Y1 - 10} fontSize="12" fill="currentColor">концентрация (1 = върхът след една доза)</text>
        {mode === 'steady' && <line x1={X0} x2={X1} y1={py(1)} y2={py(1)} stroke="#64748b" strokeDasharray="5 4" />}
        {mode === 'doses' && <line x1={X0} x2={X1} y1={py(acc)} y2={py(acc)} stroke="#64748b" strokeDasharray="5 4" />}
        {mode === 'doses' && <line x1={X0} x2={X1} y1={py(acc * r)} y2={py(acc * r)} stroke="#10b981" strokeDasharray="5 4" />}
        <path d={d} fill="none" stroke="#e11d48" strokeWidth={2.5} />
        {mode === 'pulse' &&
          [1, 2, 3, 4].map(k => (
            <g key={k}>
              <circle cx={px(k)} cy={py(Math.pow(2, -k))} r={4} fill="#e11d48" />
              <text x={px(k) + 6} y={py(Math.pow(2, -k)) - 6} fontSize="11" fill="currentColor">{fmt(100 / 2 ** k, 2)} %</text>
            </g>
          ))}
      </LabSvg>

      {mode === 'doses' && (
        <Sliders>
          <Slider label="τ / t½" value={tau} onChange={setTau} min={0.25} max={4} step={0.25} tone="rose" />
        </Sliders>
      )}

      <Readout items={readout} />
      <Formula>{formula}</Formula>
      <Note tone="rose">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Полуживотите са приблизителни (за адреналина – 2–3 min, за кортизола – около час до час и половина, за T4 – около седмица)
        и се различават между хората. Графиката по оста x е в полуживоти – затова за всички хормони изглежда еднакво; различна е
        само мярката под нея. Пептидите се разграждат за минути, а T4 е свързан с белтъци в кръвта и се пази дълго – затова таблетката
        тироксин се пие веднъж на ден, а инсулинът при диабет трябва да се дава по-често или като бавно освобождаваща се форма.
      </p>
    </div>
  );
}
