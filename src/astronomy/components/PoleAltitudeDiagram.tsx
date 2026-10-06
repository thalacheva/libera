import { useState } from 'react';
import { DEG } from './skyMath';

const OX = 170;
const OY = 190;
const EARTH_R = 95;
const RAY = 110;

/** Чертеж: защо височината на полюса е равна на географската ширина. */
export default function PoleAltitudeDiagram() {
  const [latitude, setLatitude] = useState(43);
  const phi = latitude * DEG;

  // Наблюдател на повърхността, отвесът сочи радиално навън
  const up = { x: Math.cos(phi), y: -Math.sin(phi) };
  const north = { x: -Math.sin(phi), y: -Math.cos(phi) };
  const ox = OX + EARTH_R * up.x;
  const oy = OY + EARTH_R * up.y;

  const arc = (from: number, to: number, r: number) => {
    const a = { x: ox + r * Math.cos(from), y: oy + r * Math.sin(from) };
    const b = { x: ox + r * Math.cos(to), y: oy + r * Math.sin(to) };
    return `M ${a.x},${a.y} A ${r},${r} 0 0,1 ${b.x},${b.y}`;
  };
  // Екранни ъгли (ос y надолу)
  const angNorth = Math.atan2(north.y, north.x);
  const angPole = -Math.PI / 2;
  const angZenith = Math.atan2(up.y, up.x);
  const mid = (a: number, b: number, r: number) => ({
    x: ox + r * Math.cos((a + b) / 2),
    y: oy + r * Math.sin((a + b) / 2),
  });
  const phiLabel = mid(angNorth, angPole, 50);
  const coLabel = mid(angPole, angZenith, 44);
  const centreLabel = {
    x: OX + 34 * Math.cos(-phi / 2),
    y: OY + 34 * Math.sin(-phi / 2),
  };

  return (
    <div>
      <svg viewBox="0 0 440 320" className="w-full h-auto max-h-80">
        <defs>
          <marker
            id="pole-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 z" fill="rgb(239, 68, 68)" />
          </marker>
        </defs>

        {/* Земята */}
        <circle
          cx={OX}
          cy={OY}
          r={EARTH_R}
          fill="rgba(59, 130, 246, 0.15)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
        />
        <line
          x1={OX}
          y1={OY + EARTH_R + 20}
          x2={OX}
          y2={OY - EARTH_R - 30}
          stroke="rgb(100, 116, 139)"
          strokeDasharray="6,4"
        />
        <text
          x={OX - 30}
          y={OY - EARTH_R - 18}
          fontSize="12"
          className="fill-gray-600 dark:fill-gray-300"
        >
          ос
        </text>
        <line
          x1={OX - EARTH_R}
          y1={OY}
          x2={OX + EARTH_R}
          y2={OY}
          stroke="rgb(168, 85, 247)"
          strokeDasharray="4,3"
        />
        <text
          x={OX - EARTH_R + 4}
          y={OY + 16}
          fontSize="11"
          fill="rgb(168, 85, 247)"
        >
          екватор
        </text>

        {/* Радиус до наблюдателя и ъгъл φ в центъра */}
        <line
          x1={OX}
          y1={OY}
          x2={ox}
          y2={oy}
          stroke="rgb(59, 130, 246)"
          strokeWidth="1.5"
        />
        {latitude > 0 && (
          <>
            <path
              d={`M ${OX + 26},${OY} A 26,26 0 0,0 ${OX + 26 * Math.cos(phi)},${OY - 26 * Math.sin(phi)}`}
              fill="none"
              stroke="rgb(239, 68, 68)"
              strokeWidth="2"
            />
            <text
              x={centreLabel.x + 8}
              y={centreLabel.y + 4}
              fontSize="13"
              fontWeight="bold"
              fill="rgb(239, 68, 68)"
            >
              φ
            </text>
          </>
        )}

        {/* Хоризонт (допирателна) */}
        <line
          x1={ox - 90 * north.x}
          y1={oy - 90 * north.y}
          x2={ox + 90 * north.x}
          y2={oy + 90 * north.y}
          stroke="rgb(34, 197, 94)"
          strokeWidth="2.5"
        />
        <text
          x={ox + 92 * north.x - 16}
          y={oy + 92 * north.y + 14}
          fontSize="12"
          fontWeight="bold"
          fill="rgb(34, 197, 94)"
        >
          С
        </text>

        {/* Отвес към зенита */}
        <line
          x1={ox}
          y1={oy}
          x2={ox + RAY * up.x}
          y2={oy + RAY * up.y}
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
        />
        <text
          x={ox + (RAY + 8) * up.x}
          y={oy + (RAY + 8) * up.y}
          fontSize="13"
          fontWeight="bold"
          fill="rgb(59, 130, 246)"
        >
          Z
        </text>

        {/* Посока към Полярната звезда – успоредна на оста */}
        <line
          x1={ox}
          y1={oy}
          x2={ox}
          y2={oy - RAY}
          stroke="rgb(239, 68, 68)"
          strokeWidth="2"
          markerEnd="url(#pole-arrow)"
        />
        <line
          x1={OX}
          y1={OY - EARTH_R - 30}
          x2={OX}
          y2={OY - EARTH_R - 60}
          stroke="rgb(239, 68, 68)"
          strokeWidth="2"
          markerEnd="url(#pole-arrow)"
        />
        <text
          x={ox + 6}
          y={oy - RAY + 4}
          fontSize="12"
          fontWeight="bold"
          fill="rgb(239, 68, 68)"
        >
          към Полярната звезда
        </text>

        {/* Ъглите при наблюдателя */}
        {latitude > 0 && (
          <>
            <path
              d={arc(angNorth, angPole, 36)}
              fill="none"
              stroke="rgb(239, 68, 68)"
              strokeWidth="2"
            />
            <text
              x={phiLabel.x - 6}
              y={phiLabel.y + 4}
              fontSize="13"
              fontWeight="bold"
              fill="rgb(239, 68, 68)"
            >
              h
            </text>
          </>
        )}
        {latitude < 90 && (
          <>
            <path
              d={arc(angPole, angZenith, 28)}
              fill="none"
              stroke="rgb(100, 116, 139)"
              strokeWidth="1.5"
            />
            <text
              x={coLabel.x - 4}
              y={coLabel.y + 4}
              fontSize="11"
              className="fill-gray-600 dark:fill-gray-300"
            >
              90°−φ
            </text>
          </>
        )}

        <circle
          cx={ox}
          cy={oy}
          r="5"
          fill="rgb(234, 179, 8)"
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      <label className="block text-sm font-semibold mt-2">
        Географска ширина на наблюдателя: φ = {latitude}° → височина на полюса h
        = {latitude}°
      </label>
      <input
        type="range"
        min="0"
        max="90"
        value={latitude}
        onChange={e => setLatitude(Number(e.target.value))}
        className="w-full"
      />
      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
        Звездите са толкова далеч, че лъчите от Полярната звезда са успоредни на
        земната ос. Хоризонтът е перпендикулярен на радиуса, а оста – на
        екватора. Ъгли с взаимно перпендикулярни рамене са равни, затова{' '}
        <strong>h = φ</strong>.
      </p>
    </div>
  );
}
