import { useMemo, useRef, useState } from 'react';
import { useAnimationFrame } from '~/astronomy/components/useAnimationFrame';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

// ---------- Модел ----------
// Лява камера и ляво предсърдие с променлива еластичност (E(t)·(V − V₀)), аорта – „въздушен резервоар“
// (компланса C и периферно съпротивление R), венозно връщане от постоянно налягане pv.
// Параметрите са подбрани така, че при 72 удара/min: EDV ≈ 120 mL, ESV ≈ 50 mL, налягане ≈ 120/80 mmHg.

type Sample = { t: number; plv: number; pa: number; pla: number; v: number; mitral: boolean; aortic: boolean; ecg: number };
type Phase = 'atrial' | 'isoContraction' | 'ejection' | 'isoRelaxation' | 'filling';

const PHASES: Record<Phase, { label: string; color: string }> = {
  filling: { label: 'пълнене на камерата', color: '#38bdf8' },
  atrial: { label: 'систола на предсърдието', color: '#a78bfa' },
  isoContraction: { label: 'изоволуметрично свиване', color: '#fb923c' },
  ejection: { label: 'изтласкване', color: '#f43f5e' },
  isoRelaxation: { label: 'изоволуметрично отпускане', color: '#facc15' },
};

const A0 = 0.03; // начало на систолата на предсърдието, s

/** Времена в цикъла: систолата на камерата се скъсява по-малко от диастолата, когато пулсът расте. */
function timing(hr: number) {
  const T = 60 / hr;
  const ts = 0.1 + 0.25 * T; // систола на камерата
  const tpr = 0.08 + 0.08 * T; // от началото на предсърдието до камерата (≈ PQ)
  const ta = 0.06 + 0.05 * T; // систола на предсърдието
  return { T, ts, tpr, ta, v0: A0 + tpr };
}

/** Активация на камерата през систолата: x от 0 до 1. */
const act = (x: number) => (x < 0.6 ? 0.5 * (1 - Math.cos((Math.PI * x) / 0.6)) : 0.5 * (1 + Math.cos((Math.PI * (x - 0.6)) / 0.4)));
const gauss = (t: number, c: number, w: number) => Math.exp(-(((t - c) / w) ** 2));

function simulate(hr: number, emax: number, pv: number): Sample[] {
  const { T, ts, ta, v0 } = timing(hr);
  const dt = 0.0005;
  const [Emin, V0, ElaMin, ElaMax, Vla0] = [0.08, 10, 0.15, 0.35, 10];
  const [C, R, Rav, Rmv, Rv] = [1.6, 1.15, 0.004, 0.006, 0.03];
  let [V, Vla, Pa] = [120, 50, 85];
  const M = Math.round(T / dt);
  const N = 8 * M;
  const out: Sample[] = [];
  for (let i = 0; i < N; i++) {
    const tc = (i % M) * dt;
    const tv = tc - v0;
    const E = Emin + (emax - Emin) * (tv >= 0 && tv < ts ? act(tv / ts) : 0);
    const x = tc - A0;
    const Ela = ElaMin + (ElaMax - ElaMin) * (x >= 0 && x < ta ? Math.sin((Math.PI * x) / ta) ** 2 : 0);
    const plv = E * (V - V0);
    const pla = Ela * (Vla - Vla0);
    const qmv = Math.max(0, (pla - plv) / Rmv);
    const qav = Math.max(0, (plv - Pa) / Rav);
    const qin = (pv - pla) / Rv;
    if (i >= N - M && i % 4 === 0) {
      // ЕКГ: P преди свиването на предсърдието, QRS малко преди камерата, T към края на систолата
      const ecg =
        0.15 * gauss(tc, A0 - 0.005, 0.03) -
        0.1 * gauss(tc, v0 - 0.045, 0.008) +
        1 * gauss(tc, v0 - 0.03, 0.01) -
        0.25 * gauss(tc, v0 - 0.015, 0.008) +
        0.3 * gauss(tc, v0 + ts * 0.78, 0.045);
      out.push({ t: tc, plv, pa: Pa, pla, v: V, mitral: qmv > 0, aortic: qav > 0, ecg });
    }
    V += (qmv - qav) * dt;
    Vla += (qin - qmv) * dt;
    Pa += ((qav - Pa / R) / C) * dt;
  }
  return out;
}

