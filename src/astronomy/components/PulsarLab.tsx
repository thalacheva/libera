import { useEffect, useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 280;
const CX = 170;
const CY = 140;
const NS_R = 26;
const BEAM_LEN = 110;
const BEAM_HALF = (12 * Math.PI) / 180; // половин ширина на лъча
const VISUAL_PERIOD = 2.5; // s – на екрана въртенето е забавено
// Графиката на импулсите
const GX0 = 360;
const GX1 = 620;
const GY0 = 60;
const GY1 = 200;

const PULSARS = [
  { name: 'CP 1919 (първият)', period: 1.3373, text: 'Пулсарът, открит от Джоселин Бел през 1967 г. Сигналът е толкова регулярен, че отначало го наричат LGM-1 – „малки зелени човечета“.' },
  { name: 'B0329+54', period: 0.7145, text: 'Най-яркият пулсар в северното небе – чува се и с любителски радиотелескоп.' },
  { name: 'Вела', period: 0.0893, text: 'Остатък от свръхнова отпреди ~11 000 години. Понякога рязко се завърта по-бързо („скок“) – вероятно от пренареждане на кората ѝ.' },
  { name: 'Рак (Crab)', period: 0.0335, text: 'В центъра на мъглявината Рак – остатъка от свръхновата, записана от китайски астрономи през 1054 г. Енергията от забавянето на въртенето ѝ осветява цялата мъглявина.' },
  { name: 'J0437−4715', period: 0.005757, text: 'Милисекунден пулсар: „завъртян“ от вещество, паднало от звезда-спътник. Толкова точен е, че съперничи на атомните часовници.' },
  { name: 'J1748−2446ad', period: 0.001396, text: 'Най-бързо въртящият се известен пулсар – 716 оборота в секунда. Екваторът му се движи с около една пета от скоростта на светлината.' },
];

/** Ъгъл между посоката към наблюдателя и магнитната ос (най-близкия от двата полюса) при фаза φ. */
function beamAngle(alpha: number, zeta: number, phi: number) {
  const m = [Math.sin(alpha) * Math.cos(phi), Math.sin(alpha) * Math.sin(phi), Math.cos(alpha)];
  const o = [Math.sin(zeta), 0, Math.cos(zeta)];
  const dot = m[0] * o[0] + m[1] * o[1] + m[2] * o[2];
  return Math.acos(Math.min(1, Math.abs(dot)));
}

const intensity = (angle: number) => Math.exp(-((angle / BEAM_HALF) ** 2) * 2);

export default function PulsarLab() {
  const [pi, setPi] = useState(0);
  const [alphaDeg, setAlphaDeg] = useState(45);
  const [zetaDeg, setZetaDeg] = useState(50);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(false);
  const pulsar = PULSARS[pi];
  const alpha = (alphaDeg * Math.PI) / 180;
  const zeta = (zetaDeg * Math.PI) / 180;

  // Вижда ли ни някога лъчът?
  const minAngle = Math.min(Math.abs(zeta - alpha), Math.abs(Math.PI - zeta - alpha));
  const visible = minAngle < BEAM_HALF * 1.2;

  useAnimationFrame(playing, dt => setPhase(v => v + (2 * Math.PI * dt) / VISUAL_PERIOD));

  // Звукът – щракване при всяко завъртане, с истинския период на пулсара
  useEffect(() => {
    if (!sound || !visible) return;
    const ctx = new AudioContext();
    const len = Math.floor(ctx.sampleRate * 0.003);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    let next = ctx.currentTime + 0.05;
    const timer = setInterval(() => {
      while (next < ctx.currentTime + 0.12) {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.value = 0.25;
        src.connect(gain).connect(ctx.destination);
        src.start(next);
        next += pulsar.period;
      }
    }, 25);
    return () => {
      clearInterval(timer);
      ctx.close();
    };
  }, [sound, visible, pulsar.period]);

  // Проекция на 3D посоки върху екрана: оста на въртене е вертикална
  const project = (v: number[], len: number) => ({ x: CX + v[0] * len, y: CY - v[2] * len, depth: v[1] });
  const m = [Math.sin(alpha) * Math.cos(phase), Math.sin(alpha) * Math.sin(phase), Math.cos(alpha)];
  const north = project(m, BEAM_LEN);
  const south = project([-m[0], -m[1], -m[2]], BEAM_LEN);
  const obs = project([Math.sin(zeta), 0, Math.cos(zeta)], 140);
  const now = intensity(beamAngle(alpha, zeta, phase));

  // Профил за последните три завъртания
  const profile = Array.from({ length: 301 }, (_, i) => {
    const ph = phase - ((300 - i) / 300) * 3 * 2 * Math.PI;
    return `${GX0 + (i / 300) * (GX1 - GX0)},${GY1 - intensity(beamAngle(alpha, zeta, ph)) * (GY1 - GY0)}`;
  }).join(' ');

  const beamWidth = (p: { depth: number }) => 10 + 6 * p.depth;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-violet-300 dark:border-violet-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Космическият фар</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Лъчите излизат от магнитните полюси, а магнитната ос е наклонена спрямо оста на въртене. Виждаме импулс всеки път, когато
        лъч помете Земята. Въртенето е забавено; звукът е с истинската честота.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Ос на въртене */}
        <line x1={CX} x2={CX} y1={CY - 125} y2={CY + 125} stroke="white" strokeOpacity="0.3" strokeDasharray="4 4" />
        <text x={CX + 4} y={CY - 115} fontSize="9" fill="white" fillOpacity="0.5">
          ос на въртене
        </text>
        {/* Лъчите: задният се рисува първи */}
        {[north, south]
          .sort((a, b) => a.depth - b.depth)
          .map((b, i) => (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={b.x}
              y2={b.y}
              stroke="#a78bfa"
              strokeOpacity={b.depth > 0 ? 0.25 : 0.55}
              strokeWidth={beamWidth(b)}
              strokeLinecap="round"
            />
          ))}
        <circle cx={CX} cy={CY} r={NS_R} fill="#c4b5fd" />
        <circle cx={CX} cy={CY} r={NS_R} fill="none" stroke="white" strokeOpacity="0.3" />
        {/* Наблюдател */}
        <line x1={CX} y1={CY} x2={obs.x} y2={obs.y} stroke="#4ade80" strokeOpacity="0.35" strokeDasharray="2 4" />
        <circle cx={obs.x} cy={obs.y} r={6 + 10 * now} fill="#fde68a" fillOpacity={0.15 + 0.6 * now} />
        <text x={obs.x} y={obs.y + 4} fontSize="12" textAnchor="middle">
          🌍
        </text>

        {/* Профил на импулсите */}
        <text x={GX0} y={GY0 - 26} fontSize="11" fill="white" fontWeight="700">
          {pulsar.name}
        </text>
        <text x={GX0} y={GY0 - 10} fontSize="10" fill="white" fillOpacity="0.7">
          P = {pulsar.period >= 0.1 ? `${fmt(pulsar.period, 4)} s` : `${fmt(pulsar.period * 1000, 3)} ms`} · {fmt(1 / pulsar.period, 1)} оборота/s
        </text>
        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <polyline points={profile} fill="none" stroke="#a78bfa" strokeWidth="1.5" />
        <text x={GX0} y={GY1 + 14} fontSize="9" fill="white" fillOpacity="0.5">
          ← последните три завъртания
        </text>
        <text x={GX1} y={GY1 + 14} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.5">
          сега
        </text>
        <text x={GX0} y={GY1 + 36} fontSize="11" fill={visible ? '#4ade80' : '#f87171'} fontWeight="700">
          {visible
            ? Math.abs(Math.PI - zeta - alpha) < BEAM_HALF * 1.2 && Math.abs(zeta - alpha) < BEAM_HALF * 1.2
              ? 'виждаме и двата полюса – по два импулса'
              : 'лъчът помита Земята – виждаме пулсар'
            : 'лъчът никога не ни уцелва – не знаем за него'}
        </text>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
        <button onClick={() => setPlaying(p => !p)} className="px-4 py-1 rounded bg-violet-600 text-white text-sm hover:bg-violet-700">
          {playing ? '⏸ Пауза' : '▶ Завърти'}
        </button>
        <button
          onClick={() => setSound(s => !s)}
          className={`px-4 py-1 rounded text-sm border ${sound ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300' : 'border-gray-300 dark:border-gray-600'}`}
        >
          {sound ? '🔇 Спри звука' : '🔊 Чуй пулсара'}
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {PULSARS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setPi(i)}
            className={`px-2 py-1 rounded text-xs border ${
              i === pi ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Наклон на магнитната ос: α = {alphaDeg}°</label>
          <input type="range" min="0" max="90" value={alphaDeg} onChange={e => setAlphaDeg(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Посока към Земята: ζ = {zetaDeg}° от оста на въртене</label>
          <input type="range" min="0" max="90" value={zetaDeg} onChange={e => setZetaDeg(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {pulsar.text} Виждаме само пулсарите, чиито лъчи помитат Земята – вероятно повечето неутронни звезди в Галактиката са
        невидими за нас.
      </p>
    </div>
  );
}
