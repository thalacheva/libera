import { useEffect, useState } from 'react';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 300;
const GX0 = 30;
const GX1 = 620;
const GY0 = 30;
const GY1 = 170;
const TSUN = 4.925e-6; // G M☉ / c³, s
const LSUN = 1477; // G M☉ / c², m
const MPC = 3.086e22;
const F_LOW = 20; // Hz – долна граница на детекторите
const ARM = 4000; // m

const PRESETS = [
  { name: 'GW150914 (първото)', m1: 36, m2: 29, d: 410, text: 'Първото засичане на гравитационни вълни – 14 септември 2015 г. Две черни дупки на 1,3 млрд. св. години се сливат за части от секундата; три слънчеви маси се превръщат в енергия на вълните. Нобелова награда 2017 г.' },
  { name: 'GW170817 (неутронни звезди)', m1: 1.46, m2: 1.27, d: 40, text: 'Сливане на две неутронни звезди. 1,7 s след вълните Ферми засича гама-избухване, а после стотици телескопи виждат „килонова“ – там се раждат злато и платина. Началото на многовестоносната астрономия.' },
  { name: 'GW190521 (най-масивното)', m1: 85, m2: 66, d: 5300, text: 'Сливане, от което се ражда черна дупка от ~140 M☉ – „средна“ черна дупка. Сигналът е много кратък: при такива маси честотата е ниска и бързо излиза от лентата на детекторите.' },
];

/** Време до сливането при честота f (в първо приближение). */
const tau = (f: number, mc: number) => (5 / 256) * (Math.PI * f) ** (-8 / 3) * (mc * TSUN) ** (-5 / 3);
/** Честота при време τ до сливането. */
const freq = (t: number, mc: number) => (1 / Math.PI) * (5 / (256 * t)) ** (3 / 8) * (mc * TSUN) ** (-5 / 8);

function formatT(s: number) {
  if (s < 1) return `${fmt(s * 1000, 0)} ms`;
  if (s < 120) return `${fmt(s, 1)} s`;
  return `${fmt(s / 60, 1)} min`;
}