function phaseOf(s: Sample, hr: number): Phase {
  const { ts, ta, v0 } = timing(hr);
  if (s.aortic) return 'ejection';
  if (s.mitral) return s.t >= A0 && s.t < A0 + ta ? 'atrial' : 'filling';
  // двете клапи затворени: след предсърдието и преди изтласкването – свиване, иначе – отпускане
  return s.t >= A0 && s.t < v0 + ts * 0.6 ? 'isoContraction' : 'isoRelaxation';
}

const fmt = (v: number, d = 0) => v.toFixed(d).replace('.', ',');

// ---------- Чертеж ----------

const L = 46; // ляв край на графиките
const RW = 360; // ширина на графиките
const P_TOP = 22;
const P_H = 150; // налягане 0–200 mmHg
const V_TOP = 196;
const V_H = 70; // обем 20–180 mL
const E_TOP = 290;
const E_H = 50;
const PMAX = 200;
const [VMIN, VMAX] = [20, 180];

/** Сърдечен цикъл: налягания, обем, клапи, ЕКГ и P–V цикъл на лявата камера. */
export default function CardiacCycleLab() {
  const [hr, setHr] = useState(72);
  const [emax, setEmax] = useState(3);
  const [pv, setPv] = useState(10);
  const [running, setRunning] = useState(true);
  const [slow, setSlow] = useState(true);
  const [pos, setPos] = useState(0.3); // част от цикъла
  const posRef = useRef(pos);

  const data = useMemo(() => simulate(hr, emax, pv), [hr, emax, pv]);
  const T = 60 / hr;

  useAnimationFrame(running, dt => {
    posRef.current = (posRef.current + (dt * (slow ? 0.25 : 1)) / T) % 1;
    setPos(posRef.current);
  });

  const n = data.length;
  const cur = data[Math.min(n - 1, Math.floor(pos * n))];
  const phase = phaseOf(cur, hr);
  const vs = data.map(d => d.v);
  const edv = Math.max(...vs);
  const esv = Math.min(...vs);
  const sv = edv - esv;
  const pas = data.map(d => d.pa);
  const sys = Math.max(...pas);
  const dia = Math.min(...pas);

  const tx = (t: number) => L + (t / T) * RW;
  const py = (p: number) => P_TOP + P_H * (1 - Math.min(p, PMAX) / PMAX);
  const vy = (v: number) => V_TOP + V_H * (1 - (v - VMIN) / (VMAX - VMIN));
  const ey = (e: number) => E_TOP + E_H * 0.75 - e * E_H * 0.7;
  const line = (f: (d: Sample) => number, y: (u: number) => number) => data.map((d, i) => `${i ? 'L' : 'M'}${tx(d.t).toFixed(1)} ${y(f(d)).toFixed(1)}`).join(' ');

  // ленти на фазите
  const bands: { x0: number; x1: number; ph: Phase }[] = [];
  data.forEach((d, i) => {
    const ph = phaseOf(d, hr);
    const last = bands[bands.length - 1];
    if (last && last.ph === ph) last.x1 = tx(data[i + 1]?.t ?? T);
    else bands.push({ x0: tx(d.t), x1: tx(data[i + 1]?.t ?? T), ph });
  });

  // P–V цикъл
  const PV = { x: 440, y: 22, w: 180, h: 150 };
  const pvx = (v: number) => PV.x + (PV.w * (v - VMIN)) / (VMAX - VMIN);
  const pvy = (p: number) => PV.y + PV.h * (1 - Math.min(p, PMAX) / PMAX);
  const loop = data.map((d, i) => `${i ? 'L' : 'M'}${pvx(d.v).toFixed(1)} ${pvy(d.plv).toFixed(1)}`).join(' ') + 'Z';

  // схема на лявото сърце
  const ry = 14 + (cur.v / 160) * 30;
  const valve = (open: boolean, x: number, y: number) => (
    <g>
      <line x1={x - 12} y1={y} x2={open ? x - 12 : x} y2={open ? y + 10 : y} stroke={open ? '#16a34a' : '#475569'} strokeWidth={3} strokeLinecap="round" />
      <line x1={x + 12} y1={y} x2={open ? x + 12 : x} y2={open ? y + 10 : y} stroke={open ? '#16a34a' : '#475569'} strokeWidth={3} strokeLinecap="round" />
    </g>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 360" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {bands.map((b, i) => (
          <rect key={i} x={b.x0} y={P_TOP} width={Math.max(0, b.x1 - b.x0)} height={E_TOP + E_H - P_TOP} fill={PHASES[b.ph].color} opacity={0.12} />
        ))}
        {/* оси */}
        {[0, 50, 100, 150, 200].map(p => (
          <g key={p}>
            <line x1={L} x2={L + RW} y1={py(p)} y2={py(p)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={L - 4} y={py(p) + 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {p}
            </text>
          </g>
        ))}
        <text x={L} y={14} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          налягане, mmHg
        </text>
        <path d={line(d => d.pa, py)} fill="none" stroke="#e11d48" strokeWidth={2} />
        <path d={line(d => d.plv, py)} fill="none" stroke="#2563eb" strokeWidth={2} />
        <path d={line(d => d.pla, py)} fill="none" stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={L + RW - 4} y={py(sys) - 6} fontSize="10" textAnchor="end" fill="#e11d48">
          аорта
        </text>
        <text x={L + RW - 4} y={py(12) - 4} fontSize="10" textAnchor="end" fill="#7c3aed">
          предсърдие
        </text>
        <text x={tx(timing(hr).v0 + timing(hr).ts * 0.45) + 8} y={py(Math.max(...data.map(d => d.plv))) + 12} fontSize="10" fill="#2563eb">
          камера
        </text>

        {[40, 100, 160].map(v => (
          <g key={v}>
            <line x1={L} x2={L + RW} y1={vy(v)} y2={vy(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={L - 4} y={vy(v) + 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {v}
            </text>
          </g>
        ))}
        <text x={L} y={V_TOP - 6} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          обем на лявата камера, mL
        </text>
        <path d={line(d => d.v, vy)} fill="none" stroke="#059669" strokeWidth={2} />

        <text x={L} y={E_TOP - 2} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          ЕКГ
        </text>
        <path d={line(d => d.ecg, ey)} fill="none" stroke="currentColor" strokeWidth={1.5} />
        <text x={L + RW} y={E_TOP + E_H + 14} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          един цикъл: {fmt(T, 2)} s
        </text>

        {/* курсор */}
        <line x1={tx(cur.t)} x2={tx(cur.t)} y1={P_TOP} y2={E_TOP + E_H} stroke="currentColor" strokeWidth={1} opacity={0.6} />
        <circle cx={tx(cur.t)} cy={py(cur.plv)} r={4} fill="#2563eb" />
        <circle cx={tx(cur.t)} cy={vy(cur.v)} r={4} fill="#059669" />

        {/* P–V цикъл */}
        <rect x={PV.x} y={PV.y} width={PV.w} height={PV.h} fill="none" className="stroke-gray-300 dark:stroke-gray-600" />
        <path d={loop} fill="#2563eb" fillOpacity={0.08} stroke="#2563eb" strokeWidth={2} />
        <circle cx={pvx(cur.v)} cy={pvy(cur.plv)} r={5} fill={PHASES[phase].color} stroke="#1e293b" />
        <text x={PV.x} y={14} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          P–V цикъл на камерата
        </text>
        <text x={PV.x + PV.w} y={PV.y + PV.h + 14} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          обем {VMIN}–{VMAX} mL →
        </text>
        <text x={PV.x + 4} y={PV.y + 14} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          ↑ налягане
        </text>

        {/* схема */}
        <text x={440} y={208} fontSize="13" fontWeight={700} fill={PHASES[phase].color}>
          {PHASES[phase].label}
        </text>
        <ellipse cx={480} cy={244} rx={26} ry={12} fill="#c4b5fd" stroke="#6d28d9" />
        <text x={480} y={248} fontSize="9" textAnchor="middle" fill="#3b0764">
          ЛП
        </text>
        <ellipse cx={480} cy={258 + ry} rx={30} ry={ry} fill="#fda4af" stroke="#be123c" />
        <text x={480} y={262 + ry} fontSize="9" textAnchor="middle" fill="#4c0519">
          ЛК
        </text>
        {valve(cur.mitral, 480, 257)}
        {/* аортата излиза от камерата нагоре вдясно */}
        <path d="M 498 262 L 520 236 L 532 246 L 508 270 Z" fill="#fecdd3" stroke="#be123c" />
        <g transform="rotate(-48 503 266)">{valve(cur.aortic, 503, 266)}</g>
        <g fontSize="11">
          <text x={548} y={240} fill={cur.mitral ? '#16a34a' : '#64748b'}>
            митрална:
          </text>
          <text x={548} y={254} fill={cur.mitral ? '#16a34a' : '#64748b'}>
            {cur.mitral ? 'отворена' : 'затворена'}
          </text>
          <text x={548} y={276} fill={cur.aortic ? '#16a34a' : '#64748b'}>
            аортна:
          </text>
          <text x={548} y={290} fill={cur.aortic ? '#16a34a' : '#64748b'}>
            {cur.aortic ? 'отворена' : 'затворена'}
          </text>
          <text x={548} y={316} className="fill-gray-600 dark:fill-gray-300">
            обем:
          </text>
          <text x={548} y={330} className="fill-gray-600 dark:fill-gray-300">
            {fmt(cur.v)} mL
          </text>
        </g>
      </LabSvg>

      <Buttons>
        <DiagramButton active={running} onClick={() => setRunning(r => !r)}>
          {running ? '⏸ пауза' : '▶ пусни'}
        </DiagramButton>
        <DiagramButton active={slow} onClick={() => setSlow(s => !s)}>
          {slow ? '🐢 4 пъти по-бавно' : 'истинска скорост'}
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="пулс" value={hr} onChange={setHr} min={40} max={170} step={1} tone="rose" />
        <Slider label="свиване" value={emax} onChange={setEmax} min={1.5} max={4.5} step={0.1} tone="violet" />
        <Slider label="пълнене" value={pv} onChange={setPv} min={6} max={14} step={0.5} tone="blue" />
        {!running && <Slider label="момент" value={Math.round(pos * 100)} onChange={v => { posRef.current = v / 100; setPos(v / 100); }} min={0} max={99} step={1} tone="gray" />}
      </Sliders>

      <Readout
        items={[
          { label: 'EDV / ESV', value: `${fmt(edv)} / ${fmt(esv)} mL`, tone: 'emerald' },
          { label: 'ударен обем', value: `${fmt(sv)} mL`, tone: 'blue' },
          { label: 'фракция на изтласкване', value: `${fmt((100 * sv) / edv)} %`, tone: 'violet' },
          { label: 'минутен обем', value: `${fmt((sv * hr) / 1000, 1)} L/min`, tone: 'rose' },
          { label: 'кръвно налягане', value: `${fmt(sys)}/${fmt(dia)} mmHg`, tone: 'amber' },
        ]}
      />
      <Note tone="rose">
        {hr >= 140
          ? 'При много бърз пулс диастолата се скъсява най-много: камерата не успява да се напълни и ударният обем пада.'
          : pv >= 12.5
            ? 'Повече кръв се връща към сърцето → камерата се разтяга повече и се свива по-силно (закон на Франк–Старлинг).'
            : emax >= 4
              ? 'По-силното свиване (напр. от адреналин) изтласква повече кръв: остатъчният обем ESV намалява.'
              : phase === 'isoContraction' || phase === 'isoRelaxation'
                ? 'И двете клапи са затворени: налягането се мени, а обемът стои – затова фазата е „изоволуметрична“.'
                : 'Клапите се отварят и затварят само от разликата в налягането: митралната – когато камерата е под предсърдието, аортната – когато е над аортата.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моделът: стената на камерата става все по-твърда при свиването и отново мека при отпускането; аортата е еластичен
        резервоар, от който кръвта изтича през съпротивлението на съдовете. „Свиване“ е максималната твърдост на камерата (силата
        на свиване), „пълнене“ – налягането във вените, от което кръвта се връща. Съпротивлението на съдовете тук е постоянно; при
        истинско натоварване то пада и налягането се покачва по-малко.
      </p>
    </div>
  );
}
