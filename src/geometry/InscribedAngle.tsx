import { useState } from 'react';

const CX = 200;
const CY = 165;
const R = 120;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;
const norm = (deg: number) => ((deg % 360) + 360) % 360;

// Точка от окръжността при ъгъл φ (в градуси, обратно на часовниковата стрелка)
const onCircle = (deg: number) => ({
  x: CX + R * Math.cos(toRad(deg)),
  y: CY - R * Math.sin(toRad(deg)),
});

// Малка дъга, отбелязваща ъгъл с връх V от посока from до посока to (обратно на часовниковата стрелка)
function angleMark(vx: number, vy: number, from: number, to: number, rho: number) {
  const span = norm(to - from);
  const x1 = vx + rho * Math.cos(toRad(from));
  const y1 = vy - rho * Math.sin(toRad(from));
  const x2 = vx + rho * Math.cos(toRad(to));
  const y2 = vy - rho * Math.sin(toRad(to));
  return `M ${x1} ${y1} A ${rho} ${rho} 0 ${span > 180 ? 1 : 0} 0 ${x2} ${y2}`;
}

const direction = (from: { x: number; y: number }, to: { x: number; y: number }) =>
  norm(toDeg(Math.atan2(from.y - to.y, to.x - from.x)));

export function InscribedAngle() {
  const [theta, setTheta] = useState(100);
  const [t, setT] = useState(0.5);

  // Дъгата AB (без точката P) е центрирана в долната част на окръжността
  const aDeg = -90 - theta / 2;
  const bDeg = -90 + theta / 2;
  const pDeg = bDeg + t * (360 - theta);

  const A = onCircle(aDeg);
  const B = onCircle(bDeg);
  const P = onCircle(pDeg);

  let dirA = direction(P, A);
  let dirB = direction(P, B);
  if (norm(dirB - dirA) > 180) [dirA, dirB] = [dirB, dirA];
  const inscribed = norm(dirB - dirA);

  const label = (pt: { x: number; y: number }, text: string) => {
    const dx = pt.x - CX;
    const dy = pt.y - CY;
    const len = Math.hypot(dx, dy) || 1;
    return (
      <text
        x={pt.x + (dx / len) * 18}
        y={pt.y + (dy / len) * 18 + 5}
        textAnchor="middle"
        className="fill-current font-bold"
        fontSize="16"
      >
        {text}
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
      <svg viewBox="0 0 400 330" className="w-full h-auto max-w-md mx-auto text-gray-700 dark:text-gray-300">
        <circle cx={CX} cy={CY} r={R} className="fill-blue-500/10 stroke-blue-500" strokeWidth="2" />

        {/* Дъгата AB, която „вижда“ ъгъла */}
        <path
          d={`M ${A.x} ${A.y} A ${R} ${R} 0 ${theta > 180 ? 1 : 0} 0 ${B.x} ${B.y}`}
          className="fill-none stroke-purple-500"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Централен ъгъл */}
        <line x1={CX} y1={CY} x2={A.x} y2={A.y} className="stroke-blue-500" strokeWidth="2" />
        <line x1={CX} y1={CY} x2={B.x} y2={B.y} className="stroke-blue-500" strokeWidth="2" />
        <path d={angleMark(CX, CY, norm(aDeg), norm(bDeg), 24)} className="fill-none stroke-blue-500" strokeWidth="2" />

        {/* Вписан ъгъл */}
        <line x1={P.x} y1={P.y} x2={A.x} y2={A.y} className="stroke-orange-500" strokeWidth="2" />
        <line x1={P.x} y1={P.y} x2={B.x} y2={B.y} className="stroke-orange-500" strokeWidth="2" />
        <path d={angleMark(P.x, P.y, dirA, dirB, 28)} className="fill-none stroke-orange-500" strokeWidth="2" />

        <circle cx={CX} cy={CY} r="4" className="fill-current" />
        <text x={CX + 8} y={CY - 8} className="fill-current font-bold" fontSize="16">O</text>
        {[A, B].map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="5" className="fill-purple-500" />
        ))}
        <circle cx={P.x} cy={P.y} r="6" className="fill-orange-500" />
        {label(A, 'A')}
        {label(B, 'B')}
        {label(P, 'P')}
      </svg>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <label className="text-sm font-semibold">
          Дъга AB: {theta}°
          <input
            type="range"
            min="20"
            max="340"
            value={theta}
            onChange={e => setTheta(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-sm font-semibold">
          Положение на точката P
          <input
            type="range"
            min="0.05"
            max="0.95"
            step="0.01"
            value={t}
            onChange={e => setT(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-4 font-mono text-sm sm:text-base">
        <span className="text-blue-600 dark:text-blue-400">централен ∠AOB = {theta}°</span>
        <span className="text-orange-600 dark:text-orange-400">вписан ∠APB = {inscribed.toFixed(0)}°</span>
      </div>
      <div className="flex justify-center mt-3">
        <button
          onClick={() => setTheta(180)}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition"
        >
          AB е диаметър (180°)
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
        💡 Мести точката P – вписаният ъгъл не се променя. Той винаги е половината от централния.
      </p>
    </div>
  );
}
