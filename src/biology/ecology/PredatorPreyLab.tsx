import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

/** Коефициенти на срещите – близки до оценките за зайците и рисовете (хиляди животни, години). */
const B = 0.028;
const D = 0.026;
const T = 60;
const H = 0.01;

const CAPS: { name: string; k: number | null }[] = [
  { name: 'без капацитет за зайците', k: null },
  { name: 'K = 150 хил.', k: 150 },
  { name: 'K = 60 хил.', k: 60 },
];

/** Лотка–Волтера (по желание с логистичен растеж на жертвата), метод на Рунге–Кута. */
function simulate(a: number, g: number, h0: number, p0: number, k: number | null) {
  const f = (x: number, y: number): [number, number] => [a * x * (1 - (k ? x / k : 0)) - B * x * y, D * x * y - g * y];
  let x = h0;
  let y = p0;
  const out: { t: number; x: number; y: number }[] = [{ t: 0, x, y }];
  const steps = Math.round(T / H);
  for (let i = 1; i <= steps; i++) {
    const k1 = f(x, y);
    const k2 = f(x + (H / 2) * k1[0], y + (H / 2) * k1[1]);
    const k3 = f(x + (H / 2) * k2[0], y + (H / 2) * k2[1]);
    const k4 = f(x + H * k3[0], y + H * k3[1]);
    x += (H / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    y += (H / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    if (i % 10 === 0) out.push({ t: i * H, x, y });
  }
  return out;
}

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

// времеви ред
const X0 = 45;
const X1 = 375;
const Y0 = 270;
const Y1 = 40;
const tx = (t: number) => X0 + (t / T) * (X1 - X0);
// фазова равнина
const PX0 = 425;
const PX1 = 625;
const PS = PX1 - PX0;

/** Хищник и жертва: модел на Лотка–Волтера – времеви ред и фазова равнина. */
export default function PredatorPreyLab() {
  const [a, setA] = useState(0.55);
  const [g, setG] = useState(0.84);
  const [h0, setH0] = useState(40);
  const [p0, setP0] = useState(10);
  const [cap, setCap] = useState(0);
  const [t, setT] = useState(15);

  const k = CAPS[cap].k;
  const out = useMemo(() => simulate(a, g, h0, p0, k), [a, g, h0, p0, k]);
  const hStar = g / D;
  const pStar = (a / B) * (1 - (k ? hStar / k : 0));
  const period = (2 * Math.PI) / Math.sqrt(a * g);
  // мащаб според данните: до най-близкото кратно на 20 над максимума
  const vm = Math.max(40, Math.ceil((Math.max(hStar, pStar, ...out.map(d => Math.max(d.x, d.y))) * 1.05) / 20) * 20);
  const vy = (v: number) => Y0 - (Math.min(v, vm) / vm) * (Y0 - Y1);
  const phx = (v: number) => PX0 + (Math.min(v, vm) / vm) * PS;
  const phy = (v: number) => Y0 - (Math.min(v, vm) / vm) * PS;
  const ticks = [0, vm / 4, vm / 2, (3 * vm) / 4, vm];
  const now = out[Math.min(out.length - 1, Math.round(t / (H * 10)))];

  const line = (f: (d: (typeof out)[number]) => [number, number]) =>
    out.map((d, i) => `${i ? 'L' : 'M'} ${f(d)[0].toFixed(1)} ${f(d)[1].toFixed(1)}`).join(' ');

  const last = out.slice(-Math.round(15 / (H * 10)));
  const swing = Math.max(...last.map(d => d.x)) - Math.min(...last.map(d => d.x));

  let msg: string;
  if (k && hStar >= k) msg = `Зайците не могат да станат ${fmt(hStar, 0)} хил. – повече, отколкото средата побира (K = ${k}). Рисовете нямат достатъчно храна и изчезват.`;
  else if (k) msg = `С ограничена храна за зайците колебанията затихват и двата вида се установяват около равновесието (${fmt(hStar, 0)} хил. зайци, ${fmt(pStar, 0)} хил. риса).`;
  else msg = `Без ограничение за зайците цикълът се повтаря безкрай: пикът на рисовете идва след пика на зайците. Период ≈ ${fmt(period)} години при малки колебания.`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 310" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* времеви ред */}
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="currentColor" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="currentColor" />
        {[0, 20, 40, 60].map(v => (
          <g key={v}>
            <line x1={tx(v)} x2={tx(v)} y1={Y0} y2={Y0 + 4} stroke="currentColor" />
            <text x={tx(v)} y={Y0 + 16} fontSize="11" textAnchor="middle" fill="currentColor">{v}</text>
          </g>
        ))}
        {ticks.map(v => (
          <g key={v}>
            <line x1={X0 - 4} x2={X1} y1={vy(v)} y2={vy(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 7} y={vy(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">{fmt(v, 0)}</text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={Y0 + 32} fontSize="12" textAnchor="middle" fill="currentColor">години</text>
        <text x={X0} y={Y1 - 14} fontSize="12" fill="currentColor">хиляди животни</text>
        <path d={line(d => [tx(d.t), vy(d.x)])} fill="none" stroke="#a16207" strokeWidth={2.5} />
        <path d={line(d => [tx(d.t), vy(d.y)])} fill="none" stroke="#7c3aed" strokeWidth={2.5} />
        <line x1={tx(t)} x2={tx(t)} y1={Y0} y2={Y1} stroke="#94a3b8" strokeDasharray="3 3" />
        <circle cx={tx(t)} cy={vy(now.x)} r={4.5} fill="#a16207" />
        <circle cx={tx(t)} cy={vy(now.y)} r={4.5} fill="#7c3aed" />
        <g fontSize="11">
          <text x={X1 - 4} y={Y1 + 4} textAnchor="end" fill="#a16207">🐇 зайци H</text>
          <text x={X1 - 4} y={Y1 + 18} textAnchor="end" fill="#7c3aed">🐈 рисове P</text>
        </g>

        {/* фазова равнина */}
        <rect x={PX0} y={Y0 - PS} width={PX1 - PX0} height={PX1 - PX0} fill="none" stroke="currentColor" />
        <text x={(PX0 + PX1) / 2} y={Y0 + 16} fontSize="11" textAnchor="middle" fill="#a16207">зайци H →</text>
        <text x={PX0 - 6} y={Y0 - PS - 6} fontSize="11" fill="#7c3aed">↑ рисове P</text>
        <path d={line(d => [phx(d.x), phy(d.y)])} fill="none" stroke="#0ea5e9" strokeWidth={1.8} />
        <line x1={phx(hStar)} x2={phx(hStar)} y1={Y0} y2={Y0 - PS} stroke="#7c3aed" strokeDasharray="3 3" opacity={0.6} />
        {pStar > 0 && <line x1={PX0} x2={PX1} y1={phy(pStar)} y2={phy(pStar)} stroke="#a16207" strokeDasharray="3 3" opacity={0.6} />}
        {pStar > 0 && <circle cx={phx(hStar)} cy={phy(pStar)} r={4} fill="none" stroke="#e11d48" strokeWidth={2} />}
        <circle cx={phx(now.x)} cy={phy(now.y)} r={5} fill="#0ea5e9" />
        <g fontSize="10" fill="currentColor">
          <text x={PX0} y={Y0 + 12} textAnchor="middle">0</text>
          <text x={PX1} y={Y0 + 12} textAnchor="middle">{vm}</text>
          <text x={PX0 - 4} y={Y0 - PS + 4} textAnchor="end">{vm}</text>
        </g>
        <text x={PX1 - 4} y={Y0 - PS + 14} fontSize="10" textAnchor="end" fill="#e11d48">○ равновесие</text>
      </LabSvg>

      <Buttons>
        {CAPS.map((c, i) => (
          <DiagramButton key={c.name} active={cap === i} onClick={() => setCap(i)}>
            {c.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="α" value={a} onChange={setA} min={0.3} max={1} step={0.05} tone="amber" />
        <Slider label="γ" value={g} onChange={setG} min={0.3} max={1.2} step={0.02} tone="violet" />
        <Slider label="H₀" value={h0} onChange={setH0} min={10} max={80} step={2} tone="amber" />
        <Slider label="P₀" value={p0} onChange={setP0} min={2} max={40} step={1} tone="violet" />
        <Slider label="t" value={t} onChange={setT} min={0} max={60} step={0.5} tone="gray" />
      </Sliders>

      <Readout
        items={[
          { label: 'H* = γ/δ', value: `${fmt(hStar)} хил.`, tone: 'amber' },
          { label: 'P*', value: pStar > 0 ? `${fmt(pStar)} хил.` : '0', tone: 'violet' },
          { label: 'период', value: `≈ ${fmt(period)} г.`, tone: 'blue' },
          { label: 'размах (15 г.)', value: `${fmt(swing, 0)} хил.`, tone: 'rose' },
        ]}
      />
      <Formula>
        dH/dt = αH{k ? `(1 − H/${k})` : ''} − βHP · dP/dt = δHP − γP
      </Formula>
      <Note tone="violet">{msg}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 α – раждаемостта на зайците, γ – смъртността на рисовете без храна; β = {fmt(B, 3)} и δ = {fmt(D, 3)} показват колко
        често срещата завършва с изяден заек и колко нови риса „струва“ един изяден заек. Стойностите са близки до често цитирани
        оценки по кожите, изкупувани от компанията „Хъдсън Бей“, но реалните цикли зависят и от храната на зайците, болести и
        други хищници. Вдясно е фазовата равнина: всяка точка е двойката (H, P) в един момент, а при модела без капацитет
        траекторията е затворена крива около равновесието.
      </p>
    </div>
  );
}
