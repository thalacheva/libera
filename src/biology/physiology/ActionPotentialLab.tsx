import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

// Моделът на Ходжкин и Хъксли (1952) за аксона на калмара, в съвременния запис (покой при −65 mV).
// Скоростите на вратите са умножени по PHI = 5 – като при около 21 °C вместо 6,3 °C, – за да е импулсът дълъг около 1 ms.
const PHI = 5;
const E_NA = 50;
const E_K = -77;
const E_L = -54.387;
const G_NA = 120;
const G_K = 36;
const G_L = 0.3;
const T_END = 12; // ms
const DT = 0.005; // ms
const PULSE = 0.5; // ms – продължителност на всеки стимул
const T1 = 1; // ms – начало на първия стимул
const EVERY = 10; // записваме всяка 10-а стъпка

function rates(v: number) {
  const am = Math.abs(v + 40) < 1e-6 ? 1 : (0.1 * (v + 40)) / (1 - Math.exp(-(v + 40) / 10));
  const bm = 4 * Math.exp(-(v + 65) / 18);
  const ah = 0.07 * Math.exp(-(v + 65) / 20);
  const bh = 1 / (1 + Math.exp(-(v + 35) / 10));
  const an = Math.abs(v + 55) < 1e-6 ? 0.1 : (0.01 * (v + 55)) / (1 - Math.exp(-(v + 55) / 10));
  const bn = 0.125 * Math.exp(-(v + 65) / 80);
  return [am, bm, ah, bh, an, bn].map(x => x * PHI);
}

type Sample = { t: number; v: number; gNa: number; gK: number };

/** Пресмята мембранния потенциал за 12 ms при един или два стимула (сила i в µA/cm²). */
function simulate(i: number, second: number | null, ttx: boolean, tea: boolean) {
  const gNaMax = ttx ? 0 : G_NA;
  const gKMax = tea ? 0 : G_K;
  let v = -65;
  const [am, bm, ah, bh, an, bn] = rates(v);
  let m = am / (am + bm);
  let h = ah / (ah + bh);
  let n = an / (an + bn);
  const out: Sample[] = [];
  const steps = Math.round(T_END / DT);
  for (let k = 0; k <= steps; k++) {
    const t = k * DT;
    const gNa = gNaMax * m * m * m * h;
    const gK = gKMax * n * n * n * n;
    if (k % EVERY === 0) out.push({ t, v, gNa, gK });
    let stim = 0;
    if (t >= T1 && t < T1 + PULSE) stim = i;
    if (second !== null && t >= T1 + second && t < T1 + second + PULSE) stim = i;
    const [am2, bm2, ah2, bh2, an2, bn2] = rates(v);
    v += DT * (stim - gNa * (v - E_NA) - gK * (v - E_K) - G_L * (v - E_L));
    m += DT * (am2 * (1 - m) - bm2 * m);
    h += DT * (ah2 * (1 - h) - bh2 * h);
    n += DT * (an2 * (1 - n) - bn2 * n);
  }
  return out;
}

/** Брои импулсите: колко пъти потенциалът минава нагоре през 0 mV. */
const countSpikes = (s: Sample[]) => s.filter((p, k) => k > 0 && s[k - 1].v < 0 && p.v >= 0).length;

const fmt = (v: number, d = 0) => v.toFixed(d).replace('.', ',').replace('-', '−');

// чертеж
const X0 = 56;
const X1 = 620;
const VY0 = 220; // −90 mV
const VY1 = 20; // +60 mV
const GY0 = 320;
const GY1 = 250;
const tx = (t: number) => X0 + (t / T_END) * (X1 - X0);
const vy = (v: number) => VY0 - ((Math.max(-90, Math.min(60, v)) + 90) / 150) * (VY0 - VY1);
const G_TOP = 40; // mS/cm²
const gy = (g: number) => GY0 - (Math.min(g, G_TOP) / G_TOP) * (GY0 - GY1);