export default function GWChirpLab() {
  const [m1, setM1] = useState(36);
  const [m2, setM2] = useState(29);
  const [d, setD] = useState(410);
  const [pi, setPi] = useState(0);
  const [sound, setSound] = useState(false);

  const M = m1 + m2;
  const mc = (m1 * m2) ** 0.6 / M ** 0.2;
  const fIsco = 4400 / M;
  const tIn = tau(F_LOW, mc);
  const tEnd = tau(fIsco, mc);
  const win = Math.min(tIn, Math.max(0.12, 60 / fIsco));
  const hAt = (f: number) => (4 / (d * MPC)) * (mc * LSUN) ** (5 / 3) * ((Math.PI * f) / 2.998e8) ** (2 / 3);
  const hPeak = hAt(fIsco);
  const eRad = 0.2 * ((m1 * m2) / (M * M)) * M; // грубо за черни дупки, M☉c²
  const ns = M < 5;

  // Вълната в последните win секунди
  const pts: string[] = [];
  const NS = 1600;
  let phase = 0;
  let prevT = win;
  for (let i = 0; i <= NS; i++) {
    const tt = win * (1 - i / NS) + tEnd; // време до сливането
    const f = Math.min(freq(tt, mc), fIsco);
    phase += 2 * Math.PI * f * (prevT - tt);
    prevT = tt;
    const amp = (f / fIsco) ** (2 / 3);
    pts.push(`${GX0 + (i / NS) * (GX1 - GX0) * 0.92},${(GY0 + GY1) / 2 - amp * Math.cos(phase) * ((GY1 - GY0) / 2) * 0.95}`);
  }
  // Затихване (ringdown)
  const fRing = 1.2 * fIsco;
  for (let i = 1; i <= 120; i++) {
    const dt = (i / 120) * win * 0.08;
    const amp = Math.exp(-dt * fRing * 1.2);
    pts.push(`${GX0 + (0.92 + (i / 120) * 0.08) * (GX1 - GX0)},${(GY0 + GY1) / 2 - amp * Math.cos(phase + 2 * Math.PI * fRing * dt) * ((GY1 - GY0) / 2) * 0.95}`);
  }

  // Звук: честотата следва „чирпа“ през последните секунди
  useEffect(() => {
    if (!sound) return;
    const ctx = new AudioContext();
    const dur = Math.min(Math.max(win, 0.6), 3);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const n = 200;
    const fs = new Float32Array(n);
    const gs = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const tt = dur * (1 - i / (n - 1)) + tEnd;
      const f = Math.min(freq(tt, mc), fIsco);
      fs[i] = Math.max(f, 20);
      gs[i] = 0.05 + 0.25 * (f / fIsco) ** (2 / 3);
    }
    const t0 = ctx.currentTime + 0.05;
    osc.frequency.setValueCurveAtTime(fs, t0, dur);
    gain.gain.setValueCurveAtTime(gs, t0, dur);
    gain.gain.setTargetAtTime(0, t0 + dur, 0.03);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.3);
    const timer = setTimeout(() => setSound(false), (dur + 0.4) * 1000);
    return () => {
      clearTimeout(timer);
      ctx.close();
    };
  }, [sound, win, tEnd, mc, fIsco]);

  const p = PRESETS[pi];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-fuchsia-300 dark:border-fuchsia-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">„Чирпът“ на две сливащи се тела</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Две черни дупки или неутронни звезди обикалят все по-близо и по-бързо, излъчвайки гравитационни вълни. Честотата и амплитудата
        растат до сливането – „чирп“, като чуруликане на птица. Формата му издава масите.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <line x1={GX0} x2={GX1} y1={(GY0 + GY1) / 2} y2={(GY0 + GY1) / 2} stroke="white" strokeOpacity="0.12" />
        <polyline points={pts.join(' ')} fill="none" stroke="#f0abfc" strokeWidth="1.3" />
        <line x1={GX0 + 0.92 * (GX1 - GX0)} x2={GX0 + 0.92 * (GX1 - GX0)} y1={GY0} y2={GY1} stroke="#fde68a" strokeOpacity="0.5" strokeDasharray="3 3" />
        <text x={GX0 + 0.92 * (GX1 - GX0) - 4} y={GY0 + 12} fontSize="9" textAnchor="end" fill="#fde68a">
          сливане
        </text>
        <text x={GX0 + 4} y={GY0 + 12} fontSize="9" fill="white" fillOpacity="0.6">
          деформация h (последните {formatT(win)})
        </text>
        <text x={GX1 - 4} y={GY1 - 6} fontSize="8" textAnchor="end" fill="white" fillOpacity="0.5">
          затихване
        </text>

        <g fontSize="11" fill="white" transform={`translate(${GX0}, ${GY1 + 26})`}>
          <text x={0} y={0} fillOpacity="0.85">
            масата на „чирпа“ ℳ = (m₁m₂)^(3/5) / M^(1/5) = {fmt(mc, 1)} M☉
          </text>
          <text x={0} y={20} fillOpacity="0.85">
            от {F_LOW} Hz до сливането: {formatT(tIn)} · крайна честота ≈ {fmt(fIsco, 0)} Hz
          </text>
          <text x={0} y={40} fillOpacity="0.85">
            {ns ? 'неутронните звезди се допират и разкъсват още преди тази честота' : `излъчена енергия ≈ ${fmt(eRad, 1)} M☉c² (грубо)`}
          </text>
          <text x={0} y={60} fill="#f0abfc" fontWeight="700">
            максимално h ≈ {sci(hPeak, 1)} ⇒ ръката на LIGO (4 km) се променя с {sci(hPeak * ARM, 1)} m
          </text>
          <text x={0} y={80} fontSize="10" fillOpacity="0.6">
            Това е ~{fmt((1.7e-15 / (hPeak * ARM)), 0)} пъти по-малко от размера на протона.
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-3 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">m₁ = {fmt(m1, 2)} M☉</label>
          <input type="range" min="1" max="90" step="0.01" value={m1} onChange={e => setM1(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">m₂ = {fmt(m2, 2)} M☉</label>
          <input type="range" min="1" max="90" step="0.01" value={m2} onChange={e => setM2(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Разстояние: {fmt(d, 0)} Mpc</label>
          <input type="range" min="10" max="6000" step="10" value={d} onChange={e => setD(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <button onClick={() => setSound(true)} disabled={sound} className="px-4 py-1 rounded bg-fuchsia-600 text-white text-sm hover:bg-fuchsia-700 disabled:opacity-60">
          {sound ? '🔊 …' : '🔊 Чуй чирпа'}
        </button>
        {PRESETS.map((q, i) => (
          <button
            key={q.name}
            onClick={() => {
              setPi(i);
              setM1(q.m1);
              setM2(q.m2);
              setD(q.d);
            }}
            className={`px-2 py-1 rounded text-xs border ${
              i === pi ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-800 dark:bg-fuchsia-500/15 dark:text-fuchsia-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {q.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {p.text} Детекторите LIGO (САЩ), Virgo (Италия) и KAGRA (Япония) са лазерни интерферометри с ръце от 3–4 km. Досега са засечени
        стотици сливания.
      </p>
    </div>
  );
}
