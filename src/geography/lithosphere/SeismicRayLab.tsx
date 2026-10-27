import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

const R = 6371;
const RC = 3480; // граница ядро – мантия
const RI = 1220; // вътрешно ядро
const SHELLS = 220;

type Wave = 'P' | 'S';

/**
 * Опростен модел на скоростите (km/s) по дълбочината d (km), близък до модела PREM.
 * В долната мантия скоростта расте по-бавно към дъното – иначе сянката на ядрото излиза твърде близо.
 */
function speed(wave: Wave, d: number, inner: boolean) {
  const lower = (a: number, b: number) => a + Math.sqrt((d - 660) / 2231) * (b - a);
  if (wave === 'P') {
    if (d < 25) return 6.5;
    if (d < 410) return 8 + ((d - 25) / 385) * 0.9;
    if (d < 660) return 9 + ((d - 410) / 250) * 1.75;
    if (d < 2891) return lower(10.75, 13.7);
    if (d < 5151 || !inner) return 8 + ((d - 2891) / 2259) * 2.3;
    return 11 + ((d - 5151) / 1220) * 0.3;
  }
  if (d < 25) return 3.7;
  if (d < 410) return 4.5 + ((d - 25) / 385) * 0.3;
  if (d < 660) return 4.9 + ((d - 410) / 250) * 0.7;
  if (d < 2891) return lower(6.2, 7.3);
  if (d < 5151 || !inner) return 0; // течното външно ядро не пропуска напречни вълни
  return 3.5;
}

type Shell = { ro: number; ri: number; v: number };
const shellsOf = (wave: Wave, inner: boolean): Shell[] =>
  Array.from({ length: SHELLS }, (_, k) => {
    const ro = R - (k * R) / SHELLS;
    const ri = R - ((k + 1) * R) / SHELLS;
    return { ro, ri, v: speed(wave, R - (ro + ri) / 2, inner) };
  });

type Ray = { pts: [number, number][]; dist: number; time: number; minR: number; stopped: boolean };

/**
 * Лъч с начален ъгъл i0 (от отвеса) в сферично-слоест модел. В слой с постоянна скорост лъчът е права,
 * а r·sin i / v = p е едно и също навсякъде (законът на Снел за сфера).
 */
function trace(shells: Shell[], i0: number): Ray {
  const p = (R * Math.sin((i0 * Math.PI) / 180)) / shells[0].v;
  const pts: [number, number][] = [[R, 0]];
  let th = 0;
  let time = 0;
  let minR = R;
  for (const { ro, ri, v } of shells) {
    if (v <= 0) return { pts, dist: th, time, minR: ro, stopped: true };
    const b = p * v;
    if (b >= ro) break; // пълно вътрешно отражение – обръща на границата
    const so = Math.sqrt(ro * ro - b * b);
    if (b > ri) {
      th += Math.acos(b / ro);
      time += so / v;
      pts.push([b, th]);
      minR = b;
      break;
    }
    th += Math.acos(b / ro) - Math.acos(b / ri);
    time += (so - Math.sqrt(ri * ri - b * b)) / v;
    pts.push([ri, th]);
    minR = ri;
  }
  // Пътят нагоре е огледален на пътя надолу
  const down = pts.slice(0, -1).reverse();
  for (const [r, t] of down) pts.push([r, 2 * th - t]);
  return { pts, dist: 2 * th, time: 2 * time, minR, stopped: false };
}

const deg = (r: number) => (r * 180) / Math.PI;

