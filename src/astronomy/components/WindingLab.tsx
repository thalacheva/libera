import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 320;
const R_PX = 9; // px на kpc
const PANELS = [
  { cx: 160, label: 'Ръкави от едни и същи звезди' },
  { cx: 480, label: 'Ръкави като вълна на плътността' },
];
const CY = 160;
const V = 220; // km/s – плоска крива на въртене
const KMS_TO_RAD_PER_MYR_PER_KPC = 1.023e-3;
const OMEGA_P = 25 * KMS_TO_RAD_PER_MYR_PER_KPC; // скорост на шарката, rad/млн. г.
const K = Math.tan((15 * Math.PI) / 180);
const R_MIN = 2;
const R_MAX = 15;

function rnd(n: number) {
  const x = Math.sin(n * 93.989 + 7.233) * 43758.5453;
  return x - Math.floor(x);
}

// Звездите, които в началото са по двата ръкава
const ARM_STARS = Array.from({ length: 360 }, (_, i) => {
  const r = R_MIN + (R_MAX - R_MIN) * rnd(i);
  const arm = i % 2;
  return { r, th0: Math.log(r / R_MIN) / K + arm * Math.PI + (rnd(i + 900) - 0.5) * 0.15 };
});
// Равномерно разпределени звезди за модела с вълна
const DISK_STARS = Array.from({ length: 700 }, (_, i) => ({ r: R_MIN + (R_MAX - R_MIN) * Math.sqrt(rnd(i + 3000)), th0: rnd(i + 5000) * 2 * Math.PI }));

const omega = (r: number) => (V * KMS_TO_RAD_PER_MYR_PER_KPC) / r; // rad/млн. г.

export default function WindingLab() {
  const [t, setT] = useState(0); // млн. години
  const [playing, setPlaying] = useState(false);

  useAnimationFrame(playing, dt => setT(v => v + dt * 100));

  const armAngle = (r: number, arm: number) => Math.log(r / R_MIN) / K + arm * Math.PI + OMEGA_P * t;
  const wrap = (a: number) => {
    let x = a % (2 * Math.PI);
    if (x > Math.PI) x -= 2 * Math.PI;
    if (x < -Math.PI) x += 2 * Math.PI;
    return x;
  };

  const pattern = (cx: number) =>
    [0, 1].map(arm =>
      Array.from({ length: 80 }, (_, i) => {
        const r = R_MIN + (i / 79) * (R_MAX - R_MIN);
        const a = armAngle(r, arm);
        return `${cx + r * R_PX * Math.cos(a)},${CY - r * R_PX * Math.sin(a)}`;
      }).join(' ')
    );

  const turns = (omega(8.2) * t) / (2 * Math.PI);
  const windings = (t * (omega(R_MIN) - omega(R_MAX))) / (2 * Math.PI);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-sky-300 dark:border-sky-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Защо спиралните ръкави не се навиват</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Вътрешните части на галактиката обикалят за по-кратко време от външните. Пуснете времето (1 s = 100 млн. години): ако ръкавите
        бяха изградени все от едни и същи звезди, те бързо биха се навили като часовникова пружина.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {PANELS.map((p, pi) => (
          <g key={pi}>
            <circle cx={p.cx} cy={CY} r={R_MAX * R_PX + 4} fill="#0f172a" />
            <circle cx={p.cx} cy={CY} r={R_MIN * R_PX} fill="#fde68a" fillOpacity="0.5" />
            <text x={p.cx} y={18} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.8">
              {p.label}
            </text>
          </g>
        ))}

        {/* Материални ръкави */}
        {ARM_STARS.map((s, i) => {
          const a = s.th0 + omega(s.r) * t;
          return <circle key={i} cx={PANELS[0].cx + s.r * R_PX * Math.cos(a)} cy={CY - s.r * R_PX * Math.sin(a)} r="1.5" fill="#93c5fd" />;
        })}

        {/* Вълна на плътността: шарката се върти бавно и твърдо, звездите минават през нея */}
        {pattern(PANELS[1].cx).map((pts, i) => (
          <polyline key={i} points={pts} fill="none" stroke="#93c5fd" strokeOpacity="0.12" strokeWidth="14" />
        ))}
        {DISK_STARS.map((s, i) => {
          const a = s.th0 + omega(s.r) * t;
          const d = Math.min(Math.abs(wrap(a - armAngle(s.r, 0))), Math.abs(wrap(a - armAngle(s.r, 1))));
          const inArm = Math.exp(-(((d * s.r) / 0.9) ** 2));
          return (
            <circle
              key={i}
              cx={PANELS[1].cx + s.r * R_PX * Math.cos(a)}
              cy={CY - s.r * R_PX * Math.sin(a)}
              r={0.9 + 1.2 * inArm}
              fill={inArm > 0.5 ? '#bfdbfe' : '#fde68a'}
              fillOpacity={0.25 + 0.75 * inArm}
            />
          );
        })}

        <text x={12} y={H - 10} fontSize="11" fill="white">
          t = {fmt(t / 1000, 2)} млрд. години · Слънцето е направило {fmt(turns, 1)} обиколки
        </text>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
        <button onClick={() => setPlaying(v => !v)} className="px-4 py-1 rounded bg-sky-600 text-white text-sm hover:bg-sky-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <button onClick={() => setT(0)} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          ↺ Отначало
        </button>
      </div>
      <input type="range" min="0" max="3000" step="10" value={t} onChange={e => setT(Number(e.target.value))} className="w-full mt-3" />
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {t < 50
          ? 'В началото двете галактики изглеждат еднакво.'
          : `Вляво ръкавите вече са се навили ~${fmt(windings, 1)} пъти повече във вътрешността, отколкото навън – след няколко обиколки биха станали неразличими. Вдясно шарката на ръкавите се върти бавно и равномерно като едно цяло (25 km/s на kpc), а звездите минават през нея – като коли през задръстване. Задръстването стои на място, макар колите в него непрекъснато да се сменят. В сгъстяването газът се свива и раждат нови горещи сини звезди, които осветяват ръкава.`}
      </p>
    </div>
  );
}
