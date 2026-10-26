import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Formula, Note, Readout } from '~/geometry/diagram';

const T = 40;
const DT = 0.01;

/** Логистичен растеж с постоянен улов H и (по желание) закъснение τ: dN/dt = r·N(t)·(1 − N(t − τ)/K) − H. */
function simulate(r: number, k: number, n0: number, h: number, tau: number) {
  const steps = Math.round(T / DT);
  const lag = Math.round(tau / DT);
  const n: number[] = [n0];
  for (let i = 0; i < steps; i++) {
    const past = i - lag >= 0 ? n[i - lag] : n0;
    const next = n[i] + (r * n[i] * (1 - past / k) - h) * DT;
    n.push(Math.max(0, next));
  }
  return n;
}

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

const X0 = 55;
const X1 = 610;
const Y0 = 280;
const Y1 = 30;
const px = (t: number) => X0 + (t / T) * (X1 - X0);

/** Експоненциален и логистичен растеж, капацитет на средата, улов и закъснение. */
export default function GrowthModelsLab() {
  const [r, setR] = useState(0.5);
  const [k, setK] = useState(800);
  const [n0, setN0] = useState(10);
  const [h, setH] = useState(0);
  const [tau, setTau] = useState(0);

  const logistic = useMemo(() => simulate(r, k, n0, h, tau), [r, k, n0, h, tau]);
  // мащаб: поне 1200, а при силни колебания – до 3000
  const nmax = Math.min(3000, Math.max(1200, Math.ceil(Math.max(...logistic) / 300) * 300));
  const py = (v: number) => Y0 - (Math.min(v, nmax) / nmax) * (Y0 - Y1);
  const ticks = [0, nmax / 4, nmax / 2, (3 * nmax) / 4, nmax];
  const msy = (r * k) / 4;
  const td = Math.log(2) / r;

  const path = (f: (i: number) => number) => {
    const pts: string[] = [];
    for (let i = 0; i <= T / DT; i += 10) {
      pts.push(`${pts.length ? 'L' : 'M'} ${px(i * DT).toFixed(1)} ${py(f(i)).toFixed(1)}`);
      // експонентата излиза от графиката – не я теглим по горния ръб
      if (f(i) > nmax) break;
    }
    return pts.join(' ');
  };
  const expPath = path(i => n0 * Math.exp(r * i * DT));
  const logPath = path(i => logistic[i]);
  const end = logistic[logistic.length - 1];
  const tail = logistic.slice(-Math.round(10 / DT));
  const swing = Math.max(...tail) - Math.min(...tail);

  // равновесия при улов: N = K/2 · (1 ± √(1 − 4H/(rK)))
  const disc = 1 - (4 * h) / (r * k);
  const nHigh = disc >= 0 ? (k / 2) * (1 + Math.sqrt(disc)) : NaN;
  const nLow = disc >= 0 ? (k / 2) * (1 - Math.sqrt(disc)) : NaN;

  // момент, в който експонентата стига K
  const tExpK = Math.log(k / n0) / r;

  let msg: string;
  if (h > msy) msg = `Уловът ${fmt(h, 0)} на година е над максималния устойчив улов rK/4 = ${fmt(msy, 0)}: популацията се срива, независимо колко е голяма в началото.`;
  else if (h > 0 && n0 < nLow) msg = `При улов ${fmt(h, 0)} популация под ${fmt(nLow, 0)} не може да се възстанови – улавяме повече, отколкото тя успява да нарасне.`;
  else if (h > 0) msg = `Популацията се установява около ${fmt(nHigh, 0)} – там приръстът точно покрива улова. Най-много може да се лови при N = K/2 = ${fmt(k / 2, 0)}.`;
  else if (tau > 0 && r * tau > Math.PI / 2) msg = `rτ = ${fmt(r * tau, 2)} > π/2 ≈ 1,57: популацията „реагира“ със закъснение, надхвърля K и трайно се люлее около него.`;
  else if (tau > 0) msg = `rτ = ${fmt(r * tau, 2)} < π/2: колебанията около K затихват. Увеличи r или τ.`;
  else msg = `Двете криви вървят заедно, докато N ≪ K. Експоненциалната стига K = ${k} за ${fmt(tExpK)} години и продължава нагоре; логистичната расте най-бързо при K/2 и се изравнява.`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="currentColor" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="currentColor" />
        {[0, 10, 20, 30, 40].map(v => (
          <g key={v}>
            <line x1={px(v)} x2={px(v)} y1={Y0} y2={Y0 + 4} stroke="currentColor" />
            <text x={px(v)} y={Y0 + 16} fontSize="11" textAnchor="middle" fill="currentColor">{v}</text>
          </g>
        ))}
        {ticks.map(v => (
          <g key={v}>
            <line x1={X0 - 4} x2={X1} y1={py(v)} y2={py(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 8} y={py(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">{v}</text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={Y0 + 32} fontSize="12" textAnchor="middle" fill="currentColor">време, години</text>
        <text x={X0 + 4} y={Y1 - 10} fontSize="12" fill="currentColor">численост N</text>

        <line x1={X0} x2={X1} y1={py(k)} y2={py(k)} stroke="#10b981" strokeWidth={1.5} strokeDasharray="6 4" />
        <text x={X1 - 4} y={py(k) - 5} fontSize="11" textAnchor="end" fill="#059669">K = {k}</text>
        <line x1={X0} x2={X1} y1={py(k / 2)} y2={py(k / 2)} stroke="#a78bfa" strokeWidth={1} strokeDasharray="3 4" />
        <text x={X1 - 4} y={py(k / 2) - 5} fontSize="11" textAnchor="end" fill="#7c3aed">K/2</text>
        {h > 0 && Number.isFinite(nLow) && (
          <>
            <line x1={X0} x2={X1} y1={py(nLow)} y2={py(nLow)} stroke="#e11d48" strokeWidth={1} strokeDasharray="2 3" />
            <text x={X0 + 6} y={py(nLow) - 4} fontSize="10" fill="#e11d48">праг на срива</text>
          </>
        )}

        <path d={expPath} fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="7 4" />
        <path d={logPath} fill="none" stroke="#2563eb" strokeWidth={3} />
        <g fontSize="11" transform={`translate(${px(20) - X0} ${Y0 - Y1 - 50})`}>
          <line x1={X0 + 14} x2={X0 + 34} y1={Y1 + 10} y2={Y1 + 10} stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="7 4" />
          <text x={X0 + 40} y={Y1 + 14} fill="#d97706">експоненциален: dN/dt = rN</text>
          <line x1={X0 + 14} x2={X0 + 34} y1={Y1 + 28} y2={Y1 + 28} stroke="#2563eb" strokeWidth={3} />
          <text x={X0 + 40} y={Y1 + 32} fill="#2563eb">логистичен{h > 0 ? ' с улов' : ''}{tau > 0 ? ' със закъснение' : ''}</text>
        </g>
      </LabSvg>

      <Sliders>
        <Slider label="r" value={r} onChange={setR} min={0.1} max={1.5} step={0.05} tone="amber" />
        <Slider label="K" value={k} onChange={setK} min={200} max={1000} step={50} tone="emerald" />
        <Slider label="N₀" value={n0} onChange={setN0} min={2} max={600} step={2} tone="blue" />
        <Slider label="улов H" value={h} onChange={setH} min={0} max={300} step={5} tone="rose" />
        <Slider label="τ" value={tau} onChange={setTau} min={0} max={5} step={0.25} tone="violet" />
      </Sliders>

      <Readout
        items={[
          { label: 'удвояване', value: `${fmt(td)} г.`, tone: 'amber' },
          { label: 'макс. приръст rK/4', value: fmt(msy, 0), tone: 'violet' },
          { label: 'N след 40 г.', value: fmt(end, 0), tone: 'blue' },
          { label: 'люлеене (10 г.)', value: fmt(swing, 0), tone: 'rose' },
        ]}
      />
      <Formula>
        dN/dt = rN(1 − N/K){h > 0 ? ' − H' : ''} · максимум при N = K/2: r·K/4 = {fmt(r, 2)} · {k} / 4 = {fmt(msy, 0)}
      </Formula>
      <Note tone="blue">{msg}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 r е вътрешната скорост на нарастване (на година, на индивид), K – капацитетът на средата. Плъзгачът „улов“ вади всяка
        година по H индивида (риболов, лов, сеч). τ е закъснението, с което гъстотата се отразява на размножаването – например
        младите, заченати в гладна година, се раждат след месеци. Моделът е детерминиран и непрекъснат; истинските популации имат и
        случайни колебания.
      </p>
    </div>
  );
}
