import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

/** Колко дни е заразен един болен (еднакво за всички болести в модела). */
const D = 7;
const DAYS = 240;
const DT = 0.05;
/** Заразени в началото – дял от населението. */
const I0 = 0.001;

const PRESETS: { name: string; r0: number }[] = [
  { name: 'грип', r0: 1.5 },
  { name: 'COVID-19 (2020)', r0: 2.5 },
  { name: 'полиомиелит', r0: 6 },
  { name: 'варицела', r0: 10 },
  { name: 'морбили', r0: 15 },
];

/** Модел SIR: S – податливи, I – заразни, R – преболедували; ваксинираните и защитени започват направо в „имунни“. */
function simulate(r0: number, protectedFrac: number) {
  const gamma = 1 / D;
  const beta = r0 * gamma;
  let I = I0;
  let S = Math.max(0, 1 - protectedFrac - I0);
  let R = 0;
  let peak = I;
  const out: { t: number; S: number; I: number; R: number }[] = [];
  const steps = DAYS / DT;
  for (let k = 0; k <= steps; k++) {
    if (k % 40 === 0) out.push({ t: k * DT, S, I, R });
    const inf = beta * S * I * DT;
    const rec = gamma * I * DT;
    S -= inf;
    I += inf - rec;
    R += rec;
    peak = Math.max(peak, I);
  }
  return { out, peak, attack: R + I };
}

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

const X0 = 50;
const X1 = 400;
const Y0 = 280;
const Y1 = 40;
const px = (t: number) => X0 + (t / DAYS) * (X1 - X0);
const py = (f: number) => Y0 - Math.min(1, Math.max(0, f)) * (Y0 - Y1);

