import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 300;
const TOP = 70;
const BOT = 230;
const HPX = BOT - TOP; // разстояние между огледалата
const RX = 80; // часовникът в покой
const MX0 = 200; // начало на движещия се часовник
const MX1 = 610;

function Mirrors({ x, opacity = 1 }: { x: number; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <rect x={x - 26} y={TOP - 6} width={52} height={6} rx={2} fill="#cbd5e1" />
      <rect x={x - 26} y={BOT} width={52} height={6} rx={2} fill="#cbd5e1" />
      <line x1={x - 22} x2={x - 22} y1={TOP} y2={BOT} stroke="#cbd5e1" strokeOpacity="0.15" />
      <line x1={x + 22} x2={x + 22} y1={TOP} y2={BOT} stroke="#cbd5e1" strokeOpacity="0.15" />
    </g>
  );
}

export default function LightClockLab() {
  const [beta, setBeta] = useState(0.6);
  const [t, setT] = useState(0.5);
  const [playing, setPlaying] = useState(false);
  useAnimationFrame(playing, dt => setT(v => v + dt * 0.8));
  const gamma = 1 / Math.sqrt(1 - beta * beta);

  // Времето t е в единици h/c. Тик (нагоре и надолу) в покой = 2.
  const zig = (u: number) => {
    const p = u % 2;
    return p < 1 ? p : 2 - p; // 0 → долу, 1 → горе
  };
  const restY = BOT - zig(t) * HPX;
  const span = MX1 - MX0 - 60;
  const travel = beta * HPX * t; // px, изминати хоризонтално
  const pass = Math.floor(travel / span);
  const mx = MX0 + 30 + (travel % span);
  const tPass = (pass * span) / (beta * HPX || 1); // кога е започнал този „проход“
  const movY = BOT - zig(t / gamma) * HPX;
  // Следа на фотона в движещия се часовник от началото на прохода
  const trail: string[] = [];
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const tt = tPass + ((t - tPass) * i) / steps;
    trail.push(`${MX0 + 30 + beta * HPX * (tt - tPass)},${BOT - zig(tt / gamma) * HPX}`);
  }
  const restTicks = Math.floor(t / 2);
  const movTicks = Math.floor(t / (2 * gamma));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-emerald-300 dark:border-emerald-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Светлинният часовник</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Фотон подскача между две огледала – всяко „отиване и връщане“ е един тик. Гледан от Земята, часовникът в летящата ракета прави
        фотона да изминава по-дълъг, диагонален път. А скоростта на светлината е една и съща…
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <text x={RX} y={34} fontSize="11" textAnchor="middle" fill="white" fontWeight="700">
          на Земята
        </text>
        <Mirrors x={RX} />
        <line x1={RX} x2={RX} y1={TOP} y2={BOT} stroke="#fbbf24" strokeOpacity="0.25" strokeDasharray="3 3" />
        <circle cx={RX} cy={restY} r={6} fill="#fde68a" />
        <circle cx={RX} cy={restY} r={12} fill="#fde68a" fillOpacity="0.2" />
        <text x={RX} y={BOT + 30} fontSize="12" textAnchor="middle" fill="#fde68a" fontWeight="700">
          {restTicks} тика
        </text>

        <text x={(MX0 + MX1) / 2} y={34} fontSize="11" textAnchor="middle" fill="white" fontWeight="700">
          в ракетата, летяща с {fmt(beta, 2)}c (гледано от Земята)
        </text>
        <line x1={MX0} x2={MX1} y1={BOT + 14} y2={BOT + 14} stroke="white" strokeOpacity="0.15" />
        <polyline points={trail.join(' ')} fill="none" stroke="#fbbf24" strokeOpacity="0.55" strokeWidth="1.5" />
        <Mirrors x={mx} />
        <circle cx={mx} cy={movY} r={6} fill="#fde68a" />
        <circle cx={mx} cy={movY} r={12} fill="#fde68a" fillOpacity="0.2" />
        <text x={(MX0 + MX1) / 2} y={BOT + 30} fontSize="12" textAnchor="middle" fill="#86efac" fontWeight="700">
          {movTicks} тика
        </text>
        <text x={(MX0 + MX1) / 2} y={BOT + 50} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.65">
          γ = 1 / √(1 − v²/c²) = {fmt(gamma, 3)} · един тик в ракетата трае {fmt(gamma, 2)} тика на Земята
        </text>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">
        Скорост: v = {fmt(beta, 2)}c ({fmt(beta * 299792, 0)} km/s) · γ = {fmt(gamma, 3)}
      </label>
      <input type="range" min="0" max="0.98" step="0.01" value={beta} onChange={e => setBeta(Number(e.target.value))} className="w-full" />
      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <button onClick={() => setPlaying(v => !v)} className="px-4 py-1 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <button onClick={() => setT(0)} className="px-3 py-1 rounded text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
          ↺ Нулирай
        </button>
        {[0.1, 0.6, 0.8, 0.95].map(b => (
          <button key={b} onClick={() => setBeta(b)} className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            {fmt(b, 2)}c
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        За половин тик фотонът в ракетата изминава хипотенузата: (c·Δt/2)² = h² + (v·Δt/2)², откъдето Δt = γ · 2h/c = γΔt₀. Всички
        процеси в ракетата – часовници, сърцето на космонавта, разпадът на частици – вървят точно толкова по-бавно. А за космонавта
        всичко е нормално: за него бавно вървят часовниците на Земята!
      </p>
    </div>
  );
}