// Чертеж: Земята в кръг, огнището горе
const CX = 190;
const CY = 172;
const RAD = 150;
const K = RAD / R;
const xy = (r: number, t: number, side: 1 | -1) => ({ x: CX + side * r * K * Math.sin(t), y: CY - r * K * Math.cos(t) });
const pathOf = (pts: [number, number][], side: 1 | -1) =>
  pts
    .map(([r, t], i) => {
      const q = xy(r, t, side);
      return `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    })
    .join('');
const arc = (a: number, b: number, side: 1 | -1, rr: number) => {
  const p = xy(rr / K, (a * Math.PI) / 180, side);
  const q = xy(rr / K, (b * Math.PI) / 180, side);
  return `M${p.x.toFixed(1)} ${p.y.toFixed(1)}A${rr} ${rr} 0 0 ${side === 1 ? 1 : 0} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
};

const ANGLES = Array.from({ length: 22 }, (_, k) => 4 + k * 4);

/** Сеизмични лъчи през Земята: пречупване, сянката на ядрото и вълните през вътрешното ядро. */
export default function SeismicRayLab() {
  const [wave, setWave] = useState<Wave>('P');
  const [inner, setInner] = useState(true);
  const [angle, setAngle] = useState(30);

  const shells = useMemo(() => shellsOf(wave, inner), [wave, inner]);
  const rays = useMemo(() => ANGLES.map(a => trace(shells, a)), [shells]);
  const chosen = trace(shells, angle);

  // Граници на сянката от гъсто „обстрелване“ с лъчи
  const shadow = useMemo(() => {
    let mantle = 0;
    let core = 180;
    let innerMin = 180;
    for (let a = 0.2; a < 90; a += 0.2) {
      const ray = trace(shells, a);
      if (ray.stopped) continue;
      const d = deg(ray.dist);
      if (ray.minR >= RC) mantle = Math.max(mantle, d);
      else if (ray.minR >= RI || !inner) core = Math.min(core, d);
      else innerMin = Math.min(innerMin, d);
    }
    return { mantle, core, innerMin };
  }, [shells, inner]);

  const colorOf = (ray: Ray) => (ray.stopped ? 'stroke-violet-500' : ray.minR >= RC ? 'stroke-sky-500' : ray.minR >= RI || !inner ? 'stroke-amber-500' : 'stroke-rose-500');

  // Графиката на скоростите вдясно
  const GX = 420;
  const GW = 200;
  const GY = 22;
  const GH = 300;
  const gx = (v: number) => GX + (v / 14) * GW;
  const gy = (d: number) => GY + (d / R) * GH;
  const curve = (w: Wave) =>
    Array.from({ length: 321 }, (_, k) => (k * R) / 320)
      .map((d, k) => `${k ? 'L' : 'M'}${gx(speed(w, d, inner)).toFixed(1)} ${gy(d).toFixed(1)}`)
      .join('');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 340" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <circle cx={CX} cy={CY} r={RAD} className="fill-amber-50 stroke-gray-500 dark:fill-gray-900" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={RC * K} className="fill-orange-100 stroke-orange-400 dark:fill-orange-950/60" strokeWidth="1" />
        {inner && <circle cx={CX} cy={CY} r={RI * K} className="fill-orange-200 stroke-orange-500 dark:fill-orange-900/60" strokeWidth="1" />}
        {/* Сянката по повърхността */}
        {wave === 'P' ? (
          ([1, -1] as const).map(s => <path key={s} d={arc(shadow.mantle, shadow.core, s, RAD + 4)} fill="none" className="stroke-gray-800 dark:stroke-gray-200" strokeWidth="5" opacity={0.55} />)
        ) : (
          ([1, -1] as const).map(s => <path key={s} d={arc(shadow.mantle, 180, s, RAD + 4)} fill="none" className="stroke-gray-800 dark:stroke-gray-200" strokeWidth="5" opacity={0.55} />)
        )}
        {rays.map((ray, k) =>
          ([1, -1] as const).map(s => <path key={`${k}${s}`} d={pathOf(ray.pts, s)} fill="none" className={colorOf(ray)} strokeWidth="1" opacity={0.75} />),
        )}
        <path d={pathOf(chosen.pts, 1)} fill="none" className="stroke-gray-900 dark:stroke-white" strokeWidth="2.4" />
        {chosen.stopped && (
          <text x={xy(chosen.minR, chosen.dist, 1).x} y={xy(chosen.minR, chosen.dist, 1).y + 4} fontSize="14" fontWeight="bold" textAnchor="middle" className="fill-violet-700 dark:fill-violet-300">
            ✕
          </text>
        )}
        <text x={CX} y={CY - RAD - 6} fontSize="16" textAnchor="middle">
          ★
        </text>
        <text x={CX} y={CY + RAD + 16} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          {wave === 'P' ? `сянка ${fmt(shadow.mantle)}°–${fmt(shadow.core)}°` : `сянка над ${fmt(shadow.mantle)}°`}
        </text>
        <text x={CX} y={CY + 4} fontSize="10" textAnchor="middle" className="fill-orange-800 dark:fill-orange-200">
          {inner ? 'вътрешно ядро' : 'ядро'}
        </text>

        {/* Скорости по дълбочината */}
        <text x={GX + GW / 2} y={12} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          скорост, km/s
        </text>
        {[0, 4, 8, 12].map(v => (
          <g key={v}>
            <line x1={gx(v)} y1={GY} x2={gx(v)} y2={GY + GH} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={gx(v)} y={GY + GH + 12} fontSize="10" textAnchor="middle" className="fill-gray-500">
              {v}
            </text>
          </g>
        ))}
        {[
          [2891, 'ядро'],
          [5151, 'вътрешно ядро'],
          [660, 'долна мантия'],
        ].map(([d, name]) => (
          <g key={name}>
            <line x1={GX} y1={gy(Number(d))} x2={GX + GW} y2={gy(Number(d))} className="stroke-orange-300 dark:stroke-orange-700" strokeDasharray="4 3" />
            <text x={GX + GW} y={gy(Number(d)) - 3} fontSize="10" textAnchor="end" paintOrder="stroke" strokeWidth="3" className="fill-gray-500 stroke-white dark:fill-gray-400 dark:stroke-gray-800">
              {name}
            </text>
          </g>
        ))}
        <path d={curve('P')} fill="none" className="stroke-sky-600" strokeWidth="2" />
        <path d={curve('S')} fill="none" className="stroke-violet-600" strokeWidth="2" />
        <text x={gx(12.8)} y={gy(1800)} fontSize="12" fontWeight="bold" className="fill-sky-700 dark:fill-sky-300">
          P
        </text>
        <text x={gx(7.4)} y={gy(1800)} fontSize="12" fontWeight="bold" className="fill-violet-700 dark:fill-violet-300">
          S
        </text>
        <line x1={GX} y1={GY} x2={GX} y2={GY + GH} className="stroke-gray-500" />
        <text x={GX - 4} y={GY + 4} fontSize="10" textAnchor="end" className="fill-gray-500">
          0
        </text>
        <text x={GX - 4} y={GY + GH} fontSize="10" textAnchor="end" className="fill-gray-500">
          6371 km
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Синьо – лъчи, които се обръщат в мантията; жълто – през външното ядро; червено – през вътрешното ядро; лилаво – S, спрени от течното ядро.
      </p>
      <Buttons>
        {(['P', 'S'] as Wave[]).map(w => (
          <DiagramButton key={w} active={wave === w} onClick={() => setWave(w)}>
            {w === 'P' ? 'P вълни (надлъжни)' : 'S вълни (напречни)'}
          </DiagramButton>
        ))}
        <DiagramButton active={inner} onClick={() => setInner(!inner)}>
          Вътрешно ядро
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="ъгъл, °" value={angle} onChange={setAngle} min={2} max={88} step={1} tone="gray" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={
            chosen.stopped
              ? [{ label: 'избраният лъч', value: `спира на ядрото, ${fmt(R - chosen.minR)} km дълбочина`, tone: 'violet' }]
              : [
                  { label: 'стига на', value: `${fmt(deg(chosen.dist))}° от огнището` },
                  { label: 'време', value: `${fmt(chosen.time / 60, 1)} min` },
                  { label: 'най-дълбоко', value: `${fmt(R - chosen.minR)} km`, tone: 'rose' },
                ]
          }
        />
      </div>
    </div>
  );
}