/** Акционен потенциал: праг, „всичко или нищо“, рефрактерен период, тетродотоксин и тетраетиламоний. */
export default function ActionPotentialLab() {
  const [i, setI] = useState(40);
  const [two, setTwo] = useState(false);
  const [gap, setGap] = useState(3);
  const [ttx, setTtx] = useState(false);
  const [tea, setTea] = useState(false);

  const data = useMemo(() => simulate(i, two ? gap : null, ttx, tea), [i, two, gap, ttx, tea]);
  const spikes = countSpikes(data);
  const peak = Math.max(...data.map(p => p.v));
  const min = Math.min(...data.filter(p => p.t > T1 + PULSE).map(p => p.v));
  const path = (f: (p: Sample) => number) => data.map((p, k) => `${k ? 'L' : 'M'} ${tx(p.t).toFixed(1)} ${f(p).toFixed(1)}`).join(' ');

  let note: string;
  if (ttx) note = 'Тетродотоксинът (отровата на рибата фугу) запушва натриевите канали. Стимулът само леко деполяризира мембраната – импулс няма, колкото и да е силен стимулът. Затова отровата парализира мускулите, включително дихателните.';
  else if (spikes === 0) note = 'Под прага: стимулът деполяризира мембраната малко и тя се връща към покой. Не се отварят достатъчно натриеви канали, за да започне лавината.';
  else if (tea) note = 'Тетраетиламонийът запушва калиевите канали. Импулсът започва нормално, но мембраната не може да се реполяризира: потенциалът бавно пада и остава около 0 mV, а инактивираните натриеви канали не пускат нов импулс. В истинския аксон изтичането на йони през други канали все пак го връща – след десетки милисекунди.';
  else if (two && spikes === 1) note = gap < 1.3 ? 'Абсолютен рефрактерен период: натриевите канали са инактивирани и вторият стимул не може да предизвика импулс, колкото и да е силен.' : 'Относителен рефрактерен период: част от натриевите канали още са инактивирани, а калиевите – отворени. Нужен е по-силен стимул. Увеличи силата или интервала.';
  else if (two) note = 'Два импулса. Ако интервалът е кратък, вторият е малко по-нисък – не всички натриеви канали са се възстановили.';
  else note = 'Над прага: натриевите канали се отварят лавинообразно, потенциалът скача до около +30 mV, после калиевите канали го връщат. Увеличи силата – височината на импулса почти не се променя („всичко или нищо“).';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 360" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* мрежа и оси за потенциала */}
        {[-90, -60, -30, 0, 30, 60].map(v => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={vy(v)} y2={vy(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 6} y={vy(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">{fmt(v)}</text>
          </g>
        ))}
        <text x={X0 - 44} y={14} fontSize="12" fill="currentColor">mV</text>
        <line x1={X0} x2={X1} y1={vy(-55)} y2={vy(-55)} stroke="#f59e0b" strokeDasharray="5 4" />
        <text x={X1 - 2} y={vy(-55) - 4} fontSize="11" textAnchor="end" fill="#d97706">праг ≈ −55 mV</text>
        <line x1={X0} x2={X1} y1={vy(E_NA)} y2={vy(E_NA)} stroke="#8b5cf6" strokeDasharray="2 4" />
        <text x={X1 - 2} y={vy(E_NA) - 4} fontSize="11" textAnchor="end" fill="#7c3aed">E(Na⁺)</text>
        <line x1={X0} x2={X1} y1={vy(E_K)} y2={vy(E_K)} stroke="#10b981" strokeDasharray="2 4" />
        <text x={X1 - 2} y={vy(E_K) + 13} fontSize="11" textAnchor="end" fill="#059669">E(K⁺)</text>

        {/* стимулите */}
        {[T1, ...(two ? [T1 + gap] : [])].map(t => (
          <rect key={t} x={tx(t)} y={VY1} width={tx(t + PULSE) - tx(t)} height={VY0 - VY1} fill="#e11d48" opacity={0.12} />
        ))}

        <path d={path(p => vy(p.v))} fill="none" stroke="#e11d48" strokeWidth={2.5} />

        {/* проводимости */}
        <line x1={X0} x2={X1} y1={GY0} y2={GY0} stroke="currentColor" />
        <line x1={X0} x2={X0} y1={GY0} y2={GY1 - 6} stroke="currentColor" />
        <text x={X0 - 6} y={GY1 + 4} fontSize="11" textAnchor="end" fill="currentColor">{G_TOP}</text>
        <text x={X0 - 6} y={GY0 + 4} fontSize="11" textAnchor="end" fill="currentColor">0</text>
        <path d={path(p => gy(p.gNa))} fill="none" stroke="#8b5cf6" strokeWidth={2} />
        <path d={path(p => gy(p.gK))} fill="none" stroke="#10b981" strokeWidth={2} />
        <text x={X0 + 8} y={GY1 - 4} fontSize="11" fill="#7c3aed">проводимост за Na⁺, mS/cm²</text>
        <text x={X0 + 200} y={GY1 - 4} fontSize="11" fill="#059669">за K⁺</text>
        {Array.from({ length: T_END + 1 }, (_, t) => t)
          .filter(t => t % 2 === 0)
          .map(t => (
            <g key={t}>
              <line x1={tx(t)} x2={tx(t)} y1={GY0} y2={GY0 + 4} stroke="currentColor" />
              <text x={tx(t)} y={GY0 + 16} fontSize="11" textAnchor="middle" fill="currentColor">{t}</text>
            </g>
          ))}
        <text x={(X0 + X1) / 2} y={GY0 + 30} fontSize="12" textAnchor="middle" fill="currentColor">време, ms</text>
      </LabSvg>

      <Sliders>
        <Slider label="стимул" value={i} onChange={setI} min={0} max={80} step={1} tone="rose" />
        {two && <Slider label="интервал" value={gap} onChange={setGap} min={0.75} max={8} step={0.25} tone="blue" />}
      </Sliders>
      <Buttons>
        <DiagramButton active={two} onClick={() => setTwo(x => !x)}>
          втори стимул
        </DiagramButton>
        <DiagramButton active={ttx} onClick={() => setTtx(x => !x)}>
          тетродотоксин (Na⁺)
        </DiagramButton>
        <DiagramButton active={tea} onClick={() => setTea(x => !x)}>
          тетраетиламоний (K⁺)
        </DiagramButton>
      </Buttons>

      <Readout
        items={[
          { label: 'импулси', value: spikes, tone: 'rose' },
          { label: 'връх', value: `${fmt(peak)} mV`, tone: 'violet' },
          { label: 'най-ниско', value: `${fmt(min)} mV`, tone: 'emerald' },
          { label: 'стимул', value: `${i} µA/cm²`, tone: 'blue' },
        ]}
      />
      <Note tone="rose">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Това е моделът на Ходжкин и Хъксли за гигантския аксон на калмара: четири уравнения за потенциала и за вратите на
        натриевите и калиевите канали. Стимулът трае {fmt(PULSE, 1)} ms; прагът в модела е около 17 µA/cm². Каналите са ускорени,
        все едно аксонът е на около 21 °C, така че импулсът трае около 1 ms – колкото в нервите на бозайниците. При калмара покоят е
        около −65 mV, при нашите неврони – около −70 mV.
      </p>
    </div>
  );
}