/** Колективен имунитет: епидемия по модела SIR при различни R₀, ваксинален обхват и ефективност на ваксината. */
export default function HerdImmunityLab() {
  const [r0, setR0] = useState(2.5);
  const [cover, setCover] = useState(40);
  const [eff, setEff] = useState(95);

  const protectedFrac = (cover / 100) * (eff / 100);
  const { out, peak, attack } = useMemo(() => simulate(r0, protectedFrac), [r0, protectedFrac]);
  const rEff = r0 * (1 - protectedFrac);
  const hit = 1 - 1 / r0;
  const needCover = hit / (eff / 100);

  const path = (f: (d: (typeof out)[number]) => number) => out.map((d, k) => `${k ? 'L' : 'M'} ${px(d.t).toFixed(1)} ${py(f(d)).toFixed(1)}`).join(' ');

  // 100 души: защитени от ваксината, преболедували, незасегнати
  const nVac = Math.round(protectedFrac * 100);
  const nInf = Math.min(100 - nVac, Math.round(attack * 100));
  const people = Array.from({ length: 100 }, (_, k) => (k < nVac ? 'vac' : k < nVac + nInf ? 'inf' : 'free'));
  const color = { vac: '#3b82f6', inf: '#e11d48', free: '#9ca3af' } as const;

  let msg: string;
  if (r0 <= 1) msg = 'R₀ ≤ 1: всеки болен заразява средно по-малко от един човек и болестта сама изчезва.';
  else if (rEff < 1)
    msg = `Ефективното R = ${fmt(rEff, 2)} < 1: огнището угасва, без да обхване неваксинираните. Това е колективният имунитет – той пази и бебетата, и хората, които не могат да се ваксинират.`;
  else if (needCover > 1)
    msg = `Дори 100 % обхват не стига: с ваксина, която пази ${eff} % от ваксинираните, се защитават най-много ${eff} % от хората, а прагът е ${fmt(hit * 100)} %. Нужна е по-ефективна ваксина (или повече дози).`;
  else
    msg = `R = ${fmt(rEff, 2)} > 1 – епидемията тръгва. За да спре, трябва ваксинирани поне ${fmt(needCover * 100)} % от хората. Обърни внимание: дори под прага всяка ваксинация намалява и пика, и общия брой болни.`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="currentColor" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="currentColor" />
        {[0, 60, 120, 180, 240].map(v => (
          <g key={v}>
            <line x1={px(v)} x2={px(v)} y1={Y0} y2={Y0 + 4} stroke="currentColor" />
            <text x={px(v)} y={Y0 + 16} fontSize="11" textAnchor="middle" fill="currentColor">{v}</text>
          </g>
        ))}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={X0 - 4} x2={X1} y1={py(v / 100)} y2={py(v / 100)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 8} y={py(v / 100) + 4} fontSize="11" textAnchor="end" fill="currentColor">{v}</text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={Y0 + 32} fontSize="12" textAnchor="middle" fill="currentColor">време, дни</text>
        <text x={X0 + 4} y={Y1 - 14} fontSize="12" fill="currentColor">% от населението</text>

        <rect x={X0} y={py(protectedFrac)} width={X1 - X0} height={Y0 - py(protectedFrac)} fill="#3b82f6" opacity={0.1} />
        <path d={path(d => d.S)} fill="none" stroke="#64748b" strokeWidth={2.5} />
        <path d={path(d => d.I)} fill="none" stroke="#e11d48" strokeWidth={3} />
        <path d={path(d => d.R)} fill="none" stroke="#f59e0b" strokeWidth={2.5} />
        <g fontSize="11">
          <text x={X1 - 4} y={Y1 + 12} textAnchor="end" fill="#64748b">податливи S</text>
          <text x={X1 - 4} y={Y1 + 26} textAnchor="end" fill="#e11d48">болни I</text>
          <text x={X1 - 4} y={Y1 + 40} textAnchor="end" fill="#d97706">преболедували R</text>
        </g>

        {/* 100 души */}
        <text x={440} y={Y1 - 14} fontSize="12" fontWeight="700" fill="currentColor">100 души след епидемията</text>
        {people.map((p, k) => (
          <circle key={k} cx={450 + (k % 10) * 17} cy={Y1 + 8 + Math.floor(k / 10) * 17} r={6.5} fill={color[p]} />
        ))}
        <g fontSize="11" fill="currentColor">
          <circle cx={448} cy={Y1 + 190} r={5} fill={color.vac} />
          <text x={458} y={Y1 + 194}>защитени от ваксина: {nVac}</text>
          <circle cx={448} cy={Y1 + 208} r={5} fill={color.inf} />
          <text x={458} y={Y1 + 212}>преболедували: {nInf}</text>
          <circle cx={448} cy={Y1 + 226} r={5} fill={color.free} />
          <text x={458} y={Y1 + 230}>незасегнати: {100 - nVac - nInf}</text>
        </g>
      </LabSvg>

      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.name} active={r0 === p.r0} onClick={() => setR0(p.r0)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="R₀" value={r0} onChange={setR0} min={0.5} max={20} step={0.5} tone="rose" />
        <Slider label="обхват" value={cover} onChange={setCover} min={0} max={100} step={1} tone="blue" />
        <Slider label="ефект." value={eff} onChange={setEff} min={50} max={100} step={1} tone="emerald" />
      </Sliders>

      <Readout
        items={[
          { label: 'R', value: fmt(rEff, 2), tone: rEff < 1 ? 'emerald' : 'rose' },
          { label: 'праг', value: r0 <= 1 ? '0 %' : `${fmt(hit * 100)} %`, tone: 'violet' },
          { label: 'пик болни', value: `${fmt(peak * 100)} %`, tone: 'rose' },
          { label: 'преболедували', value: `${fmt(attack * 100)} %`, tone: 'amber' },
        ]}
      />
      <Formula>
        R = R₀ · (1 − обхват · ефективност) = {fmt(r0)} · (1 − {fmt(cover / 100, 2)} · {fmt(eff / 100, 2)}) = {fmt(rEff, 2)}
      </Formula>
      <Note tone="rose">{msg}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моделът SIR: всеки болен е заразен {D} дни и заразява средно R₀ души, ако всички около него са податливи; ваксинираните и
        защитени започват направо като имунни. Прагът на колективния имунитет е 1 − 1/R₀ – тогава всеки болен заразява средно по-малко
        от един човек. Стойностите на R₀ за болестите са примерни: различните изследвания дават различни числа (за морбили обикновено
        12–18, за сезонния грип – около 1,2–2), а R₀ зависи и от това колко гъсто и как живеят хората. Населението е смесено равномерно и
        затворено – истинските епидемии са по-сложни.
      </p>
    </div>
  );
}
